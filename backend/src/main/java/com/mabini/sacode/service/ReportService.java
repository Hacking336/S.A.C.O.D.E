package com.mabini.sacode.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mabini.sacode.domain.Equipment;
import com.mabini.sacode.domain.Priority;
import com.mabini.sacode.domain.Report;
import com.mabini.sacode.domain.ReportStatus;
import com.mabini.sacode.dto.CreateReportRequest;
import com.mabini.sacode.dsa.EquipmentIndex;
import com.mabini.sacode.dsa.ReportPriorityQueue;
import com.mabini.sacode.dsa.Trie;
import com.mabini.sacode.repository.EquipmentRepository;
import com.mabini.sacode.repository.ReportHistoryRepository;
import com.mabini.sacode.repository.ReportRepository;
import com.mabini.sacode.repository.UserRepository;

/**
 * Report orchestration. The three required data structures live here:
 *
 *  DSA #1 — {@link ReportPriorityQueue} (max heap): {@link #getMostUrgent(int)}
 *           always hands the Admin dashboard Critical first, then High,
 *           Medium, Low, in O(n log n) overall and O(log n) per insert.
 *
 *  DSA #2 — {@link EquipmentIndex} (HashMap): asset details are resolved
 *           in O(1) when a report is created or enriched.
 *
 *  DSA #3 — {@link Trie}: prefix autocomplete for "Search reports...".
 */
@Service
public class ReportService {

    private static final String FALLBACK_REPORTER_EMAIL = "juan.delacruz@mabini.edu.ph";

    private final ReportRepository reports;
    private final ReportHistoryRepository history;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository users;
    private final EquipmentIndex equipmentIndex;

    /** Report codes + equipment names + room names for autocomplete. */
    private final Trie searchTrie = new Trie();

    public ReportService(ReportRepository reports,
                         ReportHistoryRepository history,
                         EquipmentRepository equipmentRepository,
                         UserRepository users,
                         EquipmentIndex equipmentIndex) {
        this.reports = reports;
        this.history = history;
        this.equipmentRepository = equipmentRepository;
        this.users = users;
        this.equipmentIndex = equipmentIndex;
    }

    // ------------------------------------------------------------------
    //  Warm-up
    // ------------------------------------------------------------------

    public void warmCache() {
        searchTrie.clear();
        for (Report report : reports.findAll()) {
            searchTrie.insert(report.getReportCode());
            searchTrie.insert(report.getEquipmentName());
            searchTrie.insert(report.getRoom());
        }
    }

    // ------------------------------------------------------------------
    //  Reads
    // ------------------------------------------------------------------

    public List<Report> listAll() {
        return reports.findAll();
    }

    public List<Report> listByReporter(Long reporterId) {
        return reports.findByReporter(reporterId);
    }

    public List<Report> listByStatus(ReportStatus status) {
        return reports.findByStatus(status);
    }

    public Optional<Report> findByCode(String reportCode) {
        return reports.findByCode(reportCode);
    }

    public Optional<Report> findById(Long id) {
        return reports.findById(id);
    }

    // ------------------------------------------------------------------
    //  DSA #1 — PRIORITY QUEUE (MAX HEAP)
    // ------------------------------------------------------------------

    /**
     * Returns the most urgent reports first:
     *     Critical > High > Medium > Low
     *
     * Building the heap is O(n) amortised per insertion (O(log n) each),
     * draining it is O(n log n); the caller never sorts manually.
     */
    public List<Report> getMostUrgent(int limit) {
        ReportPriorityQueue queue = ReportPriorityQueue.from(reports.findAll());
        List<Report> ordered = queue.drainSorted();
        return limit > 0 && ordered.size() > limit
                ? new ArrayList<>(ordered.subList(0, limit))
                : ordered;
    }

    /** The single most urgent open report, or empty when nothing is filed. */
    public Optional<Report> getMostUrgentOpen() {
        ReportPriorityQueue queue = ReportPriorityQueue.from(
                reports.findByStatus(ReportStatus.PENDING));
        return Optional.ofNullable(queue.peek());
    }

    // ------------------------------------------------------------------
    //  DSA #3 — TRIE search
    // ------------------------------------------------------------------

    public List<String> suggest(String prefix, int limit) {
        if (prefix == null || prefix.isBlank()) {
            return List.of();
        }
        List<String> suggestions = searchTrie.autocomplete(prefix, limit);
        if (suggestions.isEmpty()) {
            warmCache();
            suggestions = searchTrie.autocomplete(prefix, limit);
        }
        return suggestions;
    }

    public boolean hasSearchPrefix(String prefix) {
        return prefix != null && !prefix.isBlank() && searchTrie.hasPrefix(prefix);
    }

    /** Exact filtering — the Trie only powers the autocomplete box. */
    public List<Report> search(String term) {
        if (term == null || term.isBlank()) {
            return listAll();
        }
        return reports.search(term.trim());
    }

    // ------------------------------------------------------------------
    //  Writes
    // ------------------------------------------------------------------

