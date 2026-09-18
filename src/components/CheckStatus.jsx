import { useState, useEffect, useRef } from 'react'
import {
  Info,
  Calendar,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import { checkVisaStatus } from '../services/visaService'

function generateCaptcha() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function CaptchaImage({ code, onRefresh }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Background
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#ebf0f5'
    ctx.fillRect(0, 0, width, height)

    // Background noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = ['#94a3b8', '#64748b', '#cbd5e1', '#475569'][Math.floor(Math.random() * 4)]
      ctx.beginPath()
      const x = Math.random() * width
      const y = Math.random() * height
      const r = Math.random() * 1.6 + 0.6
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Underneath scratch lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = '#b0c4de'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * (width * 0.3), Math.random() * height)
      ctx.lineTo(width * 0.7 + Math.random() * (width * 0.3), Math.random() * height)
      ctx.stroke()
    }

    // Characters with distinct tilt/rotation, size and offset
    const letters = code.split('')
    const startX = 14
    const charSpacing = (width - 28) / letters.length

    letters.forEach((char, idx) => {
      ctx.save()
      const posX = startX + idx * charSpacing + 10
      const posY = height / 2 + (Math.sin(idx * 1.3) * 4) + (Math.random() * 4 - 2)

      // Alternating/random rotations (-22deg to +22deg) for distorted authentic look
      const baseAngles = [-18, 12, -15, 20, -10, 16]
      const angle = ((baseAngles[idx % baseAngles.length] || (Math.random() * 30 - 15)) + (Math.random() * 8 - 4)) * (Math.PI / 180)

      ctx.translate(posX, posY)
      ctx.rotate(angle)

      const fontWeights = ['800', '900', 'bold']
      const fontFamilies = ['Arial', 'Verdana', 'Trebuchet MS', 'sans-serif']
      const weight = fontWeights[idx % fontWeights.length]
      const family = fontFamilies[idx % fontFamilies.length]
      const size = 26 + (idx % 2 === 0 ? 2 : -1)

      ctx.font = `${weight} ${size}px ${family}`
      ctx.fillStyle = '#142942' // dark navy color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })

    // Foreground strike-through lines cutting across letters (as seen in screenshot)
    ctx.strokeStyle = '#8fa6c2'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(10, height * 0.7)
    ctx.lineTo(width * 0.85, height * 0.5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.2, height * 0.35)
    ctx.lineTo(width - 15, height * 0.45)
    ctx.stroke()

    // Additional short scratch
    ctx.beginPath()
    ctx.moveTo(25, 12)
    ctx.lineTo(35, 10)
    ctx.stroke()

  }, [code])

  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-[#ebf0f5] inline-block">
        <canvas
          ref={canvasRef}
          width={180}
          height={54}
          className="block select-none pointer-events-none"
          aria-label="Security check CAPTCHA image"
        />
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
      >
        <RotateCw size={14} className="text-slate-500" />
        <span>Refresh</span>
      </button>
    </div>
  )
}

