export type Lang = 'zh' | 'en'

const translations = {
  zh: {
    // Navbar
    nav: {
      home: '首页',
      blog: '博客',
      projects: '项目',
      about: '关于',
      login: '登录',
      profile: '个人资料',
    },
    // Home
    home: {
      heroTitle: 'Hi, I\'m Alex',
      heroSubtitle: '开发者 · 写作者 · 数字园丁',
      heroDesc: '我构建东西，并写下我所学到的。欢迎来到我在互联网上的角落。',
      readBlog: '阅读博客',
      viewProjects: '查看项目',
      scroll: '滚动',
      aboutMe: '关于我',
      aboutTitle: '一个充满好奇心的开放建造者',
      aboutP1: '我相信通过实践学习和通过写作思考。这个网站是我的数字花园——一个随着时间增长的笔记、实验和项目的集合。这里的一切都是进行中的作品，这正是我喜欢它的方式。',
      aboutP2: '当我不在编码时，你会发现我在探索新想法、广泛阅读，或者追求一杯完美的咖啡。',
      learnMore: '了解更多关于我 →',
      whatIDo: '我所做的',
      skillsTitle: '工具、技能与技术',
      skillsDesc: '我在构建东西时依赖的技术栈',
      latestWriting: '最新文章',
      freshFromNotebook: '来自我的笔记本',
      viewAll: '查看全部 →',
      exploreArticles: '探索所有文章 →',
      openSource: '开源',
      buildingTitle: '我正在构建的',
      buildingDesc: '置顶项目和近期贡献',
      contributionActivity: '贡献活动',
      viewFullProfile: '查看完整资料 →',
    },
    // Blog
    blog: {
      garden: '花园',
      gardenDesc: '笔记、随笔和半成品的想法。这里的一切都是进行中的作品。',
      searchPlaceholder: '搜索文章...',
      articles: '篇文章',
      newestFirst: '最新优先',
      oldestFirst: '最早优先',
      loadMore: '加载更多文章',
      noArticles: '未找到文章',
      noArticlesDesc: '尝试不同的搜索词或分类',
    },
    // Blog Post
    post: {
      tagged: '标签：',
      share: '分享：',
      authorName: '数字园丁',
      authorDesc: '开发者、写作者和终身学习者。自2020年起公开培育想法。',
      continueReading: '继续阅读',
      moreFromGarden: '花园中的更多内容',
      previous: '上一篇',
      next: '下一篇',
      backToArticles: '返回所有文章',
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      saved: '已保存',
    },
    // Login
    login: {
      welcomeBack: '欢迎回来',
      loginDesc: '登录后可以编辑头像和文档内容',
      username: '用户名',
      password: '密码',
      submit: '登录',
      testAccount: '测试账号',
    },
    // Profile
    profile: {
      title: '个人资料',
      avatarSetting: '头像设置',
      avatarHint: '点击相机图标上传新头像',
      saveAvatar: '保存头像',
      saved: '已保存',
      accountInfo: '账号信息',
      username: '用户名',
      email: '邮箱',
      logout: '退出登录',
      pleaseLogin: '请先登录',
      goLogin: '去登录',
    },
    // Footer (common)
    common: {
      loading: '加载中...',
    },
  },
  en: {
    // Navbar
    nav: {
      home: 'Home',
      blog: 'Blog',
      projects: 'Projects',
      about: 'About',
      login: 'Login',
      profile: 'Profile',
    },
    // Home
    home: {
      heroTitle: 'Hi, I\'m Alex',
      heroSubtitle: 'Developer · Writer · Digital Gardener',
      heroDesc: 'I build things and write about what I learn. Welcome to my corner of the internet.',
      readBlog: 'Read My Blog',
      viewProjects: 'View Projects',
      scroll: 'Scroll',
      aboutMe: 'About Me',
      aboutTitle: 'A curious mind building in the open',
      aboutP1: 'I\'m a developer who believes in learning by doing and thinking by writing. This site is my digital garden — a collection of notes, experiments, and projects that grow over time. Everything here is a work in progress, and that\'s exactly how I like it.',
      aboutP2: 'When I\'m not coding, you\'ll find me exploring new ideas, reading widely, or chasing the perfect cup of coffee.',
      learnMore: 'Learn more about me →',
      whatIDo: 'What I Do',
      skillsTitle: 'Tools, skills & technologies',
      skillsDesc: 'The stack I reach for when building things',
      latestWriting: 'Latest Writing',
      freshFromNotebook: 'Fresh from my notebook',
      viewAll: 'View all →',
      exploreArticles: 'Explore all articles →',
      openSource: 'Open Source',
      buildingTitle: 'What I\'m building',
      buildingDesc: 'Pinned projects and recent contributions',
      contributionActivity: 'Contribution activity',
      viewFullProfile: 'View full profile →',
    },
    // Blog
    blog: {
      garden: 'The Garden',
      gardenDesc: 'Notes, essays, and half-baked ideas. Everything here is a work in progress.',
      searchPlaceholder: 'Search articles...',
      articles: 'article',
      newestFirst: 'Newest First',
      oldestFirst: 'Oldest First',
      loadMore: 'Load More Articles',
      noArticles: 'No articles found',
      noArticlesDesc: 'Try a different search or category',
    },
    // Blog Post
    post: {
      tagged: 'Tagged:',
      share: 'Share:',
      authorName: 'Digital Gardener',
      authorDesc: 'Developer, writer, and perennial learner. Cultivating ideas in public since 2020.',
      continueReading: 'Continue Reading',
      moreFromGarden: 'More from the garden',
      previous: 'Previous',
      next: 'Next',
      backToArticles: 'Back to all articles',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      saved: 'Saved',
    },
    // Login
    login: {
      welcomeBack: 'Welcome Back',
      loginDesc: 'Login to edit avatar and document content',
      username: 'Username',
      password: 'Password',
      submit: 'Login',
      testAccount: 'Test Account',
    },
    // Profile
    profile: {
      title: 'Profile',
      avatarSetting: 'Avatar Setting',
      avatarHint: 'Click camera icon to upload new avatar',
      saveAvatar: 'Save Avatar',
      saved: 'Saved',
      accountInfo: 'Account Info',
      username: 'Username',
      email: 'Email',
      logout: 'Logout',
      pleaseLogin: 'Please login first',
      goLogin: 'Go Login',
    },
    // Footer (common)
    common: {
      loading: 'Loading...',
    },
  },
} as const

export function t(key: string, lang: Lang): string {
  const keys = key.split('.')
  let value: unknown = translations[lang]
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof value === 'string' ? value : key
}

export { translations }
