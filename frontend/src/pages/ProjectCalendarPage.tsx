import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
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
import { getProject } from '../features/projects/api/projectsApi'
import {
  createSchedule,
  deleteSchedule,
  getProjectSchedules,
  sendScheduleNotificationEmail,
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

type CalendarDayCell = {
  date: Date
  inCurrentMonth: boolean
}

const milestoneStatusOptions: MilestoneStatus[] = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'DELAYED',
]

const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  PLANNED: '예정',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  DELAYED: '지연',
}

const scheduleTypeOptions: ScheduleType[] = [
  'MEETING',
  'PRESENTATION',
  'SUBMISSION',
  'DEMO',
  'MENTORING',
  'INTERNAL_REVIEW',
]

const scheduleTypeLabels: Record<ScheduleType, string> = {
  MEETING: '회의',
  PRESENTATION: '발표',
  SUBMISSION: '제출',
  DEMO: '데모',
  MENTORING: '멘토링',
  INTERNAL_REVIEW: '내부 검토',
}

const weekDayLabels = ['월', '화', '수', '목', '금', '토', '일']

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

function startOfMonth(date: Date) {
  const copy = new Date(date)
  copy.setDate(1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfMonth(date: Date) {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + 1, 0)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function toDateTimeLocalValue(value: string | null) {
  return value ? value.slice(0, 16) : ''
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildCalendarDays(referenceDate: Date, viewMode: CalendarViewMode): CalendarDayCell[] {
  if (viewMode === 'WEEK') {
    const weekStart = startOfWeek(referenceDate)
    return Array.from({ length: 7 }, (_, index) => ({
      date: addDays(weekStart, index),
      inCurrentMonth: true,
    }))
  }

  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(startOfWeek(monthEnd))

  const days: CalendarDayCell[] = []
  for (
    let cursor = new Date(calendarStart);
    cursor <= calendarEnd;
    cursor = addDays(cursor, 1)
  ) {
    days.push({
      date: new Date(cursor),
      inCurrentMonth: cursor.getMonth() === referenceDate.getMonth(),
    })
  }
  return days
}

function formatSchedulePeriod(schedule: Schedule) {
  const start = parseDate(schedule.startDateTime)
  const end = parseDate(schedule.endDateTime)

  if (!start || !end) {
    return '-'
  }

  return `${dateTimeFormatter.format(start)} ~ ${dateTimeFormatter.format(end)}`
}

export function ProjectCalendarPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)
  const currentUser = useAuthStore((state) => state.user)

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
  const [shareScheduleByMailOnCreate, setShareScheduleByMailOnCreate] = useState(true)
  const [mailNotice, setMailNotice] = useState<string | null>(null)

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

  const projectQuery = useQuery({
    queryKey: ['project', numericProjectId],
    queryFn: () => getProject(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const isProjectLeader =
    currentUser?.role === 'LEADER' &&
    projectQuery.data?.data.leaderId != null &&
    projectQuery.data.data.leaderId === currentUser.id

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

  const notifyScheduleEmailMutation = useMutation({
    mutationFn: (scheduleId: number) => sendScheduleNotificationEmail(scheduleId),
    onSuccess: (response) => {
      setMailNotice(`${response.data.recipientCount}명에게 일정 안내 메일을 발송했습니다.`)
    },
    onError: () => {
      setMailNotice('일정 안내 메일 발송에 실패했습니다. SMTP 설정을 확인해 주세요.')
    },
  })

  const createMilestoneMutation = useMutation({
    mutationFn: () => {
      if (!isProjectLeader) {
        throw new Error('마일스톤 생성 권한이 없습니다.')
      }
      return createMilestone(numericProjectId, {
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate,
        status: milestoneForm.status,
      })
    },
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
      if (!isProjectLeader) {
        throw new Error('마일스톤 수정 권한이 없습니다.')
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
    mutationFn: (milestoneId: number) => {
      if (!isProjectLeader) {
        throw new Error('마일스톤 삭제 권한이 없습니다.')
      }
      return deleteMilestone(milestoneId)
    },
    onSuccess: () => {
      setSelectedMilestoneId(null)
      setMilestoneForm(defaultMilestoneForm)
      queryClient.invalidateQueries({ queryKey: ['milestones', numericProjectId] })
    },
  })

  const createScheduleMutation = useMutation({
    mutationFn: () => {
      if (!isProjectLeader) {
        throw new Error('일정 생성 권한이 없습니다.')
      }
      return createSchedule(numericProjectId, {
        title: scheduleForm.title,
        description: scheduleForm.description,
        scheduleType: scheduleForm.scheduleType,
        startDateTime: scheduleForm.startDateTime,
        endDateTime: scheduleForm.endDateTime,
        location: scheduleForm.location || null,
      })
    },
    onSuccess: (response) => {
      const createdSchedule = response.data
      setSelectedScheduleId(createdSchedule.id)
      setScheduleForm(defaultScheduleForm)
      queryClient.invalidateQueries({ queryKey: ['schedules', numericProjectId] })

      if (shareScheduleByMailOnCreate) {
        notifyScheduleEmailMutation.mutate(createdSchedule.id)
      }
    },
  })

  const updateScheduleMutation = useMutation({
    mutationFn: () => {
      if (!selectedSchedule) {
        throw new Error('선택된 일정이 없습니다.')
      }
      if (!isProjectLeader) {
        throw new Error('일정 수정 권한이 없습니다.')
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
    mutationFn: (scheduleId: number) => {
      if (!isProjectLeader) {
        throw new Error('일정 삭제 권한이 없습니다.')
      }
      return deleteSchedule(scheduleId)
    },
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

  const calendarDays = useMemo(
    () => buildCalendarDays(referenceDateObject, viewMode),
    [referenceDateObject, viewMode],
  )

  const schedulesByDay = useMemo(() => {
    const map: Record<string, Schedule[]> = {}

    for (const day of calendarDays) {
      const dayStart = startOfDay(day.date)
      const dayEnd = endOfDay(day.date)
      const key = toDateKey(day.date)

      map[key] = filteredSchedules.filter((schedule) => {
        const start = parseDate(schedule.startDateTime)
        const end = parseDate(schedule.endDateTime)

        if (!start || !end) {
          return false
        }

        return start <= dayEnd && end >= dayStart
      })
    }

    return map
  }, [calendarDays, filteredSchedules])

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
    setMailNotice(null)
    setScheduleForm({
      title: schedule.title,
      description: schedule.description,
      scheduleType: schedule.scheduleType,
      startDateTime: toDateTimeLocalValue(schedule.startDateTime),
      endDateTime: toDateTimeLocalValue(schedule.endDateTime),
      location: schedule.location ?? '',
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

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">프로젝트 캘린더</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isProjectLeader
                ? '마일스톤과 주요 일정을 주간/월간 기준으로 관리합니다.'
                : '관리자/팀원은 캘린더를 조회할 수 있습니다.'}
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

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-700">보기 모드</p>
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="calendar-reference-date" className="text-xs font-medium text-slate-700">
              기준 날짜
            </label>
            <input
              id="calendar-reference-date"
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          {viewMode === 'MONTH' ? '월간 일정 캘린더' : '주간 일정 캘린더'}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          일정 제목과 기간이 날짜별로 표시됩니다.
        </p>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {weekDayLabels.map((day) => (
            <div key={day} className="rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-semibold text-slate-600">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dayKey = toDateKey(day.date)
            const daySchedules = schedulesByDay[dayKey] ?? []
            const visibleSchedules = daySchedules.slice(0, 3)
            const hiddenCount = Math.max(0, daySchedules.length - visibleSchedules.length)

            return (
              <div
                key={dayKey}
                className={`min-h-28 rounded-lg border p-2 ${
                  day.inCurrentMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    day.inCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {day.date.getDate()}
                </p>

                <div className="mt-2 space-y-1">
                  {visibleSchedules.map((schedule) => (
                    <div key={`${schedule.id}-${dayKey}`} className="rounded-md bg-blue-50 px-2 py-1">
                      <p className="truncate text-[11px] font-semibold text-blue-900">
                        {schedule.title}
                      </p>
                      <p className="truncate text-[10px] text-blue-700">
                        {formatSchedulePeriod(schedule)}
                      </p>
                    </div>
                  ))}

                  {hiddenCount > 0 && (
                    <p className="text-[10px] font-medium text-slate-500">+{hiddenCount}건 더 있음</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {isProjectLeader ? (
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
              <div className="space-y-1">
                <label htmlFor="milestone-title" className="text-xs font-medium text-slate-700">
                  마일스톤 제목
                </label>
                <input
                  id="milestone-title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="마일스톤 제목"
                  value={milestoneForm.title}
                  onChange={(event) =>
                    setMilestoneForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="milestone-description" className="text-xs font-medium text-slate-700">
                  마일스톤 설명
                </label>
                <textarea
                  id="milestone-description"
                  className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="마일스톤 설명"
                  value={milestoneForm.description}
                  onChange={(event) =>
                    setMilestoneForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="milestone-due-date" className="text-xs font-medium text-slate-700">
                    마감일
                  </label>
                  <input
                    id="milestone-due-date"
                    type="date"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={milestoneForm.dueDate}
                    onChange={(event) =>
                      setMilestoneForm((prev) => ({ ...prev, dueDate: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="milestone-status" className="text-xs font-medium text-slate-700">
                    상태
                  </label>
                  <select
                    id="milestone-status"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                        {milestoneStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
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
              <div className="space-y-1">
                <label htmlFor="schedule-title" className="text-xs font-medium text-slate-700">
                  일정 제목
                </label>
                <input
                  id="schedule-title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="일정 제목"
                  value={scheduleForm.title}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="schedule-description" className="text-xs font-medium text-slate-700">
                  일정 설명
                </label>
                <textarea
                  id="schedule-description"
                  className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="일정 설명"
                  value={scheduleForm.description}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="schedule-type" className="text-xs font-medium text-slate-700">
                  일정 유형
                </label>
                <select
                  id="schedule-type"
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
                      {scheduleTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="schedule-start" className="text-xs font-medium text-slate-700">
                    시작 일시
                  </label>
                  <input
                    id="schedule-start"
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={scheduleForm.startDateTime}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({ ...prev, startDateTime: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="schedule-end" className="text-xs font-medium text-slate-700">
                    종료 일시
                  </label>
                  <input
                    id="schedule-end"
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={scheduleForm.endDateTime}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({ ...prev, endDateTime: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="schedule-location" className="text-xs font-medium text-slate-700">
                  장소
                </label>
                <input
                  id="schedule-location"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="장소 (선택)"
                  value={scheduleForm.location}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={shareScheduleByMailOnCreate}
                  onChange={(event) => setShareScheduleByMailOnCreate(event.target.checked)}
                />
                일정 생성 후 팀원 메일 자동 발송
              </label>

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
                        setMailNotice(null)
                        setScheduleForm(defaultScheduleForm)
                      }}
                    >
                      선택 해제
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                      onClick={() => notifyScheduleEmailMutation.mutate(selectedSchedule.id)}
                      disabled={notifyScheduleEmailMutation.isPending}
                    >
                      {notifyScheduleEmailMutation.isPending ? '메일 발송 중...' : '팀 메일 공유'}
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

              {mailNotice && <p className="text-xs text-emerald-700">{mailNotice}</p>}
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            마일스톤/일정 수정은 해당 프로젝트 팀장만 가능합니다.
          </p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {viewMode === 'MONTH' ? '월간 마일스톤' : '주간 마일스톤'}
          </h3>
          <div className="mt-4 space-y-2">
            {filteredMilestones.map((milestone) => (
              <article
                key={milestone.id}
                onClick={() => {
                  if (isProjectLeader) {
                    selectMilestone(milestone)
                  }
                }}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-left ${
                  isProjectLeader ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{milestone.title}</p>
                <p className="mt-1 text-xs text-slate-500">{milestone.description}</p>
                <p className="mt-1 text-xs text-slate-600">
                  마감일: {dateFormatter.format(new Date(`${milestone.dueDate}T00:00:00`))} · 상태:{' '}
                  {milestoneStatusLabels[milestone.status]}
                </p>
              </article>
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
              <article
                key={schedule.id}
                onClick={() => {
                  if (isProjectLeader) {
                    selectSchedule(schedule)
                  }
                }}
                className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-left ${
                  isProjectLeader ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{schedule.title}</p>
                <p className="mt-1 text-xs text-slate-500">{schedule.description}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {scheduleTypeLabels[schedule.scheduleType]} · {formatSchedulePeriod(schedule)}
                </p>
                <p className="mt-1 text-xs text-slate-600">장소: {schedule.location ?? '-'}</p>
              </article>
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
