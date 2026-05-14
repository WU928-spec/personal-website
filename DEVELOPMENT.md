# 开发日志

> **最新重构**: 2026年5月10日完成全面代码重构，详见 [REFACTOR-2026-05-10.md](./REFACTOR-2026-05-10.md)
> 
> **重构成果**: 代码减少 1350 行，依赖减少 68%，添加类型安全和单元测试，核心模块 100% 测试覆盖

---

本文档记录项目的开发历史、已知问题和解决方案，用于在不同 AI 助手（Kimi Code、Claude Code 等）之间同步项目信息。

## 项目概述

个人博客名片网站，支持 Obsidian 笔记浏览和内部链接导航。

**技术栈**:
- React 19 + TypeScript
- Vite 7.2.4
- Tailwind CSS 3.4.19
- shadcn/ui
- React Router v7
- Markdown 渲染：react-markdown + remark/rehype

**服务**:
- 前端：http://localhost:3000
- Obsidian Server：http://localhost:2667

## 最近解决的问题

### 2026-05-14: 项目系统增强与日历项目计时

**1. 项目阶段总结**

文件: `app/src/types/calendar.ts`, `app/src/utils/projectStorage.ts`, `app/src/pages/Projects.tsx`, `app/src/components/project/ProjectCard.tsx`

- 新增 `ProjectSummary` 类型（标题/内容/日期），支持为每个项目添加多个阶段总结
- 项目卡片展开区域显示总结列表，支持添加和删除
- 数据随项目存 localStorage，Supabase 同步已对接（需 `projects` 表 `summaries` 列）

**2. 项目页面 UI 优化**

文件: `app/src/components/project/ProjectDetail.tsx`, `app/src/components/project/ProjectCard.tsx`, `app/src/components/project/TaskItem.tsx`

- 删除柱状图（`ProjectBarChart`）
- "添加子项目"和"添加阶段总结"按钮从展开区域的大按钮改为头部小 icon 按钮
- `TaskItem` 完成指示符从 `✅` 改为 `·`
- 修复 `ProjectDetail` 头部"最近 7 天 共 0m"与任务列表数据不一致的问题
- 父项目任务列表不再显示子项目的 todo

**3. 日历面板：今日待办 + 项目计时上下分屏**

文件: `app/src/components/calendar/TodayTaskList.tsx`（及拆分出的 `TodoItem.tsx`、`ProjectTimerItem.tsx`）

- 上半部分：今日待办（过滤掉项目计时的隐藏记录）
- 下半部分：活跃项目列表，可直接开始/停止计时
- 项目计时与待办计时互斥，停止后自动保存为隐藏 todo（`text: ''`）
- 项目计时的时间自动统计到项目中（dispatch `calendar-entry-saved` 事件）
- 项目计时区域显示项目总累计时间（非仅限今天）

**4. 任务时间编辑**

文件: `app/src/components/calendar/TodoItem.tsx`

- hover todo 行显示 `Clock` 编辑按钮
- 展开编辑面板，显示所有 timeRecords，每条可修改时长（分钟）和删除
- 适用于忘记停止计时、需要修正时长的场景

**5. 重构：拆分 TodayTaskList**

- `TodayTaskList.tsx`: 537 → 362 行（-175）
- 新建 `TodoItem.tsx`（181 行）：自包含编辑状态，渲染 todo 行 + 编辑面板
- 新建 `ProjectTimerItem.tsx`（55 行）：渲染单条项目计时
- 两个子组件可复用、可独立测试

---

### 2026-05-13: Obsidian 笔记系统功能修复与重构

**1. 修复空文件夹不显示**

文件: `app/src/services/obsidianClient.ts`

- `buildTree` 在 "Ensure all parent folders exist" 阶段不再跳过 `__folder__` 占位符
- 空文件夹（如 `folder1/__folder__`）现在能正确渲染在侧边栏中

**2. 修复右键"新建笔记"路径前缀缺失**

文件: `app/src/pages/ObsidianBrowser.tsx`

- `handleCreateNote` 中，当 `dialogTarget` 为文件夹路径时，自动 prepend 文件夹路径
- 例如：右键 `folder1` → 输入 `note1` → 实际创建 `folder1/note1.md`

**3. 简化新建笔记对话框 + 本地 Markdown 导入**

文件: `app/src/pages/ObsidianBrowser.tsx`

- 去掉 "路径如：math/linear-algebra.md" 提示文字
- placeholder 从 "路径/文件名.md" 改为 "笔记名"
- 新增"从本地上传 Markdown"按钮（支持多选 `.md` 文件）
- 导入时自动读取文件内容，文件名作为笔记名，支持放到当前文件夹下

**4. UI 微调**

文件: `app/src/i18n/translations.ts`, `app/src/pages/ObsidianBrowser.tsx`

- 侧边栏标题 "Vault 目录" → "目录"，"Vault 为空" → "目录为空"
- 删除主内容区刷新按钮（去除了未使用的 `loading` 状态）
- 笔记计数现在过滤掉 `__folder__` 占位符

**5. 重构：提取 NoteTree 组件**

文件: `app/src/components/NoteTree.tsx`（新建）, `app/src/pages/ObsidianBrowser.tsx`

- 将内联的 `ManagedTree` / `ManagedTreeItem` 拆分为独立的 `NoteTree.tsx`
- `ObsidianBrowser.tsx`: 846 行 → 730 行（-116 行）
- `NoteTree.tsx`: 135 行，自包含 imports、类型和递归渲染逻辑

