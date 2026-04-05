import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  DocumentCreateRequest,
  DocumentUpdateRequest,
  ProjectDocument,
} from '../types/document'

export async function getProjectDocuments(projectId: number) {
  const response = await httpClient.get<ApiResponse<ProjectDocument[]>>(
    `/api/projects/${projectId}/documents`,
  )
  return response.data
}

export async function createDocument(
  projectId: number,
  request: DocumentCreateRequest,
) {
  const response = await httpClient.post<ApiResponse<ProjectDocument>>(
    `/api/projects/${projectId}/documents`,
    request,
  )
  return response.data
}

export async function getDocument(documentId: number) {
  const response = await httpClient.get<ApiResponse<ProjectDocument>>(
    `/api/documents/${documentId}`,
  )
  return response.data
}

export async function updateDocument(
  documentId: number,
  request: DocumentUpdateRequest,
) {
  const response = await httpClient.put<ApiResponse<ProjectDocument>>(
    `/api/documents/${documentId}`,
    request,
  )
  return response.data
}

export async function deleteDocument(documentId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/api/documents/${documentId}`,
  )
  return response.data
}

