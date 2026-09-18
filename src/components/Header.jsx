import { useState } from 'react'
import { Globe, Menu, X, LogOut, User } from 'lucide-react'
import { NAV_LINKS } from '../data/content'
import Logo from './Logo'

export default function Header({ page, user, onNavigate, onSignIn, onSignOut }) {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('ΕΛ')

  const go = (id) => {
    onNavigate(id)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      {/* Top Brand Accent Line */}
      <div className="h-1 bg-[#D97706]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Title */}
          <button onClick={() => go('home')} className="flex items-center gap-3 text-left" aria-label="Cyprus Visa Portal">
            <Logo size={40} className="h-10 w-10 shrink-0" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Cyprus Visa</p>
              <p className="text-xs text-gray-500">Application Portal</p>
            </div>
          </button>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                aria-current={page === link.id ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  page === link.id
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'ΕΛ' ? 'EN' : 'ΕΛ')}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 rounded-lg px-3 gap-1.5 text-gray-700 shadow-2xs"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5 text-gray-600" />
              <span className="font-semibold">{lang}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/80 rounded-lg px-3 h-9">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-gray-700 truncate max-w-[130px]" title={user.email}>
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
                  title="Sign out"
                >
                  <LogOut size={12} />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:bg-gray-100 hover:text-gray-900 h-9 rounded-lg px-3 text-gray-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => go('apply')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-[#0B1528] text-white hover:bg-[#16243d] h-9 rounded-lg px-3 shadow-sm"
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions Header */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setLang(lang === 'ΕΛ' ? 'EN' : 'ΕΛ')}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all active:scale-[0.98] border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-9 rounded-lg px-3 gap-1.5 text-gray-700 shadow-2xs"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5 text-gray-600" />
              <span className="font-semibold">{lang}</span>
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  page === link.id ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{user.email}</span>
                  <button onClick={() => { onSignOut(); setOpen(false) }} className="text-xs font-semibold text-rose-600 hover:underline">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onSignIn(); setOpen(false) }}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-800 text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => go('apply')}
                    className="flex-1 py-2 rounded-lg bg-[#0B1528] text-sm font-semibold text-white text-center shadow-sm"
                  >
                    Create Account
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
