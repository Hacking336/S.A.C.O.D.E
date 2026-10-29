package com.mabini.sacode.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.RowMapper;

import com.mabini.sacode.domain.Priority;
import com.mabini.sacode.domain.Report;
import com.mabini.sacode.domain.ReportStatus;

final class ReportRowMapper implements RowMapper<Report> {

    static final String SELECT =
            "select r.id, r.report_code, r.reporter_id, u.full_name as reporter_name, " +
            "       r.equipment_id, r.equipment_name, r.category, r.brand_model, r.serial_number, " +
            "       r.building, r.room, r.damage_type, r.priority, r.status, r.description, " +
            "       r.photo_urls, r.reported_at, r.resolved_at " +
            "  from public.reports r " +
            "  left join public.users u on u.id = r.reporter_id";

    @Override
    public Report mapRow(ResultSet rs, int rowNum) throws SQLException {
        Report report = new Report();
        report.setId(rs.getLong("id"));
        report.setReportCode(rs.getString("report_code"));

        long reporterId = rs.getLong("reporter_id");
        report.setReporterId(rs.wasNull() ? null : reporterId);
        report.setReporterName(rs.getString("reporter_name"));

        long equipmentId = rs.getLong("equipment_id");
        report.setEquipmentId(rs.wasNull() ? null : equipmentId);

        report.setEquipmentName(rs.getString("equipment_name"));
        report.setCategory(rs.getString("category"));
        report.setBrandModel(rs.getString("brand_model"));
        report.setSerialNumber(rs.getString("serial_number"));
        report.setBuilding(rs.getString("building"));
        report.setRoom(rs.getString("room"));
        report.setDamageType(rs.getString("damage_type"));
        report.setPriority(Priority.fromLabel(rs.getString("priority")));
        report.setStatus(ReportStatus.fromLabel(rs.getString("status")));
        report.setDescription(rs.getString("description"));
        report.setPhotoUrls(readPhotoUrls(rs));
        report.setReportedAt(toLocalDateTime(rs.getTimestamp("reported_at")));
        report.setResolvedAt(toLocalDateTime(rs.getTimestamp("resolved_at")));
        return report;
    }

    static List<String> readPhotoUrls(ResultSet rs) throws SQLException {
        java.sql.Array array = rs.getArray("photo_urls");
        List<String> urls = new ArrayList<>();
        if (array == null) {
            return urls;
        }
        Object raw = array.getArray();
        if (raw instanceof Object[] values) {
            for (Object value : values) {
                if (value != null) {
                    urls.add(String.valueOf(value));
                }
            }
        }
        return urls;
    }

    static LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    ReportRowMapper() {
    }
}
