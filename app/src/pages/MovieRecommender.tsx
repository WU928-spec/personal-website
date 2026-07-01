import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Send, User, Bot, KeyRound, Wand2, Star, Sparkles } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import { MOVIE_LIBRARY, getDailyMovie, type Movie } from '@/data/movies'

/* ─── Types ─── */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  movies?: Movie[]
  freeMovies?: FreeMovie[]
  timestamp: number
}

interface FreeMovie {
  title: string
  originalTitle?: string
  director: string
  year: string
  genre: string
  reason: string
  whereToWatch?: string
  runtime?: string
  rating?: string
}

/* ─── API ─── */

const API_KEY_STORAGE = 'movie_agent_api_key'
const API_BASE_DEFAULT = 'https://api.siliconflow.cn/v1'

const SYSTEM_PROMPT = `你是「光影探索者」，一位专业的电影品味顾问，拥有极为广博的电影知识。你推荐的电影不限于任何片库，可以推荐世界上任何一部电影。

你的核心能力：
1. 情绪匹配 — 根据用户的心情、精神状态、当下的情绪需求，推荐最能共鸣的电影
2. 口味探索 — 通过追问引导用户发现自己的偏好，推荐超出预期的电影
3. 深度推荐 — 不是简单的"好看"，而是说出这部电影在这个特定时刻对用户的意义
4. 冷门与热门兼顾 — 既推荐经典大众片，也推荐被低估的宝藏片

推荐原则：
- 绝不剧透，绝不透露关键情节转折
- 语气温暖、真诚，像一个看过上万部电影、真正懂你的电影迷朋友
- 每次推荐 1-2 部电影，说清楚为什么「现在」看这部
- 如果推荐冷门片，简单说明为什么它值得被发现
- 推荐的最后，可以追问用户一个小问题，帮助下一次推荐更精准
- 如果用户提到看过某部电影，记住这个信息用于后续推荐

输出格式（必须严格遵守）：
{
  "reply": "你的回复文本（对话式的，温暖自然的，200字以内）",
  "movies": [
    {
      "title": "电影中文名（必填）",
      "originalTitle": "Original Title（可选）",
      "director": "导演名",
      "year": "年份",
      "genre": "主要类型",
      "runtime": "片长（如 142分钟）",
      "rating": "豆瓣评分（如 9.1）",
      "reason": "推荐理由（50-80字，结合用户当下的情绪和处境）",
      "whereToWatch": "观看渠道（如 Netflix / 爱奇艺 / B站 / 影院热映）"
    }
  ]
}

注意：
- 如果用户只是打招呼或说"随便推荐"，先热情回应，然后问 1-2 个简短问题（如"最近心情怎么样？"或"喜欢节奏快还是慢的电影？"）
- 用户追问"还有吗""换一部"时，结合之前的对话上下文推荐新的
- 如果用户明确拒绝某种类型（如"不要恐怖片"），绝不再推荐
- 如果用户心情很低落，推荐能给予陪伴感的电影而非强行励志的"鸡汤"`

async function chatWithAI(
  apiKey: string,
  history: { role: string; content: string }[],
  baseUrl: string = API_BASE_DEFAULT
): Promise<{ reply: string; movies: FreeMovie[] } | null> {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Try to extract JSON block
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback: treat entire response as plain text
      return { reply: content, movies: [] }
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      reply: parsed.reply || content,
      movies: (parsed.movies || []).map((m: Record<string, string>) => ({
        title: m.title || '未知',
        originalTitle: m.originalTitle,
        director: m.director || '未知',
        year: m.year || '未知',
        genre: m.genre || '未知',
        reason: m.reason || '这部电影很适合你。',
        whereToWatch: m.whereToWatch,
        runtime: m.runtime,
        rating: m.rating,
      })),
    }
  } catch {
    return null
  }
}

function findLocalMovie(title: string): Movie | undefined {
  const normalized = title.toLowerCase().trim()
  return MOVIE_LIBRARY.find(
    (m) =>
      m.title.toLowerCase().includes(normalized) ||
      m.titleEn.toLowerCase().includes(normalized) ||
      normalized.includes(m.title.toLowerCase())
  )
}

/* ─── Components ─── */

