import type { FooterLink, FooterSocial } from '@/data/site'

const publicPaths = new Set(['/', '/moments', '/notes', '/tools'])
const placeholderSocialUrls = new Set(['https://twitter.com', 'https://linkedin.com'])

export function filterPublicFooterLinks(links: FooterLink[]): FooterLink[] {
  return links.filter((link) => publicPaths.has(link.path))
}

export function filterPublicSocials(socials: FooterSocial[]): FooterSocial[] {
  return socials.filter((social) =>
    !social.href.includes('example.com') && !placeholderSocialUrls.has(social.href.replace(/\/$/, '')),
  )
}
