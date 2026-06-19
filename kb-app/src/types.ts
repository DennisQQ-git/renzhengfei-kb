export interface DocumentMeta {
  slug: string
  title: string
  year: number
  excerpt: string
  tags: string[]
  category: string
  isTopic?: boolean
  filename: string
}

export interface Document extends DocumentMeta {
  html: string
  metadata: Record<string, any>
}

export interface IndexData {
  total: number
  years: number[]
  documents: DocumentMeta[]
  topics: DocumentMeta[]
  allTags: string[]
}

export interface YearStats {
  [year: string]: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: '管理员' | '编辑' | '访客'
  status: '启用' | '禁用'
  created: string
  lastLogin: string
}
