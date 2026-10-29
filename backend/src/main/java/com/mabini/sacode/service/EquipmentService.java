package com.mabini.sacode.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mabini.sacode.dsa.EquipmentIndex;
import com.mabini.sacode.dsa.Trie;
import com.mabini.sacode.domain.Equipment;
import com.mabini.sacode.repository.EquipmentRepository;

/**
 * Equipment lookups are served by two data structures:
 *
 *  DSA #2 — {@link EquipmentIndex} (HashMap): O(1) by id, code, serial
 *           or room. Anything missing is loaded from Supabase once and
 *           then stays cached.
 *
 *  DSA #3 — {@link Trie}: prefix autocomplete for the equipment search
 *           box, O(L) regardless of how many assets exist.
 */
@Service
public class EquipmentService {

    private final EquipmentRepository repository;
    private final EquipmentIndex index;
    private final Trie autocomplete = new Trie();

    public EquipmentService(EquipmentRepository repository, EquipmentIndex index) {
        this.repository = repository;
        this.index = index;
    }

    /** Warm the HashMap and the Trie once at startup. */
    public void warmCache() {
        index.clear();
        autocomplete.clear();
        for (Equipment equipment : repository.findAll()) {
            index.index(equipment);
            autocomplete.insert(equipment.getName());
            autocomplete.insert(equipment.getEquipmentCode());
            autocomplete.insert(equipment.getRoom());
        }
    }

    public List<Equipment> list() {
        return repository.findAll();
    }

    public Optional<Equipment> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        Equipment cached = index.findById(id); // O(1)
        if (cached != null) {
            return Optional.of(cached);
        }
        Optional<Equipment> fromDatabase = repository.findById(id);
        fromDatabase.ifPresent(index::index);
        return fromDatabase;
    }

    public Optional<Equipment> findByCode(String equipmentCode) {
        if (equipmentCode == null || equipmentCode.isBlank()) {
            return Optional.empty();
        }
        Equipment cached = index.findByCode(equipmentCode); // O(1)
        if (cached != null) {
            return Optional.of(cached);
        }
        indexAll();
        return Optional.ofNullable(index.findByCode(equipmentCode));
    }

    public Optional<Equipment> findBySerialNumber(String serialNumber) {
        if (serialNumber == null || serialNumber.isBlank()) {
            return Optional.empty();
        }
        Equipment cached = index.findBySerialNumber(serialNumber); // O(1)
        if (cached != null) {
            return Optional.of(cached);
        }
        indexAll();
        return Optional.ofNullable(index.findBySerialNumber(serialNumber));
    }

    /** Every asset in a room / office — O(1) after warm-up. */
    public List<Equipment> findByRoom(String room) {
        if (room == null || room.isBlank()) {
            return List.of();
        }
        List<Equipment> cached = index.findByRoom(room);
        if (!cached.isEmpty()) {
            return cached;
        }
        List<Equipment> fromDatabase = repository.findByRoom(room);
        fromDatabase.forEach(index::index);
        return fromDatabase;
    }

    /** Trie-driven autocomplete for the search bar. */
    public List<String> suggest(String prefix, int limit) {
        if (prefix == null || prefix.isBlank()) {
            return List.of();
        }
        List<String> suggestions = autocomplete.autocomplete(prefix, limit);
        if (suggestions.isEmpty() && index.size() == 0) {
            indexAll();
            suggestions = autocomplete.autocomplete(prefix, limit);
        }
        return suggestions;
    }

    /** Resolves suggestions to full records without extra SQL round-trips. */
    public List<Equipment> search(String term) {
        if (term == null || term.isBlank()) {
            return list();
        }
        List<String> suggestions = autocomplete.autocomplete(term, 50);
        List<Equipment> results = new ArrayList<>();
        for (String suggestion : suggestions) {
            Equipment byCode = index.findByCode(suggestion);
            if (byCode != null) {
                results.add(byCode);
                continue;
            }
            for (Equipment candidate : index.snapshotById().values()) {
                boolean matches = (candidate.getName() != null && candidate.getName().equalsIgnoreCase(suggestion))
                        || (candidate.getRoom() != null && candidate.getRoom().equalsIgnoreCase(suggestion));
                if (matches && results.stream().noneMatch(existing -> existing.getId().equals(candidate.getId()))) {
                    results.add(candidate);
                }
            }
        }
        return results;
    }

    private void indexAll() {
        for (Equipment equipment : repository.findAll()) {
            index.index(equipment);
            autocomplete.insert(equipment.getName());
            autocomplete.insert(equipment.getEquipmentCode());
            autocomplete.insert(equipment.getRoom());
        }
    }
}
