import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, X, Sparkles, KeyRound } from 'lucide-react'

const CORRECT_PASSWORD = '212121'
const PASSWORD_VERIFIED_KEY = 'easter-egg-password-verified'

interface EasterEggPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

export function checkPasswordVerified(): boolean {
  try {
    return sessionStorage.getItem(PASSWORD_VERIFIED_KEY) === 'true'
  } catch {
    return false
  }
}

export function markPasswordVerified() {
  try {
    sessionStorage.setItem(PASSWORD_VERIFIED_KEY, 'true')
  } catch {
    // ignore
  }
}

export default function EasterEggPasswordModal({
  isOpen,
  onClose,
  onVerified,
}: EasterEggPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动聚焦
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 键盘 ESC 关闭
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      markPasswordVerified()
      onVerified()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPassword(val)
    if (error) setError(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.length === 6) {
      handleSubmit()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-[#0a0a15] backdrop-blur-xl p-8 shadow-2xl ${shake ? 'animate-shake' : ''}`}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
              aria-label="关闭"
            >
              <X size={18} />
            </button>

            {/* 图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <KeyRound size={24} className="text-white/50" />
              </div>
            </div>

            {/* 标题 */}
            <h2 className="text-center font-display text-white/90 text-lg tracking-[0.15em] mb-2">
              星空彩蛋
            </h2>
            <p className="text-center text-white/40 text-xs font-body tracking-wider mb-8">
              输入密码以进入这片星空
            </p>

            {/* 密码输入 */}
            <div className="relative mb-2">
              <div className="flex items-center justify-center gap-3 mb-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      password.length > i
                        ? 'border-white/30 bg-white/5 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/20'
                    } ${error && password.length === 6 ? 'border-red-400/40' : ''}`}
                  >
                    <span className="text-lg font-body">
                      {password.length > i ? '●' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                autoComplete="off"
              />
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-red-400/70 text-xs font-body tracking-wider mb-4"
                >
                  密码错误，请重试
                </motion.p>
              )}
            </AnimatePresence>

            {/* 确认按钮 */}
            <button
              onClick={handleSubmit}
              disabled={password.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 tracking-wider font-body text-sm"
            >
              <Lock size={14} />
              <span>进入星空</span>
              <ArrowRight size={14} />
            </button>

            {/* 底部装饰 */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-6 h-px bg-gradient-to-r from-transparent to-white/10" />
              <Sparkles size={10} className="text-white/15" />
              <div className="w-6 h-px bg-gradient-to-l from-transparent to-white/10" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
