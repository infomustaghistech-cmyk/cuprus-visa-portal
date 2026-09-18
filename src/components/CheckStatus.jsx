import { useState } from 'react'
import { AlertCircle, Loader2, RotateCcw, Search, CheckCircle, Clock, XCircle, FileText } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { checkVisaStatus } from '../services/visaService'

const REF_RE = /^CY-\d{4,6}$/i

export default function CheckStatus({ compact = false }) {
  const [form, setForm] = useState({ reference: '', passport: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const set = (key) => (e) => {
    let value = e.target.value
    if (key === 'passport') value = value.toUpperCase().slice(0, 9)
    if (key === 'reference') value = value.toUpperCase().slice(0, 9)
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setNotFound(false)
  }

  const validate = () => {
    const next = {}
    if (!form.reference.trim()) {
      next.reference = 'Please enter your application reference number (e.g. CY-10001).'
    } else if (!REF_RE.test(form.reference.trim())) {
      next.reference = 'Use the format CY-12345 from your confirmation screen.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setResult(null)
    setNotFound(false)
    if (!validate()) return

    setLoading(true)
    const res = await checkVisaStatus(form.reference, form.passport)
    setLoading(false)

    if (res.found && res.application) {
      setResult(res.application)
    } else {
      setNotFound(true)
    }
  }

  const reset = () => {
    setResult(null)
    setNotFound(false)
    setForm({ reference: '', passport: '' })
    setErrors({})
  }

  return (
    <section className={compact ? '' : 'section bg-white'} id="status">
      <div className={compact ? '' : 'container'}>
        <div className={`mx-auto max-w-3xl ${compact ? '' : 'text-center'}`}>
          {!compact && (
            <>
              <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 tracking-tight">
                Check Visa Application Status
              </h2>
              <p className="mt-3 text-ink-soft">
                Enter your reference number (e.g. <span className="font-mono font-semibold text-brand-600">CY-10001</span>) to view real-time decision updates.
              </p>
            </>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-3xl card p-6 sm:p-8 shadow-lift">
          <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ref">Reference number *</label>
              <input
                id="ref"
                value={form.reference}
                onChange={set('reference')}
                placeholder="e.g. CY-10001"
                className={`field ${errors.reference ? 'field-error' : ''}`}
                aria-invalid={!!errors.reference}
              />
              {errors.reference && <p className="error-text"><AlertCircle size={13} />{errors.reference}</p>}
            </div>

            <div>
              <label className="label" htmlFor="passport">Passport number (optional)</label>
              <input
                id="passport"
                value={form.passport}
                onChange={set('passport')}
                placeholder="e.g. AB1234567"
                className={`field ${errors.passport ? 'field-error' : ''}`}
                aria-invalid={!!errors.passport}
              />
              {errors.passport && <p className="error-text"><AlertCircle size={13} />{errors.passport}</p>}
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {loading ? 'Searching...' : 'Check Status'}
              </button>
              {(result || notFound) && (
                <button type="button" onClick={reset} className="btn-outline">
                  <RotateCcw size={15} aria-hidden="true" /> Search Another
                </button>
              )}
            </div>
          </form>

          <div aria-live="polite">
            {notFound && (
              <div className="mt-7 animate-rise rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-sm text-rose-800">
                <div className="flex items-center gap-2 font-semibold">
                  <XCircle size={18} className="text-rose-600 shrink-0" />
                  Application Not Found
                </div>
                <p className="mt-1 text-xs text-rose-700">
                  No record matched reference <strong className="font-mono">{form.reference}</strong>. Please double-check your reference code or submit a new application.
                </p>
              </div>
            )}

            {result && (
              <div className="mt-7 animate-rise rounded-2xl border border-gray-200 bg-gray-50/80 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                      Reference #{result.reference_number}
                    </span>
                    <p className="font-display text-lg font-bold text-gray-900 mt-0.5 capitalize">
                      {result.full_name ? `${result.full_name} — ` : ''}{result.visa_type} Visa
                    </p>
                  </div>
                  <StatusBadge status={result.status} />
                </div>

                <div className="mt-4 rounded-xl bg-white p-4 border border-gray-100 shadow-2xs">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Official Status Remarks</p>
                  <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
                    {result.admin_notes || 'Your application is currently being evaluated by immigration authorities.'}
                  </p>
                </div>

                <dl className="mt-4 grid gap-3 border-t border-gray-200/70 pt-4 text-xs sm:grid-cols-3">
                  <div>
                    <dt className="text-gray-500">Submitted</dt>
                    <dd className="font-semibold text-gray-800 mt-0.5">
                      {result.created_at ? new Date(result.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Recently'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Last Update</dt>
                    <dd className="font-semibold text-gray-800 mt-0.5">
                      {result.updated_at ? new Date(result.updated_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Up to date'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Passport Number</dt>
                    <dd className="font-semibold text-gray-800 mt-0.5">{result.passport || 'Recorded'}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
