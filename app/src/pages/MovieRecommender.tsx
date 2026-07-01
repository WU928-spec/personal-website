import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Film, Star, Clock, MapPin, Search, ChevronRight, Heart, Shuffle, Calendar, Quote, X, Tag, Clapperboard, KeyRound, Bot, Wand2 } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import BackToTools from '@/components/BackToTools'
import { MOVIE_LIBRARY, getDailyMovie, getMoviesByMood, searchMovies, getRandomMovies, type Movie } from '@/data/movies'

const MOOD_OPTIONS = [
  { key: 'happy', label: '开心', icon: '😊', desc: '想笑一笑' },
  { key: 'sad', label: '低落', icon: '😢', desc: '需要治愈' },
  { key: 'excited', label: '兴奋', icon: '⚡', desc: '想来点刺激的' },
  { key: 'relaxed', label: '放松', icon: '🌿', desc: '想轻松一下' },
  { key: 'thoughtful', label: '思考', icon: '🤔', desc: '想看有深度的' },
  { key: 'romantic', label: '浪漫', icon: '💕', desc: '想谈恋爱' },
  { key: 'nostalgic', label: '怀旧', icon: '📷', desc: '想回忆过去' },
  { key: 'adventurous', label: '冒险', icon: '🚀', desc: '想探索世界' },
  { key: 'melancholy', label: '忧郁', icon: '🌧️', desc: '想一个人静静' },
]

const GENRE_COLORS: Record<string, string> = {
  '科幻': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '动画': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '剧情': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  '爱情': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  '喜剧': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  '犯罪': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  '悬疑': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  '惊悚': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  '动作': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '奇幻': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '冒险': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '音乐': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  '传记': 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300',
  '战争': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300',
  '历史': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

function getGenreColor(genre: string): string {
  return GENRE_COLORS[genre] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
}

/* ─── AI Types ─── */

interface FreeAIRecommendation {
  title: string
  director: string
  year: string
  genre: string
  reason: string
}

/* ─── AI API ─── */

const API_KEY_STORAGE = 'movie_recommender_api_key'
const API_BASE_DEFAULT = 'https://api.siliconflow.cn/v1'

async function callAILocalPick(
  apiKey: string,
  mood: string,
  candidates: Movie[],
  baseUrl: string = API_BASE_DEFAULT
): Promise<{ movie: Movie; reason: string } | null> {
  const candidateInfo = candidates.slice(0, 5).map((m, i) =>
    `${i + 1}. 《${m.title}》(${m.year}) - ${m.genres.join('/')} - ${m.synopsis.slice(0, 80)}...`
  ).join('\n')

  const prompt = `你是一位专业的电影推荐师。用户今天的心情是「${mood}」。

请从以下候选电影中，推荐一部最适合用户当下心情的电影：
${candidateInfo}

请返回 JSON 格式：
{"index": 1, "reason": "推荐理由（50-80字，结合用户心情和电影特点）"}

只返回 JSON，不要其他内容。`

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    const idx = (parsed.index || 1) - 1
    const movie = candidates[idx] || candidates[0]
    return { movie, reason: parsed.reason || '这部电影很符合你的心情。' }
  } catch {
    return null
  }
}

