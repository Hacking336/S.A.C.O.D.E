package com.mabini.sacode.domain;

/**
 * Damage severity, ordered from most to least urgent.
 * The higher {@link #getRank()}, the more urgent the report.
 */
public enum Priority {
    CRITICAL("Critical", 4),
    HIGH("High", 3),
    MEDIUM("Medium", 2),
    LOW("Low", 1);

    private final String label;
    private final int rank;

    Priority(String label, int rank) {
        this.label = label;
        this.rank = rank;
    }

    public String getLabel() {
        return label;
    }

    /** Higher rank == more urgent == pops first from the max heap. */
    public int getRank() {
        return rank;
    }

    /** Accepts "Critical", "critical" or "CRITICAL". */
    public static Priority fromLabel(String raw) {
        if (raw == null) {
            return LOW;
        }
        String normalised = raw.trim().toUpperCase().replace(' ', '_');
        try {
            return valueOf(normalised);
        } catch (IllegalArgumentException ex) {
            return LOW;
        }
    }
}
