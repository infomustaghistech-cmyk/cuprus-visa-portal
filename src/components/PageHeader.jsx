export default function PageHeader({ title, intro }) {
  return (
    <section className="sea-backdrop grain relative overflow-hidden">
      <div className="container relative py-14 md:py-20">
        <h1 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-xl text-white/70">{intro}</p>}
      </div>
    </section>
  )
}