    @Transactional
    public Report create(CreateReportRequest request) {
        Report report = new Report();
        report.setReportCode(reports.nextReportCode(LocalDate.now().getYear()));
        report.setReporterId(resolveReporterId(request.getReporterId()));
        report.setEquipmentId(request.getEquipmentId());
        report.setEquipmentName(request.getEquipmentName());
        report.setCategory(request.getCategory());
        report.setBrandModel(request.getBrandModel());
        report.setSerialNumber(request.getSerialNumber());
        report.setBuilding(request.getBuilding());
        report.setRoom(request.getRoom());
        report.setDamageType(request.getDamageType());
        report.setPriority(Priority.fromLabel(request.getPriority()));
        report.setStatus(ReportStatus.PENDING);
        report.setDescription(request.getDescription());
        report.setPhotoUrls(request.getPhotoUrls());
        report.setReportedAt(LocalDateTime.now());

        enrichFromEquipmentIndex(report);

        Report saved = reports.save(report);

        reports.appendHistory(
                saved.getId(),
                saved.getReporterId(),
                "Report submitted by " + reporterName(saved.getReporterId()),
                null,
                ReportStatus.PENDING.getLabel());

        searchTrie.insert(saved.getReportCode());
        searchTrie.insert(saved.getEquipmentName());
        searchTrie.insert(saved.getRoom());
        return saved;
    }

    @Transactional
    public Optional<Report> changeStatus(Long id, ReportStatus nextStatus, Long actorId, String note) {
        Optional<Report> found = reports.findById(id);
        if (found.isEmpty()) {
            return Optional.empty();
        }
        Report report = found.get();
        ReportStatus previous = report.getStatus();
        if (previous == nextStatus) {
            return found;
        }

        reports.updateStatus(id, nextStatus);
        reports.appendHistory(
                id,
                actorId,
                note == null || note.isBlank()
                        ? "Status changed from " + previous.getLabel() + " to " + nextStatus.getLabel()
                        : note,
                previous.getLabel(),
                nextStatus.getLabel());
        return reports.findById(id);
    }

    public void delete(Long id) {
        reports.deleteById(id);
    }

    public void reloadTrie() {
        warmCache();
    }

    // ------------------------------------------------------------------
    //  Internals
    // ------------------------------------------------------------------

    /**
     * DSA #2 usage — fill in the asset details from the HashMap cache
     * instead of issuing a SELECT per created report.
     */
    private void enrichFromEquipmentIndex(Report report) {
        if (report.getEquipmentId() != null) {
            Equipment equipment = equipmentIndex.findById(report.getEquipmentId()); // O(1)
            if (equipment != null) {
                applyEquipment(report, equipment);
                return;
            }
        }

        List<Equipment> inRoom = equipmentIndex.findByRoom(report.getRoom()); // O(1)
        if (inRoom.isEmpty() && report.getRoom() != null) {
            for (Equipment candidate : equipmentRepository.findByRoom(report.getRoom())) {
                equipmentIndex.index(candidate);
                inRoom = equipmentIndex.findByRoom(report.getRoom());
                break;
            }
        }

        String wanted = report.getEquipmentName() == null
                ? ""
                : report.getEquipmentName().trim().toLowerCase(Locale.ROOT);
        for (Equipment candidate : inRoom) {
            if (candidate.getName() != null
                    && candidate.getName().trim().toLowerCase(Locale.ROOT).equals(wanted)) {
                applyEquipment(report, candidate);
                return;
            }
        }

        if (report.getEquipmentId() != null) {
            Optional<Equipment> fromDatabase = equipmentRepository.findById(report.getEquipmentId());
            fromDatabase.ifPresent(equipment -> {
                equipmentIndex.index(equipment);
                applyEquipment(report, equipment);
            });
        }
    }

    private void applyEquipment(Report report, Equipment equipment) {
        report.setEquipmentId(equipment.getId());
        if (isBlank(report.getEquipmentName())) {
            report.setEquipmentName(equipment.getName());
        }
        if (isBlank(report.getCategory())) {
            report.setCategory(equipment.getCategory());
        }
        if (isBlank(report.getBrandModel())) {
            report.setBrandModel(equipment.getBrandModel());
        }
        if (isBlank(report.getSerialNumber())) {
            report.setSerialNumber(equipment.getSerialNumber());
        }
        if (isBlank(report.getBuilding())) {
            report.setBuilding(equipment.getBuilding());
        }
    }

    private Long resolveReporterId(Long requested) {
        if (requested != null) {
            return requested;
        }
        Optional<Long> fallback = users.findIdByEmail(FALLBACK_REPORTER_EMAIL);
        if (fallback.isPresent()) {
            return fallback.get();
        }
        return users.findDefaultStudentId().orElse(null);
    }

    private String reporterName(Long reporterId) {
        if (reporterId == null) {
            return "Student";
        }
        return users.findNameById(reporterId).orElse("Student");
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
