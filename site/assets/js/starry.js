export const PRELOAD_ASSETS = [
  'bg-music.mp3',
  'epilogue-music.m4a',
  'secret-music.mp3',
  'starry-bg.jpg',
  'starry-images/1-0.jpg',
  'starry-images/1-1.jpg',
  'starry-video.mp4',
  'letter-bg.jpg',
  'golden-glasses.png',
  'next-video.mp4',
]

export function withTimeout(promise, milliseconds) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, milliseconds))])
}

function loadAsset(path) {
  return new Promise((resolve) => {
    const url = `/assets/starry/${path}`
    const extension = path.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension || '')) {
      const image = new Image()
      const finish = () => resolve(image)
      image.onload = () => {
        if (typeof image.decode === 'function') image.decode().then(finish).catch(finish)
        else finish()
      }
      image.onerror = finish
      image.src = url
      return
    }
    const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension || '')
    const media = isAudio ? new Audio() : document.createElement('video')
    media.preload = 'auto'
    media.muted = true
    media.src = url
    const finish = () => resolve(media)
    media.oncanplaythrough = finish
    media.onloadedmetadata = finish
    media.onerror = finish
    media.onstalled = finish
    media.load()
  })
}

async function prepareStarry() {
  const overlay = document.getElementById('starry-preloader')
  if (!overlay) return
  const percent = document.getElementById('preload-percent')
  const bar = document.getElementById('preload-bar')
  let loaded = 0
  const update = () => {
    loaded += 1
    const value = Math.min(100, Math.round(loaded / PRELOAD_ASSETS.length * 100))
    if (percent) percent.textContent = `${value}%`
    if (bar) bar.style.width = `${value}%`
  }
  const load = (path) => withTimeout(loadAsset(path), 15000).catch(() => {}).then(update)
  const critical = PRELOAD_ASSETS.filter((path) => !/\.(mp3|m4a|wav|ogg|aac|flac)$/.test(path))
  const optional = PRELOAD_ASSETS.filter((path) => !critical.includes(path))
  Promise.all(optional.map(load))
  await Promise.all([
    Promise.all(critical.map(load)),
    new Promise((resolve) => setTimeout(resolve, 800)),
  ])
  overlay.classList.add('is-done')
  setTimeout(() => overlay.remove(), 500)
}

export function brightProgress(memoirs, clickedIds) {
  const clicked = new Set(clickedIds)
  const bright = memoirs.filter((memoir) => memoir.brightness >= 1)
  const remaining = bright.filter((memoir) => !clicked.has(memoir.id)).map((memoir) => memoir.id)
  return { remaining, complete: bright.length > 0 && remaining.length === 0 }
}

export function nextLetterPage(page, total) {
  return Math.min(Math.max(0, page + 1), Math.max(0, total - 1))
}

const readStorage = (key) => {
  try { return localStorage.getItem(key) } catch { return null }
}
const writeStorage = (key, value) => {
  try { localStorage.setItem(key, value) } catch {}
}
const readClicked = () => {
  try {
    const value = JSON.parse(readStorage('starry-bright-clicked') || '[]')
    return new Set(Array.isArray(value) ? value : [])
  } catch { return new Set() }
}

function initializeStars() {
  const stars = Array.from(document.querySelectorAll('.memory-star'))
  if (stars.length === 0) return
  const clicked = readClicked()
  const progress = document.getElementById('starfield-progress')
  const secretLink = document.getElementById('secret-entry') || document.getElementById('secret-link')
  let redirected = false

  for (const star of stars) {
    if (!star.style.getPropertyValue('--star-x')) {
      const seed = star.dataset.memoirId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
      const random = (offset) => {
        const value = Math.sin((seed + offset) * 127.1) * 43758.5453
        return value - Math.floor(value)
      }
      star.style.setProperty('--star-x', `${8 + random(1) * 82}%`)
      star.style.setProperty('--star-y', `${16 + random(2) * 68}%`)
    }
    star.addEventListener('click', () => {
      clicked.add(star.dataset.memoirId)
      writeStorage('starry-bright-clicked', JSON.stringify([...clicked]))
    })
  }

  const update = () => {
    const memoirs = stars.map((star) => ({ id: star.dataset.memoirId, brightness: star.classList.contains('is-bright') ? 1 : 0 }))
    const state = brightProgress(memoirs, [...clicked])
    const completed = readStorage('starry-completed') === 'true' || readStorage('wuspace-starry-complete') === 'true'
    if (progress) progress.textContent = state.complete ? '所有亮星已点亮' : `还有 ${state.remaining.length} 颗最亮的星等待点亮`
    if (secretLink) secretLink.hidden = !completed
    if (state.complete && !completed && !redirected) {
      redirected = true
      setTimeout(() => { window.location.href = '/starry/secret/' }, 1000)
    }
  }
  update()

  const overlay = document.getElementById('star-trail-overlay')
  const video = document.getElementById('star-trail-video')
  const showVideo = () => {
    if (!overlay || !video) return
    overlay.hidden = false
    video.currentTime = 0
    video.play().catch(() => {})
  }
  document.getElementById('play-star-trail')?.addEventListener('click', showVideo)
  document.getElementById('star-trail-close')?.addEventListener('click', () => {
    video?.pause()
    if (overlay) overlay.hidden = true
  })
  video?.addEventListener('ended', () => { window.location.href = '/starry/epilogue/' })
  if (new URLSearchParams(window.location.search).get('play') === '1') showVideo()
}

