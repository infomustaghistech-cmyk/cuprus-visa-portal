import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import Modal from './Modal'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function SignIn({ open, onClose, onSwitchToApply }) {
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter an email address in the format name@example.com.'
    if (form.password.length < 8) next.password = 'Passwords are at least 8 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 900)
  }

  const close = () => { setDone(false); setForm({ email: '', password: '', remember: true }); setErrors({}); onClose() }

  return (
    <Modal
      open={open}
      onClose={close}
      title={done ? 'Demo sign-in complete' : 'Sign in'}
      subtitle={done ? undefined : 'This screen is a demo. Nothing is sent anywhere, so use a made-up email and password.'}
    >
      {done ? (
        <div>
          <p className="text-sm text-ink-soft">
            In a real build this is where the applicant dashboard would load. This project has no backend, so the
            form stops here.
          </p>
          <button onClick={close} className="btn-dark mt-5 w-full">Back to the site</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="mb-4">
            <label className="label" htmlFor="signin-email">Email</label>
            <input
              id="signin-email" type="email" value={form.email} onChange={set('email')}
              className={`field ${errors.email ? 'field-error' : ''}`} placeholder="name@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="error-text"><AlertCircle size={13} />{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="signin-password">Password</label>
            <input
              id="signin-password" type="password" value={form.password} onChange={set('password')}
              className={`field ${errors.password ? 'field-error' : ''}`} placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="error-text"><AlertCircle size={13} />{errors.password}</p>}
          </div>

          <div className="mb-5 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink-soft">
              <input type="checkbox" checked={form.remember} onChange={set('remember')} className="h-4 w-4 rounded border-ink/30 accent-brand-500" />
              Keep me signed in
            </label>
            <button type="button" className="font-medium text-sea-600 hover:underline">Forgot password</button>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-sm text-ink-mute">
            No account yet?{' '}
            <button type="button" onClick={() => { close(); onSwitchToApply() }} className="font-medium text-sea-600 hover:underline">
              Start an application
            </button>
          </p>
        </form>
      )}
    </Modal>
  )
}
