import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import {
  deleteArtifact,
  downloadArtifact,
  getProjectArtifacts,
  uploadArtifact,
} from '../features/artifacts/api/artifactsApi'
import type { Artifact } from '../features/artifacts/types/artifact'
import {
  createDocument,
  deleteDocument,
  getProjectDocuments,
  updateDocument,
} from '../features/documents/api/documentsApi'
import type {
  DocumentType,
  DocumentUpdateRequest,
  ProjectDocument,
} from '../features/documents/types/document'
import { getProject } from '../features/projects/api/projectsApi'

type DocumentFormState = {
  title: string
  type: DocumentType
  content: string
  version: string
}

const documentTypeOptions: DocumentType[] = [
  'PROJECT_OVERVIEW',
  'PROPOSAL',
  'MEETING_NOTE',
  'WEEKLY_REPORT',
  'TECHNICAL_DOC',
  'PRESENTATION_PREP',
  'RETROSPECTIVE',
]

const documentTypeLabels: Record<DocumentType, string> = {
  PROJECT_OVERVIEW: '프로젝트 개요',
  PROPOSAL: '제안서',
  MEETING_NOTE: '회의록',
  WEEKLY_REPORT: '주간 보고서',
  TECHNICAL_DOC: '기술 문서',
  PRESENTATION_PREP: '발표 준비',
  RETROSPECTIVE: '회고',
}

