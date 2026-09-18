import { useState, useEffect, useRef } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2,
  Loader2, ShieldCheck, Mail, Lock, User, Copy, Check,
  Phone, Plane, FolderOpen, Upload, FileText, Calendar, Globe, MapPin,
  ChevronDown
} from 'lucide-react'
import { VISA_TYPES } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { submitVisaApplication } from '../services/visaService'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSPORT_RE = /^[A-Z0-9]{6,12}$/i

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'review', label: 'Review', icon: ShieldCheck },
]

const EMPTY_FORM = {
  // Step 1: Personal
  fullName: '',
  nationality: '',
  placeOfBirth: '',
  passport: '',
  passportExpiry: '',
  dob: '',
  gender: 'male',
  maritalStatus: '',

  // Step 2: Contact
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  countryOfResidence: '',
  emergencyName: '',
  emergencyPhone: '',

  // Step 3: Travel
  visaType: 'tourist',
  purpose: '',
  arrival: '',
  returnDate: '',
  destinationAddress: '',
  hostName: '',
  hostPhone: '',
  nights: '7',
  portOfEntry: 'Larnaca Airport (LCA)',

  // Step 4: Documents
  passportFile: null,
  photoFile: null,
  insuranceFile: null,
  bankStatementFile: null,
  hotelFile: null,
  flightFile: null,
  coverLetterFile: null,
  additionalFile: null,

  // Step 5: Review
  agreed: false
}

