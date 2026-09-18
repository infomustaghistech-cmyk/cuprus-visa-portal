import { useState } from 'react'
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import StatusBadge from './StatusBadge'

const PASSPORT_RE = /^[A-Z]{2}\d{7}$/
const DOB_RE = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/
const REF_RE = /^CY-\d{5}$/

/** Deterministic mock lookup: the same reference always returns the same result. */
function lookup(reference) {
  const seed = [...reference].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const status = ['Processing', 'Approved', 'Rejected'][seed % 3]
  const messages = {
    Processing: 'Your documents are with a case officer. No action is needed from you right now.',
    Approved: 'A decision has been published. Collect your visa with your passport and this reference.',
    Rejected: 'The application was refused. The refusal letter explains which requirement was not met.'
  }
  return {
    reference,
    status,
    message: messages[status],
    type: ['Tourist visa', 'Business visa', 'Student visa'][seed % 3],
    submitted: `${(seed % 27) + 1} August 2026`,
    updated: `${(seed % 15) + 1} September 2026`
  }
}

export default function CheckStatus({ compact = false }) {
  const [form, setForm] = useState({ reference: '', passport: '', dob: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const set = (key) => (e) => {
    let value = e.target.value
    if (key === 'passport') value = value.toUpperCase().slice(0, 9)
    if (key === 'reference') value = value.toUpperCase().slice(0, 8)
    if (key === 'dob') {
      const digits = value.replace(/\D/g, '').slice(0, 8)
      value = digits.replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, d, m, y) => [d, m, y].filter(Boolean).join('/'))
    }
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!REF_RE.test(form.reference)) next.reference = 'Use the format CY-12345 from your confirmation screen.'
    if (!PASSPORT_RE.test(form.passport)) next.passport = 'Two letters followed by seven digits, for example AB1234567.'
    if (!DOB_RE.test(form.dob)) next.dob = 'Use DD/MM/YYYY.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    setResult(null)
    if (!validate()) return
    setLoading(true)
    setTimeout(() => { setResult(lookup(form.reference)); setLoading(false) }, 1000)
  }

  const reset = () => { setResult(null); setForm({ reference: '', passport: '', dob: '' }); setErrors({}) }

  return (
    <section className={compact ? '' : 'section bg-white'} id="status">
      <div className={compact ? '' : 'container'}>
        <div className={`mx-auto max-w-3xl ${compact ? '' : 'text-center'}`}>
          {!compact && (
            <>
              <h2 className="text-3xl font-bold sm:text-4xl">Check an application</h2>
              <p className="mt-3 text-ink-soft">
                Try CY-10001, CY-10002 or CY-10003 — each one returns a different status.
              </p>
            </>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-3xl card p-6 sm:p-8">
          <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="ref">Reference number</label>
              <input id="ref" value={form.reference} onChange={set('reference')} placeholder="CY-10001"
                className={`field ${errors.reference ? 'field-error' : ''}`} aria-invalid={!!errors.reference} />
              {errors.reference && <p className="error-text"><AlertCircle size={13} />{errors.reference}</p>}
            </div>

            <div>
              <label className="label" htmlFor="passport">Passport number</label>
              <input id="passport" value={form.passport} onChange={set('passport')} placeholder="AB1234567"
                className={`field ${errors.passport ? 'field-error' : ''}`} aria-invalid={!!errors.passport} />
              {errors.passport && <p className="error-text"><AlertCircle size={13} />{errors.passport}</p>}
            </div>

            <div>
              <label className="label" htmlFor="dob">Date of birth</label>
              <input id="dob" value={form.dob} onChange={set('dob')} placeholder="DD/MM/YYYY" inputMode="numeric"
                className={`field ${errors.dob ? 'field-error' : ''}`} aria-invalid={!!errors.dob} />
              {errors.dob && <p className="error-text"><AlertCircle size={13} />{errors.dob}</p>}
            </div>

            <div className="sm:col-span-3 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {loading ? 'Checking' : 'Check status'}
              </button>
              {result && (
                <button type="button" onClick={reset} className="btn-outline">
                  <RotateCcw size={15} aria-hidden="true" /> Check another
                </button>
              )}
            </div>
          </form>

          <div aria-live="polite">
            {result && (
              <div className="mt-7 animate-rise rounded-2xl border border-ink/10 bg-canvas p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-ink-mute">{result.reference}</p>
                    <p className="font-display text-lg font-semibold">{result.type}</p>
                  </div>
                  <StatusBadge status={result.status} />
                </div>
                <p className="mt-4 text-sm text-ink-soft">{result.message}</p>
                <dl className="mt-5 grid gap-4 border-t border-ink/10 pt-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-ink-mute">Submitted</dt><dd className="font-medium">{result.submitted}</dd></div>
                  <div><dt className="text-ink-mute">Last updated</dt><dd className="font-medium">{result.updated}</dd></div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
