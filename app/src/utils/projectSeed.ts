import type { DayEntry, TodoItem } from '@/types/calendar'
import { loadProjects, saveProjects, generateId } from './projectStorage'
import { formatDateStr } from './projectAggregation'

const ENTRIES_KEY = 'calendar_entries'
const SEED_MARKER = '__demo_seeded_v2__'

function pseudoRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 10000) / 10000
}

function seededRandom(seed: string, min: number, max: number): number {
  return min + pseudoRandom(seed) * (max - min)
}

export function seedDemoDataIfEmpty() {
  try {
    if (localStorage.getItem(SEED_MARKER)) return
    const existingProjects = loadProjects()
    if (existingProjects.length > 0) return

    const projects = [
      {
        id: 'demo-ts',
        name: '学习 TypeScript',
        description: '深入掌握 TypeScript 类型系统和工程化实践',
        color: '#C9A84C',
        targetHours: 50,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'demo-ts-type',
        name: 'TS 类型系统',
        description: '泛型、条件类型、类型体操',
        color: '#C9A84C',
        targetHours: 20,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 19 * 86400000).toISOString(),
        parentId: 'demo-ts',
      },
      {
        id: 'demo-ts-eng',
        name: 'TS 工程化',
        description: '装饰器、编译配置、类型发布',
        color: '#C9A84C',
        targetHours: 15,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        parentId: 'demo-ts',
      },
      {
        id: 'demo-web',
        name: '个人网站重构',
        description: '用 React 19 + Tailwind 重写个人网站',
        color: '#6B8E6B',
        targetHours: 40,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      },
      {
        id: 'demo-web-fe',
        name: '前端重构',
        description: '组件库、路由、状态管理',
        color: '#6B8E6B',
        targetHours: 25,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 17 * 86400000).toISOString(),
        parentId: 'demo-web',
      },
      {
        id: 'demo-web-be',
        name: '后端 API',
        description: '接口设计、数据库、部署',
        color: '#6B8E6B',
        targetHours: 15,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
        parentId: 'demo-web',
      },
      {
        id: 'demo-fit',
        name: '健身计划',
        description: '每周三次有氧+力量训练，目标减脂增肌',
        color: '#4A90A4',
        targetHours: 100,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'demo-fit-cardio',
        name: '有氧运动',
        description: '跑步、游泳、骑行',
        color: '#4A90A4',
        targetHours: 50,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        parentId: 'demo-fit',
      },
      {
        id: 'demo-fit-strength',
        name: '力量训练',
        description: '上肢、下肢、核心',
        color: '#4A90A4',
        targetHours: 40,
        status: 'active' as const,
        createdAt: new Date(Date.now() - 13 * 86400000).toISOString(),
        parentId: 'demo-fit',
      },
      {
        id: 'demo-read',
        name: '阅读清单',
        description: '2026年阅读计划：技术、历史、小说',
        color: '#B85C6E',
        targetHours: 30,
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
    ]

    const taskPool = [
      // TS 类型系统（子项目）
      { text: 'TS 基础类型复习', projectId: 'demo-ts-type' },
      { text: 'TS 泛型深入', projectId: 'demo-ts-type' },
      { text: 'TS 条件类型', projectId: 'demo-ts-type' },
      { text: 'TS 类型体操', projectId: 'demo-ts-type' },
      // TS 工程化（子项目）
      { text: 'TS 装饰器学习', projectId: 'demo-ts-eng' },
      { text: 'TS 工程化配置', projectId: 'demo-ts-eng' },
      { text: 'TS 类型推断练习', projectId: 'demo-ts-type' },
      // 前端重构（子项目）
      { text: '重构路由层', projectId: 'demo-web-fe' },
      { text: '优化 CSS 架构', projectId: 'demo-web-fe' },
      { text: '实现组件库', projectId: 'demo-web-fe' },
      { text: '写单元测试', projectId: 'demo-web-fe' },
      // 后端 API（子项目）
      { text: '设计数据层', projectId: 'demo-web-be' },
      { text: '性能优化调研', projectId: 'demo-web-be' },
      { text: '部署上线', projectId: 'demo-web-be' },
      // 有氧运动（子项目）
      { text: '跑步 5km', projectId: 'demo-fit-cardio' },
      { text: '游泳 1000m', projectId: 'demo-fit-cardio' },
      // 力量训练（子项目）
      { text: '力量训练上肢', projectId: 'demo-fit-strength' },
      { text: '力量训练下肢', projectId: 'demo-fit-strength' },
      { text: '瑜伽放松', projectId: 'demo-fit-cardio' },
      // 阅读清单（父项目）
      { text: '阅读《三体》', projectId: 'demo-read' },
      { text: '阅读《置身事内》', projectId: 'demo-read' },
      { text: '阅读《人类简史》', projectId: 'demo-read' },
      { text: '阅读《思考，快与慢》', projectId: 'demo-read' },
    ]

    // 不覆盖已有日历数据，只合并
    const allEntries: Record<string, DayEntry> = (() => {
      try {
        const raw = localStorage.getItem(ENTRIES_KEY)
        if (!raw) return {}
        return JSON.parse(raw)
      } catch {
        return {}
      }
    })()

    for (let offset = 13; offset >= 0; offset--) {
      const d = new Date()
      d.setDate(d.getDate() - offset)
      d.setHours(0, 0, 0, 0)
      const dateStr = formatDateStr(d)
      const seedBase = `demo-${dateStr}`

      // 如果这一天已有数据，跳过（保留用户真实数据）
      if (allEntries[dateStr]?.todos?.length) continue

      const count = Math.round(seededRandom(seedBase, 1, 3))
      const shuffled = [...taskPool].sort((a, b) => {
        const ra = pseudoRandom(`${seedBase}-${a.text}`)
        const rb = pseudoRandom(`${seedBase}-${b.text}`)
        return ra - rb
      })
      const selected = shuffled.slice(0, count)

      const todos: TodoItem[] = selected.map((t, idx) => {
        const hour = Math.round(seededRandom(`${seedBase}-h-${idx}`, 8, 20))
        const durationMin = Math.round(seededRandom(`${seedBase}-d-${idx}`, 30, 180))
        const done = offset <= 1
          ? seededRandom(`${seedBase}-done-${idx}`, 0, 1) > 0.5
          : seededRandom(`${seedBase}-done-${idx}`, 0, 1) > 0.25

        const start = new Date(d.getTime() + hour * 3600000)
        const end = new Date(start.getTime() + durationMin * 60000)

        return {
          id: generateId(),
          text: t.text,
          done,
          doneAt: done ? end.toISOString() : undefined,
          timeRecords: [
            {
              id: generateId(),
              startAt: start.toISOString(),
              endAt: end.toISOString(),
              duration: durationMin * 60,
            },
          ],
          projectId: t.projectId,
        }
      })

      allEntries[dateStr] = {
        date: dateStr,
        todos,
        diary: '',
      }
    }

    saveProjects(projects)
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(allEntries))
    localStorage.setItem(SEED_MARKER, '1')
  } catch (e) {
    console.error('Failed to seed demo data:', e)
  }
}
