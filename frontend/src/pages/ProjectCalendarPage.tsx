import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  createMilestone,
  deleteMilestone,
  getProjectMilestones,
  updateMilestone,
} from '../features/milestones/api/milestonesApi'
import type {
  Milestone,
  MilestoneStatus,
  MilestoneUpdateRequest,
} from '../features/milestones/types/milestone'
import {
  createSchedule,
  deleteSchedule,
  getProjectSchedules,
  updateSchedule,
} from '../features/schedules/api/schedulesApi'
import type {
  Schedule,
  ScheduleType,
  ScheduleUpdateRequest,
} from '../features/schedules/types/schedule'

type CalendarViewMode = 'WEEK' | 'MONTH'

type MilestoneFormState = {
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
}

type ScheduleFormState = {
  title: string
  description: string
  scheduleType: ScheduleType
  startDateTime: string
  endDateTime: string
  location: string
}

const milestoneStatusOptions: MilestoneStatus[] = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'DELAYED',
]

const scheduleTypeOptions: ScheduleType[] = [
  'MEETING',
  'PRESENTATION',
  'SUBMISSION',
  'DEMO',
  'MENTORING',
  'INTERNAL_REVIEW',
]

const defaultMilestoneForm: MilestoneFormState = {
  title: '',
  description: '',
  dueDate: '',
  status: 'PLANNED',
}

const defaultScheduleForm: ScheduleFormState = {
  title: '',
  description: '',
  scheduleType: 'MEETING',
  startDateTime: '',
  endDateTime: '',
  location: '',
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function parseDate(value: string): Date | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfWeek(date: Date) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + 6)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function toDateTimeLocalValue(value: string | null) {
  return value ? value.slice(0, 16) : ''
}

