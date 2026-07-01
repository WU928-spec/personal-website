import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '@/contexts/PreferencesContext'

interface BackToToolsProps {
  label?: string
  className?: string
}

export default function BackToTools({ label, className = '' }: BackToToolsProps) {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <button
      onClick={() => navigate('/tools')}
      className={`flex items-center gap-1.5 text-caption text-Slate hover:text-Amber transition-colors mb-4 ${className}`}
    >
      <ArrowLeft size={16} />
      {label ?? t('tools.title')}
    </button>
  )
}
