# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人博客名片网站，支持 Obsidian 笔记浏览和内部链接导航。

**技术栈**:
- React 19 + TypeScript
- Vite 7.3.0
- Tailwind CSS 3.4.19
- React Router v7
- Markdown 渲染：react-markdown + remark/rehype
- 类型验证：Zod 3.25.76
- 测试框架：Vitest + @testing-library/react

**服务**:
- 前端：http://localhost:3000
- Obsidian Server：http://localhost:2667

**代码质量**:
- ✅ TypeScript 严格模式
- ✅ 运行时类型验证（Zod）
- ✅ 核心模块单元测试覆盖
- ✅ 错误边界保护
- ✅ 性能优化（懒加载、React.memo）

## 开发环境

### 前端启动
```bash
cd app
npm install
npm run dev  # http://localhost:3000
npm test     # 运行单元测试
```

### Obsidian Server 启动
```bash
cd obsidian-server
npm install
npm run dev  # http://localhost:2667
```

**环境变量** (obsidian-server):
- `OBSIDIAN_VAULT_PATH`: Obsidian vault 路径（默认：`/Users/a123456/Library/Mobile Documents/com~apple~CloudDocs/Obsidian Vault`）
- `PORT`: 服务器端口（默认：2667）
- `CORS_ORIGIN`: CORS 允许的源（默认：http://localhost:3000）

## 核心功能

1. **Obsidian 笔记浏览器** (`app/src/pages/ObsidianBrowser.tsx`)
   - 笔记列表展示
   - 实时搜索功能（标题、分类、标签、摘要）
   - 侧边栏固定滚动
   - 笔记内部链接跳转
   - 标题折叠/展开功能

2. **Markdown 渲染** (`app/src/components/MarkdownRenderer.tsx`)
   - Wikilink 支持：`[[标题]]`、`[[标题|显示文本]]`
   - 文档内锚点：`[[#标题]]`、`[[#标题|显示文本]]`
   - 标题折叠：点击 h1-h4 标题前的箭头图标收起/展开内容
   - 数学公式：KaTeX 渲染
   - 代码高亮：Shiki（warm-garden 主题）
   - Obsidian Callout：`[!NOTE]`、`[!TIP]`、`[!WARNING]` 等
   - 表格、图片、音频、视频支持

3. **链接处理**
   - 内部链接：`obsidian-internal://slug`
   - 文档内锚点：`#heading-id`（平滑滚动）
   - Markdown 链接：`[标题](文件名.md)`
   - 相对链接：自动 URL 解码
   - 中文链接支持

## 关键技术细节

### 1. Wikilink 处理

**函数**: `preprocessWikilinks()` (`MarkdownRenderer.tsx:152-198`)

- 将 `[[标题]]` 转换为内部链接
- 支持 `[[标题|显示文本]]` 格式
- 检查笔记是否存在（`existingSlugs`）
- 未发布的笔记显示为灰色

**Slug 生成**: `slugifyWikilink()` (`MarkdownRenderer.tsx:144-150`)
```typescript
function slugifyWikilink(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')  // 保留中文字符
    .substring(0, 60)
}
```

**重要**: 必须保留中文字符（`一-龥`），否则中文标题的链接会失效。

### 2. Obsidian Callout 渲染

**问题**: Obsidian 的 Callout 格式如下：
```markdown
> [!NOTE] 定理
> 若函数f在有界闭域上连续，则f在D上有界
```

`react-markdown` 会将其解析为 blockquote，其中 `[!NOTE] 定理` 是第一个段落的第一个文本节点。

**解决方案**: `Blockquote` 组件 (`MarkdownRenderer.tsx:391-461`)

1. 遍历 blockquote 的所有子元素
2. 找到包含 `[!NOTE]` 的元素
3. 克隆该元素，过滤掉第一个包含 `[!NOTE]` 的文本节点
4. 保留其他所有子元素（`<br>`、数学公式 `<span>` 等）
5. 将修改后的元素放入 `Callout` 组件

