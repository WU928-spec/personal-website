import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera, LogOut, User, Mail, Save, ArrowLeft,
  MapPin, Briefcase, Globe, Heart, Sparkles, Pencil, X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import { type AboutData, loadAbout, saveAbout } from '@/data/about'

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Briefcase,
  Globe,
  Heart,
  Sparkles,
}

export default function Profile() {
  const { user, logout, updateAvatar } = useAuth()
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || localStorage.getItem('vibecoding_avatar') || '/avatar.jpg')
  const [saved, setSaved] = useState(false)

  /* About data */
  const [about, setAbout] = useState<AboutData>(() => loadAbout(lang))
  useEffect(() => { setAbout(loadAbout(lang)) }, [lang])
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [savedAbout, setSavedAbout] = useState(false)
  const [editZh, setEditZh] = useState<AboutData>(() => loadAbout('zh'))
  const [editEn, setEditEn] = useState<AboutData>(() => loadAbout('en'))

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

  /* Avatar handlers */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewAvatar(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = () => {
    updateAvatar(previewAvatar)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  /* About handlers */
  const handleSaveAbout = () => {
    saveAbout('zh', editZh)
    saveAbout('en', editEn)
    setAbout(lang === 'zh' ? editZh : editEn)
    setIsEditingAbout(false)
    setSavedAbout(true)
    setTimeout(() => setSavedAbout(false), 2000)
  }

  const handleCancelAbout = () => {
    setEditZh(loadAbout('zh'))
    setEditEn(loadAbout('en'))
    setIsEditingAbout(false)
  }

  const updateField = (langKey: 'zh' | 'en', i: number, key: 'name' | 'value', val: string) => {
    if (langKey === 'zh') {
      const next = [...editZh.fields]
      next[i] = { ...next[i], [key]: val }
      setEditZh({ ...editZh, fields: next })
    } else {
      const next = [...editEn.fields]
      next[i] = { ...next[i], [key]: val }
      setEditEn({ ...editEn, fields: next })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const display = isEditingAbout ? (lang === 'zh' ? editZh : editEn) : about

  return (
    <div className="min-h-[100dvh] bg-Parchment pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
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
                  alt={t('profile.avatarAlt')}
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
                  onClick={handleSaveAvatar}
                  className="mt-4 inline-flex items-center gap-2 bg-Sage text-Parchment font-ui text-[0.875rem] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#5a7a5a] transition-all duration-300"
                >
                  <Save size={16} />
                  {saved ? t('profile.saved') : t('profile.saveAvatar')}
                </motion.button>
              )}
            </div>
          </div>

          {/* Personal Info Section — list style like account info */}
          <div className="bg-Linen rounded-xl border border-Sand p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage">
                {t('home.aboutMe')}
              </h2>
              {!isEditingAbout ? (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Ink/10 border border-Ink/20 text-Ink text-[0.8125rem] font-medium hover:bg-Ink/15 transition-colors"
                >
                  <Pencil size={14} />
                  {t('post.edit')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {savedAbout && <span className="text-[0.8125rem] text-Sage">{t('post.saved')}</span>}
                  <button onClick={handleSaveAbout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"><Save size={14} />{t('post.save')}</button>
                  <button onClick={handleCancelAbout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Linen border border-Sand text-Slate text-[0.8125rem] font-medium hover:border-Amber hover:text-Amber transition-colors"><X size={14} />{t('post.cancel')}</button>
                </div>
              )}
            </div>

            {isEditingAbout ? (
              /* Bilingual edit */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chinese */}
                <div className="space-y-4">
                  <p className="font-ui text-[0.8125rem] uppercase tracking-[0.1em] text-Sage">中文</p>
                  {editZh.fields.map((field, i) => {
                    const IconComp = iconMap[field.icon] || MapPin
                    return (
                      <div key={`zh-f-${i}`} className="flex items-center gap-3 bg-Mist rounded-lg px-3 py-2.5">
                        <div className="w-9 h-9 rounded-lg bg-Parchment flex items-center justify-center shrink-0">
                          <IconComp size={16} className="text-Slate" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            value={field.name}
                            onChange={(e) => updateField('zh', i, 'name', e.target.value)}
                            className="block w-full bg-transparent text-[0.75rem] font-medium text-Slate focus:outline-none border-b border-transparent focus:border-Amber font-ui"
                          />
                          <input
                            value={field.value}
                            onChange={(e) => updateField('zh', i, 'value', e.target.value)}
                            className="block w-full bg-transparent text-[0.9375rem] font-body text-Ink focus:outline-none border-b border-transparent focus:border-Amber"
                          />
                        </div>
                      </div>
                    )
                  })}
                  <input
                    value={editZh.title}
                    onChange={(e) => setEditZh({ ...editZh, title: e.target.value })}
                    className="w-full bg-transparent font-display text-lg font-medium text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1"
                  />
                  <textarea
                    value={editZh.p1}
                    onChange={(e) => setEditZh({ ...editZh, p1: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent font-body text-[0.9375rem] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y"
                  />
                  <textarea
                    value={editZh.p2}
                    onChange={(e) => setEditZh({ ...editZh, p2: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent font-body text-[0.9375rem] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y"
                  />
                </div>
                {/* English */}
                <div className="space-y-4">
                  <p className="font-ui text-[0.8125rem] uppercase tracking-[0.1em] text-Sage">English</p>
                  {editEn.fields.map((field, i) => {
                    const IconComp = iconMap[field.icon] || MapPin
                    return (
                      <div key={`en-f-${i}`} className="flex items-center gap-3 bg-Mist rounded-lg px-3 py-2.5">
                        <div className="w-9 h-9 rounded-lg bg-Parchment flex items-center justify-center shrink-0">
                          <IconComp size={16} className="text-Slate" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            value={field.name}
                            onChange={(e) => updateField('en', i, 'name', e.target.value)}
                            className="block w-full bg-transparent text-[0.75rem] font-medium text-Slate focus:outline-none border-b border-transparent focus:border-Amber font-ui"
                          />
                          <input
                            value={field.value}
                            onChange={(e) => updateField('en', i, 'value', e.target.value)}
                            className="block w-full bg-transparent text-[0.9375rem] font-body text-Ink focus:outline-none border-b border-transparent focus:border-Amber"
                          />
                        </div>
                      </div>
                    )
                  })}
                  <input
                    value={editEn.title}
                    onChange={(e) => setEditEn({ ...editEn, title: e.target.value })}
                    className="w-full bg-transparent font-display text-lg font-medium text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1"
                  />
                  <textarea
                    value={editEn.p1}
                    onChange={(e) => setEditEn({ ...editEn, p1: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent font-body text-[0.9375rem] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y"
                  />
                  <textarea
                    value={editEn.p2}
                    onChange={(e) => setEditEn({ ...editEn, p2: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent font-body text-[0.9375rem] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y"
                  />
                </div>
              </div>
            ) : (
              /* Display — list style like account info */
              <div className="space-y-4">
                {display.fields.map((field, i) => {
                  const IconComp = iconMap[field.icon] || MapPin
                  return (
                    <div key={field.icon + i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-Mist flex items-center justify-center">
                        <IconComp size={18} className="text-Slate" />
                      </div>
                      <div>
                        <p className="text-[0.8125rem] text-Slate font-medium">{field.name}</p>
                        <p className="text-Ink font-body">{field.value}</p>
                      </div>
                    </div>
                  )
                })}
                <div className="pt-4 border-t border-Sand">
                  <h3 className="font-display text-[clamp(1.125rem,1.5vw,1.35rem)] font-medium text-Ink mb-2">
                    {display.title}
                  </h3>
                  <p className="font-body text-[1rem] leading-[1.75] text-Ink">{display.p1}</p>
                  <p className="font-body text-[1rem] leading-[1.75] text-Ink mt-2">{display.p2}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Info */}
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
