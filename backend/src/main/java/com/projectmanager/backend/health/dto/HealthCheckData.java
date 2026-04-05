package com.projectmanager.backend.health.dto;

import java.time.Instant;

public record HealthCheckData(String service, String status, Instant timestamp) {
}

