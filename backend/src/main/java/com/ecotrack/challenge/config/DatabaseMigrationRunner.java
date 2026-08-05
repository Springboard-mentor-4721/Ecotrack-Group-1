package com.ecotrack.challenge.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void runMigration() {
        jdbcTemplate.update("UPDATE challenges SET challenge_evaluation_type='ACHIEVEMENT' WHERE challenge_evaluation_type IS NULL");
    }
}
