package com.mabini.sacode.service;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mabini.sacode.dto.TriageRequest;
import com.mabini.sacode.dto.TriageResponse;

/**
 * AI triage — reads a damage report (photo included) and decides the issue, the
 * trade needed and the urgency. Replaces the manual "assign a staff member" step.
 *
 * <p>Two interchangeable brains, chosen with {@code app.triage.provider}:
 * <ul>
 *   <li>{@code gemini} (default) — hosted Gemini Flash over the free AI Studio key.
 *       Nothing to download.</li>
 *   <li>{@code ollama} — a local model such as {@code gemma4:e2b}, for offline demos.</li>
 * </ul>
 *
 * <p>The rules the model must follow live in {@code resources/triage-rules.txt}, so
 * the policy can be edited without touching Java. Both providers are asked for
 * schema-constrained JSON, so the reply maps straight onto {@link TriageResponse}.
 */
@Service
public class TriageService {

    private static final List<String> SKILLS = List.of(
            "IT / Computers",
            "Electrical",
            "Plumbing",
            "Air Conditioning",
            "General Repair");

    private static final List<String> PRIORITIES = List.of("Critical", "High", "Medium", "Low");

    private final RestClient http;
    private final ObjectMapper json;
    private final String rules;

    private final String provider;
    private final String geminiBaseUrl;
    private final String geminiModel;
    private final String geminiKey;
    private final String ollamaUrl;
    private final String ollamaModel;
    /** Longest side the photo is downscaled to before it is sent to a model. */
    private final int maxImageEdge;

