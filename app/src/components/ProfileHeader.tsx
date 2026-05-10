import { useState, useRef } from 'react'
import { Camera, Pencil, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { User } from '@/contexts/AuthContext'

interface ProfileHeaderProps {
  user: User
  onAvatarUpdate: (avatar: string) => void
  onUsernameUpdate: (username: string) => void
  t: (key: string) => string
}

export default function ProfileHeader({ user, onAvatarUpdate, onUsernameUpdate, t }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar)
  const [saved, setSaved] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [editUsername, setEditUsername] = useState(user.username)
  const [savedUsername, setSavedUsername] = useState(false)

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
    onAvatarUpdate(previewAvatar)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveUsername = () => {
    onUsernameUpdate(editUsername.trim() || user.username)
    setIsEditingUsername(false)
    setSavedUsername(true)
    setTimeout(() => setSavedUsername(false), 2000)
  }

  const handleCancelUsername = () => {
    setEditUsername(user.username)
    setIsEditingUsername(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-Linen/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl p-8 text-center"
    >
      <div className="relative inline-block">
        <div className="w-32 h-32 rounded-full overflow-hidden border-[3px] border-Amber shadow-medium">
          <img src={previewAvatar} alt={user.username} className="w-full h-full object-cover" />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-Amber text-Parchment flex items-center justify-center shadow-md hover:bg-[#B06A2F] transition-colors"
          title={t('profile.changeAvatar')}
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

      {previewAvatar !== user.avatar && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {saved && <span className="text-[0.8125rem] text-Sage">{t('profile.saved')}</span>}
          <button
            onClick={handleSaveAvatar}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"
          >
            <Save size={14} />
            {t('profile.saveAvatar')}
          </button>
        </div>
      )}

      <div className="mt-6">
        {isEditingUsername ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="px-3 py-1.5 text-center text-[1.25rem] font-semibold text-Ink dark:text-white bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
              autoFocus
            />
            <button
              onClick={handleSaveUsername}
              className="p-2 rounded-md bg-Sage text-Parchment hover:bg-[#5a7a5a] transition-colors"
              title={t('profile.save')}
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancelUsername}
              className="p-2 rounded-md bg-Linen border border-Sand text-Slate hover:border-Amber hover:text-Amber transition-colors dark:bg-white/10 dark:border-white/10"
              title={t('profile.cancel')}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-[1.5rem] font-semibold text-Ink dark:text-white">{user.username}</h2>
            <button
              onClick={() => setIsEditingUsername(true)}
              className="p-1.5 rounded-md text-Slate hover:text-Amber hover:bg-Amber/10 transition-colors"
              title={t('profile.editUsername')}
            >
              <Pencil size={16} />
            </button>
          </div>
        )}
        {savedUsername && (
          <p className="text-[0.8125rem] text-Sage mt-2">{t('profile.usernameSaved')}</p>
        )}
      </div>

      <p className="text-[0.9375rem] text-Slate mt-2">{user.userId}</p>
    </motion.div>
  )
}
