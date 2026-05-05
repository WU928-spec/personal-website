# Task 005: ObsidianBrowser vault 侧边栏折叠 + 触控板滚动

## 修改文件
- `app/src/pages/ObsidianBrowser.tsx`（只改此文件）

## 禁止修改
- 不要改任何其他文件
- 不要改 index.css、tailwind.config.js
- 不要改 Navbar.tsx、MarkdownRenderer.tsx
- 不要删除任何现有功能（Hero、Main Content、TreeItem 等）

## 背景
当前 Obsidian 浏览器页面左侧有一个 vault 目录树侧边栏（`aside lg:w-64`），使用 `flex` 布局。需改为像 Obsidian 一样的可折叠面板。

## 实现要求

### 1. 添加折叠/展开状态
```typescript
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
```

### 2. 改造侧边栏布局（参考以下结构）

**折叠按钮**（始终显示在左侧边栏右边线位置）：
- 在侧边栏右边线放置一个折叠按钮（`ChevronLeft`/`ChevronRight` 图标）
- 展开时显示 `<` ，点击后侧边栏向左滑出，按钮变为 `>`
- 按钮样式：w-6 h-16，圆角右侧，带边框和背景模糊

**展开状态**：
- 侧边栏在左侧占 `w-60` 宽度
- 内层目录树使用 `overflow-y-auto overscroll-contain` 支持触控板滚动（滚动只作用于目录，不滚动页面）
- 顶部有一个 drag handle（标题栏）带 vault 名称

**折叠状态**：
- 侧边栏缩小为只显示折叠按钮（展开用）
- 按钮固定在左侧，显示 `>` 图标
- 悬停显示 tooltip "展开导航"

### 3. 触控板滚动
目录树容器使用：
```
overflow-y-auto overscroll-contain
```
当鼠标在侧边栏范围内时，触控板上下滚动只滚动目录内容，不滚动外层页面。

### 4. dark 模式
所有文本、边框、背景都要有对应的 dark 样式。

### 5. 完整参考代码

请将以下内容替换掉 ObsidianBrowser.tsx 中 `Main Content` 部分的侧边栏和布局（从 `{/* ── Main Content ── */}` 开始到 `</section>` 结束）：

需要修改的部分是第 291-384 行的 Main Content section（`<section className="max-w-7xl...">` 部分）。

具体来说，将原有的：
```tsx
<section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
  <div className="flex flex-col lg:flex-row gap-8">
    <aside className="lg:w-64 shrink-0">
      ...
    </aside>
    <main className="flex-1 min-w-0">
      ...
    </main>
  </div>
</section>
```

改为：

```tsx
<section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 relative">
  <div className="flex gap-0">
    {/* Sidebar */}
    <div className="relative shrink-0">
      {/* Expanded sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <div className="w-[240px] bg-Linen/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-Sand dark:border-white/10">
                <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-Slate dark:text-white/60">
                  {t('obsidian.vault')}
                </h3>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-Slate hover:text-Ink dark:text-white/60 dark:hover:text-white transition-colors"
                  aria-label="收起侧边栏"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
              {/* Tree content */}
              <div className="p-3 max-h-[calc(100dvh-200px)] overflow-y-auto overscroll-contain">
                {tree.length === 0 ? (
                  <p className="text-[0.8125rem] text-Slate px-2">{t('obsidian.emptyVault')}</p>
                ) : (
                  <>
                    {tree.filter(i => i.type === 'folder').map(item => (
                      <TreeItem key={item.path} item={item} onSelect={handleSelectNote} selectedSlug={selectedSlug} />
                    ))}
                    {tree.some(i => i.type === 'file') && (
                      <RootFilesGroup
                        files={tree.filter(i => i.type === 'file')}
                        onSelect={handleSelectNote}
                        selectedSlug={selectedSlug}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed toggle button */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="flex items-center justify-center w-7 h-16 rounded-r-lg bg-Linen/90 backdrop-blur-sm border border-l-0 border-Sand dark:bg-white/10 dark:border-white/15 text-Ink hover:text-Amber dark:text-white dark:hover:text-Amber transition-colors duration-300 shadow-sm"
          title="展开导航"
          aria-label="展开侧边栏"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>

    {/* Main Content */}
    <main className="flex-1 min-w-0 lg:pl-8">
      {/* 保持原有 main 内容不变 */}
      ...原有内容...
    </main>
  </div>
</section>
```

请在 `import` 部分添加 `PanelsLeftBottom` 删除，改为：
```typescript
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder, FileText, ChevronRight, ChevronDown,
  RefreshCw, Eye, ChevronLeft,
} from 'lucide-react'
```

## 完成后
1. 在 `app/.trae/results/task-005-done.md` 写一句总结
2. 更新 `app/.trae/tasks/STATUS.md`：task-005 状态改为 ✅完成
3. git commit 并 push
4. 输出消息中说明做了什么改动
