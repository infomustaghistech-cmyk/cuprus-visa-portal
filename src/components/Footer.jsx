import Logo from './Logo'

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-gray-200/80 bg-white text-gray-600">
      <div className="container grid gap-10 py-12 md:py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Col 1: Brand & Logo */}
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <div className="leading-tight">
              <span className="block font-display text-[15px] font-bold text-gray-900 tracking-tight">Cyprus Visa</span>
              <span className="block text-[11px] font-medium text-gray-500">Application Portal</span>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-xs sm:text-sm text-gray-500 leading-relaxed">
            Official portal for Cyprus visa applications and status tracking.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h3 className="font-display text-sm font-bold text-gray-900">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-gray-500">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-gray-900 transition-colors">Home</button>
            </li>
            <li>
              <button onClick={() => onNavigate('apply')} className="hover:text-gray-900 transition-colors">Apply Visa</button>
            </li>
            <li>
              <button onClick={() => onNavigate('status')} className="hover:text-gray-900 transition-colors">Check Status</button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-gray-900 transition-colors">Contact</button>
            </li>
          </ul>
        </div>

        {/* Col 3: Visa Types */}
        <div>
          <h3 className="font-display text-sm font-bold text-gray-900">Visa Types</h3>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-gray-500">
            <li>
              <button onClick={() => onNavigate('apply')} className="hover:text-gray-900 transition-colors">Tourist Visa</button>
            </li>
            <li>
              <button onClick={() => onNavigate('apply')} className="hover:text-gray-900 transition-colors">Business Visa</button>
            </li>
            <li>
              <button onClick={() => onNavigate('apply')} className="hover:text-gray-900 transition-colors">Work Visa</button>
            </li>
            <li>
              <button onClick={() => onNavigate('apply')} className="hover:text-gray-900 transition-colors">Student Visa</button>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h3 className="font-display text-sm font-bold text-gray-900">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-gray-500">
            <li>
              <a href="mailto:info@md.mip.gov.cy" className="hover:text-gray-900 transition-colors">
                info@md.mip.gov.cy
              </a>
            </li>
            <li>
              <a href="tel:+35722308808" className="hover:text-gray-900 transition-colors">
                +357 22308808
              </a>
            </li>
            <li className="text-gray-500">
              Ministry of Interior, Nicosia
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="container flex flex-col gap-4 py-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Cyprus Visa Application Portal. All Rights Reserved.</p>
          <div className="flex items-center gap-3 text-gray-400">
            <button className="hover:text-gray-700 transition-colors">Privacy Policy</button>
            <span className="text-gray-200">|</span>
            <button className="hover:text-gray-700 transition-colors">Terms & Conditions</button>
            <span className="text-gray-200">|</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-gray-700 transition-colors">Contact Support</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
