package com.mabini.sacode.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.mabini.sacode.domain.Equipment;

@Repository
public class EquipmentRepository {

    private static final String BASE =
            "select id, equipment_code, name, category, brand_model, serial_number, " +
            "       building, room, status " +
            "  from public.equipment";

    private static final RowMapper<Equipment> MAPPER = (rs, rowNum) -> new Equipment(
            rs.getLong("id"),
            rs.getString("equipment_code"),
            rs.getString("name"),
            rs.getString("category"),
            rs.getString("brand_model"),
            rs.getString("serial_number"),
            rs.getString("building"),
            rs.getString("room"),
            rs.getString("status"));

    private final JdbcTemplate jdbc;

    public EquipmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Equipment> findAll() {
        return jdbc.query(BASE + " order by name", MAPPER);
    }

    public Optional<Equipment> findById(Long id) {
        return jdbc.query(BASE + " where id = ?", MAPPER, id).stream().findFirst();
    }

    public List<Equipment> findByRoom(String room) {
        return jdbc.query(BASE + " where lower(trim(room)) = lower(trim(?)) order by name", MAPPER, room);
    }

    public Map<String, Long> countByRoom() {
        Map<String, Long> counts = new HashMap<>();
        jdbc.query(
                "select room, count(*) as total from public.equipment group by room order by total desc",
                (RowCallbackHandler) rs -> counts.put(rs.getString("room"), rs.getLong("total")));
        return counts;
    }
}