const defaultFormState: DocumentFormState = {
  title: '',
  type: 'PROJECT_OVERVIEW',
  content: '',
  version: 'v1.0',
}

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function ProjectDocumentsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)
  const currentUser = useAuthStore((state) => state.user)

  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null)
  const [form, setForm] = useState<DocumentFormState>(defaultFormState)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [artifactNotice, setArtifactNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const artifactFileInputRef = useRef<HTMLInputElement | null>(null)

  const documentsQuery = useQuery({
    queryKey: ['documents', numericProjectId],
    queryFn: () => getProjectDocuments(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const artifactsQuery = useQuery({
    queryKey: ['artifacts', numericProjectId],
    queryFn: () => getProjectArtifacts(numericProjectId),
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
  const canCreateDocument = isProjectLeader
  const canUploadArtifact = currentUser?.role === 'LEADER' || currentUser?.role === 'MEMBER'

  const selectedDocument = useMemo(
    () =>
      documentsQuery.data?.data.find((document) => document.id === selectedDocumentId) ?? null,
    [documentsQuery.data, selectedDocumentId],
  )
  const canEditDocument = (document: ProjectDocument) =>
    currentUser?.id != null && document.authorId === currentUser.id
  const canEditSelectedDocument = selectedDocument != null && canEditDocument(selectedDocument)
  const canUseDocumentForm = canCreateDocument || canEditSelectedDocument

  const createMutation = useMutation({
    mutationFn: () => {
      if (!canCreateDocument) {
        throw new Error('문서 생성 권한이 없습니다.')
      }
      return createDocument(numericProjectId, {
        title: form.title,
        type: form.type,
        content: form.content,
        version: form.version,
      })
    },
    onSuccess: () => {
      setForm(defaultFormState)
      queryClient.invalidateQueries({ queryKey: ['documents', numericProjectId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedDocument) {
        throw new Error('선택된 문서가 없습니다.')
      }
      if (!canEditSelectedDocument) {
        throw new Error('문서 수정은 작성자만 가능합니다.')
      }
      const payload: DocumentUpdateRequest = {
        title: form.title,
        type: form.type,
        content: form.content,
        version: form.version,
      }
      return updateDocument(selectedDocument.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', numericProjectId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (documentId: number) => {
      if (!canCreateDocument) {
        throw new Error('문서 삭제 권한이 없습니다.')
      }
      return deleteDocument(documentId)
    },
    onSuccess: () => {
      setSelectedDocumentId(null)
      setForm(defaultFormState)
      queryClient.invalidateQueries({ queryKey: ['documents', numericProjectId] })
    },
  })

  const uploadArtifactMutation = useMutation({
    mutationFn: () => {
      if (!canUploadArtifact) {
        throw new Error('산출물 업로드 권한이 없습니다.')
      }
      if (!uploadFile) {
        throw new Error('업로드할 파일을 선택해 주세요.')
      }
      return uploadArtifact(numericProjectId, uploadFile)
    },
    onMutate: () => {
      setArtifactNotice(null)
    },
    onSuccess: () => {
      setUploadFile(null)
      if (artifactFileInputRef.current) {
        artifactFileInputRef.current.value = ''
      }
      setArtifactNotice({ type: 'success', message: '파일 업로드가 완료되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['artifacts', numericProjectId] })
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message
        if (typeof message === 'string' && message.trim() !== '') {
          setArtifactNotice({ type: 'error', message })
          return
        }
      }
      setArtifactNotice({ type: 'error', message: '파일 업로드에 실패했습니다.' })
    },
  })

  const deleteArtifactMutation = useMutation({
    mutationFn: (artifactId: number) => {
      if (!isProjectLeader) {
        throw new Error('산출물 삭제 권한이 없습니다.')
      }
      return deleteArtifact(artifactId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts', numericProjectId] })
    },
  })

  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(`/projects/${numericProjectId}`)
  }

  function selectDocument(document: ProjectDocument) {
    setSelectedDocumentId(document.id)
    setForm({
      title: document.title,
      type: document.type,
      content: document.content,
      version: document.version,
    })
  }

  if (!Number.isFinite(numericProjectId)) {
    return <p className="text-sm text-red-600">유효하지 않은 프로젝트 ID입니다.</p>
  }

  const documents = documentsQuery.data?.data ?? []
  const artifacts = artifactsQuery.data?.data ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">문서 관리</h2>
            <p className="mt-1 text-sm text-slate-600">
              {canCreateDocument
                ? '프로젝트 문서를 생성하고 버전 단위로 관리합니다.'
                : canUploadArtifact
                  ? '팀원은 문서를 조회하고 산출물을 업로드할 수 있습니다.'
                  : '관리자/팀원은 문서와 산출물을 조회할 수 있습니다.'}
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

      {canUseDocumentForm && (
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedDocument) {
              updateMutation.mutate()
              return
            }
            createMutation.mutate()
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">
            {selectedDocument ? '문서 수정' : '문서 생성'}
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="document-title" className="text-xs font-medium text-slate-700">
                문서 제목
              </label>
              <input
                id="document-title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="문서 제목"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="document-type" className="text-xs font-medium text-slate-700">
                문서 유형
              </label>
              <select
                id="document-type"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as DocumentType }))
                }
              >
                {documentTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {documentTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="document-version" className="text-xs font-medium text-slate-700">
                문서 버전
              </label>
              <input
                id="document-version"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="버전 (예: v1.0)"
                value={form.version}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, version: event.target.value }))
                }
                required
              />
            </div>
            <div className="hidden md:block" />
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="document-content" className="text-xs font-medium text-slate-700">
                문서 본문
              </label>
              <textarea
                id="document-content"
                className="min-h-44 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="문서 본문"
                value={form.content}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, content: event.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {selectedDocument
                ? updateMutation.isPending
                  ? '수정 중...'
                  : '문서 수정'
                : createMutation.isPending
                  ? '생성 중...'
                  : '문서 생성'}
            </button>
            {selectedDocument && (
              <>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setSelectedDocumentId(null)
                    setForm(defaultFormState)
                  }}
                >
                  선택 해제
                </button>
                {canCreateDocument && (
                  <button
                    type="button"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={() => deleteMutation.mutate(selectedDocument.id)}
                  >
                    {deleteMutation.isPending ? '삭제 중...' : '문서 삭제'}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">문서 목록</h3>
        <div className="mt-4 space-y-2">
          {documents.map((document) => (
            <article
              key={document.id}
              className={`w-full rounded-lg border border-slate-200 px-3 py-3 text-left ${
                canEditDocument(document) ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
              onClick={() => {
                if (canEditDocument(document)) {
                  selectDocument(document)
                }
              }}
            >
              <p className="text-sm font-semibold text-slate-900">{document.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {documentTypeLabels[document.type]} · {document.version}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                작성자: {document.authorName} · 수정일:{' '}
                {dateTimeFormatter.format(new Date(document.updatedAt))}
              </p>
            </article>
          ))}
          {documents.length === 0 && (
            <p className="text-sm text-slate-500">등록된 문서가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">산출물 업로드</h3>
        <p className="mt-1 text-sm text-slate-600">
          {canUploadArtifact
            ? '발표자료, 결과물, 스크린샷 등 파일 산출물을 저장합니다.'
            : '산출물 목록 조회 및 다운로드가 가능합니다.'}
        </p>
        {canUploadArtifact && (
          <form
            className="mt-4 flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              uploadArtifactMutation.mutate()
            }}
          >
            <input
              ref={artifactFileInputRef}
              type="file"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              disabled={uploadArtifactMutation.isPending}
            >
              {uploadArtifactMutation.isPending ? '업로드 중...' : '파일 업로드'}
            </button>
          </form>
        )}
        {artifactNotice && (
          <p className={`mt-2 text-sm ${artifactNotice.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
            {artifactNotice.message}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {artifacts.map((artifact) => (
            <ArtifactItem
              key={artifact.id}
              artifact={artifact}
              onDownload={() =>
                downloadArtifact(artifact.id, artifact.originalFileName)
              }
              onDelete={() => deleteArtifactMutation.mutate(artifact.id)}
              deleting={deleteArtifactMutation.isPending}
              canDelete={canCreateDocument}
            />
          ))}
          {artifacts.length === 0 && (
            <p className="text-sm text-slate-500">업로드된 산출물이 없습니다.</p>
          )}
        </div>
      </div>

      {(documentsQuery.isError || artifactsQuery.isError) && (
        <p className="text-sm text-red-600">
          문서 또는 산출물 데이터를 불러오지 못했습니다.
        </p>
      )}
    </section>
  )
}

function ArtifactItem({
  artifact,
  onDownload,
  onDelete,
  deleting,
  canDelete,
}: {
  artifact: Artifact
  onDownload: () => void
  onDelete: () => void
  deleting: boolean
  canDelete: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
      <div>
        <p className="text-sm font-semibold text-slate-900">{artifact.originalFileName}</p>
        <p className="text-xs text-slate-500">
          업로더: {artifact.uploaderName} · 크기: {(artifact.fileSize / 1024).toFixed(1)} KB
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          onClick={onDownload}
        >
          다운로드
        </button>
        {canDelete && (
          <button
            type="button"
            className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            onClick={onDelete}
            disabled={deleting}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  )
}
