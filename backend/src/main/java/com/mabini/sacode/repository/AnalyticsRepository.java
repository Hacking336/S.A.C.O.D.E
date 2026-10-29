package com.mabini.sacode.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;

import com.mabini.sacode.dto.NameValue;
import com.mabini.sacode.dto.TimeSeriesPoint;

/**
 * Aggregations feeding the charts on the Admin Dashboard and the
 * Reports & Analytics page. Every query runs server-side so the charts
 * never pull raw rows across the wire.
 */
@Repository
public class AnalyticsRepository {

    private final JdbcTemplate jdbc;

    public AnalyticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Long> countByStatus() {
        Map<String, Long> counts = new HashMap<>();
        jdbc.query(
                "select status, count(*) as total from public.reports group by status",
                (RowCallbackHandler) rs -> counts.put(rs.getString("status"), rs.getLong("total")));
        return counts;
    }

    public Map<String, Long> countByPriority() {
        Map<String, Long> counts = new HashMap<>();
        jdbc.query(
                "select priority, count(*) as total from public.reports group by priority",
                (RowCallbackHandler) rs -> counts.put(rs.getString("priority"), rs.getLong("total")));
        return counts;
    }

    public List<NameValue> countByCategory() {
        return jdbc.query(
                "select category as name, count(*) as value " +
                        "  from public.reports group by category order by value desc",
                (rs, i) -> new NameValue(rs.getString("name"), rs.getLong("value")));
    }

    public List<NameValue> topRooms(int limit) {
        return jdbc.query(
                "select room as name, count(*) as value " +
                        "  from public.reports group by room order by value desc limit ?",
                (rs, i) -> new NameValue(rs.getString("name"), rs.getLong("value")),
                limit);
    }

    public List<NameValue> topEquipment(int limit) {
        return jdbc.query(
                "select equipment_name as name, count(*) as value " +
                        "  from public.reports group by equipment_name order by value desc limit ?",
                (rs, i) -> new NameValue(rs.getString("name"), rs.getLong("value")),
                limit);
    }

    /** Daily submitted vs. resolved totals for the line chart. */
    public List<TimeSeriesPoint> reportsOverTime() {
        Map<String, long[]> buckets = new HashMap<>();
        Map<String, Long> order = new HashMap<>();

        jdbc.query(
                "select to_char(date_trunc('day', reported_at), 'Mon DD') as bucket, " +
                        "       date_trunc('day', reported_at) as day, " +
                        "       count(*) as submitted, " +
                        "       count(*) filter (where status = 'RESOLVED') as resolved " +
                        "  from public.reports " +
                        " group by date_trunc('day', reported_at) " +
                        " order by date_trunc('day', reported_at) " +
                        " limit 12",
                (RowCallbackHandler) rs -> {
                    String bucket = rs.getString("bucket");
                    long[] counts = buckets.computeIfAbsent(bucket, key -> new long[2]);
                    counts[0] = rs.getLong("submitted");
                    counts[1] = rs.getLong("resolved");
                    order.putIfAbsent(bucket, rs.getTimestamp("day").getTime());
                });

        List<TimeSeriesPoint> points = new ArrayList<>();
        order.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .forEach(entry -> {
                    long[] counts = buckets.get(entry.getKey());
                    points.add(new TimeSeriesPoint(entry.getKey(), counts[0], counts[1]));
                });
        return points;
    }

    public long countTotal() {
        Long total = jdbc.queryForObject("select count(*) from public.reports", Long.class);
        return total == null ? 0L : total;
    }

    public long countSinceStartOfMonth() {
        Long total = jdbc.queryForObject(
                "select count(*) from public.reports where reported_at >= date_trunc('month', now())",
                Long.class);
        return total == null ? 0L : total;
    }

    public long countResolvedSinceStartOfMonth() {
        Long total = jdbc.queryForObject(
                "select count(*) from public.reports " +
                        " where status = 'RESOLVED' and coalesce(resolved_at, reported_at) >= date_trunc('month', now())",
                Long.class);
        return total == null ? 0L : total;
    }

    /** Average days between report and resolution. */
    public double averageResolutionDays() {
        Double avg = jdbc.queryForObject(
                "select avg(extract(epoch from (resolved_at - reported_at)) / 86400.0) " +
                        "  from public.reports where resolved_at is not null",
                Double.class);
        return avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;
    }

    /** Percentage of reports that reached RESOLVED. */
    public double resolutionRate() {
        Double rate = jdbc.queryForObject(
                "select case when count(*) = 0 then 0 else " +
                        "       100.0 * count(*) filter (where status = 'RESOLVED') / count(*) end " +
                        "  from public.reports",
                Double.class);
        return rate == null ? 0.0 : Math.round(rate);
    }
}
