export interface AulaMaterial {
  id: string
  aulaId: string
  originalName: string
  fileName: string
  url: string
  size: number
  mimeType: string
  tipo?: string
  createdAt: string // ISO date
}
