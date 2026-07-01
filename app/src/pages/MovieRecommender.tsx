import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Film, Send, User, Bot, KeyRound, Wand2, Star, ChevronRight,
} from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import BackToTools from '@/components/BackToTools'
import { MOVIE_LIBRARY, getDailyMovie, type Movie } from '@/data/movies'

/* ─── Types ─── */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  movies?: Movie[]      // 本地库中匹配的电影卡片
  freeMovie?: {         // AI 推荐的片库外电影
    title: string
    director: string
    year: string
    genre: string
    reason: string
  }
  timestamp: number
}

interface FreeAIRec {
  title: string
  director: string
  year: string
  genre: string
  reason: string
}

/* ─── API ─── */

const API_KEY_STORAGE = 'movie_agent_api_key'
const API_BASE_DEFAULT = 'https://api.siliconflow.cn/v1'

const SYSTEM_PROMPT = `你是一位专业的电影顾问，拥有广博的电影知识。你的任务是根据用户的心情、偏好和描述，推荐最适合的电影。

规则：
1. 推荐任何你知识范围内的电影，不限于特定片库
2. 每次推荐 1-2 部电影，给出详细理由
3. 如果用户追问，结合上下文继续推荐
4. 语气友好、专业，像一个懂电影的朋友
5. 可以反问用户以获取更多信息（如"你喜欢节奏快一点的还是慢一点的？"）

输出格式：
- 先给出推荐电影的名称、导演、年份、类型
- 然后给出推荐理由（50-100字）
- 最后可以问用户是否满意或想换一部

如果用户只是打招呼，先热情回应，然后询问想看什么类型的电影。`

async function chatWithAI(
  apiKey: string,
  messages: { role: string; content: string }[],
  baseUrl: string = API_BASE_DEFAULT
): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.8,
        max_tokens: 400,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

function extractMoviesFromText(text: string): FreeAIRec[] {
  const movies: FreeAIRec[] = []
  const lines = text.split('\n')
  let current: Partial<FreeAIRec> = {}

  for (const line of lines) {
    const titleMatch = line.match(/[《「]([^》」]+)[》」]/)
    if (titleMatch) current.title = titleMatch[1]

    const directorMatch = line.match(/导演[：:]\s*(.+)/i)
    if (directorMatch) current.director = directorMatch[1].trim()

    const yearMatch = line.match(/(\d{4})/)
    if (yearMatch) current.year = yearMatch[1]

    const genreMatch = line.match(/类型[：:]\s*(.+)/i)
    if (genreMatch) current.genre = genreMatch[1].trim()

    const reasonMatch = line.match(/推荐理由?[：:]\s*(.+)/i)
    if (reasonMatch) current.reason = reasonMatch[1].trim()
  }

  if (current.title) {
    movies.push({
      title: current.title,
      director: current.director || '未知',
      year: current.year || '未知',
      genre: current.genre || '未知',
      reason: current.reason || '这部电影很符合你的需求。',
    })
  }

  return movies
}

function findLocalMovie(title: string): Movie | undefined {
  return MOVIE_LIBRARY.find((m) =>
    m.title.toLowerCase() === title.toLowerCase() ||
    m.titleEn.toLowerCase() === title.toLowerCase()
  )
}

/* ─── Components ─── */