async function callAIFreeRecommendation(
  apiKey: string,
  mood: string,
  baseUrl: string = API_BASE_DEFAULT
): Promise<FreeAIRecommendation | null> {
  const prompt = `你是一位专业的电影推荐师。用户今天的心情是「${mood}」。

请从你广博的电影知识中，推荐一部最适合这个心情的电影。不要局限于任何片库，推荐任何你认为合适的电影。

请返回 JSON 格式：
{"title": "电影名", "director": "导演名", "year": "年份", "genre": "类型", "reason": "推荐理由（50-80字，结合用户心情和电影特点）"}

只返回 JSON，不要其他内容。`

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V2.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

/* ─── Components ─── */

function MoviePoster({ movie, size = 'md' }: { movie: Movie; size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false)
  const sizeClasses = {
    sm: 'w-16 h-24 text-xl',
    md: 'w-24 h-36 text-2xl',
    lg: 'w-32 h-48 text-3xl',
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

function MovieCard({ movie, index, aiReason, onSelect }: { movie: Movie; index: number; aiReason?: string; onSelect: (m: Movie) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group cursor-pointer"
      onClick={() => onSelect(movie)}
    >
      <div className="flex gap-4 p-4 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-Sand dark:border-white/10 hover:border-Amber/30 dark:hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-Amber/5">
        <MoviePoster movie={movie} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-base font-medium text-Ink dark:text-white truncate">
              {movie.title}
            </h3>
            <span className="text-xs text-Slate/60 dark:text-white/40 shrink-0">{movie.titleEn}</span>
          </div>
          <div className="flex items-center gap-3 mb-2 text-xs text-Slate/60 dark:text-white/40">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-Gold" />
              {movie.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {movie.duration}
            </span>
            <span>{movie.year}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {movie.genres.slice(0, 3).map((g) => (
              <span key={g} className={`px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${getGenreColor(g)}`}>
                {g}
              </span>
            ))}
          </div>
          {aiReason ? (
            <div className="p-2 rounded-lg bg-Amber/5 dark:bg-white/5 border border-Amber/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Bot size={10} className="text-Amber/60" />
                <span className="text-[0.65rem] text-Amber/60 dark:text-white/40 font-medium">AI 推荐理由</span>
              </div>
              <p className="text-xs text-Ink/60 dark:text-white/50 leading-relaxed line-clamp-2">
                {aiReason}
              </p>
            </div>
          ) : (
            <p className="text-xs text-Slate/50 dark:text-white/30 leading-relaxed line-clamp-2">
              {movie.synopsis}
            </p>
          )}
        </div>
        <ChevronRight size={16} className="text-Slate/30 dark:text-white/20 group-hover:text-Amber/60 transition-colors shrink-0 self-center" />
      </div>
    </motion.div>
  )
}

function FreeAIRecCard({ rec, index }: { rec: FreeAIRecommendation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 via-Amber/5 to-rose-400/5 dark:from-purple-500/10 dark:via-Amber/5 dark:to-rose-400/10 border border-Amber/20 dark:border-white/15"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-Amber/20 flex items-center justify-center text-Amber/60 shrink-0">
          <Wand2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-base font-medium text-Ink dark:text-white">
              {rec.title}
            </h3>
            <span className="text-xs text-Slate/60 dark:text-white/40">{rec.year}</span>
          </div>
          <div className="flex items-center gap-3 mb-2 text-xs text-Slate/60 dark:text-white/40">
            <span>导演：{rec.director}</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100/50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 text-[0.65rem]">
              {rec.genre}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/40 dark:bg-white/[0.03] border border-Amber/10 dark:border-white/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot size={10} className="text-Amber/60" />
              <span className="text-[0.65rem] text-Amber/60 dark:text-white/40 font-medium">AI 推荐理由</span>
            </div>
            <p className="text-xs text-Ink/60 dark:text-white/50 leading-relaxed">
              {rec.reason}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MovieDetail({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-Parchment dark:bg-[#0a0a15] border border-Sand dark:border-white/10 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-Amber/20 via-rose-400/10 to-purple-500/20 flex items-center justify-center">
            <MoviePoster movie={movie} size="lg" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-xl font-semibold text-Ink dark:text-white">
              {movie.title}
            </h2>
            <span className="text-sm text-Slate/60 dark:text-white/40">{movie.titleEn}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-Slate/60 dark:text-white/40">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-Gold" />
              <span className="font-medium text-Ink/80 dark:text-white/80">{movie.rating}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {movie.duration}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {movie.year}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {movie.country}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {movie.genres.map((g) => (
              <span key={g} className={`px-2.5 py-1 rounded-full text-xs font-medium ${getGenreColor(g)}`}>
                {g}
              </span>
            ))}
          </div>

          <div className="mb-4 p-3 rounded-lg bg-Amber/5 dark:bg-white/5 border border-Amber/10 dark:border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Quote size={12} className="text-Amber/60" />
              <span className="text-xs text-Amber/60 dark:text-white/40 font-medium">经典台词</span>
            </div>
            <p className="text-sm text-Ink/70 dark:text-white/70 italic leading-relaxed">
              {movie.quote}
            </p>
          </div>

          <p className="text-sm text-Slate/70 dark:text-white/50 leading-[1.8] mb-4">
            {movie.synopsis}
          </p>

          <div className="flex items-center gap-2 text-xs text-Slate/40 dark:text-white/30">
            <Clapperboard size={12} />
            <span>导演：{movie.director}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main Page ─── */

export default function MovieRecommender() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, string>>({})
  const [freeRec, setFreeRec] = useState<FreeAIRecommendation | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // API Key
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const dailyMovie = useMemo(() => getDailyMovie(), [])

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

  const handleMoodSelect = useCallback(async (mood: string) => {
    setLoading(true)
    setSelectedMood(mood)
    setHasSearched(true)
    setSearchQuery('')
    setAiError(null)
    setAiRecommendations({})
    setFreeRec(null)

    // 1. Get local candidates
    const candidates = getMoviesByMood(mood)
    const movies = candidates.length > 0 ? candidates : getRandomMovies(5)

    // 2. If API key exists, call AI for both local pick and free recommendation
    if (apiKey) {
      try {
        const [localResult, freeResult] = await Promise.all([
          callAILocalPick(apiKey, mood, movies),
          callAIFreeRecommendation(apiKey, mood),
        ])

        if (localResult) {
          const reordered = [localResult.movie, ...movies.filter((m) => m.id !== localResult.movie.id)]
          setRecommendations(reordered.slice(0, 5))
          setAiRecommendations({ [localResult.movie.id]: localResult.reason })
        } else {
          setRecommendations(movies.slice(0, 5))
        }

        if (freeResult) {
          setFreeRec(freeResult)
        }
      } catch {
        setAiError('AI 推荐失败，使用本地匹配')
        setRecommendations(movies.slice(0, 5))
      }
    } else {
      // 3. Fallback to local
      setRecommendations(movies.slice(0, 5))
    }

    setLoading(false)
  }, [apiKey])

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setSelectedMood(null)
    setHasSearched(true)
    setAiError(null)
    setAiRecommendations({})
    setFreeRec(null)

    setTimeout(() => {
      const movies = searchMovies(searchQuery)
      setRecommendations(movies.length > 0 ? movies : getRandomMovies(5))
      setLoading(false)
    }, 400)
  }, [searchQuery])

  const handleRandom = useCallback(() => {
    setLoading(true)
    setSelectedMood(null)
    setSearchQuery('')
    setHasSearched(true)
    setAiError(null)
    setAiRecommendations({})
    setFreeRec(null)

    setTimeout(() => {
      setRecommendations(getRandomMovies(5))
      setLoading(false)
    }, 400)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-Parchment dark:bg-Graphite">
      <PageSEO
        title="每日电影推荐"
        description="根据心情和偏好，发现下一部值得看的电影"
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <BackToTools className="mb-6" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-10 h-10 rounded-xl bg-Amber/10 dark:bg-white/10 flex items-center justify-center text-Amber/60 dark:text-white/40">
            <Film size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-Ink dark:text-white">
              每日电影推荐
            </h1>
            <p className="text-sm text-Slate dark:text-white/40">
              选择心情或输入偏好，发现下一部值得看的电影
            </p>
          </div>
        </motion.div>

        {/* API Key Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-4"
        >
          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="flex items-center gap-2 text-xs text-Slate/50 dark:text-white/30 hover:text-Amber/60 transition-colors"
          >
            <KeyRound size={12} />
            {apiKey ? 'AI 已接入' : '接入 AI 获取个性化推荐'}
            <span className={`transition-transform ${showApiSettings ? 'rotate-180' : ''}`}>▼</span>
          </button>

          <AnimatePresence>
            {showApiSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-Sand dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-Amber/60" />
                    <span className="text-sm font-medium text-Ink/70 dark:text-white/60">AI 推荐设置</span>
                  </div>
                  <p className="text-xs text-Slate/40 dark:text-white/30 mb-3 leading-relaxed">
                    输入你的 API Key 即可启用 AI 个性化推荐。支持 SiliconFlow、OpenAI 等兼容 OpenAI 格式的 API。
                    <br />
                    没有 Key？去 <a href="https://siliconflow.cn" target="_blank" rel="noopener noreferrer" className="text-Amber/60 hover:underline">siliconflow.cn</a> 免费注册获取。
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={apiKey ? '已保存 · 输入新 Key 覆盖' : 'sk-...'}
                        className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-sm text-Ink dark:text-white focus:outline-none focus:border-Amber/50 placeholder:text-Slate/40"
                      />
                    </div>
                    <button
                      onClick={saveApiKey}
                      disabled={!apiKeyInput.trim()}
                      className="px-4 py-2 rounded-lg bg-Amber text-white text-sm font-medium hover:bg-Amber/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  {apiKey && (
                    <p className="mt-2 text-xs text-green-500/70 dark:text-green-400/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                      API Key 已保存（仅存储在本地浏览器）
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Daily Movie Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-Amber/60" />
            <span className="text-sm font-medium text-Ink/70 dark:text-white/60">今日推荐</span>
          </div>

          <div
            className="relative p-6 rounded-2xl bg-gradient-to-br from-Amber/5 via-rose-400/5 to-purple-500/5 dark:from-white/5 dark:via-white/[0.02] dark:to-white/5 border border-Amber/10 dark:border-white/10 cursor-pointer overflow-hidden group"
            onClick={() => setSelectedMovie(dailyMovie)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-Amber/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="flex gap-5">
              <MoviePoster movie={dailyMovie} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-lg font-semibold text-Ink dark:text-white">
                    {dailyMovie.title}
                  </h2>
                  <span className="text-sm text-Slate/60 dark:text-white/40">{dailyMovie.titleEn}</span>
                </div>
                <div className="flex items-center gap-3 mb-3 text-sm text-Slate/60 dark:text-white/40">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-Gold" />
                    {dailyMovie.rating}
                  </span>
                  <span>{dailyMovie.year}</span>
                  <span>{dailyMovie.duration}</span>
                  <span>{dailyMovie.country}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dailyMovie.genres.map((g) => (
                    <span key={g} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGenreColor(g)}`}>
                      {g}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-Slate/60 dark:text-white/40 leading-relaxed line-clamp-2 mb-3">
                  {dailyMovie.synopsis}
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/40 dark:bg-white/[0.03] border border-Amber/10 dark:border-white/10">
                  <Quote size={12} className="text-Amber/60 shrink-0" />
                  <p className="text-xs text-Ink/60 dark:text-white/50 italic truncate">
                    {dailyMovie.quote}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-Slate/30 dark:text-white/20 self-center group-hover:text-Amber/60 transition-colors shrink-0" />
            </div>
          </div>
        </motion.div>

        {/* Search & Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-Amber/60" />
            <span className="text-sm font-medium text-Ink/70 dark:text-white/60">AI 电影推荐</span>
            {apiKey && (
              <span className="flex items-center gap-1 text-xs text-green-500/70 dark:text-green-400/60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 animate-pulse" />
                AI 已接入
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-Slate/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入想看的类型、导演、演员或关键词..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-sm text-Ink dark:text-white focus:outline-none focus:border-Amber/50 placeholder:text-Slate/40"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-Amber text-white text-sm font-medium hover:bg-Amber/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '推荐中...' : '推荐'}
            </button>
            <button
              onClick={handleRandom}
              disabled={loading}
              className="px-3 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-Slate hover:text-Amber hover:border-Amber/30 transition-colors"
              title="随机推荐"
            >
              <Shuffle size={16} />
            </button>
          </div>

          {/* Mood Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 mb-6">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.key}
                onClick={() => handleMoodSelect(mood.key)}
                disabled={loading}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                  selectedMood === mood.key
                    ? 'bg-Amber/10 border-Amber/30 dark:bg-Amber/10 dark:border-Amber/30'
                    : 'bg-white/40 dark:bg-white/[0.03] border-Sand dark:border-white/10 hover:border-Amber/20 dark:hover:border-white/20'
                } disabled:opacity-50`}
              >
                <span className="text-xl">{mood.icon}</span>
                <span className="text-xs font-medium text-Ink/70 dark:text-white/60">{mood.label}</span>
                <span className="text-[0.65rem] text-Slate/40 dark:text-white/30">{mood.desc}</span>
              </button>
            ))}
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-Slate/40 dark:text-white/30 flex items-center gap-1">
              <Tag size={12} />
              热门标签
            </span>
            {['诺兰', '宫崎骏', '科幻', '爱情', '悬疑', '经典', '治愈', '奥斯卡', '高分'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag)
                  setTimeout(() => handleSearch(), 0)
                }}
                className="px-2.5 py-1 rounded-full text-xs bg-white/40 dark:bg-white/[0.03] border border-Sand dark:border-white/10 text-Slate/60 hover:text-Amber hover:border-Amber/30 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Error */}
        {aiError && (
          <div className="mb-4 p-3 rounded-lg bg-Amber/10 border border-Amber/20 text-xs text-Amber/80">
            {aiError}
          </div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12 gap-3"
            >
              <div className="w-8 h-8 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-Slate/50 dark:text-white/40">
                {apiKey ? 'AI 正在为您分析心情并挑选电影...' : '正在为您挑选电影...'}
              </p>
            </motion.div>
          )}

          {!loading && hasSearched && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {/* Free AI Recommendation */}
              {freeRec && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 size={14} className="text-purple-400" />
                    <h3 className="text-sm font-medium text-Ink/70 dark:text-white/60">
                      AI 自由推荐（不限于片库）
                    </h3>
                  </div>
                  <FreeAIRecCard rec={freeRec} index={0} />
                </>
              )}

              {/* Local Library Recommendations */}
              {recommendations.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-Ink/70 dark:text-white/60">
                      {selectedMood
                        ? `「${MOOD_OPTIONS.find((m) => m.key === selectedMood)?.label}」推荐`
                        : searchQuery
                        ? `「${searchQuery}」搜索结果`
                        : '随机推荐'}
                    </h3>
                    <span className="text-xs text-Slate/40 dark:text-white/30">{recommendations.length} 部</span>
                  </div>
                  {recommendations.map((movie, i) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={i}
                      aiReason={aiRecommendations[movie.id]}
                      onSelect={setSelectedMovie}
                    />
                  ))}
                </>
              )}

              {recommendations.length === 0 && !freeRec && (
                <div className="text-center py-12">
                  <Film size={40} className="text-Slate/20 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-Slate/40 dark:text-white/30">没有找到匹配的电影，试试其他关键词</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Library Preview */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-Rose/60" />
                <span className="text-sm font-medium text-Ink/70 dark:text-white/60">精选片库</span>
              </div>
              <span className="text-xs text-Slate/40 dark:text-white/30">{MOVIE_LIBRARY.length} 部</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOVIE_LIBRARY.slice(0, 6).map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} onSelect={setSelectedMovie} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetail movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
