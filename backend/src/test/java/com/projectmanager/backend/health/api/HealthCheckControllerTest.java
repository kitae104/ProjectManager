package com.projectmanager.backend.health.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.health.dto.HealthCheckData;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class HealthCheckControllerTest {

    @Test
    void shouldReturnHealthCheckPayload() {
        HealthCheckController controller = new HealthCheckController();

        ResponseEntity<ApiResponse<HealthCheckData>> response = controller.getHealth();
        ApiResponse<HealthCheckData> body = response.getBody();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(body);
        assertTrue(body.success());
        assertNotNull(body.data());
        assertEquals("project-manager-backend", body.data().service());
        assertEquals("UP", body.data().status());
    }
}

