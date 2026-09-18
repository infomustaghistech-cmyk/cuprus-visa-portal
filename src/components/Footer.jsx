import Logo from './Logo'

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#f8fafc] border-t border-slate-200 text-slate-700 text-xs sm:text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Main Category Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Column 1 */}
          <div>
            <ul className="space-y-3 font-semibold text-slate-800 text-xs sm:text-[13px]">
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Agriculture, fisheries and livestock
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Business activity
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Education
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Employment and insurance
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Justice
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Military service
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <ul className="space-y-3 font-semibold text-slate-800 text-xs sm:text-[13px]">
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Citizens and day-to-day life
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Tourism
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Welfare
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Health
                </a>
              </li>
              <li>
                <a href="#main" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="hover:text-sky-800 hover:underline">
                  Property and taxation
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <ul className="space-y-3 font-semibold text-slate-800 text-xs sm:text-[13px]">
              <li>
                <button onClick={() => onNavigate?.('status')} className="hover:text-sky-800 hover:underline text-left">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('home')} className="hover:text-sky-800 hover:underline text-left">
                  Websites
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('home')} className="hover:text-sky-800 hover:underline text-left">
                  News
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('contact')} className="hover:text-sky-800 hover:underline text-left">
                  Government
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Policy Links and EU / Cyprus Logos Line */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] sm:text-xs font-medium text-slate-600">
            <button onClick={() => onNavigate?.('contact')} className="hover:text-slate-900 hover:underline">Privacy Statement</button>
            <button onClick={() => onNavigate?.('contact')} className="hover:text-slate-900 hover:underline">Cookies Policy</button>
            <button onClick={() => onNavigate?.('contact')} className="hover:text-slate-900 hover:underline">Accessibility Statement</button>
            <button onClick={() => onNavigate?.('contact')} className="hover:text-slate-900 hover:underline">Digital Assistant Usage Policy</button>
            <button onClick={() => onNavigate?.('contact')} className="hover:text-slate-900 hover:underline">Contact</button>
          </div>

          {/* Co-funded by EU & Republic of Cyprus Official Badges */}
          <div className="flex items-center gap-6 shrink-0">
            {/* EU Flag & text */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-[#003399] rounded-xs flex items-center justify-center relative overflow-hidden">
                <div className="text-[7px] text-yellow-300 font-serif leading-none tracking-tighter">★★★★</div>
              </div>
              <div className="text-[9px] leading-tight text-slate-500">
                <span className="block font-medium text-slate-700">Co-funded by</span>
                <span>the European Union</span>
              </div>
            </div>

            {/* Cyprus Emblem & text */}
            <div className="flex items-center gap-1.5">
              <Logo size={20} />
              <span className="text-[10px] font-semibold text-slate-700">Republic of Cyprus</span>
            </div>
          </div>
        </div>

        {/* Bottom Gov.cy Copyright Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center gap-4 text-xs text-slate-500">
          <span className="font-bold text-slate-800 tracking-tight">gov.cy</span>
          <span>© Republic of Cyprus, {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}


