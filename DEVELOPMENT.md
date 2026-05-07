# 开发日志

本文档记录项目的开发历史、已知问题和解决方案，用于在不同 AI 助手（Kimi Code、Claude Code 等）之间同步项目信息。

## 项目概述

个人博客名片网站，支持 Obsidian 笔记浏览和内部链接导航。

**技术栈**:
- React 19 + TypeScript
- Vite 7.2.4
- Tailwind CSS 3.4.19
- shadcn/ui
- React Router v7
- Markdown 渲染：react-markdown + remark/rehype

**服务**:
- 前端：http://localhost:3000
- Obsidian Server：http://localhost:2667

## 最近解决的问题

### 2026-05-07: Obsidian 笔记内链接跳转功能

**问题描述**:
- 点击笔记中的链接会打开新页面，而不是在当前页面内跳转到对应笔记
- 链接格式多样：`[[标题]]`、`[标题](文件名.md)`、`[标题](文件名)`
- 中文标题的链接无法正确匹配

**根本原因**:
1. Obsidian vault 使用标准 Markdown 链接格式而非 Obsidian wikilink
2. `slugifyWikilink` 函数会删除所有中文字符
3. URL 编码的链接（如 `Slutsky%E5%AE%9A%E7%90%86`）无法匹配
4. 链接被渲染为普通 `<a>` 标签而非可拦截的元素

**解决方案**:

1. **修复 `slugifyWikilink` 函数** (`app/src/components/MarkdownRenderer.tsx:144-150`)
   ```typescript
   function slugifyWikilink(title: string): string {
     return title
       .trim()
       .replace(/\s+/g, '-')
       .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')  // 保留中文字符
       .substring(0, 60)
   }
   ```

2. **处理三种链接格式** (`app/src/components/MarkdownRenderer.tsx:470-560`)
   - `obsidian-internal://` 协议（wikilink 转换后）
   - `.md` 后缀的链接
   - 无后缀的相对链接（需 URL 解码）

3. **添加事件监听器** (`app/src/pages/ObsidianBrowser.tsx:237-252`)
   - 通过事件委托捕获 `.obsidian-wikilink` 类的点击
   - 使用文本内容匹配笔记 slug

4. **添加样式支持** (`app/src/index.css:133-164`)
   - `.obsidian-wikilink` - 可点击的内部链接
   - `.obsidian-wikilink-unresolved` - 未发布的笔记

**关键代码位置**:
- `app/src/components/MarkdownRenderer.tsx` - Markdown 渲染和链接处理
- `app/src/pages/ObsidianBrowser.tsx` - 笔记浏览器和事件处理
- `app/src/index.css` - wikilink 样式

**测试方法**:
1. 启动服务：`npm run dev` (前端) + `npm run dev` (obsidian-server)
2. 访问 http://localhost:3000/obsidian
3. 点击笔记中的链接，应在同一页面内跳转

**相关 Commit**: `8a564c5` - feat: 支持 Obsidian 笔记内链接点击跳转

### 2026-05-07: Kimi Code 完成的功能

**1. 笔记搜索框** (`app/src/pages/ObsidianBrowser.tsx`)
- 在侧边栏 Vault 目录下方添加实时搜索框
- 支持按标题、分类、标签、摘要过滤笔记
- 搜索结果列表点击直接打开笔记

**2. 侧边栏滚动固定** (`app/src/pages/ObsidianBrowser.tsx`)
- 添加 `sticky top-24 self-start`，长笔记滚动时侧边栏固定在左侧
- 处理了 `AnimatePresence` + `overflow-hidden` 对 `sticky` 定位的干扰（把 `motion.aside` 改为 `motion.div`，`overflow-hidden` 移到内部 wrapper）
- **教训**: 设置 `sticky`/`fixed` 时必须预留顶部导航栏高度，避免被遮住

