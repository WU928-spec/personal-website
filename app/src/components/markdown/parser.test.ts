import { parseFrontmatter, extractToc, preprocessWikilinks } from './parser'

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
    const content = 'Just body text'
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({})
    expect(result.body).toBe('Just body text')
  })
})

describe('extractToc', () => {
  it('should extract h2 and h3 headings', () => {
    const content = `# Title
## Section 1
Some text
### Subsection A
## Section 2
### Subsection B with **bold**
#### Should be ignored`
    const toc = extractToc(content)
    expect(toc).toHaveLength(4)
    expect(toc[0]).toEqual({ level: 2, text: 'Section 1', id: 'section-1' })
    expect(toc[1]).toEqual({ level: 3, text: 'Subsection A', id: 'subsection-a' })
    expect(toc[2]).toEqual({ level: 2, text: 'Section 2', id: 'section-2' })
    expect(toc[3]).toEqual({ level: 3, text: 'Subsection B with bold', id: 'subsection-b-with-bold' })
  })

  it('should return empty array for no headings', () => {
    expect(extractToc('No headings here')).toEqual([])
  })
})

describe('preprocessWikilinks', () => {
  it('should convert [[Title]] to markdown link', () => {
    const result = preprocessWikilinks('See [[Hello World]]', ['Hello-World'])
    expect(result).toBe('See [Hello World](/obsidian?note=Hello-World)')
  })

  it('should convert [[Title|Display]] to markdown link with display text', () => {
    const result = preprocessWikilinks('See [[Hello World|HW]]', ['Hello-World'])
    expect(result).toBe('See [HW](/obsidian?note=Hello-World)')
  })

  it('should mark unresolved wikilinks', () => {
    const result = preprocessWikilinks('See [[Missing]]', [])
    expect(result).toBe(
      'See <span class="obsidian-wikilink-unresolved" title="Note not yet published">Missing</span>'
    )
  })

  it('should handle internal heading links', () => {
    const result = preprocessWikilinks('Jump to [[#Section Name]]', [])
    expect(result).toBe('Jump to [Section Name](#section-name)')
  })

  it('should strip non-Latex $$ wrappers', () => {
    const result = preprocessWikilinks('$$plain text$$', [])
    expect(result).toBe('plain text')
  })

  it('should preserve LaTeX $$ blocks', () => {
    const result = preprocessWikilinks('$$\\frac{1}{2}$$', [])
    expect(result).toBe('$$\\frac{1}{2}$$')
  })
})
