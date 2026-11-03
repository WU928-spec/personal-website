const translations = {
  zh: {
    brandNote: '个人小站', home: '首页', moments: '动态', notes: '文章', tools: '小工具',
    footerNote: 'Jasper 的个人小站。', signature: '记录生活和学习',
    searchLabel: '搜索笔记和动态', searchPlaceholder: '输入关键词…',
  },
  en: {
    brandNote: 'Personal site', home: 'Home', moments: 'Moments', notes: 'Notes', tools: 'Tools',
    footerNote: "Jasper's personal site.", signature: 'Life and learning',
    searchLabel: 'Search notes and moments', searchPlaceholder: 'Type a keyword…',
  },
}

function preferredLanguage() {
  return localStorage.getItem('wuspace-lang') === 'en' ? 'en' : 'zh'
}

function applyLanguage(lang) {
  const dictionary = translations[lang]
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n
    if (dictionary[key]) element.textContent = dictionary[key]
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.dataset.i18nPlaceholder
    if (dictionary[key]) element.setAttribute('placeholder', dictionary[key])
  })
  const toggle = document.getElementById('language-toggle')
  if (toggle) toggle.textContent = lang === 'zh' ? 'EN' : '中'
}

function preferredTheme() {
  const saved = localStorage.getItem('wuspace-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  const toggle = document.getElementById('theme-toggle')
  if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式')
}

applyLanguage(preferredLanguage())
applyTheme(preferredTheme())

document.getElementById('language-toggle')?.addEventListener('click', () => {
  const lang = preferredLanguage() === 'zh' ? 'en' : 'zh'
  localStorage.setItem('wuspace-lang', lang)
  applyLanguage(lang)
})

document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('wuspace-theme', theme)
  applyTheme(theme)
})

const menuToggle = document.getElementById('menu-toggle')
const mobileNav = document.getElementById('mobile-nav')
menuToggle?.addEventListener('click', () => {
  const open = mobileNav?.hidden ?? true
  if (mobileNav) mobileNav.hidden = !open
  menuToggle.setAttribute('aria-expanded', String(open))
  menuToggle.textContent = open ? '×' : '☰'
})