---

### 2026-05-12: 修复子目录笔记显示、日历同步和动态闪烁问题

**问题 1: 子目录笔记无法显示**

**现象**: 只有根目录的 21 篇笔记能正常显示，952 篇子目录笔记（如 `CPA/CPA学习/会计.md`）无法加载

**原因**:
- `TreeItem` 组件从文件的 `name` 字段生成 slug（如 `会计`）
- 但 `index.json` 中的笔记 slug 是从完整路径生成的（如 `CPA-CPA学习-会计`）
- 导致点击树形结构中的子目录笔记时，传递的 slug 不匹配，无法加载内容

**解决方案** (`app/src/components/NoteTree.tsx`, `app/src/pages/ObsidianBrowser.tsx`):
```typescript
// 1. TreeItem 组件添加 notes 参数
interface TreeItemProps {
  notes?: ObsidianNoteMeta[]
}

// 2. 根据 filePath 查找真实 slug
const note = notes.find((n) => n.filePath === item.path)
const slug = note?.slug || fallbackSlug

// 3. 在 ObsidianBrowser 中传递 notes 数组
<TreeItem item={item} notes={notes} />
<RootFilesGroup files={files} notes={notes} />
```

**测试结果**:
- ✅ 所有 973 篇笔记（包括 952 篇子目录笔记）都能正常显示
- ✅ 点击任意文件夹中的笔记都能正确加载内容

---

**问题 2: 日历待办不显示**

**现象**: 在日历页面添加待办后，右侧的"今日待办"列表不显示，需要刷新页面才能看到

**原因**:
- `Calendar.tsx` 的 `syncCalendarEntries()` 是异步的，需要时间
- `TodayTaskList` 和 `TodayStatsPanel` 在组件挂载时立即读取 localStorage
- 如果 localStorage 为空（新设备/清空缓存），而 Supabase 数据还在同步中，就会显示空白

**解决方案**:

1. **calendarStorage.ts**: 同步完成后触发事件
```typescript
export async function syncCalendarEntries(): Promise<boolean> {
  // ... 同步逻辑
  window.dispatchEvent(new CustomEvent('calendar-sync-completed'))
  return true
}
```

2. **TodayTaskList.tsx**: 监听同步事件
```typescript
useEffect(() => {
  const handleSyncCompleted = () => {
    setEntry(loadTodayEntry())
  }
  window.addEventListener('calendar-sync-completed', handleSyncCompleted)
  return () => window.removeEventListener('calendar-sync-completed', handleSyncCompleted)
}, [])
```

3. **TodayStatsPanel.tsx**: 监听同步事件并刷新统计
```typescript
const [refreshKey, setRefreshKey] = useState(0)
useEffect(() => {
  const handleSyncCompleted = () => setRefreshKey(prev => prev + 1)
  window.addEventListener('calendar-sync-completed', handleSyncCompleted)
  // ...
}, [])
```

**测试结果**:
- ✅ 添加待办后，右侧列表立即更新
- ✅ 首次加载时，Supabase 同步完成后自动显示数据
- ✅ 统计面板（7天趋势、完成率等）同步刷新

---

**问题 3: 记忆碎片删除后闪烁重现**

**现象**: 从笔记页面切换到记忆碎片页面时，已删除的动态会闪烁一下然后消失（即使清空了 localStorage）

**原因**:
- 旧的加载逻辑：先显示 localStorage → 再异步加载 Supabase → 替换显示
- 这导致"先显示旧数据，再显示新数据"的闪烁效果
- 即使 localStorage 为空，也会先显示 MOCK 数据，然后等 Supabase 加载完才替换

**解决方案** (`app/src/hooks/useMoments.ts`):

1. **改变加载顺序**：先等待 Supabase，成功后直接显示
```typescript
const fetchMoments = useCallback(async () => {
  setLoading(true)
  
  // 1. 先尝试 Supabase（2s 超时保护）
  if (isSupabaseReady()) {
    try {
      const list = await fetchFromSupabase()
      setMoments(list)
      saveLocal(list)
      setLoading(false)
      return  // 成功后直接返回，不闪烁
    } catch (err) {
      console.warn('Supabase sync failed, falling back to local:', err)
    }
  }
  
  // 2. 降级：只有 Supabase 不可用时才使用 localStorage
  const local = loadLocal()
  setMoments(local.length > 0 ? sortDesc(local) : sortDesc(MOCK_MOMENTS))
  setLoading(false)
}, [])
```

2. **改进删除逻辑**：先删除云端，成功后再更新本地
```typescript
const deleteMoment = useCallback(async (id: string) => {
  // 先删除 Supabase
  if (isSupabaseReady()) {
    try {
      await supabase!.from('moments').delete().eq('id', id)
      // 成功后再更新本地
      const list = moments.filter((m) => m.id !== id)
      setMoments(list)
      saveLocal(list)
      return
    } catch (err) {
      console.warn('Supabase delete failed:', err)
    }
  }
  // 降级：仅本地删除
  const list = moments.filter((m) => m.id !== id)
  setMoments(list)
  saveLocal(list)
}, [moments])
```

**权衡**:
- 优点：彻底消除闪烁，数据一致性更好
- 缺点：首次加载需要等待 Supabase（最多 2 秒，有 loading 提示）

