import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Save, X, MapPin, Briefcase, Globe, Heart, Sparkles } from 'lucide-react'
import { type AboutData, loadAbout, saveAbout } from '@/data/about'
import type { Lang } from '@/i18n/translations'

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  Briefcase,
  Globe,
  Heart,
  Sparkles,
}

interface ProfileSettingsProps {
  lang: Lang
  t: (key: string) => string
}

export default function ProfileSettings({ lang, t }: ProfileSettingsProps) {
  const [about, setAbout] = useState<AboutData>(() => loadAbout(lang))
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editZh, setEditZh] = useState<AboutData>(() => loadAbout('zh'))
  const [editEn, setEditEn] = useState<AboutData>(() => loadAbout('en'))

  useEffect(() => {
    setAbout(loadAbout(lang))
  }, [lang])

  const handleSave = () => {
    saveAbout('zh', editZh)
    saveAbout('en', editEn)
    setAbout(lang === 'zh' ? editZh : editEn)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    setEditZh(loadAbout('zh'))
    setEditEn(loadAbout('en'))
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-Linen/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-subhead font-semibold text-Ink dark:text-white">{t('profile.aboutInfo')}</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-Ink/10 border border-Ink/20 text-Ink text-caption font-medium hover:bg-Ink/15 transition-colors dark:bg-white/15 dark:text-white dark:border-white/25"
          >
            <Pencil size={14} />
            {t('profile.edit')}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="bg-Linen rounded-xl border border-Sand p-5 dark:bg-white/5 dark:border-white/10">
            <p className="font-ui text-caption font-medium uppercase tracking-[0.1em] text-Sage mb-3">中文</p>
            {editZh.fields.map((field, i) => {
              const IconComp = iconMap[field.icon] || MapPin
              return (
                <div key={`zh-f-${i}`} className="flex items-center gap-2 mb-2">
                  <IconComp size={14} className="text-Slate shrink-0" />
                  <input
                    value={field.name}
                    onChange={(e) => updateField('zh', i, 'name', e.target.value)}
                    className="w-20 bg-transparent text-caption font-medium text-Slate focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui dark:border-white/10"
                  />
                  <input
                    value={field.value}
                    onChange={(e) => updateField('zh', i, 'value', e.target.value)}
                    className="flex-1 bg-transparent text-caption font-medium text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui dark:text-white dark:border-white/10"
                  />
                </div>
              )
            })}
            <input
              value={editZh.title}
              onChange={(e) => setEditZh({ ...editZh, title: e.target.value })}
              className="w-full bg-transparent font-display text-subhead font-medium leading-[1.3] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 mt-2 dark:text-white dark:border-white/10"
            />
            <textarea
              value={editZh.p1}
              onChange={(e) => setEditZh({ ...editZh, p1: e.target.value })}
              rows={2}
              className="w-full bg-transparent font-body text-body leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 resize-y dark:text-white dark:border-white/10"
            />
            <textarea
              value={editZh.p2}
              onChange={(e) => setEditZh({ ...editZh, p2: e.target.value })}
              rows={2}
              className="w-full bg-transparent font-body text-body leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y dark:text-white dark:border-white/10"
            />
          </div>

          <div className="bg-Linen rounded-xl border border-Sand p-5 dark:bg-white/5 dark:border-white/10">
            <p className="font-ui text-caption font-medium uppercase tracking-[0.1em] text-Sage mb-3">English</p>
            {editEn.fields.map((field, i) => {
              const IconComp = iconMap[field.icon] || MapPin
              return (
                <div key={`en-f-${i}`} className="flex items-center gap-2 mb-2">
                  <IconComp size={14} className="text-Slate shrink-0" />
                  <input
                    value={field.name}
                    onChange={(e) => updateField('en', i, 'name', e.target.value)}
                    className="w-20 bg-transparent text-caption font-medium text-Slate focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui dark:border-white/10"
                  />
                  <input
                    value={field.value}
                    onChange={(e) => updateField('en', i, 'value', e.target.value)}
                    className="flex-1 bg-transparent text-caption font-medium text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 font-ui dark:text-white dark:border-white/10"
                  />
                </div>
              )
            })}
            <input
              value={editEn.title}
              onChange={(e) => setEditEn({ ...editEn, title: e.target.value })}
              className="w-full bg-transparent font-display text-subhead font-medium leading-[1.3] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 mt-2 dark:text-white dark:border-white/10"
            />
            <textarea
              value={editEn.p1}
              onChange={(e) => setEditEn({ ...editEn, p1: e.target.value })}
              rows={2}
              className="w-full bg-transparent font-body text-body leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 mb-3 resize-y dark:text-white dark:border-white/10"
            />
            <textarea
              value={editEn.p2}
              onChange={(e) => setEditEn({ ...editEn, p2: e.target.value })}
              rows={2}
              className="w-full bg-transparent font-body text-body leading-[1.65] text-Ink focus:outline-none border-b border-Sand focus:border-Amber pb-1 resize-y dark:text-white dark:border-white/10"
            />
          </div>

          <div className="flex justify-end gap-2">
            {saved && <span className="text-caption text-Sage self-center">{t('profile.saved')}</span>}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-Sage text-Parchment text-caption font-medium hover:bg-primary transition-colors"
            >
              <Save size={14} />
              {t('profile.save')}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-Linen border border-Sand text-Slate text-caption font-medium hover:border-Amber hover:text-Amber transition-colors dark:bg-white/10 dark:border-white/10"
            >
              <X size={14} />
              {t('profile.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            {about.fields.map((field, i) => {
              const IconComp = iconMap[field.icon] || MapPin
              return (
                <div key={i} className="flex items-center gap-2 bg-Linen border border-Sand rounded-lg px-4 py-2 dark:bg-Graphite/50 dark:border-white/10">
                  <IconComp size={14} className="text-Slate shrink-0" />
                  <span className="font-ui text-caption font-medium tracking-[0.04em] text-Slate">
                    {field.value}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-6">
            <h4 className="font-display text-subhead font-medium text-Ink mb-2 dark:text-white">{about.title}</h4>
            <p className="font-body text-body leading-[1.65] text-Ink dark:text-white">{about.p1}</p>
            <p className="font-body text-body leading-[1.65] text-Ink mt-3 dark:text-white">{about.p2}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
