# Task 002: 完善 Backlinks 反向链接组件

## 前提
Task 001 必须已完成（`app/src/services/linkParser.ts` 中已有 `getBacklinks()` 函数）

## 修改文件
- `app/src/components/Backlinks.tsx`（修改此文件）

## 禁止修改
- 不要改其他任何文件
- 不要改 Navbar.tsx、Footer.tsx、任何 pages/ 下的文件
- 不要改 index.css、tailwind.config.js

## 实现要求

在 `app/src/components/Backlinks.tsx` 中实现以下组件：

```tsx
import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';

interface BacklinksProps {
  currentSlug: string;
  backlinks: { slug: string; title: string }[];
  forwardLinks: { slug: string; title: string }[];
}

export default function Backlinks({ currentSlug, backlinks, forwardLinks }: BacklinksProps) {
  if (backlinks.length === 0 && forwardLinks.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-Sand dark:border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <ArrowLeftRight size={18} className="text-Amber" />
        <h3 className="font-display text-xl font-medium text-Ink dark:text-white">
          Linked Notes
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 反向链接：哪些文章提到本文 */}
        {backlinks.length > 0 && (
          <div>
            <h4 className="font-ui text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-Slate dark:text-white/60 mb-3">
              Linked to this note
            </h4>
            <ul className="space-y-2">
              {backlinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    to={`/blog/${link.slug}`}
                    className="text-Ink hover:text-Amber dark:text-white dark:hover:text-Amber transition-colors duration-200 text-[0.9375rem] border-b border-transparent hover:border-Amber"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 正向链接：本文提到了哪些文章 */}
        {forwardLinks.length > 0 && (
          <div>
            <h4 className="font-ui text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-Slate dark:text-white/60 mb-3">
            This note links to
            </h4>
            <ul className="space-y-2">
              {forwardLinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    to={`/blog/${link.slug}`}
                    className="text-Ink hover:text-Amber dark:text-white dark:hover:text-Amber transition-colors duration-200 text-[0.9375rem] border-b border-transparent hover:border-Amber"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

以上是完整参考代码，请直接写入文件。

## 完成后
1. 在 `app/.trae/results/task-002-done.md` 写一句总结
2. 更新 `app/.trae/tasks/STATUS.md`：task-002 状态改为 ✅完成
3. git commit 并 push
