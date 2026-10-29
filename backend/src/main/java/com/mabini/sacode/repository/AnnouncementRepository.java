package com.mabini.sacode.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.mabini.sacode.domain.Announcement;

@Repository
public class AnnouncementRepository {

    private static final String SELECT =
            "select id, title, content, tone, created_by, published_at from public.announcements";

    private static final RowMapper<Announcement> MAPPER = (rs, rowNum) -> {
        Announcement announcement = new Announcement();
        announcement.setId(rs.getLong("id"));
        announcement.setTitle(rs.getString("title"));
        announcement.setContent(rs.getString("content"));
        announcement.setTone(rs.getString("tone"));

        long createdBy = rs.getLong("created_by");
        announcement.setCreatedBy(rs.wasNull() ? null : createdBy);

        Timestamp publishedAt = rs.getTimestamp("published_at");
        announcement.setPublishedAt(publishedAt == null ? null : publishedAt.toLocalDateTime());
        return announcement;
    };

    private final JdbcTemplate jdbc;

    public AnnouncementRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Announcement> findRecent(int limit) {
        return jdbc.query(SELECT + " order by published_at desc limit ?", MAPPER, limit);
    }
}
