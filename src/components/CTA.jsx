export default function CTA({ onNavigate }) {
  return (
    <section className="relative overflow-hidden text-white py-20 md:py-28">
      {/* Beachfront Panoramic Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/support-bg.jpg"
          alt="Cyprus Beachfront Support Banner"
          className="h-full w-full object-cover object-center"
        />
        {/* Soft dark tint to ensure text contrast while keeping the waterfront scenery visible */}
        <div className="absolute inset-0 bg-[#0B1528]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/70 via-transparent to-[#0B1528]/50" />
      </div>

      <div className="container relative z-10 text-center mx-auto max-w-2xl px-4">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-white tracking-tight leading-tight">
          Need Help With Your Application?
        </h2>
        <p className="mt-3.5 text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
          Our support team is available to assist you with your visa application process.
        </p>
        <div className="mt-8">
          <button
            onClick={() => onNavigate && onNavigate('contact')}
            className="inline-flex items-center justify-center rounded-xl bg-[#0c1626] hover:bg-[#15233c] border border-white/10 px-8 py-3.5 text-sm font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            Contact Support
          </button>
        </div>
      </div>
    </section>
  )
}
