import useReveal from '../hooks/useReveal'
import useCountUp from '../hooks/useCountUp'
import { STATS } from '../data/content'

function Stat({ item, active }) {
  const n = useCountUp(item.value, active)
  const decimals = item.decimals ?? 0
  const shown = item.value >= 1000
    ? Math.round(n).toLocaleString('en-US')
    : n.toFixed(decimals)

  const Icon = item.icon
  return (
    <div className="flex items-center gap-2.5 sm:gap-4 p-2 sm:p-0">
      <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#FFF7EB] text-[#D97706] shrink-0">
        <Icon size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-lg sm:text-2xl lg:text-[26px] font-bold text-gray-900 tracking-tight leading-none truncate">
          {item.prefix}{shown}{item.suffix}
        </p>
        <p className="mt-1 text-[11px] sm:text-[13px] text-gray-500 font-medium leading-tight">
          {item.label}
        </p>
      </div>
    </div>
  )
}

export default function Statistics() {
  const [ref, visible] = useReveal()
  return (
    <section className="relative z-20 bg-white border-b border-gray-100 py-5 sm:py-6 md:py-8 shadow-xs" ref={ref}>
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {STATS.map((item) => (
          <Stat key={item.label} item={item} active={visible} />
        ))}
      </div>
    </section>
  )
}
