import Reveal from './Reveal'

export default function About() {
  return (
    <section className="py-10 md:py-14 bg-[#F8FAFC]">
      <div className="container">
        <Reveal>
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white shadow-card grid md:grid-cols-2 items-stretch">
            {/* Left Content Side */}
            <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-sea-600 uppercase font-sans">
                ABOUT
              </p>
              <h2 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Cyprus Visa Services
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-gray-600 font-normal">
                The Cyprus Visa Application Portal provides a streamlined, secure online system for submitting and tracking visa applications. Our platform serves applicants worldwide, offering transparent processing times and real-time status updates through official government infrastructure.
              </p>
            </div>

            {/* Right Image Side */}
            <div className="relative min-h-[260px] sm:min-h-[320px] md:min-h-full">
              <img
                src="/about-cyprus.png"
                alt="Cyprus Coastal Harbor & Town"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
