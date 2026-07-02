# AGENTS.md — 个人博客名片网站

> 本文件供 AI Coding Agent 阅读。如果你正在处理这个项目的代码，请先完整阅读本文档，再开始修改。

---

## 项目概述

这是一个**个人博客名片网站**（Personal Blog & Portfolio），作为个人数字名片使用。核心功能包括：

1. **个人名片主页** — 自我介绍、头像、技能标签、社交链接、GitHub 项目展示
2. **Obsidian 笔记浏览器** — 支持 Markdown 渲染、双链语法 `[[Note Title]]`、标题折叠、文档内锚点跳转
3. **记忆碎片（Moments）** — 类似朋友圈的动态发布、图片九宫格、点赞评论
4. **日历与待办** — 日历视图、每日待办计时、项目工时统计
5. **项目追踪** — 项目阶段管理、子任务、柱状图工时可视化
6. **星空彩蛋** — 独立路由的特效页面

**开发方式**：Vibe Coding（多 Agent 协作，Kimi Code CLI + Claude Code 交替使用）。

---

## 技术栈

### 前端 (`app/`)

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | ^19.2.0 |
| 语言 | TypeScript | ~5.9.3（严格模式） |
| 构建工具 | Vite | ^7.2.4 |
| 样式 | Tailwind CSS | ^3.4.19 |
| UI 组件 | shadcn/ui + Radix UI | — |
| 路由 | React Router v7（HashRouter） | ^7.14.2 |
| Markdown | react-markdown + remark/rehype | — |
| 数学公式 | KaTeX | ^0.16.45 |
| 代码高亮 | Shiki | ^4.0.2 |
| 动画 | Framer Motion | ^12.38.0 |
| 数据验证 | Zod | ^3.25.76 |
| 后端服务 | Supabase（PostgreSQL + Storage） | ^2.105.4 |
| 测试 | Vitest + @testing-library/react + jsdom | ^4.1.5 |

### 本地服务器（已弃用/遗留）

- `obsidian-server/` — Express 4 + TypeScript，用于本地 Obsidian Vault 文件同步
- 默认端口 2667，已逐步被 Supabase 和静态托管取代

---

## 目录结构

```
个人网站vibecoding/
├── app/                          # 前端主应用
│   ├── src/
│   │   ├── components/           # UI 组件（按功能分子目录）
│   │   │   ├── ui/               # shadcn/ui 基础组件
│   │   │   ├── calendar/         # 日历相关组件
│   │   │   ├── home/             # 首页分区组件
│   │   │   ├── markdown/         # Markdown 渲染子模块
│   │   │   ├── moment-uploader/  # 动态发布子组件
│   │   │   ├── project/          # 项目追踪组件
│   │   │   └── ...               # 其他独立组件
│   │   ├── pages/                # 路由级页面组件
│   │   ├── hooks/                # 自定义 Hooks（含 *.test.ts）
│   │   ├── contexts/             # React Context（Preferences, Auth）
│   │   ├── types/                # TypeScript 类型 + Zod Schemas
│   │   ├── utils/                # 工具函数（含 *.test.ts）
│   │   ├── services/             # API 客户端（obsidianClient, avatarUpload）
│   │   ├── data/                 # 静态配置数据（site, about, music）
│   │   ├── i18n/                 # 国际化翻译文件
│   │   ├── lib/                  # 第三方库配置（supabase.ts, utils.ts）
│   │   ├── test/                 # 测试环境配置
│   │   ├── App.tsx               # 路由定义 + 懒加载配置
│   │   ├── main.tsx              # 应用入口（HashRouter）
│   │   └── index.css             # 全局样式 + Tailwind 主题变量
│   ├── public/                   # 静态资源
│   ├── package.json
│   ├── vite.config.ts            # Vite 配置（含 manualChunks）
│   ├── vitest.config.ts          # 测试配置
│   ├── tsconfig.app.json         # TS 严格模式 + noUnusedLocals
│   └── tailwind.config.js        # 自定义颜色、字体、动画
├── obsidian-server/              # 本地 Obsidian 同步服务（Express）
│   ├── server.ts                 # API 入口
│   ├── config.ts                 # 环境变量配置
│   └── lib/                      # vaultReader, githubClient
├── vercel.json                   # Vercel SPA 部署配置
└── package.json                  # Root 脚本（委托到 app/）
```

