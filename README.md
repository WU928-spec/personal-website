# Jasper · 个人生活小站

[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-222?logo=githubpages&logoColor=white)](https://www.wuspace.top)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.4-CC0000?logo=jekyll&logoColor=white)](https://jekyllrb.com)
[![Ruby](https://img.shields.io/badge/Ruby-3.3-CC342D?logo=ruby&logoColor=white)](https://www.ruby-lang.org)
[![Obsidian](https://img.shields.io/badge/Content-Obsidian-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)

> 以 Obsidian 维护内容、由 Jekyll 生成的静态个人网站，记录生活、学习和一些随手写下的东西。
>
> 在线地址：https://www.wuspace.top

---

## 🏗️ 当前架构

主站已从 React/Vite/Supabase 迁移为 **Jekyll + Obsidian + GitHub Pages**。文章、动态和星空短文都是仓库内的 Markdown 文件，构建结果为纯静态页面，不再依赖数据库、网站后台或在线编辑器。

| 部分 | 当前实现 |
|------|----------|
| 主站 | `site/` 下的 Jekyll 4.4 静态网站，使用 Liquid、语义 HTML、共享 CSS 和原生 JavaScript |
| 内容 | 通过 Obsidian 维护 `_notes/`、`_moments/` 和 `_memoirs/` 中的 Markdown |
| 小工具 | 五个旧版工具的独立入口仍使用 React + TypeScript，经 Vite 构建为纯静态资源 |
| 构建与部署 | GitHub Actions 刷新真实贡献数据、运行站点测试，使用 Node 22 构建工具、Ruby 3.3 构建 Jekyll，并发布到 GitHub Pages |
| 自定义域名 | `site/CNAME` 固定为 `www.wuspace.top` |

---

## ✨ 功能概览

| 模块 | 描述 |
|------|------|
| 🏠 **个人主页** | 圆形头像、最新笔记与日常动态，以及使用真实数据的 GitHub 贡献热力图 |
| 📚 **Markdown 笔记** | 支持栏目、标签、摘要、目录与标题锚点；使用 kramdown/GFM、Rouge 代码高亮和 KaTeX 数学公式 |
| 💭 **记忆碎片** | 日常动态与“网站维护日志”分栏展示，均通过 Markdown 维护 |
| 🛠️ **五个静态工具** | 实习决策助手、英文分段器、每日电影推荐、开发工具、Git & Conda 指南 |
| 🔍 **站内搜索** | 通过 Jekyll 生成的静态 JSON 索引搜索笔记和动态，草稿不会进入索引 |
| 🎵 **连续浏览体验** | 首页、文章、动态和工具之间无刷新切换，音乐播放器跨页面保持；默认静音且不自动播放 |
| 🌌 **隐藏星空** | 由 `_memoirs/` 驱动的星空短文与隐藏彩蛋页面 |
| 🌗 **主题与语言** | 深浅主题、中英文界面控件，以及键盘导航和减少动态效果支持 |

---

## 🛠️ 技术栈

**主站**

- [Jekyll 4.4](https://jekyllrb.com) + Ruby 3.3
- Liquid 模板、语义 HTML、共享 CSS、无框架浏览器 JavaScript
- kramdown（GFM 输入）+ Rouge + KaTeX
- 静态 JSON 搜索索引

**旧版工具构建**

- React 19 + TypeScript 5.9
- Vite 7.2，配置位于 `app/vite.tools.config.ts`
- 仅独立工具入口参与新站构建，不作为主站运行时

**发布**

- GitHub Actions + GitHub Pages
- Obsidian + Obsidian Git 可用于自动提交和推送内容

---

## 📁 目录结构

```text
personal-website/
├── site/                         # 当前主站，也是 Obsidian 公开内容库
│   ├── _notes/                   # 文章笔记
│   ├── _moments/                 # 生活动态与网站维护日志
│   ├── _memoirs/                 # 星空短文
│   ├── _layouts/                 # Jekyll 页面布局
│   ├── _includes/                # 共享模板
│   ├── assets/
│   │   ├── css/                  # 共享样式
│   │   ├── js/                   # 浏览器交互与测试
│   │   ├── data/                 # 静态 GitHub 贡献数据
│   │   ├── media/                # 图片等公开媒体
│   │   └── legacy-tools/         # 旧版工具的构建产物
│   ├── scripts/                  # 构建前的数据更新脚本
│   ├── notes/                    # 笔记列表
│   ├── moments/                  # 动态与维护日志
│   ├── tools/                    # 五个静态工具
│   ├── starry/                   # 星空彩蛋
│   ├── _config.yml               # Jekyll 配置
│   ├── CNAME                     # 自定义域名
│   └── README.md                 # Obsidian 写作与发布说明
├── app/                          # 旧应用；仅旧版工具入口参与新站构建
├── docs/superpowers/             # 当前迁移设计与计划
└── .github/workflows/pages.yml   # 构建与部署工作流
```

---

## 🚀 本地开发

需要 **Ruby 3.3 + Bundler**；构建五个静态工具和刷新 GitHub 贡献数据还需要 **Node 22**。

```bash
# 克隆仓库
git clone https://github.com/WU928-spec/personal-website.git
cd personal-website/app

# 构建旧版工具的静态资源
npm ci
npm run build:tools

# 刷新真实贡献数据，安装 Jekyll 依赖并启动本地预览
cd ../site
node scripts/update-github-contributions.mjs
bundle install
bundle exec jekyll serve --source . --destination _site
```

打开终端输出的本地地址即可预览。贡献数据获取失败时会保留仓库内已有的静态 JSON。生产构建和站点脚本测试：

```bash
cd site
bundle exec jekyll build --source . --destination _site
node --test assets/js/*.test.js
```

生成目录和项目内依赖已被 `.gitignore` 排除。

---

## ✍️ 写作与发布

1. 在 Obsidian 中打开 `site/` 或其内容目录。
2. 在对应集合中新建 Markdown，并填写 front matter：

| 目录 | 内容 | 主要字段 |
|------|------|----------|
| `site/_notes/` | 文章笔记 | `title`、`date`、`written_date`、`category`、`tags`、`description`、`slug`、`published` |
| `site/_moments/` | 生活动态与网站维护日志 | `title`、`date`、`images`、`location`、`category`、`published` |
| `site/_memoirs/` | 星空短文 | `title`、`date`、`published` |

3. 网站维护日志使用 `category: 网站维护日志`，一天一篇，显示在动态页独立栏目。
4. 将公开图片放入 `site/assets/media/`，使用仓库相对路径引用。
5. 将 `published: false` 用作草稿；草稿不会生成公开页面，也不会进入列表或搜索。
6. 提交并推送到 `main` 后，GitHub Actions 会刷新贡献数据、运行测试、构建并发布网站。

完整示例和 Obsidian Git 配置见 [`site/README.md`](site/README.md)。不要提交 `.env`、密钥、私人笔记或不愿公开的图片。

---

## 🔄 旧应用与历史数据

`app/` 主要保留作历史与回退参照，只有五个旧版小工具的独立入口参与当前构建，请勿将其误认为主站。旧 Supabase、localStorage 和云端数据不由新站读取、迁移或删除；历史 React 设计文档描述的是迁移前架构。

当前迁移文档：

- [Jekyll + Obsidian 迁移设计](docs/superpowers/specs/2026-11-02-jekyll-obsidian-migration-design.md)
- [迁移实施计划](docs/superpowers/plans/2026-11-02-jekyll-obsidian-migration.md)
- [Obsidian 写作与发布流程](site/README.md)
