# Jekyll + Obsidian + GitHub Pages 静态迁移设计

日期：2026-11-02

## 1. 目标

将当前 React/Vite/Supabase 个人网站迁移为以 Obsidian 为主要维护入口的 Jekyll 静态网站。写作、动态发布和内容备份都以仓库内 Markdown 文件为中心，GitHub Actions 负责构建并发布到 GitHub Pages。

现有自定义域名 `https://www.wuspace.top` 保持不变。

## 2. 已确认决策

- 整站采用 Jekyll，不保留 React 作为主站运行时。
- 记忆碎片改成 Markdown 集合；删除点赞、评论和网站在线编辑器。
- 新站从空内容仓库开始，不读取或迁移 Supabase/localStorage 内容。
- 旧云端和本地数据不删除；当前 `app/` 保留作迁移参照，不作为新站运行依赖。
- GitHub Pages 使用用户名主站作为默认构建来源，自定义域名为 `www.wuspace.top`。
- 保留当前生活博客视觉、五个小工具和隐藏星空入口。

## 3. 总体架构

新站位于 `site/`，既可作为 Jekyll 源目录，也可作为 Obsidian 的公开内容库。

```text
site/
├── _config.yml
├── CNAME
├── Gemfile
├── index.html
├── _layouts/
│   ├── default.html
│   ├── home.html
│   ├── note.html
│   ├── moment.html
│   └── tool.html
├── _includes/
│   ├── head.html
│   ├── header.html
│   └── footer.html
├── _notes/
├── _moments/
├── _memoirs/
├── assets/
│   ├── css/main.css
│   ├── js/main.js
│   ├── js/search.js
│   └── media/
├── notes/
├── moments/
├── tools/
├── starry/
├── search.json
└── README.md
.github/workflows/pages.yml
```

`app/` 在迁移期间保留，Jekyll 不读取它。新站构建不引用 Supabase、Vite 或 React 产物。

## 4. 内容模型

### 笔记

每篇笔记是 `_notes/` 下的 `.md` 文件，文件名只影响默认 slug，不要求日期前缀。

```yaml
---
title: 一个普通的周末
date: 2026-11-02 10:00:00 +08:00
tags: [生活, 日常]
published: true
---
```

支持 `title`、`date`、`tags`、`published`、`description` 和可选 `slug`。`published: false` 是草稿，不应出现在列表、搜索、RSS 或公开页面中。

### 动态

每篇动态是 `_moments/` 下的 `.md` 文件：

```yaml
---
date: 2026-11-02 18:00:00 +08:00
images:
  - /assets/media/example.jpg
location: 可选地点
published: true
---
```

正文是动态文字，图片路径指向仓库内媒体文件。点赞、评论和在线发布不再存在。

### 星空记忆

使用 `_memoirs/` 保存星空短文，Jekyll 为每篇生成静态页面。隐藏入口继续位于页脚星形装饰，不要求访客理解该入口。

## 5. 页面与视觉

保留已确认的长期主义生活博客方向：暖纸白、墨黑、酒红、中文衬线标题、清晰文章流和无头像首屏。

- 首页：欢迎语、最新笔记、近期动态、更多文章、关于我和真实 GitHub 链接。
- 笔记列表：标题、日期、摘要、标签；阅读页支持目录和舒适行宽。
- 动态列表：按日期排列文字与图片。
- 工具索引：五个工具均可访问。
- 星空：`/starry/`、记忆页、尾声和隐藏内容以静态 HTML/CSS/JS 保留。
- 404、搜索和空态有明确页面，不依赖远程服务。

Jekyll 模板只负责结构，共享 CSS 负责排版；不把业务逻辑写入 Liquid 循环之外的内联脚本。

## 6. Markdown、公式、代码与搜索

