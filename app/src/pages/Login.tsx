import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'

export default function Login() {
  const { t } = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    const success = login(username.trim(), password)
    if (success) {
      navigate('/')
    } else {
      setError('用户名或密码错误')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-Parchment flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-Amber/10 mb-6">
            <LogIn size={28} className="text-Amber" />
          </div>
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-medium text-Ink">
            {t('login.welcomeBack')}
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-[1.65] text-Slate font-body">
            {t('login.loginDesc')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
              {t('login.username')}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-Slate/50" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="WU928-spec"
                className="w-full bg-Linen border border-Sand rounded-xl py-3 pl-11 pr-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-Slate/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full bg-Linen border border-Sand rounded-xl py-3 pl-11 pr-12 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-Slate/50 hover:text-Slate transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 font-medium text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] py-3.5 rounded-xl hover:bg-[#B06A2F] hover:shadow-amber hover:-translate-y-px transition-all duration-300"
          >
            {t('login.submit')}
          </button>
        </form>

        {/* Hint */}
        <div className="mt-8 p-4 bg-Linen rounded-xl border border-Sand">
          <p className="text-[0.8125rem] font-medium text-Slate mb-1">{t('login.testAccount')}</p>
          <p className="text-[0.8125rem] text-Slate/70 font-mono">{t('login.username')}：WU928-spec</p>
          <p className="text-[0.8125rem] text-Slate/70 font-mono">{t('login.password')}：vibecoding2025</p>
        </div>
      </motion.div>
    </div>
  )
}
