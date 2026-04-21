import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type { Artifact } from '../types/artifact'

export async function getProjectArtifacts(projectId: number) {
  const response = await httpClient.get<ApiResponse<Artifact[]>>(
    `/api/projects/${projectId}/artifacts`,
  )
  return response.data
}

export async function uploadArtifact(projectId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await httpClient.post<ApiResponse<Artifact>>(
    `/api/projects/${projectId}/artifacts`,
    formData,
  )
  return response.data
}

export async function deleteArtifact(artifactId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/api/artifacts/${artifactId}`,
  )
  return response.data
}

export async function downloadArtifact(artifactId: number, fileName: string) {
  const response = await httpClient.get(`/api/artifacts/${artifactId}/download`, {
    responseType: 'blob',
  })

  const blobUrl = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
