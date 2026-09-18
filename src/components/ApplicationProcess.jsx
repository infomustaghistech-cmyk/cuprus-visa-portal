import { ChevronRight } from 'lucide-react'
import { PROCESS_STEPS } from '../data/content'
import Reveal from './Reveal'

export default function ApplicationProcess() {
  return (
    <section className="relative overflow-hidden section text-white">
      {/* Background Image with Dark Oceanic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/aphrodite.png"
          alt="Cyprus Coastal Background"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1528]/90 via-[#0B1528]/85 to-[#0B1528]/95" />
      </div>

      <div className="container relative z-10">
        {/* Centered Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-brand-500 uppercase font-sans">
            HOW IT WORKS
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.6rem] tracking-tight">
            Application Process
          </h2>
        </div>

        {/* 3 Step Glass Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROCESS_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={i * 90}>
                <div className="relative rounded-3xl border border-white/15 bg-white/[0.08] backdrop-blur-md p-8 sm:p-10 text-center flex flex-col items-center justify-center shadow-2xl h-full">
                  {/* Step Number + Circular Icon */}
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <span className="font-display text-3xl sm:text-4xl font-bold text-[#FF9500] tracking-tight">
                      {step.step}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF9500]/20 text-[#FF9500] shrink-0">
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                  </div>

                  {/* Title & Body */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-white/75 font-normal leading-relaxed max-w-xs">
                    {step.body}
                  </p>

                  {/* Faint chevron separator between cards */}
                  {i < PROCESS_STEPS.length - 1 && (
                    <span
                      className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-white/20"
                      aria-hidden="true"
                    >
                      <ChevronRight size={22} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
