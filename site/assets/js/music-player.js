const TRACKS = [
  { title: '星空', artist: 'Jasper', src: '/assets/starry/bg-music.mp3', cover: '/assets/starry/starry-bg.jpg' },
  { title: '信件', artist: 'Jasper', src: '/assets/starry/secret-music.mp3', cover: '/assets/starry/letter-bg.jpg' },
  { title: '尾声', artist: 'Jasper', src: '/assets/starry/epilogue-music.m4a', cover: '/assets/starry/starry-bg.jpg' },
]

const STORAGE_KEY = 'wuspace-music-state'
const PLAY_MODES = ['sequential', 'repeat', 'shuffle']

export function normalizeMusicState(value, trackCount) {
  const state = value && typeof value === 'object' ? value : {}
  const track = Number.isInteger(state.track) && state.track >= 0 && state.track < trackCount ? state.track : 0
  const time = Number.isFinite(state.time) && state.time >= 0 ? state.time : 0
  const volume = Number.isFinite(state.volume) ? Math.min(1, Math.max(0, state.volume)) : 0
  const mode = PLAY_MODES.includes(state.mode) ? state.mode : 'sequential'
  return { track, time, volume, playing: state.playing === true, mode }
}

export function nextPlayMode(mode) {
  return PLAY_MODES[(PLAY_MODES.indexOf(mode) + 1) % PLAY_MODES.length]
}

