# Task 001: 实现 linkParser 构建链接关系图

## 修改文件
- `app/src/services/linkParser.ts`（修改此文件）

## 禁止修改
- 不要改其他任何文件
- 不要创建新文件
- 不要在代码里 import React 或任何组件

## 背景
项目已有基础 wikilink 解析（在 MarkdownRenderer.tsx 的 `preprocessWikilinks()` 中），但缺少扫描所有文章构建链接关系图的功能。现有 `app/src/services/linkParser.ts` 文件内容可能不完整，请直接重写。

## 数据结构

`app/src/data/posts.ts` 中导出了 `Post` 接口和 `default` 导出的 posts 数组：

```typescript
export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime: string;
  content: string;
}
```

## 实现要求

在 `app/src/services/linkParser.ts` 中实现以下导出：

```typescript
import { Post } from '@/data/posts';

export interface LinkGraph {
  forwardLinks: Map<string, string[]>;   // slug -> 它链接到的所有 slug
  backlinks: Map<string, string[]>;      // slug -> 所有链接到它的 slug
  titles: Map<string, string>;           // slug -> 文章标题
}

// 把 "Slow Programming" 这种 wikilink 标题转为 slug
function slugifyWikilink(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

// 从文章内容中提取所有 [[wikilink]] 目标
function extractWikilinks(content: string): string[] {
  const links: string[] = [];
  // 匹配 [[Title]] 和 [[Title|Display]]
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const slug = slugifyWikilink(match[1].trim());
    if (slug) links.push(slug);
  }
  return links;
}

// 核心函数：遍历所有 posts，构建完整链接关系图
export function buildLinkGraph(posts: Post[]): LinkGraph {
  const forwardLinks = new Map<string, string[]>();
  const backlinks = new Map<string, string[]>();
  const titles = new Map<string, string>();

  for (const post of posts) {
    titles.set(post.slug, post.title);
    backlinks.set(post.slug, []);
    const links = extractWikilinks(post.content);
    forwardLinks.set(post.slug, links);
  }

  // 构建反向链接
  for (const [sourceSlug, targetSlugs] of forwardLinks) {
    for (const targetSlug of targetSlugs) {
      const existing = backlinks.get(targetSlug);
      if (existing && !existing.includes(sourceSlug)) {
        existing.push(sourceSlug);
      }
    }
  }

  return { forwardLinks, backlinks, titles };
}

// 获取某篇文章的反向链接（哪些文章链接到它）
export function getBacklinks(slug: string, graph: LinkGraph): { slug: string; title: string }[] {
  const slugs = graph.backlinks.get(slug) || [];
  return slugs.map(s => ({
    slug: s,
    title: graph.titles.get(s) || s
  }));
}

// 获取某篇文章的正向链接（它链接到哪些文章）
export function getForwardLinks(slug: string, graph: LinkGraph): { slug: string; title: string }[] {
  const slugs = graph.forwardLinks.get(slug) || [];
  return slugs.map(s => ({
    slug: s,
    title: graph.titles.get(s) || s
  }));
}
```

以上代码是完整参考实现，请直接写入文件。

## 完成后
1. 在 `app/.trae/results/task-001-done.md` 写一句总结
2. 更新 `app/.trae/tasks/STATUS.md`：task-001 状态改为 ✅完成
3. git commit 并 push
