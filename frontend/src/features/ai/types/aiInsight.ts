export type AIInsightType =
  | 'PROJECT_SUMMARY'
  | 'MEETING_SUMMARY'
  | 'NEXT_ACTIONS'
  | 'RISK_ANALYSIS'
  | 'WEEKLY_REPORT'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type AIInsight = {
  id: number
  projectId: number
  insightType: AIInsightType
  content: string
  riskLevel: RiskLevel | null
  createdAt: string
}

