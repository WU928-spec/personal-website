# Plan: 记忆碎片界面优化 + 附件功能

## 1. 修复图片不显示问题

**根因**：`MarkdownRenderer.tsx` 的 `img` 组件已在 task-010 修复（`data:` URL 直接渲染），但需二次验证。

**方案**：
- 运行 `npm run build` 确认无编译错误
- 检查 `NewPost` 发布时图片 data URL 是否正确拼入 `content`
- 确认 `BlogPost` 的 `post.content` 完整传递到 `MarkdownRenderer`

---

## 2. 界面结构优化：移除博客残留标题结构

**当前问题**：`BlogPost.tsx`（碎片详情页）顶部仍有大 `h1` 标题（line 428-432），显示 "Slow Programming" 等文章标题，不符合碎片定位。

**方案** (`BlogPost.tsx`)：
- 将大 `h1` 标题（`text-[1.5rem] font-semibold`）缩小为小字副标题风格
- 标题改为 `text-[0.9375rem] text-Slate`，放在碎片头部信息栏中，不作为独立大标题
- 删除编辑模式下的标题 input（或者缩小它）

---

## 3. 功能移除：删除索引功能

**当前情况**：`Blog.tsx`（生活碎片列表页）顶部有以下索引元素：
- 搜索栏（Hero area line 244-265）
- 分类标签栏（sticky bar line 248-285：`全部 / Development / ...` 分类 chip + 排序下拉 + `X 条碎片` + `发碎片` 按钮）
- Sort dropdown

**方案** (`Blog.tsx`)：
- 删除搜索栏（Search input）
- 删除分类标签的 sticky bar（包括分类 chip、排序下拉、文章计数）
- 仅保留 `发碎片` 按钮（移到 Cover Area 中）
- 碎片列表直接按时间倒序排列

---

## 4. 附件上传功能

### 4.1 Post 类型扩展 (`posts.ts`)

在 `Post` 接口新增字段：
```typescript
attachments?: { name: string; type: string; data: string }[]
```

### 4.2 发布页附件上传 (`NewPost.tsx`)

- 引入 `Paperclip` 图标
- 在图片区下方新增附件区
- 点击 `+附件` → `<input type="file" accept=".md,.csv,.txt,.json,.pdf">` 
- 文件读取为 `FileReader.readAsDataURL`，存入 `attachments` state
- 附件列表显示：文件名 + 类型标签 + X 删除按钮
- 发布时附件数据随 `addPost` 一起存入 localStorage

**附件渲染样式**：文字内容下方，小字（`text-[0.75rem]`），每个附件单独一行，带边框（`border rounded-lg p-2`）

### 4.3 详情页附件显示 (`BlogPost.tsx`)

- 在 MarkdownRenderer 下方、Tags 上方新增附件渲染区
- 附件类型判断：
  - `.md` / `.markdown` → 渲染为 `<Link to="/obsidian">` 跳转笔记页
  - 其他类型 → 渲染为 `<a download>` 触发下载
- 每个附件：文件名 + 文件图标 + 边框包裹

### 4.4 生活碎片卡片附件显示 (`Blog.tsx` MomentCard)

- 在文字内容下方、图片区上方显示附件图标 `📎` + 附件数量（如 `📎 2个附件`）

---

## 5. Kimi Code 协作分工

| 任务 | 执行者 | 文件 |
|------|--------|------|
| 修复图片显示验证 | Trae | MarkdownRenderer.tsx |
| 移除博客标题结构 | Kimi Code | BlogPost.tsx |
| 删除索引功能（搜索+分类栏） | Kimi Code | Blog.tsx |
| 附件上传+显示功能 | Kimi Code | posts.ts, NewPost.tsx, BlogPost.tsx, Blog.tsx |

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `app/src/data/posts.ts` | Post 类型增加 attachments 字段 |
| `app/src/pages/Blog.tsx` | 删除搜索栏、分类索引栏，保留发碎片按钮 |
| `app/src/pages/BlogPost.tsx` | 缩小标题、删除分享按钮行、新增附件显示区 |
| `app/src/pages/NewPost.tsx` | 新增附件上传区 |

## 不改的文件
- `MarkdownRenderer.tsx` — 保持 task-010 修复
- `obsidian-server/` — 不动后端
- `components/TableOfContents.tsx` — 保留文件但不再引用