**3. `$$$$` 数学公式修复** (`app/src/components/MarkdownRenderer.tsx`)
- 预处理：`content.replace(/\$\$\$\$/g, '$$\n\n$$')`，把 Obsidian 的 `$$$$` 拆分为两个独立行间公式
- KaTeX 宽容模式：`[rehypeKatex, { throwOnError: false, strict: false }]`，防止无效 LaTeX 崩页面
- 非数学内容检测：若 `$$...$$` 内没有 `\` 命令（如 `$$证明$$`），去掉 `$$` 当普通文本

**4. Callout `[!NOTE]` 部分修复** (`app/src/components/MarkdownRenderer.tsx`)
- `Blockquote` 正则从 `/^\[(\w+)\]/` 改为 `/^\[!(\w+)\]/`，匹配 Obsidian 的 `[!NOTE]` 语法
- **仍有问题**: Callout 卡片样式已生效，但标题中仍带 `[!NOTE]` 前缀未去除 → **交给 Claude 继续处理**

## 已知问题

- `[!NOTE]` Callout 标题中仍显示 `[!NOTE]` 前缀，需继续修复

## 待办事项

- [x] 添加笔记搜索功能
- [ ] 优化移动端体验
- [ ] 添加笔记标签过滤
- [ ] 修复 Callout `[!NOTE]` 前缀显示问题

## 开发环境配置

### 前端
```bash
cd app
npm install
npm run dev  # http://localhost:3000
```

### Obsidian Server
```bash
cd obsidian-server
npm install
npm run dev  # http://localhost:2667
```

**环境变量** (obsidian-server):
- `OBSIDIAN_VAULT_PATH`: Obsidian vault 路径（默认：`/Users/a123456/Library/Mobile Documents/com~apple~CloudDocs/Obsidian Vault`）
- `PORT`: 服务器端口（默认：2667）
- `CORS_ORIGIN`: CORS 允许的源（默认：http://localhost:3000）

## 注意事项

1. **CORS 配置**: 前端端口变化时需同步更新 `obsidian-server/config.ts` 中的 `corsOrigin`
2. **中文支持**: slug 生成函数必须保留中文字符（`一-龥` 或 `一-龥`）
3. **URL 编码**: 处理链接时需要 `decodeURIComponent()` 解码
4. **HMR 问题**: 修改 `MarkdownRenderer.tsx` 时可能需要手动刷新页面

## AI 助手协作建议

- **更新此文档**: 每次解决重要问题或添加新功能后，请更新此文档
- **提交到 Git**: 确保文档变更被提交到 GitHub
- **查阅历史**: 遇到问题时先查看此文档的解决方案
- **记录决策**: 重要的技术决策和权衡应记录在此

### 2026-05-07: Kimi Code 尝试修复 Wikilink 跳转（未果，Claude 最终解决）

**尝试过程** (Kimi Code):
1. **方案一**: `obsidian://` 自定义协议 + `contentRef` 事件委托拦截 → 浏览器将其视为外部协议，`e.preventDefault()` 无法完全阻止
2. **方案二**: HashRouter `<Link to="/obsidian?note=slug">` → `react-markdown` 自定义组件内的 `<Link>` 无法可靠拦截点击，仍被浏览器当作外部链接打开
3. **方案三**: `rehype-raw` + HTML `<span data-obsidian-slug>` + 事件委托 → 思路方向正确，但未发现根本原因是 `slugifyWikilink` 删除中文字符 + 笔记中使用的是标准 Markdown 链接 `[标题](文件名.md)` 而非仅 `[[wikilink]]`

**教训**:
- ❌ 不要仅凭代码逻辑猜测，**必须使用浏览器开发者工具** (F12 → Elements/Console/Network) 查看实际渲染的 DOM、href 值和事件行为
- ❌ 不要假设链接格式只有一种，Obsidian 笔记中可能混用 `[[标题]]`、`[标题](文件名.md)`、`[标题](文件名)` 三种格式
- ✅ Claude 使用开发者工具发现实际渲染的 `<a href>` 值与预期不符，从而定位到 slug 生成函数和链接格式问题

**最终方案**: 见上文 `8a564c5` (Claude Code 实现)

---

*最后更新: 2026-05-07*  
*更新者: Claude Sonnet 4.6 / Kimi Code*
