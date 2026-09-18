import { useState } from 'react'
import { ArrowRight, Menu, X, LogOut, User, Globe } from 'lucide-react'
import Logo from './Logo'

export default function Header({ page, user, onNavigate, onSignIn, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState('EN')

  const go = (id) => {
    onNavigate(id)
    setMobileOpen(false)
  }

  const navItems = [
    { id: 'services', label: 'Services', action: () => go('status') },
    { id: 'websites', label: 'Websites', action: () => go('home') },
    { id: 'news', label: 'News', action: () => go('home') },
    { id: 'government', label: 'Government', action: () => go('contact') }
  ]

  return (
    <header className="bg-[#183048] text-white border-b border-[#244260] sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2.5 pb-1 flex justify-end items-center text-xs">
        {user ? (
          <div className="flex items-center gap-3 text-slate-200">
            <span className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              {user.name || user.email}
            </span>
            <button
              onClick={onSignOut}
              className="text-slate-300 hover:text-white inline-flex items-center gap-1 underline underline-offset-2"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="group flex items-center gap-1.5 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
          >
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            <span>Cy Login Service</span>
          </button>
        )}
      </div>

      {/* Main Gov.cy Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo & Emblem */}
          <button
            onClick={() => go('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded py-1"
            aria-label="gov.cy Republic of Cyprus"
          >
            <Logo size={42} light={true} />
          </button>

          {/* Right Language Selector & Mobile Menu Trigger */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center text-xs font-semibold tracking-wider text-slate-300">
              <button
                onClick={() => setLang('EL')}
                className={`px-1.5 py-0.5 transition-colors ${
                  lang === 'EL' ? 'text-white font-bold' : 'hover:text-white text-slate-400'
                }`}
              >
                EL
              </button>
              <span className="text-slate-500">|</span>
              <button
                onClick={() => setLang('EN')}
                className={`px-1.5 py-0.5 transition-colors ${
                  lang === 'EN' ? 'text-white font-bold' : 'hover:text-white text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-slate-300 hover:text-white md:hidden rounded focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Header Tabs Navigation */}
        <nav className="hidden md:flex items-center gap-1 mt-2 -mb-px border-t border-[#233d59] pt-1">
          {navItems.map((item) => {
            const isActive =
              (item.id === 'services' && (page === 'status' || page === 'apply')) ||
              (item.id === 'websites' && page === 'home') ||
              (item.id === 'government' && page === 'contact')

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-white font-semibold bg-[#223d5a]/60 rounded-t-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                    : 'text-slate-300 hover:text-white hover:bg-[#203955]/40 rounded-t-sm'
                }`}
              >
                {item.label}
              </button>
            )
          })}

          <div className="ml-auto flex items-center gap-2 py-1 text-xs">
            <button
              onClick={() => go('apply')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                page === 'apply'
                  ? 'bg-white text-[#183048]'
                  : 'bg-[#274669] text-white hover:bg-[#315680]'
              }`}
            >
              Apply for Visa
            </button>
            <button
              onClick={() => go('status')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                page === 'status'
                  ? 'bg-white text-[#183048]'
                  : 'bg-[#274669] text-white hover:bg-[#315680]'
              }`}
            >
              Check Status
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#244260] bg-[#14283c] px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-[#1f3b57] rounded"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#244260] flex gap-2">
            <button
              onClick={() => go('apply')}
              className="flex-1 py-2 text-center text-xs font-bold rounded bg-slate-100 text-[#183048]"
            >
              Apply Visa
            </button>
            <button
              onClick={() => go('status')}
              className="flex-1 py-2 text-center text-xs font-bold rounded bg-[#274669] text-white"
            >
              Check Status
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