export default function CheckStatus({ onNavigate = () => {} }) {
  const [passport, setPassport] = useState('')
  const [dob, setDob] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaCode, setCaptchaCode] = useState('5PAANS')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const dateInputRef = useRef(null)

  useEffect(() => {
    setCaptchaCode(generateCaptcha())
  }, [])

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha())
    setCaptchaInput('')
    setErrors((prev) => ({ ...prev, captcha: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!passport.trim()) {
      errs.passport = 'Please enter your passport number.'
    }
    if (!dob.trim()) {
      errs.dob = 'Please enter your date of birth.'
    }
    if (!captchaInput.trim()) {
      errs.captcha = 'Please enter the security check code.'
    } else if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      errs.captcha = 'Incorrect security code. Please try again.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setResult(null)
    setNotFound(false)

    if (!validate()) return

    setLoading(true)
    const res = await checkVisaStatus(passport, dob)
    setLoading(false)

    if (res.found && res.application) {
      sessionStorage.setItem('current_visa_result', JSON.stringify(res.application))
      // Update browser search params to reflect ?passport=...&dob=...
      const url = new URL(window.location)
      url.searchParams.set('passport', passport.trim().toUpperCase())
      url.searchParams.set('dob', dob.trim())
      window.history.pushState({}, '', url)
      
      onNavigate('result')
    } else {
      setNotFound(true)
    }
  }

  const handleClear = () => {
    setPassport('')
    setDob('')
    setCaptchaInput('')
    setErrors({})
    setResult(null)
    setNotFound(false)
    refreshCaptcha()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <button
            onClick={() => onNavigate('home')}
            className="text-sky-700 hover:underline hover:text-sky-800 font-medium"
          >
            Home
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Check Visa Status</span>
        </nav>

        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight leading-snug">
            Check Visa Status
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-3xl leading-relaxed">
            Use this service to check the current status of your Republic of Cyprus visa application.
            You will need your passport number and date of birth as submitted in your application.
          </p>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Result Card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">Application details</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-6">All fields are required.</p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Field 1: Passport Number */}
                <div>
                  <label htmlFor="passport-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Passport number
                  </label>
                  <input
                    id="passport-input"
                    type="text"
                    value={passport}
                    onChange={(e) => {
                      setPassport(e.target.value.toUpperCase())
                      if (errors.passport) setErrors((p) => ({ ...p, passport: undefined }))
                    }}
                    placeholder="e.g. K1234567"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-colors ${
                      errors.passport ? 'border-rose-500 ring-1 ring-rose-400' : 'border-slate-300 focus:border-sky-600'
                    }`}
                  />
                  {errors.passport && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                      <AlertCircle size={13} />
                      {errors.passport}
                    </p>
                  )}
                </div>

                {/* Field 2: Date of Birth */}
                <div>
                  <label htmlFor="dob-input" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Date of birth
                  </label>
                  <div className="relative">
                    <input
                      id="dob-input"
                      ref={dateInputRef}
                      type="text"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value)
                        if (errors.dob) setErrors((p) => ({ ...p, dob: undefined }))
                      }}
                      placeholder="dd/mm/yyyy"
                      className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-colors ${
                        errors.dob ? 'border-rose-500 ring-1 ring-rose-400' : 'border-slate-300 focus:border-sky-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0]
                        if (!dob) setDob('15/05/1990')
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                      title="Calendar"
                    >
                      <Calendar size={18} />
                    </button>
                  </div>
                  {errors.dob && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                      <AlertCircle size={13} />
                      {errors.dob}
                    </p>
                  )}
                </div>

                {/* Field 3: Security Check */}
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Security check
                  </label>
                  <p className="text-xs text-slate-500 mb-2.5">Type the characters shown in the image below.</p>

                  {/* Distorted Captcha Canvas Display & Refresh Button */}
                  <CaptchaImage code={captchaCode} onRefresh={refreshCaptcha} />

                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value.toUpperCase())
                      if (errors.captcha) setErrors((p) => ({ ...p, captcha: undefined }))
                    }}
                    placeholder="Enter code"
                    className={`max-w-xs w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-colors ${
                      errors.captcha ? 'border-rose-500 ring-1 ring-rose-400' : 'border-slate-300 focus:border-sky-600'
                    }`}
                  />
                  {errors.captcha && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                      <AlertCircle size={13} />
                      {errors.captcha}
                    </p>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="pt-3 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-[#183048] hover:bg-[#122438] active:bg-[#0c1826] rounded-md transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <RotateCw size={14} className="animate-spin" />
                        Checking...
                      </span>
                    ) : (
                      'Check status'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                  >
                    Clear form
                  </button>
                </div>
              </form>

              {/* GDPR Statement Banner */}
              <div className="mt-8 rounded-lg bg-[#f0f6fa] border border-[#d8e8f2] p-4 flex items-start gap-3 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                <ShieldCheck size={18} className="text-[#183048] shrink-0 mt-0.5" />
                <p>
                  Your data is processed by the Civil Registry and Migration Department of the Republic of Cyprus in
                  accordance with the General Data Protection Regulation (GDPR).
                </p>
              </div>
            </div>

            {/* Application Not Found Notice */}
            {notFound && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-5 text-sm text-rose-900 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <XCircle size={18} className="text-rose-600 shrink-0" />
                  No Application Record Found
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-rose-700 leading-relaxed">
                  We could not find an application matching passport number <strong className="font-mono">{passport}</strong>.
                  Please check the details or apply for a new visa.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => onNavigate('apply')}
                    className="text-xs font-semibold text-rose-800 hover:underline inline-flex items-center gap-1"
                  >
                    Submit a visa application <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Official Status Result Card */}
            {result && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6 animate-fadeIn">
                {/* Result Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Official Application Record
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      {result.full_name || 'Applicant'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Ref: <span className="font-bold text-slate-700">{result.reference_number}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={result.status} />
                    <button
                      onClick={handlePrint}
                      className="text-xs text-sky-700 hover:text-sky-900 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Printer size={13} /> Print Verification
                    </button>
                  </div>
                </div>

                {/* Status Remarks */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Consular & Department Remarks
                  </p>
                  <p className="mt-1 text-sm text-slate-800 leading-relaxed font-medium">
                    {result.admin_notes || 'Your application is currently being processed by the consular officers.'}
                  </p>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Visa Type</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block capitalize">
                      {result.visa_type || 'Tourist'} Visa
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Passport Number</span>
                    <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                      {result.passport || passport}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Submission</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {result.created_at ? new Date(result.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Last Updated</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {result.updated_at ? new Date(result.updated_at).toLocaleDateString() : 'Up to date'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Information Cards */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: About the Republic of Cyprus */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-slate-700 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">About the Republic of Cyprus</h3>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Cyprus is an island country in the Eastern Mediterranean and a member state of the European Union since
                2004. Its capital is Nicosia and its official languages are Greek and Turkish.
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Capital</span>
                  <span className="font-semibold text-slate-900">Nicosia</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                  <span className="text-slate-500">Currency</span>
                  <span className="font-semibold text-slate-900">Euro (€)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                  <span className="text-slate-500">Time zone</span>
                  <span className="font-semibold text-slate-900">EET (UTC+2)</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-100">
                  <span className="text-slate-500">Calling code</span>
                  <span className="font-semibold text-slate-900">+357</span>
                </div>
              </div>
            </div>

            {/* Card 2: Need help? */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Need help?</h3>
              <ul className="space-y-2 text-xs sm:text-[13px]">
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="text-sky-700 hover:text-sky-900 hover:underline text-left"
                  >
                    Contact the Migration Department
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('home')}
                    className="text-sky-700 hover:text-sky-900 hover:underline text-left"
                  >
                    Frequently asked questions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('apply')}
                    className="text-sky-700 hover:text-sky-900 hover:underline text-left"
                  >
                    Visa application guides
                  </button>
                </li>
              </ul>
            </div>

            {/* Card 3: Processing times */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">Processing times</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Most short-stay visa applications are processed within 15 calendar days. Long-stay and category-specific
                applications may take longer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