**关键代码**:
```typescript
const filteredGrandChildren = grandChildren.filter((gc, idx) => {
  if (idx === 0 && typeof gc === 'string' && gc.match(/^\[!\w+\]/)) {
    return false  // 移除 [!NOTE] 文本节点
  }
  return true  // 保留其他所有元素
})
```

**为什么不能创建新的 `<p>` 标签**:
- 会破坏数学公式的渲染（KaTeX 需要原始的 React 元素结构）
- 会导致 React key 重复警告

### 3. 数学公式处理

**预处理**: `preprocessWikilinks()` (`MarkdownRenderer.tsx:160-170`)

```typescript
// 1. 将 Obsidian 的 $$$$ 转换为两个独立的 $$
processed = content.replace(/\$\$\$\$/g, '$$\n\n$$')

// 2. 移除不包含 LaTeX 命令的 $$ 包裹（如 $$证明$$）
processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner: string) => {
  if (/\\[a-zA-Z]+/.test(inner)) {
    return match  // 保留真正的数学公式
  }
  return inner.trim()  // 移除 $$ 当作普通文本
})
```

**KaTeX 配置**: `rehypeKatex` 使用宽容模式
```typescript
[rehypeKatex, { throwOnError: false, strict: false }]
```

### 4. 链接点击处理

**事件委托**: `ObsidianBrowser.tsx:237-252`

```typescript
// 监听 .obsidian-wikilink 类的点击
contentRef.current?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('obsidian-wikilink')) {
    e.preventDefault()
    const text = target.textContent
    // 根据文本内容匹配笔记 slug
    const matchedNote = notes.find(note => 
      note.slug === text || note.title === text
    )
    if (matchedNote) {
      setSelectedNote(matchedNote)
    }
  }
})
```

**三种链接格式**:
1. `obsidian-internal://slug` - wikilink 转换后
2. `[标题](文件名.md)` - 标准 Markdown 链接
3. `[标题](文件名)` - 无后缀的相对链接（需 URL 解码）

### 5. 侧边栏固定滚动

**问题**: `AnimatePresence` + `overflow-hidden` 会干扰 `sticky` 定位

**解决方案**: 将 `overflow-hidden` 移到内部 wrapper
```tsx
<motion.div className="w-80 shrink-0">
  <aside className="sticky top-24 self-start overflow-hidden">
    {/* 侧边栏内容 */}
  </aside>
</motion.div>
```

**注意**: `top-24` 是为了预留顶部导航栏高度（6rem = 96px）

### 6. 标题折叠功能

**实现**: `MarkdownRenderer.tsx`

使用 React Context + DOM 操作实现标题折叠：

