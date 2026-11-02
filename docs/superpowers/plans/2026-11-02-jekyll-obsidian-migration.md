# Jekyll + Obsidian + GitHub Pages 静态迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个由 Obsidian 维护、Jekyll 生成、GitHub Actions 发布到 `www.wuspace.top` 的完整静态个人网站。

**Architecture:** 新站位于 `site/`，使用 Jekyll collections 管理笔记、动态和星空记忆，纯静态 CSS/JavaScript 提供主题、搜索、公式与工具。旧 `app/` 不删除也不参与构建；GitHub Actions 只负责构建和部署。

**Tech Stack:** Jekyll 4、Liquid、kramdown/GFM、Rouge、原生 HTML/CSS/JavaScript、KaTeX、GitHub Pages Actions、Node 内置测试、Vitest 既有回归测试。

**Spec:** `docs/superpowers/specs/2026-11-02-jekyll-obsidian-migration-design.md`

## Global Constraints

- 新站不引用 Supabase、React、Vite 或任何数据库；不删除旧数据和旧 `app/`。
- 笔记、动态、星空记忆均来自 Markdown；`published: false` 不得生成页面或进入列表/搜索。
- 五个工具与隐藏星空全部保留，不能为了缩短迁移删除功能。
- 域名固定为 `https://www.wuspace.top`，`CNAME` 为 `www.wuspace.top`，`baseurl` 为空。
- 不自动创建仓库、推送、部署、修改 DNS；远程操作由用户之后确认。
- 不自动提交 Git。当前工作区已有大量未提交修改，禁止清理或重置。
- 本机 Ruby 2.6 不足以承担现代 Jekyll 构建；如需 `brew install ruby@3.3`，执行前必须单独取得用户同意。

## Review Focus

- 草稿和未来/无效日期：草稿绝不公开；无效日期使用中性回退，由 Task 2 的构建断言覆盖。
- 中文、重复和带链接标题：目录 href 必须等于实际标题 id，由 Task 3 的生成 HTML 测试覆盖。
- 长公式与代码窄屏：只让自身容器滚动，由 Task 3 的 CSS/浏览器验收覆盖。
- 工具空输入、非法命令和 AI 失败：不得抛出未捕获异常或清空已有内容，由 Task 5/6 的 Node 测试覆盖。
- 新 Markdown 写入后重建即发布：不得要求 Supabase 或后台，由 Task 7 的实际增量构建验证。

---

### Task 1: Jekyll 骨架、域名与 Pages 工作流

**Files:**
- Create: `site/_config.yml`
- Create: `site/Gemfile`
- Create: `site/CNAME`
- Create: `.github/workflows/pages.yml`
- Create: `site/index.html`
- Create: `site/404.html`

**Interfaces:**
- Produces: Jekyll source at `site/`，输出到 `site/_site/`；Actions 上传同一目录。

- [ ] **Step 1: 确认构建环境并处理现代 Ruby**

Run: `ruby --version && bundle --version`
Expected: 当前为 Ruby 2.6/Bundler 1.17，不能作为现代 Jekyll 的最终验证环境。

若本机仍无 Ruby >=3.3，先询问是否允许 `brew install ruby@3.3`。获批后安装并使用 `$(brew --prefix ruby@3.3)/bin` 下的 Ruby/gem/bundle；未获批则完成其他文件并明确构建被阻塞，不假装通过。

- [ ] **Step 2: 写最小配置与工作流**

`_config.yml`：

```yaml
title: Jasper
description: 记录生活，也记录那些慢慢想清楚的事。
url: "https://www.wuspace.top"
baseurl: ""
lang: zh-CN
markdown: kramdown
highlighter: rouge
kramdown:
  input: GFM
  auto_ids: true
collections:
  notes:
    output: true
    permalink: /notes/:title/
  moments:
    output: true
    permalink: /moments/:title/
  memoirs:
    output: true
    permalink: /starry/:title/
exclude:
  - Gemfile
  - Gemfile.lock
  - README.md
```

`Gemfile` 使用 `gem "jekyll", "~> 4.4"` 和 `gem "webrick", "~> 1.9"`。`CNAME` 只含 `www.wuspace.top`。`index.html` 与 `404.html` 先使用独立 HTML 和 `layout: default`，后续由模板替换内容。

