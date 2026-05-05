# Task 003: BlogPost 页面集成 Backlinks 组件

## 前提
Task 001 和 Task 002 必须已完成

## 修改文件
- `app/src/pages/BlogPost.tsx`（修改此文件，只加不删）

## 禁止修改
- 不要改任何其他文件
- 不要改 index.css、tailwind.config.js
- 不要删除 BlogPost.tsx 中的任何现有代码

## 需要添加的内容

### 1. 文件顶部新增 import（加在现有 import 之后）

```typescript
import Backlinks from '@/components/Backlinks';
import posts from '@/data/posts';
import { buildLinkGraph, getBacklinks, getForwardLinks } from '@/services/linkParser';
```

### 2. 在 BlogPost 组件函数体顶部（`const { post, ... }` 之后）新增

```typescript
const linkGraph = useMemo(() => buildLinkGraph(posts), []);
const postBacklinks = useMemo(() => getBacklinks(post.slug, linkGraph), [post.slug, linkGraph]);
const postForwardLinks = useMemo(() => getForwardLinks(post.slug, linkGraph), [post.slug, linkGraph]);
```

### 3. 在文章内容 `</article>` 标签之前（即 `</section>` 之前）添加

```tsx
<Backlinks
  currentSlug={post.slug}
  backlinks={postBacklinks}
  forwardLinks={postForwardLinks}
/>
```

## 参考位置

找到 BlogPost.tsx 中渲染文章内容的 `<section>` 或 `<article>` 闭合标签（`</article>`），在它上方插入 Backlinks 组件。

需要确认 BlogPost.tsx 开头已有 `useMemo` 的 import（检查是否从 react 导入）。如果没有，把 `useMemo` 加到 react 的 import 中：
```typescript
import { useState, useEffect, useRef, useMemo } from 'react';
```

## 完成后
1. 在 `app/.trae/results/task-003-done.md` 写一句总结
2. 更新 `app/.trae/tasks/STATUS.md`：task-003 状态改为 ✅完成
3. git commit 并 push
