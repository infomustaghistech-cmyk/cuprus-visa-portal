import { useEffect, useState } from 'react'
import { Menu, X, Languages } from 'lucide-react'
import { NAV_LINKS } from '../data/content'
import Logo from './Logo'

import { Globe } from 'lucide-react'

export default function Header({ page, user, onNavigate, onSignIn, onSignOut }) {
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [lang, setLang] = useState('ΕΛ')

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id) => { onNavigate(id); setOpen(false) }

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
        stuck ? 'border-b border-gray-200/80 shadow-sm' : 'border-b border-gray-100'
      }`}
    >
      <div className="container flex h-[70px] items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button onClick={() => go('home')} className="flex items-center gap-2.5 text-left" aria-label="Cyprus Visa Application Portal">
          <Logo size={36} />
          <div className="leading-tight">
            <span className="block font-display text-[15.5px] font-bold text-gray-900 tracking-tight">Cyprus Visa</span>
            <span className="block text-[11px] font-medium text-gray-500">Application Portal</span>
          </div>
        </button>

        {/* Navigation links */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              aria-current={page === link.id ? 'page' : undefined}
              className={`text-[14.5px] font-medium transition-colors ${
                page === link.id ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right action items */}
        <div className="hidden items-center gap-3.5 lg:flex">
          <button
            onClick={() => setLang(lang === 'ΕΛ' ? 'EN' : 'ΕΛ')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/90 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
            aria-label={`Switch language, currently ${lang}`}
          >
            <Globe size={14} className="text-gray-600" aria-hidden="true" />
            <span>{lang}</span>
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 truncate max-w-[140px]">{user.email}</span>
              <button onClick={onSignOut} className="text-xs font-semibold text-warn hover:underline">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button onClick={onSignIn} className="text-sm font-semibold text-gray-800 hover:text-black transition-colors px-2 py-1.5">
                Sign In
              </button>
              <button
                onClick={() => go('apply')}
                className="rounded-lg bg-[#0B1528] hover:bg-[#18263e] px-4.5 py-2 text-sm font-semibold text-white shadow-sm transition-all"
              >
                Create Account
              </button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-white lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  page === link.id ? 'bg-brand-50 text-ink' : 'text-ink-soft'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-2">
              <button
                onClick={() => setLang(lang === 'ΕΛ' ? 'EN' : 'ΕΛ')}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700"
              >
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-gray-600" aria-hidden="true" />
                  <span>Language</span>
                </span>
                <span className="font-bold text-amber-600">{lang}</span>
              </button>

              {user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-xs font-medium text-gray-600 truncate max-w-[180px]">{user.email}</span>
                  <button onClick={() => { onSignOut(); setOpen(false) }} className="text-xs font-semibold text-rose-600 hover:underline">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { onSignIn(); setOpen(false) }} className="flex-1 py-2.5 px-3 rounded-lg border border-gray-300 text-sm font-semibold text-gray-800 text-center">
                    Sign in
                  </button>
                  <button onClick={() => go('apply')} className="flex-1 py-2.5 px-3 rounded-lg bg-[#0B1528] text-sm font-semibold text-white text-center shadow-sm">
                    Create account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
