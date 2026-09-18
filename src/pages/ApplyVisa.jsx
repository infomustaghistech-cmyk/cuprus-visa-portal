import { useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { VISA_TYPES } from '../data/content'
import PageHeader from '../components/PageHeader'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSPORT_RE = /^[A-Z]{2}\d{7}$/
const DOB_RE = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/

const STEPS = ['Your details', 'Trip and visa', 'Review']

const EMPTY = {
  fullName: '', email: '', phone: '', nationality: '', passport: '', dob: '',
  visaType: 'tourist', arrival: '', nights: '7', purpose: '', agreed: false
}

export default function ApplyVisa({ user, onSignIn, onSignOut }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    email: user?.email || ''
  }))
  const [authForm, setAuthForm] = useState({ email: '', password: '', isSignUp: false })
  const [authErrors, setAuthErrors] = useState({})
  const [authLoading, setAuthLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [reference, setReference] = useState(null)

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!EMAIL_RE.test(authForm.email)) next.email = 'Enter a valid email address.'
    if (authForm.password.length < 6) next.password = 'Password must be at least 6 characters.'
    setAuthErrors(next)
    if (Object.keys(next).length > 0) return

    setAuthLoading(true)
    setTimeout(() => {
      setAuthLoading(false)
      const userData = { email: authForm.email, name: authForm.email.split('@')[0] }
      setForm((f) => ({ ...f, email: authForm.email }))
      if (onSignIn) onSignIn(userData)
    }, 600)
  }

  const set = (key) => (e) => {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (key === 'passport') value = value.toUpperCase().slice(0, 9)
    if (key === 'phone') value = value.replace(/[^\d+\s-]/g, '').slice(0, 18)
    if (key === 'dob') {
      const digits = value.replace(/\D/g, '').slice(0, 8)
      value = digits.replace(/(\d{2})(\d{0,2})(\d{0,4})/, (_, d, m, y) => [d, m, y].filter(Boolean).join('/'))
    }
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validateStep = (index) => {
    const next = {}
    if (index === 0) {
      if (form.fullName.trim().length < 3) next.fullName = 'Enter the name exactly as it appears in your passport.'
      if (!EMAIL_RE.test(form.email)) next.email = 'Enter an email in the format name@example.com.'
      if (form.phone.replace(/\D/g, '').length < 8) next.phone = 'Enter a phone number with the country code.'
      if (!form.nationality.trim()) next.nationality = 'Enter your nationality.'
      if (!PASSPORT_RE.test(form.passport)) next.passport = 'Two letters followed by seven digits, for example AB1234567.'
      if (!DOB_RE.test(form.dob)) next.dob = 'Use DD/MM/YYYY.'
    }
    if (index === 1) {
      if (!form.arrival) next.arrival = 'Pick your planned arrival date.'
      if (Number(form.nights) < 1) next.nights = 'Stays start at one night.'
      if (form.purpose.trim().length < 10) next.purpose = 'Describe the purpose of your trip in a sentence.'
    }
    if (index === 2 && !form.agreed) next.agreed = 'Confirm the information is correct before submitting.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, 2)) }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = (e) => {
    e.preventDefault()
    if (!validateStep(2)) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setReference(`CY-${10000 + Math.floor(Math.random() * 89999)}`)
    }, 1100)
  }

  const chosen = VISA_TYPES.find((v) => v.id === form.visaType)

  if (reference) {
    return (
      <>
        <PageHeader title="Application submitted" intro="Keep the reference below — it is how you follow the decision." />
        <div className="section">
          <div className="container max-w-2xl">
            <div className="card p-8 text-center">
              <CheckCircle2 size={34} className="mx-auto text-ok" aria-hidden="true" />
              <p className="mt-5 text-sm text-ink-mute">Your reference number</p>
              <p className="font-display text-3xl font-bold tracking-tight">{reference}</p>
              <p className="mx-auto mt-4 max-w-sm text-sm text-ink-soft">
                A decision usually follows in 5 to 10 working days. This is a demo, so no application was actually created.
              </p>
              <button
                onClick={() => { setReference(null); setForm(EMPTY); setStep(0) }}
                className="btn-outline mt-7"
              >
                Start another application
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // If user is not logged in, show Sign In first (Image 2)
  if (!user) {
    return (
      <>
        <PageHeader
          title="Apply for a Visa"
          intro="Please sign in to your account to start or continue your Cyprus visa application."
        />
        <div className="section bg-[#F8FAFC]">
          <div className="container max-w-md">
            <div className="rounded-3xl border border-gray-100 bg-white p-7 sm:p-9 shadow-lift">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
                  {authForm.isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {authForm.isSignUp ? 'Create your profile to start visa applications' : 'Access your visa application dashboard'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} noValidate className="mt-7">
                <div className="mb-4.5">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="auth-email">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={authForm.email}
                    onChange={(e) => {
                      setAuthForm((f) => ({ ...f, email: e.target.value }))
                      setAuthErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    placeholder="you@example.com"
                    className={`field ${authErrors.email ? 'field-error' : ''}`}
                  />
                  {authErrors.email && <p className="error-text"><AlertCircle size={13} />{authErrors.email}</p>}
                </div>

                <div className="mb-6">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="auth-password">
                    PASSWORD
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={authForm.password}
                    onChange={(e) => {
                      setAuthForm((f) => ({ ...f, password: e.target.value }))
                      setAuthErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    placeholder="••••••••"
                    className={`field ${authErrors.password ? 'field-error' : ''}`}
                  />
                  {authErrors.password && <p className="error-text"><AlertCircle size={13} />{authErrors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1528] hover:bg-[#16243d] py-3.5 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-70"
                >
                  {authLoading && <Loader2 size={16} className="animate-spin" />}
                  {authLoading ? 'Signing in...' : (authForm.isSignUp ? 'Create Account' : 'Sign In')}
                </button>

                <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
                  {authForm.isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthForm((f) => ({ ...f, isSignUp: false }))}
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthForm((f) => ({ ...f, isSignUp: true }))}
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Start an application"
        intro="Three short steps. Nothing is transmitted — this form runs entirely in your browser."
      />

      <div className="section">
        <div className="container max-w-3xl">
          {/* User auth status banner */}
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-amber-50/60 border border-amber-200/60 px-4 py-2.5 text-xs">
            <span className="text-gray-700">Signed in as <strong className="text-gray-900 font-semibold">{user.email}</strong></span>
            <button type="button" onClick={onSignOut} className="font-semibold text-amber-700 hover:underline">
              Switch Account
            </button>
          </div>

          <ol className="mb-8 flex items-center gap-3" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    i <= step ? 'bg-brand-500 text-ink-deep' : 'bg-ink/10 text-ink-mute'
                  }`}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                <span className={`hidden text-sm sm:block ${i === step ? 'font-semibold text-ink' : 'text-ink-mute'}`}>{label}</span>
                {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-brand-500' : 'bg-ink/15'}`} />}
              </li>
            ))}
          </ol>

          <form onSubmit={submit} noValidate className="card p-6 sm:p-8">
            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="fullName">Full name as in passport</label>
                  <input id="fullName" value={form.fullName} onChange={set('fullName')} className={`field ${errors.fullName ? 'field-error' : ''}`} placeholder="Amina Yusuf" />
                  {errors.fullName && <p className="error-text"><AlertCircle size={13} />{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={set('email')} className={`field ${errors.email ? 'field-error' : ''}`} placeholder="name@example.com" />
                  {errors.email && <p className="error-text"><AlertCircle size={13} />{errors.email}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="phone">Phone</label>
                  <input id="phone" value={form.phone} onChange={set('phone')} className={`field ${errors.phone ? 'field-error' : ''}`} placeholder="+92 300 0000000" />
                  {errors.phone && <p className="error-text"><AlertCircle size={13} />{errors.phone}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="nationality">Nationality</label>
                  <input id="nationality" value={form.nationality} onChange={set('nationality')} className={`field ${errors.nationality ? 'field-error' : ''}`} placeholder="Pakistani" />
                  {errors.nationality && <p className="error-text"><AlertCircle size={13} />{errors.nationality}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="dob">Date of birth</label>
                  <input id="dob" value={form.dob} onChange={set('dob')} inputMode="numeric" className={`field ${errors.dob ? 'field-error' : ''}`} placeholder="DD/MM/YYYY" />
                  {errors.dob && <p className="error-text"><AlertCircle size={13} />{errors.dob}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="passport">Passport number</label>
                  <input id="passport" value={form.passport} onChange={set('passport')} className={`field ${errors.passport ? 'field-error' : ''}`} placeholder="AB1234567" />
                  <p className="help">Demo form — use a made-up number, not your real passport.</p>
                  {errors.passport && <p className="error-text"><AlertCircle size={13} />{errors.passport}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="label">Visa type</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {VISA_TYPES.map((v) => (
                      <label
                        key={v.id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 text-sm transition-colors ${
                          form.visaType === v.id ? 'border-brand-500 bg-brand-50' : 'border-ink/15 hover:border-ink/30'
                        }`}
                      >
                        <input type="radio" name="visaType" value={v.id} checked={form.visaType === v.id} onChange={set('visaType')} className="mt-0.5 accent-brand-500" />
                        <span>
                          <span className="block font-medium text-ink">{v.title}</span>
                          <span className="block text-xs text-ink-mute">{v.duration}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="arrival">Planned arrival</label>
                  <input id="arrival" type="date" value={form.arrival} onChange={set('arrival')} className={`field ${errors.arrival ? 'field-error' : ''}`} />
                  {errors.arrival && <p className="error-text"><AlertCircle size={13} />{errors.arrival}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="nights">Nights in Cyprus</label>
                  <input id="nights" type="number" min="1" max="365" value={form.nights} onChange={set('nights')} className={`field ${errors.nights ? 'field-error' : ''}`} />
                  {errors.nights && <p className="error-text"><AlertCircle size={13} />{errors.nights}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="purpose">Purpose of the trip</label>
                  <textarea id="purpose" rows="4" value={form.purpose} onChange={set('purpose')} className={`field resize-y ${errors.purpose ? 'field-error' : ''}`} placeholder="Two weeks of sightseeing around Paphos and Limassol." />
                  {errors.purpose && <p className="error-text"><AlertCircle size={13} />{errors.purpose}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold">Check before you submit</h2>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    ['Name', form.fullName], ['Email', form.email], ['Phone', form.phone],
                    ['Nationality', form.nationality], ['Passport', form.passport], ['Date of birth', form.dob],
                    ['Visa type', chosen.title], ['Arrival', form.arrival], ['Nights', form.nights]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-canvas p-4">
                      <dt className="text-xs text-ink-mute">{label}</dt>
                      <dd className="mt-0.5 font-medium text-ink">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 rounded-xl border border-ink/10 bg-canvas p-5">
                  <p className="text-sm font-medium text-ink">Documents to upload later</p>
                  <ul className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
                    {chosen.documents.map((doc) => <li key={doc}>· {doc}</li>)}
                  </ul>
                </div>

                <label className="mt-6 flex gap-3 text-sm text-ink-soft">
                  <input type="checkbox" checked={form.agreed} onChange={set('agreed')} className="mt-0.5 h-4 w-4 rounded border-ink/30 accent-brand-500" />
                  I confirm the details above are correct, and I understand this is a demo that issues no real visa.
                </label>
                {errors.agreed && <p className="error-text"><AlertCircle size={13} />{errors.agreed}</p>}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink/10 pt-6">
              <button type="button" onClick={back} disabled={step === 0} className="btn-outline">
                <ArrowLeft size={16} aria-hidden="true" /> Back
              </button>
              {step < 2 ? (
                <button type="button" onClick={next} className="btn-primary">
                  Continue <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                  {loading ? 'Submitting' : 'Submit application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
