# 个人网站定位与视觉改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有网站改造成面向朋友与熟人的温暖生活杂志式个人主页，删除任务管理，保留动态、小工具和隐藏星空入口，并提供精美的 Markdown/GFM/LaTeX 笔记阅读体验。

**Architecture:** 保留 React/Vite/Supabase 与现有数据表，以新的 `noteClient` 和笔记页面替代 Obsidian 文件库界面；首页通过小型数据选择函数复用 Moments、notes 和 GitHub 数据。导航、页脚、搜索与路由统一收缩，任务模块在引用清零后删除，云端和本地数据不销毁。

**Tech Stack:** React 19、TypeScript strict、Vite 7、Tailwind CSS 3、React Router 7、Framer Motion、react-markdown、KaTeX、Shiki、Supabase、Vitest、Testing Library。

**Spec:** `docs/superpowers/specs/2026-11-02-personal-site-redesign-design.md`

## Global Constraints

- 不修改 Supabase 表结构，不清空 localStorage，不删除任何云端笔记、动态、任务或项目记录。
- 小工具 `/tools`、`/internship`、`/text-segmenter`、`/movie-recommender`、`/devtools`、`/git-conda-guide` 全部保留。
- `/login`、`/profile` 可直接访问但不显示公开入口；`/starry` 及子路由保留，页脚四角星是隐藏入口。
- 公开路由使用 `/notes`；旧 `/obsidian?note=...` 重定向并保留 note 参数与中文 slug。
- 笔记支持标准 Markdown、GFM、LaTeX 和代码高亮；Wikilink、标题折叠、Obsidian Callout 不再是新界面要求。
- 不编造城市、技能、社交链接、仓库统计或个人照片；真实资料缺失时使用中性文案。
- 使用 `@/` 路径别名、严格 TypeScript、`import type`；组件超过约 350 行时按职责拆分。
- 不新增后端、CMS 或 UI 框架，不自动执行 git commit。

## Review Focus

- 中文标题、中文 slug 与旧 `/obsidian` 分享链接：应生成可读锚点并无损跳转，由 Task 1 和 Task 2 的测试与浏览器步骤覆盖。
- `$...$`、`$$...$$`、代码围栏和表格混合内容：LaTeX 应渲染，公式源码不应出现在摘要，长公式/代码不得撑破移动端，由 Task 1 测试覆盖。
- Supabase 未配置、请求失败、空笔记或空动态：首页个人介绍仍可用，分区显示非阻塞空态，由 Task 3 的组件测试与 Task 6 浏览器验证覆盖。
- 无效日期、空标题、`__folder__` 占位记录：列表不得出现 `Invalid Date`、空白链接或占位笔记，由 Task 1 的选择函数测试覆盖。
- 隐藏星空入口、键盘焦点、减少动态效果与窄屏：装饰不得成为访问障碍，动画不得强制播放，由 Task 4 的交互测试和 Task 6 的浏览器检查覆盖。

---

### Task 1: 笔记数据与 Markdown 基础

**Files:**
- Create: `app/src/services/noteClient.ts`
- Modify: `app/src/types/index.ts`
- Create: `app/src/utils/noteContent.ts`
- Create: `app/src/utils/noteContent.test.ts`
- Modify: `app/src/components/markdown/parser.ts`
- Modify: `app/src/components/markdown/parser.test.ts`
- Modify: `app/src/components/MarkdownRenderer.tsx`
- Modify: `app/src/components/markdown/render-components.tsx`
- Modify: `app/src/components/markdown/CodeBlock.tsx`
- Modify: `app/src/components/markdown/Heading.tsx`
- Modify: `app/src/components/markdown/Blockquote.tsx`
- Delete: `app/src/components/markdown/heading-context.ts`
- Delete: `app/src/components/markdown/Callout.tsx`
- Create: `app/src/components/MarkdownRenderer.test.tsx`

