const sizes = {
  1: 'mt-10 mb-5 text-4xl leading-[1.2]',
  2: 'mt-12 mb-5 text-3xl leading-[1.25]',
  3: 'mt-9 mb-4 text-2xl leading-[1.35]',
  4: 'mt-7 mb-3 text-xl leading-[1.4]',
}

export default function makeHeading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const

  return function HeadingComponent({ children, id }: { children?: React.ReactNode; id?: string }) {
    return (
      <Tag id={id} className={`${sizes[level]} scroll-mt-24 font-display font-medium text-Ink dark:text-white`}>
        {children}
      </Tag>
    )
  }
}
