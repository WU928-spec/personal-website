# 长期主义生活博客视觉改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前个人网站改造成内容优先、真诚耐读、适合长期写作的生活博客，并用真实展示笔记验证排版。

**Architecture:** 保留 React/Supabase、全部路由与现有数据接口，仅重构视觉组件和共享主题。首页首屏通过 `fetchNotes()` 复用真实笔记，空数据时展示欢迎语；展示随笔通过现有编辑器写入，不增加第二套数据通道。

**Tech Stack:** React 19、TypeScript、Vite、Tailwind CSS、Framer Motion、Supabase、react-markdown、KaTeX、Shiki、Vitest、Testing Library。

**Spec:** `docs/superpowers/specs/2026-11-02-lifestyle-blog-redesign-design.md`

## Global Constraints

- 保留现有功能、Supabase 数据、localStorage、路由和读写语义，不销毁或迁移旧数据。
- 保留 `/notes`、旧 `/obsidian` 重定向、五个小工具、管理路由和隐藏星空入口。
- 保留 Markdown/GFM/LaTeX、代码高亮、编辑器、搜索、中英文、深浅主题与减少动态效果支持。
- 不新增后端、CMS、UI 框架、数据源或产品依赖，不自动提交或推送 Git。
- 用户授权创建少量随机生活随笔；通过现有编辑器真实保存，云端不可用时不得伪造成功。
- 不恢复虚构统计、随机贡献图、技能标签或占位社交链接。

## Review Focus

- 空笔记与请求失败：首屏欢迎语、导航和个人介绍仍可用，由 Task 2 的 Hero 测试覆盖。
- 中英文与长中文标题：标题换行、文章链接和空态文案正确，由 Task 2 测试和 Task 4 浏览器检查覆盖。
- 长公式、代码与表格窄屏：只让内容容器滚动，由 Task 3 渲染测试和 Task 4 移动验收覆盖。
- 深色模式与减少动态：文字对比清晰，无延迟入场，由 Task 1/3 的现有测试与 Task 4 浏览器检查覆盖。
- 展示随笔写入失败：不得出现虚假的成功状态或虚构云端内容，由 Task 4 的实际编辑器流程检查。

---

### Task 1: 共享主题、导航与页脚

**Files:**
- Modify: `app/src/index.css`
- Modify: `app/tailwind.config.js`
- Modify: `app/src/components/Navbar.tsx`
- Modify: `app/src/components/Footer.tsx`
- Modify: `app/src/components/StarryLink.tsx`
- Modify: `app/src/i18n/translations.ts`

**Interfaces:**
- Consumes: 现有 `useLang/useTheme`、真实 Footer 数据、公开路由和 `StarryLink`。
- Produces: 暖纸白/墨黑/酒红共享主题；所有后续组件沿用相同 Tailwind 变量。

- [ ] **Step 1: 固定导航与隐藏入口的现有行为**

Run: `cd app && npm test -- --run src/App.test.tsx src/components/StarryLink.test.tsx`
Expected: PASS，作为视觉改造前基线。

- [ ] **Step 2: 实施共享配色与字体**

在 `:root` 将 Parchment 设为暖纸白、Ink 设为墨黑、Amber 改为酒红、Sand 改为暖灰边框；深色使用柔和深灰和提亮酒红。保留变量名以避免大范围业务改动，但新增注释说明 Amber 当前语义是酒红强调色。

字体栈改为：

```js
display: ['"Playfair Display"', '"Noto Serif SC"', 'serif'],
body: ['Inter', '"Noto Sans SC"', 'sans-serif'],
mono: ['"JetBrains Mono"', 'monospace'],
ui: ['Inter', '"Noto Sans SC"', 'sans-serif'],
```

在 Google Fonts import 中加入 `Noto Serif SC:400;500;600` 与 `Noto Sans SC:400;500;600`。保留本地 serif/sans 回退。

- [ ] **Step 3: 实施文字品牌导航和简洁页脚**

Navbar 用 `Jasper` 文字链接替代图标，品牌下只保留一句小注；桌面导航仍只有 `/`、`/moments`、`/notes`，右侧搜索、语言和主题控件不变。移动菜单保留小工具入口。

Footer 使用现有真实链接、版权和工具入口，增加上下留白与细分隔线，不增加营销文案。StarryLink 改为酒红悬停和细轨道，aria-label 继续为“进入星空”。

