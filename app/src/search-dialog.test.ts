import { afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

it('keeps search result links stable on hover so clicks can complete', async () => {
  document.body.innerHTML = `
    <button id="search-open">搜索</button>
    <button id="search-close">关闭</button>
    <dialog id="search-dialog">
      <input id="search-input" type="search">
      <div id="search-results"></div>
    </dialog>
  `
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement
  dialog.showModal = vi.fn()
  dialog.close = vi.fn()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { title: '读者', url: '/notes/reader/', excerpt: '在不那么忙的时候，我会看些小说。', tags: [] },
      { title: '另一篇', url: '/notes/another/', excerpt: '读者也会喜欢。', tags: [] },
    ],
  }))

  await import('../../site/assets/js/search.js?hover-stability')
  document.getElementById('search-open')!.click()
  await vi.waitFor(() => expect(document.getElementById('search-results')!.textContent).toContain('输入关键词'))
  const input = document.getElementById('search-input') as HTMLInputElement
  input.value = '读者'
  input.dispatchEvent(new Event('input', { bubbles: true }))

  const firstResult = document.querySelector('.search-result')!
  firstResult.dispatchEvent(new MouseEvent('mouseenter'))

  expect(document.querySelector('.search-result')).toBe(firstResult)
})
