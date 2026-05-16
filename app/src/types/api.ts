import { z } from 'zod'

/**
 * GitHub API 响应类型定义和验证
 */

// GitHub 仓库 API 响应
export const GitHubRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  updated_at: z.string(),
  html_url: z.string().optional(),
})

export type GitHubAPIRepo = z.infer<typeof GitHubRepoSchema>

// GitHub 用户 API 响应
export const GitHubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string(),
  bio: z.string().nullable(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
})

export type GitHubAPIUser = z.infer<typeof GitHubUserSchema>

// Obsidian 笔记 API 响应
export const ObsidianNoteMetaSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  date: z.string().optional(),
})

export type ObsidianNoteMetaAPI = z.infer<typeof ObsidianNoteMetaSchema>

export const ObsidianNoteSchema = ObsidianNoteMetaSchema.extend({
  content: z.string(),
})

export type ObsidianNoteAPI = z.infer<typeof ObsidianNoteSchema>

// Vault 文件树
export const VaultFileSchema: z.ZodType<{
  name: string
  path: string
  type: 'file' | 'folder'
  children?: VaultFileAPI[]
}> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(['file', 'folder']),
    children: z.array(VaultFileSchema).optional(),
  })
)

export type VaultFileAPI = z.infer<typeof VaultFileSchema>

/**
 * 安全的 API 数据解析
 */
export function parseGitHubRepos(data: unknown): GitHubAPIRepo[] {
  try {
    return z.array(GitHubRepoSchema).parse(data)
  } catch (error) {
    console.error('GitHub repos validation failed:', error)
    return []
  }
}

export function parseObsidianNotes(data: unknown): ObsidianNoteMetaAPI[] {
  try {
    return z.array(ObsidianNoteMetaSchema).parse(data)
  } catch (error) {
    console.error('Obsidian notes validation failed:', error)
    return []
  }
}

export function parseObsidianNote(data: unknown): ObsidianNoteAPI | null {
  try {
    return ObsidianNoteSchema.parse(data)
  } catch (error) {
    console.error('Obsidian note validation failed:', error)
    return null
  }
}

export function parseVaultTree(data: unknown): VaultFileAPI[] {
  try {
    return z.array(VaultFileSchema).parse(data)
  } catch (error) {
    console.error('Vault tree validation failed:', error)
    return []
  }
}
