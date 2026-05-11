# 项目开发记录

## 项目概述

个人网站 vibecoding，技术栈：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router v7。

当前主要功能模块：
- 首页（Home）
- 博客/记忆碎片（Moments）
- 笔记浏览（Obsidian）
- **日历任务管理（Calendar）**
- **项目追踪（Projects）**

---

## 最近已完成的工作

### 5. 日历与项目系统代码重构（2026-05-11）
- **拆分 `Projects.tsx`**：从 1058 行拆分为 8 个独立组件（`ProjectCard`、`ProjectDetail`、`ProjectBarChart` 等），页面组件降至 244 行
- **拆分 `projectStorage.ts`**：按单一职责拆为 `projectStorage.ts`（CRUD）、`projectAggregation.ts`（统计聚合）、`projectSeed.ts`（Demo 数据）
- **提取共享 Hooks**：`useLiveTick`（6 组件复用）、`useProjectStats`（自动刷新项目统计）
- **新建 `calendarStorage.ts`**：统一日历条目的读写与常用 helper（`formatDateStr`、`formatDuration`、`getTotalDuration` 等）
- **清理重复类型定义**：所有日历相关类型统一从 `@/types/calendar` 导入
- **修复所有非测试类 TypeScript 错误**：`npm run build` 零报错
- **子项目默认查看全部历史**：展开子项目卡片时直接展示完整柱状图与任务列表
- **删除废弃文件**：`TodayTaskPanel.tsx`

### 0. 项目追踪柱状图 Tooltip 优化（2026-05-11）
- 优化柱状图 hover 显示效果
- 修复柱子形状问题（圆角过大）
- 修复 tooltip 定位问题（显示在错误位置）
- 修复 tooltip 文字颜色问题（深色模式下看不见）
- 最终方案：去掉背景框，直接显示纯文字
- Tooltip 内容：时长（加粗）+ 占比百分比
- 文字颜色自适应：浅色模式 `text-Ink`，深色模式 `dark:text-white`

### 1. 日历任务管理系统（Calendar）
- 7×6 月历网格，支持农历/节假日显示
- 每日任务（Todo）与日记（Diary）统一管理
- 任务计时器：支持开始/停止，互斥追踪
- 数据存储在 `localStorage`（`calendar_entries`）
- 左右侧边栏：今日统计 + 今日待办

### 2. 项目追踪系统（Projects）
- 替代原有的 About 页面，路径 `/projects`
- **手风琴式展开/收起**的项目卡片
- 每个项目显示：投入时间、目标进度条、完成率
- **智能最近 N 天**：默认至少显示 7 天，若最近 7 天内任务数 < 5 则自动扩展天数直到覆盖 5 条任务
- **全部历史弹窗**：独立弹窗展示完整柱状图 + 完整任务列表
- 项目状态：进行中（active）/ 已完成（completed）
- 预设 8 色色板用于项目标签

### 3. 日历 ↔ 项目关联
- `TodoItem` 新增可选字段 `projectId`
- 日历中添加/编辑任务时可下拉选择归属项目（仅显示 active 项目）
- 已完成的项目从下拉框中消失
- 日历格子底部显示项目颜色圆点标记
- 今日待办列表显示项目颜色小圆点

### 4. Demo 数据
- 首次访问自动 seed 4 个示例项目 + 14 天虚假任务数据
- 不覆盖用户已有的真实日历数据

---

## 开发中遇到的问题

### 问题 5：柱状图 Tooltip 显示问题（2026-05-11）
**现象**：
1. 柱子形状异常（顶部圆角过大，`rounded-t-sm` 导致）
2. Tooltip 显示在错误位置（图表顶部而非柱子上方）
3. Tooltip 文字看不见（深色模式下白底白字）

**根本原因**：
- Tooltip 相对于固定高度的外层容器定位，而不是相对于动态高度的柱子本身
- 原代码：`dark:bg-white text-white dark:text-Ink` 导致深色模式下白色背景 + 深色文字

