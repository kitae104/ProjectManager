import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import {
  createMeetingNote,
  deleteMeetingNote,
  getProjectMeetingNotes,
  updateMeetingNote,
} from '../features/meetings/api/meetingNotesApi'
import type {
  MeetingNote,
  MeetingNoteUpdateRequest,
} from '../features/meetings/types/meetingNote'
import { getProject } from '../features/projects/api/projectsApi'

type MeetingFormState = {
  title: string
  meetingDateTime: string
  attendees: string
  content: string
  summary: string
}

const defaultFormState: MeetingFormState = {
  title: '',
  meetingDateTime: '',
  attendees: '',
  content: '',
  summary: '',
}

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function toDateTimeLocalValue(value: string | null) {
  return value ? value.slice(0, 16) : ''
}

export function ProjectMeetingsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)
  const currentUser = useAuthStore((state) => state.user)

  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null)
  const [form, setForm] = useState<MeetingFormState>(defaultFormState)

  const meetingsQuery = useQuery({
    queryKey: ['meeting-notes', numericProjectId],
    queryFn: () => getProjectMeetingNotes(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const projectQuery = useQuery({
    queryKey: ['project', numericProjectId],
    queryFn: () => getProject(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const isProjectLeader =
    currentUser?.role === 'LEADER' &&
    projectQuery.data?.data.leaderId != null &&
    projectQuery.data.data.leaderId === currentUser.id

  const selectedMeeting = useMemo(
    () => meetingsQuery.data?.data.find((note) => note.id === selectedMeetingId) ?? null,
    [meetingsQuery.data, selectedMeetingId],
  )

  const createMutation = useMutation({
    mutationFn: () => {
      if (!isProjectLeader) {
        throw new Error('회의록 작성 권한이 없습니다.')
      }
      return createMeetingNote(numericProjectId, {
        title: form.title,
        meetingDateTime: form.meetingDateTime,
        attendees: form.attendees,
        content: form.content,
        summary: form.summary || null,
      })
    },
    onSuccess: () => {
      setForm(defaultFormState)
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', numericProjectId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedMeeting) {
        throw new Error('선택된 회의록이 없습니다.')
      }
      if (!isProjectLeader) {
        throw new Error('회의록 수정 권한이 없습니다.')
      }
      const payload: MeetingNoteUpdateRequest = {
        title: form.title,
        meetingDateTime: form.meetingDateTime,
        attendees: form.attendees,
        content: form.content,
        summary: form.summary || null,
      }
      return updateMeetingNote(selectedMeeting.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', numericProjectId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (meetingNoteId: number) => {
      if (!isProjectLeader) {
        throw new Error('회의록 삭제 권한이 없습니다.')
      }
      return deleteMeetingNote(meetingNoteId)
    },
    onSuccess: () => {
      setSelectedMeetingId(null)
      setForm(defaultFormState)
      queryClient.invalidateQueries({ queryKey: ['meeting-notes', numericProjectId] })
    },
  })

  function selectMeeting(note: MeetingNote) {
    setSelectedMeetingId(note.id)
    setForm({
      title: note.title,
      meetingDateTime: toDateTimeLocalValue(note.meetingDateTime),
      attendees: note.attendees,
      content: note.content,
      summary: note.summary ?? '',
    })
  }

  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(`/projects/${numericProjectId}`)
  }

  if (!Number.isFinite(numericProjectId)) {
    return <p className="text-sm text-red-600">유효하지 않은 프로젝트 ID입니다.</p>
  }

  const meetingNotes = meetingsQuery.data?.data ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">회의록 관리</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isProjectLeader
                ? '회의 내용을 기록하고 핵심 요약과 액션 아이템을 관리합니다.'
                : '관리자/팀원은 회의록을 조회할 수 있습니다.'}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={handleGoBack}
          >
            이전 화면
          </button>
        </div>
      </div>

      {isProjectLeader && (
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedMeeting) {
              updateMutation.mutate()
              return
            }
            createMutation.mutate()
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">
            {selectedMeeting ? '회의록 수정' : '회의록 작성'}
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="meeting-title" className="text-xs font-medium text-slate-700">
                회의 제목
              </label>
              <input
                id="meeting-title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="회의 제목"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="meeting-datetime" className="text-xs font-medium text-slate-700">
                회의 일시
              </label>
              <input
                id="meeting-datetime"
                type="datetime-local"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.meetingDateTime}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, meetingDateTime: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="meeting-attendees" className="text-xs font-medium text-slate-700">
                참석자
              </label>
              <input
                id="meeting-attendees"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="참석자 (쉼표로 구분)"
                value={form.attendees}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, attendees: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="meeting-content" className="text-xs font-medium text-slate-700">
                주요 논의 내용
              </label>
              <textarea
                id="meeting-content"
                className="min-h-36 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="주요 논의 내용"
                value={form.content}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, content: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="meeting-summary" className="text-xs font-medium text-slate-700">
                요약
              </label>
              <textarea
                id="meeting-summary"
                className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="요약 (선택)"
                value={form.summary}
                onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {selectedMeeting
                ? updateMutation.isPending
                  ? '수정 중...'
                  : '회의록 수정'
                : createMutation.isPending
                  ? '작성 중...'
                  : '회의록 작성'}
            </button>
            {selectedMeeting && (
              <>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setSelectedMeetingId(null)
                    setForm(defaultFormState)
                  }}
                >
                  선택 해제
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={() => deleteMutation.mutate(selectedMeeting.id)}
                >
                  {deleteMutation.isPending ? '삭제 중...' : '회의록 삭제'}
                </button>
              </>
            )}
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">회의록 목록</h3>
        <div className="mt-4 space-y-2">
          {meetingNotes.map((note) => (
            <article
              key={note.id}
              onClick={() => {
                if (isProjectLeader) {
                  selectMeeting(note)
                }
              }}
              className={`w-full rounded-lg border border-slate-200 px-3 py-3 text-left ${
                isProjectLeader ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">{note.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                회의일시: {dateTimeFormatter.format(new Date(note.meetingDateTime))}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                작성자: {note.authorName} · 참석자: {note.attendees}
              </p>
            </article>
          ))}
          {meetingNotes.length === 0 && (
            <p className="text-sm text-slate-500">등록된 회의록이 없습니다.</p>
          )}
        </div>
      </div>

      {meetingsQuery.isError && (
        <p className="text-sm text-red-600">회의록 데이터를 불러오지 못했습니다.</p>
      )}
    </section>
  )
}
