import { useState } from 'react'
import { AlertCircle, Loader2, CheckCircle2, Lock, Mail, User } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function SignIn({ open, onClose, onSwitchToApply }) {
  const { signIn, signUp } = useAuth()
  const { showToast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setGeneralError('')
  }

  const validate = () => {
    const next = {}
    if (isSignUp && (form.fullName || '').trim().length < 2) {
      next.fullName = 'Please enter your full name.'
    }
    if (!EMAIL_RE.test(form.email || '')) {
      next.email = 'Enter a valid email address (e.g. name@domain.com).'
    }
    if ((form.password || '').length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGeneralError('')
    setSuccessMsg('')

    if (isSignUp) {
      const res = await signUp(form.email || '', form.password || '', { fullName: form.fullName || '' }, false)
      setLoading(false)
      if (res.success) {
        showToast({
          title: 'Account Created Successfully!',
          message: 'Your account has been registered in Supabase. Please enter your password to sign in.',
          type: 'success',
          duration: 7000
        })
        setIsSignUp(false)
        setForm((f) => ({ ...f, password: '' }))
        setSuccessMsg('Account created successfully! Please sign in with your credentials.')
      } else {
        setGeneralError(res.error || 'Failed to create account.')
      }
    } else {
      const res = await signIn(form.email, form.password)
      setLoading(false)
      if (res.success) {
        showToast({
          title: 'Signed In Successfully',
          message: 'Welcome back to Cyprus Visa Portal.',
          type: 'success',
          duration: 4000
        })
        setSuccessMsg('Signed in successfully!')
        setTimeout(() => {
          close()
          if (onSwitchToApply) onSwitchToApply()
        }, 600)
      } else {
        setGeneralError(res.error || 'Invalid email or password.')
      }
    }
  }

  const close = () => {
    setForm({ fullName: '', email: '', password: '' })
    setErrors({})
    setGeneralError('')
    setSuccessMsg('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={isSignUp ? 'Create an Account' : 'Sign in to Cyprus Portal'}
      subtitle={
        isSignUp
          ? 'Enter your real email and password to create an authenticated profile.'
          : 'Access your saved visa applications and track your submission status.'
      }
    >
      {successMsg && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-white border border-emerald-300 p-4 text-xs text-gray-800 shadow-xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
            <CheckCircle2 size={15} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-xs">Account Created Successfully!</p>
            <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{successMsg}</p>
          </div>
        </div>
      )}

      {generalError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-white border border-rose-300 p-3.5 text-xs text-gray-800 shadow-xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 mt-0.5">
            <AlertCircle size={15} />
          </div>
          <p className="font-medium text-rose-700 text-xs leading-relaxed">{generalError}</p>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        {isSignUp && (
          <div className="mb-4">
            <label className="label" htmlFor="modal-name">Full Name</label>
            <div className="relative">
              <input
                id="modal-name"
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                className={`field pl-9.5 ${errors.fullName ? 'field-error' : ''}`}
                placeholder="Amina Yusuf"
                aria-invalid={!!errors.fullName}
              />
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.fullName && <p className="error-text"><AlertCircle size={13} />{errors.fullName}</p>}
          </div>
        )}

        <div className="mb-4">
          <label className="label" htmlFor="modal-email">Email Address</label>
          <div className="relative">
            <input
              id="modal-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              className={`field pl-9.5 ${errors.email ? 'field-error' : ''}`}
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
            />
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.email && <p className="error-text"><AlertCircle size={13} />{errors.email}</p>}
        </div>

        <div className="mb-5">
          <label className="label" htmlFor="modal-password">Password</label>
          <div className="relative">
            <input
              id="modal-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              className={`field pl-9.5 ${errors.password ? 'field-error' : ''}`}
              placeholder="At least 6 characters"
              aria-invalid={!!errors.password}
            />
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.password && <p className="error-text"><AlertCircle size={13} />{errors.password}</p>}
        </div>

        <button type="submit" className="btn-primary w-full shadow-md" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign in')}
        </button>

        <div className="mt-5 text-center text-xs text-ink-mute">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setGeneralError(''); }}
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
                onClick={() => { setIsSignUp(true); setGeneralError(''); }}
                className="font-semibold text-brand-600 hover:underline"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </form>
    </Modal>
  )
}
