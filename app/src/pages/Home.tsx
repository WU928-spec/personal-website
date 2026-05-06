import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, ExternalLink, MapPin, Briefcase, Globe, Heart, Sparkles, Star, GitFork, Pencil, Save, X } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'
import { loadAbout, saveAbout, type AboutData } from '@/data/about'
import { loadHero, saveHero, type HeroData } from '@/data/site'
import { loadSkills, saveSkills, type SkillCategory } from '@/data/site'
import { loadGitHub, saveGitHub, type GitHubData, type GitHubRepo, type GitHubStats } from '@/data/site'
import PageSEO from '@/components/PageSEO'

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

function useTypingEffect(text: string, speed = 80, delay = 500) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let index = 0
    let cursorBlinks = 0
    let cursorInterval: ReturnType<typeof setInterval>

    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(typeInterval)
          // Cursor blinks 3 times then fades
          cursorInterval = setInterval(() => {
            cursorBlinks++
            setShowCursor((prev) => !prev)
            if (cursorBlinks >= 6) {
              clearInterval(cursorInterval)
              setShowCursor(false)
              setDone(true)
            }
          }, 500)
        }
      }, speed)

      return () => {
        clearInterval(typeInterval)
        clearInterval(cursorInterval)
      }
    }, delay)

    return () => {
      clearTimeout(startTimeout)
      clearInterval(cursorInterval)
    }
  }, [text, speed, delay])

  return { displayed, showCursor, done }
}