**测试结果**:
- ✅ 刷新页面不再闪烁
- ✅ 已删除的动态不会重新出现
- ✅ Supabase 作为唯一数据源，保证一致性

**相关文件**:
- `app/src/components/NoteTree.tsx` - 笔记树 slug 匹配修复
- `app/src/pages/ObsidianBrowser.tsx` - 传递 notes 数组
- `app/src/utils/calendarStorage.ts` - 同步完成事件
- `app/src/components/calendar/TodayTaskList.tsx` - 监听同步事件
- `app/src/components/calendar/TodayStatsPanel.tsx` - 监听同步事件
- `app/src/hooks/useMoments.ts` - 加载和删除逻辑优化

**相关 Commit**: 
- `184e5c4` - fix: 修复笔记浏览和日历同步问题
- `66eceff` - fix: 修复删除动态后闪烁重现的问题
- `80f42a5` - fix: 增强 Moments 同步逻辑和调试信息
- `10096bf` - fix: 彻底解决记忆碎片刷新时的闪烁问题

---

### 2026-05-09: Obsidian PDF 标注 Callout 显示修复 + 笔记搜索相关度排序

**问题描述**:
1. PDF 标注格式 `[!PDF|] [[原则.pdf#page=75|原则, p.75]]` 无法正确显示为 Callout
2. 笔记搜索结果没有按相关度排序，只是简单过滤

**解决方案**:

**1. PDF Callout 显示修复** (`app/src/components/MarkdownRenderer.tsx`)

问题原因：
- 正则表达式 `/^\[!(\w+)(?:\|[^\]]+)?\]/` 要求 `|` 后面至少有一个字符
- `[!PDF|]` 的 `|` 后面为空，导致匹配失败
- PDF 链接 `[[file.pdf#page=...|Display]]` 没有被预处理

修复方案：
```typescript
// 1. 修复正则表达式，允许 | 后面为空
const match = text.match(/^\[!(\w+)(?:\|[^\]]*)?\]\s*([^\n]*)/)

// 2. 在标题提取时处理 PDF 链接
let rawTitle = match[2].trim()
rawTitle = rawTitle.replace(
  /\[\[([^|\]]+\.pdf[^|\]]*)\|([^\]]+)\]\]/g, 
  (_m, _path, display) => display.trim()
)

// 3. 在 preprocessWikilinks 中处理 PDF 链接
processed = processed.replace(
  /\[\[([^|\]]+\.pdf[^|\]]*)\|([^\]]+)\]\]/g,
  (_match, _pdfPath: string, display: string) => display.trim()
)

// 4. 添加 PDF 样式
pdf: <Info size={16} className="text-Amber shrink-0" />
bgMap.pdf = 'rgba(var(--color-amber), 0.12)'
borderMap.pdf = '#C4783A'
```

**2. 笔记搜索相关度排序** (`app/src/pages/ObsidianBrowser.tsx`)

实现与全局搜索相同的评分算法：
```typescript
const calcNoteScore = (note: ObsidianNote, query: string): number => {
  // 标题匹配（最高权重）
  if (title === query) score += 100
  else if (title.startsWith(query)) score += 80
  else if (title.includes(query)) score += 60

  // 标签匹配
  if (tags.some(tag === query)) score += 50
  else if (tags.some(tag.includes(query))) score += 40

  // 分类匹配
  if (category === query) score += 45
  else if (category.includes(query)) score += 35

  // 摘要/内容匹配
  if (excerpt === query) score += 30
  else if (excerpt.startsWith(query)) score += 25
  else if (excerpt.includes(query)) score += 20
}

const filteredNotes = notes
  .filter(/* 包含查询词 */)
  .map(n => ({ note: n, score: calcNoteScore(n, q) }))
  .sort((a, b) => b.score - a.score)
  .map(item => item.note)
```

**测试结果**:
- ✅ PDF 标注 Callout 正确显示为琥珀色卡片
- ✅ 标题显示为 "原则, p.75"（不包含 PDF 链接）
- ✅ 笔记搜索结果按相关度排序
- ✅ 标题完全匹配的笔记排在最前面

**相关文件**:
- `app/src/components/MarkdownRenderer.tsx` - PDF Callout 修复
- `app/src/pages/ObsidianBrowser.tsx` - 搜索相关度排序

**相关 Commit**: 待提交

---

### 2026-05-09: 标题折叠功能 + 文档内锚点跳转

**功能需求**:
1. 标题折叠：点击标题前的箭头图标可以收起/展开下属内容（类似 Obsidian）
2. 文档内锚点跳转：`[[#标题]]` 格式的链接可以跳转到同一文档内的对应标题

**实现方案**:

**1. 文档内锚点跳转** (`app/src/components/MarkdownRenderer.tsx:199-220`)
- 在 `preprocessWikilinks` 函数中识别 `[[#标题]]` 和 `[[#标题|显示文本]]` 格式
- 将标题文本转换为合法的 HTML id（小写、去除特殊字符、空格转连字符）
- 转换为标准 markdown 链接 `[显示文本](#id)`
- 在链接组件中添加平滑滚动处理