export default function ApplyVisa({ onNavigate }) {
  const { user, signIn, signUp, signOut } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    email: user?.email || '',
    fullName: user?.name || ''
  }))

  // Auth form states (for unauthenticated users)
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '', isSignUp: false })
  const [authErrors, setAuthErrors] = useState({})
  const [authLoading, setAuthLoading] = useState(false)
  const [authGeneralError, setAuthGeneralError] = useState('')
  const [authSuccessMsg, setAuthSuccessMsg] = useState('')

  // Submission states
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [maritalOpen, setMaritalOpen] = useState(false)
  const maritalRef = useRef(null)
  const [visaOpen, setVisaOpen] = useState(false)
  const visaRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (maritalRef.current && !maritalRef.current.contains(e.target)) {
        setMaritalOpen(false)
      }
      if (visaRef.current && !visaRef.current.contains(e.target)) {
        setVisaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync user info when user logs in
  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({
        ...f,
        email: user.email,
        fullName: f.fullName || user.name || ''
      }))
    }
  }, [user])

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthGeneralError('')
    setAuthSuccessMsg('')

    const next = {}
    if (authForm.isSignUp && (authForm.fullName || '').trim().length < 2) {
      next.fullName = 'Please enter your full name.'
    }
    if (!EMAIL_RE.test(authForm.email || '')) {
      next.email = 'Enter a valid email address (e.g. name@domain.com).'
    }
    if ((authForm.password || '').length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }
    setAuthErrors(next)
    if (Object.keys(next).length > 0) return

    setAuthLoading(true)
    if (authForm.isSignUp) {
      const res = await signUp(authForm.email || '', authForm.password || '', { fullName: authForm.fullName || '' }, false)
      setAuthLoading(false)
      if (res.success) {
        showToast({
          title: 'Account Created Successfully!',
          message: 'Your account has been registered in Supabase. Please sign in to open and submit the visa application form.',
          type: 'success',
          duration: 7000
        })
        setAuthForm((prev) => ({ ...prev, isSignUp: false, password: '' }))
        setAuthSuccessMsg('Account created successfully! Please enter your password to sign in and open the visa application form.')
      } else {
        setAuthGeneralError(res.error || 'Failed to create account.')
      }
    } else {
      const res = await signIn(authForm.email || '', authForm.password || '')
      setAuthLoading(false)
      if (res.success) {
        showToast({
          title: 'Signed In Successfully',
          message: 'Welcome! Your Visa Application Form is now open.',
          type: 'success',
          duration: 4000
        })
        setAuthSuccessMsg('Signed in successfully!')
      } else {
        setAuthGeneralError(res.error || 'Invalid email or password.')
      }
    }
  }

  const set = (key) => (e) => {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (key === 'passport') value = (value || '').toUpperCase()
    if (key === 'phone' || key === 'emergencyPhone') {
      value = (value || '').replace(/[^\d+\s-]/g, '').slice(0, 18)
    }
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const [uploadedFiles, setUploadedFiles] = useState({})

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm((f) => ({ ...f, [key]: file.name }))
      setUploadedFiles((prev) => ({ ...prev, [key]: file }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const validateStep = (index) => {
    const next = {}
    // Step 0: Personal
    if (index === 0) {
      if (!(form.fullName || '').trim()) next.fullName = 'Full name as in passport is required.'
      if (!(form.nationality || '').trim()) next.nationality = 'Nationality is required.'
      if (!(form.passport || '').trim()) next.passport = 'Passport number is required.'
      if (!form.passportExpiry) next.passportExpiry = 'Passport expiry date is required.'
      if (!form.dob) next.dob = 'Date of birth is required.'
      if (!form.gender) next.gender = 'Please select gender.'
    }

    // Step 1: Contact
    if (index === 1) {
      if (!EMAIL_RE.test(form.email || '')) next.email = 'Enter a valid email address.'
      if (!(form.address || '').trim()) next.address = 'Current address is required.'
      if (!(form.city || '').trim()) next.city = 'City is required.'
      if (!(form.countryOfResidence || '').trim()) next.countryOfResidence = 'Country of residence is required.'
    }

    // Step 2: Travel
    if (index === 2) {
      if (!form.visaType) next.visaType = 'Please select a visa category.'
      if (!(form.purpose || '').trim()) next.purpose = 'Purpose of visit is required.'
    }

    // Step 3: Documents
    if (index === 3) {
      // Optional/recommended check
      if (!form.passportFile) next.passportFile = 'Please upload a copy of your passport bio page.'
    }

    // Step 4: Review
    // Declaration is accepted upon submitting the form
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(4)) return
    setLoading(true)

    const payload = {
      ...form,
      user_id: user?.id || null
    }

    const res = await submitVisaApplication(payload, uploadedFiles)
    setLoading(false)

    if (res.success) {
      setSubmissionResult(res.data)
      showToast({
        title: 'Application Received!',
        message: `Your application reference is ${res.data.reference_number}.`,
        type: 'success',
        duration: 8000
      })
    }
  }

  const handleCopyRef = () => {
    if (submissionResult?.reference_number) {
      navigator.clipboard.writeText(submissionResult.reference_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // If application was submitted, show confirmation
  if (submissionResult) {
    return (
      <div className="min-h-[80vh] bg-[#F8FAFC] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/90 p-8 sm:p-10 text-center shadow-lg">
          {/* Top Green Check Circle */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <div className="h-7 w-7 rounded-full border-2 border-emerald-500 flex items-center justify-center">
              <Check size={16} strokeWidth={3} className="text-emerald-600" />
            </div>
          </div>

          <h2 className="mt-5 font-display text-2xl font-bold text-gray-900">Application Submitted!</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your visa application has been received and is being processed.
          </p>

          {/* Reference Box */}
          <div className="mt-6 rounded-xl bg-[#f8fafc] border border-gray-100/90 py-5 px-6">
            <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1.5">
              YOUR APPLICATION NUMBER
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-extrabold tracking-tight text-[#0B1528]">
                {submissionResult.reference_number}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer"
                title={copied ? 'Copied' : 'Copy application number'}
              >
                {copied ? <Check size={16} className="text-emerald-600" strokeWidth={2.5} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Save this number to track your application status at any time.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('status')}
              className="inline-flex items-center justify-center rounded-lg bg-[#0B1528] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#18253d] transition-colors cursor-pointer"
            >
              Check Status
            </button>
            <button
              type="button"
              onClick={() => onNavigate('status')}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-[#f8fafc] px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If user is not logged in, prompt real Supabase login / signup
  if (!user) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/90 p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {authForm.isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            {authForm.isSignUp
              ? 'Create your profile to start visa applications'
              : 'Access your visa application dashboard'}
          </p>

          {authSuccessMsg && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-white border border-emerald-300 p-3.5 text-xs text-gray-800 shadow-xs">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-xs">Account Created Successfully!</p>
                <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{authSuccessMsg}</p>
              </div>
            </div>
          )}

          {authGeneralError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-white border border-rose-300 p-3.5 text-xs text-gray-800 shadow-xs">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 mt-0.5">
                <AlertCircle size={14} />
              </div>
              <p className="font-medium text-rose-700 text-xs leading-relaxed">{authGeneralError}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} noValidate className="space-y-5">
            {authForm.isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700" htmlFor="auth-name">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={authForm.fullName}
                  onChange={(e) => {
                    setAuthForm((f) => ({ ...f, fullName: e.target.value }))
                    setAuthErrors((prev) => ({ ...prev, fullName: undefined }))
                  }}
                  placeholder="Amina Yusuf"
                  className={`flex h-12 w-full rounded-lg border-2 border-gray-200 bg-gray-50/50 px-4 py-2 text-base md:text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-gray-900 focus-visible:ring-0 transition-colors ${
                    authErrors.fullName ? 'border-rose-500' : ''
                  }`}
                />
                {authErrors.fullName && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={12} />{authErrors.fullName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700" htmlFor="auth-email">
                Email Address
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
                className={`flex h-12 w-full rounded-lg border-2 border-gray-200 bg-gray-50/50 px-4 py-2 text-base md:text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-gray-900 focus-visible:ring-0 transition-colors ${
                  authErrors.email ? 'border-rose-500' : ''
                }`}
              />
              {authErrors.email && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={12} />{authErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-700" htmlFor="auth-password">
                Password
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
                className={`flex h-12 w-full rounded-lg border-2 border-gray-200 bg-gray-50/50 px-4 py-2 text-base md:text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-gray-900 focus-visible:ring-0 transition-colors ${
                  authErrors.password ? 'border-rose-500' : ''
                }`}
              />
              {authErrors.password && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1"><AlertCircle size={12} />{authErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-[#0B1528] text-white hover:bg-[#18253d] h-12 rounded-lg px-8 text-base w-full shadow-sm"
            >
              {authLoading && <Loader2 size={16} className="animate-spin" />}
              {authLoading
                ? 'Signing in...'
                : (authForm.isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            {authForm.isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthForm((f) => ({ ...f, isSignUp: false }))
                    setAuthGeneralError('')
                  }}
                  className="text-amber-600 font-medium hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthForm((f) => ({ ...f, isSignUp: true }))
                    setAuthGeneralError('')
                  }}
                  className="text-amber-600 font-medium hover:underline"
                >
                  Create Account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    )
  }

  // Logged-in application flow
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 sm:py-14 px-4">
      <div className="max-w-3xl mx-auto">
        {/* User Status Bar */}
        <div className="mb-6 flex items-center justify-between text-xs text-gray-500 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Applicant: <strong className="text-gray-800">{user.email}</strong></span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-gray-500 hover:text-gray-800 underline transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Header Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1528] mb-2">
            Cyprus Visa Application
          </h1>
          <p className="text-sm text-gray-500">
            Complete all sections carefully. Fields marked with * are mandatory.
          </p>
        </div>

        {/* Stepper matching screenshot */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 overflow-x-auto py-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === i
            const isCompleted = step > i

            return (
              <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (i < step || validateStep(step)) {
                      setStep(i)
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ea580c] text-white px-4 py-1.5 rounded-full font-semibold shadow-xs'
                      : isCompleted
                      ? 'bg-[#fef3c7] text-[#b45309] border border-amber-200/60 font-medium px-3.5 py-1.5 rounded-full'
                      : 'text-gray-500 hover:text-gray-800 font-normal px-2 py-1'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : isCompleted ? 'text-[#b45309]' : 'text-gray-400'} />
                  <span>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-5 sm:w-8 h-px ${i < step ? 'bg-[#ea580c]' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs">
          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} noValidate>
            
            {/* STEP 0: PERSONAL INFORMATION */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Information</h2>
                  <p className="text-sm text-gray-500">As it appears on your passport.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Full Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="full_name">
                      Full Name (as in passport) *
                    </label>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="e.g. JOHN DOE"
                      value={form.fullName}
                      onChange={set('fullName')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.fullName ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.fullName && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.fullName}</p>}
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="nationality">
                      Nationality *
                    </label>
                    <input
                      id="nationality"
                      type="text"
                      placeholder="e.g. Indian"
                      value={form.nationality}
                      onChange={set('nationality')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.nationality ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.nationality && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.nationality}</p>}
                  </div>

                  {/* Place of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="place_of_birth">
                      Place of Birth
                    </label>
                    <input
                      id="place_of_birth"
                      type="text"
                      placeholder="e.g. New Delhi"
                      value={form.placeOfBirth}
                      onChange={set('placeOfBirth')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Passport Number */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="passport_number">
                      Passport Number *
                    </label>
                    <input
                      id="passport_number"
                      type="text"
                      placeholder="E.G. A12345678"
                      value={form.passport}
                      onChange={set('passport')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors uppercase tabular-nums ${
                        errors.passport ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.passport && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.passport}</p>}
                  </div>

                  {/* Passport Expiry Date */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="passport_expiry">
                      Passport Expiry Date *
                    </label>
                    <input
                      id="passport_expiry"
                      type="date"
                      value={form.passportExpiry}
                      onChange={set('passportExpiry')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.passportExpiry ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.passportExpiry && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.passportExpiry}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="date_of_birth">
                      Date of Birth *
                    </label>
                    <input
                      id="date_of_birth"
                      type="date"
                      value={form.dob}
                      onChange={set('dob')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.dob ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.dob && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.dob}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block">
                      Gender *
                    </label>
                    <div className="flex items-center gap-6 pt-3">
                      {[
                        { id: 'male', label: 'Male' },
                        { id: 'female', label: 'Female' },
                        { id: 'other', label: 'Other' },
                      ].map((item) => {
                        const isChecked = form.gender === item.id
                        return (
                          <div
                            key={item.id}
                            onClick={() => set('gender')({ target: { value: item.id } })}
                            className="flex items-center gap-2 cursor-pointer group select-none"
                          >
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${isChecked ? 'border-[#ea580c]' : 'border-amber-500/80 group-hover:border-[#ea580c]'}`}>
                              {isChecked && <div className="h-2 w-2 rounded-full bg-[#ea580c]" />}
                            </div>
                            <span className="text-sm text-gray-800">{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div className="space-y-1.5 relative" ref={maritalRef}>
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="marital_status">
                      Marital Status
                    </label>
                    <button
                      type="button"
                      id="marital_status"
                      onClick={() => setMaritalOpen((v) => !v)}
                      className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-800 hover:bg-white focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors cursor-pointer"
                    >
                      <span className={form.maritalStatus ? 'text-gray-900 capitalize font-normal' : 'text-gray-700'}>
                        {form.maritalStatus ? form.maritalStatus : 'Select'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${maritalOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {maritalOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full rounded-lg border border-gray-200 bg-white shadow-lg z-50 py-1 text-sm overflow-hidden animate-in fade-in-50">
                        {[
                          { val: '', label: 'Select' },
                          { val: 'single', label: 'Single' },
                          { val: 'married', label: 'Married' },
                          { val: 'divorced', label: 'Divorced' },
                          { val: 'widowed', label: 'Widowed' }
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              set('maritalStatus')({ target: { value: item.val } })
                              setMaritalOpen(false)
                            }}
                            className={`flex w-full items-center px-4 py-2.5 text-left cursor-pointer hover:bg-orange-50 hover:text-[#ea580c] transition-colors ${
                              form.maritalStatus === item.val ? 'bg-orange-50 font-medium text-[#ea580c]' : 'text-gray-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: CONTACT INFORMATION */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
                  <p className="text-sm text-gray-500">Your current address and contact details.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="contact-email">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="info.mustaghistech@gmail.com"
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.email ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="contact-phone">
                      Phone Number (with country code)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="e.g. +91 98765 43210"
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Current Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="contact-address">
                      Current Address *
                    </label>
                    <input
                      id="contact-address"
                      type="text"
                      value={form.address}
                      onChange={set('address')}
                      placeholder="Street address"
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.address ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.address && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.address}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="contact-city">
                      City *
                    </label>
                    <input
                      id="contact-city"
                      type="text"
                      value={form.city}
                      onChange={set('city')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.city ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.city && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.city}</p>}
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="contact-postal">
                      Postal Code
                    </label>
                    <input
                      id="contact-postal"
                      type="text"
                      value={form.postalCode}
                      onChange={set('postalCode')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Country of Residence */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="contact-country">
                      Country of Residence *
                    </label>
                    <input
                      id="contact-country"
                      type="text"
                      value={form.countryOfResidence}
                      onChange={set('countryOfResidence')}
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.countryOfResidence ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.countryOfResidence && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.countryOfResidence}</p>}
                  </div>

                  {/* Spacer for 2nd column in row 4 */}
                  <div className="hidden sm:block" />

                  {/* Emergency Contact Header */}
                  <div className="sm:col-span-2 pt-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Emergency Contact
                    </h3>
                  </div>

                  {/* Emergency Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="emergency-name">
                      Full Name
                    </label>
                    <input
                      id="emergency-name"
                      type="text"
                      value={form.emergencyName}
                      onChange={set('emergencyName')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Emergency Phone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="emergency-phone">
                      Phone
                    </label>
                    <input
                      id="emergency-phone"
                      type="tel"
                      value={form.emergencyPhone}
                      onChange={set('emergencyPhone')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: TRAVEL & VISA */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Travel & Visa Details</h2>
                  <p className="text-sm text-gray-500">Specify your visa type and travel plans.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Visa Type Selection */}
                  <div className="space-y-1.5 relative" ref={visaRef}>
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="visa_type">
                      Visa Type *
                    </label>
                    <button
                      type="button"
                      id="visa_type"
                      onClick={() => setVisaOpen((v) => !v)}
                      className="flex h-12 w-full items-center justify-between rounded-lg border-2 border-[#ea580c] bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{form.visaType === 'business' ? '💼' : form.visaType === 'student' ? '🎓' : form.visaType === 'transit' ? '👥' : form.visaType === 'work' ? '💼' : '🏖️'}</span>
                        <span className="capitalize">{form.visaType ? `${form.visaType.charAt(0).toUpperCase() + form.visaType.slice(1)} Visa` : 'Tourist Visa'}</span>
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${visaOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {visaOpen && (
                      <div className="absolute top-[calc(100%+4px)] left-0 w-full rounded-lg border border-gray-200 bg-white shadow-lg z-50 py-1 text-sm overflow-hidden animate-in fade-in-50">
                        {[
                          { val: 'tourist', label: 'Tourist Visa', icon: '🏖️' },
                          { val: 'business', label: 'Business Visa', icon: '💼' },
                          { val: 'student', label: 'Student Visa', icon: '🎓' },
                          { val: 'transit', label: 'Transit Visa', icon: '👥' },
                          { val: 'work', label: 'Work Visa', icon: '💼' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              set('visaType')({ target: { value: item.val } })
                              setVisaOpen(false)
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left cursor-pointer hover:bg-orange-50 hover:text-[#ea580c] transition-colors ${
                              form.visaType === item.val ? 'bg-orange-50 font-medium text-[#ea580c]' : 'text-gray-700'
                            }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Purpose of Visit */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="travel-purpose">
                      Purpose of Visit *
                    </label>
                    <input
                      id="travel-purpose"
                      type="text"
                      value={form.purpose}
                      onChange={set('purpose')}
                      placeholder="e.g. Tourism / Vacation"
                      className={`flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors ${
                        errors.purpose ? 'border-rose-500' : ''
                      }`}
                    />
                    {errors.purpose && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.purpose}</p>}
                  </div>

                  {/* Intended Arrival Date */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="travel-arrival">
                      Intended Arrival Date
                    </label>
                    <input
                      id="travel-arrival"
                      type="date"
                      value={form.arrival}
                      onChange={set('arrival')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Intended Return Date */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="travel-return">
                      Intended Return Date
                    </label>
                    <input
                      id="travel-return"
                      type="date"
                      value={form.returnDate}
                      onChange={set('returnDate')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Accommodation in Cyprus Header */}
                  <div className="sm:col-span-2 pt-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Accommodation in Cyprus
                    </h3>
                  </div>

                  {/* Accommodation Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="accommodation-address">
                      Accommodation Address
                    </label>
                    <input
                      id="accommodation-address"
                      type="text"
                      value={form.destinationAddress}
                      onChange={set('destinationAddress')}
                      placeholder="Hotel or host address in Cyprus"
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Host / Contact Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="host-name">
                      Host / Contact Name
                    </label>
                    <input
                      id="host-name"
                      type="text"
                      value={form.hostName}
                      onChange={set('hostName')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Host Phone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 block" htmlFor="host-phone">
                      Host Phone
                    </label>
                    <input
                      id="host-phone"
                      type="tel"
                      value={form.hostPhone}
                      onChange={set('hostPhone')}
                      className="flex h-12 w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REQUIRED DOCUMENTS */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Required Documents</h2>
                  <p className="text-sm text-gray-500">Upload all required documents. Accepted formats: PDF, JPG, PNG.</p>
                </div>

                {/* Important Notice Banner */}
                <div className="rounded-xl border border-amber-200/90 bg-[#fffbf2] p-4 text-xs text-amber-950 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-amber-700 font-bold text-xs">
                    !
                  </div>
                  <p className="leading-relaxed text-gray-700 text-xs">
                    <strong className="font-semibold text-gray-900">Important:</strong> All documents must be clear, legible scans. Passport must be valid for at least 6 months beyond your intended stay. Incomplete documentation may delay processing.
                  </p>
                </div>

                {/* General Documents Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 block">
                    General Documents
                  </h3>

                  {[
                    {
                      key: 'passportFile',
                      title: 'Passport Copy (Bio-data Page)',
                      required: true,
                      desc: 'Clear scan of passport bio-data page. Must be valid for at least 6 months.',
                      icon: FileText,
                    },
                    {
                      key: 'photoFile',
                      title: 'Passport Size Photographs (2x)',
                      required: true,
                      desc: 'Recent colour photo, white background, 35mm × 45mm.',
                      icon: User,
                    },
                    {
                      key: 'insuranceFile',
                      title: 'Travel Medical Insurance',
                      required: true,
                      desc: 'Coverage of min. €30,000 valid for entire stay in Cyprus.',
                      icon: ShieldCheck,
                    },
                    {
                      key: 'bankStatementFile',
                      title: 'Bank Statement (Last 6 Months)',
                      required: true,
                      desc: 'Official bank statement showing sufficient funds for the trip.',
                      icon: FileText,
                    },
                    {
                      key: 'hotelFile',
                      title: 'Proof of Accommodation',
                      required: true,
                      desc: "Hotel booking confirmation or host's invitation with address.",
                      icon: FileText,
                    },
                    {
                      key: 'flightFile',
                      title: 'Flight Itinerary / Booking',
                      required: false,
                      desc: 'Round-trip flight reservation showing entry and exit dates.',
                      icon: Plane,
                    },
                    {
                      key: 'coverLetterFile',
                      title: 'Cover Letter',
                      required: false,
                      desc: 'Explaining purpose of visit, travel dates, and itinerary.',
                      icon: FileText,
                    },
                  ].map((doc) => {
                    const Icon = doc.icon
                    const isUploaded = !!form[doc.key]

                    return (
                      <label
                        key={doc.key}
                        className={`flex items-center justify-between p-4 rounded-xl border border-dashed transition-all cursor-pointer ${
                          isUploaded
                            ? 'border-[#ea580c] bg-orange-50/20'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-[#f8fafc]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 pr-4 flex-1">
                          <div className={`shrink-0 ${isUploaded ? 'text-[#ea580c]' : 'text-gray-400'}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <span>{doc.title}</span>
                              {doc.required && <span className="text-rose-500 font-bold">*</span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {isUploaded ? (
                                <span className="text-[#ea580c] font-medium flex items-center gap-1">
                                  <Check size={12} /> {form[doc.key]}
                                </span>
                              ) : (
                                doc.desc
                              )}
                            </p>
                          </div>
                        </div>

                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange(doc.key)}
                          className="hidden"
                        />
                      </label>
                    )
                  })}
                </div>

                {/* Additional Documents (Optional) Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 block">
                    Additional Documents (Optional)
                  </h3>

                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border border-dashed transition-all cursor-pointer ${
                      form.additionalFile
                        ? 'border-[#ea580c] bg-orange-50/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-[#f8fafc]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-4 flex-1">
                      <div className={`shrink-0 ${form.additionalFile ? 'text-[#ea580c]' : 'text-gray-400'}`}>
                        <FolderOpen size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Any Additional Supporting Documents
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {form.additionalFile ? (
                            <span className="text-[#ea580c] font-medium flex items-center gap-1">
                              <Check size={12} /> {form.additionalFile}
                            </span>
                          ) : (
                            'NOC, marriage certificate, previous visas, or any other supporting document.'
                          )}
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange('additionalFile')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Review Your Application</h2>
                  <p className="text-sm text-gray-500">Please verify all information before submitting.</p>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="font-semibold text-gray-900">{form.fullName || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Nationality:</span>
                      <span className="font-semibold text-gray-900">{form.nationality || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Passport No.:</span>
                      <span className="font-semibold text-gray-900">{form.passport || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Passport Expiry:</span>
                      <span className="font-semibold text-gray-900">{form.passportExpiry || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-semibold text-gray-900">{form.dob || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-semibold text-gray-900 capitalize">{form.gender || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Place of Birth:</span>
                      <span className="font-semibold text-gray-900">{form.placeOfBirth || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Marital Status:</span>
                      <span className="font-semibold text-gray-900 capitalize">{form.maritalStatus || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-semibold text-gray-900 truncate">{form.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-semibold text-gray-900">{form.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Address:</span>
                      <span className="font-semibold text-gray-900 truncate">
                        {form.address ? `${form.address}${form.city ? `, ${form.city}` : ''}` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Emergency Contact:</span>
                      <span className="font-semibold text-gray-900 truncate">
                        {form.emergencyName ? `${form.emergencyName}${form.emergencyPhone ? ` (${form.emergencyPhone})` : ''}` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Travel Details Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Travel Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Visa Type:</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {form.visaType ? `${form.visaType.charAt(0).toUpperCase() + form.visaType.slice(1)}` : 'Tourist'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Purpose:</span>
                      <span className="font-semibold text-gray-900">{form.purpose || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Arrival:</span>
                      <span className="font-semibold text-gray-900">{form.arrival || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Return:</span>
                      <span className="font-semibold text-gray-900">{form.returnDate || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Accommodation:</span>
                      <span className="font-semibold text-gray-900 truncate">{form.destinationAddress || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Uploaded Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                    {[
                      { key: 'passportFile', label: 'Passport Copy' },
                      { key: 'photoFile', label: 'Passport Photo' },
                      { key: 'insuranceFile', label: 'Travel Medical Insurance' },
                      { key: 'bankStatementFile', label: 'Bank Statement' },
                      { key: 'hotelFile', label: 'Proof of Accommodation' },
                      { key: 'flightFile', label: 'Flight Itinerary' },
                      { key: 'coverLetterFile', label: 'Cover Letter' },
                      { key: 'additionalFile', label: 'Additional Supporting Documents' },
                    ]
                      .filter((d) => form[d.key])
                      .map((d) => (
                        <div key={d.key} className="flex items-center gap-2 text-gray-700 min-w-0">
                          <div className="h-4 w-4 rounded-full border border-amber-600 flex items-center justify-center shrink-0 text-amber-600">
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span className="text-gray-700 truncate" title={form[d.key]}>
                            {form[d.key]}
                          </span>
                        </div>
                      ))}
                    {![
                      'passportFile', 'photoFile', 'insuranceFile', 'bankStatementFile',
                      'hotelFile', 'flightFile', 'coverLetterFile', 'additionalFile'
                    ].some((k) => form[k]) && (
                      <p className="text-xs text-gray-400 italic sm:col-span-2">No documents uploaded yet.</p>
                    )}
                  </div>
                </div>

                {/* Declaration Box */}
                <div className="rounded-xl border border-gray-200/90 bg-[#f8fafc]/90 p-4 sm:p-5 text-xs text-gray-500 leading-relaxed">
                  By submitting this application, I declare that all information provided is true and correct to the best of my knowledge. I understand that providing false information may result in rejection of my visa application and possible legal action. I authorise the Republic of Cyprus to verify any information provided herein.
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
              >
                ← Previous
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] bg-foreground text-background hover:bg-foreground/90 h-10 px-4 py-2 cursor-pointer"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
