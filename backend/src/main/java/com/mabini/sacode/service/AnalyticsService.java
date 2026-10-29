package com.mabini.sacode.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.mabini.sacode.dto.AnalyticsSummary;
import com.mabini.sacode.dto.NameValue;
import com.mabini.sacode.dto.TimeSeriesPoint;
import com.mabini.sacode.repository.AnalyticsRepository;

/**
 * Aggregates the numbers behind the Admin Dashboard and the
 * Reports & Analytics charts. All grouping happens in Postgres, so the
 * API only ever ships chart-sized payloads.
 */
@Service
public class AnalyticsService {

    /** Legend order used by the "Reports by Status" donut. */
    private static final String[] STATUS_ORDER = {"PENDING", "IN PROGRESS", "RESOLVED", "CANCELLED"};
    private static final String[] STATUS_LABELS = {"Pending", "In Progress", "Resolved", "Cancelled"};

    /** Legend order used by the "Reports by Priority" bar chart. */
    private static final String[] PRIORITY_ORDER = {"Critical", "High", "Medium", "Low"};

    private final AnalyticsRepository analytics;

    public AnalyticsService(AnalyticsRepository analytics) {
        this.analytics = analytics;
    }

    public AnalyticsSummary summary() {
        Map<String, Long> byStatus = analytics.countByStatus();
        Map<String, Long> byPriority = analytics.countByPriority();

        return new AnalyticsSummary(
                analytics.countSinceStartOfMonth(),
                analytics.countResolvedSinceStartOfMonth(),
                analytics.averageResolutionDays(),
                analytics.resolutionRate(),
                analytics.countTotal(),
                byStatus.getOrDefault("PENDING", 0L),
                byStatus.getOrDefault("IN PROGRESS", 0L),
                byStatus.getOrDefault("RESOLVED", 0L),
                byStatus.getOrDefault("CANCELLED", 0L),
                byPriority.getOrDefault("Critical", 0L));
    }

    public List<NameValue> reportsByStatus() {
        Map<String, Long> counts = analytics.countByStatus();
        long total = counts.values().stream().mapToLong(Long::longValue).sum();

        List<NameValue> rows = new ArrayList<>();
        for (int i = 0; i < STATUS_ORDER.length; i++) {
            long value = counts.getOrDefault(STATUS_ORDER[i], 0L);
            rows.add(new NameValue(STATUS_LABELS[i], value, percent(value, total)));
        }
        return rows;
    }

    public List<NameValue> reportsByPriority() {
        Map<String, Long> counts = analytics.countByPriority();
        List<NameValue> rows = new ArrayList<>();
        for (String label : PRIORITY_ORDER) {
            rows.add(new NameValue(label, counts.getOrDefault(label, 0L)));
        }
        return rows;
    }

    public List<NameValue> reportsByCategory() {
        long total = analytics.countByCategory().stream().mapToLong(NameValue::value).sum();
        return analytics.countByCategory().stream()
                .map(row -> new NameValue(row.name(), row.value(), percent(row.value(), total)))
                .toList();
    }

    public List<NameValue> topLocations(int limit) {
        return analytics.topRooms(limit);
    }

    public List<NameValue> topEquipment(int limit) {
        return analytics.topEquipment(limit);
    }

    public List<TimeSeriesPoint> reportsOverTime() {
        return analytics.reportsOverTime();
    }

    private static String percent(long value, long total) {
        if (total <= 0) {
            return "0%";
        }
        double pct = 100.0 * value / total;
        if (Math.abs(pct - Math.round(pct)) < 0.05) {
            return Math.round(pct) + "%";
        }
        return String.format(Locale.ROOT, "%.1f%%", pct);
    }
}