function FreeMovieCard({ movie, index }: { movie: FreeMovie; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-Amber/5 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-Amber/5 border border-indigo-200/30 dark:border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400/70 shrink-0">
          <Wand2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-display text-sm font-semibold text-Ink dark:text-white">{movie.title}</h3>
            {movie.originalTitle && (
              <span className="text-[0.65rem] text-Slate/40">{movie.originalTitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2 text-[0.7rem] text-Slate/50 dark:text-white/35">
            {movie.rating && (
              <span className="flex items-center gap-0.5">
                <Star size={9} className="text-Gold" />
                {movie.rating}
              </span>
            )}
            <span>{movie.year}</span>
            <span>{movie.director}</span>
            {movie.runtime && <span>{movie.runtime}</span>}
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-100/40 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 text-[0.6rem]">
              {movie.genre}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/40 dark:bg-white/[0.02] border border-indigo-100/30 dark:border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={10} className="text-indigo-400/70" />
              <span className="text-[0.65rem] text-indigo-400/70 font-medium">推荐理由</span>
            </div>
            <p className="text-xs text-Ink/60 dark:text-white/50 leading-relaxed">{movie.reason}</p>
          </div>
          {movie.whereToWatch && (
            <p className="mt-2 text-[0.65rem] text-Slate/40 dark:text-white/25 flex items-center gap-1">
              <Sparkles size={9} />
              观看渠道：{movie.whereToWatch}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function LocalMovieCard({ movie }: { movie: Movie }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/[0.02] border border-Sand/50 dark:border-white/5 hover:border-Amber/20 transition-colors">
      {imgError ? (
        <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-Amber/10 to-rose-400/10 flex items-center justify-center text-Ink/30 text-sm font-bold shrink-0">
          {movie.title[0]}
        </div>
      ) : (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-14 h-20 rounded-lg object-cover shrink-0 bg-white/5"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="text-sm font-medium text-Ink dark:text-white truncate">{movie.title}</h4>
          <span className="text-[0.65rem] text-Slate/40">{movie.titleEn}</span>
        </div>
        <div className="flex items-center gap-2 mb-1 text-[0.7rem] text-Slate/50">
          <span className="flex items-center gap-0.5">
            <Star size={9} className="text-Gold" />
            {movie.rating}
          </span>
          <span>{movie.year}</span>
          <span>{movie.duration}</span>
        </div>
        <p className="text-[0.7rem] text-Slate/40 leading-relaxed line-clamp-2">{movie.synopsis}</p>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */

export default function MovieAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiSettings, setShowApiSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dailyMovie = getDailyMovie()

  // Initialize greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: `你好，我是光影探索者 🎬\n\n我会根据你的心情、偏好和当下的状态，推荐最适合你的电影。我不限于任何片库，世界上任何一部电影我都可以推荐。\n\n告诉我：\n• 你最近的心情怎么样？\n• 想看点什么类型的？\n• 或者随便说点什么，比如「最近失恋了」「周末想放松」`,
        timestamp: Date.now(),
      }
      setMessages([greeting])
    }
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveApiKey = useCallback(() => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(API_KEY_STORAGE, apiKeyInput.trim())
      setApiKey(apiKeyInput.trim())
      setShowApiSettings(false)
    }
  }, [apiKeyInput])

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE)
    setApiKey('')
    setApiKeyInput('')
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const history = messages
      .map((m) => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: text })

    if (apiKey) {
      const aiResult = await chatWithAI(apiKey, history)

      if (aiResult) {
        const localMovies: Movie[] = []
        for (const fm of aiResult.movies) {
          const local = findLocalMovie(fm.title)
          if (local) localMovies.push(local)
        }

        const aiMsg: ChatMessage = {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: aiResult.reply,
          movies: localMovies.length > 0 ? localMovies : undefined,
          freeMovies: aiResult.movies,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        // AI call failed
        fallback(text)
      }
    } else {
      // No API key: local search
      fallback(text)
    }

    setLoading(false)
  }, [input, loading, apiKey, messages])

  function fallback(text: string) {
    const searchWords = text.toLowerCase().split(/[\s,，.。!！?？]+/)
    const matches = MOVIE_LIBRARY.filter((m) =>
      searchWords.some((w) =>
        w.length > 1 && (
          m.title.toLowerCase().includes(w) ||
          m.titleEn.toLowerCase().includes(w) ||
          m.genres.some((g) => g.toLowerCase().includes(w)) ||
          m.tags.some((t) => t.toLowerCase().includes(w)) ||
          m.director.toLowerCase().includes(w)
        )
      )
    )
    const pick = matches.length > 0 ? matches[0] : dailyMovie

    const moodKeywords: Record<string, string[]> = {
      '治愈': ['治愈', '低落', '难过', '伤心', '失恋', '失恋', '分手'],
      '悬疑': ['悬疑', '烧脑', '推理', '刺激', '紧张'],
      '喜剧': ['搞笑', '轻松', '喜剧', '开心', '笑'],
      '爱情': ['爱情', '浪漫', '恋爱', '前任', '想谈恋爱'],
      '科幻': ['科幻', '未来', '太空', '宇宙'],
      '经典': ['经典', '必看', '高分', '神作'],
    }

    let reply = `我为你推荐 **《${pick.title}》**（${pick.year}），${pick.director} 执导。\n\n${pick.synopsis.slice(0, 100)}...\n\n这是一部 ${pick.genres.join('、')} 电影，豆瓣评分 ${pick.rating}。`
    for (const [mood, words] of Object.entries(moodKeywords)) {
      if (words.some((w) => text.toLowerCase().includes(w))) {
        reply = `感受到你${mood === '治愈' ? '需要一些温暖' : mood === '悬疑' ? '想要一些刺激' : mood === '爱情' ? '可能需要一些浪漫' : '想看点'}${mood}的东西。\n\n我推荐 **《${pick.title}》**（${pick.year}），${pick.director} 执导。\n\n${pick.synopsis.slice(0, 80)}...\n\n豆瓣评分 ${pick.rating}，值得一看。`
        break
      }
    }

    const fallbackMsg: ChatMessage = {
      id: 'f-' + Date.now(),
      role: 'assistant',
      content: reply + '\n\n💡 **接入 AI** 后我可以根据你的详细描述给出更个性化、更深入的推荐，还能推荐片库之外的冷门佳作。',
      movies: [pick],
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, fallbackMsg])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickReplies = [
    '最近心情不好，想看治愈系的',
    '推荐一部悬疑烧脑的',
    '经典必看有哪些',
    '想看冷门但高质量的',
  ]

  const isEmpty = messages.length <= 1 && !loading

  return (
    <div className="h-[calc(100dvh-4rem)] bg-gradient-to-b from-Parchment to-white dark:from-Graphite dark:to-[#0a0a0a] flex flex-col">
      <PageSEO title="光影探索者 — AI 电影顾问" description="你的专属电影品味顾问" />

      {/* Header */}
      <div className="shrink-0 border-b border-Sand/50 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white shadow-lg shadow-Amber/20">
              <Film size={16} />
            </div>
            <div>
              <h1 className="font-display text-sm font-semibold text-Ink dark:text-white">光影探索者</h1>
              <p className="text-[0.65rem] text-Slate/40 dark:text-white/30">AI 电影顾问</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {apiKey ? (
              <span className="flex items-center gap-1 text-[0.65rem] text-green-500/70">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 animate-pulse" />
                AI 在线
              </span>
            ) : (
              <button
                onClick={() => setShowApiSettings(!showApiSettings)}
                className="flex items-center gap-1 text-[0.65rem] text-Slate/40 hover:text-Amber/60 transition-colors"
              >
                <KeyRound size={11} />
                接入 AI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* API Key Settings */}
      <AnimatePresence>
        {showApiSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden shrink-0 border-b border-Sand/30 dark:border-white/5"
          >
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-Sand/50 dark:border-white/10">
                <p className="text-[0.7rem] text-Slate/40 mb-2 leading-relaxed">
                  输入 SiliconFlow / OpenAI 兼容 API Key，启用真正的 AI 电影顾问。
                  没有 Key？<a href="https://siliconflow.cn" target="_blank" rel="noopener noreferrer" className="text-Amber/60 hover:underline">免费获取</a>
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={apiKey ? '已保存' : 'sk-...'}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand/50 dark:border-white/10 text-xs text-Ink dark:text-white focus:outline-none focus:border-Amber/50 placeholder:text-Slate/40"
                  />
                  <button onClick={saveApiKey} disabled={!apiKeyInput.trim()} className="px-3 py-1.5 rounded-lg bg-Amber text-white text-xs font-medium hover:bg-Amber/90 disabled:opacity-40 transition-colors">保存</button>
                  {apiKey && <button onClick={clearApiKey} className="px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand/50 dark:border-white/10 text-xs text-Slate hover:text-Rose transition-colors">清除</button>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot size={13} />
                </div>
              )}

              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-Amber text-white rounded-br-md shadow-sm'
                    : 'bg-white/70 dark:bg-white/[0.04] border border-Sand/30 dark:border-white/5 text-Ink dark:text-white/90 rounded-bl-md shadow-sm'
                }`}>
                  {msg.content.split('**').map((part, i) =>
                    i % 2 === 1 ? (
                      <span key={i} className="font-semibold">{part}</span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>

                {/* Free AI movie cards */}
                {msg.freeMovies && msg.freeMovies.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.freeMovies.map((m, i) => (
                      <FreeMovieCard key={i} movie={m} index={i} />
                    ))}
                  </div>
                )}

                {/* Local movie cards */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.movies.map((m) => (
                      <LocalMovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 dark:text-white/40 shrink-0 mt-0.5">
                  <User size={13} />
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white shrink-0">
                <Bot size={13} />
              </div>
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-Sand/30 dark:border-white/5 rounded-bl-md">
                <div className="flex items-center gap-1.5 h-5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-Amber/60"
                    />
                  ))}
                  <span className="text-xs text-Slate/30 ml-1">
                    {apiKey ? '正在思考...' : '正在搜索...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-Sand/50 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Quick replies (only when idle) */}
          {isEmpty && !loading && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickReplies.map((text) => (
                <button
                  key={text}
                  onClick={() => { setInput(text); inputRef.current?.focus() }}
                  className="px-3 py-1.5 rounded-full text-[0.7rem] bg-white/60 dark:bg-white/[0.03] border border-Sand/40 dark:border-white/10 text-Slate/60 hover:text-Amber hover:border-Amber/30 transition-colors"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? '和光影探索者聊聊...' : '输入关键词获取本地推荐...'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-Sand/50 dark:border-white/10 text-sm text-Ink dark:text-white focus:outline-none focus:border-Amber/50 placeholder:text-Slate/40 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-Amber to-rose-400 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-Amber/20"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
