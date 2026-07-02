# className 替换参考表

## 字号替换

| 旧写法 | 新写法 | 语义 | 示例场景 |
|-------|-------|------|---------|
| `text-xs` | `text-label` | 标签、按钮、导航、分类 | 导航链接、按钮文字、标签徽章 |
| `text-sm` | `text-caption` | 小字说明、时间戳、辅助 | 时间戳、描述文字、小提示 |
| `text-[0.75rem]` | `text-label` | 同 text-xs | 同 text-xs |
| `text-[0.875rem]` | `text-caption` | 同 text-sm | 同 text-sm |
| `text-[1rem]` | `text-body` | 正文 | 段落文字、卡片描述 |
| `text-[1.125rem]` | `text-subhead` | 副标题 | 区块引导语、卡片标题 |
| `text-[1.25rem]` | `text-subhead` 或 `text-heading` | 看上下文 | 小标题或副标题 |
| `text-[1.5rem]` | `text-heading` | 页面标题 | 页面主标题、区块标题 |
| `text-[2rem]` | `text-heading` | 大标题 | 大标题、区块标题 |
| `text-[2.5rem]` | `text-display` | 超大标题 | 主视觉标题、Hero 标题 |
| `text-[3rem]` | `text-display` | 主视觉标题 | Hero 大标题、品牌名 |
| `text-lg` | `text-subhead` | 副标题 | 同 text-subhead |
| `text-xl` | `text-heading` | 标题 | 同 text-heading |
| `text-2xl` | `text-heading` | 大标题 | 同 text-heading |
| `text-3xl` | `text-display` | 超大标题 | 同 text-display |
| `text-4xl` | `text-display` | 主视觉 | 同 text-display |

## 间距替换

| 旧写法 | 新写法 | 像素值 | 说明 |
|-------|-------|-------|------|
| `gap-3` | `gap-4` | 16px | 列表项间距 |
| `p-3` | `p-4` | 16px | 卡片内边距 |
| `px-3` | `px-4` | 16px | 水平内边距 |
| `py-3` | `py-2` | 8px | 垂直内边距（对齐倍数） |
| `mb-3` | `mb-4` | 16px | 底部外边距 |
| `mt-3` | `mt-4` | 16px | 顶部外边距 |
| `space-y-3` | `space-y-4` | 16px | 列表垂直间距 |
| `pb-20` | `pb-16` | 64px | 接近 8 倍数 |
| `pt-20` | `pt-16` | 64px | 接近 8 倍数 |
| `mb-5` | `mb-4` 或 `mb-6` | 16px/24px | 看上下文 |
| `mt-5` | `mt-4` 或 `mt-6` | 16px/24px | 看上下文 |

## 颜色替换

| 旧写法 | 新写法 | 说明 |
|-------|-------|------|
| `text-[rgba(...)]` | `text-primary` | 主文字 |
| `text-[rgba(...)]` | `text-muted` | 次要文字 |
| `text-[rgba(...)]` | `text-card-foreground` | 卡片内文字 |
| `bg-[rgba(...)]` | `bg-card` | 卡片背景 |
| `bg-[rgba(...)]` | `bg-background` | 页面背景 |
| `border-[rgba(...)]` | `border-border` | 边框 |
| `text-[#...]` | `text-primary` | 主文字（暗色自动适配） |
| `bg-[#...]` | `bg-card` | 卡片背景 |

## 装饰效果删除

| 旧写法 | 操作 | 说明 |
|-------|------|------|
| `backdrop-blur-sm` | 删除 | 除非必要（如弹窗背景） |
| `backdrop-blur` | 删除 | 同上 |
| `shadow-[0_0_...]` | 删除 | 自定义 glow 效果 |
| `hover:shadow-[0_0_...]` | 删除 | hover glow |
| `blur` | 删除 | 模糊装饰 |

## 圆角替换

| 旧写法 | 新写法 | 说明 |
|-------|-------|------|
| `rounded-full` | `rounded-lg` (8px) | 按钮、头像改为 8px |
| `rounded-full` | `rounded-md` (6px) | 小元素改为 6px |
| `rounded-2xl` | `rounded-lg` (8px) | 卡片圆角统一 8px |
| `rounded-[4px]` | `rounded` (4px) | 小元素 4px |
| `rounded-xl` | `rounded-lg` (8px) | 统一为 8px |

## 特殊替换（保留）

| 写法 | 保留原因 |
|------|---------|
| `uppercase tracking-wider` | 标签大写风格，但要配合 `text-label` |
| `font-medium` | 字重，保留 |
| `font-semibold` | 字重，保留 |
| `font-display` | 自定义字体，保留 |
| `line-clamp-2` | 行数限制，保留 |
| `animate-pulse` | 状态指示，保留 |
| `transition-colors` | 颜色过渡，保留 |
| `hover:opacity-90` | 透明度变化，保留 |
