# Task 009: 碎片详情页显示真实图片

## 背景
BlogPost.tsx 使用 MarkdownRenderer 渲染正文，图片应通过 `![alt](data:...)` 语法自动显示。用户反馈点击碎片后图片未显示，需要排查并修复。

## 文件
只改 `app/src/pages/BlogPost.tsx`

## 排查步骤

1. 读取 BlogPost.tsx，找到 MarkdownRenderer 调用处
2. 检查 `post.content` 中是否包含图片 markdown（`![](...)` 语法）
3. 确认 MarkdownRenderer 能正确渲染 data: URL 图片

## 需要确保的效果

- 碎片详情页顶部：头像 + 昵称 + 时间（已有）
- 正文渲染 Markdown，包含 LaTeX 数学公式
- **如果 content 中包含 `![...](data:image/...)` 语法的图片，必须渲染出来**
- 图片宽度自适应，圆角

## 具体操作

1. 检查 MarkdownRenderer 的 `a` 标签组件是否拦截了图片的 data: URL
2. 检查 rehypeRaw 是否正确处理 `<img>` 标签
3. 如果 content 中的图片没有 `![]()` 包裹而是直接的 data URL，需要在渲染前做预处理

## 完成后
1. `npm run build` 通过
2. 在 `.trae/results/task-009-done.md` 写一句总结
3. 更新 `.trae/tasks/STATUS.md`：task-009 → ✅ 完成
4. 不要 git commit