---

## 构建与开发命令

### 前端

```bash
cd app
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc -b && vite build，输出到 dist/
npm test          # vitest（单元测试）
npm run test:coverage
```

### 遗留本地服务器（一般不需要启动）

```bash
cd obsidian-server
npm install
npm run dev       # http://localhost:2667
```

**环境变量**（`app/.env.local` 或 `app/.env.example`）：
- `VITE_SUPABASE_URL` — Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY` — Supabase 匿名公钥

---

## 代码风格与开发规范

### TypeScript 严格模式

项目启用了 `tsconfig.app.json` 的严格检查，**以下规则会阻断构建**：
- `strict: true`
- `noUnusedLocals: true` — 未使用的局部变量必须删除
- `noUnusedParameters: true` — 未使用的函数参数必须写成 `_` 或 `()`
- `verbatimModuleSyntax: true` — 类型导入必须用 `import type`

### 路径别名

统一使用 `@/` 指向 `src/`，禁止相对路径穿越（如 `../../../components`）。

### 组件规范

- **拆分原则**：组件超过 ~350 行时必须拆分为子组件或子目录
- **懒加载**：所有非首屏页面必须使用 `React.lazy()`（见 `App.tsx`）
- **性能**：大型列表使用 `React.memo`，图片使用 `LazyImage`
- **错误边界**：所有页面路由包裹在 `ErrorBoundary` 内

### Hook 规范

- 核心 Hooks 必须附带单元测试（`*.test.ts`）
- 测试使用 `jsdom` 环境，配置在 `vitest.config.ts`

### 类型安全

- 所有外部 API 响应必须使用 Zod 验证（参考 `src/types/api.ts`）
- 禁止显式使用 `any` 类型（`z.lazy` 自引用循环除外）
- 运行时类型验证 + 编译时类型检查双重保障

---

## 数据持久化架构

项目采用 **localStorage 优先 + Supabase 后台同步** 的双写策略：

| 数据 | 存储位置 | 同步策略 |
|------|---------|---------|
| 笔记（Obsidian） | Supabase `notes` 表 | 纯云端，无本地缓存 |
| 记忆碎片（Moments） | localStorage + Supabase `moments` 表 | 先显本地，后台静默同步 |
| 日历任务 | localStorage + Supabase `calendar_entries` 表 | 先显本地，后台同步 |
| 项目列表 | localStorage + Supabase `projects` 表 | 先显本地，后台同步 |
| 站点设置 | localStorage + Supabase `site_settings` 表 | 先显本地，后台同步 |
| 头像 | Supabase Storage `avatars` bucket | 直接上传云端 |

**关键约定**：
- Supabase 不可用时静默降级，不输出 `console.warn`（生产环境清理过日志）
- 删除操作必须先删云端，成功后再更新本地（防止闪烁）
- 同步完成后派发 `calendar-sync-completed` 等自定义事件通知 UI 刷新

---

## 关键业务逻辑

### 1. Obsidian 笔记系统

- 笔记数据存储在 Supabase `notes` 表，字段：`path`（PK）, `content`, `created_at`, `updated_at`
- 前端通过 `obsidianClient.ts` 读取，支持文件夹树形结构
- Markdown 渲染核心在 `components/MarkdownRenderer.tsx` 及其子模块 `components/markdown/`
- **Wikilink 处理**：`[[标题]]`、`[[标题|显示文本]]` 转换为内部链接；`[[#标题]]` 转换为文档内锚点
- **Slug 生成**：必须保留中文字符（正则 `/[^a-zA-Z0-9一-龥\-_]/g`），否则中文链接失效
- **标题折叠**：h1-h4 均支持点击收起/展开，通过 React Context + DOM 操作实现

### 2. Markdown 渲染注意事项

- **Callout**：`> [!NOTE] 标题` 格式通过自定义 `Blockquote` 组件渲染，必须过滤掉 `[!NOTE]` 文本节点但保留其他子元素（如 KaTeX `<span>`）
- **数学公式**：预处理 `$$$$` 为 `$$\n\n$$`；对不含 LaTeX 命令的 `$$...$$` 去包裹当普通文本
- **中文链接**：所有处理文件名、标题、slug 的函数都必须保留中文字符
- **URL 编码**：处理链接时需要 `decodeURIComponent()` 解码

### 3. 路由与导航

- 使用 `HashRouter`（因为部署在静态托管上，SPA 刷新需要 `vercel.json` 回退 `index.html`）
- ObsidianBrowser 内笔记跳转使用 `navigate(\`/obsidian?note=${slug}\`)`，支持浏览器前进/后退
- `/starry` 及其子路由为独立全屏页面，不渲染 `Layout` 导航栏

---

## 测试策略

- **框架**：Vitest + @testing-library/react + jsdom
- **配置**：`vitest.config.ts`，setup 文件 `src/test/setup.ts`
- **覆盖目标**：核心 Hooks 和工具函数 100% 覆盖
- **测试文件命名**：与被测文件同名，后缀 `.test.ts` 或 `.test.tsx`
- **当前测试**：8 个测试文件 / 52 个测试用例，全部通过
- **构建前检查**：`npm run build` 会先跑 `tsc -b`，严格类型错误会阻断构建

---

## 部署流程

- **平台**：Vercel
- **输出目录**：`app/dist`
- **Rewrites**：所有路径回退到 `index.html`（SPA 行为）
- **构建命令**：根目录 `npm run build` 会执行 `cd app && npm ci && npm run build`

---

## 安全注意事项

1. **Supabase 公钥**：`VITE_SUPABASE_ANON_KEY` 是前端可读的公钥，不要混淆为私密 key
2. **文件路径安全**：`obsidian-server` 的 `/api/file/*` 有路径遍历保护（`resolved.startsWith(config.vaultPath)`）
3. **未发布笔记**：Wikilink 指向不存在的笔记时，渲染为灰色不可点击样式（`obsidian-wikilink-unresolved`）
4. **登录权限**：多个组件根据 `isLoggedIn` 条件渲染编辑按钮；未登录时为只读模式

---

## Agent 必读提示

1. **修改核心文件后必须运行测试**：`npm test`
2. **修改 Markdown 渲染后需要手动刷新页面**：Vite HMR 对复杂 Markdown 组件支持有限
3. **不要创建新的 `<p>` 标签包裹数学公式**：会破坏 KaTeX 渲染
4. **所有文件名/标题/slug 处理必须保留中文**：正则必须包含 `一-龥`
5. **新增 Hook 必须写测试**：参考现有 `*.test.ts` 格式
6. **保持向后兼容**：修改 Context 或存储结构时，提供旧数据自动迁移逻辑
7. **每周重构**：项目有持续重构传统，大组件拆分和死代码清理是常规工作
8. **工具页面返回按钮**：所有工具页面（`pages/` 下路由在 `/tools` 下的子页面）必须使用 `<BackToTools />` 组件返回工具箱，禁止自己写 `ArrowLeft + useNavigate`。`BackToTools` 已内置统一样式和翻译支持。

---

## 参考文档

- `CLAUDE.md` — Claude Code 专用技术细节（Wikilink、Callout、数学公式等实现细节）
- `DEVELOPMENT.md` — 完整开发日志，按日期记录所有功能变更和 Bug 修复
- `REFACTOR-2026-05-10.md` — 全面代码重构记录（依赖清理、组件拆分、测试添加）
- `plan.md` — 原始项目执行计划（多 Agent Vibe Coding 流程）
- `info.md` — 用户需求摘要

---

*本文档基于实际代码和配置文件生成，最后更新：2026-07-02*
