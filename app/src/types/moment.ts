export interface Comment {
  id: string
  userId: string
  name: string
  text: string
  time: string // ISO 日期
}

export interface MomentAttachment {
  name: string
  type: string // 'md-link' | 'csv' | 'txt' | 'json' | 'pdf' | etc
  data: string // base64 data URL for local files, or slug for md-link
}

export interface Moment {
  id: string
  authorId: string
  content: string // 纯文本，支持换行，最多 500 字
  images: string[] // URL 数组，最多 9 张
  attachments?: MomentAttachment[]
  createdAt: string // ISO 日期
  location?: string
  likes: string[] // 点赞人 userId 数组
  comments: Comment[]
}
