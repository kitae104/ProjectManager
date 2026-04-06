import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  generateMeetingSummary,
  generateNextActions,
  generateProjectSummary,
  generateRiskAnalysis,
  generateWeeklyReport,
} from '../features/ai/api/aiApi'
import type { AIInsight } from '../features/ai/types/aiInsight'
import { getProjectMeetingNotes } from '../features/meetings/api/meetingNotesApi'

type InsightState = {
  projectSummary: AIInsight | null
  riskAnalysis: AIInsight | null
  nextActions: AIInsight | null
  weeklyReport: AIInsight | null
  meetingSummary: AIInsight | null
}

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function ProjectAiPage() {
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)
  const [selectedMeetingNoteId, setSelectedMeetingNoteId] = useState<number | null>(null)
  const [insights, setInsights] = useState<InsightState>({
    projectSummary: null,
    riskAnalysis: null,
    nextActions: null,
    weeklyReport: null,
    meetingSummary: null,
  })

  const meetingNotesQuery = useQuery({
    queryKey: ['meeting-notes', numericProjectId],
    queryFn: () => getProjectMeetingNotes(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const projectSummaryMutation = useMutation({
    mutationFn: () => generateProjectSummary(numericProjectId),
    onSuccess: (response) =>
      setInsights((prev) => ({ ...prev, projectSummary: response.data })),
  })

  const riskAnalysisMutation = useMutation({
    mutationFn: () => generateRiskAnalysis(numericProjectId),
    onSuccess: (response) =>
      setInsights((prev) => ({ ...prev, riskAnalysis: response.data })),
  })

  const nextActionsMutation = useMutation({
    mutationFn: () => generateNextActions(numericProjectId),
    onSuccess: (response) =>
      setInsights((prev) => ({ ...prev, nextActions: response.data })),
  })

  const weeklyReportMutation = useMutation({
    mutationFn: () => generateWeeklyReport(numericProjectId),
    onSuccess: (response) =>
      setInsights((prev) => ({ ...prev, weeklyReport: response.data })),
  })

  const meetingSummaryMutation = useMutation({
    mutationFn: () => {
      if (!selectedMeetingNoteId) {
        throw new Error('요약할 회의록을 먼저 선택해 주세요.')
      }
      return generateMeetingSummary(selectedMeetingNoteId)
    },
    onSuccess: (response) =>
      setInsights((prev) => ({ ...prev, meetingSummary: response.data })),
  })

  if (!Number.isFinite(numericProjectId)) {
    return <p className="text-sm text-red-600">유효하지 않은 프로젝트 ID입니다.</p>
  }

  const meetingNotes = meetingNotesQuery.data?.data ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">AI 인사이트</h2>
        <p className="mt-1 text-sm text-slate-600">
          프로젝트 요약, 위험 분석, 다음 액션 추천, 주간 보고서 초안을 생성합니다.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InsightCard
          title="프로젝트 요약"
          description="현재 프로젝트 상태와 핵심 이슈, 다음 작업을 요약합니다."
          buttonLabel={projectSummaryMutation.isPending ? '생성 중...' : '요약 생성'}
          onGenerate={() => projectSummaryMutation.mutate()}
          content={insights.projectSummary?.content ?? null}
          generatedAt={insights.projectSummary?.createdAt ?? null}
        />
        <InsightCard
          title="위험 분석"
          description="지연 위험도를 분석하고 대응 방안을 제안합니다."
          buttonLabel={riskAnalysisMutation.isPending ? '생성 중...' : '위험 분석 생성'}
          onGenerate={() => riskAnalysisMutation.mutate()}
          content={insights.riskAnalysis?.content ?? null}
          generatedAt={insights.riskAnalysis?.createdAt ?? null}
          riskLevel={insights.riskAnalysis?.riskLevel ?? null}
        />
        <InsightCard
          title="다음 액션 추천"
          description="우선순위와 마감일을 기준으로 다음 작업을 추천합니다."
          buttonLabel={nextActionsMutation.isPending ? '생성 중...' : '추천 생성'}
          onGenerate={() => nextActionsMutation.mutate()}
          content={insights.nextActions?.content ?? null}
          generatedAt={insights.nextActions?.createdAt ?? null}
        />
        <InsightCard
          title="주간 보고서 초안"
          description="완료/진행/이슈/다음 계획을 포함한 주간 보고 초안을 생성합니다."
          buttonLabel={weeklyReportMutation.isPending ? '생성 중...' : '초안 생성'}
          onGenerate={() => weeklyReportMutation.mutate()}
          content={insights.weeklyReport?.content ?? null}
          generatedAt={insights.weeklyReport?.createdAt ?? null}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">회의록 요약</h3>
        <p className="mt-1 text-sm text-slate-600">
          특정 회의록을 선택해 3줄 요약과 결정/액션 내용을 생성합니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            className="min-w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={selectedMeetingNoteId ?? ''}
            onChange={(event) =>
              setSelectedMeetingNoteId(
                event.target.value ? Number(event.target.value) : null,
              )
            }
          >
            <option value="">회의록 선택</option>
            {meetingNotes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => meetingSummaryMutation.mutate()}
            disabled={meetingSummaryMutation.isPending}
          >
            {meetingSummaryMutation.isPending ? '생성 중...' : '회의록 요약 생성'}
          </button>
        </div>
        {insights.meetingSummary && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              생성 시각:{' '}
              {dateTimeFormatter.format(new Date(insights.meetingSummary.createdAt))}
            </p>
            <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
              {insights.meetingSummary.content}
            </pre>
          </div>
        )}
      </div>

      {(projectSummaryMutation.isError ||
        riskAnalysisMutation.isError ||
        nextActionsMutation.isError ||
        weeklyReportMutation.isError ||
        meetingSummaryMutation.isError ||
        meetingNotesQuery.isError) && (
        <p className="text-sm text-red-600">
          AI 인사이트 생성 중 오류가 발생했습니다. 요청 값과 인증 상태를 확인해 주세요.
        </p>
      )}
    </section>
  )
}

function InsightCard({
  title,
  description,
  buttonLabel,
  onGenerate,
  content,
  generatedAt,
  riskLevel,
}: {
  title: string
  description: string
  buttonLabel: string
  onGenerate: () => void
  content: string | null
  generatedAt: string | null
  riskLevel?: string | null
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <button
        type="button"
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        onClick={onGenerate}
      >
        {buttonLabel}
      </button>

      {content && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {generatedAt && (
            <p className="text-xs text-slate-500">
              생성 시각: {dateTimeFormatter.format(new Date(generatedAt))}
            </p>
          )}
          {riskLevel && (
            <p className="mt-1 text-xs font-semibold text-orange-700">위험도: {riskLevel}</p>
          )}
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {content}
          </pre>
        </div>
      )}
    </article>
  )
}