```typescript
// [[#Heading]] - internal anchor links
processed = processed.replace(
  /\[\[#([^\]|]+)\]\]/g,
  (_match, heading: string) => {
    const headingText = heading.trim()
    const headingId = headingText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    return `[${headingText}](#${headingId})`
  }
)
```

**2. 标题折叠功能** (`app/src/components/MarkdownRenderer.tsx`)

技术实现：
- 使用 React Context 管理折叠状态 (`HeadingCollapseContext`)
- 为 h1-h4 标题添加 `ChevronRight` 图标和点击事件
- 使用 `useEffect` + DOM 操作隐藏/显示标题下的内容

关键代码：
```typescript
// 1. Context 定义
const HeadingCollapseContext = createContext<HeadingCollapseContextType>({
  collapsedHeadings: new Set(),
  toggleHeading: () => {},
})

// 2. 标题组件（以 h2 为例）
h2: ({ children, id }) => {
  const { collapsedHeadings, toggleHeading } = useContext(HeadingCollapseContext)
  const isCollapsed = id ? collapsedHeadings.has(id) : false

  return (
    <h2 onClick={() => id && toggleHeading(id)}>
      <ChevronRight 
        className={`${isCollapsed ? '' : 'rotate-90'}`}
      />
      {children}
    </h2>
  )
}

// 3. DOM 操作实现折叠
useEffect(() => {
  const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
  headings.forEach((heading) => {
    // 找到该标题下的所有内容，直到遇到同级或更高级标题
    let sibling = heading.nextElementSibling
    while (sibling) {
      if (isCollapsed) {
        sibling.style.display = 'none'
      } else {
        sibling.style.display = ''
      }
      sibling = sibling.nextElementSibling
    }
  })
}, [collapsedHeadings, processedContent])
```

**遇到的问题**:
- 初始实现只支持 h2-h4，导致"马斯克传英语原著原文"中的 h1 标题（`# PROLOGUE Mues of fire`）没有折叠图标
- 通过开发者工具检查发现问题，补充了 h1 的支持

**测试结果**:
- ✅ 所有 h1-h4 标题都有折叠图标（▶）
- ✅ 点击标题可以收起/展开下属内容
- ✅ 展开时图标旋转 90° 变成（▼）
- ✅ `[[#标题]]` 链接可以平滑滚动到对应位置
- ✅ 全局应用到所有笔记

**相关文件**:
- `app/src/components/MarkdownRenderer.tsx` - 核心实现
- `app/src/components/ImageGrid.tsx` - 顺便优化了图片网格尺寸（单图 60%/280px，多图 80%/420px）

**相关 Commit**: 待提交

---

### 2026-05-09: MomentUploader 笔记选择弹窗重构

**文件**: `app/src/components/MomentUploader.tsx`

**修改内容**:
1. **按文件夹树形整合** - 从 `/api/tree` 获取文件夹结构，笔记按文件夹分组显示，文件夹可展开/折叠（默认收起）
2. **键盘导航** - `↑`/`↓` 上下移动高亮，`Enter` 选择/展开，`Escape` 关闭弹窗
3. **点击外部关闭** - 全局 `mousedown` 监听，点击弹窗外自动收起
4. **触控板滚动** - `overflow-y-auto overscroll-contain`，阻止事件冒泡

---

### 2026-05-09: ImageGrid 图片布局与预览优化

**文件**: `app/src/components/ImageGrid.tsx`

**修改内容**:
1. **统一图片宽度** - 单图/多图容器统一为 `w-[55%] max-w-xs`，与微信比例一致
2. **九宫格排列** - 3-9 张图片用 `grid-cols-3 gap-1`，每张 `aspect-square`
3. **全屏预览** - 点击放大，支持左右箭头/键盘 `←`/`→` 切换，`Esc` 关闭

---

### 2026-05-09: 图片 URL 路径修复

**文件**: `app/src/hooks/useMoments.ts`

**问题**: 服务器返回相对路径 `/api/uploads/xxx.jpg`，浏览器解析到前端 `localhost:3000`，导致 404

**修复**: 统一添加 `resolveImageUrls` 函数，将 `/api/uploads/` 补全为 `http://localhost:2667/api/uploads/...`

---

### 2026-05-09: Markdown 标题默认收起

**文件**: `app/src/components/MarkdownRenderer.tsx`

**修改内容**:
- 新笔记加载时自动折叠所有 H1-H4 标题
- 使用 `useRef<string | null>(null)` 跟踪 `processedContent` 变化
- **教训**: `useRef(processedContent)` 会在挂载时初始化，导致 `contentRef.current !== processedContent` 永远为 `false`

---

### 2026-05-09: Navbar 返回按钮

**文件**: `app/src/components/Navbar.tsx`

**修改内容**:
- Logo 右侧添加圆形返回按钮（琥珀色边框 + `ArrowLeft` 图标）
- 非首页时显示，点击 `navigate(-1)` 返回上一页

---

### 2026-05-09: Obsidian 笔记间浏览器返回支持

**文件**: `app/src/pages/ObsidianBrowser.tsx`

**问题**: 点击笔记只修改组件 state，URL 不变，浏览器返回无法在不同笔记间跳转

**修复**:
1. `handleSelectNote` 加载笔记后 `navigate(`/obsidian?note=${slug}`)`，push 新历史记录
2. `useEffect` 监听 `searchParams` 变化，URL `?note=` 改变时自动加载对应笔记
3. 浏览器返回/前进按钮可在笔记间正常导航

---

### 2026-05-07: 修复 Callout `[!NOTE]` 前缀显示问题

**问题描述**:
- Callout 卡片标题中显示 `[!NOTE] 定理`，应该只显示 "定理"
- `[!NOTE]` 前缀应该被移除

