package com.mabini.sacode.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mabini.sacode.dsa.EquipmentIndex;

/**
 * Wires the hand-written data structures into the Spring context.
 * Both {@code ReportService} and {@code EquipmentService} inject the same
 * singleton {@link EquipmentIndex}, so a lookup is never duplicated.
 */
@Configuration
public class DsaConfig {

    @Bean
    public EquipmentIndex equipmentIndex() {
        return new EquipmentIndex();
    }
}