**Interfaces:**
- Produces: `NoteMeta`、`Note`、`fetchNotes(): Promise<NoteMeta[]>`、`fetchNote(slug: string): Promise<Note | null>`、`saveNote(path: string, content: string): Promise<boolean>`、`deleteNote(path: string): Promise<boolean>`、`renameNote(oldPath: string, newPath: string): Promise<boolean>`。
- Produces: `slugifyNotePath(path: string): string`、`createNoteExcerpt(content: string, maxLength?: number): string`、`selectLatestNotes(notes: NoteMeta[], limit?: number): NoteMeta[]`。
- Produces: `preprocessMarkdown(content: string): string`、`slugifyHeading(text: string): string`、`extractToc(content: string): TocItem[]`。
- Consumes: 现有 Supabase `notes` 表的 `path/content/created_at/updated_at` 字段。

- [ ] **Step 1: 写笔记内容处理的失败测试**

```ts
// app/src/utils/noteContent.test.ts
import { createNoteExcerpt, selectLatestNotes, slugifyNotePath } from './noteContent'
import type { NoteMeta } from '@/types'

const meta = (filePath: string, modified: string): NoteMeta => ({
  slug: slugifyNotePath(filePath), title: filePath.replace(/\.md$/, ''), date: modified.slice(0, 10),
  category: '笔记', tags: [], excerpt: '', modified, filePath,
})

describe('note content', () => {
  it('preserves Chinese paths in slugs', () => {
    expect(slugifyNotePath('生活/春日 记录.md')).toBe('生活-春日-记录')
  })

  it('removes markdown, code and formula source from excerpts', () => {
    const source = '# 标题\n\n```ts\nconst secret = true\n```\n\n**你好** $x^2$\n\n$$\\frac{1}{2}$$'
    expect(createNoteExcerpt(source)).toBe('标题 你好')
  })

  it('sorts valid dates, filters placeholders and invalid rows, and applies the limit', () => {
    const rows = [
      meta('old.md', '2025-01-01T00:00:00Z'),
      meta('folder/__folder__', '2026-01-01T00:00:00Z'),
      meta('bad.md', 'not-a-date'),
      meta('new.md', '2026-01-01T00:00:00Z'),
    ]
    expect(selectLatestNotes(rows, 1).map((note) => note.title)).toEqual(['new'])
  })

  it('falls back to the slug when a filename is blank', () => {
    expect(selectLatestNotes([meta('.md', '2026-01-01T00:00:00Z')], 3)[0].title).toBe('未命名笔记')
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- --run src/utils/noteContent.test.ts`
Expected: FAIL，提示无法加载 `./noteContent`。

- [ ] **Step 3: 实现类型、数据客户端与内容选择**

`app/src/types/index.ts` 只保留下列笔记类型；其他文件的引用在后续任务迁移：

```ts
export interface NoteMeta {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  modified: string
  filePath: string
}

export interface Note extends NoteMeta {
  content: string
  frontmatter: Record<string, unknown>
}
```

`app/src/utils/noteContent.ts` 实现：

```ts
import type { NoteMeta } from '@/types'

export function slugifyNotePath(path: string): string {
  return path.replace(/\.md$/i, '').replace(/\//g, '-').replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9一-龥\-_]/g, '').substring(0, 80)
}

export function createNoteExcerpt(content: string, maxLength = 120): string {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]+\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[>#+\-*\s]+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text
}

export function selectLatestNotes(notes: NoteMeta[], limit = 3): NoteMeta[] {
  return notes
    .filter((note) => !note.filePath.endsWith('/__folder__') && !note.filePath.endsWith('__folder__'))
    .filter((note) => Number.isFinite(Date.parse(note.modified)))
    .sort((a, b) => Date.parse(b.modified) - Date.parse(a.modified))
    .slice(0, limit)
    .map((note) => ({ ...note, title: note.title || '未命名笔记' }))
}
```

`noteClient.ts` 从现有 `obsidianClient.ts` 移入 `TABLE = 'notes'`、标签提取、读写和重命名逻辑，导出 `fetchNotes/fetchNote/saveNote/deleteNote/renameNote`。行映射使用 `title = basename(path).replace(/\.md$/i, '') || '未命名笔记'`、`excerpt = createNoteExcerpt(content)`；不保留 tree、Wikilink、inbound links 或 legacy no-op API。

- [ ] **Step 4: 运行内容测试**

Run: `cd app && npm test -- --run src/utils/noteContent.test.ts`
Expected: 4 个测试全部 PASS。

- [ ] **Step 5: 写 Markdown 与中文目录的失败测试**

