# Obsidian 个人博客集成方案完整说明

## 目录
- [项目现状](#项目现状)
- [完整方案架构](#完整方案架构)
- [技术栈](#技术栈)
- [分模块实现](#分模块实现)
- [文件结构变更](#文件结构变更)
- [配置说明](#配置说明)
- [使用流程](#使用流程)

---

## 项目现状

### 当前博客系统
- **前端**：React 18.3.1 + TypeScript 5.6.2 + Vite 6.0.1
- **UI框架**：Tailwind CSS + shadcn/ui
- **动画**：Framer Motion + GSAP
- **国际化**：i18n（zh/en）
- **主题**：亮色/暗色模式，带完整色彩系统
- **Markdown渲染**：ReactMarkdown + remarkGfm + Shiki 代码高亮
- **当前存储**：`src/data/posts.ts` 静态数组

### 已有 Obsidian 相关基础
| 功能 | 状态 | 文件 |
|------|------|------|
| Wikilink解析 | ✅ 已实现 | `MarkdownRenderer.tsx` `preprocessWikilinks()` |
| Obsidian Callout | ✅ 已实现 | `MarkdownRenderer.tsx` `Callout` 组件 |
| Frontmatter解析 | ✅ 已实现 | `MarkdownRenderer.tsx` `parseFrontmatter()` |

---

## 完整方案架构

```
┌─────────────────┐
│  Obsidian Vault │  本地文件夹存放 .md 文件
│  (~/Documents/  │
│   obsidian-vault)│
└────────┬────────┘
         │ 实时读取
         ▼
┌─────────────────────────┐
│  Obsidian Sync Server   │  本地轻量 HTTP 服务器
│  (Express / Node.js)    │  监听 localhost:2667
│  ├─ GET /api/notes      │  列出所有笔记
│  ├─ GET /api/notes/:slug│  读取单篇笔记
│  └─ POST /api/deploy    │  触发 GitHub Actions
└────────┬────────────────┘
         │
┌────────┴────────┐
│  React 前端     │
│  vibecoding.com │
│  ├─ /obsidian    │  Obsidian 笔记浏览器
│  ├─ /blog        │  博客列表
│  └─ /blog/:slug  │  文章详情（含反向链接）
└────────┬────────┘
         │
┌────────┴─────────────┐
│  GitHub + Actions    │  自动部署到 Vercel
│  ├─ content/         │  Obsidian 笔记同步目录
│  └─ .github/workflows/│  自动部署 workflow
└──────────────────────┘
```

---

## 技术栈

| 组件 | 技术选型 | 版本 |
|------|---------|------|
| 本地同步服务器 | Node.js + Express | 18.x+ |
| 文件监听 | chokidar | ^3.6.x |
| GitHub API | octokit | ^19.x |
| WebSocket（可选） | ws | ^8.x |
| 反向链接/图谱 | D3.js | ^7.x |

---

## 分模块实现

### 模块一：Obsidian Sync Server（本地）

#### 核心功能
1. **笔记读取**：递归扫描 Obsidian vault 文件夹，找出所有 `.md` 文件
2. **Frontmatter解析**：用 `gray-matter` 解析笔记 frontmatter
3. **目录树生成**：返回笔记的元信息（title, slug, tags, date）
4. **一键发布**：提供 API 触发 GitHub Actions 部署

#### 实现文件
- `obsidian-server/package.json` - 依赖管理
- `obsidian-server/server.ts` - 主服务器入口
- `obsidian-server/config.ts` - 配置（vault 路径、端口、GitHub Token）
- `obsidian-server/lib/vaultReader.ts` - vault 读取工具
- `obsidian-server/lib/githubClient.ts` - GitHub API 客户端

#### API 设计
```http
# 获取所有笔记元信息
GET /api/notes
Response:
{
  "notes": [
    {
      "slug": "slow-programming",
      "title": "Slow Programming",
      "date": "2025-04-03",
      "category": "Development",
      "tags": ["programming", "philosophy"],
      "excerpt": "In a world obsessed with speed...",
      "modified": "2025-05-04T12:00:00Z"
    }
  ]
}

# 获取单篇笔记内容
GET /api/notes/:slug
Response:
{
  "content": "# Slow Programming\n\n...",
  "frontmatter": {
    "title": "Slow Programming",
    "slug": "slow-programming"
  }
}

# 触发一键发布到 GitHub
POST /api/deploy
Body:
{
  "slugs": ["slow-programming", "philosophy-of-enough"]
}
Response:
{
  "status": "started",
  "workflowId": "123456"
}
```

---

### 模块二：前端 Obsidian 集成

#### 核心功能
1. **Obsidian 笔记浏览器**：可视化浏览本地 vault 中的笔记
2. **反向链接面板**：在文章底部显示"哪些文章链接到本文"
3. **未链接笔记提示**：在博客页面显示尚未发布的笔记
4. **知识图谱（可选）**：D3.js 可视化笔记链接关系

#### 新增文件
| 文件 | 功能 |
|------|------|
| `src/services/obsidianClient.ts` | 与本地 Sync Server 通信 |
| `src/services/linkParser.ts` | 解析 wikilink，构建链接关系图 |
| `src/pages/ObsidianBrowser.tsx` | Obsidian 笔记浏览器页面 |
| `src/components/Backlinks.tsx` | 反向链接组件 |
| `src/components/GraphView.tsx`（可选） | 知识图谱可视化 |

#### 关键数据结构
```typescript
// src/types/index.ts
interface Note {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  modified: Date;
  // 新增链接关系
  outboundLinks: string[];
  inboundLinks: string[];
}

interface LinkGraph {
  nodes: { id: string; group: number }[];
  links: { source: string; target: string }[];
}
```

---

### 模块三：GitHub Actions 自动部署

#### Workflow 文件
```yaml
# .github/workflows/deploy.yml
name: Deploy Blog
on:
  push:
    branches: [main]
  workflow_dispatch: # 允许手动触发

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: --prod
```

---

## 文件结构变更

```
个人网站vibecoding/
├── .github/
│   └── workflows/
│       └── deploy.yml          # 新增：自动部署 workflow
├── obsidian-server/           # 新增：本地同步服务器
│   ├── package.json
│   ├── server.ts
│   ├── config.ts
│   └── lib/
│       ├── vaultReader.ts
│       └── githubClient.ts
└── app/
    └── src/
        ├── components/
        │   ├── Backlinks.tsx # 新增：反向链接组件
        │   └── GraphView.tsx # 可选：知识图谱
        ├── pages/
        │   └── ObsidianBrowser.tsx # 新增
        ├── services/
        │   ├── obsidianClient.ts # 新增
        │   └── linkParser.ts     # 新增
        └── types/
            └── index.ts          # 更新：Note 类型
```

---

## 配置说明

### 1. 本地 Sync Server 配置
在 `obsidian-server/config.ts` 中：
```typescript
export default {
  // 你的 Obsidian vault 绝对路径
  vaultPath: '/Users/你的用户名/Documents/obsidian-vault',
  // 服务器端口
  port: 2667,
  // GitHub Personal Access Token (PAT)
  githubToken: process.env.GITHUB_TOKEN || '',
  // GitHub 仓库信息
  githubRepo: {
    owner: '你的用户名',
    repo: '个人网站vibecoding'
  }
};
```

### 2. GitHub Secrets 配置
在仓库 Settings → Secrets and variables → Actions 中添加：
| Secret | 值 |
|--------|-----|
| `VERCEL_TOKEN` | Vercel Token |
| `ORG_ID` | Vercel Org ID |
| `PROJECT_ID` | Vercel Project ID |

---

## 使用流程

### 完整写作发布流程

1. **启动本地服务**
   ```bash
   cd obsidian-server
   npm install
   npm run dev
   ```

2. **在 Obsidian 写作**
   - 在 Obsidian 中打开你的 vault
   - 写文章，用 `[[Note Title]]` 链接到其他笔记
   - 文章开头添加 frontmatter：
     ```yaml
     ---
     title: Slow Programming
     slug: slow-programming
     category: Development
     tags: [programming, philosophy]
     ---
     ```

3. **本地预览**
   - 浏览器访问 `http://localhost:3000/obsidian`
   - 浏览所有 Obsidian 笔记，点击可预览
   - 在 `/blog` 页面看到实时更新的文章列表

4. **一键发布**
   - 在 ObsidianBrowser 页面点击"发布到 GitHub"
   - GitHub Actions 自动构建并部署到 Vercel
   - 约 5 分钟后，公网访问即可看到新文章

---

## 总结

### 核心特性
✅ **真正的 Obsidian 连接** - 本地服务器实时读取 vault，不需要手动上传
✅ **完整 wikilink 支持** - 内部链接自动可点击，支持显示别名
✅ **反向链接面板** - 文章底部显示哪些文章链接到当前文章
✅ **一键发布** - 点击按钮触发 GitHub Actions 自动部署
✅ **保留现有功能** - 完全兼容当前博客的所有 UI/UX

### 额外可选增强
- 📊 知识图谱可视化（D3.js）
- 📱 移动端 Obsidian 同步（通过 Tailscale）
- 🔄 实时编辑同步（WebSocket + chokidar 监听）
- 📦 本地服务器打包成 macOS App (pkg)

---

是否开始实现？我可以从 **Obsidian Sync Server** 和 **反向链接功能** 开始逐步构建。