function MoviePoster({ movie, size = 'md' }: { movie: Movie; size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false)
  const sizeClasses = {
    sm: 'w-14 h-20 text-lg',
    md: 'w-20 h-30 text-xl',
    lg: 'w-28 h-40 text-2xl',
  }

  if (imgError) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-Amber/20 to-rose-400/20 flex items-center justify-center text-Ink/40 dark:text-white/40 font-bold shrink-0`}>
        {movie.title[0]}
      </div>
    )
  }

  return (
    <img
      src={movie.posterUrl}
      alt={movie.title}
      className={`${sizeClasses[size]} rounded-lg object-cover shadow-soft shrink-0 bg-white/5`}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}

function FreeMovieCard({ movie }: { movie: FreeAIRec }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 via-Amber/5 to-rose-400/5 dark:from-purple-500/10 dark:via-Amber/5 dark:to-rose-400/10 border border-Amber/15 dark:border-white/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-Amber/20 flex items-center justify-center text-Amber/60 shrink-0">
          <Wand2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-sm font-semibold text-Ink dark:text-white">{movie.title}</h3>
            <span className="text-xs text-Slate/50">{movie.year}</span>
          </div>
          <div className="flex items-center gap-3 mb-2 text-xs text-Slate/50">
            <span>导演：{movie.director}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-100/30 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 text-[0.6rem]">{movie.genre}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/30 dark:bg-white/[0.02] border border-Amber/10 dark:border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot size={10} className="text-Amber/50" />
              <span className="text-[0.6rem] text-Amber/50 font-medium">推荐理由</span>
            </div>
            <p className="text-xs text-Ink/60 dark:text-white/50 leading-relaxed">{movie.reason}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LocalMovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/[0.02] border border-Sand dark:border-white/5 hover:border-Amber/20 transition-colors">
      <MoviePoster movie={movie} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="text-sm font-medium text-Ink dark:text-white truncate">{movie.title}</h4>
          <span className="text-[0.65rem] text-Slate/50">{movie.titleEn}</span>
        </div>
        <div className="flex items-center gap-2 mb-1 text-[0.65rem] text-Slate/50">
          <span className="flex items-center gap-0.5">
            <Star size={10} className="text-Gold" />
            {movie.rating}
          </span>
          <span>{movie.year}</span>
          <span>{movie.duration}</span>
        </div>
        <p className="text-[0.65rem] text-Slate/40 leading-relaxed line-clamp-2">{movie.synopsis}</p>
      </div>
      <ChevronRight size={14} className="text-Slate/20 self-center shrink-0" />
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

  // Initialize with system greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: `你好！我是你的电影顾问 🎬\n\n今天想看点什么？可以告诉我你的心情、喜欢的类型，或者最近想看什么题材的电影。\n\n比如：「最近心情不好，想看一部治愈系的电影」或「推荐一部悬疑烧脑的」`,
        timestamp: Date.now(),
      }
      setMessages([greeting])
    }
  }, [])

  // Auto scroll to bottom
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
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Build conversation history for AI
    const history = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }))

    history.push({ role: 'user', content: text })

    if (apiKey) {
      // Call AI
      const aiResponse = await chatWithAI(apiKey, history)
      if (aiResponse) {
        const freeMovies = extractMoviesFromText(aiResponse)
        const localMovies: Movie[] = []

        // Try to find mentioned movies in local library
        for (const fm of freeMovies) {
          const local = findLocalMovie(fm.title)
          if (local) localMovies.push(local)
        }

        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: aiResponse,
          movies: localMovies.length > 0 ? localMovies : undefined,
          freeMovie: freeMovies.length > 0 ? freeMovies[0] : undefined,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        // AI call failed, fallback to local
        const fallbackMsg: ChatMessage = {
          id: 'fallback-' + Date.now(),
          role: 'assistant',
          content: 'AI 服务暂时不可用，我为你从本地精选片库中推荐一部电影。\n\n**今日推荐**：《' + dailyMovie.title + '》\n\n' + dailyMovie.synopsis.slice(0, 100) + '...',
          movies: [dailyMovie],
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, fallbackMsg])
      }
    } else {
      // No API key: local search + template response
      const searchWords = text.toLowerCase().split(/\s+/)
      const matches = MOVIE_LIBRARY.filter((m) =>
        searchWords.some((w) =>
          m.title.toLowerCase().includes(w) ||
          m.titleEn.toLowerCase().includes(w) ||
          m.genres.some((g) => g.toLowerCase().includes(w)) ||
          m.tags.some((t) => t.toLowerCase().includes(w)) ||
          m.director.toLowerCase().includes(w)
        )
      )

      const pick = matches.length > 0 ? matches[0] : dailyMovie
      const fallbackMsg: ChatMessage = {
        id: 'local-' + Date.now(),
        role: 'assistant',
        content: `根据你的描述，我为你推荐 **《${pick.title}》** (${pick.year})。\n\n${pick.synopsis.slice(0, 120)}...\n\n这是一部 ${pick.genres.join('、')} 电影，豆瓣评分 ${pick.rating}。\n\n你想了解更多，或者让我换一部推荐吗？`,
        movies: [pick],
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    }

    setLoading(false)
  }, [input, loading, apiKey, messages, dailyMovie])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickReplies = [
    '最近心情不好，想看治愈系',
    '推荐一部悬疑烧脑的',
    '想看点轻松搞笑的',
    '经典必看有哪些',
  ]

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite flex flex-col">
      <PageSEO title="电影顾问" description="你的专属 AI 电影推荐 Agent" />

      {/* Header */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-6 pb-2">
        <BackToTools className="mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 dark:text-white/40">
              <Film size={20} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-Ink dark:text-white">电影顾问</h1>
              <p className="text-xs text-Slate dark:text-white/40">你的专属 AI 电影推荐 Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {apiKey ? (
              <span className="flex items-center gap-1 text-xs text-green-500/70 dark:text-green-400/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 animate-pulse" />
                AI 已接入
              </span>
            ) : (
              <button
                onClick={() => setShowApiSettings(!showApiSettings)}
                className="flex items-center gap-1 text-xs text-Slate/40 hover:text-Amber/60 transition-colors"
              >
                <KeyRound size={12} />
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
            className="overflow-hidden max-w-3xl mx-auto w-full px-4"
          >
            <div className="mt-2 p-4 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-Sand dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={14} className="text-Amber/60" />
                <span className="text-sm font-medium text-Ink/70 dark:text-white/60">AI 设置</span>
              </div>
              <p className="text-xs text-Slate/40 dark:text-white/30 mb-3">
                输入 SiliconFlow / OpenAI 兼容 API Key，即可启用真正的 AI 电影顾问。
                <a href="https://siliconflow.cn" target="_blank" rel="noopener noreferrer" className="text-Amber/60 hover:underline ml-1">免费获取</a>
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={apiKey ? '已保存' : 'sk-...'}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-sm text-Ink dark:text-white focus:outline-none focus:border-Amber/50 placeholder:text-Slate/40"
                />
                <button
                  onClick={saveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="px-4 py-2 rounded-lg bg-Amber text-white text-sm font-medium hover:bg-Amber/90 disabled:opacity-40 transition-colors"
                >
                  保存
                </button>
                {apiKey && (
                  <button
                    onClick={clearApiKey}
                    className="px-4 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-Slate hover:text-Rose text-sm transition-colors"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 shrink-0">
                  <Bot size={16} />
                </div>
              )}

              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-Amber text-white rounded-br-md'
                      : 'bg-white/60 dark:bg-white/[0.03] border border-Sand dark:border-white/10 text-Ink dark:text-white/90 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Local movie cards */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.movies.map((m) => (
                      <LocalMovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                )}

                {/* Free AI recommendation */}
                {msg.freeMovie && !msg.movies && (
                  <div className="mt-2">
                    <FreeMovieCard movie={msg.freeMovie} />
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  <User size={14} />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-Sand dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-Amber/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-Amber/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-Amber/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && !loading && (
        <div className="max-w-3xl mx-auto w-full px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((text) => (
              <button
                key={text}
                onClick={() => {
                  setInput(text)
                  inputRef.current?.focus()
                }}
                className="px-3 py-1.5 rounded-full text-xs bg-white/40 dark:bg-white/[0.03] border border-Sand dark:border-white/10 text-Slate/60 hover:text-Amber hover:border-Amber/30 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-6 pt-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? '和电影顾问聊聊你想看什么...' : '输入关键词获取本地推荐，或接入 AI 获得更智能的推荐...'}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-sm text-Ink dark:text-white focus:outline-none focus:border-Amber/50 placeholder:text-Slate/40"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl bg-Amber text-white hover:bg-Amber/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
