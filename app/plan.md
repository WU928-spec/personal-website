# 重构计划 - 基于 REFACTOR-2026-05-10 经验

## 分析阶段已完成
- 3 个 explore 子代理并行诊断了项目
- 发现 15+ 个可改进点

## 阶段一：死代码清理（低风险，快速）
- 删除 `types/api.ts` 中 3 个未使用的 Zod 解析函数（`parseObsidianNotes`, `parseObsidianNote`, `parseVaultTree`）
- 删除 `utils/projectStorage.ts` 中未使用的 `getActiveProjects`
- 删除 `utils/projectAggregation.ts` 中未使用的 `getAllProjectStats`
- 清理 `hooks/useMoments.ts` 中的 8 处 console.log（按 AGENTS.md 约定，生产环境不输出日志）
- 清理 `utils/storage.ts` 中的 3 处 console.warn
- 将 `types/api.ts` 中 4 个重复的 Zod 验证函数提取为通用工厂

## 阶段二：核心组件拆分（中等风险，高价值）
- 拆分 `components/markdown/render-components.tsx` (501行) → 提取为子组件：
  - `markdown/CopyButton.tsx` (复制按钮)
  - `markdown/CodeBlock.tsx` (代码块)
  - `markdown/Callout.tsx` (Callout)
  - `markdown/Blockquote.tsx` (引用/Callout 解析)
  - `markdown/Heading.tsx` (标题折叠)
  - 保留原文件作为工厂组装函数
- 拆分 `pages/StarryEpilogue.tsx` (391行) → 提取为子组件：
  - `starry/epilogue-sections.ts` (静态数据)
  - `starry/EpilogueSection.tsx` (section 渲染)
  - `starry/FloatingParticles.tsx` (浮动粒子)
  - `starry/StarryNavBar.tsx` (底部导航)
  - 保留原文件作为页面骨架

## 阶段三：测试补充（低风险，高价值）
- 为 `hooks/useClickOutside.ts` 添加测试
- 为 `hooks/useMediaQuery.ts` 添加测试
- 为 `utils/projectStorage.ts` 添加测试（核心 CRUD 逻辑）
- 为 `utils/projectTimerStorage.ts` 添加测试

## 阶段四：性能优化（低风险，中等价值）
- 在 `App.tsx` 中给 `Login`, `Profile`, `EasterEggs`, `Tools` 添加 React.lazy
- 给 `StarryEasterEgg`, `StarryEpilogue`, `StarryMemoir`, `StarrySecret` 添加 React.lazy
- 给 `MomentCard` 添加 React.memo
- 在 `ImageGrid` 中使用 `LazyImage` 替代原生 `<img>`

## 验证步骤
- 每个阶段执行后运行 `npm test -- --run`
- 最后运行 `npm run build` 确保类型安全
- `git commit` 合并所有改动

## 参考
- REFACTOR-2026-05-10.md: 分阶段、保持向后兼容、测试驱动
- AGENTS.md: 组件>350行必须拆分、新增Hook必须写测试