export function nextTrackIndex(current, trackCount, mode = 'sequential', random = Math.random) {
  if (trackCount <= 0) return 0
  if (mode === 'repeat') return current
  if (mode === 'shuffle' && trackCount > 1) {
    const candidate = Math.min(trackCount - 1, Math.floor(random() * trackCount))
    return candidate === current ? (current + 1) % trackCount : candidate
  }
  return (current + 1) % trackCount
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, '0')}`
}

if (typeof document !== 'undefined') {
  const audio = document.getElementById('music-audio')
  const dialog = document.getElementById('music-dialog')
  const launcher = document.getElementById('music-open')

  if (audio instanceof HTMLAudioElement && dialog instanceof HTMLDialogElement && launcher) {
    const playButton = document.getElementById('music-play')
    const progress = document.getElementById('music-progress')
    const volume = document.getElementById('music-volume')
    const playlist = document.getElementById('music-playlist')
    const modeButton = document.getElementById('music-mode')
    let stored = null
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch {}
    const state = normalizeMusicState(stored, TRACKS.length)
    let resumeWanted = state.playing
    let restoreTime = state.time
    let lastSavedTime = state.time

    const save = () => {
      state.time = Number.isFinite(audio.currentTime) ? audio.currentTime : state.time
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
    }

    const updatePlayState = () => {
      const playing = !audio.paused
      state.playing = playing
      if (playButton) {
        playButton.textContent = playing ? '❚❚' : '▶'
        playButton.setAttribute('aria-label', playing ? '暂停' : '播放')
      }
      launcher.classList.toggle('is-playing', playing)
      launcher.textContent = playing ? '♫' : '♪'
      launcher.setAttribute('aria-label', playing ? '音乐播放中，打开播放器' : '打开音乐播放器')
      save()
    }

    const updatePlaylist = () => {
      playlist?.querySelectorAll('button').forEach((button, index) => {
        button.classList.toggle('is-active', index === state.track)
        button.setAttribute('aria-current', index === state.track ? 'true' : 'false')
      })
    }

    const updateMode = () => {
      const details = {
        sequential: { label: '顺序播放', icon: '↻' },
        repeat: { label: '单曲循环', icon: '↻¹' },
        shuffle: { label: '随机播放', icon: '⤨' },
      }[state.mode]
      const label = document.getElementById('music-mode-label')
      const icon = document.getElementById('music-mode-icon')
      if (label) label.textContent = details.label
      if (icon) icon.textContent = details.icon
      modeButton?.setAttribute('aria-label', `${details.label}，点击切换播放模式`)
    }

    const play = async () => {
      try {
        await audio.play()
        resumeWanted = false
      } catch {
        state.playing = false
        updatePlayState()
      }
    }

    const loadTrack = (index, autoplay = true, startTime = 0) => {
      state.track = index
      restoreTime = startTime
      const track = TRACKS[index]
      audio.src = track.src
      audio.load()
      const cover = document.getElementById('music-cover')
      if (cover instanceof HTMLImageElement) {
        cover.src = track.cover
        cover.alt = `${track.title}封面`
      }
      const title = document.getElementById('music-title')
      const artist = document.getElementById('music-artist')
      if (title) title.textContent = track.title
      if (artist) artist.textContent = track.artist
      updatePlaylist()
      save()
      if (autoplay) void play()
    }

    TRACKS.forEach((track, index) => {
      if (!playlist) return
      const item = document.createElement('li')
      const button = document.createElement('button')
      button.type = 'button'
      button.innerHTML = '<span class="music-track-number"></span><span class="music-track-title"></span><span class="music-track-mark">♪</span>'
      button.querySelector('.music-track-number').textContent = String(index + 1).padStart(2, '0')
      button.querySelector('.music-track-title').textContent = track.title
      button.setAttribute('aria-label', `播放${track.title}`)
      button.addEventListener('click', () => loadTrack(index))
      item.append(button)
      playlist.append(item)
    })

    audio.volume = state.volume
    audio.muted = state.volume === 0
    if (volume) volume.value = String(state.volume)
    loadTrack(state.track, false, state.time)
    state.playing = resumeWanted

    audio.addEventListener('loadedmetadata', () => {
      if (restoreTime > 0) {
        audio.currentTime = Math.min(restoreTime, Number.isFinite(audio.duration) ? audio.duration : restoreTime)
        restoreTime = 0
      }
      const duration = document.getElementById('music-duration')
      if (duration) duration.textContent = formatTime(audio.duration)
      if (progress) progress.max = String(Number.isFinite(audio.duration) ? audio.duration : 0)
    })
    audio.addEventListener('timeupdate', () => {
      if (progress) progress.value = String(audio.currentTime)
      const current = document.getElementById('music-current')
      if (current) current.textContent = formatTime(audio.currentTime)
      if (Math.abs(audio.currentTime - lastSavedTime) >= 5) {
        lastSavedTime = audio.currentTime
        save()
      }
    })
    updateMode()
    audio.addEventListener('play', updatePlayState)
    audio.addEventListener('pause', updatePlayState)
    audio.addEventListener('ended', () => loadTrack(nextTrackIndex(state.track, TRACKS.length, state.mode)))
    audio.addEventListener('error', () => {
      state.playing = false
      updatePlayState()
      launcher.setAttribute('aria-label', '音乐暂时无法播放，打开播放器重试')
    })

    playButton?.addEventListener('click', () => {
      if (audio.paused) void play()
      else audio.pause()
    })
    document.getElementById('music-previous')?.addEventListener('click', () => {
      loadTrack((state.track - 1 + TRACKS.length) % TRACKS.length)
    })
    document.getElementById('music-next')?.addEventListener('click', () => {
      loadTrack(nextTrackIndex(state.track, TRACKS.length, state.mode))
    })
    progress?.addEventListener('input', () => {
      if (!Number.isFinite(audio.duration)) return
      audio.currentTime = Number(progress.value)
      save()
    })
    volume?.addEventListener('input', () => {
      state.volume = Number(volume.value)
      audio.volume = state.volume
      audio.muted = state.volume === 0
      save()
    })
    modeButton?.addEventListener('click', () => {
      state.mode = nextPlayMode(state.mode)
      updateMode()
      save()
    })

    launcher.addEventListener('click', () => {
      dialog.showModal()
    })
    dialog.addEventListener('close', save)
    window.addEventListener('pagehide', save)

    if (resumeWanted) {
      const resume = () => {
        if (resumeWanted) void play()
      }
      document.addEventListener('pointerdown', resume, { once: true })
      document.addEventListener('keydown', resume, { once: true })
    }

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false
      const outside = (event) => {
        const rect = dialog.getBoundingClientRect()
        return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
      }
      dialog.addEventListener('pointerdown', (event) => { pressedOutside = outside(event) })
      dialog.addEventListener('pointerup', (event) => {
        if (pressedOutside && outside(event)) dialog.close()
      })
    }
  }
}