export function ProjectCalendarPage() {
  const queryClient = useQueryClient()
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)

  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH')
  const [referenceDate, setReferenceDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [milestoneForm, setMilestoneForm] =
    useState<MilestoneFormState>(defaultMilestoneForm)
  const [scheduleForm, setScheduleForm] =
    useState<ScheduleFormState>(defaultScheduleForm)

  const milestonesQuery = useQuery({
    queryKey: ['milestones', numericProjectId],
    queryFn: () => getProjectMilestones(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const schedulesQuery = useQuery({
    queryKey: ['schedules', numericProjectId],
    queryFn: () => getProjectSchedules(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const selectedMilestone = useMemo(
    () =>
      milestonesQuery.data?.data.find((milestone) => milestone.id === selectedMilestoneId) ??
      null,
    [milestonesQuery.data, selectedMilestoneId],
  )

  const selectedSchedule = useMemo(
    () =>
      schedulesQuery.data?.data.find((schedule) => schedule.id === selectedScheduleId) ?? null,
    [schedulesQuery.data, selectedScheduleId],
  )

  const createMilestoneMutation = useMutation({
    mutationFn: () =>
      createMilestone(numericProjectId, {
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate,
        status: milestoneForm.status,
      }),
    onSuccess: () => {
      setMilestoneForm(defaultMilestoneForm)
      queryClient.invalidateQueries({ queryKey: ['milestones', numericProjectId] })
    },
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: () => {
      if (!selectedMilestone) {
        throw new Error('선택된 마일스톤이 없습니다.')
      }
      const payload: MilestoneUpdateRequest = {
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate,
        status: milestoneForm.status,
      }
      return updateMilestone(selectedMilestone.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', numericProjectId] })
    },
  })

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: number) => deleteMilestone(milestoneId),
    onSuccess: () => {
      setSelectedMilestoneId(null)
      setMilestoneForm(defaultMilestoneForm)
      queryClient.invalidateQueries({ queryKey: ['milestones', numericProjectId] })
    },
  })

  const createScheduleMutation = useMutation({
    mutationFn: () =>
      createSchedule(numericProjectId, {
        title: scheduleForm.title,
        description: scheduleForm.description,
        scheduleType: scheduleForm.scheduleType,
        startDateTime: scheduleForm.startDateTime,
        endDateTime: scheduleForm.endDateTime,
        location: scheduleForm.location || null,
      }),
    onSuccess: () => {
      setScheduleForm(defaultScheduleForm)
      queryClient.invalidateQueries({ queryKey: ['schedules', numericProjectId] })
    },
  })

  const updateScheduleMutation = useMutation({
    mutationFn: () => {
      if (!selectedSchedule) {
        throw new Error('선택된 일정이 없습니다.')
      }
      const payload: ScheduleUpdateRequest = {
        title: scheduleForm.title,
        description: scheduleForm.description,
        scheduleType: scheduleForm.scheduleType,
        startDateTime: scheduleForm.startDateTime,
        endDateTime: scheduleForm.endDateTime,
        location: scheduleForm.location || null,
      }
      return updateSchedule(selectedSchedule.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', numericProjectId] })
    },
  })

  const deleteScheduleMutation = useMutation({
    mutationFn: (scheduleId: number) => deleteSchedule(scheduleId),
    onSuccess: () => {
      setSelectedScheduleId(null)
      setScheduleForm(defaultScheduleForm)
      queryClient.invalidateQueries({ queryKey: ['schedules', numericProjectId] })
    },
  })

  const milestones = milestonesQuery.data?.data ?? []
  const schedules = schedulesQuery.data?.data ?? []

  const referenceDateObject = useMemo(() => {
    const parsed = parseDate(`${referenceDate}T00:00:00`)
    return parsed ?? new Date()
  }, [referenceDate])

  const filteredMilestones = useMemo(() => {
    const weekStart = startOfWeek(referenceDateObject)
    const weekEnd = endOfWeek(weekStart)
    return milestones
      .filter((milestone) => {
        const dueDate = parseDate(`${milestone.dueDate}T00:00:00`)
        if (!dueDate) {
          return false
        }
        if (viewMode === 'MONTH') {
          return (
            dueDate.getFullYear() === referenceDateObject.getFullYear() &&
            dueDate.getMonth() === referenceDateObject.getMonth()
          )
        }
        return dueDate >= weekStart && dueDate <= weekEnd
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [milestones, referenceDateObject, viewMode])

  const filteredSchedules = useMemo(() => {
    const weekStart = startOfWeek(referenceDateObject)
    const weekEnd = endOfWeek(weekStart)
    return schedules
      .filter((schedule) => {
        const startDateTime = parseDate(schedule.startDateTime)
        if (!startDateTime) {
          return false
        }
        if (viewMode === 'MONTH') {
          return (
            startDateTime.getFullYear() === referenceDateObject.getFullYear() &&
            startDateTime.getMonth() === referenceDateObject.getMonth()
          )
        }
        return startDateTime >= weekStart && startDateTime <= weekEnd
      })
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
  }, [schedules, referenceDateObject, viewMode])

  function selectMilestone(milestone: Milestone) {
    setSelectedMilestoneId(milestone.id)
    setMilestoneForm({
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      status: milestone.status,
    })
  }

  function selectSchedule(schedule: Schedule) {
    setSelectedScheduleId(schedule.id)
    setScheduleForm({
      title: schedule.title,
      description: schedule.description,
      scheduleType: schedule.scheduleType,
      startDateTime: toDateTimeLocalValue(schedule.startDateTime),
      endDateTime: toDateTimeLocalValue(schedule.endDateTime),
      location: schedule.location ?? '',
    })
  }

  if (!Number.isFinite(numericProjectId)) {
    return <p className="text-sm text-red-600">유효하지 않은 프로젝트 ID입니다.</p>
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">프로젝트 캘린더</h2>
        <p className="mt-1 text-sm text-slate-600">
          마일스톤과 주요 일정을 주간/월간 기준으로 관리합니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              viewMode === 'WEEK'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            onClick={() => setViewMode('WEEK')}
          >
            주간 보기
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              viewMode === 'MONTH'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            onClick={() => setViewMode('MONTH')}
          >
            월간 보기
          </button>
          <input
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={referenceDate}
            onChange={(event) => setReferenceDate(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedMilestone) {
              updateMilestoneMutation.mutate()
              return
            }
            createMilestoneMutation.mutate()
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">
            {selectedMilestone ? '마일스톤 수정' : '마일스톤 생성'}
          </h3>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="마일스톤 제목"
              value={milestoneForm.title}
              onChange={(event) =>
                setMilestoneForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
            <textarea
              className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="마일스톤 설명"
              value={milestoneForm.description}
              onChange={(event) =>
                setMilestoneForm((prev) => ({ ...prev, description: event.target.value }))
              }
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={milestoneForm.dueDate}
                onChange={(event) =>
                  setMilestoneForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
                required
              />
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={milestoneForm.status}
                onChange={(event) =>
                  setMilestoneForm((prev) => ({
                    ...prev,
                    status: event.target.value as MilestoneStatus,
                  }))
                }
              >
                {milestoneStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {selectedMilestone
                  ? updateMilestoneMutation.isPending
                    ? '수정 중...'
                    : '마일스톤 수정'
                  : createMilestoneMutation.isPending
                    ? '생성 중...'
                    : '마일스톤 생성'}
              </button>
              {selectedMilestone && (
                <>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setSelectedMilestoneId(null)
                      setMilestoneForm(defaultMilestoneForm)
                    }}
                  >
                    선택 해제
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => deleteMilestoneMutation.mutate(selectedMilestone.id)}
                  >
                    {deleteMilestoneMutation.isPending ? '삭제 중...' : '마일스톤 삭제'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedSchedule) {
              updateScheduleMutation.mutate()
              return
            }
            createScheduleMutation.mutate()
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">
            {selectedSchedule ? '일정 수정' : '일정 생성'}
          </h3>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="일정 제목"
              value={scheduleForm.title}
              onChange={(event) =>
                setScheduleForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
            <textarea
              className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="일정 설명"
              value={scheduleForm.description}
              onChange={(event) =>
                setScheduleForm((prev) => ({ ...prev, description: event.target.value }))
              }
              required
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={scheduleForm.scheduleType}
              onChange={(event) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  scheduleType: event.target.value as ScheduleType,
                }))
              }
            >
              {scheduleTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="datetime-local"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={scheduleForm.startDateTime}
                onChange={(event) =>
                  setScheduleForm((prev) => ({ ...prev, startDateTime: event.target.value }))
                }
                required
              />
              <input
                type="datetime-local"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={scheduleForm.endDateTime}
                onChange={(event) =>
                  setScheduleForm((prev) => ({ ...prev, endDateTime: event.target.value }))
                }
                required
              />
            </div>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="장소 (선택)"
              value={scheduleForm.location}
              onChange={(event) =>
                setScheduleForm((prev) => ({ ...prev, location: event.target.value }))
              }
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {selectedSchedule
                  ? updateScheduleMutation.isPending
                    ? '수정 중...'
                    : '일정 수정'
                  : createScheduleMutation.isPending
                    ? '생성 중...'
                    : '일정 생성'}
              </button>
              {selectedSchedule && (
                <>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setSelectedScheduleId(null)
                      setScheduleForm(defaultScheduleForm)
                    }}
                  >
                    선택 해제
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => deleteScheduleMutation.mutate(selectedSchedule.id)}
                  >
                    {deleteScheduleMutation.isPending ? '삭제 중...' : '일정 삭제'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {viewMode === 'MONTH' ? '월간 마일스톤' : '주간 마일스톤'}
          </h3>
          <div className="mt-4 space-y-2">
            {filteredMilestones.map((milestone) => (
              <button
                key={milestone.id}
                type="button"
                onClick={() => selectMilestone(milestone)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">{milestone.title}</p>
                <p className="mt-1 text-xs text-slate-500">{milestone.description}</p>
                <p className="mt-1 text-xs text-slate-600">
                  마감일: {dateFormatter.format(new Date(`${milestone.dueDate}T00:00:00`))} · 상태:{' '}
                  {milestone.status}
                </p>
              </button>
            ))}
            {filteredMilestones.length === 0 && (
              <p className="text-sm text-slate-500">표시할 마일스톤이 없습니다.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {viewMode === 'MONTH' ? '월간 주요 일정' : '주간 주요 일정'}
          </h3>
          <div className="mt-4 space-y-2">
            {filteredSchedules.map((schedule) => (
              <button
                key={schedule.id}
                type="button"
                onClick={() => selectSchedule(schedule)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">{schedule.title}</p>
                <p className="mt-1 text-xs text-slate-500">{schedule.description}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {schedule.scheduleType} · {dateTimeFormatter.format(new Date(schedule.startDateTime))}
                  {' ~ '}
                  {dateTimeFormatter.format(new Date(schedule.endDateTime))}
                </p>
                <p className="mt-1 text-xs text-slate-600">장소: {schedule.location ?? '-'}</p>
              </button>
            ))}
            {filteredSchedules.length === 0 && (
              <p className="text-sm text-slate-500">표시할 일정이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {(milestonesQuery.isError || schedulesQuery.isError) && (
        <p className="text-sm text-red-600">
          캘린더 데이터를 불러오지 못했습니다. 권한 또는 토큰을 확인해 주세요.
        </p>
      )}
    </section>
  )
}