翻译新增：

```ts
// homeExtra，中英文分别添加
brandNote: '记录生活，也记录思考', // EN: 'Notes on life and thoughts'
```

- [ ] **Step 4: 验证导航行为与视觉**

Run: `cd app && npm test -- --run src/App.test.tsx src/components/StarryLink.test.tsx && npm run build`
Expected: PASS。浏览器检查桌面/移动导航、深浅主题、页脚工具和星空入口，无旧配色残留。

### Task 2: 内容优先的首页文章流

**Files:**
- Create: `app/src/components/home/HeroSection.test.tsx`
- Modify: `app/src/components/home/HeroSection.tsx`
- Modify: `app/src/components/home/RecentMomentsSection.tsx`
- Modify: `app/src/components/home/LatestNotesSection.tsx`
- Modify: `app/src/components/home/IntroSection.tsx`
- Modify: `app/src/components/home/GitHubSection.tsx`
- Modify: `app/src/components/RepoCard.tsx`
- Modify: `app/src/pages/Home.tsx`
- Modify: `app/src/i18n/translations.ts`

**Interfaces:**
- Consumes: `fetchNotes(): Promise<NoteMeta[]>`、`selectLatestNotes(notes, 1)`、现有 `useMoments()`、真实 GitHub API。
- Produces: Hero 最新笔记链接 `/notes?note=<encodeURIComponent(slug)>`；空态只展示欢迎语和 `/notes` 入口。

- [ ] **Step 1: 写 Hero 最新笔记与空态失败测试**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HeroSection from './HeroSection'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { fetchNotes } from '@/services/noteClient'
import type { NoteMeta } from '@/types'

vi.mock('@/services/noteClient', () => ({ fetchNotes: vi.fn() }))
const mocked = vi.mocked(fetchNotes)
const note: NoteMeta = {
  slug: '春日', title: '春日记录', date: '2026-01-01', category: '生活', tags: [],
  excerpt: '一些真实的日常。', modified: '2026-01-01T00:00:00Z', filePath: '春日.md',
}

function renderHero() {
  return render(<HelmetProvider><PreferencesProvider><AuthProvider><MemoryRouter><HeroSection /></MemoryRouter></AuthProvider></PreferencesProvider></HelmetProvider>)
}

it('links the latest real note directly from the welcome section', async () => {
  mocked.mockResolvedValue([note])
  renderHero()
  const link = await screen.findByRole('link', { name: /春日记录/ })
  expect(link).toHaveAttribute('href', '/notes?note=%E6%98%A5%E6%97%A5')
})