- kramdown 使用 GFM 输入，表格、列表、引用、链接与标题正常渲染。
- Rouge 负责构建时代码高亮，复制按钮使用浏览器 Clipboard API，并保留纯文本。
- KaTeX 自动渲染行内 `$...$` 与块级 `$$...$$`；跳过 code/pre 元素，长公式只在自身容器滚动。
- 标题锚点保留中文、重复标题和链接文字；目录链接必须与最终标题 id 一致。
- 搜索使用 Jekyll 生成的静态 JSON 索引和浏览器 JavaScript，不包含草稿。
- 首屏、列表和搜索不依赖 Supabase 或任何运行时数据库。

## 7. 工具静态化

五个现有工具全部保留为静态页面，不删除功能来缩短迁移：

- 实习决策助手：表单、权重计算、排序与图表使用浏览器 JavaScript；不依赖服务器。
- 英文分段器：文本处理完全在浏览器执行。
- 每日电影推荐：本地电影库与每日选择离线可用；可选 AI 功能继续由用户自己的浏览器直接调用现有服务，不上传或保存他人密钥。
- 开发工具：Git 分支与 Conda 状态在浏览器内模拟。
- Git & Conda 指南：复用现有静态幻灯片内容和资源。

这些工具不引入主站 React 或 Supabase 运行时。外部 AI 调用失败时仍使用本地推荐。

## 8. 主题、语言与可访问性

- 深浅主题通过 CSS 变量和 localStorage 保存，不依赖后端。
- 中英文 UI 控件使用 `data-i18n` 与静态翻译表；已有中文正文不自动翻译。
- 保留键盘导航、可见焦点、语义标题、图片 alt、屏幕阅读器标签和减少动态效果。
- 移动菜单、搜索和编辑器替代流程均在浏览器本地工作。

## 9. GitHub Pages 与自定义域名

`_config.yml`：

```yaml
url: "https://www.wuspace.top"
baseurl: ""
```

`site/CNAME`：

```text
www.wuspace.top
```

GitHub Actions 使用官方 Pages actions：配置 Pages、在 `site/` 安装 Ruby/Jekyll 依赖、构建、上传 artifact 并部署。部署只在默认分支推送或手动触发时运行。

不自动创建 GitHub 仓库、不推送、不修改 DNS、不执行远程发布。实际启用时仍需仓库存在、Pages 选择 GitHub Actions、自定义域名和 DNS 指向 GitHub Pages。

## 10. Obsidian 维护流程

1. 将 `site/` 作为公开内容库或其中内容目录打开。
2. 在 `_notes/`、`_moments/` 或 `_memoirs/` 新建 Markdown。
3. 填写 front matter；`published: false` 保留草稿。
4. 媒体放入 `assets/media/` 并使用仓库相对路径。
5. Obsidian Git 自动 commit/push；GitHub Actions 构建并发布。

`site/README.md` 记录内容格式、草稿规则、媒体路径、本地预览和 Obsidian Git 建议设置。无需网站后台或在线编辑器。

## 11. 数据与回退安全

- 不读取、清空或删除 Supabase 和 localStorage。
- 不删除当前 `app/`；新站在 `site/` 独立可构建。
- 新站空仓库内容仅使用用户已授权的展示随笔，并直接作为真实 Markdown 文件存在。
- 若迁移验证失败，旧应用仍在当前工作区，可继续作为回退参照。

## 12. 测试与验收

- 使用 Jekyll 实际构建 `site/`，不得只检查文件存在。
- 检查生成 HTML 中的笔记、动态、搜索索引、草稿过滤、链接和 CNAME。
- 浏览器验证首页、笔记、动态、五个工具、搜索、主题、语言、隐藏星空和 404。
- 验证 Markdown/GFM/LaTeX、代码复制、中文/重复/带链接标题目录。
- 验证 375px、768px、1440px、深浅主题和减少动态效果。
- 验证新增 Markdown 后重新构建即可出现，不需要数据库或后台。
- 最终明确区分本地已验证内容与尚未执行的 GitHub 远程发布/DNS 操作。
