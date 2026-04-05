export type MeetingNote = {
  id: number
  projectId: number
  title: string
  meetingDateTime: string
  attendees: string
  content: string
  summary: string | null
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export type MeetingNoteCreateRequest = {
  title: string
  meetingDateTime: string
  attendees: string
  content: string
  summary: string | null
}

export type MeetingNoteUpdateRequest = MeetingNoteCreateRequest

