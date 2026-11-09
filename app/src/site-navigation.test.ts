import { afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

it('keeps the audio element alive while replacing page content', async () => {
  document.body.innerHTML = `
    <a id="go-moments" href="/moments/">动态</a>
    <main id="main-content"><h1>首页</h1></main>
    <audio id="music-audio"></audio>
  `
  const audio = document.getElementById('music-audio')
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<html><head><title>动态 — Jasper</title></head><body><main id="main-content"><h1>动态</h1></main></body></html>',
  }))

  await import('../../site/assets/js/navigation.js?persistent-audio')
  document.getElementById('go-moments')!.click()
  await vi.waitFor(() => expect(document.getElementById('main-content')).toHaveTextContent('动态'))

  expect(document.getElementById('music-audio')).toBe(audio)
  expect(window.location.pathname).toBe('/moments/')
  expect(document.title).toBe('动态 — Jasper')
})


it('remounts legacy tools without reloading the audio player', async () => {
  document.body.innerHTML = `
    <a id="go-tools" href="/tools/">小工具</a>
    <main id="main-content"><h1>首页</h1></main>
    <audio id="music-audio"></audio>
  `
  const audio = document.getElementById('music-audio')
  const mount = vi.fn()
  const unmount = vi.fn()
  Object.assign(window, { legacyToolsMount: mount, legacyToolsUnmount: unmount })
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<html><head><title>小工具</title></head><body><main id="main-content"><div id="legacy-tools-root"></div></main></body></html>',
  }))

  await import('../../site/assets/js/navigation.js?tools-mount')
  document.getElementById('go-tools')!.click()
  await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce())

  expect(unmount).toHaveBeenCalledOnce()
  expect(document.getElementById('music-audio')).toBe(audio)
  expect(window.location.pathname).toBe('/tools/')
  Reflect.deleteProperty(window, 'legacyToolsMount')
  Reflect.deleteProperty(window, 'legacyToolsUnmount')
})
