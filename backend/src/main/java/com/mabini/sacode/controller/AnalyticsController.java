package com.mabini.sacode.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mabini.sacode.dto.AnalyticsSummary;
import com.mabini.sacode.dto.NameValue;
import com.mabini.sacode.dto.TimeSeriesPoint;
import com.mabini.sacode.service.AnalyticsService;

/**
 * Aggregated data behind the Admin Dashboard charts and the
 * Reports & Analytics page.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analytics;

    public AnalyticsController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @GetMapping("/summary")
    public AnalyticsSummary summary() {
        return analytics.summary();
    }

    @GetMapping("/status")
    public List<NameValue> byStatus() {
        return analytics.reportsByStatus();
    }

    @GetMapping("/priority")
    public List<NameValue> byPriority() {
        return analytics.reportsByPriority();
    }

    @GetMapping("/category")
    public List<NameValue> byCategory() {
        return analytics.reportsByCategory();
    }

    @GetMapping("/locations")
    public List<NameValue> topLocations(@RequestParam(defaultValue = "5") int limit) {
        return analytics.topLocations(limit);
    }

    @GetMapping("/equipment")
    public List<NameValue> topEquipment(@RequestParam(defaultValue = "5") int limit) {
        return analytics.topEquipment(limit);
    }

    @GetMapping("/over-time")
    public List<TimeSeriesPoint> overTime() {
        return analytics.reportsOverTime();
    }

    /** Everything the dashboard needs in a single round-trip. */
    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return Map.of(
                "summary", analytics.summary(),
                "byStatus", analytics.reportsByStatus(),
                "byPriority", analytics.reportsByPriority(),
                "byCategory", analytics.reportsByCategory(),
                "topLocations", analytics.topLocations(5),
                "topEquipment", analytics.topEquipment(5),
                "overTime", analytics.reportsOverTime());
    }
}
