---
name: webapp-aesthetic-coder
description: 网站搭建全栈改进 Skill — 集审美规划、设计系统审计、代码审查、前端可访问性、用户体验优化、自动化重构于一体。专为 React + Tailwind + shadcn/ui 技术栈的个人网站设计。
version: 1.0.0
tags: [webapp, aesthetic, frontend, refactoring, design-system, audit]
---

# webapp-aesthetic-coder — 网站搭建全栈改进 Skill

> **专为你的项目打造**：React 19 + TypeScript + Tailwind CSS + shadcn/ui + Vite + HashRouter
> 覆盖设计、代码、体验、可访问性四个维度，每次改进都有标准流程、可验证。

---

## 核心理念

1. **先审计，再修改** — 不凭感觉改，有清单、有扫描、有报告
2. **设计系统即法律** — 项目级 `tailwind.config.js` 的字号/间距/颜色定义就是全局规范，违反必须修复
3. **用户视角第一** — 每次修改都要问自己：站在真实用户面前，这个界面好在哪里？差在哪里？
4. **只改 className，不动逻辑** — 除非明确要求新功能，否则只调整样式和结构，不改数据流、状态、路由

---

## 能力矩阵

| 能力 | 触发条件 | 产出 |
|------|---------|------|
| **审美规划** | 用户说"好看点"、"改风格"、"设计优化" | 设计方向选择报告 + 执行计划 |
| **设计系统审计** | 用户说"统一风格"、"检查哪些页面没改" | 全站扫描报告 + 违规文件列表 |
| **代码审查** | 用户说"检查这个文件"、"有 bug 吗" | 审查报告 + 修复建议 |
| **UX 体验审计** | 用户说"用户体验不好"、"哪里有问题" | 用户视角检查清单 + 问题列表 |
| **前端可访问性** | 用户说"a11y"、"无障碍"、"键盘导航" | WCAG 2.1 AA 检查报告 |
| **自动化重构** | 用户说"批量改"、"全站统一" | 批量 className 替换 + 构建验证 |

---

## 流程一：审美规划（Aesthetic Planning）

当用户说"好看点"、"改风格"、"设计优化"时，执行此流程。

### 1.1 读取设计系统

**必须读取以下文件**（按优先级）：

```bash
# 项目级设计系统定义
cat app/tailwind.config.js
# 项目级全局样式
cat app/src/index.css
# 项目级 AGENTS.md（了解项目架构和约束）
cat AGENTS.md
# 项目级 DEVELOPMENT.md（了解历史改动）
cat DEVELOPMENT.md
```

### 1.2 风格探索（3 个方向）

基于项目当前的技术栈和用户画像，提供 **3 个差异化方向**（不是“亮色/暗色/蓝色”）：

| 方向 | 视觉特征 | 适合场景 | 技术实现要点 |
|------|---------|---------|------------|
| **A. 杂志编辑** | 高对比字号、充裕留白、8pt 网格、去装饰 | 个人博客、作品集、知识型 | 大字号差异、宽行距、减少边框阴影 |
| **B. 粗野温暖** | 大地色系、有机材质、不规则排版 | 生活方式、创意工作者 | 暖色渐变、手写体、不对称网格 |
| **C. 复古天文** | 深空蓝、星图纹理、衬线标题 | 极客、科幻、知识型 | 深色模式主导、复古字体、数据可视化 |

**每个方向必须给出**：
- 3 个视觉参考（知名网站或设计作品）
- 1 个 Tailwind 颜色/字号配置建议
- 1 个具体页面的 className 修改示例

### 1.3 设计评审（5 维标准）

用户选定方向后，按此标准评审：

1. **清晰度（Clarity）** — 信息层级是否一眼可辨？标题/副标题/正文的大小差异是否足够？
2. **结构（Structure）** — 布局是否按 8px 网格？留白是否充裕但不浪费？
3. **材质（Texture）** — 是否过度使用 blur/glow/shadow？是否有真实的视觉层次？
4. **节奏（Rhythm）** — 重复的组件之间是否有视觉呼吸？间距是否一致？
5. **一致性（Consistency）** — 同级别的组件是否使用相同的字号/间距/颜色？

每个维度打分（1-5），总分 < 20 需要调整方向。

### 1.4 执行约束

- 只改 `className`，不改函数逻辑、状态、路由
- 改完后必须 `npx tsc --noEmit -p tsconfig.app.json && npm run build`
- 改完提交前写清楚 commit message，说明改动范围和原因

---

## 流程二：设计系统审计（Design System Audit）

当用户说"统一风格"、"检查哪些页面没改"、"全站一致性"时，执行此流程。