```typescript
// 1. Context 管理折叠状态
const HeadingCollapseContext = createContext<HeadingCollapseContextType>({
  collapsedHeadings: new Set(),
  toggleHeading: () => {},
})

// 2. 标题组件添加折叠图标
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

// 3. useEffect 控制内容显示/隐藏
useEffect(() => {
  const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
  headings.forEach((heading) => {
    // 隐藏该标题下的所有内容，直到遇到同级或更高级标题
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

**重要**: 必须支持 h1-h4 所有级别，因为不同笔记可能使用不同的标题级别

### 7. 文档内锚点跳转

**实现**: `MarkdownRenderer.tsx:199-220`

识别 `[[#标题]]` 格式并转换为锚点链接：

```typescript
// 预处理 [[#Heading]] 为 [Heading](#heading)
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

// 链接组件处理锚点点击
a: ({ href, children }) => {
  if (href?.startsWith('#')) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          const element = document.getElementById(href.slice(1))
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }}
      >
        {children}
      </a>
    )
  }
  // ... 其他链接处理
}
```

**注意**: `top-24` 是为了预留顶部导航栏高度（6rem = 96px）

## 常见问题

### 1. 中文链接无法跳转

**原因**: `slugifyWikilink` 函数删除了中文字符

**解决**: 确保正则表达式保留中文：`/[^a-zA-Z0-9一-龥\-_]/g`

### 2. Callout 标题显示 `[!NOTE]` 前缀

**原因**: 只提取了文本，没有正确处理 React 元素结构

**解决**: 克隆元素并过滤掉 `[!NOTE]` 文本节点，保留其他所有子元素

### 3. 数学公式不渲染

**原因**: 
- 创建了新的 `<p>` 标签包裹内容，破坏了 KaTeX 的元素结构
- Obsidian 的 `$$$$` 格式不被识别

**解决**: 
- 保留原始 React 元素结构
- 预处理 `$$$$` 为 `$$\n\n$$`

### 4. HMR 不生效

**现象**: 修改 `MarkdownRenderer.tsx` 后页面不更新

**解决**: 手动刷新页面（Vite HMR 对复杂组件支持有限）

## 文件结构

```
app/
├── src/
│   ├── components/
│   │   ├── MarkdownRenderer.tsx    # Markdown 渲染核心
│   │   ├── ErrorBoundary.tsx       # 错误边界
│   │   ├── NoteTree.tsx            # 笔记树组件
│   │   ├── ProfileHeader.tsx       # Profile 头部
│   │   ├── ProfileSettings.tsx     # Profile 设置
│   │   ├── LazyImage.tsx           # 懒加载图片
│   │   ├── RepoCard.tsx            # GitHub 仓库卡片
│   │   └── SkillTag.tsx            # 技能标签
│   ├── pages/
│   │   ├── ObsidianBrowser.tsx     # 笔记浏览器
│   │   ├── Home.tsx                # 首页
│   │   ├── Profile.tsx             # 个人资料
│   │   └── Moments.tsx             # 记忆碎片
│   ├── contexts/
│   │   ├── PreferencesContext.tsx  # 统一的偏好设置（主题+语言）
│   │   └── AuthContext.tsx         # 认证上下文
│   ├── hooks/
│   │   ├── useLocalStorage.ts      # localStorage hook
│   │   ├── useDebounce.ts          # 防抖 hook
│   │   ├── useAsync.ts             # 异步 hook
│   │   ├── useMediaQuery.ts        # 媒体查询 hook
│   │   ├── useClickOutside.ts      # 点击外部 hook
│   │   ├── useScrollPosition.ts    # 滚动位置 hook
│   │   └── *.test.ts               # 单元测试
│   ├── utils/
│   │   └── storage.ts              # 统一的存储工具
│   ├── types/
│   │   ├── obsidian.ts             # Obsidian 类型定义
│   │   └── api.ts                  # API 类型定义（Zod schemas）
│   ├── data/
│   │   ├── site.ts                 # 网站配置
│   │   └── about.ts                # 关于信息
│   ├── test/
│   │   └── setup.ts                # 测试配置
│   └── index.css                   # 全局样式
├── package.json
├── vite.config.ts
└── vitest.config.ts                # 测试配置

obsidian-server/
├── src/
│   ├── index.ts                    # Express 服务器
│   └── config.ts                   # 配置文件
└── package.json
```

## 开发注意事项

1. **CORS 配置**: 前端端口变化时需同步更新 `obsidian-server/config.ts` 中的 `corsOrigin`

2. **中文支持**: 所有处理文件名、标题、slug 的函数都必须保留中文字符

3. **URL 编码**: 处理链接时需要 `decodeURIComponent()` 解码

4. **React 元素克隆**: 修改 Markdown 渲染的子元素时，必须保留原始结构，不要创建新的包裹元素

5. **数学公式**: 不要用 `<p>` 或其他标签包裹数学公式相关的内容

6. **类型安全**: 
   - 所有 API 响应必须使用 Zod 验证（参考 `src/types/api.ts`）
   - 避免使用 `any` 类型
   - 使用 `parseGitHubRepos()` 等安全解析函数

7. **测试**: 
   - 修改核心 Hooks 后必须运行测试：`npm test`
   - 新增 Hooks 需要添加对应的测试文件
   - 测试覆盖率要求：核心模块 100%

8. **性能优化**:
   - 大型列表使用 `React.memo`
   - 图片使用 `LazyImage` 组件
   - 避免不必要的重渲染

9. **错误处理**:
   - 所有异步操作必须有错误处理
   - API 调用失败要有友好提示
   - 使用 `ErrorBoundary` 防止应用崩溃

10. **Git 提交**: 
    - 重要功能修复后记得更新 `DEVELOPMENT.md`
    - 每周进行一次代码重构（参考 `REFACTOR-*.md`）
    - 提交前运行测试确保通过

## 最近更新

### 2026-05-12: 修复子目录笔记显示、日历同步和动态闪烁问题

**问题 1: 子目录笔记无法显示**

只有根目录的 21 篇笔记能正常显示，952 篇子目录笔记无法加载。

**原因**: `TreeItem` 组件从文件名生成 slug，但实际 slug 是从完整路径生成的，导致 slug 不匹配。

**解决**: 
- 修改 `NoteTree.tsx`：添加 `notes` 参数，根据 `filePath` 查找真实 slug
- 修改 `ObsidianBrowser.tsx`：传递 `notes` 数组给树形组件

**相关文件**: `app/src/components/NoteTree.tsx`, `app/src/pages/ObsidianBrowser.tsx`

---

**问题 2: 日历待办不显示**

添加待办后，右侧"今日待办"列表不显示，需要刷新页面。

**原因**: Supabase 异步同步时，`TodayTaskList` 和 `TodayStatsPanel` 已经读取了空的 localStorage。

**解决**:
- `calendarStorage.ts`: 同步完成后触发 `calendar-sync-completed` 事件
- `TodayTaskList.tsx` 和 `TodayStatsPanel.tsx`: 监听事件并刷新数据

**相关文件**: `app/src/utils/calendarStorage.ts`, `app/src/components/calendar/TodayTaskList.tsx`, `app/src/components/calendar/TodayStatsPanel.tsx`

---

**问题 3: 记忆碎片删除后闪烁重现**

刷新页面时，已删除的动态会闪烁一下然后消失。

**原因**: 旧逻辑先显示 localStorage，再异步加载 Supabase 替换，导致"先显示旧数据，再显示新数据"的闪烁。

**解决**:
- 改为先等待 Supabase 加载完成，成功后直接显示（2s 超时保护）
- 只有 Supabase 不可用时才降级使用 localStorage
- 删除操作改为先删除云端，成功后再更新本地

**权衡**: 首次加载需要等待 Supabase（最多 2 秒），但消除了闪烁，数据一致性更好。

**相关文件**: `app/src/hooks/useMoments.ts`

**相关 Commit**: `184e5c4`, `66eceff`, `80f42a5`, `10096bf`

---

### 2026-05-11: 项目追踪柱状图 Tooltip 优化

**问题**：
- 柱子形状异常（顶部圆角过大）
- Tooltip 显示在错误位置（图表顶部而非柱子上方）
- Tooltip 文字看不见（深色模式下白底白字）

**解决方案**：
1. 调整柱子圆角：`rounded-t-sm` → `rounded-t`
2. 重新设计 tooltip 定位：将 `group` 和 `relative` 直接放在柱子 div 上，tooltip 作为柱子的直接子元素
3. 使用 `bottom-full mb-2` 让 tooltip 相对于柱子顶部定位
4. 去掉背景框，直接显示纯文字
5. 文字颜色自适应：`text-Ink dark:text-white`
6. Tooltip 内容：时长（加粗）+ 占比百分比

**关键代码**：
```tsx
<div className="group w-full rounded-t transition-all duration-500 relative" style={{...}}>
  {hasData && (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap text-Ink dark:text-white text-[0.625rem]">
      <div className="text-[0.6875rem] font-medium">
        {formatDuration(d.seconds)}
      </div>
      <div className="text-[0.6875rem]">
        占比: {((d.seconds / totalSeconds) * 100).toFixed(1)}%
      </div>
    </div>
  )}
</div>
```

**相关文件**: `app/src/pages/Projects.tsx`

### 2026-05-10: 全面代码重构 ⭐

**重构内容**: 
- 删除 54 个未使用依赖，减少 68%
- 删除 46 个未使用 UI 组件，减少 87%
- 拆分大型组件（Home, ObsidianBrowser, Profile）
- 合并 ThemeContext 和 LangContext 为 PreferencesContext
- 添加错误边界（ErrorBoundary）
- 创建 6 个可复用 Hooks
- 添加类型安全验证（Zod）
- 添加 10 个单元测试，核心模块 100% 覆盖

**成果**:
- 代码减少 ~1350 行（17%）
- 消除所有 `any` 类型
- Context 层级从 3 层减少到 2 层
- 平均组件大小减少 40%

**详细记录**: 参见 `REFACTOR-2026-05-10.md`

**相关文件**: 
- `src/utils/storage.ts` - 统一存储工具
- `src/contexts/PreferencesContext.tsx` - 合并后的 Context
- `src/components/ErrorBoundary.tsx` - 错误边界
- `src/hooks/*` - 可复用 Hooks
- `src/types/api.ts` - API 类型验证
- `vitest.config.ts` - 测试配置

### 2026-05-09: 标题折叠功能 + 文档内锚点跳转

**功能**: 
1. 点击标题前的箭头图标可以收起/展开下属内容（类似 Obsidian）
2. `[[#标题]]` 格式的链接可以跳转到同一文档内的对应标题

**实现**:
- 使用 React Context 管理折叠状态
- 为 h1-h4 标题添加 `ChevronRight` 图标和点击事件
- 使用 `useEffect` + DOM 操作隐藏/显示标题下的内容
- 在 `preprocessWikilinks` 中识别 `[[#标题]]` 格式并转换为锚点链接
- 在链接组件中添加平滑滚动处理

**相关文件**: `app/src/components/MarkdownRenderer.tsx`

**注意**: 初始实现只支持 h2-h4，后来补充了 h1 支持以适配所有笔记格式

**Commit**: 待提交

### 2026-05-08: 创建 CLAUDE.md 项目文档

**目的**: 为未来的 Claude Code 会话提供项目上下文和技术指南

**内容**:
- 项目概述和技术栈
- 开发环境配置
- 核心功能说明
- 关键技术细节（Wikilink、Callout、数学公式、链接处理）
- 常见问题和解决方案
- 文件结构
- 开发注意事项

### 2026-05-07: 修复 Callout `[!NOTE]` 前缀显示问题

**问题**: Callout 标题中显示 `[!NOTE] 定理`，应该只显示 "定理"

**解决**: 克隆 React 元素并过滤掉 `[!NOTE]` 文本节点，保留其他所有子元素

**相关文件**: `app/src/components/MarkdownRenderer.tsx:391-461`

**Commit**: `53c4441` - fix: 修复 Callout [!NOTE] 前缀显示问题

### 2026-05-07: Obsidian 笔记内链接跳转功能

**功能**: 点击笔记中的链接在同一页面内跳转到对应笔记

**解决**: 
- 修复 `slugifyWikilink` 保留中文字符
- 处理三种链接格式
- 添加事件监听器拦截点击

**相关文件**: 
- `app/src/components/MarkdownRenderer.tsx`
- `app/src/pages/ObsidianBrowser.tsx`
- `app/src/index.css`

**Commit**: `8a564c5` - feat: 支持 Obsidian 笔记内链接点击跳转

## 参考文档

- [REFACTOR-2026-05-10.md](./REFACTOR-2026-05-10.md) - 最新重构详细记录
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 详细的开发日志和问题解决记录
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染库
- [KaTeX](https://katex.org/) - 数学公式渲染
- [Shiki](https://shiki.style/) - 代码高亮
- [Obsidian](https://obsidian.md/) - 笔记应用
- [Zod](https://zod.dev/) - TypeScript 类型验证
- [Vitest](https://vitest.dev/) - 测试框架

---

*最后更新: 2026-05-10*  
*维护者: Claude Sonnet 4.6*
