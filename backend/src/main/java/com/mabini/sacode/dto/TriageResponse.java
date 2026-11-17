package com.mabini.sacode.dto;

import java.util.List;

/**
 * Answer returned by POST /api/triage.
 *
 * <p>Shape matches what the front end's triage step expects, so the browser can
 * hand it straight to the assignment logic.
 */
public record TriageResponse(
        String issue,
        String skill,
        String priority,
        double confidence,
        List<String> signals,
        String summary,
        String engine,
        String model) {

    public static TriageResponse of(String issue,
                                    String skill,
                                    String priority,
                                    double confidence,
                                    List<String> signals,
                                    String summary,
                                    String model) {
        return new TriageResponse(issue, skill, priority, confidence, signals, summary, "model", model);
    }
}
