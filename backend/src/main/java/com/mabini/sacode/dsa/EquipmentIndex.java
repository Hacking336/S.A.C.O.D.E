package com.mabini.sacode.dsa;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.mabini.sacode.domain.Equipment;

/**
 * ==================================================================
 *  DSA #2 — HASHMAP index for O(1) equipment lookups
 * ==================================================================
 *
 * A read-optimised cache over the {@code equipment} table. Every lookup
 * is served by a {@link HashMap}, giving average O(1) access instead of
 * running a database round-trip for every request.
 *
 * Indexes kept in sync on {@link #index(Equipment)}:
 *   byId     : Long      -> Equipment      (primary key)
 *   byCode   : String    -> Equipment      ("EQP-0001")
 *   bySerial : String    -> Equipment      (serial number)
 *   byRoom   : String    -> List<Equipment> (room / office number)
 *
 * Complexity: insert O(1), findById / findByRoom / findByCode O(1) on
 * average (hash-bucket worst case O(n), never reached in practice).
 *
 * Thread-safety: every mutation copies the maps so readers that already
 * grabbed a reference keep a consistent snapshot; the service also
 * exposes a copy through {@link #snapshotById()}.
 */
public class EquipmentIndex {

    private Map<Long, Equipment> byId = new HashMap<>();
    private Map<String, Equipment> byCode = new HashMap<>();
    private Map<String, Equipment> bySerial = new HashMap<>();
    private Map<String, List<Equipment>> byRoom = new HashMap<>();

    /** O(1) — insert or refresh one asset in every index. */
    public void index(Equipment equipment) {
        if (equipment == null) {
            return;
        }

        Map<Long, Equipment> nextById = new HashMap<>(byId);
        Map<String, Equipment> nextByCode = new HashMap<>(byCode);
        Map<String, Equipment> nextBySerial = new HashMap<>(bySerial);
        Map<String, List<Equipment>> nextByRoom = new HashMap<>(byRoom);

        if (equipment.getId() != null) {
            nextById.put(equipment.getId(), equipment);
        }
        if (equipment.getEquipmentCode() != null) {
            nextByCode.put(equipment.getEquipmentCode().toUpperCase(Locale.ROOT), equipment);
        }
        if (equipment.getSerialNumber() != null && !equipment.getSerialNumber().isBlank()) {
            nextBySerial.put(equipment.getSerialNumber().toUpperCase(Locale.ROOT), equipment);
        }
        if (equipment.getRoom() != null) {
            String key = normaliseRoom(equipment.getRoom());
            List<Equipment> bucket = new ArrayList<>(nextByRoom.getOrDefault(key, List.of()));
            // avoid double-counting the same asset on re-index
            bucket.removeIf(existing -> existing.getId() != null && existing.getId().equals(equipment.getId()));
            bucket.add(equipment);
            nextByRoom.put(key, bucket);
        }

        byId = nextById;
        byCode = nextByCode;
        bySerial = nextBySerial;
        byRoom = nextByRoom;
    }

    public void indexAll(Iterable<Equipment> equipment) {
        if (equipment == null) {
            return;
        }
        for (Equipment item : equipment) {
            index(item);
        }
    }

    /** O(1) — lookup by primary key. */
    public Equipment findById(Long id) {
        return id == null ? null : byId.get(id);
    }

    /** O(1) — lookup by business code, e.g. "EQP-0001". */
    public Equipment findByCode(String equipmentCode) {
        return equipmentCode == null ? null : byCode.get(equipmentCode.toUpperCase(Locale.ROOT));
    }

    /** O(1) — lookup by serial number. */
    public Equipment findBySerialNumber(String serialNumber) {
        return serialNumber == null ? null : bySerial.get(serialNumber.toUpperCase(Locale.ROOT));
    }

    /** O(1) — every asset installed in a room / office. */
    public List<Equipment> findByRoom(String room) {
        if (room == null) {
            return List.of();
        }
        return byRoom.getOrDefault(normaliseRoom(room), List.of());
    }

    public boolean contains(Long id) {
        return id != null && byId.containsKey(id);
    }

    public int size() {
        return byId.size();
    }

    public void clear() {
        byId = new HashMap<>();
        byCode = new HashMap<>();
        bySerial = new HashMap<>();
        byRoom = new HashMap<>();
    }

    public Map<Long, Equipment> snapshotById() {
        return Map.copyOf(byId);
    }

    private static String normaliseRoom(String room) {
        return room.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }
}
