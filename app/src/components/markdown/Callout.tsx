import { Lightbulb, AlertTriangle, Info } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  note: <Info size={16} className="text-Sage shrink-0" />,
  tip: <Lightbulb size={16} className="text-Gold shrink-0" />,
  warning: <AlertTriangle size={16} className="text-Rose shrink-0" />,
  danger: <AlertTriangle size={16} className="text-Rose shrink-0" />,
  info: <Info size={16} className="text-Sage shrink-0" />,
  success: <Info size={16} className="text-Sage shrink-0" />,
  pdf: <Info size={16} className="text-Amber shrink-0" />,
}

const bgMap: Record<string, string> = {
  note: 'rgba(var(--color-sage), 0.12)',
  tip: 'rgba(var(--color-gold), 0.12)',
  warning: 'rgba(var(--color-rose), 0.12)',
  danger: 'rgba(var(--color-rose), 0.12)',
  info: 'rgba(var(--color-sage), 0.12)',
  success: 'rgba(var(--color-sage), 0.12)',
  pdf: 'rgba(var(--color-amber), 0.12)',
}

const borderMap: Record<string, string> = {
  note: '#6B8E6B',
  tip: '#C9A84C',
  warning: '#B8695A',
  danger: '#B8695A',
  info: '#6B8E6B',
  success: '#6B8E6B',
  pdf: '#C4783A',
}

export default function Callout({
  type,
  title,
  children,
}: {
  type: string
  title: string
  children: React.ReactNode
}) {
  const lowerType = type.toLowerCase()

  return (
    <div
      className="my-6 rounded-r-lg py-4 px-6"
      style={{
        background: bgMap[lowerType] || bgMap.note,
        borderLeft: `3px solid ${borderMap[lowerType] || borderMap.note}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-Ink">
        {iconMap[lowerType] || iconMap.note}
        <span>{title}</span>
      </div>
      <div className="text-Ink">{children}</div>
    </div>
  )
}
