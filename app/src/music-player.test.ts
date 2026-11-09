import { afterEach } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

it('opens the music dialog and controls the playlist and volume', async () => {
  document.body.innerHTML = `
    <button id="music-open">♪</button>
    <audio id="music-audio"></audio>
    <dialog id="music-dialog">
      <h2 id="music-title"></h2><p id="music-artist"></p><img id="music-cover" alt="">
      <button id="music-play">▶</button><button id="music-previous">←</button><button id="music-next">→</button>
      <input id="music-progress" type="range"><input id="music-volume" type="range">
      <span id="music-current"></span><span id="music-duration"></span><ol id="music-playlist"></ol>
    </dialog>
  `
  const audio = document.getElementById('music-audio') as HTMLAudioElement
  const dialog = document.getElementById('music-dialog') as HTMLDialogElement
  vi.spyOn(audio, 'load').mockImplementation(() => {})
  vi.spyOn(audio, 'play').mockResolvedValue()
  vi.spyOn(audio, 'pause').mockImplementation(() => {})
  dialog.showModal = vi.fn()
  dialog.close = vi.fn()

  await import('../../site/assets/js/music-player.js?dialog-controls')
  expect(document.querySelectorAll('#music-playlist button')).toHaveLength(3)
  expect(audio.muted).toBe(true)

  document.getElementById('music-open')!.click()
  expect(dialog.showModal).toHaveBeenCalledOnce()
  document.getElementById('music-next')!.click()
  expect(document.getElementById('music-title')).toHaveTextContent('信件')
  expect(audio.src).toContain('/assets/starry/secret-music.mp3')

  Object.defineProperty(audio, 'paused', { configurable: true, value: false })
  audio.dispatchEvent(new Event('play'))
  expect(document.getElementById('music-open')).toHaveClass('is-playing')
  const volume = document.getElementById('music-volume') as HTMLInputElement
  volume.value = '0.2'
  volume.dispatchEvent(new Event('input'))
  expect(audio.volume).toBe(0.2)
})
