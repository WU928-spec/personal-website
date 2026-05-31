# VibeCoding Garden · 个人数字花园

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://vibecoding-garden.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.1-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

> 一个作为个人数字名片使用的全栈博客作品集网站。
>
> 在线地址：https://vibecoding-garden.vercel.app

---

## ✨ 功能概览

| 模块 | 描述 |
|------|------|
| 🏠 **个人名片主页** | 打字机效果标题、个人简介、技能标签云、GitHub 贡献图与仓库展示 |
| 📚 **Obsidian 知识库** | 浏览 900+ 篇 Markdown 笔记，支持 Wikilink `[[标题]]` 双链跳转、标题折叠、文档内锚点、Callout、KaTeX 数学公式、Shiki 代码高亮 |
| 💭 **记忆碎片 Moments** | 类朋友圈动态发布、图片九宫格、点赞评论，数据存储于 Supabase |
| 🗓️ **日历与待办** | 日历视图、每日待办计时、项目工时自动统计 |
| 📊 **项目追踪** | 项目阶段管理、子任务、柱状图工时可视化 |
| 🔍 **全局搜索 Cmd+K** | 同时搜索 Obsidian 笔记与记忆碎片，按相关度排序 |
| 🌌 **星空彩蛋** | 独立路由的交互式星空页面，可拖拽星星，每颗星对应一段记忆 |

---

## 🛠️ 技术栈

**前端**

- [React 19](https://react.dev) + [TypeScript 5.9](https://www.typescriptlang.org)（严格模式）
- [Vite 7.2](https://vitejs.dev) + [SWC](https://swc.rs)
- [Tailwind CSS 3.4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [React Router v7](https://reactrouter.com)（HashRouter）
- [Framer Motion](https://www.framer.com/motion) 动画
- [react-markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org) + [Shiki](https://shiki.style)

**后端**

- [Supabase](https://supabase.com)（PostgreSQL + Storage）
- 静态文件托管（Obsidian 笔记 900+ 篇 Markdown）

**质量保障**

- TypeScript `strict` 模式 + `noUnusedLocals`/`noUnusedParameters`
- [Zod](https://zod.dev) 运行时类型验证
- [Vitest](https://vitest.dev) + `@testing-library/react` 单元测试
- 错误边界 + 懒加载 + React.memo 性能优化

---

## 🚀 本地开发

```bash
# 克隆仓库
git clone https://github.com/WU928-spec/personal-website.git
cd personal-website/app

# 安装依赖
npm install

# 启动开发服务器
npm run dev        # http://localhost:3000

# 运行测试
npm test

# 构建生产版本
npm run build      # 输出到 dist/
```

**环境变量**（`app/.env.local`）

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📁 目录结构

```
app/
├── src/
│   ├── components/      # UI 组件
│   │   ├── ui/          # shadcn/ui 基础组件
│   │   ├── calendar/    # 日历相关
│   │   ├── home/        # 首页分区（Hero/Intro/Skill/GitHub）
│   │   ├── markdown/    # Markdown 渲染子模块
│   │   ├── project/     # 项目追踪组件
│   │   └── starry/      # 星空彩蛋组件
│   ├── pages/           # 路由页面
│   ├── hooks/           # 自定义 Hooks（含测试）
│   ├── contexts/        # React Context
│   ├── utils/           # 工具函数（含测试）
│   ├── types/           # TypeScript 类型 + Zod Schemas
│   ├── data/            # 静态配置数据
│   ├── i18n/            # 国际化
│   └── lib/             # 第三方库配置（Supabase）
├── public/              # 静态资源（含 Obsidian 笔记）
└── package.json
```

---

## 🧠 数据架构

采用 **localStorage 优先 + Supabase 后台同步** 的双写策略：

| 数据 | 存储位置 | 同步策略 |
|------|---------|---------|
| Obsidian 笔记 | Supabase `notes` 表 | 纯云端 |
| 记忆碎片 | localStorage + Supabase `moments` | 先显本地，后台静默同步 |
| 日历任务 | localStorage + Supabase `calendar_entries` | 先显本地，后台同步 |
| 项目列表 | localStorage + Supabase `projects` | 先显本地，后台同步 |

---

## 📄 License

[MIT](LICENSE)
