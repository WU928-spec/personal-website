import { Helmet } from 'react-helmet-async'

interface PageSEOProps {
  title: string
  description?: string
  path?: string
}

const SITE_NAME = 'Vibecoding Garden'
const SITE_URL = 'https://vibecoding.com'
const DEFAULT_DESC = 'A digital garden of code, thoughts, and slow programming.'

export default function PageSEO({ title, description, path }: PageSEOProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`
  const desc = description || DEFAULT_DESC
  const url = path ? `${SITE_URL}${path}` : SITE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <link rel="canonical" href={url} />
    </Helmet>
  )
}
