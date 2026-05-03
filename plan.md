# 个人博客名片网站 — 多 Agent Vibe Coding 执行计划

## 项目概述
使用 **vibecoding-webapp-swarm** 技能的 Mode A 多 Agent 流程，构建一个功能丰富的个人博客名片网站。

## 技术栈（固定版本）
- Node.js 20
- Tailwind CSS v3.4.19
- Vite v7.2.4
- React 19 + TypeScript
- shadcn/ui (40+ 组件已预装)

## 核心功能
1. **个人名片主页** — 自我介绍、头像、社交链接
2. **博客系统** — Markdown 笔记上传 + Obsidian 双链 `[[...]]` 解析
3. **GitHub 项目展示** — 通过 GitHub API 实时展示 pinned repos + 贡献图表
4. **响应式设计** — 桌面端 + 移动端完美适配

## Git 工作流
```
main (OSS hub)
  ├── scaffold   → 基础架构 + 首页 + 共享组件
  ├── pages-blog → 博客列表页 + 博客详情页 + Markdown 解析
  ├── pages-gh   → GitHub 项目展示页 + API 集成
  └── final-build→ 合并 + 构建 + 部署
```

**提交规范**:
```
[agent] stage: description
# 例如: [scaffold] init: landing page + shared infra
# 例如: [blog] feat: markdown rendering with wikilink support
```

---

## 阶段执行表

### Phase 0: 用户本地工具链准备（由用户完成）
| 工具 | 用途 | 配置建议 |
|------|------|---------|
| VS Code | 主 IDE | 安装 Kimi 插件、GitLens |
| Kimi Code CLI | 主力 Agent 执行 | `npm i -g kimi-code` 本地运行，避免 KimiClaw API 限流 |
| Claude Code | 困难问题攻坚 | `claude code` 命令行，用于复杂算法/架构问题 |
| OpenClaw | 备选 Agent 集群 | 本地 Docker 部署，作为 KimiClaw 的替代 |
| Git | 版本控制 | 项目仓库初始化 |

### Phase 1: 项目初始化（Main Agent / 你自己）

**动作**: 运行 init-webapp.sh
```bash
PROJECT_PATH=$HOME/init REMOTE_PATH=/mnt/agents/output/app \
  bash /app/.agents/skills/webapp-building-swarm/scripts/init-webapp.sh "Personal Blog & Portfolio"
```

**产出**: 
- `/mnt/agents/output/app/` — 共享 git 仓库
- 预装 40+ shadcn/ui 组件
- Tailwind + Vite + React 19 + TypeScript

**Git**: `git commit -m "init: scaffold Next.js project with shadcn"`

---

### Phase 2: 设计阶段（Pro_Designer Agent — Kimi K2.5）

**Agent 配置**:
- **名称**: Pro_Designer
- **模型**: Kimi K2.5（设计能力优秀，且速度快）
- **Prompt 模板**: 使用 skill 要求的标准模板

**Designer 任务**:
1. 读取 `/app/.agents/skills/vibecoding-webapp-swarm/design-guide.md`
2. 产出 `/mnt/agents/output/design/design.md` — 全局设计系统
3. 产出页面级设计文件:
   - `home.md` — 个人名片首页
   - `blog.md` — 博客列表页
   - `blog-post.md` — 博客详情页
   - `projects.md` — GitHub 项目展示页
   - `about.md` — 关于页

**关键设计决策**:
- 是否使用 `photographer-style` / `modo-style` / `exvia-style` 等现成模板？（建议：基于 0-origin 自定义，更灵活）
- 暗色/亮色主题？（个人博客建议：暗色底 + 强调色，更 tech）
- Markdown 渲染风格：代码高亮、数学公式、目录导航

**Git Tag**: `v0.1-design`

---

### Phase 3: 架构确认 + 分组规划（Main Agent / 你自己）

**动作**: 读取 design.md，决定 Agent 分组

**建议分组**（基于功能相关性）:

| 组名 | 负责页面/功能 | Agent 类型 | 模型选择 |
|------|--------------|-----------|---------|
| **Scaffold** | 首页 + 共享组件 (Navbar/Footer/Layout) + 路由 + 主题 | 单 Agent | Kimi K2.5 |
| **Blog** | 博客列表页 + 博客详情页 + Markdown 解析器 + Obsidian 双链 | 单 Agent | Kimi K2.5（困难处呼叫 Claude Opus） |
| **GitHub** | GitHub API 集成 + 项目展示页 + 贡献图表 | 单 Agent | Kimi K2.5 |

**分支创建**:
```bash
cd /mnt/agents/output/app
git branch scaffold
git branch pages-blog
git branch pages-gh
```

---

### Phase 4: Scaffold（Scaffold Agent — Kimi K2.5）