**根本原因**:
1. `react-markdown` 将 blockquote 解析为包含多个子元素的结构
2. `[!NOTE] 定理` 文本位于第二个子元素（`child[1]`）的第一个文本节点中
3. 该子元素还包含其他内容（换行符、数学公式等）
4. 之前的代码只提取了文本，创建了新的 `<p>` 标签，导致数学公式无法正常渲染

**解决方案** (`app/src/components/MarkdownRenderer.tsx:391-461`):
1. 遍历 blockquote 的所有子元素，找到包含 `[!NOTE]` 的元素
2. 克隆该元素，过滤掉第一个包含 `[!NOTE]` 的文本节点
3. 保留其他所有子元素（`<br>`、`<span>` 数学公式等）
4. 将修改后的元素放入 Callout 组件

**关键代码**:
```typescript
// 克隆元素并移除 [!NOTE] 文本节点
const filteredGrandChildren = grandChildren.filter((gc, idx) => {
  if (idx === 0 && typeof gc === 'string' && gc.match(/^\[!\w+\]/)) {
    return false
  }
  return true
})

modifiedChild = {
  ...calloutChild,
  props: {
    ...childProps,
    children: filteredGrandChildren
  }
}
```

**测试结果**:
- ✅ 标题正确显示为 "定理"（不包含 `[!NOTE]`）
- ✅ 数学公式正常渲染
- ✅ 没有 React key 重复警告

**相关 Commit**: 待提交

---

### 2026-05-07: Obsidian 笔记内链接跳转功能

**问题描述**:
- 点击笔记中的链接会打开新页面，而不是在当前页面内跳转到对应笔记
- 链接格式多样：`[[标题]]`、`[标题](文件名.md)`、`[标题](文件名)`
- 中文标题的链接无法正确匹配

**根本原因**:
1. Obsidian vault 使用标准 Markdown 链接格式而非 Obsidian wikilink
2. `slugifyWikilink` 函数会删除所有中文字符
3. URL 编码的链接（如 `Slutsky%E5%AE%9A%E7%90%86`）无法匹配
4. 链接被渲染为普通 `<a>` 标签而非可拦截的元素

**解决方案**:

1. **修复 `slugifyWikilink` 函数** (`app/src/components/MarkdownRenderer.tsx:144-150`)
   ```typescript
   function slugifyWikilink(title: string): string {
     return title
       .trim()
       .replace(/\s+/g, '-')
       .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')  // 保留中文字符
       .substring(0, 60)
   }
   ```

2. **处理三种链接格式** (`app/src/components/MarkdownRenderer.tsx:470-560`)
   - `obsidian-internal://` 协议（wikilink 转换后）
   - `.md` 后缀的链接
   - 无后缀的相对链接（需 URL 解码）

3. **添加事件监听器** (`app/src/pages/ObsidianBrowser.tsx:237-252`)
   - 通过事件委托捕获 `.obsidian-wikilink` 类的点击
   - 使用文本内容匹配笔记 slug

4. **添加样式支持** (`app/src/index.css:133-164`)
   - `.obsidian-wikilink` - 可点击的内部链接
   - `.obsidian-wikilink-unresolved` - 未发布的笔记

**关键代码位置**:
- `app/src/components/MarkdownRenderer.tsx` - Markdown 渲染和链接处理
- `app/src/pages/ObsidianBrowser.tsx` - 笔记浏览器和事件处理
- `app/src/index.css` - wikilink 样式

**测试方法**:
1. 启动服务：`npm run dev` (前端) + `npm run dev` (obsidian-server)
2. 访问 http://localhost:3000/obsidian
3. 点击笔记中的链接，应在同一页面内跳转

**相关 Commit**: `8a564c5` - feat: 支持 Obsidian 笔记内链接点击跳转

### 2026-05-07: Kimi Code 完成的功能

**1. 笔记搜索框** (`app/src/pages/ObsidianBrowser.tsx`)
- 在侧边栏 Vault 目录下方添加实时搜索框
- 支持按标题、分类、标签、摘要过滤笔记
- 搜索结果列表点击直接打开笔记

**2. 侧边栏滚动固定** (`app/src/pages/ObsidianBrowser.tsx`)
- 添加 `sticky top-24 self-start`，长笔记滚动时侧边栏固定在左侧
- 处理了 `AnimatePresence` + `overflow-hidden` 对 `sticky` 定位的干扰（把 `motion.aside` 改为 `motion.div`，`overflow-hidden` 移到内部 wrapper）
- **教训**: 设置 `sticky`/`fixed` 时必须预留顶部导航栏高度，避免被遮住

