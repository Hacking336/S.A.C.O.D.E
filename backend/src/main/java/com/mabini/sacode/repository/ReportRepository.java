package com.mabini.sacode.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import com.mabini.sacode.domain.Report;
import com.mabini.sacode.domain.ReportStatus;

/**
 * Plain JDBC access to {@code public.reports} on Supabase Postgres.
 * No JPA: JdbcTemplate keeps the SQL explicit and lets the DSA layer
 * stay in charge of ordering and lookups.
 */
@Repository
public class ReportRepository {

    private final JdbcTemplate jdbc;
    private final SimpleJdbcInsert insert;

    public ReportRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        this.insert = new SimpleJdbcInsert(jdbc)
                .withTableName("public.reports")
                .usingGeneratedKeyColumns("id");
    }

    public List<Report> findAll() {
        return jdbc.query(ReportRowMapper.SELECT + " order by r.reported_at desc", new ReportRowMapper());
    }

    public List<Report> findByReporter(Long reporterId) {
        return jdbc.query(
                ReportRowMapper.SELECT + " where r.reporter_id = ? order by r.reported_at desc",
                new ReportRowMapper(),
                reporterId);
    }

    public List<Report> findByStatus(ReportStatus status) {
        return jdbc.query(
                ReportRowMapper.SELECT + " where r.status = ? order by r.reported_at desc",
                new ReportRowMapper(),
                status.getLabel());
    }

    public Optional<Report> findById(Long id) {
        List<Report> found = jdbc.query(
                ReportRowMapper.SELECT + " where r.id = ?",
                new ReportRowMapper(),
                id);
        return found.stream().findFirst();
    }

    public Optional<Report> findByCode(String reportCode) {
        List<Report> found = jdbc.query(
                ReportRowMapper.SELECT + " where upper(r.report_code) = upper(?)",
                new ReportRowMapper(),
                reportCode);
        return found.stream().findFirst();
    }

    public List<Report> search(String term) {
        String like = "%" + term + "%";
        return jdbc.query(
                ReportRowMapper.SELECT +
                        " where upper(r.report_code) like upper(?) " +
                        "   or upper(r.equipment_name) like upper(?) " +
                        "   or upper(r.room) like upper(?) " +
                        "   or upper(r.building) like upper(?) " +
                        " order by r.reported_at desc",
                new ReportRowMapper(),
                like, like, like, like);
    }

    public Report save(Report report) {
        Map<String, Object> params = new HashMap<>();
        params.put("report_code", report.getReportCode());
        params.put("reporter_id", report.getReporterId());
        params.put("equipment_id", report.getEquipmentId());
        params.put("equipment_name", report.getEquipmentName());
        params.put("category", report.getCategory());
        params.put("brand_model", report.getBrandModel());
        params.put("serial_number", report.getSerialNumber());
        params.put("building", report.getBuilding());
        params.put("room", report.getRoom());
        params.put("damage_type", report.getDamageType());
        params.put("priority", report.getPriority().getLabel());
        params.put("status", report.getStatus().getLabel());
        params.put("description", report.getDescription());
        params.put("photo_urls", report.getPhotoUrls() == null || report.getPhotoUrls().isEmpty()
                ? null
                : report.getPhotoUrls().toArray(String[]::new));

        Number generatedKey = insert.executeAndReturnKey(params);
        report.setId(generatedKey.longValue());
        return report;
    }

    /** Appends an immutable row to the report timeline. */
    public void appendHistory(Long reportId, Long actorId, String action,
                              String previousStatus, String newStatus) {
        jdbc.update(
                "insert into public.report_history (report_id, actor_id, action, previous_status, new_status) " +
                        "values (?, ?, ?, ?, ?)",
                reportId, actorId, action, previousStatus, newStatus);
    }

    public int updateStatus(Long id, ReportStatus status) {
        boolean resolved = status == ReportStatus.RESOLVED;
        return jdbc.update(
                "update public.reports set status = ?, resolved_at = case when ? then now() else null end " +
                        "where id = ?",
                status.getLabel(), resolved, id);
    }

    public int deleteById(Long id) {
        return jdbc.update("delete from public.reports where id = ?", id);
    }

    /** Next human-readable code: REP-2025-0013. */
    public String nextReportCode(int year) {
        Long max = jdbc.queryForObject(
                "select coalesce(max(nullif(regexp_replace(report_code, '\\D', '', 'g'), '')::bigint), 0) " +
                        "  from public.reports where report_code like ?",
                Long.class,
                "REP-" + year + "-%");
        long sequence = (max == null ? 0L : max) + 1;
        return String.format("REP-%d-%04d", year, sequence % 10000);
    }

    public long countAll() {
        Long total = jdbc.queryForObject("select count(*) from public.reports", Long.class);
        return total == null ? 0L : total;
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
}
