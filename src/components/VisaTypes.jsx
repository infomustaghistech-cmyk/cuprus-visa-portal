import { VISA_TYPES } from '../data/content'
import Reveal from './Reveal'

export default function VisaTypes({ onNavigate }) {
  return (
    <section className="section bg-[#F8FAFC]">
      <div className="container">
        {/* Centered Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-sea-600 uppercase font-sans">
            CATEGORIES
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-[2.6rem] tracking-tight">
            Visa Types
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VISA_TYPES.map((visa, i) => {
            const Icon = visa.icon
            return (
              <Reveal key={visa.id} delay={i * 70}>
                <div
                  onClick={() => onNavigate('apply')}
                  className="rounded-2xl border border-gray-200/70 bg-white p-7 sm:p-8 text-left transition-all duration-300 w-full h-full flex flex-col items-start shadow-xs hover:shadow-card hover:border-brand-500/40 cursor-pointer group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF7EB] text-[#D97706] mb-4 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-gray-900 tracking-tight group-hover:text-brand-600 transition-colors">
                    {visa.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 font-normal leading-relaxed">
                    {visa.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
