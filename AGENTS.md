# AGENTS.md — Jekyll + Obsidian 个人生活博客

> 处理项目代码前请先完整阅读。

## 当前架构

主站已迁移为 `site/` 下的 **Jekyll 静态网站**。内容通过 Obsidian 中的 Markdown 维护，GitHub Actions 构建并部署 GitHub Pages。现有域名是 `https://www.wuspace.top`，不得改成默认 GitHub 域名。

视觉方向是简洁的个人生活小站：暖纸白、墨黑、酒红、中文衬线标题和真实文章流。首页首屏使用圆形头像，文案直接，不使用过度修饰的介绍。

核心页面：首页（含真实 GitHub 贡献热力图）、Now 当前状态页、笔记、微博式 Markdown 动态信息流、五个静态工具、搜索和隐藏星空。点赞、评论、在线编辑器与网站后台不再存在。

首页、动态、文章和小工具通过 `site/assets/js/navigation.js` 无刷新替换正文，音乐播放器在这些跳转中保持存活；星空与静态资源仍整页打开。播放器默认静音且不自动播放。

## 内容模型

- `_notes/`：文章笔记，支持 `title/date/written_date/category/tags/description/slug/published`。栏目包括诗歌、散文、随笔、小说、数学、计算机&金融、日记；缺失或未知分类进入未归档。
- `_moments/`：生活动态与网站维护日志，支持 `title/date/display_time/images/location/tags/published`。所有动态按 `date` 倒序统一显示；`display_time` 使用精确到分钟的本地时间文本，避免构建时区改变显示。维护更新每条单独发布，使用 `tags: [网站维护日志]`，标签显示在正文下方，不另设栏目。
- `_memoirs/`：星空短文，支持 `title/date/published`。
- `now.md`：单页当前状态、进行中项目与近期计划，正文用 Markdown 维护；`_plugins/now_updated.rb` 在构建时读取最近一次 Git 提交时间，`updated` 仅作回退。
- `published: false` 是草稿，不得生成页面或进入列表、搜索。
- 图片放在 `site/assets/media/`，使用仓库相对路径。
- 不提交 `.env`、密钥、私人笔记或不愿公开的图片。

## 构建与测试

```bash
cd app
npm ci
npm run build:tools

cd ../site
node scripts/update-github-contributions.mjs
bundle install
bundle exec jekyll build --source . --destination _site
bundle exec jekyll serve --source . --destination _site
node --test assets/js/*.test.js
```

Jekyll 使用 4.4 系列；本地与 Actions 均使用 Ruby 3.3。生成目录和项目内依赖已被 `.gitignore` 排除。

当前系统 Ruby 环境存在原生依赖问题。交付前必须实际执行 Jekyll 构建，不得只检查源文件存在。

## 代码约定

- 内容页面使用 Liquid 模板、语义 HTML 和共享 CSS；交互使用无框架浏览器 JavaScript。
- 五个旧版小工具复用 `app/src/` 中的 React 组件，经 `app/vite.tools.config.ts` 构建为纯静态资源；不得接入 Supabase、数据库或在线后台。
- Markdown 使用 kramdown/GFM，Rouge 构建时高亮，KaTeX 前端渲染；`_plugins/wikilinks.rb` 在构建时处理文章和独立页面的 `[[双链]]` 与反向链接，代码区域不转换。
- 目录必须读取最终标题 id，不另写一套不兼容的 slug 规则。
- 工具纯函数使用 Node 内置测试，浏览器 DOM 绑定必须在 Node 中可安全导入。
- 图片保留 alt 和固定画幅；主题、语言和交互支持键盘与减少动态效果。
- 新增功能先写失败测试，再实现，再运行完整构建和测试。

## 部署边界

- `.github/workflows/pages.yml` 先用 Node 22 构建旧版小工具、刷新真实 GitHub 贡献数据并运行站点脚本测试，再使用官方 Pages actions 构建 `site/_site`。
- `site/CNAME` 固定为 `www.wuspace.top`。
- 不自动创建仓库、推送、部署、修改 DNS 或执行其他远程写操作。
- 远程启用需要用户确认仓库、Pages 来源、自定义域名、DNS 和 HTTPS。

## 旧应用与数据

`app/` 主要保留作历史与回退参照，仅旧版小工具的独立入口参与新站构建。不要删除或重置它。

旧 Supabase、localStorage 和云端数据不读取、不迁移、不删除。历史 React 设计文档描述的是迁移前架构，不代表当前主站。

## 参考文档

- `docs/superpowers/specs/2026-11-02-jekyll-obsidian-migration-design.md` — 当前迁移设计
- `docs/superpowers/plans/2026-11-02-jekyll-obsidian-migration.md` — 当前迁移计划
- `site/README.md` — Obsidian 写作与发布流程
- `DEVELOPMENT.md` — 历史开发日志

*最后更新：2026-11-09*
