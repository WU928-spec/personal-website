import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/PreferencesContext'
import ProfileHeader from '@/components/ProfileHeader'
import ProfileSettings from '@/components/ProfileSettings'
import PageSEO from '@/components/PageSEO'

export default function Profile() {
  const { user, logout, updateAvatar, updateUsername } = useAuth()
  const { t, lang } = useLang()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-[60dvh] bg-Parchment dark:bg-Graphite flex items-center justify-center">
        <PageSEO
          title={t('profile.title')}
          description={t('profile.description')}
          path="/profile"
        />
        <div className="text-center">
          <p className="text-Slate font-body text-subhead">{t('profile.pleaseLogin')}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center bg-Amber text-Parchment font-ui text-caption font-semibold uppercase tracking-[0.05em] px-7 py-2 rounded-md hover:bg-primary transition-all duration-300"
          >
            {t('profile.goLogin')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-Parchment dark:bg-Graphite">
      <PageSEO
        title={t('profile.title')}
        description={t('profile.description')}
        path="/profile"
      />

      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-display font-medium text-Ink dark:text-white"
          >
            {t('profile.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-subhead leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body dark:text-white"
          >
            {t('profile.subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="space-y-6">
          <ProfileHeader
            user={user}
            onAvatarUpdate={updateAvatar}
            onUsernameUpdate={updateUsername}
            t={t}
          />

          <ProfileSettings lang={lang} t={t} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-between pt-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-Slate hover:text-Ink text-caption font-medium transition-colors dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              {t('profile.back')}
            </button>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-Rose/30 text-Rose hover:bg-Rose/10 text-caption font-medium transition-colors"
            >
              <LogOut size={16} />
              {t('profile.logout')}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
