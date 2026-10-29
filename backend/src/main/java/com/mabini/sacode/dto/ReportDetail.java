package com.mabini.sacode.dto;

import java.util.List;

import com.mabini.sacode.domain.Report;
import com.mabini.sacode.domain.ReportHistoryEntry;

/** Report plus its timeline, returned by GET /api/reports/{ref}. */
public record ReportDetail(Report report, List<ReportHistoryEntry> history) {

    public static ReportDetail of(Report report, List<ReportHistoryEntry> history) {
        return new ReportDetail(report, history);
    }
}