it('keeps a useful notes link when no notes are available', async () => {
  mocked.mockResolvedValue([])
  renderHero()
  expect(await screen.findByRole('link', { name: /去读笔记|Read my notes/ })).toHaveAttribute('href', '/notes')
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd app && npm test -- --run src/components/home/HeroSection.test.tsx`
Expected: FAIL，因为当前 Hero 不读取笔记，也不存在最新文章链接。

- [ ] **Step 3: 实现欢迎语与真实最新文章**

Hero 使用 `fetchNotes()`，通过 `selectLatestNotes(list, 1)[0]` 取真实最新文章，effect 用 active 标记和 `try/catch/finally`。主标题使用中英文翻译：

```ts
blogHeroTitle: '记录生活，也记录那些慢慢想清楚的事。', // EN: 'Notes on life, and on things worth thinking through.'
latestLabel: '最近写下', // EN: 'Latest note'
readLatest: '阅读这篇', // EN: 'Read this note'
readNotes: '去读笔记', // EN: 'Read my notes'
```

最新文章存在时显示日期、标题、excerpt 与真实链接；无文章或失败时显示 `readNotes` 链接。移除大幅头像、打字动画和双 CTA，保留一次无延迟淡入。

- [ ] **Step 4: 实现连续内容流与个人档案**

RecentMoments 首条照片使用较大画幅，其余紧凑排列，无照片时直接显示文字。LatestNotes 改为日期、标题、摘要和细分隔线的文章列表，不再使用三列相同卡片。

Intro 使用小头像、标题、短文和真实 fields，并移动到 Hero 之后、动态之前。Home 顺序为 Hero、Intro、RecentMoments、LatestNotes、GitHub。GitHub/RepoCard 保留真实仓库和错误降级，改成与文章流一致的条目。

- [ ] **Step 5: 验证首页**

Run: `cd app && npm test -- --run src/components/home/HeroSection.test.tsx src/pages/Home.test.tsx src/components/home/RecentMomentsSection.test.tsx && npm run build`
Expected: PASS。浏览器确认首屏先看到文字与真实文章，空数据、中文长标题和英文模式均不破坏布局。

### Task 3: 笔记列表与阅读排版

**Files:**
- Modify: `app/src/components/notes/NotesIndex.tsx`
- Modify: `app/src/components/notes/NoteArticle.tsx`
- Modify: `app/src/components/MarkdownRenderer.tsx`
- Modify: `app/src/components/markdown/render-components.tsx`
- Modify: `app/src/components/markdown/CodeBlock.tsx`
- Modify: `app/src/index.css`

**Interfaces:**
- Consumes: 现有 Note/NoteMeta、MarkdownRenderer、目录、编辑器和公式/代码样式。
- Produces: 与首页一致的文章列表和约 680px 阅读行宽，不改变任何数据接口。

- [ ] **Step 1: 运行笔记与 Markdown 基线测试**

Run: `cd app && npm test -- --run src/components/notes src/components/MarkdownRenderer.test.tsx src/components/markdown`
Expected: PASS。

- [ ] **Step 2: 实施文章化视觉**

NotesIndex 使用清晰大标题、日期和摘要，列表行之间使用细分隔线，保留新建按钮与空态翻译。NoteArticle 使用居中标题、分类/日期、折叠目录和 `max-w-[680px]` 正文。

渲染组件统一酒红链接、低对比表格边框、纸张式引用和响应式图片。保留 `highlightCode` 的异常回退、过期结果忽略和复制按钮；不改变 Markdown/LaTeX 解析行为。

- [ ] **Step 3: 运行测试与窄屏验收**

Run: `cd app && npm test -- --run src/components/notes src/components/MarkdownRenderer.test.tsx src/components/markdown && npm run build && npm run lint`
Expected: PASS。375px 下检查长公式、代码块和表格只让自身容器滚动，目录链接仍匹配实际标题 id。

### Task 4: 展示随笔、文档与最终验收

**Files:**
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: 完整视觉改造、现有 `/login` 和笔记编辑器。
- Produces: 若 Supabase 可用，创建真实可编辑的生活随笔；否则记录无法写入并保留空态。

- [ ] **Step 1: 创建三篇展示随笔**

通过现有登录和笔记编辑器依次创建，文件名固定为 `一个普通的周末.md`、`最近在读什么.md`、`散步时想到的一点数学.md`。不得绕过编辑器或伪造保存结果。

内容分别为：

```md
# 一个普通的周末

睡到自然醒，去附近的小店买一杯咖啡。下午整理书桌，把没读完的书往沙发上搬。

## 今天的小事

- 给绿植换了位置
- 沿着河边走了四十分钟
- 晚饭尝试做了番茄炖菜

> 普通的一天也值得留下来。
```

```md
# 最近在读什么

最近读得很慢，但偶尔会停下来抄一句话。

| 类型 | 正在读 | 当前感受 |
| --- | --- | --- |
| 小说 | 一本关于家庭的故事 | 安静、细腻 |
| 随笔 | 一册城市观察 | 想出去散步 |
```

```md
# 散步时想到的一点数学

散步路线大致是一个圆。若半径是 $r$，一圈的距离就是：

$$C = 2\pi r$$

走快一点不会改变距离，只会改变我注意到多少风景。
```

保存失败时停止继续写入，记录真实错误并保留空态，不用本地假文章冒充成功。

- [ ] **Step 2: 更新项目文档**

AGENTS 的视觉说明改为“长期主义生活博客”，记录暖纸白/墨黑/酒红、内容优先首页、参考规格路径；保留现有数据、路由、工具、隐藏入口和测试约定。

- [ ] **Step 3: 完整浏览器验收**

检查首页、动态、笔记、五个工具、登录/个人资料、旧 `/obsidian` 重定向和隐藏星空。覆盖 375/768/1440px、深浅主题、英文、减少动态效果和远程失败。

- [ ] **Step 4: 最终标准验证**

Run:

```bash
cd app
npm test -- --run
npm run build
npm run lint
```

Expected: 全部 PASS。最终报告给出测试数量、真实展示笔记保存结果、浏览器验收范围，以及未能验证的云端行为。
