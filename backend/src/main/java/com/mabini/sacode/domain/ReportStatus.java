package com.mabini.sacode.domain;

public enum ReportStatus {
    PENDING("PENDING"),
    IN_PROGRESS("IN PROGRESS"),
    RESOLVED("RESOLVED"),
    CANCELLED("CANCELLED");

    private final String label;

    ReportStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ReportStatus fromLabel(String raw) {
        if (raw == null) {
            return PENDING;
        }
        String normalised = raw.trim().toUpperCase().replace(' ', '_');
        try {
            return valueOf(normalised);
        } catch (IllegalArgumentException ex) {
            return PENDING;
        }
    }
}
