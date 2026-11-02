import { act, render } from '@testing-library/react'
import CodeBlock, { highlightCode } from './CodeBlock'
import { getHighlighter } from './theme'

vi.mock('./theme', () => ({ getHighlighter: vi.fn() }))
const mocked = vi.mocked(getHighlighter)

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

const highlighter = {
  codeToHtml: (code: string) => `<span>${code}</span>`,
}

beforeEach(() => mocked.mockReset())

it('ignores an older highlight result when the code changes quickly', async () => {
  const first = deferred<typeof highlighter>()
  const second = deferred<typeof highlighter>()
  mocked.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

  const { container, rerender } = render(<CodeBlock inline={false} className="language-ts">{'const old = true'}</CodeBlock>)
  rerender(<CodeBlock inline={false} className="language-ts">{'const latest = true'}</CodeBlock>)

  await act(async () => { second.resolve(highlighter); await second.promise })
  expect(container.textContent).toContain('const latest = true')

  await act(async () => { first.resolve(highlighter); await first.promise })
  expect(container.textContent).toContain('const latest = true')
  expect(container.textContent).not.toContain('const old = true')
})

it('returns an empty highlight result for an invalid highlighter response', async () => {
  mocked.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof getHighlighter>>)
  await expect(highlightCode('const fallback = true', 'ts')).resolves.toBe('')
})
