export default function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-8 border-l-2 border-Amber/70 bg-Amber/[0.035] py-3 pl-6 pr-5 text-Ink/70 dark:text-white/65">
      {children}
    </blockquote>
  )
}
