import { DndContext, type DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
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
  { status: 'TODO', title: 'TODO' },
  { status: 'IN_PROGRESS', title: 'IN PROGRESS' },
  { status: 'IN_REVIEW', title: 'IN REVIEW' },
  { status: 'DONE', title: 'DONE' },
  { status: 'BLOCKED', title: 'BLOCKED' },
]

const priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

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
  const isReadOnlyViewer = !canManageTaskBoard && !canUpdateOwnTask

  const selectedTask = useMemo(
    () => tasksQuery.data?.data.find((task) => task.id === selectedTaskId) ?? null,
    [tasksQuery.data, selectedTaskId],
  )

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
    onSuccess: () => {
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
    onSuccess: () => {
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
        <h2 className="text-xl font-bold text-slate-900">칸반 보드</h2>
        <p className="mt-1 text-sm text-slate-600">
          {canManageTaskBoard
            ? '팀 Todo를 생성하고 팀 진행 상태를 관리합니다.'
            : canUpdateOwnTask
              ? '팀장이 작성한 Todo를 기준으로 내 일정과 진행 상태를 업데이트합니다.'
              : '업무 현황을 조회할 수 있습니다.'}
        </p>
      </div>

      {!isReadOnlyViewer ? (
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedTask) {
              updateMutation.mutate()
              return
            }
            if (canManageTaskBoard) {
              createMutation.mutate()
            }
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">
            {selectedTask ? '업무 수정' : canManageTaskBoard ? '업무 생성' : '내 업무 관리'}
          </h3>
          {canUpdateOwnTask && !canManageTaskBoard && (
            <p className="mt-1 text-sm text-slate-600">
              팀원은 본인에게 할당된 업무의 일정/진행 상태만 수정할 수 있습니다.
            </p>
          )}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="업무 제목"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              disabled={!canManageTaskBoard}
              required
            />
            <input
              type="number"
              min={0}
              max={100}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="진행률"
              value={form.progress}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))
              }
            />
            <textarea
              className="md:col-span-3 min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="업무 설명"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              disabled={!canManageTaskBoard}
              required
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))
              }
            >
              {statusColumns.map((column) => (
                <option key={column.status} value={column.status}>
                  {column.status}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={form.priority}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
              }
              disabled={!canManageTaskBoard}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={form.assigneeId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, assigneeId: event.target.value }))
              }
              disabled={!canManageTaskBoard}
            >
              <option value="">담당자 미지정</option>
              {members.map((member) => (
                <option key={member.id} value={member.userId}>
                  {member.name} ({getProjectMemberRoleLabel(member.projectRole)})
                </option>
              ))}
            </select>
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={form.dueDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dueDate: event.target.value }))
              }
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={!selectedTask && !canManageTaskBoard}
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
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            현재 계정은 업무 조회 전용입니다. 업무 생성/수정은 프로젝트 팀장 또는 담당 팀원만 가능합니다.
          </p>
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">보드 필터</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="업무 제목/설명 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as 'ALL' | TaskStatus)}
            >
              <option value="ALL">전체 상태</option>
              {statusColumns.map((column) => (
                <option key={column.status} value={column.status}>
                  {column.status}
                </option>
              ))}
            </select>
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
            />
          ))}
        </div>
      </DndContext>

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
}: {
  columnId: string
  title: string
  tasks: Task[]
  onSelectTask: (task: Task) => void
  canDragTasks: boolean
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
}: {
  task: Task
  onSelect: () => void
  canDrag: boolean
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
      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${
        canDrag ? 'cursor-pointer' : 'cursor-default'
      } ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onSelect}
      {...listeners}
      {...attributes}
    >
      <p className="text-sm font-semibold text-slate-800">{task.title}</p>
      <p className="mt-1 text-xs text-slate-500 line-clamp-3">{task.description}</p>
      <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
          {task.priority}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
          {task.assigneeName ?? '미지정'}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
          DUE: {task.dueDate ?? '-'}
        </span>
      </div>
    </article>
  )
}
