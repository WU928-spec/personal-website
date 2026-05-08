# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## 开发环境

### 前端启动
```bash
cd app
npm install
npm run dev  # http://localhost:3000
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

2. **Markdown 渲染** (`app/src/components/MarkdownRenderer.tsx`)
   - Wikilink 支持：`[[标题]]`、`[[标题|显示文本]]`
   - 数学公式：KaTeX 渲染
   - 代码高亮：Shiki（warm-garden 主题）
   - Obsidian Callout：`[!NOTE]`、`[!TIP]`、`[!WARNING]` 等
   - 表格、图片、音频、视频支持

3. **链接处理**
   - 内部链接：`obsidian-internal://slug`
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
│   │   └── MarkdownRenderer.tsx    # Markdown 渲染核心
│   ├── pages/
│   │   └── ObsidianBrowser.tsx     # 笔记浏览器
│   ├── services/
│   │   └── obsidianApi.ts          # Obsidian API 调用
│   ├── types/
│   │   └── obsidian.ts             # 类型定义
│   └── index.css                   # 全局样式（wikilink 样式）
├── package.json
└── vite.config.ts

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

6. **Git 提交**: 重要功能修复后记得更新 `DEVELOPMENT.md` 并提交

## 最近更新

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

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 详细的开发日志和问题解决记录
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染库
- [KaTeX](https://katex.org/) - 数学公式渲染
- [Shiki](https://shiki.style/) - 代码高亮
- [Obsidian](https://obsidian.md/) - 笔记应用

---

*最后更新: 2026-05-08*  
*维护者: Claude Sonnet 4.6*
