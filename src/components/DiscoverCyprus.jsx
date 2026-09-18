import { MapPin } from 'lucide-react'
import { DESTINATIONS } from '../data/content'
import Reveal from './Reveal'

export default function DiscoverCyprus() {
  return (
    <section className="section bg-[#F8FAFC]">
      <div className="container">
        {/* Centered Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-sea-600 uppercase font-sans">
            DISCOVER
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-[2.6rem] tracking-tight">
            Explore Beautiful Cyprus
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            From ancient ruins to turquoise beaches — discover why millions visit Cyprus every year.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((place, i) => (
            <Reveal key={place.name} delay={i * 80}>
              <article className="group relative h-80 sm:h-[340px] overflow-hidden rounded-2xl shadow-card bg-slate-900">
                <img
                  src={place.image}
                  alt={place.name}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" aria-hidden="true" />
                
                <div className="relative flex h-full flex-col justify-end p-5 text-white">
                  <p className="flex items-center gap-1.5 text-[15px] font-bold text-white tracking-tight">
                    <MapPin size={15} className="text-amber-500 shrink-0" />
                    <span>{place.name}</span>
                  </p>
                  <p className="mt-1 text-xs text-white/80 font-normal leading-snug">
                    {place.blurb}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