**配置**:
- 使用 `setup-local.sh` 创建本地工作树
- 读取 `react-dev.md` + `design.md` + `home.md`
- 生成图片/视频资产到 `public/`

**产出**:
- 完整的首页实现
- `src/components/Navbar.tsx` — 含所有路由链接
- `src/components/Footer.tsx`
- `src/components/Layout.tsx`
- `src/index.css` — Tailwind 主题配置 + Google Fonts
- `src/App.tsx` — HashRouter + 所有子页面路由桩
- 生成的媒体资产已 commit

**Git**: `git commit -m "scaffold: landing page + shared infra"`

---

### Phase 5: 合并 Scaffold + 创建 Page 分支

```bash
cd /mnt/agents/output/app
git merge scaffold --no-edit
# 此时 main 有 Scaffold 的全部代码
# Page Agent 分支需要基于合并后的 main
```

**注意**: 由于分支已提前创建，它们是从 pre-scaffold 的 main 分出的。Page Agents 需要处理可能的合并，或者我们在创建分支时已经确保了基于 scafffold 分支。实际上 skill 文档说先创建 scaffold 分支，然后其他分支在 scaffold merge 后创建。让我修正一下顺序。

根据 skill：
1. 先只创建 scaffold 分支
2. Scaffold merge 后，再创建 pages 分支（从合并后的 main）

修正后的分支管理：
```bash
cd /mnt/agents/output/app
git branch scaffold  # 仅创建 scaffold 分支
# ... Scaffold Agent 完成后 ...
git merge scaffold --no-edit
# 现在创建 pages 分支
 git branch pages-blog
git branch pages-gh
```

---

### Phase 6: 并行 Page Agents

**Agent 1: Blog Developer（Kimi K2.5 + Claude Opus 4.6 支援）**

**职责**:
- 博客列表页 (`/blog`) — 卡片布局、标签过滤、搜索
- 博客详情页 (`/blog/:slug`) — Markdown 全文渲染
- **核心难点**: Obsidian 双链解析 `[[Note Title|Display Text]]`
  - 解析 wikilink 为内部路由链接
  - 处理 frontmatter (yaml metadata)
  - 代码高亮 (prismjs / shiki)
  - 目录导航 (TOC)

**技术方案（Obsidian 接入）**:
```
用户本地 Obsidian Vault
    ↓ 手动复制或 Git 同步
项目 content/ 目录下的 .md 文件
    ↓ build 时解析
静态 JSON 数据（标题、slug、标签、日期、摘要）
    ↓ 前端渲染
博客列表 + 博客详情页
```

**依赖建议**:
- `gray-matter` — frontmatter 解析
- `remark` + `rehype` — Markdown → HTML
- `remark-gfm` — GitHub Flavored Markdown
- `remark-wiki-link` 或自定义插件 — Obsidian 双链
- `shiki` 或 `prismjs` — 代码高亮
- `react-markdown` — React 组件化渲染

**Git**: `git commit -m "blog: markdown blog with wikilink support"`

---

**Agent 2: GitHub Integration Developer（Kimi K2.5）**

**职责**:
- GitHub 项目展示页 (`/projects`) 
- 展示 pinned repositories（星数、语言、描述）
- 贡献热力图 (GitHub Contributions Graph)
- 可选：最近的 commit 活动

**技术方案**:
```
GitHub REST API (无认证: 60 req/hr, 有 Token: 5000 req/hr)
    ↓
用户 GitHub username → pinned repos (使用 GraphQL API)
    ↓
静态缓存 + 定期刷新
```

**API 端点**:
- `GET /users/{username}/repos` — 公开仓库
- GitHub GraphQL API — pinned repositories
- `https://github.com/users/{username}/contributions` — 贡献数据（非官方，但可用）

**注意**: 由于 sandbox 无法做后端，前端直接调用 GitHub API（CORS 允许），或使用 mock 数据 + 说明如何接入真实数据。

**Git**: `git commit -m "github: integrate github api for project showcase"`

---

### Phase 7: 合并、构建、部署

**合并策略**:
```bash
cd /mnt/agents/output/app
git branch final-build
bash /app/.agents/skills/webapp-building-swarm/scripts/setup-local.sh final-build $HOME/app-final-build
cd $HOME/app-final-build
git merge pages-blog pages-gh --no-edit  # Octopus merge
```

**解决冲突**（如有）:
- 逐个 merge 并解决
- 主代理负责 wiring routes in `App.tsx`

**构建**:
```bash
cd $HOME/app-final-build && npm run build 2>&1
```

**部署**:
- 产出物: `dist/` 目录
- 使用 `deploy_website` 工具部署
- 或用户自行部署到 Vercel/Netlify/GitHub Pages

**Git Tag**: `v1.0-release`

---

