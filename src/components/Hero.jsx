import { FileText, Search } from 'lucide-react'
import Logo from './Logo'

export default function Hero({ onNavigate }) {
  return (
    <section className="relative overflow-hidden text-white min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background Image with directional overlay for perfect readability and vibrant scenery */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.png"
          alt="Official Cyprus Visa Application Portal"
          className="h-full w-full object-cover object-center"
        />
        {/* Soft directional gradient keeping text ultra legible while showcasing the castle and sea */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/20" />
      </div>

      <div className="container relative z-10 py-16 md:py-24 lg:py-28">
        <div className="max-w-2xl">
          {/* Official Emblem, Divider & Label */}
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div className="h-5 w-[1.5px] bg-white/30" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-white/95 uppercase font-sans drop-shadow-sm">
              Republic of Cyprus
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mt-4 sm:mt-5 font-display text-3xl sm:text-5xl lg:text-[3.6rem] font-bold text-white tracking-tight leading-tight sm:leading-[1.12] drop-shadow-md">
            Official Cyprus Visa<br className="hidden sm:inline" /> Application Portal
          </h1>

          {/* Subtitle Description */}
          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg text-white/90 leading-relaxed drop-shadow">
            Apply for your Cyprus visa online and track your application status securely through our official government portal.
          </p>

          {/* Action Buttons */}
          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-stretch sm:items-center">
            <button
              onClick={() => onNavigate('apply')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0d1b2a] hover:bg-[#152a42] border border-white/20 px-6 py-3.5 text-sm font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer"
            >
              <FileText size={18} className="text-white/90" />
              Apply for Visa
            </button>

            <button
              onClick={() => onNavigate('status')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/40 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer"
            >
              <Search size={18} className="text-white/90" />
              Check Visa Status
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