**3. `$$$$` 数学公式修复** (`app/src/components/MarkdownRenderer.tsx`)
- 预处理：`content.replace(/\$\$\$\$/g, '$$\n\n$$')`，把 Obsidian 的 `$$$$` 拆分为两个独立行间公式
- KaTeX 宽容模式：`[rehypeKatex, { throwOnError: false, strict: false }]`，防止无效 LaTeX 崩页面
- 非数学内容检测：若 `$$...$$` 内没有 `\` 命令（如 `$$证明$$`），去掉 `$$` 当普通文本

**4. Callout `[!NOTE]` 部分修复** (`app/src/components/MarkdownRenderer.tsx`)
- `Blockquote` 正则从 `/^\[(\w+)\]/` 改为 `/^\[!(\w+)\]/`，匹配 Obsidian 的 `[!NOTE]` 语法
- **仍有问题**: Callout 卡片样式已生效，但标题中仍带 `[!NOTE]` 前缀未去除 → **交给 Claude 继续处理**

## 已知问题

（无）

## 待办事项

- [x] 添加笔记搜索功能
- [x] 修复 Callout `[!NOTE]` 前缀显示问题
- [ ] 优化移动端体验
- [ ] 添加笔记标签过滤

## 开发环境配置

### 前端
```bash
cd app
npm install
npm run dev  # http://localhost:3000
```

### Obsidian Server
```bash
cd obsidian-server
npm install
npm run dev  # http://localhost:2667
```

**环境变量** (obsidian-server):
- `OBSIDIAN_VAULT_PATH`: Obsidian vault 路径（默认：`/Users/a123456/Library/Mobile Documents/com~apple~CloudDocs/Obsidian Vault`）
- `PORT`: 服务器端口（默认：2667）
- `CORS_ORIGIN`: CORS 允许的源（默认：http://localhost:3000）

## 注意事项

1. **CORS 配置**: 前端端口变化时需同步更新 `obsidian-server/config.ts` 中的 `corsOrigin`
2. **中文支持**: slug 生成函数必须保留中文字符（`一-龥` 或 `一-龥`）
3. **URL 编码**: 处理链接时需要 `decodeURIComponent()` 解码
4. **HMR 问题**: 修改 `MarkdownRenderer.tsx` 时可能需要手动刷新页面

## AI 助手协作建议

- **更新此文档**: 每次解决重要问题或添加新功能后，请更新此文档
- **提交到 Git**: 确保文档变更被提交到 GitHub
- **查阅历史**: 遇到问题时先查看此文档的解决方案
- **记录决策**: 重要的技术决策和权衡应记录在此

### 2026-05-07: Kimi Code 尝试修复 Wikilink 跳转（未果，Claude 最终解决）

**尝试过程** (Kimi Code):
1. **方案一**: `obsidian://` 自定义协议 + `contentRef` 事件委托拦截 → 浏览器将其视为外部协议，`e.preventDefault()` 无法完全阻止
2. **方案二**: HashRouter `<Link to="/obsidian?note=slug">` → `react-markdown` 自定义组件内的 `<Link>` 无法可靠拦截点击，仍被浏览器当作外部链接打开
3. **方案三**: `rehype-raw` + HTML `<span data-obsidian-slug>` + 事件委托 → 思路方向正确，但未发现根本原因是 `slugifyWikilink` 删除中文字符 + 笔记中使用的是标准 Markdown 链接 `[标题](文件名.md)` 而非仅 `[[wikilink]]`

**教训**:
- ❌ 不要仅凭代码逻辑猜测，**必须使用浏览器开发者工具** (F12 → Elements/Console/Network) 查看实际渲染的 DOM、href 值和事件行为
- ❌ 不要假设链接格式只有一种，Obsidian 笔记中可能混用 `[[标题]]`、`[标题](文件名.md)`、`[标题](文件名)` 三种格式
- ✅ Claude 使用开发者工具发现实际渲染的 `<a href>` 值与预期不符，从而定位到 slug 生成函数和链接格式问题

**最终方案**: 见上文 `8a564c5` (Claude Code 实现)

---

### 2026-05-09: Navbar 全局搜索（Cmd+K）

**文件**: `app/src/components/Navbar.tsx`

**功能**:
1. **全局搜索覆盖层** - 点击搜索图标或 `Cmd+K` 打开全屏搜索弹窗
2. **双数据源** - 同时搜索 Obsidian 笔记（标题/摘要/分类/标签）和记忆碎片（内容/地理位置）
3. **相关度排序** - 按匹配权重降序排列（标题完全匹配 +100 → 内容包含 +20）
4. **触控板滑动** - `overscroll-contain` + `onWheel` 阻止事件冒泡
5. **键盘导航** - `↑↓` 选择，`↵` 打开，`Esc` 关闭

**结果项区分**:
- 笔记：📄 文件图标 + 分类标签
- 碎片："碎片"标签 + 地理位置

---

### 2026-05-09: Obsidian 笔记浏览器历史导航 + 消除闪烁

**文件**: `app/src/pages/ObsidianBrowser.tsx`

**1. 前后按钮改为浏览器历史导航**
- `←` 上一篇 = `navigate(-1)`（浏览器后退）
- `→` 下一篇 = `navigate(1)`（浏览器前进）
- **不是**基于笔记列表索引，而是基于用户实际浏览路径
- disabled 判断：使用 `window.history.state.idx` + `maxHistoryIdx` ref 跟踪当前 session 内的最大访问索引

**2. 消除切换闪烁**
- 移除 `motion.div` 的 `key={selectedNote.slug}`
- 切换笔记时不再重新创建组件，内容平滑更新

**3. 按钮样式**
- 可点击：圆形按钮 + `border-white/25` + `bg-white/5` + 白色箭头，hover 变琥珀色
- disabled：无边框透明背景 + `text-white/10` 几乎不可见

---

---

### 2026-05-11: 登录权限审查 + 全量数据上云 + 笔记静态托管

**1. 登录权限审查与加固**

审查所有 `isLoggedIn` / `isEditMode` 使用处，确定公众浏览模式下的隐藏功能：