## 模型使用策略

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 视觉设计 | **Kimi K2.5** | 设计文档生成速度快，理解力强 |
| 基础页面开发 | **Kimi K2.5** | 代码生成效率高，React/Tailwind 表现好 |
| Obsidian 双链解析器 | **Claude Opus 4.6** | 复杂 AST 转换逻辑，需要精确推理 |
| GitHub API 集成 | **Kimi K2.5** | 标准 API 调用，无需特别强推理 |
| Bug 修复 / 性能优化 | **Kimi K2.5** 为主 | 快速迭代，困难处用 Claude |
| 路由合并冲突解决 | **Claude Opus 4.6** | 复杂代码合并决策 |

---

## 本地开发工具链详细配置

### Kimi Code CLI（主力）
```bash
# 安装
npm install -g kimi-code

# 配置（使用 Allegretto 套餐获取多 Agent 支持）
kimi config set api_key <your_key>

# 启动项目级 Agent（推荐在项目目录执行）
cd your-project
kimi agent  # 启动上下文感知的 Agent

# 使用子 Agent（不污染主上下文）
kimi agent --system-prompt "你是一个专业的前端动画开发者"
```

**为什么用 CLI 而不是 KimiClaw**: 
- 避开 KimiClaw 的 API rate limit（多 Agent 同时说话会触发）
- 本地文件系统访问无限制
- 代码库作为上下文，Token 消耗更可控

### Claude Code（攻坚）
```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 启动（用于困难问题）
claude

# 使用 Claude Opus 4.6
claude --model claude-opus-4-6
```

**何时呼叫 Claude**:
1. Markdown AST 转换遇到 edge case
2. GitHub GraphQL API 查询构造复杂
3. 性能优化需要深度分析
4. 合并冲突涉及复杂逻辑

### OpenClaw（备选 Agent 集群）
```bash
# Docker 本地部署
docker run -p 8080:8080 openclaw/openclaw

# 作为本地 Agent 集群协调器
# 可以在 Kimi Code 无法并行时，用 OpenClaw 同时启动多个 Agent
```

### VS Code + 插件
- **Kimi 插件**: 代码补全、内联对话
- **GitLens**: 查看每行代码的 Agent 作者（开玩笑的，但 Git 历史很有用）
- **ESLint + Prettier**: 代码规范统一
- **Tailwind CSS IntelliSense**: 类名提示

---

## Obsidian 接入详细方案

### 方案 A: 手动复制（推荐，最简单）
```
你的 Obsidian Vault
    ↓ 选择需要发布的笔记，复制到
my-blog/content/posts/
    ↓ 构建时
前端自动解析为博客
```

**优点**: 完全可控，无需额外工具
**缺点**: 每次更新需要手动复制

### 方案 B: Obsidian Git 插件自动同步
```
Obsidian Vault ← Git 插件 → GitHub 私有仓库
                                    ↓ CI/CD
                              my-blog 自动拉取更新
```

**配置步骤**:
1. Obsidian 安装 **Obsidian Git** 插件
2. 配置 Vault 同步到 GitHub 私有仓库
3. 网站项目设置 GitHub Actions 定时拉取
4. 或本地构建前手动 `git pull` 笔记仓库

### 方案 C: Tarsier（高级，但可能过时）
使用 Obsidian 的 Tarsier 插件导出为静态网站。但这不是我们想要的——我们要的是集成到自己的 React 网站中。

**本方案采用: 方案 A + 预留方案 B 接口**

---

## Git 里程碑

| Tag | 说明 |
|-----|------|
| `v0.0-init` | 项目初始化完成 |
| `v0.1-design` | 设计文档完成 |
| `v0.2-scaffold` | 首页 + 共享组件完成 |
| `v0.3-blog` | 博客系统完成 |
| `v0.4-github` | GitHub 集成完成 |
| `v0.5-merge` | 所有分支合并完成 |
| `v0.6-polish` | 测试优化完成 |
| `v1.0-release` | 正式上线 |

---

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| KimiClaw API 限流导致多 Agent 卡顿 | **使用 Kimi Code CLI 本地执行**，串行或控制并发数 |
| Obsidian wikilink 含特殊字符解析失败 | 交由 **Claude Opus 4.6** 处理 edge case |
| GitHub API 无认证限流 60 req/hr | 引导用户配置 `GITHUB_TOKEN` 环境变量 |
| 设计/代码不一致 | 严格遵循 design.md 为 single source of truth |
| 分支合并冲突 | Main Agent 统一协调，逐个 merge |
| 图片/视频生成资产不符合设计 | Scaffold Agent 按 design.md 精确描述生成 |

---

## 立即开始执行

如果你想立即开始，我可以现在为你执行 **Phase 1: 项目初始化** + **Phase 2: 设计阶段**（启动 Pro_Designer Agent）。

需要我开始吗？
