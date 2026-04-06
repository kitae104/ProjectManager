package com.projectmanager.backend.ai.dto;

import com.projectmanager.backend.ai.domain.AIInsight;
import com.projectmanager.backend.ai.domain.AIInsightType;
import com.projectmanager.backend.ai.domain.RiskLevel;
import java.time.Instant;

public record AIInsightResponse(
        Long id,
        Long projectId,
        AIInsightType insightType,
        String content,
        RiskLevel riskLevel,
        Instant createdAt
) {
    public static AIInsightResponse from(AIInsight insight) {
        return new AIInsightResponse(
                insight.getId(),
                insight.getProject().getId(),
                insight.getInsightType(),
                insight.getContent(),
                insight.getRiskLevel(),
                insight.getCreatedAt()
        );
    }
}