Pages workflow 使用 `actions/configure-pages@v5`、`ruby/setup-ruby@v1`（`ruby-version: '3.3'`、`working-directory: site`、`bundler-cache: true`）、`actions/upload-pages-artifact@v3`（`path: site/_site`）和 `actions/deploy-pages@v4`。构建命令为 `bundle exec jekyll build --source site --destination site/_site`。权限为 `contents: read`、`pages: write`、`id-token: write`，触发器为默认分支 push 和 workflow_dispatch。

- [ ] **Step 3: 实际构建并检查域名**

Run: `cd site && bundle install && bundle exec jekyll build --source . --destination _site`
Expected: PASS；`_site/index.html`、`_site/404.html` 和 `_site/CNAME` 存在，CNAME 内容精确为 `www.wuspace.top`。

### Task 2: 共享模板、内容集合与首页

**Files:**
- Create: `site/_layouts/default.html`
- Create: `site/_layouts/home.html`
- Create: `site/_layouts/note.html`
- Create: `site/_layouts/moment.html`
- Create: `site/_includes/head.html`
- Create: `site/_includes/header.html`
- Create: `site/_includes/footer.html`
- Create: `site/assets/css/main.css`
- Create: `site/assets/js/main.js`
- Create: `site/notes/index.html`
- Create: `site/moments/index.html`
- Create: `site/_notes/2026-11-02-ordinary-weekend.md`
- Create: `site/_notes/2026-11-02-walk-math.md`
- Create: `site/_notes/draft-private.md`
- Create: `site/_moments/2026-11-02-small-things.md`
- Modify: `site/index.html`

**Interfaces:**
- Consumes: Task 1 的 Jekyll 配置。
- Produces: `site.notes`、`site.moments` 的公开过滤规则，统一 `layout` 和主题。

- [ ] **Step 1: 写构建前内容夹具**

创建两篇公开笔记、一个 `published: false` 草稿和一篇公开动态。公开笔记内容使用用户授权的周末随笔与散步公式：

```md
---
title: 一个普通的周末
date: 2026-11-02 10:00:00 +08:00
tags: [生活, 日常]
published: true
---
睡到自然醒，去附近的小店买一杯咖啡。下午整理书桌，把没读完的书往沙发上搬。

## 今天的小事

- 给绿植换了位置
- 沿着河边走了四十分钟
- 晚饭尝试做了番茄炖菜

> 普通的一天也值得留下来。
```

```md
---
title: 散步时想到的一点数学
date: 2026-11-02 12:00:00 +08:00
tags: [思考]
published: true
---
散步路线大致是一个圆。若半径是 $r$，一圈的距离就是：

$$C = 2\pi r$$
```

草稿使用 `title: 草稿不应公开`、`published: false`。动态包含正文与无外部依赖的本地图片数组。

- [ ] **Step 2: 实现共享布局与视觉**

`default.html` 使用语义 header/main/footer、SEO、CSS、主题初始化和 KaTeX 资源。header 仅首页/动态/笔记及搜索、语言、主题；footer 保留小工具与隐藏星空。

CSS 使用暖纸白/墨黑/酒红、Noto Serif SC 标题、Noto Sans SC 正文、680px 文章行宽、`clamp()` 标题和固定图片 aspect-ratio。深浅主题由 `data-theme` 控制，移动菜单和减少动态效果可用。

首页依次展示欢迎语、最新公开笔记、近期公开动态、更多笔记、文字关于我和 GitHub 链接。所有 Liquid 集合统一使用：

```liquid
{% assign public_notes = site.notes | where_exp: "note", "note.published != false" | sort: "date" | reverse %}
```

动态使用同等过滤。无内容时显示中性空态，日期无效时显示“日期待定”。

- [ ] **Step 3: 构建并断言草稿隔离**

Run: `cd site && bundle exec jekyll build --source . --destination _site`
Expected: PASS；生成公开笔记和动态，`_site/notes/草稿不应公开` 不存在，草稿标题不出现在首页、列表或后续搜索索引中。

### Task 3: Markdown 阅读、目录、公式与静态搜索

**Files:**
- Create: `site/assets/js/search.js`
- Create: `site/assets/js/content.js`
- Create: `site/search.json`
- Modify: `site/_layouts/note.html`
- Modify: `site/assets/css/main.css`
- Create: `site/_notes/2026-11-02-reading-links.md`

**Interfaces:**
- Consumes: 公开 notes 集合。
- Produces: `search.json` 静态索引、`content.js` 的目录/公式/代码增强。

- [ ] **Step 1: 添加复杂 Markdown 夹具**

