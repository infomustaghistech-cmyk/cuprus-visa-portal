import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, AlertCircle, Loader2, CheckCircle2, Info } from 'lucide-react'
import { CONTACT_INFO } from '../data/content'

const ICONS = { Email: Mail, Phone: Phone, Office: MapPin, Hours: Clock }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Contact({ compact = false }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter an email in the format name@example.com.'
    if (form.message.trim().length < 15) next.message = 'Add a bit more detail — at least 15 characters.'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 900)
  }

  return (
    <section className={compact ? '' : 'section'} id="contact">
      <div className={compact ? '' : 'container'}>
        {!compact && (
          <div className="max-w-xl">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Get in touch</h2>
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_INFO.map((item) => {
            const Icon = ICONS[item.label]
            return (
              <div key={item.label} className="card p-5">
                <Icon size={19} className="text-sea-600" aria-hidden="true" />
                <p className="mt-3 text-xs text-ink-mute">{item.label}</p>
                <p className="font-medium text-ink">{item.value}</p>
                <p className="mt-1 text-xs text-ink-mute">{item.note}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl border border-brand-300/60 bg-brand-50 p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
          <p className="text-sm text-ink-soft">
            These details are placeholders for a demo. For a real Cyprus visa, go to the Republic of Cyprus Ministry
            of Interior or your nearest Cypriot embassy — and never enter passport or payment details on a site you
            reached through an ad or a message.
          </p>
        </div>

        <div className="mt-8 card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-start gap-3">
              <CheckCircle2 size={26} className="text-ok" aria-hidden="true" />
              <h3 className="text-lg font-semibold">Message recorded</h3>
              <p className="text-sm text-ink-soft">
                In a live build this would reach the support queue. Nothing was sent from this demo.
              </p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="btn-outline mt-2">
                Write another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="c-name">Full name</label>
                <input id="c-name" value={form.name} onChange={set('name')} className={`field ${errors.name ? 'field-error' : ''}`} placeholder="Amina Yusuf" />
                {errors.name && <p className="error-text"><AlertCircle size={13} />{errors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="c-email">Email</label>
                <input id="c-email" type="email" value={form.email} onChange={set('email')} className={`field ${errors.email ? 'field-error' : ''}`} placeholder="name@example.com" />
                {errors.email && <p className="error-text"><AlertCircle size={13} />{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="c-subject">Subject</label>
                <input id="c-subject" value={form.subject} onChange={set('subject')} className="field" placeholder="Question about a tourist visa" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="c-message">Message</label>
                <textarea id="c-message" rows="5" value={form.message} onChange={set('message')} className={`field resize-y ${errors.message ? 'field-error' : ''}`} placeholder="Include your reference number if you have one." />
                {errors.message && <p className="error-text"><AlertCircle size={13} />{errors.message}</p>}
                <p className="help">Do not include passport scans or payment details in this demo form.</p>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                  {loading ? 'Sending' : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