**修复过程**：
1. 调整柱子圆角：`rounded-t-sm` → `rounded-t`
2. 调整容器布局：使用 `flex items-end` 确保柱子从底部对齐
3. 重新设计 tooltip 定位：将 `group` 和 `relative` 直接放在柱子 div 上，tooltip 作为柱子的直接子元素
4. 修复文字颜色：统一使用 `text-Ink dark:text-white`
5. 简化设计：去掉背景框，直接显示纯文字
6. 优化内容：移除日期，只显示时长和占比

**最终方案**：
```tsx
<div className="group w-full rounded-t transition-all duration-500 relative" style={{...}}>
  {hasData && (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap text-Ink dark:text-white text-[0.625rem]">
      <div className="text-[0.6875rem] font-medium">
        {formatDuration(d.seconds)}
      </div>
      <div className="text-[0.6875rem]">
        占比: {((d.seconds / totalSeconds) * 100).toFixed(1)}%
      </div>
    </div>
  )}
</div>
```

### 问题 1：AnimatePresence 嵌套 Fragment
`ProjectHistoryModal` 内部使用了 `<AnimatePresence>` 包裹 `<>`（Fragment），Framer Motion 无法通过 `React.Children` 识别 Fragment 子元素，导致动画异常。外层 `Projects` 组件也错误地用 `<AnimatePresence>` 包裹了 `ProjectHistoryModal`。

**修复**：移除外层 `AnimatePresence`，`ProjectHistoryModal` 内部改为条件返回（`if (!isOpen) return null`），直接返回 `motion.div` 数组。

### 问题 2：useState 类型推断过窄
`PROJECT_COLORS` 使用了 `as const`，导致 `useState(PROJECT_COLORS[0].value)` 被推断为字面量类型 `"#C9A84C"`，无法赋值其他颜色值。

**修复**：显式声明类型 `useState<string>(PROJECT_COLORS[0].value)`。

### 问题 3：Tooltip 定位与 hover 区域
柱状图 tooltip 的 `group` 类放在外层容器（固定 48px 高）上，导致：
- hover 区域是整个容器而非柱子本身
- tooltip 显示在容器顶部，矮柱子上方出现大面积空白
- 后来修复时中间层 div 忘记加 `h-full`，导致柱子百分比高度（如 `3%`）相对于 `0` 计算，柱子完全消失

**修复**：将 `group` 和 tooltip 移入柱子内部，中间层 div 加 `h-full` 保证百分比高度有参考。

### 问题 4：TypeScript 严格模式差异
`npm run dev`（Vite + esbuild）不阻塞 TypeScript 错误，但 `npm run build`（`tsc -b`）启用了 `noUnusedLocals` 等严格检查，导致构建失败。项目中存在大量未使用的变量/导入。

**状态**：✅ 已全部清理（2026-05-11）。`npm run build` 零报错。

---

## 待达成的目标

1. ~~**柱状图 hover tooltip**~~：✅ 已完成（2026-05-11）
2. ~~**构建错误清理**~~：✅ 已完成（2026-05-11）
3. ~~**代码重构（拆分大文件、提取 Hooks、统一类型）**~~：✅ 已完成（2026-05-11）
4. **项目页整体视觉打磨**：当前布局偏朴素，可考虑更精致的数据可视化
5. **响应式优化**：弹窗在小屏幕上的适配
6. **数据导出/备份**：项目 + 日历数据的导入导出功能

---

## 技术债务

- ~~日历相关类型（`DayEntry`、`TodoItem`、`TimeRecord`）散落在多个组件文件中~~：✅ 已统一从 `@/types/calendar` 导入
- ~~`TodayTaskPanel.tsx`（已标记 DEPRECATED）~~：✅ 已删除
- `calendar_entries` 的存储没有版本控制，未来模型变更需考虑迁移
