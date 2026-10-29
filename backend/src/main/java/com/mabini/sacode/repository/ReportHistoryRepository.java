package com.mabini.sacode.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.mabini.sacode.domain.ReportHistoryEntry;

@Repository
public class ReportHistoryRepository {

    private static final String SELECT =
            "select h.id, h.report_id, h.actor_id, u.full_name as actor_name, " +
            "       h.action, h.previous_status, h.new_status, h.created_at " +
            "  from public.report_history h " +
            "  left join public.users u on u.id = h.actor_id ";

    private static final RowMapper<ReportHistoryEntry> MAPPER = (rs, rowNum) -> {
        ReportHistoryEntry entry = new ReportHistoryEntry();
        entry.setId(rs.getLong("id"));
        entry.setReportId(rs.getLong("report_id"));

        long actorId = rs.getLong("actor_id");
        entry.setActorId(rs.wasNull() ? null : actorId);
        entry.setActorName(rs.getString("actor_name"));
        entry.setAction(rs.getString("action"));
        entry.setPreviousStatus(rs.getString("previous_status"));
        entry.setNewStatus(rs.getString("new_status"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        entry.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        return entry;
    };

    private final JdbcTemplate jdbc;

    public ReportHistoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ReportHistoryEntry> findByReport(Long reportId) {
        return jdbc.query(SELECT + " where h.report_id = ? order by h.created_at asc", MAPPER, reportId);
    }

    public ReportHistoryEntry save(ReportHistoryEntry entry) {
        jdbc.update(
                "insert into public.report_history (report_id, actor_id, action, previous_status, new_status, created_at) " +
                        "values (?, ?, ?, ?, ?, ?)",
                entry.getReportId(),
                entry.getActorId(),
                entry.getAction(),
                entry.getPreviousStatus(),
                entry.getNewStatus(),
                entry.getCreatedAt() == null ? null : Timestamp.valueOf((LocalDateTime) entry.getCreatedAt()));
        return entry;
    }
}
