# 用 Obsidian 维护这个网站

这个目录同时是 Jekyll 站点源文件和公开内容库。不需要 Supabase、网站后台或在线编辑器。

## 写一篇笔记

在 `_notes/` 新建一个 `.md` 文件：

```md
---
title: 今天值得记住的一件事
date: 2026-11-02 10:00:00 +08:00
tags: [生活]
category: 散文
published: true
---

正文照常使用 Markdown。支持表格、代码和 $E=mc^2$ 这样的 LaTeX。
```

- `title`：公开标题。
- `date`：用于排序和展示。
- `tags`：可选标签。
- `category`：可选栏目，支持诗歌、散文、随笔、小说、数学、计算机&金融、日记；留空或未知分类会进入“未归档”。
- `description`：可选的列表摘要。
- `published: false`：草稿，不生成公开页面，也不进入列表或搜索。
- `slug`：可选，覆盖默认 URL 标识。

## 双链与反向链接

文章和 Now 等独立页面中可以直接使用 Obsidian 风格链接：

```md
[[读者]]
[[读者|显示文字]]
[[读者#小节标题|跳到这一节]]
```

也可以使用带或不带日期前缀的 Markdown 文件名。只链接已公开文章；找不到目标时显示灰色文字，不暴露草稿。文章底部会自动显示来自其他公开文章的反向链接。代码块和行内代码中的 `[[...]]` 不会转换。

## 写一篇动态

在 `_moments/` 新建 `.md`：

```md
---
date: 2026-11-02 18:00:00 +08:00
display_time: "2026-11-02 18:00"
images:
  - /assets/media/my-photo.jpg
location: 可选地点
published: true
---

今天的一段生活记录。
```

`date` 用于排序和机器可读时间；`display_time` 是页面上显示的本地时间文本，精确到分钟，不受构建服务器时区影响。

图片先复制到 `assets/media/`。不要提交私人图片、密钥、`.env` 或不愿公开的笔记。

## 更新 Now 页面

直接编辑根目录的 `now.md`。正文使用 Markdown，包含最近状态、进行中的项目、近期计划和正在阅读或学习的内容；不需要所有模块每次都写满。

修改内容后同步更新 front matter 中的 `updated: YYYY-MM-DD`，这是页面上显示的最近更新时间。页面位于 `/now/`，不需要后端或在线编辑器。

## 写网站维护日志

仍在 `_moments/` 新建 Markdown，每条更新单独一篇，时间精确到分钟，并添加统一标签：

```md
---
date: 2026-11-11 13:32:00 +08:00
display_time: "2026-11-11 13:32"
tags: [网站维护日志]
published: true
---

把动态页改成了微博式单条信息流。
```

维护日志与普通动态一起按时间倒序显示，也会进入首页“最近动态”。正文下方显示 `#网站维护日志`，不需要标题、栏目或多条更新汇总。

星空短文放在 `_memoirs/`，同样支持 `published` 开关。

## 本地预览

需要可用的 Ruby 和项目内依赖。构建前可用 Node 刷新真实 GitHub 贡献数据；网络不可用时保留仓库内已有的静态数据：

```bash
cd site
node scripts/update-github-contributions.mjs
bundle install
bundle exec jekyll serve --source . --destination _site
```

然后打开终端显示的本地地址。构建只生成静态文件：

```bash
bundle exec jekyll build --source . --destination _site
node --test assets/js/*.test.js
```

## 自动发布

1. 在 Obsidian 中安装并启用社区插件 **Obsidian Git**。
2. 让这个目录可以访问你的 Git 仓库。
3. 在 Obsidian Git 中启用自动 commit 和 push，例如每 10 分钟。
4. 正常写字、保存，插件推送后，GitHub Actions 会构建并发布。

首次线上启用还需要：

- 远程仓库和默认分支已经存在。
- GitHub Pages 的构建来源选择 **GitHub Actions**。
- 自定义域名保留为 `www.wuspace.top`；本仓库的 `CNAME` 已写入该值。
- 域名 DNS 已按 GitHub Pages 官方文档配置，并启用 HTTPS。

这些远程步骤不由本地工具自动执行。
