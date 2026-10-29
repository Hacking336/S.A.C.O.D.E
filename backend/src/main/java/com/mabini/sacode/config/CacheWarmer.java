package com.mabini.sacode.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.mabini.sacode.service.EquipmentService;
import com.mabini.sacode.service.ReportService;

/**
 * Builds the HashMap index and the Trie once the datasource is live, so
 * the first request does not pay the warm-up cost.
 */
@Component
public class CacheWarmer {

    private final EquipmentService equipmentService;
    private final ReportService reportService;

    public CacheWarmer(EquipmentService equipmentService, ReportService reportService) {
        this.equipmentService = equipmentService;
        this.reportService = reportService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warmCaches() {
        try {
            equipmentService.warmCache();
            reportService.warmCache();
        } catch (RuntimeException ex) {
            // Database not reachable yet (e.g. local startup before Supabase
            // credentials are set). The services lazily rebuild on first use.
            System.err.println("[S.A.C.O.D.E.] Cache warm-up skipped: " + ex.getMessage());
        }
    }
}
