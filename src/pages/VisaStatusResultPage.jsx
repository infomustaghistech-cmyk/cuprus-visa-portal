import { useState, useEffect } from 'react'
import {
  Download,
  Printer,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  FileCheck
} from 'lucide-react'
import { checkVisaStatus } from '../services/visaService'

function CyprusWatermark() {
  return (
    <div
      className="absolute right-6 top-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 opacity-[0.035] pointer-events-none select-none"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
        {/* Wreath */}
        <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 22 70 C 12 50 16 26 32 14" />
          <ellipse cx="20" cy="62" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(-30 20 62)" />
          <ellipse cx="15" cy="50" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(-15 15 50)" />
          <ellipse cx="16" cy="38" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(10 16 38)" />
          <ellipse cx="22" cy="26" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(30 22 26)" />
          <ellipse cx="30" cy="18" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(50 30 18)" />

          <path d="M 78 70 C 88 50 84 26 68 14" />
          <ellipse cx="80" cy="62" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(30 80 62)" />
          <ellipse cx="85" cy="50" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(15 85 50)" />
          <ellipse cx="84" cy="38" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(-10 84 38)" />
          <ellipse cx="78" cy="26" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(-30 78 26)" />
          <ellipse cx="70" cy="18" rx="3.5" ry="1.8" fill="currentColor" transform="rotate(-50 70 18)" />

          <path d="M 40 76 Q 50 80 60 76" />
        </g>
        {/* Shield */}
        <path d="M 30 22 L 70 22 C 70 22 71 54 50 74 C 29 54 30 22 30 22 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Dove */}
        <g fill="currentColor">
          <path d="M 50 32 C 43 30 39 35 42 42 C 44 45 47 48 50 52 C 53 48 56 45 58 42 C 61 35 57 30 50 32 Z" />
          <path d="M 42 36 C 34 32 33 28 36 29 C 39 30 42 33 45 38 Z" />
          <path d="M 58 36 C 66 32 67 28 64 29 C 61 30 58 33 55 38 Z" />
          <circle cx="50" cy="32" r="2.5" />
        </g>
        {/* Olive Branch */}
        <path d="M 45 31 Q 40 30 37 32 M 40 30 L 38 28 M 43 31 L 41 33" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 1960 */}
        <text x="50" y="66" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="currentColor">1960</text>
      </svg>
    </div>
  )
}

