import { filterPublicFooterLinks, filterPublicSocials } from './footerContent'

it('removes deleted routes and known placeholder social accounts from legacy settings', () => {
  expect(filterPublicFooterLinks([
    { path: '/', label: '首页' },
    { path: '/calendar', label: '任务' },
    { path: '/projects', label: '项目' },
    { path: '/tools', label: '小工具' },
  ]).map((link) => link.path)).toEqual(['/', '/tools'])

  expect(filterPublicSocials([
    { icon: 'Mail', href: 'mailto:hello@example.com', label: 'Mail' },
    { icon: 'Twitter', href: 'https://twitter.com', label: 'Twitter' },
    { icon: 'Linkedin', href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: 'Github', href: 'https://github.com/WU928-spec', label: 'GitHub' },
  ]).map((social) => social.label)).toEqual(['GitHub'])
})