```md
---
title: 阅读与链接
date: 2026-11-02 14:00:00 +08:00
published: true
---
## 阅读 [某本书](https://example.com) 笔记

这是 `inline` 与一段正文。

## 阅读 [某本书](https://example.com) 笔记

| 类型 | 感受 |
| --- | --- |
| 随笔 | 安静 |

$$x^2+y^2=z^2$$
```

- [ ] **Step 2: 实现搜索与内容增强**

`search.json` 仅遍历 `published != false` 的笔记，字段为 `title`、`url`、`excerpt`、`tags`，使用 Liquid `jsonify`。搜索框支持输入、Escape 关闭、上下键与 Enter，空结果显示非阻塞提示。

`content.js` 在 DOMContentLoaded 后：
- 为正文 h2/h3 分配中文安全且重复递增的 id，目录直接读取这些 id，不另写一套 slug 猜测。
- 对非 code/pre 文本节点运行 KaTeX `renderMathInElement`，支持 `$...$` 与 `$$...$$`。
- 为代码块添加复制按钮；Clipboard 不可用时保留选中文本提示。
- 行内代码不进入深色块，围栏代码保留纯文本。

- [ ] **Step 3: 构建并检查真实 HTML**

Run: `cd site && bundle exec jekyll build --source . --destination _site`
Expected: PASS；目录 href 与实际 id 完全一致，重复标题分别带 `-1`；表格、行内代码、公式文本和公开 URL 存在。375px 浏览器检查长公式/代码/表格只让自身滚动。

### Task 4: 动态、星空与 404

**Files:**
- Create: `site/starry/index.html`
- Create: `site/starry/epilogue.html`
- Create: `site/starry/secret.html`
- Create: `site/_memoirs/ordinary-light.md`
- Create: `site/assets/js/starry.js`
- Modify: `site/404.html`

**Interfaces:**
- Consumes: 公开 memoirs 集合和页脚 `/starry/` 链接。
- Produces: 静态星空、记忆详情、尾声与隐藏内容，无运行时后端。

- [ ] **Step 1: 实现静态星空与记忆**

星空页使用固定星点、键盘可聚焦链接和减少动态效果支持；记忆列表来自 `site.memoirs | where_exp: "memoir", "memoir.published != false"`。每篇记忆使用 front matter `title/date/published` 与正文。

尾声和隐藏内容使用普通静态页面，不伪造需要服务器验证的解锁状态。隐藏内容链接只在本地完成状态存在时显示；状态存 localStorage，不能宣称具有安全权限。

- [ ] **Step 2: 构建与链接验收**

Run: `cd site && bundle exec jekyll build --source . --destination _site`
Expected: `/starry/`、记忆详情、epilogue、secret 和 404 均生成；页脚星形可聚焦并进入 `/starry/`。

### Task 5: 工具索引、文本工具与静态指南

**Files:**
- Create: `site/_layouts/tool.html`
- Create: `site/tools/index.html`
- Create: `site/tools/text-segmenter.html`
- Create: `site/tools/git-conda-guide.html`
- Create: `site/assets/js/text-segmenter.js`
- Create: `site/assets/js/text-segmenter.test.js`
- Copy: `git-conda-deck/` → `site/assets/git-conda-deck/`

**Interfaces:**
- Produces: `segmentEnglish(text: string): string` 纯函数和静态工具路由。

- [ ] **Step 1: 写文本处理失败测试**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { segmentEnglish } from '../assets/js/text-segmenter.js'