| 文件 | 保护方式 | 未登录行为 |
|------|---------|-----------|
| `Projects.tsx` | `isLoggedIn` + handler 拦截 | 隐藏"新建项目"按钮 |
| `ProjectCard.tsx` | `isLoggedIn` prop 条件渲染 | 隐藏编辑/删除/完成/子项目按钮 |
| `DayDetailPanel.tsx` | `isLoggedIn` 条件渲染 | 只读浏览（无添加/删除待办、无日记编辑、无保存）|
| `TodayTaskList.tsx` | `isLoggedIn` + `disabled` | 禁用计时和勾选按钮 |
| `MomentCard.tsx` | `isLoggedIn` + `disabled` | 禁用点赞和评论 |
| `Footer.tsx` | `isLoggedIn && isEditMode` | 隐藏编辑页脚按钮（已有）|
| `Moments.tsx` | `isLoggedIn` | 隐藏发布器和删除按钮（已有）|

同时删除 `Login.tsx` 中的测试账号提示板块。

**2. 记忆碎片接入 Supabase**

- 安装 `@supabase/supabase-js`
- 创建 `src/lib/supabase.ts` 客户端 + db↔app 类型映射
- 重写 `src/hooks/useMoments.ts`：优先 Supabase，fallback localStorage
- 添加 5s → 2s 超时，防止 Supabase 不可达时无限 loading
- 加载逻辑改为：**先显示本地数据，后台静默同步 Supabase**（解决首次访问白屏问题）
- SQL 建表：`moments`（id, author_id, content, images, attachments, location, likes, comments, created_at）

**3. 全量数据接入 Supabase**

除 Moments 外，将日历、项目、站点设置全部上云：

| 表名 | 数据 | 本地行为 |
|------|------|---------|
| `moments` | 记忆碎片 | 先显本地，后台同步 |
| `calendar_entries` | 日历任务+日记 | 先显本地，后台同步 |
| `projects` | 项目列表 | 先显本地，后台同步 |
| `site_settings` | Hero/Skills/Footer/About | 先显本地，后台同步 |

修改文件：
- `src/utils/calendarStorage.ts` — 双写 localStorage + Supabase
- `src/utils/projectStorage.ts` — 双写 localStorage + Supabase
- `src/data/site.ts` — 双写 localStorage + Supabase
- `src/pages/Calendar.tsx` — 添加 `syncCalendarEntries()` 后台同步
- `src/pages/Projects.tsx` — 添加 `syncProjects()` 后台同步

**4. Obsidian 笔记迁移至静态托管**

弃用 `obsidian-server`（localhost:2667，关机后无法访问），改为 `public/notes/` 静态文件托管：

- 创建 `public/notes/` 目录结构
- 从本地 Obsidian Vault 导入 **973 篇 .md 笔记** + **22 张图片**（排除 `.obsidian`、`.trash`、`日记`、`录音存放文件夹` 等私人/系统目录）
- 重写 `src/services/obsidianClient.ts` — 从静态文件读取，移除 server 状态检查
- 简化 `src/pages/ObsidianBrowser.tsx` — 移除 `serverOn` 状态和离线页面
- 生成 `public/notes/index.json` — 包含 notes 元数据、文件树、inboundLinks
- 替换 Obsidian wikilink 图片语法 `![[...]]` 为网页路径 `![](/notes/images/...)`

**遇到的问题与修复**：
- `encodeURIComponent(meta.filePath)` 把 `/` 编码为 `%2F`，导致 fetch 404
- 修复：分段编码 `path.split('/').map(encodeURIComponent).join('/')`

**Supabase 项目信息**：
- URL: `https://flteigliukzlqnbpzwqj.supabase.co`
- 区域: Northeast Asia (Tokyo)
- 免费额度: 500MB（当前占用 < 50MB）

**登录账号**：
- 邮箱: `15258743752@163.com`
- 密码: `vibecoding2025`

---

### 2026-05-12: 日历自动保存 + 个人资料 i18n + 头像上云

**1. 日历详情面板删除保存按钮，改为自动保存**

文件: `app/src/components/calendar/DayDetailPanel.tsx`

- 移除底部"保存"按钮
- `useEffect` 监听 `todos` / `diary` 变化，500ms debounce 后自动调用 `saveEntry`
- 初始加载时用 `isInitialLoad` ref 跳过，避免打开面板就触发保存
- 保留"已自动保存"轻量提示（1.5s 后自动消失）
- 仍然 dispatch `calendar-entry-saved` 事件通知其他组件刷新

**2. 个人资料页面 i18n 翻译缺失修复**

文件: `app/src/i18n/translations.ts`

补充 `profile` 命名空间缺失的 9 个 key（中英文）：
`subtitle`, `description`, `changeAvatar`, `save`, `cancel`, `editUsername`, `usernameSaved`, `aboutInfo`, `edit`

**3. 头像上传迁移至 Supabase Storage**

文件: `app/src/services/avatarUpload.ts`（新建）、`app/src/components/ProfileHeader.tsx`、`app/src/contexts/AuthContext.tsx`

- 弃用 base64 存 localStorage 方案（单机、占配额、换设备丢失）
- 新建 `avatarUpload.ts`：调用 `supabase.storage.from('avatars').upload()`
- `ProfileHeader.tsx`：选择图片后自动上传，限制放宽到 5MB，加 `Loader2` loading 状态
- `AuthContext.tsx`：移除 base64 超限警告（现在只存 tiny URL）

**Supabase Storage 配置**：
- Bucket: `avatars`（Public）
- RLS Policy: `SELECT` + `INSERT`，均 applied to `public`

