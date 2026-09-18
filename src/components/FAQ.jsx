import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { FAQS } from '../data/content'

export default function FAQ() {
  const [open, setOpen] = useState(-1)

  return (
    <section className="bg-[#f8fafc] pt-20 pb-5 md:pt-24 md:pb-6" id="faq">
      <div className="container mx-auto max-w-[860px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-500 uppercase">
            SUPPORT
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#0B1528] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-3.5">
          {FAQS.map((item, i) => {
            const expanded = open === i
            return (
              <div
                key={item.q}
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? -1 : i)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between px-6 sm:px-8 py-5 text-left cursor-pointer group"
                >
                  <span className="font-semibold text-slate-800 text-[15px] sm:text-base pr-4 group-hover:text-amber-600 transition-colors">
                    {item.q}
                  </span>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      expanded ? 'rotate-90 text-amber-600' : 'group-hover:text-slate-600'
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {expanded && (
                  <div className="px-6 sm:px-8 pb-5 pt-1 text-sm sm:text-[15px] text-slate-600 leading-relaxed border-t border-slate-50">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