test('segments sentences and preserves empty input', () => {
  assert.equal(segmentEnglish('Hello world. This is a note.'), 'Hello world.\n\nThis is a note.')
  assert.equal(segmentEnglish(''), '')
})
```

- [ ] **Step 2: 运行 RED 并实现**

Run: `node --test site/assets/js/text-segmenter.test.js`
Expected: 初次 FAIL（模块不存在）；实现规范化空白、句号/问号/叹号后换段、保持空输入后 PASS。

- [ ] **Step 3: 接入页面与指南**

工具索引列出全部五个工具。文本工具使用本地 textarea、按钮和输出；Git & Conda 指南页面链接或嵌入复制后的静态 deck，资源路径使用 `relative_url`。复制时排除任何秘密文件和本地缓存。

- [ ] **Step 4: 构建与浏览器验证**

Run: `cd site && bundle exec jekyll build --source . --destination _site`
Expected: PASS；工具索引、文本工具和指南可用，文本测试通过。

### Task 6: 实习、电影与开发工具静态化

**Files:**
- Create: `site/tools/internship.html`
- Create: `site/tools/movie-recommender.html`
- Create: `site/tools/devtools.html`
- Create: `site/assets/js/internship.js`
- Create: `site/assets/js/movies.js`
- Create: `site/assets/js/devtools.js`
- Create: `site/assets/js/tools.test.js`

**Interfaces:**
- Produces: `salaryScore()`、`commuteScore()`、`totalScore()`、`recommendMovie()`、`parseGitCommand()`、`parseCondaCommand()` 纯函数及对应静态页面。

- [ ] **Step 1: 写工具边界失败测试**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { salaryScore, commuteScore, totalScore } from '../assets/js/internship.js'
import { recommendMovie } from '../assets/js/movies.js'
import { parseGitCommand, parseCondaCommand } from '../assets/js/devtools.js'

test('clamps scores and handles invalid inputs', () => {
  assert.equal(salaryScore(0), 0)
  assert.equal(salaryScore(999), 100)
  assert.equal(commuteScore(-1), 100)
  assert.equal(totalScore({ salary: 300, commute: 0, intensity: 1, atmosphere: 10, growth: 10 }), 100)
})

test('movie fallback and invalid commands are safe', () => {
  assert.equal(recommendMovie('不存在的类型', []).title, '每日推荐')
  assert.equal(parseGitCommand('rm -rf /'), null)
  assert.equal(parseCondaCommand(''), null)
})
```

- [ ] **Step 2: 实现纯函数并运行测试**

Run: `node --test site/assets/js/tools.test.js`
Expected: 初次 FAIL；实现后 PASS。实习沿用当前权重：日薪 25%、体验 40%、前景 35%；体验由通勤 40%、强度 30%、氛围 30% 组成。所有评分限制在 0–100。

- [ ] **Step 3: 接入浏览器页面**

实习提供添加/编辑/删除、评分排序和本地条形图；电影提供本地每日推荐与可选 AI 失败回退，不在仓库写入密钥；开发工具支持既有 Git/Conda 白名单命令，未知命令显示错误而不执行系统操作。

- [ ] **Step 4: 构建与交互验收**

Run: `node --test site/assets/js/tools.test.js && cd site && bundle exec jekyll build --source . --destination _site`
Expected: 全部 PASS；空输入、重复操作和失败 AI 不产生未捕获异常。

### Task 7: Obsidian 文档与增量发布验证

**Files:**
- Create: `site/README.md`
- Create: `site/assets/media/README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Produces: 可实际照做的 Obsidian 写作与自动推送流程。

- [ ] **Step 1: 写维护文档**

README 包含 front matter 示例、草稿规则、媒体路径、本地 `bundle exec jekyll serve --source . --destination _site`、Obsidian Git 自动 commit/push 建议和 Pages/CNAME 启用条件。明确无需 Supabase、在线编辑器或后台。

AGENTS 更新当前架构为 `site/` Jekyll、内容集合、构建命令、域名与旧 `app/` 的回退边界；旧 React 文档标记为历史。

- [ ] **Step 2: 实际验证新增内容即发布**

新增 `site/_notes/incremental-check.md`，标题为“增量构建检查”、`published: true`，重新构建并确认生成页面和首页链接。随后把该文件改为 `published: false`，再次构建并确认公开页面、列表和搜索均不包含它。

Run: `cd site && bundle exec jekyll build --source . --destination _site`
Expected: 两次构建都 PASS，状态变化仅由 Markdown front matter 控制。

### Task 8: 完整验收与独立审查

**Files:**
- Modify: 仅修复验收发现的问题，不修改远程资源。

- [ ] **Step 1: 浏览器全流程**

用本地 Jekyll server 检查首页、笔记、动态、搜索、五个工具、星空、404；覆盖 375/768/1440px、深浅主题、英文 UI、键盘和减少动态效果。

- [ ] **Step 2: 最终命令**

Run:

```bash
cd site
bundle exec jekyll build --source . --destination _site
node --test assets/js/text-segmenter.test.js assets/js/tools.test.js
cd ../app
npm test -- --run
npm run lint
```

Expected: Jekyll、静态工具测试、旧应用保留回归测试和 lint 全部 PASS。

- [ ] **Step 3: 独立审查与报告**

由独立 reviewer 检查工作区、规格、构建产物与上述边界。最终报告列出测试数量、实际 Jekyll 构建结果、浏览器范围和未执行的 GitHub 创建/推送/Pages/DNS 操作；不得将本地完成描述成线上已发布。