function initializeLetter() {
  const pages = Array.from(document.querySelectorAll('[data-letter-page]'))
  if (pages.length === 0) return
  const count = document.getElementById('letter-count')
  const previous = document.getElementById('letter-prev')
  const next = document.getElementById('letter-next')
  let current = 0
  const render = () => {
    pages.forEach((page, index) => { page.hidden = index !== current })
    if (count) count.textContent = `${current + 1} / ${pages.length}`
    if (previous) previous.disabled = current === 0
    if (next) next.setAttribute('aria-label', current === pages.length - 1 ? '点亮星空' : '下一页')
  }
  const goNext = () => {
    if (current === pages.length - 1) window.location.href = '/starry/?play=1'
    else {
      current = nextLetterPage(current, pages.length)
      render()
    }
  }
  previous?.addEventListener('click', () => {
    current = Math.max(0, current - 1)
    render()
  })
  next?.addEventListener('click', goNext)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goNext()
    if (event.key === 'ArrowLeft') {
      current = Math.max(0, current - 1)
      render()
    }
  })
  render()
}

function initializeMemoir() {
  const canvas = document.getElementById('nebula-field')
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (!context) return
  let width = window.innerWidth
  let height = window.innerHeight
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.5 + 0.1,
  }))
  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }
  resize()
  window.addEventListener('resize', resize)
  const draw = () => {
    context.fillStyle = '#080810'
    context.fillRect(0, 0, width, height)
    for (let index = 0; index < 5; index += 1) {
      const x = width * (0.2 + index * 0.15)
      const y = height * (0.3 + (index % 3) * 0.2)
      const gradient = context.createRadialGradient(x, y, 0, x, y, 200)
      gradient.addColorStop(0, `rgba(60, 40, 90, ${0.08 + index * 0.02})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
    }
    for (const particle of particles) {
      particle.x = (particle.x + particle.vx + width) % width
      particle.y = (particle.y + particle.vy + height) % height
      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(180, 170, 220, ${particle.alpha})`
      context.fill()
    }
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw()
  else {
    const animate = () => {
      draw()
      if (!document.hidden) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(animate) })
  }

  const overlay = document.getElementById('memoir-video-overlay')
  const video = document.getElementById('memoir-video')
  document.getElementById('memoir-next')?.addEventListener('click', () => {
    if (overlay) overlay.hidden = false
    video?.play().catch(() => {})
  })
  document.getElementById('memoir-video-close')?.addEventListener('click', () => {
    video?.pause()
    if (overlay) overlay.hidden = true
  })

  const glasses = document.getElementById('golden-glasses')
  if (!glasses) return
  let position = { x: 0, y: 0, scale: 1 }
  try { position = { ...position, ...JSON.parse(readStorage('starry-glasses-position') || '{}') } } catch {}
  const render = () => {
    glasses.style.transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale}) rotate(-6deg)`
    writeStorage('starry-glasses-position', JSON.stringify(position))
  }
  render()
  let drag = null
  glasses.addEventListener('pointerdown', (event) => {
    drag = { x: event.clientX, y: event.clientY, startX: position.x, startY: position.y }
    glasses.setPointerCapture(event.pointerId)
  })
  glasses.addEventListener('pointermove', (event) => {
    if (!drag) return
    position.x = drag.startX + event.clientX - drag.x
    position.y = drag.startY + event.clientY - drag.y
    render()
  })
  glasses.addEventListener('pointerup', () => { drag = null })
  glasses.addEventListener('wheel', (event) => {
    event.preventDefault()
    position.scale = Math.max(0.3, Math.min(2.5, position.scale + (event.deltaY > 0 ? -0.05 : 0.05)))
    render()
  }, { passive: false })
  glasses.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') position.scale = Math.min(2.5, position.scale + 0.05)
    else if (event.key === '-') position.scale = Math.max(0.3, position.scale - 0.05)
    else return
    event.preventDefault()
    render()
  })
}

function initializeEpilogue() {
  writeStorage('starry-completed', 'true')
  writeStorage('wuspace-starry-complete', 'true')
  const progress = document.getElementById('epilogue-progress')
  const update = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight
    if (progress) progress.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 1})`
  }
  window.addEventListener('scroll', update, { passive: true })
  update()
  const sections = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach((section) => section.classList.add('is-visible'))
    return
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  }, { rootMargin: '0px 0px -60px' })
  sections.forEach((section) => observer.observe(section))
}

function initializeStarryPage() {
  const page = document.body?.dataset.starryPage || 'home'
  if (page === 'home') initializeStars()
  if (page === 'secret') initializeLetter()
  if (page === 'memoir') initializeMemoir()
  if (page === 'epilogue') initializeEpilogue()

  const audio = document.getElementById('starry-audio')
  const musicToggle = document.getElementById('music-toggle')
  musicToggle?.addEventListener('click', () => {
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  })
  const startMusic = (event) => {
    if (!audio || !audio.paused || event.target.closest?.('#music-toggle')) return
    audio.play().catch(() => {})
  }
  window.addEventListener('pointerdown', startMusic, { once: true })
  window.addEventListener('keydown', startMusic, { once: true })
  audio?.addEventListener('play', () => {
    musicToggle?.setAttribute('aria-pressed', 'true')
    musicToggle?.setAttribute('aria-label', '暂停音乐')
  })
  audio?.addEventListener('pause', () => {
    musicToggle?.setAttribute('aria-pressed', 'false')
    musicToggle?.setAttribute('aria-label', '播放音乐')
  })
}

if (typeof document !== 'undefined') {
  if (document.getElementById('starry-preloader')) {
    prepareStarry().then(initializeStarryPage).catch(initializeStarryPage)
  } else {
    initializeStarryPage()
  }
}
