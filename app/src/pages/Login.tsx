import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/PreferencesContext'

export default function Login() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError(t('login.errorEmpty'))
      return
    }
    const success = login(email.trim(), password)
    if (success) {
      navigate('/')
    } else {
      setError(t('login.errorInvalid'))
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
          <h1 className="font-display text-heading font-medium text-Ink">
            {t('login.welcomeBack')}
          </h1>
          <p className="mt-2 text-caption leading-[1.65] text-Slate font-body">
            {t('login.loginDesc')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block font-ui text-caption font-medium tracking-[0.04em] text-Slate mb-2">
              {t('login.email')}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-Slate/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="w-full bg-Linen border border-Sand rounded-xl py-2 pl-11 pr-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-ui text-caption font-medium tracking-[0.04em] text-Slate mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-Slate/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full bg-Linen border border-Sand rounded-xl py-2 pl-11 pr-12 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
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
              className="text-caption text-red-600 font-medium text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-Amber text-Parchment font-ui text-caption font-semibold uppercase tracking-[0.05em] py-3.5 rounded-xl hover:bg-primary hover:-translate-y-px transition-all duration-300"
          >
            {t('login.submit')}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
