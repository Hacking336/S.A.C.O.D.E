package com.mabini.sacode.dto;

/**
 * KPI strip on the Reports & Analytics page.
 */
public record AnalyticsSummary(
        long submittedThisMonth,
        long repairsFinished,
        double avgResolutionDays,
        double resolutionRate,
        long totalReports,
        long pending,
        long inProgress,
        long resolved,
        long cancelled,
        long critical) {
}
