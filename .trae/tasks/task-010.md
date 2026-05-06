# Task 010: 修复碎片详情页图片不显示

## 根因找到了
MarkdownRenderer 的 `img` 自定义组件（第534行）对 `data:image/jpeg;base64,...` URL 调用 `src.split('.').pop()` 提取扩展名，可能误判为音频/视频格式，导致图片被渲染为 `<audio>` 或 `<video>`。

## 修复方案
在 MarkdownRenderer 的 img 组件中，**对 `data:` 开头的 URL 直接渲染 `<img>`，跳过扩展名检测**。

文件：`app/src/components/MarkdownRenderer.tsx`，约第 534-535 行

改为：
```tsx
img: ({ src, alt }) => {
  // data: URLs are always images, skip extension check
  if (src?.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg shadow-soft w-full"
        loading="lazy"
      />
    )
  }
  const ext = src?.split('.').pop()?.toLowerCase() || ''
  // ... 原有音频/视频检测不变
```

## 完成后
1. `npm run build` 通过
2. 在 `.trae/results/task-010-done.md` 写总结
3. 更新 `.trae/tasks/STATUS.md`：task-010 → ✅ 完成
4. 不要 git commit
