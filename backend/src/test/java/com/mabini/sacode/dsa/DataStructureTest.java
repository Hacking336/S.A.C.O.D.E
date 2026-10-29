package com.mabini.sacode.dsa;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.mabini.sacode.domain.Equipment;
import com.mabini.sacode.domain.Priority;
import com.mabini.sacode.domain.Report;
import com.mabini.sacode.domain.ReportStatus;

class DataStructureTest {

    // ------------------------------------------------------------------
    //  DSA #1 — priority queue (max heap)
    // ------------------------------------------------------------------

    @Test
    void maxHeapDrainsInUrgencyOrder() {
        ReportPriorityQueue queue = new ReportPriorityQueue();
        queue.offer(report("REP-1", Priority.MEDIUM, LocalDateTime.of(2025, 5, 1, 9, 0)));
        queue.offer(report("REP-2", Priority.LOW, LocalDateTime.of(2025, 5, 2, 9, 0)));
        queue.offer(report("REP-3", Priority.CRITICAL, LocalDateTime.of(2025, 5, 3, 9, 0)));
        queue.offer(report("REP-4", Priority.HIGH, LocalDateTime.of(2025, 5, 4, 9, 0)));
        queue.offer(report("REP-5", Priority.CRITICAL, LocalDateTime.of(2025, 5, 5, 9, 0)));

        assertEquals(5, queue.size());
        assertEquals("REP-5", queue.peek().getReportCode());
        assertEquals(Priority.CRITICAL, queue.highestPriority());

        List<Report> ordered = queue.drainSorted();
        assertEquals(List.of("REP-5", "REP-3", "REP-4", "REP-1", "REP-2"),
                ordered.stream().map(Report::getReportCode).toList());
        assertTrue(queue.isEmpty());
        assertNull(queue.poll());
    }

    @Test
    void equalPriorityBreaksTiesByMostRecent() {
        ReportPriorityQueue queue = ReportPriorityQueue.from(List.of(
                report("A", Priority.HIGH, LocalDateTime.of(2025, 5, 1, 8, 0)),
                report("B", Priority.HIGH, LocalDateTime.of(2025, 5, 6, 8, 0)),
                report("C", Priority.HIGH, LocalDateTime.of(2025, 5, 3, 8, 0))));

        assertEquals(List.of("B", "C", "A"),
                queue.drainSorted().stream().map(Report::getReportCode).toList());
    }

    @Test
    void growsBeyondInitialCapacity() {
        ReportPriorityQueue queue = new ReportPriorityQueue();
        for (int i = 0; i < 500; i++) {
            queue.offer(report("R" + i, Priority.LOW, LocalDateTime.now()));
        }
        assertEquals(500, queue.size());
        assertEquals("R499", queue.peek().getReportCode());
    }

    // ------------------------------------------------------------------
    //  DSA #2 — HashMap equipment lookups
    // ------------------------------------------------------------------

    @Test
    void hashMapResolvesByIdCodeSerialAndRoom() {
        EquipmentIndex index = new EquipmentIndex();
        index.index(new Equipment(1L, "EQP-0001", "Computer Monitor", "Computer",
                "Acer / V196HQL", "MMT0AA001234", "Building A - 2nd Floor", "Computer Lab 1", "Damaged"));
        index.index(new Equipment(2L, "EQP-0002", "Projector", "Projector",
                "Epson / EB-X500", "X500CN2211", "Building B - Ground Floor", "AVR Room", "Under Repair"));

        assertEquals("Computer Monitor", index.findById(1L).getName());
        assertEquals("Projector", index.findByCode("eqp-0002").getName());
        assertEquals("Projector", index.findBySerialNumber("x500cn2211").getName());
        assertEquals(1, index.findByRoom("computer lab 1").size());
        assertEquals(0, index.findByRoom("Room 999").size());
        assertTrue(index.contains(2L));
        assertEquals(2, index.size());
        assertNull(index.findById(99L));
    }

    // ------------------------------------------------------------------
    //  DSA #3 — Trie autocomplete
    // ------------------------------------------------------------------

    @Test
    void trieReturnsPrefixCompletions() {
        Trie trie = new Trie();
        trie.insertAll(List.of("REP-2025-0012", "REP-2025-0011", "Printer", "Projector"));

        assertTrue(trie.contains("printer"));
        assertTrue(trie.hasPrefix("rep-2025"));
        assertEquals(List.of("REP-2025-0011", "REP-2025-0012"), trie.autocomplete("REP-2025"));
        assertEquals(List.of("Printer"), trie.autocomplete("prin"));
        assertEquals(List.of("Projector"), trie.autocomplete("proj"));
        assertEquals(List.of(), trie.autocomplete("zzz"));
        assertEquals(1, trie.autocomplete("rep-2025", 1).size());
        assertEquals(4, trie.size());
    }

    private static Report report(String code, Priority priority, LocalDateTime reportedAt) {
        Report report = new Report();
        report.setReportCode(code);
        report.setPriority(priority);
        report.setStatus(ReportStatus.PENDING);
        report.setReportedAt(reportedAt);
        return report;
    }
}