### 2.1 自动扫描脚本

使用 `grep` 扫描全站文件，找出违反设计系统的 className：

```bash
# 在项目根目录执行
# 字号违规
rg 'text-\[(0\.7|0\.75|0\.875|1|1\.125|1\.25|1\.5|2|2\.5|3)rem\]' app/src --type tsx
# 间距违规（p-3, px-3, py-3, gap-3, mb-3, mt-3, space-y-3）
rg '[^a-zA-Z](p-3|px-3|py-3|gap-3|mb-3|mt-3|space-y-3)[^a-zA-Z]' app/src --type tsx
# 硬编码颜色（rgba, # 开头）
rg 'text-\[rgba|bg-\[rgba|border-\[rgba|text-\[#' app/src --type tsx
# 装饰性效果（blur, glow, shadow）
rg 'backdrop-blur|shadow-\[0_0|hover:shadow-\[0_0' app/src --type tsx
# 圆角违规
rg 'rounded-full|rounded-2xl|rounded-\[4px' app/src --type tsx
# 未使用 design system 字号（直接写 text-xs, text-sm, text-lg, text-xl, text-2xl）
rg 'text-xs[^-]|text-sm[^-]|text-lg[^-]|text-xl[^-]|text-2xl[^-]' app/src --type tsx
```

### 2.2 审计报告格式

对扫描结果生成报告：

```markdown
## 设计系统审计报告

### 违规统计
| 违规类型 | 文件数 | 影响组件 |
|---------|-------|---------|
| 字号硬编码 | 12 | ... |
| 间距非8倍数 | 8 | ... |
| 硬编码颜色 | 5 | ... |
| 装饰性效果 | 3 | ... |

### 建议修复顺序
1. 先改 `pages/` 级文件（用户最先看到）
2. 再改 `components/` 下的公共组件（影响最大）
3. 最后改 `components/ui/` 和独立子组件

### 豁免名单
- 星空彩蛋（Starry*）— 用户明确保留
- 第三方库（不可改）
```

### 2.3 修复规则

**字号阶梯替换表**：

| 旧写法 | 新写法 | 语义 |
|-------|-------|------|
| `text-xs` | `text-label` | 标签、按钮、导航 |
| `text-sm` | `text-caption` | 小字说明、时间戳 |
| `text-[0.75rem]` | `text-label` | 同 text-xs |
| `text-[0.875rem]` | `text-caption` | 同 text-sm |
| `text-[1rem]` | `text-body` | 正文 |
| `text-[1.125rem]` | `text-subhead` | 副标题 |
| `text-[1.25rem]` | `text-subhead` 或 `text-heading` | 看上下文 |
| `text-[1.5rem]` | `text-heading` | 页面标题 |
| `text-[2rem]` | `text-heading` | 大标题 |
| `text-[2.5rem]` | `text-display` | 超大标题 |
| `text-[3rem]` | `text-display` | 主视觉标题 |
| `text-lg` | `text-subhead` | 副标题 |
| `text-xl` / `text-2xl` | `text-heading` | 标题级别 |
| `text-3xl` / `text-4xl` | `text-display` | 主视觉级别 |

**间距替换表**：

| 旧写法 | 新写法 | 说明 |
|-------|-------|------|
| `gap-3` | `gap-4` | 16px |
| `p-3` | `p-4` | 16px padding |
| `px-3` | `px-4` | 16px 水平 padding |
| `py-3` | `py-2` | 8px 垂直 padding（对齐倍数） |
| `mb-3` / `mt-3` | `mb-4` / `mt-4` | 16px |
| `space-y-3` | `space-y-4` | 16px 列表间距 |
| `pb-20` / `pt-20` | `pb-16` / `pt-16` | 64px（接近 8 倍数） |

**颜色替换规则**：
- 硬编码 `rgba(...)` / `#...` → `text-primary`, `text-muted`, `text-card-foreground`, `bg-card`, `border-border`, `bg-background`
- 删除 `hover:shadow-[0_0_...]` 等 glow 效果
- 删除 `backdrop-blur`（除非必要）

**圆角替换**：
- `rounded-full` → `rounded-lg`（8px）或 `rounded-md`（6px）
- `rounded-2xl` → `rounded-lg`（8px）
- `rounded-[4px]` → `rounded`（4px）
- 卡片保持 `rounded-lg`（8px）
- 按钮用 `rounded-md`（6px）或 `rounded-lg`（8px）

---

## 流程三：代码审查（Code Review）

当用户说"检查这个文件"、"有 bug 吗"时，执行此流程。

### 3.1 静态分析检查项

按此清单逐条检查目标文件：

