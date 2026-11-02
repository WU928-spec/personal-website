import { extractToc, parseFrontmatter, preprocessMarkdown, slugifyHeading } from './parser'

describe('parseFrontmatter', () => {
  it('should parse YAML frontmatter', () => {
    const content = `---
title: Hello World
date: 2024-01-01
tags: [a, b]
---
Body text`
    const result = parseFrontmatter(content)
    expect(result.frontmatter.title).toBe('Hello World')
    expect(result.frontmatter.date).toEqual(new Date('2024-01-01'))
    expect(result.frontmatter.tags).toEqual(['a', 'b'])
    expect(result.body.trim()).toBe('Body text')
  })

  it('should handle content without frontmatter', () => {
    const result = parseFrontmatter('Just body text')
    expect(result.frontmatter).toEqual({})
    expect(result.body).toBe('Just body text')
  })
})

describe('standard markdown', () => {
  it('preserves legal LaTeX blocks without commands and fenced code verbatim', () => {
    expect(preprocessMarkdown('$$E=mc^2$$')).toBe('$$E=mc^2$$')
    expect(preprocessMarkdown('$$x^2+y^2=z^2$$')).toBe('$$x^2+y^2=z^2$$')
    expect(preprocessMarkdown('```text\n$$plain text$$\n```')).toBe('```text\n$$plain text$$\n```')
  })

  it('creates unique Chinese heading anchors and ignores fenced code', () => {
    const source = '## 春日 记录\n```md\n## 不是标题\n```\n### 阅读 & 思考\n## 春日 记录'
    expect(slugifyHeading('春日 记录')).toBe('春日-记录')
    expect(extractToc(source)).toEqual([
      { level: 2, text: '春日 记录', id: '春日-记录' },
      { level: 3, text: '阅读 & 思考', id: '阅读--思考' },
      { level: 2, text: '春日 记录', id: '春日-记录-1' },
    ])
  })

  it('returns an empty table of contents without headings', () => {
    expect(extractToc('No headings here')).toEqual([])
  })
})
