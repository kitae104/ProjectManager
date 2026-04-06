import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type { AIInsight } from '../types/aiInsight'

export async function generateProjectSummary(projectId: number) {
  const response = await httpClient.post<ApiResponse<AIInsight>>(
    `/api/projects/${projectId}/ai/summary`,
  )
  return response.data
}

export async function generateMeetingSummary(meetingNoteId: number) {
  const response = await httpClient.post<ApiResponse<AIInsight>>(
    `/api/meeting-notes/${meetingNoteId}/ai/summary`,
  )
  return response.data
}

export async function generateNextActions(projectId: number) {
  const response = await httpClient.post<ApiResponse<AIInsight>>(
    `/api/projects/${projectId}/ai/next-actions`,
  )
  return response.data
}

export async function generateRiskAnalysis(projectId: number) {
  const response = await httpClient.post<ApiResponse<AIInsight>>(
    `/api/projects/${projectId}/ai/risk-analysis`,
  )
  return response.data
}

export async function generateWeeklyReport(projectId: number) {
  const response = await httpClient.post<ApiResponse<AIInsight>>(
    `/api/projects/${projectId}/ai/weekly-report`,
  )
  return response.data
}