1. **TypeScript 严格模式**：是否违反 `noUnusedLocals` / `noUnusedParameters` / `verbatimModuleSyntax`？
2. **导入检查**：是否有未使用的 import？是否有 `import` 和 `import type` 混淆？
3. **类型安全**：是否有显式 `any`？Zod schema 是否覆盖外部 API？
4. **组件规范**：是否超过 350 行？是否使用了 `React.memo` / `LazyImage`？
5. **样式一致性**：className 是否遵循设计系统？是否有硬编码颜色？
6. **错误边界**：是否包裹在 `ErrorBoundary` 内？
7. **工具页面标准**：是否使用了 `<BackToTools />`？（路由在 `/tools` 下的子页面必须）

### 3.2 审查输出格式

```markdown
## 代码审查报告：pages/MovieRecommender.tsx

### 问题（按优先级）
| # | 类型 | 位置 | 描述 | 建议修复 |
|---|------|------|------|---------|
| 1 | 🔴 Bug | L123 | JSON.parse 无 try-catch | 添加 try-catch 或改用 schema 验证 |
| 2 | 🟡 Style | L45 | 使用 `text-[0.875rem]` 而非 `text-caption` | 替换为 `text-caption` |
| 3 | 🟢 建议 | L200 | 组件超过 350 行，建议拆分 | 提取子组件到独立文件 |

### 健康度
- 类型安全：✅ / ⚠️ / ❌
- 样式一致：✅ / ⚠️ / ❌
- 用户体验：✅ / ⚠️ / ❌
```

---

## 流程四：用户体验审计（UX Audit）

当用户说"用户体验不好"、"哪里有问题"、截图说明问题时，执行此流程。

### 4.1 用户视角检查清单

**通用检查项**：

| 检查项 | 通过标准 | 常见失败 |
|-------|---------|---------|
| 图片加载 | 所有图片有 alt，失败时有占位符 | 灰色方块或空白 |
| 返回导航 | 每个页面有明确的返回路径 | 缺少返回按钮，无法回到上一页 |
| 加载状态 | 异步操作有 loading 指示 | 点击后无反馈，用户不知道是否生效 |
| 错误处理 | API 失败时有明确提示 | 静默失败，用户不知道出错 |
| 空状态 | 无数据时有友好提示 | 空白页面或报错 |
| 滚动行为 | 加载新内容时不强制滚动 | 用户阅读时被打断 |
| 焦点管理 | 弹窗/模态框有焦点陷阱 | 弹窗打开后无法按 Tab 切换 |
| 键盘支持 | 所有交互可用键盘操作 | 只能鼠标点击 |

**工具页面专属检查项**：

| 检查项 | 通过标准 |
|-------|---------|
| 接入引导 | 没有 API Key 时，明确提示用户如何获取 |
| 状态指示 | 显示当前是否已接入 AI（在线/离线） |
| 清空/重置 | 有清空对话/重置状态的按钮 |
| 历史保存 | 用户数据刷新后不丢失（localStorage） |
| 快速操作 | 提供常用快捷操作（快速回复、重新生成） |
| 详情展开 | 列表项可点击展开完整详情 |

### 4.2 审计方法

1. 先看用户截图/描述，定位问题页面
2. 读取目标页面代码，按清单逐项检查
3. 站在用户视角模拟操作（点击、输入、滚动、键盘）
4. 输出问题列表，按严重程度排序
5. 每个问题给出具体修复方案（行号 + 修改内容）

---

## 流程五：前端可访问性审计（A11y Audit）

当用户说"a11y"、"无障碍"、"键盘导航"时，执行此流程。

### 5.1 shadcn/ui 可访问性检查

基于 2026 年 4 月 thefrontkit 审计数据（34/48 通过）：

**已知问题组件**（必须检查）：
- `Button` — 焦点环对比度不足（`focus-visible:ring-ring/50` → 改为 `focus-visible:ring-ring`）
- `Input` — placeholder 对比度不足（低于 4.5:1）
- `Slider` — 缺少 `step` prop
- `DatePicker` — 月份导航按钮太小（`size-7` → `size-9`）
- `Menubar` — 子菜单 `aria-expanded` 可能丢失

**检查项**：
- 焦点可见性（3:1 对比度）
- 颜色对比度（4.5:1 文字）
- 触摸目标大小（24x24px）
- 键盘导航（Tab/Enter/Space/Arrow/Esc）
- ARIA 属性正确性
- 减少动画偏好（`prefers-reduced-motion`）

### 5.2 审计输出