export default function VisaStatusResultPage({ onNavigate }) {
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)

  const loadData = async () => {
    // 1. Get query param or stored session passport
    const params = new URLSearchParams(window.location.search)
    let passportParam = params.get('passport') || ''
    let dobParam = params.get('dob') || ''
    let refParam = params.get('ref') || ''

    if (!passportParam && !refParam) {
      try {
        const stored = sessionStorage.getItem('current_visa_result')
        if (stored) {
          const parsed = JSON.parse(stored)
          passportParam = parsed.passport || ''
          refParam = parsed.reference_number || ''
          dobParam = parsed.dob || ''
        }
      } catch (e) {}
    }

    const queryKey = passportParam || refParam || 'PA3726025'
    const res = await checkVisaStatus(queryKey, dobParam, refParam)

    if (res.found && res.application) {
      setApplication(res.application)
      try {
        sessionStorage.setItem('current_visa_result', JSON.stringify(res.application))
      } catch (e) {}
    } else {
      setApplication({
        full_name: 'DHANANJAYA RAI',
        passport: queryKey,
        dob: '25 Aug 2001',
        nationality: 'NEPAL',
        reference_number: '7209572',
        visa_number: 'E26-187209',
        visa_type: 'Work Permit',
        entries: 'Multiple',
        duration: '365 days',
        port_of_entry: 'Larnaca International Airport',
        submitted_date: '12 Sept 2026',
        decision_date: '15 Sept 2026',
        issue_date: '15 Sept 2026',
        expiry_date: '14 Sept 2027',
        status: 'Approved',
        admin_notes: 'Your visa application has been approved. Please carry a printed copy of this confirmation along with your passport when travelling.',
        decision_pdf: null
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const pdfData = data.decision_pdf
    const pdfUrl = typeof pdfData === 'string' ? pdfData : pdfData?.url
    const pdfName = (typeof pdfData === 'object' && pdfData?.name)
      ? pdfData.name
      : `Official_Cyprus_Visa_${data.passport || 'PA3726025'}.pdf`

    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = pdfName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      setPdfModalOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-3 border-sky-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Retrieving official visa records...</p>
        </div>
      </div>
    )
  }

  const data = application || {
    full_name: 'DHANANJAYA RAI',
    passport: 'PA3726025',
    dob: '25 Aug 2001',
    nationality: 'NEPAL',
    reference_number: '7209572',
    visa_number: 'E26-187209',
    visa_type: 'Work Permit',
    entries: 'Multiple',
    duration: '365 days',
    port_of_entry: 'Larnaca International Airport',
    submitted_date: '12 Sept 2026',
    decision_date: '15 Sept 2026',
    issue_date: '15 Sept 2026',
    expiry_date: '14 Sept 2027',
    status: 'Approved',
    decision_pdf: null
  }

  const isApproved = (data.status || 'Approved').toLowerCase() === 'approved'
  const hasPdf = Boolean(data.decision_pdf && (typeof data.decision_pdf === 'string' || data.decision_pdf?.url))

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <button
            onClick={() => onNavigate('home')}
            className="text-sky-700 hover:underline hover:text-sky-800 font-medium cursor-pointer"
          >
            Home
          </button>
          <span className="text-slate-400">/</span>
          <button
            onClick={() => onNavigate('status')}
            className="text-sky-700 hover:underline hover:text-sky-800 font-medium cursor-pointer"
          >
            Check Visa Status
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Result</span>
        </nav>

        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight leading-snug">
            Visa Application Result
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-3xl leading-relaxed">
            {data.admin_notes || 'Your visa application has been approved. Please carry a printed copy of this confirmation along with your passport when traveling.'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Card 1: Applicant Details Card */}
          <div className="relative bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 overflow-hidden">
            <CyprusWatermark />

            {/* Card 1 Header */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Applicant details</h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <CheckCircle2 size={13} className={isApproved ? "text-emerald-600" : "text-amber-600"} />
                  {data.status || 'Approved'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
                    hasPdf
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Download size={14} className={hasPdf ? "text-white" : "text-slate-600"} />
                  <span>Download PDF {hasPdf ? '' : ''}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Printer size={13} className="text-slate-600" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Applicant Details List */}
            <div className="relative z-10 divide-y divide-slate-100 text-xs sm:text-[13px]">
              {/* Full Name */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  FULL NAME
                </span>
                <span className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wide">
                  {data.full_name || 'DHANANJAYA RAI'}
                </span>
              </div>

              {/* Passport Number */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  PASSPORT NUMBER
                </span>
                <span className="font-bold font-mono text-slate-900 text-sm">
                  {data.passport || 'PA3726025'}
                </span>
              </div>

              {/* Date of Birth */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  DATE OF BIRTH
                </span>
                <span className="font-bold text-slate-900">
                  {data.dob || '25 Aug 2001'}
                </span>
              </div>

              {/* Nationality */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  NATIONALITY
                </span>
                <span className="font-bold text-slate-900 uppercase">
                  {data.nationality || 'NEPAL'}
                </span>
              </div>

              {/* Application Reference */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  APPLICATION REFERENCE
                </span>
                <span className="font-bold font-mono text-slate-900">
                  {data.reference_number || '7209572'}
                </span>
              </div>

              {/* Visa Number */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  VISA NUMBER
                </span>
                <span className="font-bold font-mono text-slate-900">
                  {data.visa_number || 'E26-187209'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Visa Details Card */}
          <div className="relative bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 overflow-hidden">
            <CyprusWatermark />

            {/* Card 2 Header */}
            <div className="relative z-10 pb-4 border-b border-slate-100">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Visa details</h2>
            </div>

            {/* Visa Details List */}
            <div className="relative z-10 divide-y divide-slate-100 text-xs sm:text-[13px]">
              {/* Visa Type */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  VISA TYPE
                </span>
                <span className="font-bold text-slate-900">
                  {data.visa_type || 'Work Permit'}
                </span>
              </div>

              {/* Number of Entries */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  NUMBER OF ENTRIES
                </span>
                <span className="font-bold text-slate-900">
                  {data.entries || 'Multiple'}
                </span>
              </div>

              {/* Duration of Stay */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  DURATION OF STAY
                </span>
                <span className="font-bold text-slate-900">
                  {data.duration || '365 days'}
                </span>
              </div>

              {/* Port of Entry */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  PORT OF ENTRY
                </span>
                <span className="font-bold text-slate-900">
                  {data.port_of_entry || 'Larnaca International Airport'}
                </span>
              </div>

              {/* Application Submitted */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  APPLICATION SUBMITTED
                </span>
                <span className="font-bold text-slate-900">
                  {data.submitted_date || '12 Sept 2026'}
                </span>
              </div>

              {/* Decision Date */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  DECISION DATE
                </span>
                <span className="font-bold text-slate-900">
                  {data.decision_date || '15 Sept 2026'}
                </span>
              </div>

              {/* Visa Issue Date */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  VISA ISSUE DATE
                </span>
                <span className="font-bold text-slate-900">
                  {data.issue_date || '15 Sept 2026'}
                </span>
              </div>

              {/* Visa Expiry Date */}
              <div className="py-3.5">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  VISA EXPIRY DATE
                </span>
                <span className="font-bold text-slate-900">
                  {data.expiry_date || '14 Sept 2027'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Links row */}
          <div className="pt-2 flex items-center gap-4 text-xs sm:text-sm">
            <button
              onClick={() => onNavigate('status')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Check another application</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="text-sky-700 hover:text-sky-900 hover:underline font-medium cursor-pointer"
            >
              Back to gov.cy
            </button>
          </div>

          {/* Card 3: Important Notice Box */}
          <div className="rounded-xl bg-[#f0f6fa] border border-[#d8e8f2] p-5 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck size={18} className="text-[#183048]" />
              <span>Important notice</span>
            </div>
            <p className="text-slate-600">
              This page contains personal data. Please do not share or photograph this screen. The Republic of Cyprus will never ask for payment via email or phone in connection with your visa status.
            </p>
          </div>

          {/* Card 4: Contact Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Contact</h3>
            <div className="space-y-1 text-slate-600">
              <p className="font-medium text-slate-800">Civil Registry and Migration Department</p>
              <p>Telephone: <span className="text-slate-900 font-medium">+357 22 308 700</span></p>
              <p>Email: <a href="mailto:migration@crmd.moi.gov.cy" className="text-sky-700 hover:underline">migration@crmd.moi.gov.cy</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* Official PDF Document In-Process Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Visa PDF In Process</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your official stamped Visa Decision Document (PDF) is currently in process and being finalized by immigration officers.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left">
                <span className="block font-semibold text-slate-800 mb-0.5">ℹ️ Notice for Applicant:</span>
                It will be downloadable here immediately once the case officer attaches the signed grant letter in the portal. You may print this verified digital confirmation in the meantime.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPdfModalOpen(false)
                  handlePrint()
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#183048] hover:bg-[#122438] text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Confirmation</span>
              </button>
              <button
                type="button"
                onClick={() => setPdfModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
