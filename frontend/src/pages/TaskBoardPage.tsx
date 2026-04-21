import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import { getProject, getProjectMembers } from '../features/projects/api/projectsApi'
import { getProjectMemberRoleLabel } from '../features/projects/constants/projectMemberRoleLabels'
import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask,
  updateTaskStatus,
} from '../features/tasks/api/tasksApi'
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskUpdateRequest,
} from '../features/tasks/types/task'

const statusColumns: Array<{ status: TaskStatus; title: string }> = [
  { status: 'TODO', title: '할 일' },
  { status: 'IN_PROGRESS', title: '진행 중' },
  { status: 'IN_REVIEW', title: '검토 중' },
  { status: 'DONE', title: '완료' },
  { status: 'BLOCKED', title: '차단됨' },
]

const priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const priorityLabels: Record<TaskPriority, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  URGENT: '긴급',
}

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  dueDate: string
  progress: number
}

const defaultFormState: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
  progress: 0,
}

export function TaskBoardPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)
  const me = useAuthStore((state) => state.user)

  const [form, setForm] = useState<TaskFormState>(defaultFormState)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')
  const [filterAssignee, setFilterAssignee] = useState<'ALL' | string>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | TaskStatus>('ALL')

  const tasksQuery = useQuery({
    queryKey: ['tasks', numericProjectId],
    queryFn: () => getProjectTasks(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const membersQuery = useQuery({
    queryKey: ['project-members', numericProjectId],
    queryFn: () => getProjectMembers(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const projectQuery = useQuery({
    queryKey: ['project', numericProjectId],
    queryFn: () => getProject(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const isProjectLeader =
    me?.role === 'LEADER' &&
    projectQuery.data?.data.leaderId != null &&
    projectQuery.data.data.leaderId === me.id
  const canManageTaskBoard = isProjectLeader
  const canUpdateOwnTask = me?.role === 'MEMBER'
  const isMemberTaskManager = canUpdateOwnTask && !canManageTaskBoard
  const isReadOnlyViewer = !canManageTaskBoard && !canUpdateOwnTask

  const selectedTask = useMemo(
    () => tasksQuery.data?.data.find((task) => task.id === selectedTaskId) ?? null,
    [tasksQuery.data, selectedTaskId],
  )

  function replaceTaskInCache(updatedTask: Task) {
    queryClient.setQueryData(
      ['tasks', numericProjectId],
      (previous: { success: boolean; message: string; data: Task[] } | undefined) => {
        if (!previous) {
          return previous
        }

        return {
          ...previous,
          data: previous.data.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        }
      },
    )
  }

  const createMutation = useMutation({
    mutationFn: () => {
      if (!canManageTaskBoard) {
        throw new Error('업무 생성 권한이 없습니다.')
      }
      return createTask(numericProjectId, {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        reporterId: me?.id ?? null,
        startDate: null,
        dueDate: form.dueDate || null,
        progress: form.progress,
      })
    },
    onSuccess: () => {
      setForm(defaultFormState)
      queryClient.invalidateQueries({ queryKey: ['tasks', numericProjectId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedTask) {
        throw new Error('선택된 업무가 없습니다.')
      }
      if (!canManageTaskBoard && !(canUpdateOwnTask && selectedTask.assigneeId === me?.id)) {
        throw new Error('업무 수정 권한이 없습니다.')
      }
      const payload: TaskUpdateRequest = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        reporterId: selectedTask.reporterId ?? me?.id ?? null,
        startDate: selectedTask.startDate,
        dueDate: form.dueDate || null,
        progress: form.progress,
      }
      return updateTask(selectedTask.id, payload)
    },
    onSuccess: (response) => {
      const updatedTask = response.data
      replaceTaskInCache(updatedTask)
      loadTaskToForm(updatedTask)
      queryClient.invalidateQueries({ queryKey: ['tasks', numericProjectId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => {
      if (!canManageTaskBoard) {
        throw new Error('업무 삭제 권한이 없습니다.')
      }
      return deleteTask(taskId)
    },
    onSuccess: () => {
      setSelectedTaskId(null)
      queryClient.invalidateQueries({ queryKey: ['tasks', numericProjectId] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      const task = tasksQuery.data?.data.find((item) => item.id === taskId)
      const canUpdateStatus =
        canManageTaskBoard || (canUpdateOwnTask && task?.assigneeId === me?.id)

      if (!canUpdateStatus) {
        throw new Error('업무 상태 변경 권한이 없습니다.')
      }

      return updateTaskStatus(taskId, { status })
    },
    onSuccess: (response) => {
      const updatedTask = response.data
      replaceTaskInCache(updatedTask)
      if (selectedTaskId === updatedTask.id) {
        loadTaskToForm(updatedTask)
      }
      queryClient.invalidateQueries({ queryKey: ['tasks', numericProjectId] })
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    if (!overId || !activeId.startsWith('task-') || !overId.startsWith('col-')) {
      return
    }

    const taskId = Number(activeId.replace('task-', ''))
    const nextStatus = overId.replace('col-', '') as TaskStatus
    const task = tasksQuery.data?.data.find((item) => item.id === taskId)
    const canUpdateStatus =
      canManageTaskBoard || (canUpdateOwnTask && task?.assigneeId === me?.id)

    if (!task || task.status === nextStatus || !canUpdateStatus) {
      return
    }

    statusMutation.mutate({ taskId, status: nextStatus })
  }

  function loadTaskToForm(task: Task) {
    setSelectedTaskId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ? String(task.assigneeId) : '',
      dueDate: task.dueDate ?? '',
      progress: task.progress,
    })
  }

  function resetForm() {
    setSelectedTaskId(null)
    setForm(defaultFormState)
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

  const tasks = tasksQuery.data?.data ?? []
  const members = membersQuery.data?.data ?? []
  const visibleTasks = canUpdateOwnTask
    ? tasks.filter((task) => task.assigneeId === me?.id)
    : tasks

  const filteredTasks = visibleTasks.filter((task) => {
    const byKeyword = keyword.trim()
      ? `${task.title} ${task.description}`.toLowerCase().includes(keyword.trim().toLowerCase())
      : true
    const byAssignee =
      filterAssignee === 'ALL' ? true : String(task.assigneeId ?? '') === filterAssignee
    const byStatus = filterStatus === 'ALL' ? true : task.status === filterStatus
    return byKeyword && byAssignee && byStatus
  })

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">칸반 보드</h2>
            <p className="mt-1 text-sm text-slate-600">
              {canManageTaskBoard
                ? '팀 Todo를 생성하고 팀 진행 상태를 관리합니다.'
                : canUpdateOwnTask
                  ? '팀장이 작성한 Todo를 기준으로 내 일정과 진행 상태를 업데이트합니다.'
                  : '업무 현황을 조회할 수 있습니다.'}
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

      {canManageTaskBoard && (
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedTask) {
              updateMutation.mutate()
              return
            }
            createMutation.mutate()
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">
            {selectedTask ? '업무 수정' : '업무 생성'}
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-1">
              <label htmlFor="task-title" className="text-xs font-medium text-slate-700">
                업무 제목
              </label>
              <input
                id="task-title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="업무 제목"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="task-progress" className="text-xs font-medium text-slate-700">
                진행률 (%)
              </label>
              <input
                id="task-progress"
                type="number"
                min={0}
                max={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="진행률"
                value={form.progress}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))
                }
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label htmlFor="task-description" className="text-xs font-medium text-slate-700">
                업무 설명
              </label>
              <textarea
                id="task-description"
                className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="업무 설명"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="task-status" className="text-xs font-medium text-slate-700">
                업무 상태
              </label>
              <select
                id="task-status"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))
                }
              >
                {statusColumns.map((column) => (
                  <option key={column.status} value={column.status}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="task-priority" className="text-xs font-medium text-slate-700">
                우선순위
              </label>
              <select
                id="task-priority"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
                }
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="task-assignee" className="text-xs font-medium text-slate-700">
                담당자
              </label>
              <select
                id="task-assignee"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.assigneeId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, assigneeId: event.target.value }))
                }
              >
                <option value="">담당자 미지정</option>
                {members.map((member) => (
                  <option key={member.id} value={member.userId}>
                    {member.name} ({getProjectMemberRoleLabel(member.projectRole)})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="task-due-date" className="text-xs font-medium text-slate-700">
                마감일
              </label>
              <input
                id="task-due-date"
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {selectedTask
                ? updateMutation.isPending
                  ? '수정 중...'
                  : '업무 수정'
                : createMutation.isPending
                  ? '생성 중...'
                  : '업무 생성'}
            </button>
            {selectedTask && (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={resetForm}
              >
                선택 해제
              </button>
            )}
            {selectedTask && canManageTaskBoard && (
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => deleteMutation.mutate(selectedTask.id)}
              >
                {deleteMutation.isPending ? '삭제 중...' : '업무 삭제'}
              </button>
            )}
          </div>
        </form>
      )}

      {isReadOnlyViewer && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            현재 계정은 업무 조회 전용입니다. 업무 생성/수정은 프로젝트 팀장 또는 담당 팀원만 가능합니다.
          </p>
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">보드 필터</p>
          <div className={`mt-3 grid gap-2 ${isMemberTaskManager ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div className="space-y-1">
              <label htmlFor="board-filter-keyword" className="text-xs font-medium text-slate-700">
                검색어
              </label>
              <input
                id="board-filter-keyword"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="업무 제목/설명 검색"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="board-filter-assignee" className="text-xs font-medium text-slate-700">
                담당자 필터
              </label>
              <select
                id="board-filter-assignee"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={filterAssignee}
                onChange={(event) => setFilterAssignee(event.target.value)}
              >
                <option value="ALL">전체 담당자</option>
                <option value="">담당자 미지정</option>
                {members.map((member) => (
                  <option key={member.id} value={String(member.userId)}>
                    {member.name} ({getProjectMemberRoleLabel(member.projectRole)})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="board-filter-status" className="text-xs font-medium text-slate-700">
                상태 필터
              </label>
              <select
                id="board-filter-status"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as 'ALL' | TaskStatus)}
              >
                <option value="ALL">전체 상태</option>
                {statusColumns.map((column) => (
                  <option key={column.status} value={column.status}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
            {isMemberTaskManager && (
              <div className="space-y-1">
                <label htmlFor="board-filter-task-select" className="text-xs font-medium text-slate-700">
                  업무 선택
                </label>
                <select
                  id="board-filter-task-select"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={selectedTaskId ? String(selectedTaskId) : ''}
                  onChange={(event) => {
                    if (!event.target.value) {
                      resetForm()
                      return
                    }
                    const task = filteredTasks.find((item) => item.id === Number(event.target.value))
                    if (!task) {
                      return
                    }
                    loadTaskToForm(task)
                  }}
                >
                  <option value="">업무 선택</option>
                  {filteredTasks.map((task) => {
                    const statusTitle = statusColumns.find((column) => column.status === task.status)?.title ?? task.status
                    return (
                      <option key={task.id} value={task.id}>
                        {task.title} ({statusTitle})
                      </option>
                    )
                  })}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.status}
              columnId={`col-${column.status}`}
              title={column.title}
              tasks={filteredTasks.filter((task) => task.status === column.status)}
              onSelectTask={isReadOnlyViewer ? () => undefined : loadTaskToForm}
              canDragTasks={!isReadOnlyViewer}
              selectedTaskId={selectedTaskId}
            />
          ))}
        </div>
      </DndContext>

      {isMemberTaskManager && (
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (!selectedTask) {
              return
            }
            updateMutation.mutate()
          }}
        >
          <div>
            <h3 className="text-base font-semibold text-slate-900">내 업무 관리</h3>
            <p className="mt-1 text-sm text-slate-600">
              보드 필터의 업무 선택 또는 보드 카드 선택 시 업무 정보가 채워집니다.
            </p>
          </div>

          {selectedTask ? (
            <p className="mt-3 text-sm text-slate-700">선택된 업무: {selectedTask.title}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              보드 필터에서 수정할 업무를 선택해 주세요.
            </p>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-1">
              <label htmlFor="member-task-title" className="text-xs font-medium text-slate-700">
                업무 제목
              </label>
              <input
                id="member-task-title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.title}
                disabled
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="member-task-progress" className="text-xs font-medium text-slate-700">
                진행률 (%)
              </label>
              <input
                id="member-task-progress"
                type="number"
                min={0}
                max={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.progress}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))
                }
                disabled={!selectedTask}
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label htmlFor="member-task-description" className="text-xs font-medium text-slate-700">
                업무 설명
              </label>
              <textarea
                id="member-task-description"
                className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                disabled={!selectedTask}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="member-task-status" className="text-xs font-medium text-slate-700">
                업무 상태
              </label>
              <select
                id="member-task-status"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))
                }
                disabled={!selectedTask}
              >
                {statusColumns.map((column) => (
                  <option key={column.status} value={column.status}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="member-task-due-date" className="text-xs font-medium text-slate-700">
                마감일
              </label>
              <input
                id="member-task-due-date"
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
                disabled={!selectedTask}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={!selectedTask}
            >
              {updateMutation.isPending ? '수정 중...' : '업무 수정'}
            </button>
            {selectedTask && (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={resetForm}
              >
                선택 해제
              </button>
            )}
          </div>
        </form>
      )}

      {tasksQuery.isError && (
        <p className="text-sm text-red-600">업무 목록을 불러오지 못했습니다.</p>
      )}
    </section>
  )
}

function KanbanColumn({
  columnId,
  title,
  tasks,
  onSelectTask,
  canDragTasks,
  selectedTaskId,
}: {
  columnId: string
  title: string
  tasks: Task[]
  onSelectTask: (task: Task) => void
  canDragTasks: boolean
  selectedTaskId: number | null
}) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId })

  return (
    <section
      ref={setNodeRef}
      className={`min-h-40 rounded-xl border p-3 transition ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-100'
      }`}
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelect={() => onSelectTask(task)}
            canDrag={canDragTasks}
            isSelected={selectedTaskId === task.id}
          />
        ))}
      </div>
    </section>
  )
}

function TaskCard({
  task,
  onSelect,
  canDrag,
  isSelected,
}: {
  task: Task
  onSelect: () => void
  canDrag: boolean
  isSelected: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    disabled: !canDrag,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white p-3 shadow-sm ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
      } ${
        canDrag ? 'cursor-pointer' : 'cursor-default'
      } ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{task.title}</p>
        <div className="flex items-center gap-1">
          {isSelected && (
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              선택됨
            </span>
          )}
          {canDrag && (
            <button
              type="button"
              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100"
              onClick={(event) => event.stopPropagation()}
              {...listeners}
              {...attributes}
            >
              이동
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500 line-clamp-3">{task.description}</p>
      <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
          {priorityLabels[task.priority]}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
          {task.assigneeName ?? '미지정'}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
          마감: {task.dueDate ?? '-'}
        </span>
      </div>
    </article>
  )
}
