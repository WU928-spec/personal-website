import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const footerLinks = [
  { path: '/', label: 'Home' },
  { path: '/blog', label: 'Blog' },
  { path: '/projects', label: 'Projects' },
  { path: '/about', label: 'About' },
  { path: '/about', label: 'Contact' },
]

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="bg-[#3D3A37] py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <img src="/logo.svg" alt="Logo" className="h-7 w-auto" />
            <p className="text-[0.9375rem] font-body leading-[1.65] text-[rgba(247,244,239,0.5)]">
              A digital garden, growing in public.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={`${link.path}-${link.label}`}
                to={link.path}
                className="font-ui text-[0.875rem] font-medium uppercase tracking-[0.06em] text-white/60 hover:text-white transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(247,244,239,0.5)] hover:text-Amber hover:scale-110 transition-all duration-200"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(247,244,239,0.1)] my-10" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-ui text-[0.8125rem] font-medium leading-[1.5] tracking-[0.04em] text-[rgba(247,244,239,0.5)]">
            &copy; 2025 Digital Garden. All rights reserved.
          </p>
          <p className="font-mono text-[0.8125rem] leading-[1.5] text-[rgba(247,244,239,0.4)]">
            Built with curiosity and coffee.
          </p>
        </div>
      </div>
    </footer>
  )
}
