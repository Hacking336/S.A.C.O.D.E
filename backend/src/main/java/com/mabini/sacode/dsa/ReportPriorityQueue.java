package com.mabini.sacode.dsa;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.mabini.sacode.domain.Priority;
import com.mabini.sacode.domain.Report;

/**
 * ==================================================================
 *  DSA #1 — PRIORITY QUEUE (MAX HEAP) for damage-report urgency
 * ==================================================================
 *
 * A hand-written binary max heap that keeps damage reports ordered by
 * severity, so the Admin dashboard always receives the most urgent
 * issues first.
 *
 * Ordering (highest first):
 *      Critical  >  High  >  Medium  >  Low
 * Ties are broken by the most recently reported report.
 *
 * Complexities:
 *   offer()        O(log n)   — insert a new report
 *   peek()         O(1)       — most urgent report without removing it
 *   poll()         O(log n)   — extract the most urgent report
 *   drainSorted()  O(n log n) — pop everything already in urgency order
 *
 * Java's java.util.PriorityQueue is a MIN-heap by default, so the heap
 * is implemented here explicitly (parent always outranks its children).
 */
public class ReportPriorityQueue {

    private static final int DEFAULT_CAPACITY = 16;

    private Report[] heap;
    private int size;

    public ReportPriorityQueue() {
        this(DEFAULT_CAPACITY);
    }

    public ReportPriorityQueue(int initialCapacity) {
        int capacity = Math.max(initialCapacity, DEFAULT_CAPACITY);
        this.heap = new Report[capacity];
        this.size = 0;
    }

    /** O(log n) — insert, then bubble the report up to its ranked position. */
    public void offer(Report report) {
        if (report == null) {
            return;
        }
        ensureCapacity();
        heap[size] = report;
        siftUp(size);
        size++;
    }

    /** O(1) — the most urgent report currently queued. */
    public Report peek() {
        return isEmpty() ? null : heap[0];
    }

    /** O(log n) — remove and return the most urgent report. */
    public Report poll() {
        if (isEmpty()) {
            return null;
        }
        Report mostUrgent = heap[0];
        size--;
        Report last = heap[size];
        heap[size] = null;
        if (!isEmpty()) {
            heap[0] = last;
            siftDown(0);
        }
        return mostUrgent;
    }

    /** O(n log n) — drain the queue into a fully urgency-sorted list. */
    public List<Report> drainSorted() {
        List<Report> sorted = new ArrayList<>(size);
        while (!isEmpty()) {
            sorted.add(poll());
        }
        return sorted;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public void clear() {
        for (int i = 0; i < size; i++) {
            heap[i] = null;
        }
        size = 0;
    }

    // -----------------------------------------------------------------
    //  Heap internals
    // -----------------------------------------------------------------

    private void siftUp(int index) {
        int child = index;
        while (child > 0) {
            int parent = (child - 1) >>> 1;
            if (compare(heap[child], heap[parent]) <= 0) {
                break;
            }
            swap(child, parent);
            child = parent;
        }
    }

    private void siftDown(int index) {
        int parent = index;
        int half = size >>> 1;
        while (parent < half) {
            int child = (parent << 1) + 1;      // left child
            int right = child + 1;
            if (right < size && compare(heap[right], heap[child]) > 0) {
                child = right;                   // pick the stronger child
            }
            if (compare(heap[parent], heap[child]) >= 0) {
                break;
            }
            swap(parent, child);
            parent = child;
        }
    }

    /** Positive when {@code a} is MORE urgent than {@code b}. */
    private int compare(Report a, Report b) {
        int bySeverity = a.getPriority().getRank() - b.getPriority().getRank();
        if (bySeverity != 0) {
            return bySeverity;
        }
        LocalDateTime left = a.getReportedAt();
        LocalDateTime right = b.getReportedAt();
        if (left == null || right == null) {
            return 0;
        }
        return left.compareTo(right); // most recent first
    }

    private void swap(int i, int j) {
        Report tmp = heap[i];
        heap[i] = heap[j];
        heap[j] = tmp;
    }

    private void ensureCapacity() {
        if (size < heap.length) {
            return;
        }
        Report[] grown = new Report[heap.length * 2];
        System.arraycopy(heap, 0, grown, 0, heap.length);
        heap = grown;
    }

    /** Convenience factory used by the report service. */
    public static ReportPriorityQueue from(Iterable<Report> reports) {
        ReportPriorityQueue queue = new ReportPriorityQueue();
        if (reports != null) {
            for (Report report : reports) {
                queue.offer(report);
            }
        }
        return queue;
    }

    /** Highest severity present — handy for the dashboard "Critical" stat. */
    public Priority highestPriority() {
        Report top = peek();
        return top == null ? Priority.LOW : top.getPriority();
    }
}
