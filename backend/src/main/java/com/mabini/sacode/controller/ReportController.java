package com.mabini.sacode.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mabini.sacode.domain.Report;
import com.mabini.sacode.domain.ReportStatus;
import com.mabini.sacode.dto.CreateReportRequest;
import com.mabini.sacode.dto.ReportDetail;
import com.mabini.sacode.dto.UpdateStatusRequest;
import com.mabini.sacode.repository.ReportHistoryRepository;
import com.mabini.sacode.service.ReportService;

import jakarta.validation.Valid;

/**
 * CRUD surface for damage reports.
 *
 * GET /api/reports/urgent — served by DSA #1, the max-heap priority queue.
 * GET /api/reports/suggest — served by DSA #3, the Trie.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reports;
    private final ReportHistoryRepository history;

    public ReportController(ReportService reports, ReportHistoryRepository history) {
        this.reports = reports;
        this.history = history;
    }

    @GetMapping
    public List<Report> list(@RequestParam(required = false) String q) {
        return q == null || q.isBlank() ? reports.listAll() : reports.search(q);
    }

    /**
     * DSA #1 in action: the heap pops Critical before High before Medium
     * before Low, so the dashboard never has to sort on the client.
     */
    @GetMapping("/urgent")
    public List<Report> urgent(@RequestParam(defaultValue = "10") int limit) {
        return reports.getMostUrgent(limit);
    }

    /** DSA #3: prefix autocomplete for the "Search reports..." box. */
    @GetMapping("/suggest")
    public List<String> suggest(@RequestParam(defaultValue = "") String q,
                                @RequestParam(defaultValue = "8") int limit) {
        return reports.suggest(q, limit);
    }

    @GetMapping("/status/{status}")
    public List<Report> byStatus(@PathVariable String status) {
        return reports.listByStatus(ReportStatus.fromLabel(status));
    }

    @GetMapping("/reporter/{reporterId}")
    public List<Report> byReporter(@PathVariable Long reporterId) {
        return reports.listByReporter(reporterId);
    }

    /** Accepts either the numeric id or the human code (REP-2025-0012). */
    @GetMapping("/{ref}")
    public ResponseEntity<ReportDetail> detail(@PathVariable String ref) {
        Report report;
        if (ref.chars().allMatch(Character::isDigit)) {
            report = reports.findById(Long.valueOf(ref)).orElse(null);
        } else {
            report = reports.findByCode(ref).orElse(null);
        }
        if (report == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ReportDetail.of(report, history.findByReport(report.getId())));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> history(@PathVariable Long id) {
        if (reports.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(history.findByReport(id));
    }

    @PostMapping
    public ResponseEntity<Report> create(@Valid @RequestBody CreateReportRequest request) {
        Report created = reports.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Report> updateStatus(@PathVariable Long id,
                                               @Valid @RequestBody UpdateStatusRequest request) {
        ReportStatus next = ReportStatus.fromLabel(request.getStatus());
        return reports.changeStatus(id, next, request.getActorId(), request.getNote())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (reports.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        reports.delete(id);
        return ResponseEntity.noContent().build();
    }
}
