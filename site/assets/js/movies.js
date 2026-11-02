export const MOVIE_LIBRARY = [
  { title: '千与千寻', director: '宫崎骏', year: 2001, genres: ['动画', '治愈', '成长'], synopsis: '一个关于成长、勇气与善良的故事。' },
  { title: '盗梦空间', director: 'Christopher Nolan', year: 2010, genres: ['科幻', '悬疑'], synopsis: '在梦境与现实之间，寻找回家的路。' },
  { title: '肖申克的救赎', director: 'Frank Darabont', year: 1994, genres: ['剧情', '励志', '经典'], synopsis: '希望是好事，也许是人间至善。' },
  { title: '星际穿越', director: 'Christopher Nolan', year: 2014, genres: ['科幻', '亲情'], synopsis: '关于时间、亲情与人类选择的太空旅程。' },
  { title: '爱乐之城', director: 'Damien Chazelle', year: 2016, genres: ['爱情', '歌舞'], synopsis: '关于梦想、爱情和相遇的一段旋律。' },
]

export function recommendMovie(query, library = MOVIE_LIBRARY) {
  if (library.length === 0) return { title: '每日推荐', director: '', year: '', genres: [], synopsis: '当前片库为空，请稍后再试。' }
  const words = query.toLowerCase().split(/[\s,，.。!！?？]+/).filter(Boolean)
  const match = library.find((movie) => words.some((word) =>
    movie.title.toLowerCase().includes(word) || movie.director.toLowerCase().includes(word) || movie.genres.some((genre) => genre.toLowerCase().includes(word)),
  ))
  if (match) return match
  const day = Math.floor(Date.now() / 86400000)
  return library[day % library.length]
}

if (typeof document !== 'undefined') {
  const query = document.getElementById('movie-query')
  const result = document.getElementById('movie-result')
  const show = (movie) => {
    if (!result) return
    result.replaceChildren()
    const title = document.createElement('h2')
    title.textContent = `《${movie.title}》${movie.year ? ` · ${movie.year}` : ''}`
    const meta = document.createElement('p')
    meta.textContent = [movie.director, ...(movie.genres || [])].filter(Boolean).join(' · ')
    const synopsis = document.createElement('p')
    synopsis.textContent = movie.synopsis
    result.append(title, meta, synopsis)
  }
  document.getElementById('movie-recommend')?.addEventListener('click', () => show(recommendMovie(query?.value || '')))
  document.getElementById('movie-ai')?.addEventListener('click', async () => {
    const key = document.getElementById('movie-key')?.value || ''
    if (!key) { show(recommendMovie(query?.value || '')); return }
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-ai/DeepSeek-V2.5', messages: [{ role: 'user', content: `用一句话推荐一部电影：${query?.value || '今天看什么'}` }], max_tokens: 100 }),
      })
      if (!response.ok) throw new Error('AI unavailable')
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (!text) throw new Error('Empty AI response')
      show({ title: 'AI 推荐', director: '', year: '', genres: [], synopsis: text })
    } catch {
      show(recommendMovie(query?.value || ''))
    }
  })
}