将 `parser.test.ts` 的 Wikilink 用例替换为：

```ts
import { extractToc, preprocessMarkdown, slugifyHeading } from './parser'

describe('standard markdown', () => {
  it('keeps LaTeX blocks and unwraps plain double-dollar text', () => {
    expect(preprocessMarkdown('$$\\frac{1}{2}$$')).toBe('$$\\frac{1}{2}$$')
    expect(preprocessMarkdown('$$plain text$$')).toBe('plain text')
  })

  it('creates unique Chinese heading anchors and ignores fenced code', () => {
    const source = '## 春日 记录\n```md\n## 不是标题\n```\n### 阅读 & 思考\n## 春日 记录'
    expect(slugifyHeading('春日 记录')).toBe('春日-记录')
    expect(extractToc(source)).toEqual([
      { level: 2, text: '春日 记录', id: '春日-记录' },
      { level: 3, text: '阅读 & 思考', id: '阅读--思考' },
      { level: 2, text: '春日 记录', id: '春日-记录-1' },
    ])
  })
})
```

新增 `MarkdownRenderer.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import MarkdownRenderer from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders GFM tables and LaTeX with accessible headings', () => {
    const { container } = render(<MarkdownRenderer content={'## 中文标题\n\n$E=mc^2$\n\n| A | B |\n| - | - |\n| 1 | 2 |'} />)
    expect(screen.getByRole('heading', { name: '中文标题' }).id).toBe('中文标题')
    expect(container.querySelector('.katex')).not.toBeNull()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: 运行测试并确认旧接口失败**

Run: `cd app && npm test -- --run src/components/markdown/parser.test.ts src/components/MarkdownRenderer.test.tsx`
Expected: FAIL，提示 `preprocessMarkdown` 或 `slugifyHeading` 未导出。

- [ ] **Step 7: 实现标准 Markdown 渲染**

`parser.ts` 保留 frontmatter 与 `TocItem`，新增：

```ts
export function slugifyHeading(text: string): string {
  return text.toLowerCase().trim().replace(/[^\p{Letter}\p{Number}\s-]/gu, '').replace(/\s+/g, '-')
}

export function preprocessMarkdown(content: string): string {
  if (!content) return ''
  const normalized = content.replace(/\$\$\$\$/g, '$$\n\n$$')
  return normalized.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner: string) =>
    /\\[a-zA-Z]+/.test(inner) ? match : inner.trim())
}

export function extractToc(content: string): TocItem[] {
  const source = content.replace(/```[\s\S]*?```/g, '')
  const counts = new Map<string, number>()
  return source.split('\n').flatMap((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) return []
    const text = match[2].replace(/\*\*|\*|__|_|`|\[.*?\]\(.*?\)/g, '').trim()
    const baseId = slugifyHeading(text)
    const count = counts.get(baseId) ?? 0
    counts.set(baseId, count + 1)
    return [{ level: match[1].length, text, id: count ? `${baseId}-${count}` : baseId }]
  })
}
```

`MarkdownRenderer.tsx` 删除 collapse state、DOM 查询、Wikilink props 和 HeadingCollapseContext，直接以 `preprocessMarkdown(content)` 渲染 `ReactMarkdown`，插件继续使用 `remarkGfm/remarkMath/remarkBreaks/rehypeKatex/rehypeSlug`，不再启用 `rehypeRaw`。`buildComponents()` 改为无参数，删除 Wikilink 分支，内部 `/notes` 链接使用 React Router `Link`，外部链接使用 `target="_blank" rel="noopener noreferrer"`。`Heading.tsx` 改为只渲染语义标题与 `scroll-mt-24`，不读取 Context；`Blockquote.tsx` 改为标准左边框引用，不解析 Callout；删除不再被引用的 `heading-context.ts` 与 `Callout.tsx`。

正文类采用 `text-[1.0625rem] leading-[1.9] text-Ink/85 dark:text-white/80`，标题采用 `scroll-mt-24 font-display`，表格保留横向滚动，图片保留 `loading="lazy"` 与 alt。CodeBlock 在 Shiki Promise 未完成时显示 `<pre><code>{code}</code></pre>`，完成后再替换高亮 HTML；复制按钮保持可用。

- [ ] **Step 8: 运行 Markdown 测试与构建检查**

Run: `cd app && npm test -- --run src/components/markdown/parser.test.ts src/components/MarkdownRenderer.test.tsx && npm run build`
Expected: 新测试 PASS；构建允许在后续尚未迁移的旧引用处失败，若有失败必须记录并在 Task 2、Task 4 清零，不得恢复旧接口来绕过。

### Task 2: 文章列表、阅读页与旧链接迁移

**Files:**
- Create: `app/src/hooks/useNotes.ts`
- Create: `app/src/pages/NotesPage.tsx`
- Create: `app/src/components/notes/NotesIndex.tsx`
- Create: `app/src/components/notes/NoteArticle.tsx`
- Create: `app/src/components/notes/NoteEditor.tsx`
- Create: `app/src/components/notes/NoteArticle.test.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/components/moment-uploader/NotePicker.tsx`
- Modify: `app/src/components/MomentCard.tsx`
- Modify: `app/src/components/MomentUploader.tsx`
- Delete: `app/src/pages/ObsidianBrowser.tsx`
- Delete: `app/src/components/NoteTree.tsx`
- Delete: `app/src/components/Backlinks.tsx`
- Delete: `app/src/services/linkParser.ts`
- Delete: `app/src/services/obsidianClient.ts`

**Interfaces:**
- Consumes: Task 1 的 `NoteMeta`、`Note`、`fetchNotes/fetchNote/saveNote/deleteNote/renameNote`、`MarkdownRenderer` 和 `extractToc`。
- Produces: `useNotes()` 返回 `{ notes, loading, selectedNote, selectNote, refresh, save, remove }`；`save(path, content)` 与 `remove(path)` 返回 `Promise<boolean>`。
- Produces: `/notes` 列表与 `/notes?note=<slug>` 阅读地址；旧地址使用 `<Navigate replace to={{ pathname: '/notes', search: location.search }} />`。

- [ ] **Step 1: 写文章页失败测试**

```tsx
// app/src/components/notes/NoteArticle.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NoteArticle from './NoteArticle'
import type { Note } from '@/types'

