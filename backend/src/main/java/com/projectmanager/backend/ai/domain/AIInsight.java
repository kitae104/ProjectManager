package com.projectmanager.backend.ai.domain;

import com.projectmanager.backend.project.domain.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Entity
@Table(name = "ai_insights")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AIInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "insight_type", nullable = false, length = 40)
    private AIInsightType insightType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", length = 20)
    private RiskLevel riskLevel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private AIInsight(
            Project project,
            AIInsightType insightType,
            String content,
            RiskLevel riskLevel
    ) {
        this.project = project;
        this.insightType = insightType;
        this.content = content;
        this.riskLevel = riskLevel;
    }

    public static AIInsight create(
            Project project,
            AIInsightType insightType,
            String content,
            RiskLevel riskLevel
    ) {
        return new AIInsight(project, insightType, content, riskLevel);
    }
}

