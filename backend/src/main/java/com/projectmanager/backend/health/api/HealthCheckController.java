package com.projectmanager.backend.health.api;

import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.health.dto.HealthCheckData;
import java.time.Instant;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @GetMapping
    public ResponseEntity<ApiResponse<HealthCheckData>> getHealth() {
        HealthCheckData payload = new HealthCheckData(
                "project-manager-backend",
                "UP",
                Instant.now()
        );

        return ResponseEntity.ok(ApiResponse.success("헬스체크가 완료되었습니다.", payload));
    }
}

