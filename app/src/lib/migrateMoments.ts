/**
 * 数据迁移脚本：将 localStorage 中的 Moments 数据导入 Supabase
 *
 * 使用方法：
 * 1. 在浏览器控制台执行以下代码（登录状态下）
 * 2. 或把这段代码粘贴到浏览器 DevTools Console 中
 */

import { supabase, isSupabaseReady, momentToDb } from './supabase'
import type { Moment } from '@/types/moment'

export async function migrateLocalMomentsToSupabase(): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  if (!isSupabaseReady()) {
    throw new Error('Supabase 未配置，请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  }

  const raw = localStorage.getItem('moments_v1')
  if (!raw) {
    return { success: 0, failed: 0, errors: ['localStorage 中没有 moments 数据'] }
  }

  const list: Moment[] = JSON.parse(raw)
  if (list.length === 0) {
    return { success: 0, failed: 0, errors: ['数据为空'] }
  }

  let success = 0
  let failed = 0
  const errors: string[] = []

  for (const m of list) {
    try {
      const { error } = await supabase!.from('moments').upsert(momentToDb(m), {
        onConflict: 'id',
      })
      if (error) {
        failed++
        errors.push(`[${m.id}] ${error.message}`)
      } else {
        success++
      }
    } catch (e) {
      failed++
      errors.push(`[${m.id}] ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return { success, failed, errors }
}

/* 浏览器控制台快捷用法：
 * 1. 打开网站登录页，登录后进入 /blog
 * 2. F12 打开控制台
 * 3. 粘贴以下代码执行：
 *
 * await import('/src/lib/migrateMoments.ts').then(m => m.migrateLocalMomentsToSupabase()).then(console.log)
 *
 * 如果上面的 import 路径不对，可以直接在 DevTools 中执行：
 */
export function runMigrationInDevTools() {
  console.log('请在浏览器控制台执行 migrateLocalMomentsToSupabase()')
}
