import { useLang } from '@/contexts/LangContext'

export default function About() {
  const { t } = useLang()
  return (
    <div className="min-h-[60dvh] flex items-center justify-center bg-Parchment pt-24">
      <div className="text-center">
        <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium text-Ink mb-4">
          {t('about.title')}
        </h1>
        <p className="font-body text-[1.0625rem] leading-[1.75] text-Slate">
          {t('about.comingSoon')}
        </p>
      </div>
    </div>
  )
}
