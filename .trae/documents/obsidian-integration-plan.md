# Obsidian 本地连接方案

## 现状分析

### 当前博客系统架构

* **存储方式**：TypeScript 数组（`posts.ts`），所有文章在构建时打包进应用

* **写作流程**：手动编辑 `posts.ts` 或通过 NewPost 页面上传 `.md` 文件

* **前端框架**：React + Vite，纯客户端应用

### 连接 Obsidian 的核心挑战

Obsidian 库以 **Markdown 文件**形式存储在本地硬盘，浏览器应用**无法直接访问**本地文件系统，这是浏览器的安全限制。

***

## 方案一：本地 Obsidian Sync Server（推荐 ⭐）

### 原理

在本地启动一个轻量 HTTP 服务器，充当浏览器与 Obsidian 库之间的桥梁。服务器读取 Obsidian vault 中的 Markdown 文件，通过 REST API 提供给前端。

### 具体步骤

Step 1：创建本地同步服务器

* 选用 **Node.js + Express** 或 **Python Flask**（更轻量）

## 服务监听 `localhost:2667`（或其他空闲端口）

* 功能：

  * `GET /api/notes` — 列出 vault 中所有 `.md` 文件的元信息（slug、title、修改时间）

  * `GET /api/notes/:slug` — 读取指定文件内容

  * `GET /api/vault/stats` — 返回 vault 统计（文件数、最近修改等）

  * `POST /api/notes` — 将文章从网站发布回 Obsidian vault（可选双向同步）
* Obsidian vault 路径通过配置文件指定，例如 `~/Documents/obsidian-vault`

#### Step 2：修改前端博客系统

* 新增 `ObsidianConnector` 服务模块（`src/services/obsidian.ts`）：

  * 配置 vault 服务器地址（默认 `http://localhost:2667`）

  * 实现 `fetchNotes()` 获取文章列表

  * 实现 `fetchNote(slug)` 获取单篇文章内容

  * 将 Obsidian 笔记的 `[[Wikilink]]` 语法通过已有的 `preprocessWikilinks()` 转换为可点击链接

* 修改 `posts.ts`：新增 `ObsidianSource` 类型，标识文章来源于 Obsidian

* 新增 Obsidian 导入页面（`/obsidian`），用户可浏览、选择、导入 vault 中的文章

#### Step 3：文件监听自动同步（可选增强）

* 服务器使用 `chokidar` 监听 vault 目录

* 当 Obsidian 中新建/修改文章时，通过 WebSocket 通知前端刷新

* 实现真正意义的"在 Obsidian 写作，网站实时预览"

#### Step 4：发布流程

* 用户在 Obsidian 写作 → 服务器读取 → 网站展示

* 如需公开发布，文章 frontmatter 添加 `published: true` 标记

### 优点

* 不需要修改 Obsidian 本身（纯读取引用）

* 架构简单，服务器代码不超过 200 行

* 支持完整的 Obsidian 特性（wikilinks、callouts、插件数据等）

### 缺点

* 需要本地启动服务（但可以打包成开机自启的简单 app）

* 只能同步纯本地 vault（不适用纯移动端 Obsidian）

### 关键文件变更

| 文件                                    | 变更                   |
| ------------------------------------- | -------------------- |
| `obsidian-server/` (new)              | 本地 Node.js 服务器       |
| `src/services/obsidian.ts` (new)      | 前端 Obsidian 连接器      |
| `src/pages/ObsidianBrowser.tsx` (new) | Obsidian 笔记浏览导入页面    |
| `src/data/posts.ts`                   | 新增 `ObsidianNote` 类型 |
| `Navbar.tsx`                          | 新增 Obsidian 导航入口     |

***

## 方案二：Obsidian Community Plugin + 简单 API

### 原理

利用 Obsidian 的 [Community Plugins](https://publish.obsidian.md/plugins) 系统，编写一个插件将笔记通过 HTTP POST 推送到网站的 API 端点（需要为网站添加后端）。

### 实现方式

1. 编写 Obsidian 插件，注册 `onEditorChange` 钩子，检测文章修改后自动 POST 到 `localhost:3000/api/sync`
2. 为网站添加 Express 后端（与方案一的服务器合并），接收推送并更新 posts 数据
3. 前端轮询或通过 WebSocket 接收更新

### 缺点

* 需要同时维护插件和后端

* 复杂度更高

* 需要理解 Obsidian 插件开发

### 推荐度

不推荐，除非有双向实时同步的强烈需求。

***

## 方案三：手动导入（最简单）

### 原理

不做自动化连接。用户通过 NewPost 页面的拖拽上传功能，直接将 Obsidian 的 `.md` 文件拖入网站发布。

### 增强点

* 改进 NewPost 页面，支持拖入文件夹批量导入

* 添加 `importFromObsidian()` 快捷按钮（提示用户从 Obsidian 复制文件路径）

### 缺点

* 不是真正的"连接"

* 需要每次手动导入

***

## 最终推荐

**推荐方案一（本地 Obsidian Sync Server）**，理由：

1. 实现真正的"Obsidian 写作，网站实时预览"
2. 复杂度适中，代码量可控
3. 不破坏现有架构，渐进式集成
4. 保留所有 Obsidian 特性（wikilinks、callouts 完全兼容）

是否需要我开始实现方案一？
