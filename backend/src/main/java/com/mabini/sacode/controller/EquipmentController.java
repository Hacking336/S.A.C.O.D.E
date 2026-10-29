package com.mabini.sacode.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mabini.sacode.domain.Equipment;
import com.mabini.sacode.service.EquipmentService;

/**
 * Asset catalogue endpoints.
 *
 * Every id / code / serial / room hit is served by DSA #2 (HashMap),
 * every prefix query by DSA #3 (Trie).
 */
@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipment;

    public EquipmentController(EquipmentService equipment) {
        this.equipment = equipment;
    }

    @GetMapping
    public List<Equipment> list() {
        return equipment.list();
    }

    /** DSA #2: O(1) primary-key lookup. */
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> byId(@PathVariable Long id) {
        return equipment.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** DSA #2: O(1) business-code lookup, e.g. /api/equipment/code/EQP-0001. */
    @GetMapping("/code/{code}")
    public ResponseEntity<Equipment> byCode(@PathVariable String code) {
        Optional<Equipment> found = equipment.findByCode(code);
        return found.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** DSA #2: O(1) serial-number lookup. */
    @GetMapping("/serial/{serial}")
    public ResponseEntity<Equipment> bySerial(@PathVariable String serial) {
        return equipment.findBySerialNumber(serial)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** DSA #2: O(1) room lookup returning every asset in that room. */
    @GetMapping("/room/{room}")
    public List<Equipment> byRoom(@PathVariable String room) {
        return equipment.findByRoom(room);
    }

    /** DSA #3: Trie autocomplete for the equipment search box. */
    @GetMapping("/suggest")
    public List<String> suggest(@RequestParam(defaultValue = "") String q,
                                @RequestParam(defaultValue = "8") int limit) {
        return equipment.suggest(q, limit);
    }

    @GetMapping("/search")
    public List<Equipment> search(@RequestParam(defaultValue = "") String q) {
        return equipment.search(q);
    }
}
