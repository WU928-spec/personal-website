import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail, Pencil, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/PreferencesContext'
import { type FooterData, loadFooter, saveFooter } from '@/data/site'

const iconMap: Record<string, React.ElementType> = {
  Github,
  Twitter,
  Linkedin,
  Mail,
}

export default function Footer() {
  const { t, lang } = useLang()
  const { isLoggedIn, isEditMode } = useAuth()
  const [data, setData] = useState<FooterData>(() => loadFooter(lang))
  useEffect(() => { setData(loadFooter(lang)) }, [lang])
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editZh, setEditZh] = useState<FooterData>(() => loadFooter('zh'))
  const [editEn, setEditEn] = useState<FooterData>(() => loadFooter('en'))

  const handleSave = () => {
    saveFooter({ zh: editZh, en: editEn })
    setData(lang === 'zh' ? editZh : editEn)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    const zh = loadFooter('zh')
    const en = loadFooter('en')
    setEditZh(zh)
    setEditEn(en)
    setIsEditing(false)
  }

  const updateLink = (langKey: 'zh' | 'en', i: number, field: 'path' | 'label', value: string) => {
    if (langKey === 'zh') {
      const next = { ...editZh, links: [...editZh.links] }
      next.links[i] = { ...next.links[i], [field]: value }
      setEditZh(next)
    } else {
      const next = { ...editEn, links: [...editEn.links] }
      next.links[i] = { ...next.links[i], [field]: value }
      setEditEn(next)
    }
  }

  const updateSocial = (langKey: 'zh' | 'en', i: number, field: 'href' | 'label', value: string) => {
    if (langKey === 'zh') {
      const next = { ...editZh, socials: [...editZh.socials] }
      next.socials[i] = { ...next.socials[i], [field]: value }
      setEditZh(next)
    } else {
      const next = { ...editEn, socials: [...editEn.socials] }
      next.socials[i] = { ...next.socials[i], [field]: value }
      setEditEn(next)
    }
  }

  const updateField = (langKey: 'zh' | 'en', field: 'brandDesc' | 'copyright' | 'tagline', value: string) => {
    if (langKey === 'zh') {
      setEditZh({ ...editZh, [field]: value })
    } else {
      setEditEn({ ...editEn, [field]: value })
    }
  }

  const display = isEditing ? (lang === 'zh' ? editZh : editEn) : data

  return (
    <footer className="bg-[#3D3A37] py-16 md:py-20 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Edit controls */}
        {isLoggedIn && isEditMode && (
          <div className="flex justify-end mb-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[0.8125rem] font-medium hover:bg-white/15 transition-colors"
              >
                <Pencil size={14} />
                {t('editor.editFooter')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {saved && <span className="text-[0.8125rem] text-Sage">{t('post.saved')}</span>}
                <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"><Save size={14} />{t('post.save')}</button>
                <button onClick={handleCancel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Graphite border border-white/20 text-white/70 text-[0.8125rem] font-medium hover:border-white/40 hover:text-white transition-colors"><X size={14} />{t('post.cancel')}</button>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          /* Edit mode — bilingual side by side */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Chinese editor */}
            <div className="bg-Graphite rounded-xl border border-white/10 p-5 space-y-4">
              <p className="font-ui text-[0.8125rem] uppercase tracking-[0.1em] text-Sage/80">中文</p>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.brandDesc')}</label>
                <input value={editZh.brandDesc} onChange={(e) => updateField('zh', 'brandDesc', e.target.value)} className="w-full bg-transparent font-body text-sm text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.copyright')}</label>
                <input value={editZh.copyright} onChange={(e) => updateField('zh', 'copyright', e.target.value)} className="w-full bg-transparent font-body text-sm text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.tagline')}</label>
                <input value={editZh.tagline} onChange={(e) => updateField('zh', 'tagline', e.target.value)} className="w-full bg-transparent font-body text-sm text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.navLinks')}</label>
                {editZh.links.map((link, i) => (
                  <div key={`zh-link-${i}`} className="flex gap-2">
                    <input value={link.label} onChange={(e) => updateLink('zh', i, 'label', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input value={link.path} onChange={(e) => updateLink('zh', i, 'path', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.socialLinks')}</label>
                {editZh.socials.map((social, i) => (
                  <div key={`zh-social-${i}`} className="flex gap-2">
                    <input value={social.label} onChange={(e) => updateSocial('zh', i, 'label', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input value={social.href} onChange={(e) => updateSocial('zh', i, 'href', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* English editor */}
            <div className="bg-Graphite rounded-xl border border-white/10 p-5 space-y-4">
              <p className="font-ui text-[0.8125rem] uppercase tracking-[0.1em] text-Sage/80">English</p>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.brandDesc')}</label>
                <input value={editEn.brandDesc} onChange={(e) => updateField('en', 'brandDesc', e.target.value)} className="w-full bg-transparent font-body text-sm text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.copyright')}</label>
                <input value={editEn.copyright} onChange={(e) => updateField('en', 'copyright', e.target.value)} className="w-full bg-transparent font-body text-sm text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.tagline')}</label>
                <input value={editEn.tagline} onChange={(e) => updateField('en', 'tagline', e.target.value)} className="w-full bg-transparent font-body text-sm text-white/70 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.navLinks')}</label>
                {editEn.links.map((link, i) => (
                  <div key={`en-link-${i}`} className="flex gap-2">
                    <input value={link.label} onChange={(e) => updateLink('en', i, 'label', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input value={link.path} onChange={(e) => updateLink('en', i, 'path', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="font-ui text-xs text-white/40">{t('editor.socialLinks')}</label>
                {editEn.socials.map((social, i) => (
                  <div key={`en-social-${i}`} className="flex gap-2">
                    <input value={social.label} onChange={(e) => updateSocial('en', i, 'label', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                    <input value={social.href} onChange={(e) => updateSocial('en', i, 'href', e.target.value)} className="flex-1 bg-transparent font-ui text-xs text-white/60 focus:outline-none border-b border-white/20 focus:border-Amber pb-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* View mode */
          <>
            {/* Top Row */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              {/* Brand */}
              <div className="flex flex-col gap-3">
                <img src="/logo.svg" alt="Logo" className="h-7 w-auto" />
                <p className="text-[0.9375rem] font-body leading-[1.65] text-[rgba(247,244,239,0.5)]">
                  {display.brandDesc}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {display.links.map((link) => (
                  <Link
                    key={`${link.path}-${link.label}`}
                    to={link.path}
                    className="font-ui text-[0.875rem] font-medium uppercase tracking-[0.06em] text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Social */}
              <div className="flex items-center gap-4">
                {display.socials.map((social) => {
                  const Icon = iconMap[social.icon] || Github
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgba(247,244,239,0.5)] hover:text-Amber hover:scale-110 transition-all duration-200"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(247,244,239,0.1)] my-10" />

            {/* Bottom Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="font-ui text-[0.8125rem] font-medium leading-[1.5] tracking-[0.04em] text-[rgba(247,244,239,0.5)]">
                {display.copyright}
              </p>
              <p className="font-mono text-[0.8125rem] leading-[1.5] text-[rgba(247,244,239,0.4)]">
                {display.tagline}
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
