package com.mabini.sacode.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mabini.sacode.dto.TriageRequest;
import com.mabini.sacode.dto.TriageResponse;
import com.mabini.sacode.service.TriageService;

/**
 * AI triage — replaces the manual "assign a staff member" step.
 *
 * <p>The report photo is read by a local Gemma 4 E2B model through Ollama, which
 * decides the issue, the trade needed and the urgency. The browser then routes
 * the job to the technician whose specialty and workload fit best.
 *
 * <p>Fails with 502 when Ollama is down, so the UI can say why instead of
 * pretending the report was triaged.
 */
@RestController
@RequestMapping("/api/triage")
public class TriageController {

    private final TriageService triage;

    public TriageController(TriageService triage) {
        this.triage = triage;
    }

    @PostMapping
    public TriageResponse triage(@RequestBody TriageRequest request) {
        return triage.triage(request);
    }
}
