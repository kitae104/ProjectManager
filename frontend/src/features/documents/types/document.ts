export type DocumentType =
  | 'PROJECT_OVERVIEW'
  | 'PROPOSAL'
  | 'MEETING_NOTE'
  | 'WEEKLY_REPORT'
  | 'TECHNICAL_DOC'
  | 'PRESENTATION_PREP'
  | 'RETROSPECTIVE'

export type ProjectDocument = {
  id: number
  projectId: number
  title: string
  type: DocumentType
  content: string
  version: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export type DocumentCreateRequest = {
  title: string
  type: DocumentType
  content: string
  version: string
}

export type DocumentUpdateRequest = DocumentCreateRequest