```markdown
## A11y 审计报告

### 问题列表
| 组件 | WCAG 准则 | 严重性 | 修复方式 |
|------|----------|-------|---------|
| Button | 2.4.7 Focus Visible | 高 | 改焦点环样式 |
| Input | 1.4.3 Contrast | 中 | 改 placeholder 颜色 |

### 检查清单
- [ ] 键盘导航完整
- [ ] 焦点指示器可见
- [ ] 颜色对比度达标
- [ ] 触摸目标 ≥ 24px
- [ ] ARIA 属性正确
- [ ] 尊重 `prefers-reduced-motion`
```

---

## 流程六：自动化重构（Automated Refactoring）

当用户说"批量改"、"全站统一"、"改所有页面"时，执行此流程。

### 6.1 批量修改策略

**不要一次改所有文件**。按以下顺序分批：

```
批次1：关键页面（pages/Home, About, Tools, NotFound）
批次2：功能页面（pages/Calendar, Projects, Moments, ObsidianBrowser, Profile, Login）
批次3：功能子组件（components/calendar/*, components/project/*, components/moment-uploader/*）
批次4：渲染组件（components/markdown/*, MarkdownRenderer, NoteTree）
批次5：shadcn/ui 组件（components/ui/*）
批次6：杂项通用组件（Layout, RepoCard, SkillTag, LazyImage, ImageGrid, BackToTools 等）
```

每批不超过 10 个文件，改完后立即 build 验证。

### 6.2 修改规则（只改 className）

- 只修改 `className` 字符串（包括 `className={\`...\`}` 模板字符串）
- 不引入新 import、不改函数逻辑、不改 state、不改变量
- shadcn/ui 组件只改内部默认 className，不改 props 传递逻辑
- 如果 className 是 `cn()` 合并，只改内部默认值

### 6.3 验证闭环

每批次修改后必须执行：

```bash
# 1. 类型检查（必须零错误）
cd app && npx tsc --noEmit -p tsconfig.app.json
# 2. 构建（必须成功）
cd app && npm run build
# 3. 检查未使用变量（如果构建通过，这一步通常也过）
```

### 6.4 提交规范

```bash
git add -A
git commit -m "refactor: 设计系统统一重构（批次 X）

- 替换字号：text-xs→text-label, text-sm→text-caption, ...
- 替换间距：gap-3→gap-4, p-3→p-4, ...
- 删除硬编码颜色：rgba→语义类
- 删除装饰效果：backdrop-blur, hover:shadow-glow
- 统一圆角：rounded-full→rounded-lg
- 涉及文件：pages/..., components/..., components/ui/..."
```

---

## 附录 A：项目专属约定

### A.1 工具页面返回按钮

所有路由在 `/tools` 下的子页面（如 `/tools/movie`）必须使用 `<BackToTools />` 组件返回工具箱，禁止自己写 `ArrowLeft + useNavigate`。

已使用的工具页面：
- `TextSegmenter` — ✅ `<BackToTools label={t('tools.title')} className="mb-6" />`
- `InternshipDecision` — ✅ `<BackToTools />`
- `MovieRecommender` — ✅ `<BackToTools />`

### A.2 星空彩蛋（Starry*）

所有 `Starry` 前缀的文件（`StarrySecret`, `StarryEasterEgg`, `StarryMemoir`, `StarryEpilogue`）是独立全屏特效页面，**不渲染 `Layout` 导航栏**，设计重构时**不修改这些文件**。

### A.3 数据持久化

| 数据 | 存储位置 | 同步策略 |
|------|---------|---------|
| 笔记（Obsidian） | Supabase `notes` 表 | 纯云端 |
| 记忆碎片（Moments） | localStorage + Supabase | 先显本地，后台同步 |
| 日历任务 | localStorage + Supabase | 先显本地，后台同步 |
| 项目列表 | localStorage + Supabase | 先显本地，后台同步 |
| 电影推荐对话 | localStorage | 仅本地 |

---

## 附录 B：设计系统参考值

### 当前项目已定义（tailwind.config.js）

```js
fontSize: {
  'display': ['clamp(3.5rem, 7vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
  'heading': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
  'subhead': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
  'body': ['1rem', { lineHeight: '1.65', letterSpacing: '0' }],
  'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
  'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
}
spacing: {
  'space-1': '4px', 'space-2': '8px', 'space-3': '16px',
  'space-4': '24px', 'space-5': '32px', 'space-6': '48px',
  'space-7': '64px', 'space-8': '96px',
}
```

### 暗色 Graphite（index.css）

```css
.dark {
  --color-graphite: 28, 26, 24; /* 中性冷灰，减少阅读疲劳 */
}
```

---

*本 Skill 基于项目实际代码和搜索结果整合，最后更新：2026-07-02*
