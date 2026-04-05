import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  MeetingNote,
  MeetingNoteCreateRequest,
  MeetingNoteUpdateRequest,
} from '../types/meetingNote'

export async function getProjectMeetingNotes(projectId: number) {
  const response = await httpClient.get<ApiResponse<MeetingNote[]>>(
    `/api/projects/${projectId}/meeting-notes`,
  )
  return response.data
}

export async function createMeetingNote(
  projectId: number,
  request: MeetingNoteCreateRequest,
) {
  const response = await httpClient.post<ApiResponse<MeetingNote>>(
    `/api/projects/${projectId}/meeting-notes`,
    request,
  )
  return response.data
}

export async function getMeetingNote(meetingNoteId: number) {
  const response = await httpClient.get<ApiResponse<MeetingNote>>(
    `/api/meeting-notes/${meetingNoteId}`,
  )
  return response.data
}

export async function updateMeetingNote(
  meetingNoteId: number,
  request: MeetingNoteUpdateRequest,
) {
  const response = await httpClient.put<ApiResponse<MeetingNote>>(
    `/api/meeting-notes/${meetingNoteId}`,
    request,
  )
  return response.data
}

export async function deleteMeetingNote(meetingNoteId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/api/meeting-notes/${meetingNoteId}`,
  )
  return response.data
}

