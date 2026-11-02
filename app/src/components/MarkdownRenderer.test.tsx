import { render, screen } from '@testing-library/react'
import MarkdownRenderer from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders GFM tables and LaTeX with accessible headings', () => {
    const { container } = render(
      <MarkdownRenderer content={'## 中文标题\n\n$E=mc^2$\n\n| A | B |\n| - | - |\n| 1 | 2 |'} />,
    )

    expect(screen.getByRole('heading', { name: '中文标题' }).id).toBe('中文标题')
    expect(container.querySelector('.katex')).not.toBeNull()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('distinguishes inline code from an unlabeled fenced block', () => {
    render(<MarkdownRenderer content={'这是 `code` 文字\n\n```\nplain block\n```'} />)
    const inline = screen.getByText('code')

    expect(inline.closest('p')).not.toBeNull()
    expect(inline.closest('.group')).toBeNull()
    expect(screen.getByText('plain block').closest('.group')).not.toBeNull()
  })
})