---

### 2026-05-15: 全代码库重构与清理（第二轮）

**目标**: 消除技术债务，提升代码可维护性，零构建错误，补充测试覆盖。

**1. 删除死代码**

- 文件: `app/src/data/posts.ts`（558 行）
- 该文件包含早期博客系统的模拟数据，自 Obsidian 笔记系统上线后无任何引用
- 直接删除，减少维护负担

**2. 大组件拆分（5 个文件 → 20+ 子组件）**

| 原文件 | 行数 | 拆分后 | 净减少 |
|--------|------|--------|--------|
| `MarkdownRenderer.tsx` | 992 | `markdown/` 目录（parser.ts、theme.tsx、render-components.tsx、heading-context.tsx） | ~200 |
| `MomentUploader.tsx` | 653 | `moment-uploader/` 目录（ImagePreviewStrip、AttachmentList、NotePicker） | ~150 |
| `Home.tsx` | 493 | `home/` 目录（HeroSection、IntroSection、SkillSection、GitHubSection、useTypingEffect） | ~100 |
| `DayDetailPanel.tsx` | 445 | `calendar/day-detail/` 目录（PlanTab、DiaryTab、ProjectTag） | ~80 |
| `ProjectCard.tsx` | 350 | `project/card-parts/` 目录（ProjectCardHeader、SummarySection、ProjectActions） | ~60 |

**3. 统一 localStorage 封装**

文件: `app/src/utils/storage.ts`（新建）

- 提供 `createStorageKey<T>(key, defaultValue)` → `{ load, save, remove }`
- 提供 `createLangStorageKey<T>(keyPrefix, defaultValues)` → 多语言版本
- 7 个文件迁移使用：
  - `projectStorage.ts`、`calendarStorage.ts`
  - `useMoments.ts`、`PreferencesContext.tsx`
  - `useLocalStorage.ts`、`DayCell.tsx`、`TodayTaskList.tsx`

**4. 消除重复工具函数**

| 函数 | 之前位置 | 统一后位置 |
|------|---------|-----------|
| `formatDuration` | `calendarStorage.ts` + `projectAggregation.ts` | `projectAggregation.ts`（唯一来源）|
| `formatDurationShort` | `calendarStorage.ts` + `projectAggregation.ts` | `projectAggregation.ts` |
| `formatDateStr` | `projectAggregation.ts` + `projectSeed.ts` | `calendarStorage.ts` |
| `formatRelativeTime` | `hooks/useMoments.ts`（内联） | 提取至 `utils/time.ts` |
| 项目计时 localStorage | `TodayTaskList.tsx`（内联） | 提取至 `utils/projectTimerStorage.ts` |

**5. 类型安全修复**

- `types/api.ts`: `z.ZodType<any>` → `z.ZodType<VaultFileAPI>`（仅保留 `VaultFileSchema` 因 `z.lazy` 自引用循环必须使用 `any`）
- `test/setup.ts`: `as any` → `as unknown as Storage`
- `AuthContext.tsx` / `data/site.ts`: 未使用的 catch 参数 `(e)` → `()` 以通过 `noUnusedParameters`

**6. Console 清理**

- 删除 27 处生产环境 `console.warn`（Supabase 同步失败、Obsidian 连接超时等）
- 保留必要日志：ErrorBoundary 错误、API 验证失败、调试日志
- Supabase 同步策略：所有 `.catch` 静默处理（免费版断网/限流不输出 warn）

**7. 性能优化**

- `Projects.tsx`: 预加载 `loadProjects()` 和 `loadAllEntries()` 一次，循环传入 `getProjectStats`，避免每秒 2×N 次 localStorage 读取 → 降至 2 次
- `GitHubSection.tsx`: 贡献图随机网格缓存为模块常量 `DEFAULT_CONTRIBUTIONS`，避免每次渲染重新生成导致闪烁

**8. 测试覆盖补充**

新增 5 个测试文件，从 3 文件/10 测试 → 8 文件/52 测试：

| 文件 | 测试数 | 覆盖内容 |
|------|--------|---------|
| `utils/storage.test.ts` | 9 | `createStorageKey` load/save/remove/JSON 异常 |
| `utils/time.test.ts` | 8 | `formatRelativeTime` 各时间区间 |
| `utils/projectAggregation.test.ts` | 8 | `getProjectStats` 聚合、`formatDuration` |
| `utils/calendarStorage.test.ts` | 7 | entry CRUD、`getDayTotalDuration` |
| `components/markdown/parser.test.ts` | 10 | `extractToc`、`preprocessWikilinks` |

**9. 构建错误修复（`tsc -b` 严格模式）**

修复 8 个构建错误：
1. 语法错误（`catch` 回调写法）
2. 未使用变量/导入（`noUnusedLocals`/`noUnusedParameters`）
3. 循环类型引用（Zod schema 自引用）

`tsconfig.app.json` 更新：
- `"noUnusedLocals": true`, `"noUnusedParameters": true`
- `"exclude": ["src/test", "**/*.test.ts"]` — 避免 vitest 全局类型污染构建

**代码统计**:
- 总代码: ~12,400 行（净减少 ~600 行）
- 测试: 8 文件 / 52 测试 / 0 失败
- 构建: `npm run build` ✅ 零报错

---

*最后更新: 2026-05-14*  
*更新者: Kimi Code*. 