const note: Note = {
  slug: '春日', title: '春日记录', date: '2026-01-01', category: '生活', tags: ['春天'],
  excerpt: '', modified: '2026-01-01T00:00:00Z', filePath: '春日.md', frontmatter: {},
  content: '## 小标题\n\n正文 $x^2$',
}

it('renders article metadata, contents and markdown without Obsidian controls', () => {
  const { container } = render(<MemoryRouter><NoteArticle note={note} /></MemoryRouter>)
  expect(screen.getByRole('heading', { level: 1, name: '春日记录' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '小标题' })).toHaveAttribute('href', '#小标题')
  expect(container.querySelector('.katex')).not.toBeNull()
  expect(screen.queryByText(/wikilink|vault|obsidian/i)).not.toBeInTheDocument()
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- --run src/components/notes/NoteArticle.test.tsx`
Expected: FAIL，提示无法加载 `./NoteArticle`。

- [ ] **Step 3: 实现数据 Hook 与文章组件**

`useNotes.ts` 在挂载时调用 `fetchNotes()`；`selectNote(slug)` 调用 `fetchNote(slug)` 并返回笔记；`save` 成功后刷新列表和当前文章；`remove` 成功后清空对应当前文章。所有函数处理 `false/null`，设置非阻塞 `error` 字符串，不抛出未捕获 Promise rejection。

`NoteArticle.tsx` 的公开 props 为：

```ts
interface NoteArticleProps {
  note: Note
  isLoggedIn?: boolean
  onEdit?: () => void
}
```

文章使用 `<article className="mx-auto max-w-[720px]">`；标题为 `h1`，日期与分类在标题上方；`extractToc(note.content)` 非空时，桌面 `<aside className="hidden xl:block fixed right-8 top-32 w-48">` 显示目录，移动端用 `<details>` 显示相同链接。正文懒加载 `MarkdownRenderer`，底部显示 tags。`onEdit` 仅在 `isLoggedIn && onEdit` 时渲染“编辑”按钮。

- [ ] **Step 4: 实现列表、编辑器和页面路由**

`NotesIndex.tsx` 接收 `notes: NoteMeta[]`、`onSelect(slug)` 和 `onCreate?: () => void`。列表每篇是带标题、日期、摘要的 `<button>`，空态显示“还没有笔记，第一篇文字正在路上。”；登录时提供“写笔记”按钮，不提供文件夹、拖拽、双链或 Vault 控件。

`NoteEditor.tsx` 是受控对话框，props 为 `{ note?: Note; onCancel(): void; onSave(path: string, content: string): Promise<boolean> }`。输入 path、textarea content；保存失败时在对话框内显示“保存失败，请稍后重试”，成功由父组件关闭；编辑已有笔记路径变化时由页面调用 `renameNote`，否则调用 `saveNote`。

`NotesPage.tsx` 同步 `note` query 参数与选中文章，提供新建、编辑、删除确认和空态；删除使用 `window.confirm`，仅调用前端 API，不批量处理文件夹。`App.tsx` 使用懒加载 NotesPage，并加入保留 query 的旧地址重定向：

```tsx
const Notes = lazy(() => import('./pages/NotesPage.tsx'))

function LegacyNotesRedirect() {
  const location = useLocation()
  return <Navigate replace to={{ pathname: '/notes', search: location.search }} />
}

// Routes 中：
<Route path="/notes" element={<LazyPage component={Notes} />} />
<Route path="/obsidian" element={<LegacyNotesRedirect />} />
```

将 `Navigate` 加入 `react-router-dom` import。MomentCard 的笔记附件跳转改为 `/notes?note=${encodeURIComponent(att.data)}`。NotePicker 改为调用 `fetchNotes()` 的扁平可搜索列表，props 使用 `onSelect(note: NoteMeta)`，不再读取 Vault tree；MomentUploader 的 `handleNoteSelect(note: NoteMeta)` 直接使用 `note.slug` 创建 `md-link` 附件，保留原有附件发布和打开行为。

- [ ] **Step 5: 运行文章测试与类型检查**

Run: `cd app && npm test -- --run src/components/notes/NoteArticle.test.tsx && npx tsc -b`
Expected: 测试 PASS；旧 Obsidian 文件删除后无未迁移类型或路径引用。

- [ ] **Step 6: 浏览器验证旧链接与阅读排版**

Run: `cd app && npm run dev -- --host 127.0.0.1`
Check: 打开 `/notes`、创建或选择一篇含中文标题、GFM 表格、代码块、行内/块级 LaTeX 的笔记；再打开同 slug 的 `/obsidian?note=...`。
Expected: 旧链接保留 note 参数跳转到 `/notes`；公式、目录、复制按钮、编辑保存均可用，375px 宽度只让公式/代码自身横向滚动。

### Task 3: 杂志式首页与真实内容分区

**Files:**
- Create: `app/src/components/home/RecentMomentsSection.tsx`
- Create: `app/src/components/home/LatestNotesSection.tsx`
- Create: `app/src/components/home/HomeSection.tsx`
- Create: `app/src/components/home/RecentMomentsSection.test.tsx`
- Modify: `app/src/pages/Home.tsx`
- Modify: `app/src/components/home/HeroSection.tsx`
- Modify: `app/src/components/home/IntroSection.tsx`
- Modify: `app/src/components/home/GitHubSection.tsx`
- Modify: `app/src/components/RepoCard.tsx`
- Modify: `app/src/data/about.ts`
- Modify: `app/src/data/site.ts`
- Delete: `app/src/components/home/SkillSection.tsx`

**Interfaces:**
- Consumes: `useMoments()`、`selectLatestNotes(notes, 3)`、`fetchNotes()`、真实 GitHub API 与 Zod `parseGitHubRepos`。
- Produces: `HomeSection({ eyebrow, title, description?, action?, children })` 统一首页标题与留白；`RecentMomentsSection` 和 `LatestNotesSection` 各自独立加载、独立失败。

- [ ] **Step 1: 写远程失败与空态测试**

```tsx
// app/src/components/home/RecentMomentsSection.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecentMomentsSection from './RecentMomentsSection'
import { useMoments } from '@/hooks/useMoments'

vi.mock('@/hooks/useMoments', () => ({ useMoments: vi.fn() }))
const mocked = vi.mocked(useMoments)

it('keeps a quiet empty state when moments are unavailable', () => {
  mocked.mockReturnValue({ moments: [], loading: false } as ReturnType<typeof useMoments>)
  render(<MemoryRouter><RecentMomentsSection /></MemoryRouter>)
  expect(screen.getByText('最近的生活')).toBeInTheDocument()
  expect(screen.getByText('新的故事正在酝酿。')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '查看全部动态' })).toHaveAttribute('href', '/moments')
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- --run src/components/home/RecentMomentsSection.test.tsx`
Expected: FAIL，提示组件不存在。

- [ ] **Step 3: 实现首页统一分区和最新内容**

`HomeSection` 输出带 eyebrow、h2、可选 description/action 的 `<section className="py-20 md:py-28">`，内容容器为 `mx-auto max-w-6xl px-6 md:px-12`。

RecentMomentsSection 只取 `moments.slice(0, 3)`，首条使用大图、其余两条并列；每条链接 `/moments`，图片用 `loading="lazy"`、固定 aspect ratio 和 alt，文字最多三行。空态使用测试中的“新的故事正在酝酿。”；loading 显示三块静态占位，不渲染同步错误 banner。

LatestNotesSection 调用 `fetchNotes()`，用 `selectLatestNotes(notes, 3)`；每篇链接 `/notes?note=${encodeURIComponent(note.slug)}`，显示日期、标题、excerpt。失败或空数组显示“新的文字正在路上。”，并保留“查看全部笔记”链接。

- [ ] **Step 4: 重做首屏、介绍和 GitHub**

HeroSection 删除 typing effect、Pluto badge 和 `/projects` 按钮。桌面使用 `grid min-h-[78dvh] grid-cols-[1.1fr_.9fr]`，移动单列；左侧显示小 eyebrow、`Hi, I’m Jasper`、hero.subtitle/tagline 和“看看我的动态”，右侧显示 `owner.avatar`，容器采用 `aspect-[4/5] max-h-[520px] w-full object-cover` 与细边框。`framer-motion` 只保留一次 300ms 淡入，并加 `useReducedMotion()`。

IntroSection 使用文字与少量真实 fields，不再显示 200px 重复头像；移除 `/projects` 链接。默认 About 中文改为“一个仍在探索中的普通人”，正文为“这里记录我的生活、阅读和随手写下的心得。很高兴你来坐坐。”，英文使用等价中性文案；默认 fields 为空数组，已存储的真实 fields 继续展示。

GitHubSection 删除贡献 API、随机网格、stats 和深色整块背景，初始 repos 为空，仅使用 API 真实返回；加载失败显示“GitHub 暂时无法访问，也可以稍后再来看看。”并保留真实 GitHub 主页链接。RepoCard 改为浅色/深色兼容的编辑式条目，不再使用固定白色文字。

Home 顺序为 Hero、Intro、RecentMoments、LatestNotes、GitHub，不再渲染 SkillSection。`site.ts` 删除 BlogPreview、Skill 和 GitHub 默认假数据及不再使用的存储同步 key，Footer 数据保留。

- [ ] **Step 5: 运行首页测试、全部测试与构建**

Run: `cd app && npm test -- --run && npm run build`
Expected: 测试与 strict TypeScript/Vite 构建 PASS；若仍有任务模块引用，继续 Task 4/5 清理后重跑，不添加假数据让测试通过。

- [ ] **Step 6: 浏览器检查视觉与降级**

Check: 桌面 1440px、移动 375px、深色模式；阻断 notes/moments/GitHub 请求后刷新。
Expected: 首屏可读到完整介绍，无打字等待和随机贡献图；三个远程分区各自空态，个人介绍和导航仍正常。

### Task 4: 导航、页脚、小工具与星空隐藏入口

**Files:**
- Modify: `app/src/components/Navbar.tsx`
- Modify: `app/src/components/Footer.tsx`
- Create: `app/src/components/StarryLink.tsx`
- Create: `app/src/components/StarryLink.test.tsx`
- Modify: `app/src/components/GlobalSearch.tsx`
- Modify: `app/src/data/site.ts`
- Modify: `app/src/i18n/translations.ts`
- Modify: `app/src/pages/Tools.tsx`

**Interfaces:**
- Produces: `StarryLink()` 输出可聚焦的 `/starry` React Router Link，aria-label 为“进入星空”。
- Consumes: `mainNavLinks` 仅首页 `/`、动态 `/moments`、笔记 `/notes`；小工具只在页脚与移动菜单次级区域出现。

- [ ] **Step 1: 写星空入口可访问性测试**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StarryLink from './StarryLink'

it('keeps the decorative star keyboard accessible', () => {
  render(<MemoryRouter><StarryLink /></MemoryRouter>)
  const link = screen.getByRole('link', { name: '进入星空' })
  expect(link).toHaveAttribute('href', '/starry')
  expect(link).toHaveClass('focus-visible:outline-none')
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- --run src/components/StarryLink.test.tsx`
Expected: FAIL，提示组件不存在。

- [ ] **Step 3: 实现美观的隐藏入口与页脚**

`StarryLink.tsx` 使用 Lucide `Sparkles` 和一条 CSS 圆环：

```tsx
<Link to="/starry" aria-label="进入星空" title=" "
  className="group relative ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-Slate/60 transition-colors hover:text-Amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Amber">
  <span aria-hidden="true" className="absolute inset-1 rounded-full border border-Amber/0 transition group-hover:rotate-45 group-hover:border-Amber/30" />
  <Sparkles aria-hidden="true" size={14} className="transition group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(196,120,58,.65)]" />
</Link>
```

将 StarryLink 放在 Footer 的 tagline 后面，不显示“彩蛋”文字。页脚链接固定为首页、动态、笔记、小工具；从 `defaultFooter` 删除 `/calendar`、`/projects` 和示例 Twitter/LinkedIn/`hello@example.com`，只保留真实 GitHub 与用户已配置链接。显示前过滤 `href.includes('example.com')`，避免旧 localStorage 继续展示示例地址。

- [ ] **Step 4: 收缩导航、搜索与移动菜单**

Navbar 的 `navLinks` 仅 `/`、`/moments`、`/notes`。桌面显示 GitHub、搜索、语言、主题，不显示登录/头像/编辑模式；登录用户需要编辑时仍可通过 `/profile` 使用管理功能。移动菜单在主导航下方加细分隔线，再放“小工具”链接，不显示登录或彩蛋目录。

GlobalSearch 统一导入 `fetchNotes`，笔记跳转 `/notes?note=...`，搜索提示改“搜索笔记和动态…”。Tools 页面保留五个工具和全部业务路由，仅将标题文案改“小工具”，移除“更多工具敬请期待”等占位尾部，不在首页推广。

- [ ] **Step 5: 运行测试与交互检查**

Run: `cd app && npm test -- --run src/components/StarryLink.test.tsx && npm run build`
Expected: PASS。浏览器中 Tab 能聚焦页脚星形，Enter 进入 `/starry`，返回后导航无“彩蛋”；页脚和移动菜单均能进入 `/tools`，五个工具卡片均可打开。

### Task 5: 删除任务模块与更新项目文档

**Files:**
- Modify: `app/src/App.tsx`
- Delete: `app/src/pages/Calendar.tsx`
- Delete: `app/src/pages/Projects.tsx`
- Delete: `app/src/pages/EasterEggs.tsx`
- Delete: `app/src/pages/About.tsx`
- Delete: `app/src/components/calendar/`（整个目录）
- Delete: `app/src/components/project/`（整个目录）
- Delete: `app/src/hooks/useProjectStats.ts`
- Delete: `app/src/utils/calendarStorage.ts`
- Delete: `app/src/utils/calendarStorage.test.ts`
- Delete: `app/src/utils/projectStorage.ts`
- Delete: `app/src/utils/projectAggregation.ts`
- Delete: `app/src/utils/projectAggregation.test.ts`
- Delete: `app/src/utils/projectSeed.ts`
- Delete: `app/src/utils/projectTimerStorage.ts`
- Delete: `app/src/types/calendar.ts`
- Modify: `app/src/i18n/translations.ts`
- Modify: `app/package.json`（仅在引用扫描确认后移除 `chinese-days`）
- Modify: `app/package-lock.json`（通过 npm install 更新）
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: Task 2/4 已迁移的路由、搜索、导航和笔记接口。
- Produces: 不再包含任务、工时、彩蛋目录和占位 About 的前端源码；不触碰 localStorage 或 Supabase 数据。

- [ ] **Step 1: 扫描所有删除候选的引用**

Use the Grep tool with `path: app/src` and pattern:

```text
calendarStorage|projectStorage|projectAggregation|projectSeed|projectTimerStorage|types/calendar|components/calendar|components/project|chinese-days|/calendar|/projects|easter-eggs|obsidianClient|ObsidianNote|VaultFile|/obsidian
```

Run a second Grep for `chinese-days` with `path: app/package.json`.

Expected: 只允许删除候选文件自身出现；保留旧 `/obsidian` 的 Navigate 重定向例外。若共享文件仍有引用，先迁移到保留功能，不能强删。

- [ ] **Step 2: 删除路由、模块和无效翻译**

App 删除 Calendar/Projects/EasterEggs lazy imports、对应 Route 和 `seedDemoDataIfEmpty` 初始化。删除文件清单中的模块及其专属测试，翻译删除 calendar/projects 专用命名空间，保留 nav.notes 与小工具文案。确认没有共享类型被误删。

- [ ] **Step 3: 清理依赖并同步 AGENTS**

若 Step 1 确认 `chinese-days` 无引用，执行 `cd app && npm uninstall chinese-days`。否则保留并在结果中说明实际消费者。

AGENTS 更新：核心功能改为个人主页、标准 Markdown/LaTeX 笔记、记忆碎片、小工具和隐藏星空；删除日历、项目工时、Wikilink 规范、任务同步表和 `/obsidian` 路由说明；记录 `/notes`、旧链接重定向、页脚隐藏入口、测试命令和“不销毁旧本地/云端数据”约定。

- [ ] **Step 4: 全量静态验证**

Run: `cd app && npm test -- --run && npm run build && npm run lint`
Expected: 全部 PASS；不允许通过删除保留功能测试、添加空 catch 或 `any` 消除错误。

### Task 6: 端到端视觉与功能验收

**Files:**
- Modify: 仅用于修复验收发现的问题，文件必须属于前述对应模块。

**Interfaces:**
- Consumes: 完整改造后的本地 Vite 应用和真实浏览器。

- [ ] **Step 1: 验证主要公开流程**

Run: `cd app && npm run dev -- --host 127.0.0.1`
Check: 首页 → 动态 → 笔记 → 阅读文章 → 返回首页 → 页脚小工具 → 五个工具页面。
Expected: 无空白页、无旧 Obsidian 文案、无任务/工时入口，前进后退与 query 参数正常。

- [ ] **Step 2: 验证管理与隐藏流程**

Check: 直接打开 `/login`、`/profile`、`/starry`、`/starry/secret`；使用页脚四角星进入星空；打开旧 `/obsidian?note=春日`。
Expected: 管理页和星空正常，四角星支持鼠标与键盘，旧笔记地址保留 slug 跳到 `/notes`；`/easter-eggs` 不再显示旧目录。

- [ ] **Step 3: 验证内容渲染与失败输入**

Check: 测试中文标题、重复标题、空标题、无日期笔记，含表格/代码/引用/图片/长行/中英文 LaTeX 的文章，空动态、无 Supabase、GitHub 断网。
Expected: 无 `Invalid Date`、无空白链接、无占位笔记；公式和代码仅在自身容器滚动；远程失败不影响首屏和联系方式。

- [ ] **Step 4: 验证响应式、主题与减少动态**

Check: 375px、768px、1440px，浅色/深色，键盘导航，系统 `prefers-reduced-motion: reduce`。
Expected: 无横向页面溢出，文字对比清晰，焦点可见，首屏不等待动画，星空装饰不喧宾夺主。

- [ ] **Step 5: 最终标准验证与残留扫描**

Run:

```bash
cd app
npm test -- --run
npm run build
npm run lint
```

Then use the Grep tool with `path: app/src` and pattern `/calendar|/projects|easter-eggs|Obsidian Vault|obsidian-wikilink|hello@example.com|San Francisco|generateContributionGrid`.

Expected: 测试、构建、lint 全部 PASS；扫描无残留（文档和明确保留的旧路由重定向除外）。最终报告列出实际测试数量、构建结果、浏览器验证范围，以及任何无法真实验证的 Supabase 管理操作。
