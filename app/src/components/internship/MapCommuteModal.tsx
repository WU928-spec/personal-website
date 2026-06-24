import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, Clock, Navigation } from 'lucide-react'
import { loadCommuteCache, saveCommuteCache } from './types'

const AMAP_KEY = '04ca7c41361cbc7fd6390dd1e6969c2f'

interface MapCommuteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (minutes: number) => void
  defaultDestination?: string
}

interface GeocodeResult {
  status: string
  geocodes?: Array<{
    location: string
  }>
}

interface TransitResult {
  status: string
  route?: {
    transits?: Array<{
      duration?: string
    }>
  }
}

export default function MapCommuteModal({
  isOpen,
  onClose,
  onConfirm,
  defaultDestination = '',
}: MapCommuteModalProps) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState(defaultDestination)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [routeDetail, setRouteDetail] = useState('')

  const hasKey = !!AMAP_KEY

  useEffect(() => {
    if (!isOpen) return
    const cache = loadCommuteCache()
    if (cache.defaultStart) setStart(cache.defaultStart)
    setEnd(defaultDestination)
    setResult(null)
    setError('')
    setRouteDetail('')
  }, [isOpen, defaultDestination])

  const geocode = async (address: string): Promise<[number, number] | null> => {
    if (!AMAP_KEY) return null
    const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMAP_KEY}&city=上海`
    const res = await fetch(url)
    const data = (await res.json()) as GeocodeResult
    if (data.status === '1' && data.geocodes && data.geocodes[0]) {
      const loc = data.geocodes[0].location
      const [lng, lat] = loc.split(',').map(Number)
      return [lng, lat]
    }
    return null
  }

  const planTransit = async (origin: [number, number], destination: [number, number]) => {
    if (!AMAP_KEY) return null
    const url = `https://restapi.amap.com/v3/direction/transit/integrated?origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&city=上海&key=${AMAP_KEY}`
    const res = await fetch(url)
    const data = (await res.json()) as TransitResult
    if (data.status === '1' && data.route?.transits && data.route.transits[0]) {
      const duration = data.route.transits[0].duration || '0'
      return Math.round(Number(duration) / 60)
    }
    return null
  }

  const handleCalc = async () => {
    if (!start || !end) {
      setError('请填写出发地和目的地')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const [startCoords, endCoords] = await Promise.all([
        geocode(start),
        geocode(end),
      ])
      if (!startCoords || !endCoords) {
        setError('地址解析失败，请检查地址是否正确')
        setLoading(false)
        return
      }
      const minutes = await planTransit(startCoords, endCoords)
      if (minutes === null) {
        setError('未找到可行的公交/地铁路线，请尝试手动输入')
      } else {
        setResult(minutes)
        setRouteDetail(`起点: ${start} → 终点: ${end}`)
        saveCommuteCache({ defaultStart: start })
      }
    } catch {
      setError('查询失败，请检查网络或手动输入')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0a0a15] backdrop-blur-xl p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="font-display text-white/90 text-lg tracking-[0.15em] mb-1">
              通勤时长计算
            </h2>
            <p className="text-white/30 text-xs font-body tracking-wider mb-6">
              基于高德地图公交/地铁路线规划
            </p>

            {!hasKey && (
              <div className="mb-4 p-3 rounded-lg bg-Amber/10 border border-Amber/20 text-Amber/70 text-xs font-body">
                未配置高德地图 Key，请手动输入通勤时长
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-white/50 text-xs font-body tracking-wider mb-2">
                  <Navigation size={12} />
                  出发地（你的住处）
                </label>
                <input
                  type="text"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="如：上海大学宝山校区"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white/50 text-xs font-body tracking-wider mb-2">
                  <MapPin size={12} />
                  目的地（公司地址）
                </label>
                <input
                  type="text"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="如：浦东新区张江高科"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 font-body placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400/70 text-xs font-body mb-4">{error}</p>
            )}

            {result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-Amber/60" />
                  <span className="text-white/70 text-sm font-body">
                    预计通勤时长（单程）
                  </span>
                </div>
                <p className="text-3xl font-display text-white/90 mb-1">
                  {result}
                  <span className="text-sm ml-1 text-white/50">分钟</span>
                </p>
                <p className="text-white/30 text-xs font-body">{routeDetail}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onConfirm(result)}
                    className="flex-1 py-2 rounded-lg bg-Amber/20 hover:bg-Amber/30 text-Amber/80 text-xs font-body tracking-wider transition-colors border border-Amber/20"
                  >
                    使用此时间
                  </button>
                  <button
                    onClick={() => {
                      setResult(null)
                      setRouteDetail('')
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-body tracking-wider transition-colors border border-white/10"
                  >
                    重新计算
                  </button>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleCalc}
              disabled={loading || !hasKey}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 tracking-wider font-body text-sm"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full"
                  />
                  <span>计算中...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>查询路线</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
