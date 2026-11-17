package com.mabini.sacode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload for {@code PATCH /api/reports/{id}/assign}.
 *
 * <p>{@code assignedTo} is the technician by name. Pass an empty string to
 * unassign the report — the backend clears it and appends a history row.
 */
public class ReportAssignedPatch {

    @NotBlank(message = "assignedTo is required")
    @Size(max = 60, message = "assignedTo is too long")
    private String assignedTo;

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }
}