function HeroSection() {
  const { t, lang } = useLang()
  const { isLoggedIn, isEditMode } = useAuth()
  const headline = t('home.heroTitle')
  const { displayed, showCursor, done } = useTypingEffect(headline, 80, 600)

  const [hero, setHero] = useState<HeroData>(() => loadHero(lang))
  useEffect(() => { setHero(loadHero(lang)) }, [lang])
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editZh, setEditZh] = useState<HeroData>(() => loadHero('zh'))
  const [editEn, setEditEn] = useState<HeroData>(() => loadHero('en'))

  const handleSave = () => {
    saveHero({ zh: editZh, en: editEn })
    setHero(lang === 'zh' ? editZh : editEn)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    const zh = loadHero('zh')
    const en = loadHero('en')
    setEditZh(zh)
    setEditEn(en)
    setIsEditing(false)
  }

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-Parchment dark:bg-Graphite">

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        {/* Headline with typing */}
        <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-Ink dark:text-white">
          {displayed}
          {showCursor && (
            <span className="text-Amber animate-blink ml-0.5">|</span>
          )}
        </h1>

        {isEditing ? (
          <div className="mt-6 space-y-4 text-left">
            <div className="bg-Linen/80 backdrop-blur-md rounded-xl border border-Sand p-4">
              <p className="font-ui text-[0.75rem] uppercase tracking-[0.1em] text-Sage mb-2">中文</p>
              <input value={editZh.subtitle} onChange={(e) => setEditZh({ ...editZh, subtitle: e.target.value })} className="w-full bg-transparent font-body text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-2" />
              <textarea value={editZh.tagline} onChange={(e) => setEditZh({ ...editZh, tagline: e.target.value })} rows={2} className="w-full bg-transparent font-body text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y" />
            </div>
            <div className="bg-Linen/80 backdrop-blur-md rounded-xl border border-Sand p-4">
              <p className="font-ui text-[0.75rem] uppercase tracking-[0.1em] text-Sage mb-2">English</p>
              <input value={editEn.subtitle} onChange={(e) => setEditEn({ ...editEn, subtitle: e.target.value })} className="w-full bg-transparent font-body text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-2" />
              <textarea value={editEn.tagline} onChange={(e) => setEditEn({ ...editEn, tagline: e.target.value })} rows={2} className="w-full bg-transparent font-body text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y" />
            </div>
            <div className="flex justify-center gap-2">
              {saved && <span className="text-[0.8125rem] text-Sage self-center">{t('post.saved')}</span>}
              <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"><Save size={14} />{t('post.save')}</button>
              <button onClick={handleCancel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Linen border border-Sand text-Slate text-[0.8125rem] font-medium hover:border-Amber hover:text-Amber transition-colors"><X size={14} />{t('post.cancel')}</button>
            </div>
          </div>
        ) : (
          <>
            {/* Sub-line */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={done ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-[1.0625rem] leading-[1.75] text-Ink/85 mt-4 dark:text-white"
            >
              {hero.subtitle}
            </motion.p>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={done ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-[0.9375rem] leading-[1.65] text-Ink/70 max-w-xl mx-auto mt-4 dark:text-white"
            >
              {hero.tagline}
            </motion.p>
          </>
        )}

        {/* CTAs */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <Link
              to="/blog"
              className="inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] hover:shadow-amber hover:-translate-y-px transition-all duration-300"
            >
              {t('home.readBlog')}
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center border-[1.5px] border-Ink/80 text-Ink font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-Ink/10 hover:-translate-y-px transition-all duration-300 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {t('home.viewProjects')}
            </Link>
          </motion.div>
        )}

        {/* Edit button */}
        {isLoggedIn && isEditMode && !isEditing && (
          <div className="mt-6">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Ink/10 backdrop-blur-md border border-Ink/20 text-Ink text-[0.8125rem] font-medium hover:bg-Ink/15 transition-colors dark:bg-white/15 dark:text-white dark:border-white/25"
            >
              <Pencil size={14} />
              {t('post.edit')}
            </button>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2 animate-scroll-pulse">
            <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Ink/50 uppercase dark:text-white">
              {t('home.scroll')}
            </span>
            <ChevronDown size={20} className="text-Ink/50 dark:text-white" />
          </div>
        </motion.div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Introduction Card Section                                          */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, React.ElementType> = { MapPin, Briefcase, Globe, Heart, Sparkles }

function IntroSection() {
  const { t, lang } = useLang()
  const { isLoggedIn, isEditMode, user } = useAuth()
  const [about, setAbout] = useState<AboutData>(() => loadAbout(lang))
  useEffect(() => { setAbout(loadAbout(lang)) }, [lang])
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  /* Bilingual edit state */
  const [editZh, setEditZh] = useState<AboutData>(() => loadAbout('zh'))
  const [editEn, setEditEn] = useState<AboutData>(() => loadAbout('en'))

  const avatar = user?.avatar || localStorage.getItem('vibecoding_avatar') || '/avatar.jpg'

  const handleSave = () => {
    saveAbout('zh', editZh)
    saveAbout('en', editEn)
    setAbout(lang === 'zh' ? editZh : editEn)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    const zh = loadAbout('zh')
    const en = loadAbout('en')
    setEditZh(zh)
    setEditEn(en)
    setIsEditing(false)
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

  return (
    <section className="bg-Parchment py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Edit button */}
        {isLoggedIn && isEditMode && !isEditing && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Ink/10 backdrop-blur-md border border-Ink/20 text-Ink text-[0.8125rem] font-medium hover:bg-Ink/15 transition-colors"
            >
              <Pencil size={14} />
              {t('post.edit')}
            </button>
          </div>
        )}
        {isLoggedIn && isEditMode && isEditing && (
          <div className="flex justify-end mb-4 gap-2">
            {saved && <span className="text-[0.8125rem] text-Sage self-center">{t('post.saved')}</span>}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"
            >
              <Save size={14} />
              {t('post.save')}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Linen border border-Sand text-Slate text-[0.8125rem] font-medium hover:border-Amber hover:text-Amber transition-colors"
            >
              <X size={14} />
              {t('post.cancel')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="md:col-span-4 flex flex-col items-center"
          >
            <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-[3px] border-Amber shadow-medium">
              <img src={avatar} alt={t('profile.avatarAlt')} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 mt-6 w-full max-w-[280px]">
              {(isEditing ? editZh.fields : about.fields).map((field, i) => {
                const IconComp = iconMap[field.icon] || MapPin
                return (
                  <motion.div
                    key={field.icon + i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 * i,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="flex items-center gap-2 bg-Linen border border-Sand rounded-lg px-3 py-2"
                  >
                    <IconComp size={14} className="text-Slate shrink-0" />
                    {isEditing ? (
                      <input
                        value={field.value}
                        onChange={(e) => updateField('zh', i, 'value', e.target.value)}
                        className="w-full bg-transparent text-[0.8125rem] font-medium tracking-[0.04em] text-Slate focus:outline-none font-ui"
                      />
                    ) : (
                      <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                        {field.value}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="md:col-span-8"
          >
            {!isEditing && (
              <>
                <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
                  {t('home.aboutMe')}
                </p>
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink">
                  {about.title}
                </h2>
                <p className="font-body text-[1.0625rem] leading-[1.75] text-Ink mt-4 dark:text-white">
                  {about.p1}
                </p>
                <p className="font-body text-[1.0625rem] leading-[1.75] text-Ink mt-4 dark:text-white">
                  {about.p2}
                </p>
                <Link
                  to="/about"
                  className="inline-block mt-6 font-body text-[1rem] font-medium text-Amber hover:underline underline-offset-4 transition-all duration-300"
                >
                  {t('home.learnMore')}
                </Link>
              </>
            )}

            {isEditing && (
              <div className="space-y-6">
                {/* Chinese */}
                <div className="bg-Linen rounded-xl border border-Sand p-5">
                  <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-3">
                    中文
                  </p>
                  {editZh.fields.map((field, i) => {
                    const IconComp = iconMap[field.icon] || MapPin
                    return (
                      <div key={`zh-f-${i}`} className="flex items-center gap-2 mb-2">
                        <IconComp size={14} className="text-Slate shrink-0" />
                        <input
                          value={field.name}
                          onChange={(e) => updateField('zh', i, 'name', e.target.value)}
                          className="w-20 bg-transparent text-[0.8125rem] font-medium text-Slate focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui"
                        />
                        <input
                          value={field.value}
                          onChange={(e) => updateField('zh', i, 'value', e.target.value)}
                          className="flex-1 bg-transparent text-[0.8125rem] font-medium text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui"
                        />
                      </div>
                    )
                  })}
                  <input
                    value={editZh.title}
                    onChange={(e) => setEditZh({ ...editZh, title: e.target.value })}
                    className="w-full bg-transparent font-display text-[1.125rem] font-medium leading-[1.3] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 mt-2"
                  />
                  <textarea
                    value={editZh.p1}
                    onChange={(e) => setEditZh({ ...editZh, p1: e.target.value })}
                    rows={2}
                    className="w-full bg-transparent font-body text-[0.9375rem] leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 resize-y"
                  />
                  <textarea
                    value={editZh.p2}
                    onChange={(e) => setEditZh({ ...editZh, p2: e.target.value })}
                    rows={2}
                    className="w-full bg-transparent font-body text-[0.9375rem] leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y"
                  />
                </div>

                {/* English */}
                <div className="bg-Linen rounded-xl border border-Sand p-5">
                  <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-3">
                    English
                  </p>
                  {editEn.fields.map((field, i) => {
                    const IconComp = iconMap[field.icon] || MapPin
                    return (
                      <div key={`en-f-${i}`} className="flex items-center gap-2 mb-2">
                        <IconComp size={14} className="text-Slate shrink-0" />
                        <input
                          value={field.name}
                          onChange={(e) => updateField('en', i, 'name', e.target.value)}
                          className="w-20 bg-transparent text-[0.8125rem] font-medium text-Slate focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui"
                        />
                        <input
                          value={field.value}
                          onChange={(e) => updateField('en', i, 'value', e.target.value)}
                          className="flex-1 bg-transparent text-[0.8125rem] font-medium text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui"
                        />
                      </div>
                    )
                  })}
                  <input
                    value={editEn.title}
                    onChange={(e) => setEditEn({ ...editEn, title: e.target.value })}
                    className="w-full bg-transparent font-display text-[1.125rem] font-medium leading-[1.3] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 mt-2"
                  />
                  <textarea
                    value={editEn.p1}
                    onChange={(e) => setEditEn({ ...editEn, p1: e.target.value })}
                    rows={2}
                    className="w-full bg-transparent font-body text-[0.9375rem] leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 resize-y"
                  />
                  <textarea
                    value={editEn.p2}
                    onChange={(e) => setEditEn({ ...editEn, p2: e.target.value })}
                    rows={2}
                    className="w-full bg-transparent font-body text-[0.9375rem] leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Skill Constellation Section                                        */
/* ------------------------------------------------------------------ */

function SkillConstellationSection() {
  const { t } = useLang()
  const { isLoggedIn, isEditMode } = useAuth()
  const [categories, setCategories] = useState<SkillCategory[]>(() => loadSkills())
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveSkills(categories)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    setCategories(loadSkills())
    setIsEditing(false)
  }

  const updateSkill = (ci: number, si: number, name: string) => {
    const next = [...categories]
    next[ci] = { ...next[ci], skills: [...next[ci].skills] }
    next[ci].skills[si] = { ...next[ci].skills[si], name }
    setCategories(next)
  }

  return (
    <section className="bg-Linen py-20 md:py-28 relative">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        {/* Edit button */}
        {isLoggedIn && isEditMode && !isEditing && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Ink/10 backdrop-blur-md border border-Ink/20 text-Ink text-[0.8125rem] font-medium hover:bg-Ink/15 transition-colors"
            >
              <Pencil size={14} />
              {t('post.edit')}
            </button>
          </div>
        )}
        {isLoggedIn && isEditMode && isEditing && (
          <div className="flex justify-end mb-4 gap-2">
            {saved && <span className="text-[0.8125rem] text-Sage self-center">{t('post.saved')}</span>}
            <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"><Save size={14} />{t('post.save')}</button>
            <button onClick={handleCancel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Linen border border-Sand text-Slate text-[0.8125rem] font-medium hover:border-Amber hover:text-Amber transition-colors"><X size={14} />{t('post.cancel')}</button>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
            {t('home.whatIDo')}
          </p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink">
            {t('home.skillsTitle')}
          </h2>
          <p className="font-body text-[0.9375rem] leading-[1.65] text-Slate mt-2">
            {t('home.skillsDesc')}
          </p>
        </motion.div>

        {/* Skill cloud */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((cat, ci) =>
            cat.skills.map((skill, si) => (
              <motion.div
                key={`${cat.name}-${skill.name}-${ci}-${si}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: 0.06 * (ci * 4 + si),
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
                whileHover={isEditing ? undefined : {
                  y: -2,
                  boxShadow: '0 2px 8px rgba(196,120,58,0.1)',
                  borderColor: '#C4783A',
                }}
                className="inline-flex items-center gap-2 bg-Mist border border-Sand rounded-full px-4 py-1.5 transition-colors duration-200"
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                {isEditing ? (
                  <input
                    value={skill.name}
                    onChange={(e) => updateSkill(ci, si, e.target.value)}
                    className="bg-transparent font-ui font-medium tracking-[0.04em] text-Slate focus:outline-none text-[0.8125rem] w-20"
                  />
                ) : (
                  <span
                    className={`font-ui font-medium tracking-[0.04em] text-Slate ${
                      skill.size === 'lg' ? 'text-[0.9375rem]' : 'text-[0.8125rem]'
                    }`}
                  >
                    {skill.name}
                  </span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Blog Preview Section                                               */
/* ------------------------------------------------------------------ */
/*  GitHub Snapshot Section                                            */
/* ------------------------------------------------------------------ */

// Generate mock contribution data
function generateContributionGrid(): number[][] {
  const grid: number[][] = []
  for (let w = 0; w < 52; w++) {
    const week: number[] = []
    for (let d = 0; d < 7; d++) {
      const rand = Math.random()
      if (rand < 0.4) week.push(0)
      else if (rand < 0.6) week.push(1)
      else if (rand < 0.8) week.push(2)
      else week.push(3)
    }
    grid.push(week)
  }
  return grid
}

/* GitHub language color map */
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Ruby: '#701516',
  PHP: '#4F5D95',
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

function GitHubSnapshotSection() {
  const { t } = useLang()
  const { isLoggedIn, isEditMode } = useAuth()
  const [contributions, setContributions] = useState<number[][]>(() => generateContributionGrid())
  const [github, setGithub] = useState<GitHubData>(() => loadGitHub())
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editRepos, setEditRepos] = useState(github.repos)
  const [editStats, setEditStats] = useState(github.stats)

  /* Fetch real GitHub data */
  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/users/WU928-spec/repos?sort=updated&per_page=4')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data) || cancelled) return
        const repos: GitHubRepo[] = data.map((r: Record<string, unknown>) => ({
          name: String(r.name || ''),
          description: String(r.description || ''),
          language: String(r.language || 'Other'),
          languageColor: LANG_COLORS[String(r.language || '')] || '#8b949e',
          stars: Number(r.stargazers_count || 0),
          forks: Number(r.forks_count || 0),
          updated: formatRelativeDate(String(r.updated_at || '')),
        }))
        const totalStars = repos.reduce((s, r) => s + r.stars, 0)
        const stats: GitHubStats = { repos: data.length, stars: totalStars, streak: 0 }
        const updated = { repos, stats }
        setGithub(updated)
        setEditRepos(repos)
        setEditStats(stats)
      })
      .catch(() => {
        // fallback to local data
      })
    return () => { cancelled = true }
  }, [])

  /* Fetch real contribution graph */
  useEffect(() => {
    let cancelled = false
    fetch('https://github-contributions-api.deno.dev/WU928-spec.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.contributions) || cancelled) return
        const levelMap: Record<string, number> = {
          NONE: 0,
          FIRST_QUARTILE: 1,
          SECOND_QUARTILE: 2,
          THIRD_QUARTILE: 3,
          FOURTH_QUARTILE: 3,
        }
        const grid: number[][] = data.contributions.map((week: { contributionLevel: string }[]) =>
          week.map((day) => levelMap[day.contributionLevel] ?? 0)
        )
        setContributions(grid)
      })
      .catch(() => {
        // fallback to mock data
      })
    return () => { cancelled = true }
  }, [])

  const contributionColors = [
    'rgba(247,244,239,0.05)',
    'rgba(196,120,58,0.3)',
    'rgba(196,120,58,0.6)',
    'rgba(196,120,58,1)',
  ]

  const handleSave = () => {
    const updated = { repos: editRepos, stats: editStats }
    saveGitHub(updated)
    setGithub(updated)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    const data = loadGitHub()
    setEditRepos(data.repos)
    setEditStats(data.stats)
    setIsEditing(false)
  }

  const updateRepo = (i: number, field: keyof GitHubRepo, value: string | number) => {
    const next = [...editRepos]
    next[i] = { ...next[i], [field]: value }
    setEditRepos(next)
  }

  return (
    <section className="bg-Graphite py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Edit button */}
        {isLoggedIn && isEditMode && !isEditing && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[0.8125rem] font-medium hover:bg-white/15 transition-colors"
            >
              <Pencil size={14} />
              {t('post.edit')}
            </button>
          </div>
        )}
        {isLoggedIn && isEditMode && isEditing && (
          <div className="flex justify-end mb-4 gap-2">
            {saved && <span className="text-[0.8125rem] text-Sage self-center">{t('post.saved')}</span>}
            <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"><Save size={14} />{t('post.save')}</button>
            <button onClick={handleCancel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Graphite border border-white/20 text-white/70 text-[0.8125rem] font-medium hover:border-white/40 hover:text-white transition-colors"><X size={14} />{t('post.cancel')}</button>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage/80 mb-4">
            {t('home.openSource')}
          </p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-white">
            {t('home.buildingTitle')}
          </h2>
          <p className="font-body text-[0.9375rem] leading-[1.65] text-white/60 mt-2">
            {t('home.buildingDesc')}
          </p>
        </motion.div>

        {/* Contribution graph */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8"
          >
            <p className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-white/50 mb-3">
              {t('home.contributionActivity')}
            </p>
            <div className="flex gap-[3px] overflow-x-auto pb-2">
              {contributions.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((level, di) => (
                    <motion.div
                      key={di}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.3,
                        delay: 0.005 * (wi * 7 + di),
                        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                      }}
                      className="w-[10px] h-[10px] rounded-sm shrink-0"
                      style={{ backgroundColor: contributionColors[level] }}
                      title={`${level} ${t('github.contributions')}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pinned repos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {(isEditing ? editRepos : github.repos).map((repo, i) => (
            <motion.a
              key={repo.name}
              href={`https://github.com/WU928-spec/${repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 * i,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="block bg-Graphite/90 border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.15] hover:shadow-deep hover:-translate-y-[2px] transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              onClick={(e) => isEditing && e.preventDefault()}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input value={repo.name} onChange={(e) => updateRepo(i, 'name', e.target.value)} className="w-full bg-transparent font-mono text-[0.875rem] text-Amber focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  <textarea value={repo.description} onChange={(e) => updateRepo(i, 'description', e.target.value)} rows={2} className="w-full bg-transparent font-body text-[0.9375rem] text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1 resize-y" />
                  <div className="flex gap-2">
                    <input value={repo.language} onChange={(e) => updateRepo(i, 'language', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input value={repo.languageColor} onChange={(e) => updateRepo(i, 'languageColor', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input value={repo.updated} onChange={(e) => updateRepo(i, 'updated', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={repo.stars} onChange={(e) => updateRepo(i, 'stars', Number(e.target.value))} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input type="number" value={repo.forks} onChange={(e) => updateRepo(i, 'forks', Number(e.target.value))} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-[0.875rem] leading-[1.6] text-Amber">
                      {repo.name}
                    </h3>
                    <ExternalLink size={14} className="text-white/40" />
                  </div>
                  <p className="font-body text-[0.9375rem] leading-[1.65] text-white/70 mt-2 line-clamp-2">
                    {repo.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span className="font-ui text-[0.8125rem] tracking-[0.04em] text-white/60">
                        {repo.language}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-white/60">
                      <Star size={14} />
                      <span className="font-ui text-[0.8125rem] tracking-[0.04em]">{repo.stars}</span>
                    </span>
                    <span className="flex items-center gap-1 text-white/60">
                      <GitFork size={14} />
                      <span className="font-ui text-[0.8125rem] tracking-[0.04em]">{repo.forks}</span>
                    </span>
                    <span className="font-ui text-[0.8125rem] tracking-[0.04em] text-white/40 ml-auto">
                      {repo.updated}
                    </span>
                  </div>
                </>
              )}
            </motion.a>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {[
            { label: t('github.totalRepositories'), value: isEditing ? editStats.repos : github.stats.repos, key: 'repos' as const },
            { label: t('github.totalStars'), value: isEditing ? editStats.stars : github.stats.stars, key: 'stars' as const },
            { label: t('github.longestStreak'), value: isEditing ? editStats.streak : github.stats.streak, key: 'streak' as const },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-4 ${
                i < arr.length - 1 ? 'md:border-r md:border-white/10' : ''
              }`}
            >
              {isEditing ? (
                <input
                  type="number"
                  value={stat.value}
                  onChange={(e) => setEditStats({ ...editStats, [stat.key]: Number(e.target.value) })}
                  className="bg-transparent font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.1] text-Amber text-center w-32 focus:outline-none border-b border-white/20 focus:border-Amber"
                />
              ) : (
                <CountUpNumber value={stat.value} duration={1.5} />
              )}
              <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-white/50 mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-center mt-10"
          >
            <a
              href="https://github.com/WU928-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border-[1.5px] border-white/50 text-white font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-white hover:text-Graphite hover:border-white hover:-translate-y-px transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {t('home.viewFullProfile')}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function CountUpNumber({ value, duration }: { value: number; duration: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            // Gentle easing
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
            setCount(Math.floor(eased * value))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <div ref={ref} className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.1] text-Amber">
      {count.toLocaleString()}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div>
      <PageSEO
        title="Vibecoding Garden"
        description="A digital garden of code, thoughts, and slow programming. Explore blog posts, projects, and a Zettelkasten-inspired knowledge base."
      />
      <HeroSection />
      <IntroSection />
      <SkillConstellationSection />
      <GitHubSnapshotSection />
    </div>
  )
}