    public TriageService(RestClient.Builder builder,
                         ObjectMapper json,
                         @Value("classpath:triage-rules.txt") Resource rulesResource,
                         @Value("${app.triage.provider}") String provider,
                         @Value("${app.triage.gemini.base-url}") String geminiBaseUrl,
                         @Value("${app.triage.gemini.model}") String geminiModel,
                         @Value("${app.triage.gemini.api-key:}") String geminiKey,
                         @Value("${app.triage.ollama-url}") String ollamaUrl,
                         @Value("${app.triage.model}") String ollamaModel,
                         @Value("${app.triage.connect-timeout-ms}") int connectTimeoutMs,
                         @Value("${app.triage.read-timeout-ms}") int readTimeoutMs,
                         @Value("${app.triage.max-image-edge:1024}") int maxImageEdge) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);

        this.http = builder.requestFactory(factory).build();
        this.json = json;
        this.provider = provider == null ? "gemini" : provider.trim().toLowerCase(Locale.ROOT);
        this.geminiBaseUrl = trimSlash(geminiBaseUrl);
        this.geminiModel = geminiModel;
        this.geminiKey = geminiKey;
        this.ollamaUrl = trimSlash(ollamaUrl);
        this.ollamaModel = ollamaModel;
        this.maxImageEdge = Math.max(320, maxImageEdge);
        this.rules = readRules(rulesResource);
    }

    /** Which provider answered, for the footer in the admin UI. */
    public String activeModel() {
        return useGemini() ? geminiModel : ollamaModel;
    }

    public TriageResponse triage(TriageRequest request) {
        if (request == null || request.report() == null || isBlank(request.report().equipment())) {
            throw new IllegalArgumentException("A report with an equipment name is required");
        }

        String answer = useGemini() ? askGemini(request) : askOllama(request);
        return parseAnswer(answer, request.report().equipment());
    }

    private boolean useGemini() {
        return !"ollama".equals(provider);
    }

    /* --------------------------- Gemini (hosted) -------------------------- */

    private String askGemini(TriageRequest request) {
        if (isBlank(geminiKey)) {
            throw new TriageUnavailableException(
                    "GEMINI_API_KEY is not set. Create a free key in Google AI Studio and put it in backend/.env.");
        }

        String url = geminiBaseUrl + "/models/" + geminiModel + ":generateContent?key="
                + URLEncoder.encode(geminiKey, StandardCharsets.UTF_8);

        TriageRequest.ReportInfo report = request.report();
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", userPrompt(report)));
        PreparedImage image = prepareImage(request.photo());
        if (image != null) {
            parts.add(Map.of("inline_data", Map.of(
                    "mime_type", image.mimeType(),
                    "data", image.base64())));
        }

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("temperature", 0);
        // The answer is six short fields; capping output keeps thinking/output tokens low.
        generationConfig.put("maxOutputTokens", 220);
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("responseSchema", answerSchema());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("system_instruction", Map.of("parts", List.of(Map.of("text", rules))));
        payload.put("contents", List.of(Map.of("role", "user", "parts", parts)));
        payload.put("generationConfig", generationConfig);

        String body = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                body = http.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .body(String.class);
                break;
            } catch (ResourceAccessException ex) {
                throw new TriageUnavailableException(
                        "Could not reach the Gemini API. Check the internet connection on the server.");
            } catch (RestClientResponseException ex) {
                // Free tier rejects bursts with 429; one short retry clears most of them.
                if (ex.getStatusCode().value() == 429 && attempt == 1) {
                    sleep(1500);
                    continue;
                }
                throw new TriageUnavailableException(
                        "Gemini API answered " + ex.getStatusCode().value() + ": " + apiError(ex.getResponseBodyAsString()));
            }
        }

        try {
            JsonNode root = json.readTree(body == null ? "{}" : body);
            JsonNode blocked = root.path("promptFeedback").path("blockReason");
            if (!blocked.isMissingNode() && !blocked.asText("").isBlank()) {
                throw new TriageUnavailableException(
                        "The model refused this report (" + blocked.asText() + ").");
            }

            StringBuilder text = new StringBuilder();
            for (JsonNode part : root.path("candidates").path(0).path("content").path("parts")) {
                // Gemini 3 models may return thought parts; only the answer counts.
                if (part.path("thought").asBoolean(false)) {
                    continue;
                }
                text.append(part.path("text").asText(""));
            }
            return requireContent(text.toString());
        } catch (TriageUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new TriageUnavailableException("The Gemini answer was not readable");
        }
    }

    /* ---------------------------- Ollama (local) -------------------------- */

    private String askOllama(TriageRequest request) {
        TriageRequest.ReportInfo report = request.report();

        Map<String, Object> userMessage = new LinkedHashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", userPrompt(report));
        PreparedImage image = prepareImage(request.photo());
        if (image != null) {
            userMessage.put("images", List.of(image.base64()));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", ollamaModel);
        payload.put("stream", false);
        payload.put("think", false);
        payload.put("format", answerSchema());
        payload.put("options", Map.of("temperature", 0, "num_predict", 220, "num_ctx", 8192));
        payload.put("messages", List.of(
                Map.of("role", "system", "content", rules),
                userMessage));

        String body;
        try {
            body = http.post()
                    .uri(ollamaUrl + "/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);
        } catch (ResourceAccessException ex) {
            throw new TriageUnavailableException(
                    "Ollama is not reachable at " + ollamaUrl + " — is it running and is the model pulled?");
        } catch (RestClientResponseException ex) {
            throw new TriageUnavailableException(
                    "Ollama answered HTTP " + ex.getStatusCode().value() + " for model " + ollamaModel);
        }

        try {
            JsonNode root = json.readTree(body == null ? "{}" : body);
            return requireContent(root.path("message").path("content").asText(""));
        } catch (TriageUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new TriageUnavailableException("The Ollama answer was not readable");
        }
    }

    /* ------------------------------ Requests ------------------------------ */

    private String userPrompt(TriageRequest.ReportInfo report) {
        StringBuilder text = new StringBuilder("Damage report\n");
        text.append("equipment: ").append(orDash(report.equipment())).append('\n');
        text.append("category: ").append(orDash(report.category())).append('\n');
        text.append("location: ").append(orDash(report.location())).append('\n');
        text.append("reported by: ").append(orDash(report.reportedBy())).append('\n');
        text.append("description: ").append(
                isBlank(report.description()) ? "(none given)" : report.description()).append('\n');
        text.append("\nApply the rules and answer with the JSON object only.");
        return text.toString();
    }

    /** Schema both providers are constrained to. */
    private Map<String, Object> answerSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("issue", Map.of("type", "string"));
        properties.put("skill", Map.of("type", "string", "enum", SKILLS));
        properties.put("priority", Map.of("type", "string", "enum", PRIORITIES));
        properties.put("confidence", Map.of("type", "number", "minimum", 0, "maximum", 1));
        properties.put("signals", Map.of(
                "type", "array",
                "items", Map.of("type", "string"),
                "maxItems", 4));
        properties.put("summary", Map.of("type", "string"));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", List.of("issue", "skill", "priority", "confidence", "signals", "summary"));
        return schema;
    }

    /* ------------------------------ Response ------------------------------ */

    private TriageResponse parseAnswer(String content, String equipment) {
        JsonNode answer;
        try {
            answer = json.readTree(stripCodeFence(requireContent(content)));
        } catch (TriageUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new TriageUnavailableException("The model answer was not valid JSON");
        }
        if (answer == null || !answer.isObject()) {
            throw new TriageUnavailableException("The model answer was not a JSON object");
        }

        String issue = trimTo(answer.path("issue").asText(""), 120);
        if (isBlank(issue)) {
            issue = equipment + " fault";
        }

        List<String> signals = new ArrayList<>();
        answer.path("signals").forEach(node -> {
            String signal = trimTo(node.asText(""), 60);
            if (!isBlank(signal) && signals.size() < 4 && !signals.contains(signal)) {
                signals.add(signal);
            }
        });

        String skill = normaliseSkill(answer.path("skill").asText(""));
        String priority = normalisePriority(answer.path("priority").asText(""));
        double confidence = normaliseConfidence(answer.path("confidence").asDouble(0.7));

        String summary = trimTo(answer.path("summary").asText(""), 240);
        if (isBlank(summary)) {
            summary = equipment + " — " + issue.toLowerCase(Locale.ROOT) + ". Needs " + skill + " work.";
        }

        return TriageResponse.of(issue, skill, priority, confidence, signals, summary, activeModel());
    }

    /** Accepts "IT / Computers", "information technology", "aircon", … */
    private String normaliseSkill(String raw) {
        String value = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        for (String skill : SKILLS) {
            if (skill.equalsIgnoreCase(value)) {
                return skill;
            }
        }
        if (value.contains("computer") || value.contains("information tech")
                || value.startsWith("it ") || value.endsWith(" it") || value.equals("it")
                || value.contains("electronic data")) {
            return "IT / Computers";
        }
        if (value.contains("electric")) {
            return "Electrical";
        }
        if (value.contains("plumb")) {
            return "Plumbing";
        }
        if (value.contains("air") || value.contains("hvac") || value.contains("cooling")) {
            return "Air Conditioning";
        }
        return "General Repair";
    }

    private String normalisePriority(String raw) {
        String value = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        for (String priority : PRIORITIES) {
            if (priority.equalsIgnoreCase(value)) {
                return priority;
            }
        }
        if (value.contains("crit") || value.contains("urgent") || value.contains("emergency")) {
            return "Critical";
        }
        if (value.contains("high")) {
            return "High";
        }
        if (value.contains("low") || value.contains("minor") || value.contains("cosmetic")) {
            return "Low";
        }
        return "Medium";
    }

    /** The prompt asks for 0–1, but some models still answer on a 0–100 scale. */
    private double normaliseConfidence(double raw) {
        double value = raw > 1 ? raw / 100 : raw;
        if (value <= 0) {
            value = 0.6;
        }
        return Math.round(Math.min(0.97, Math.max(0.35, value)) * 100) / 100.0;
    }

    /* ------------------------------- helpers ------------------------------ */

    private static String readRules(Resource resource) {
        try {
            return resource.getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("triage-rules.txt could not be read", ex);
        }
    }

    private static String requireContent(String content) {
        if (isBlank(content)) {
            throw new TriageUnavailableException("The model returned no content for this report");
        }
        return content.trim();
    }

    /** Pulls the human-readable message out of a provider error body. */
    private String apiError(String body) {
        try {
            JsonNode root = json.readTree(body == null ? "{}" : body);
            String message = root.path("error").path("message").asText("");
            if (!message.isBlank()) {
                return trimTo(message, 200);
            }
        } catch (Exception ignored) {
            // fall through to the raw body
        }
        return trimTo(body == null ? "" : body, 200);
    }

    private static String mimeType(String photo) {
        if (photo != null && photo.startsWith("data:")) {
            int semi = photo.indexOf(';');
            int comma = photo.indexOf(',');
            if (semi > 5 && comma > semi) {
                return photo.substring(5, semi);
            }
        }
        return "image/jpeg";
    }

    /** A photo ready to send: downscaled once, then used by either provider. */
    private record PreparedImage(String base64, String mimeType) {
    }

    /**
     * Downscale the report photo before it reaches a model.
     *
     * <p>Phone photos are 3000–4000 px wide and vision models bill tokens by
     * resolution, so shrinking the long edge to {@code maxImageEdge} removes most
     * of the image tokens while keeping the damage readable. Photos already small
     * enough — or in a format ImageIO cannot decode — pass through untouched.
     */
    private PreparedImage prepareImage(String photo) {
        String raw = base64PhotoData(photo);
        if (raw == null) {
            return null;
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(raw);
        } catch (IllegalArgumentException ex) {
            return new PreparedImage(raw, mimeType(photo));
        }

        BufferedImage source;
        try {
            source = ImageIO.read(new ByteArrayInputStream(bytes));
        } catch (IOException ex) {
            return new PreparedImage(raw, mimeType(photo));
        }
        if (source == null) {
            return new PreparedImage(raw, mimeType(photo));
        }

        int longest = Math.max(source.getWidth(), source.getHeight());
        if (longest <= maxImageEdge) {
            return new PreparedImage(raw, mimeType(photo));
        }

        double scale = (double) maxImageEdge / longest;
        int width = Math.max(1, (int) Math.round(source.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(source.getHeight() * scale));

        BufferedImage target = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY);
            // Transparent PNGs get a white backing instead of turning black in JPEG.
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
            graphics.drawImage(source, 0, 0, width, height, null);
        } finally {
            graphics.dispose();
        }

        try {
            byte[] jpeg = writeJpeg(target, 0.82f);
            return new PreparedImage(Base64.getEncoder().encodeToString(jpeg), "image/jpeg");
        } catch (IOException ex) {
            return new PreparedImage(raw, mimeType(photo));
        }
    }

    private static byte[] writeJpeg(BufferedImage image, float quality) throws IOException {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             ImageOutputStream stream = ImageIO.createImageOutputStream(out)) {
            writer.setOutput(stream);
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);
            writer.write(null, new IIOImage(image, null, null), param);
            stream.flush();
            return out.toByteArray();
        } finally {
            writer.dispose();
        }
    }

    /** Strips the data-URL prefix so only base64 remains. */
    private static String base64PhotoData(String photo) {
        if (isBlank(photo)) {
            return null;
        }
        String value = photo.trim();
        int comma = value.indexOf(',');
        if (value.startsWith("data:") && comma > 0) {
            value = value.substring(comma + 1);
        }
        return value.isBlank() ? null : value;
    }

    private static String stripCodeFence(String content) {
        String value = content.trim();
        if (value.startsWith("```")) {
            int firstNewline = value.indexOf('\n');
            if (firstNewline > 0) {
                value = value.substring(firstNewline + 1);
            }
            if (value.endsWith("```")) {
                value = value.substring(0, value.length() - 3);
            }
        }
        return value.trim();
    }

    private static String trimTo(String value, int max) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }

    private static String orDash(String value) {
        return isBlank(value) ? "—" : value.trim();
    }

    private static String trimSlash(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
