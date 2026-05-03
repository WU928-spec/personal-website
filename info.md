# 用户需求摘要

## 核心目标
构建一个个人博客名片网站，作为个人数字名片。

## 必备功能
1. **个人名片主页** — 自我介绍、头像、社交链接、联系方式
2. **博客系统** — 支持 Markdown 笔记上传，拥有超链接功能
3. **Obsidian 接入** — 本地 Obsidian Vault 的笔记可以上传到网站，支持 Obsidian 双链语法 `[[Note Title]]`
4. **GitHub 集成** — 接入 GitHub，展示个人项目进度，让别人能实时知道项目动态

## 技术/工具约束
- **主力模型**: Kimi（K2.5 / Kimi Code CLI）
- **攻坚模型**: Claude Opus 4.6（困难问题）
- **可用工具**: VS Code + Kimi 全家桶 + OpenClaw + Claude Code
- **开发方式**: Vibe Coding（多 Agent 协作）
- **版本控制**: Git 保存每个工作进度
- **模型资源**: 几乎市面上全部模型可用

## 设计偏好暗示
- 作为技术/知识工作者的个人名片
- 需要能展示专业能力和项目成果
- 内容密度应该较高（博客文章、项目列表）
- 风格应该现代、专业但不呆板

## 页面结构建议（供 Designer 参考）
- **Home** — 个人名片主页：头像、简介、技能标签、社交链接、最新动态
- **Blog** — 博客列表：文章卡片、标签过滤、搜索
- **Blog Post** — 博客详情：Markdown 渲染、目录导航、前后文章导航
- **Projects** — GitHub 项目展示：Pinned Repos、贡献图表、语言统计
- **About** — 关于页：详细个人经历、联系方式

## 特殊技术需求
- Markdown 解析器需要支持:
  - GitHub Flavored Markdown (GFM)
  - 代码高亮
  - Obsidian wikilink `[[Note Title|Display Text]]`
  - Frontmatter 元数据解析
  - 目录 (TOC) 自动生成
- GitHub API 集成:
  - 公开仓库列表
  - Pinned repositories (GraphQL)
  - 贡献热力图
  - 用户基本信息
