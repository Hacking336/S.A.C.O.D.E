package com.mabini.sacode.dto;

/**
 * Payload accepted by POST /api/triage — the report the AI has to read.
 *
 * <p>{@code photo} is whatever the front end had: a data URL
 * ({@code data:image/jpeg;base64,...}) or bare base64. It may be null when the
 * reporter did not attach an image, in which case the text is triaged alone.
 */
public record TriageRequest(ReportInfo report, String photo) {

    public record ReportInfo(
            String id,
            String equipment,
            String category,
            String location,
            String reportedBy,
            String description) {
    }
}
