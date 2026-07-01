/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: 主色 (Amber) — CTA, 强调, 交互反馈
        // Secondary: 辅色 (Sage) — 成功, 正向状态
        // Accent: 强调色 (Rose) — 删除/警告, 情绪标记
        // Neutral: 中性色 (Slate) — 辅助文字, 次要信息
        // Text: 文字色 (Ink) — 主文字
        // Background: 背景色 (Parchment) — 页面底色
        // Surface: 表面色 (Linen) — 区块底色
        // Border: 边框色 (Sand) — 分隔线, 卡片边框
        // 灰阶: Mist 作为过渡色
        Parchment: 'rgba(var(--color-parchment), <alpha-value>)',
        Ink: 'rgba(var(--color-ink), <alpha-value>)',
        Amber: 'rgba(var(--color-amber), <alpha-value>)',
        Sage: 'rgba(var(--color-sage), <alpha-value>)',
        Slate: 'rgba(var(--color-slate), <alpha-value>)',
        Graphite: 'rgba(var(--color-graphite), <alpha-value>)',
        Linen: 'rgba(var(--color-linen), <alpha-value>)',
        Sand: 'rgba(var(--color-sand), <alpha-value>)',
        Mist: 'rgba(var(--color-mist), <alpha-value>)',
        Rose: 'rgba(var(--color-rose), <alpha-value>)',
        Gold: 'rgba(var(--color-gold), <alpha-value>)',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        ui: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '16px',
        'space-4': '24px',
        'space-5': '32px',
        'space-6': '48px',
        'space-7': '64px',
        'space-8': '96px',
      },
      fontSize: {
        'display': ['clamp(3.5rem, 7vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'heading': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'subhead': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'body': ['1rem', { lineHeight: '1.65', letterSpacing: '0' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        soft: "0 4px 24px rgba(30,28,26,0.06)",
        medium: "0 8px 32px rgba(30,28,26,0.1)",
        deep: "0 16px 48px rgba(30,28,26,0.14)",
        "amber": "0 8px 24px rgba(196,120,58,0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
