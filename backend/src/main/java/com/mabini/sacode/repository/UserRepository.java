package com.mabini.sacode.repository;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Long> findIdByEmail(String email) {
        return jdbc.query(
                "select id from public.users where lower(email) = lower(?)",
                rs -> {
                    if (rs.next()) {
                        return Optional.of(rs.getLong("id"));
                    }
                    return Optional.empty();
                },
                email);
    }

    public Optional<String> findNameById(Long id) {
        return jdbc.query(
                "select full_name from public.users where id = ?",
                rs -> {
                    if (rs.next()) {
                        return Optional.ofNullable(rs.getString("full_name"));
                    }
                    return Optional.empty();
                },
                id);
    }

    /** Fallback reporter while the front end has no real sign-in flow. */
    public Optional<Long> findDefaultStudentId() {
        return jdbc.query(
                "select id from public.users where role = 'STUDENT' order by id limit 1",
                rs -> {
                    if (rs.next()) {
                        return Optional.of(rs.getLong("id"));
                    }
                    return Optional.empty();
                });
    }
}
