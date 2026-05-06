# Task 007: 升级碎片详情页为朋友圈/微博详情风格

## 背景
用户已重构 Blog.tsx 为"生活碎片"Feed 页（朋友圈/微博时间线），NewPost.tsx 也已重写为碎片发布页。现在需要将 BlogPost.tsx（文章详情页）也改造为匹配的风格。

## 修改文件
- `app/src/pages/BlogPost.tsx`（需要调整布局和样式，不重写）

## 禁止修改
- 不要改任何其他文件
- 不要改 MarkdownRenderer、posts.ts、index.css、tailwind.config.js
- Backlinks 相关内容保持不动

## 实现要求

### 1. 页面布局改造为碎片详情风格

参考微信朋友圈点击一条动态后的展开效果，但保留 markdown 渲染能力：

**顶部区域**：
- 去掉原来的大 Hero section（Post Hero），替换为简洁的碎片头部：
  - 头像（J 字圆形渐变） + 昵称 "Jasper" + 心情 emoji
  - 日期 + 分类标签
  - 字号缩小，整体紧凑

**正文区域**：
- MarkdownRenderer 保持不变
- 去掉 TableOfContents（侧边目录对于碎片来说太重了）

**底部区域**：
- 保留 Backlinks（反向链接）
- 保留上一篇 / 下一篇导航
- 保留相关文章推荐（Related Posts）
- 保留分享按钮

### 2. 具体改动清单

| 改动项 | 原来的 | 新的 |
|--------|--------|------|
| Post Hero | 大图+渐变+大标题 | 紧凑碎片头部（头像+昵称+emoji+时间+分类） |
| TableOfContents | 侧边栏目录 | **删除** |
| ScrollProgressBar | 阅读进度条 | 保留 |
| 返回按钮 | "返回文章列表" | 保留，文字改为"返回碎片" |
| 上一篇/下一篇 | 正常 | 保留，样式不变 |
| More from Garden | 相关文章推荐 | 保留 |
| Backlinks | 反向链接 | 保留 |

### 3. 顶部碎片头部设计参考

```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
    J
  </div>
  <div>
    <div className="flex items-center gap-2">
      <span className="font-medium text-[0.9375rem] text-Ink dark:text-white">Jasper</span>
    </div>
    <div className="flex items-center gap-2 mt-0.5 text-[0.75rem] text-Slate/70 dark:text-white/40">
      <span>{post.date}</span>
      <span>·</span>
      <span>{post.category}</span>
    </div>
  </div>
</div>
```

### 4. 内联编辑保持不变
- `isEditing` 编辑模式（textarea + save/cancel）保留在原位
- 标题编辑保留

## 完成后
1. 确保 `npm run build` 通过
2. 在 `app/.trae/results/task-007-done.md` 写一句总结
3. 更新 `.trae/tasks/STATUS.md`：task-007 状态改为 ✅ 完成
4. 不要 git commit（留给 Trae 统一 commit）
