import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, LogOut, User, Mail, Save, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'

export default function Profile() {
  const { user, logout, updateAvatar } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '/avatar.jpg')
  const [saved, setSaved] = useState(false)

  if (!user) {
    return (
      <div className="min-h-[60dvh] bg-Parchment flex items-center justify-center">
        <div className="text-center">
          <p className="text-Slate font-body text-lg">{t('profile.pleaseLogin')}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] transition-all duration-300"
          >
            {t('profile.goLogin')}
          </button>
        </div>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPreviewAvatar(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateAvatar(previewAvatar)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-[100dvh] bg-Parchment pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6 md:px-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-Slate hover:text-Amber transition-colors mb-8 font-body"
        >
          <ArrowLeft size={16} />
          {t('profile.back')}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <h1 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium text-Ink mb-8">
            {t('profile.title')}
          </h1>

          {/* Avatar Section */}
          <div className="bg-Linen rounded-xl border border-Sand p-8 mb-6">
            <h2 className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-6">
              {t('profile.avatarSetting')}
            </h2>

            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={previewAvatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-Amber shadow-medium"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-Amber rounded-full flex items-center justify-center text-Parchment hover:bg-[#B06A2F] transition-colors shadow-md"
                >
                  <Camera size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <p className="mt-4 text-[0.8125rem] text-Slate text-center">
                {t('profile.avatarHint')}
              </p>

              {previewAvatar !== user.avatar && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSave}
                  className="mt-4 inline-flex items-center gap-2 bg-Sage text-Parchment font-ui text-[0.875rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#5a7a5a] transition-all duration-300"
                >
                  <Save size={16} />
                  {saved ? t('profile.saved') : t('profile.saveAvatar')}
                </motion.button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-Linen rounded-xl border border-Sand p-8 mb-6">
            <h2 className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-6">
              {t('profile.accountInfo')}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-Mist flex items-center justify-center">
                  <User size={18} className="text-Slate" />
                </div>
                <div>
                  <p className="text-[0.8125rem] text-Slate font-medium">{t('profile.username')}</p>
                  <p className="text-Ink font-body">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-Mist flex items-center justify-center">
                  <Mail size={18} className="text-Slate" />
                </div>
                <div>
                  <p className="text-[0.8125rem] text-Slate font-medium">{t('profile.email')}</p>
                  <p className="text-Ink font-body">15258743752@163.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border-[1.5px] border-red-300 text-red-600 font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] py-3.5 rounded-xl hover:bg-red-50 transition-all duration-300"
          >
            <LogOut size={16} />
            {t('profile.logout')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
