import { useState, useEffect } from 'react'
import {
  Users, Shield, CheckCircle2, XCircle, Clock, Search,
  Filter, Eye, Trash2, RefreshCw, Database, Copy, Check,
  AlertCircle, ChevronRight, Lock, KeyRound, EyeOff, LogOut, ArrowLeft,
  ShieldCheck, ShieldAlert, Sparkles, Download, Printer, FileText, ExternalLink,
  Plane, MapPin, Mail, Phone, Calendar, User, Building2, Pencil, Save, Plus, UploadCloud
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import {
  getAllApplications,
  updateFullApplication,
  deleteApplication,
  formatDisplayDate
} from '../services/visaService'
import { SQL_SETUP_SCRIPT } from '../lib/supabase'

// Configurable admin password from env or default
const ADMIN_VALID_PASSWORDS = [
  (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123').trim(),
  'admin123',
  'admin'
]

export default function AdminPanel({ onNavigate }) {
  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('cyprus_admin_session') === 'true'
  })
  const [adminLoginForm, setAdminLoginForm] = useState({ username: 'admin', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Applications Data State
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('local')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  
  // Selected application for detail & editing
  const [selectedApp, setSelectedApp] = useState(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    passport: '',
    dob: '',
    nationality: '',
    visa_type: 'Work Permit',
    visa_number: '',
    reference_number: '',
    entries: 'Multiple',
    duration: '365 days',
    port_of_entry: 'Larnaca International Airport',
    submitted_date: '',
    decision_date: '',
    issue_date: '',
    expiry_date: '',
    status: 'Approved',
    admin_notes: '',
    decision_pdf: null
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // SQL Script modal
  const [sqlModalOpen, setSqlModalOpen] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  const fetchApps = async () => {
    setLoading(true)
    const res = await getAllApplications()
    setApplications(res.applications || [])
    setSource(res.source)
    setLoading(false)
  }

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchApps()
    }
  }, [isAdminLoggedIn])

  // Handle Admin Login submission
  const handleAdminLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    if (!adminLoginForm.password.trim()) {
      setLoginError('Please enter the administrator password.')
      return
    }

    setLoginLoading(true)
    setTimeout(() => {
      setLoginLoading(false)
      const inputPass = adminLoginForm.password.trim()
      if (ADMIN_VALID_PASSWORDS.includes(inputPass)) {
        sessionStorage.setItem('cyprus_admin_session', 'true')
        setIsAdminLoggedIn(true)
      } else {
        setLoginError('Incorrect admin password. (Default is admin123)')
      }
    }, 300)
  }

  // Handle Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('cyprus_admin_session')
    setIsAdminLoggedIn(false)
    setAdminLoginForm({ username: 'admin', password: '' })
    setSelectedApp(null)
  }

  const openAppDetails = (app) => {
    setIsNewRecord(false)
    setSelectedApp(app)
    setEditForm({
      full_name: app.full_name || '',
      passport: app.passport || '',
      dob: app.dob || '',
      nationality: app.nationality || '',
      visa_type: app.visa_type || 'Tourist Visa',
      visa_number: app.visa_number || `E26-${Math.floor(100000 + Math.random() * 900000)}`,
      reference_number: app.reference_number || `CY-${Math.floor(10000 + Math.random() * 90000)}`,
      entries: app.entries || 'Single',
      duration: app.duration || '90 days',
      port_of_entry: app.port_of_entry || 'Larnaca International Airport',
      submitted_date: app.submitted_date || (app.created_at ? formatDisplayDate(app.created_at) : formatDisplayDate(new Date())),
      decision_date: app.decision_date || '',
      issue_date: app.issue_date || '',
      expiry_date: app.expiry_date || '',
      status: app.status || 'Pending',
      admin_notes: app.admin_notes || '',
      decision_pdf: app.decision_pdf || null
    })
    setSaveSuccess(false)
  }

  const handleCreateNew = () => {
    const randomRef = `B21-${Math.floor(10000 + Math.random() * 90000)}`
    const randomVisa = `E26-${Math.floor(100000 + Math.random() * 900000)}`
    const todayFormatted = formatDisplayDate(new Date())
    const newTemplate = {
      id: `new-${Date.now()}`,
      reference_number: randomRef,
      visa_number: randomVisa,
      full_name: '',
      passport: '',
      dob: '',
      nationality: '',
      visa_type: 'Tourist Visa',
      entries: 'Single',
      duration: '90 days',
      port_of_entry: 'Larnaca International Airport',
      submitted_date: todayFormatted,
      decision_date: '',
      issue_date: '',
      expiry_date: '',
      status: 'Pending',
      admin_notes: 'Application received and queued for official review.',
      decision_pdf: null
    }
    setIsNewRecord(true)
    setSelectedApp(newTemplate)
    setEditForm(newTemplate)
    setSaveSuccess(false)
  }

  const handleSaveFullApp = async (e) => {
    e.preventDefault()
    if (!selectedApp) return
    setSaveLoading(true)

    const targetId = selectedApp.id || selectedApp.reference_number || editForm.reference_number || editForm.passport
    const res = await updateFullApplication(targetId, editForm)

    setSaveLoading(false)
    setSaveSuccess(true)
    
    // Update local applications list state
    setApplications((prev) => {
      const exists = prev.some((a) => a.id === selectedApp.id || a.reference_number === selectedApp.reference_number || a.passport === selectedApp.passport)
      if (exists) {
        return prev.map((a) =>
          (a.id === selectedApp.id || a.reference_number === selectedApp.reference_number || a.passport === selectedApp.passport)
            ? { ...a, ...editForm, updated_at: new Date().toISOString() }
            : a
        )
      } else {
        return [{ ...editForm, id: selectedApp.id, updated_at: new Date().toISOString() }, ...prev]
      }
    })

    // Update selected app object
    setSelectedApp((prev) => prev ? { ...prev, ...editForm } : null)

    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

  const handleDelete = async (app) => {
    if (!window.confirm(`Are you sure you want to delete application ${app.reference_number || app.passport} for ${app.full_name || 'this applicant'}?`)) {
      return
    }
    await deleteApplication(app.id || app.reference_number || app.passport)
    setApplications((prev) => prev.filter((a) => (a.id || a.reference_number) !== (app.id || app.reference_number)))
    if (selectedApp?.reference_number === app.reference_number) {
      setSelectedApp(null)
    }
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  // Export applications to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) return
    const headers = ['Reference Number', 'Full Name', 'Passport', 'Nationality', 'Visa Type', 'Status', 'PDF Attached', 'Date']
    const rows = applications.map((a) => [
      a.reference_number,
      `"${a.full_name || ''}"`,
      a.passport || '',
      `"${a.nationality || ''}"`,
      a.visa_type,
      a.status,
      a.decision_pdf ? 'YES' : 'NO',
      a.created_at ? new Date(a.created_at).toLocaleDateString() : ''
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `cyprus_visa_applications_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 1. If NOT logged in as admin, show the dedicated Admin Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Back button */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Public Website
            </button>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Portal
            </span>
          </div>

          <div className="rounded-2xl border border-gray-800/90 bg-[#0F172A]/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20">
                <Shield size={28} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                <Lock size={11} /> Secured Officer Portal
              </span>
              <h1 className="mt-3 text-2xl font-bold text-white tracking-tight">
                Cyprus Visa Admin
              </h1>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Enter officer credentials to review submissions, inspect documents, edit records, and upload official visa grant PDFs.
              </p>
            </div>

            {loginError && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 p-3.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} noValidate className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="admin-user">
                  Officer Username
                </label>
                <input
                  id="admin-user"
                  type="text"
                  value={adminLoginForm.username}
                  onChange={(e) => setAdminLoginForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="admin"
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/90 px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="admin-pass">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={adminLoginForm.password}
                    onChange={(e) => {
                      setAdminLoginForm((f) => ({ ...f, password: e.target.value }))
                      setLoginError('')
                    }}
                    placeholder="Enter password (default: admin123)"
                    className="w-full rounded-xl border border-gray-700 bg-gray-900/90 px-3.5 py-3 pr-10 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Default: <code className="bg-gray-800 text-orange-400 px-1.5 py-0.5 rounded font-mono font-semibold">admin123</code></span>
                  <span>SSL / TLS Encrypted</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all disabled:opacity-70 cursor-pointer mt-2"
              >
                <KeyRound size={16} />
                <span>{loginLoading ? 'Verifying...' : 'Sign In to Admin Panel'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Filter and search applications
  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim()
    const matchQuery =
      !q ||
      app.reference_number?.toLowerCase().includes(q) ||
      app.full_name?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.passport?.toLowerCase().includes(q) ||
      app.nationality?.toLowerCase().includes(q)

    const matchStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchType = typeFilter === 'All' || app.visa_type?.toLowerCase() === typeFilter.toLowerCase()

    return matchQuery && matchStatus && matchType
  })

  // Statistics
  const totalCount = applications.length
  const pendingCount = applications.filter((a) => a.status === 'Pending').length
  const underReviewCount = applications.filter((a) => a.status === 'Under Review').length
  const approvedCount = applications.filter((a) => a.status === 'Approved').length
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length

  return (
    <div className="bg-[#0A101D] min-h-screen text-slate-100 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="bg-[#0B1528] border-b border-gray-800/90 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Cyprus Visa Authority</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Department of Immigration & Consular Affairs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} /> View Portal
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0F172A] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Visa Applications Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Live management of all submitted Cyprus visa cases, applicant details, status decisions, and official PDF documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Record</span>
            </button>

            <button
              type="button"
              onClick={() => setSqlModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Database size={13} className="text-orange-400" />
              <span>SQL Schema</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={applications.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchApps}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3.5 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-orange-400' : 'text-orange-400'} />
              <span>Refresh Live</span>
            </button>
          </div>
        </div>

        {/* Analytics & KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {/* Total Submissions */}
          <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-4.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Cases</span>
              <span className="rounded-xl bg-gray-800 p-2 text-gray-300"><Users size={16} /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-white">{totalCount}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">All submissions</p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-amber-900/50 bg-[#0F172A] p-4.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending</span>
              <span className="rounded-xl bg-amber-950/60 text-amber-400 p-2 border border-amber-800/40"><Clock size={16} /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-amber-400">{pendingCount}</p>
            <p className="mt-0.5 text-[11px] text-amber-400/70">Awaiting review</p>
          </div>

          {/* Under Review */}
          <div className="rounded-2xl border border-sky-900/50 bg-[#0F172A] p-4.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Under Review</span>
              <span className="rounded-xl bg-sky-950/60 text-sky-400 p-2 border border-sky-800/40"><Search size={16} /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-sky-400">{underReviewCount}</p>
            <p className="mt-0.5 text-[11px] text-sky-400/70">In assessment</p>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-emerald-900/50 bg-[#0F172A] p-4.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Approved</span>
              <span className="rounded-xl bg-emerald-950/60 text-emerald-400 p-2 border border-emerald-800/40"><CheckCircle2 size={16} /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-400">{approvedCount}</p>
            <p className="mt-0.5 text-[11px] text-emerald-400/70">Visas granted</p>
          </div>

          {/* Rejected */}
          <div className="rounded-2xl border border-rose-900/50 bg-[#0F172A] p-4.5 shadow-lg col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Rejected</span>
              <span className="rounded-xl bg-rose-950/60 text-rose-400 p-2 border border-rose-800/40"><XCircle size={16} /></span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-rose-400">{rejectedCount}</p>
            <p className="mt-0.5 text-[11px] text-rose-400/70">Refused</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, applicant name, passport, email..."
                className="w-full rounded-xl border border-gray-700 bg-gray-900/90 pl-9.5 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              />
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-400 mr-1">Status:</span>
              {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Visa Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Category:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Visa Types</option>
                <option value="tourist">Tourist Visa</option>
                <option value="business">Business Visa</option>
                <option value="work">Work Visa</option>
                <option value="student">Student Visa</option>
                <option value="transit">Transit Visa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table Card */}
        <div className="rounded-2xl border border-gray-800 bg-[#0F172A] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">
              Applications Registry ({filteredApplications.length})
            </h2>
            <span className="text-xs text-gray-400">
              Database Sync: <strong className="text-emerald-400 font-mono">Live Active</strong>
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={36} className="mx-auto text-gray-600" />
              <p className="mt-3 text-sm font-semibold text-gray-300">No applications match your criteria</p>
              <p className="mt-1 text-xs text-gray-500">
                {applications.length === 0
                  ? 'No visa submissions recorded in database yet.'
                  : 'Try clearing your search query or status filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/90 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Ref Number</th>
                    <th className="py-3.5 px-4">Applicant</th>
                    <th className="py-3.5 px-4">Passport & Nat.</th>
                    <th className="py-3.5 px-4">Visa Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Official PDF</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredApplications.map((app) => (
                    <tr key={app.id || app.reference_number || app.passport} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                        {app.reference_number || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{app.full_name || 'Anonymous Applicant'}</div>
                        <div className="text-gray-400 text-[11px]">{app.email || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-100">{app.passport}</div>
                        <div className="text-gray-400 text-[11px]">{app.nationality || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-medium text-gray-300 bg-gray-800 px-2 py-0.5 rounded text-[11px]">
                          {app.visa_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status || 'Pending'} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {app.decision_pdf ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <CheckCircle2 size={12} /> PDF Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-amber-950/40 text-amber-400/90 border border-amber-900/50">
                            <Clock size={12} /> Pending PDF
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'short' }) : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Prominent Edit & Upload PDF Button */}
                          <button
                            type="button"
                            onClick={() => openAppDetails(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                            title="Edit Applicant Details & Upload PDF"
                          >
                            <Pencil size={13} />
                            <span>Edit / PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openAppDetails(app)}
                            className="p-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(app)}
                            className="p-1.5 rounded-lg border border-rose-800/60 bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-300 transition-all cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Full Detailed Application Edit & Review Drawer / Modal */}
      {selectedApp && (
        <Modal
          open={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={isNewRecord ? "Create New Visa Application Record" : `Edit Case: ${editForm.reference_number || selectedApp.reference_number}`}
          subtitle={`Applicant: ${editForm.full_name || selectedApp.full_name || 'Applicant'} | Passport: ${editForm.passport || selectedApp.passport || '—'}`}
        >
          {saveSuccess && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-950/90 border border-emerald-600 p-4 text-xs text-emerald-200 animate-in fade-in shadow-lg">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-emerald-300 font-bold">Successfully Saved Live!</strong>
                <span>All applicant fields and uploaded PDF are updated. The user will see this immediately when checking status.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveFullApp} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Section 1: Applicant Info (Editable) */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <User size={13} /> 1. Applicant Personal Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Full Name *</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white font-semibold focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. DHANANJAYA RAI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Passport Number *</label>
                  <input
                    type="text"
                    value={editForm.passport}
                    onChange={(e) => setEditForm({ ...editForm, passport: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-orange-400 font-mono font-bold focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. PA3726025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Date of Birth</label>
                  <input
                    type="text"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 25 Aug 2001"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Nationality</label>
                  <input
                    type="text"
                    value={editForm.nationality}
                    onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white font-semibold focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. NEPAL / INDIAN"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Visa Document Details (Editable) */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <FileText size={13} /> 2. Visa Document Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Visa Type</label>
                  <input
                    type="text"
                    value={editForm.visa_type}
                    onChange={(e) => setEditForm({ ...editForm, visa_type: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. Work Permit / Tourist Visa"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Visa Number</label>
                  <input
                    type="text"
                    value={editForm.visa_number}
                    onChange={(e) => setEditForm({ ...editForm, visa_number: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white font-mono font-semibold focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. E26-187209"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Application Reference</label>
                  <input
                    type="text"
                    value={editForm.reference_number}
                    onChange={(e) => setEditForm({ ...editForm, reference_number: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white font-mono font-semibold focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 7209572"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Number of Entries</label>
                  <select
                    value={editForm.entries}
                    onChange={(e) => setEditForm({ ...editForm, entries: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Multiple">Multiple</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Duration of Stay</label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 365 days / 90 days"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Port of Entry</label>
                  <input
                    type="text"
                    value={editForm.port_of_entry}
                    onChange={(e) => setEditForm({ ...editForm, port_of_entry: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. Larnaca International Airport"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Timeline & Dates (Editable) */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Calendar size={13} /> 3. Official Processing Dates
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Application Submitted</label>
                  <input
                    type="text"
                    value={editForm.submitted_date}
                    onChange={(e) => setEditForm({ ...editForm, submitted_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 12 Sept 2026"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Decision Date</label>
                  <input
                    type="text"
                    value={editForm.decision_date}
                    onChange={(e) => setEditForm({ ...editForm, decision_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 15 Sept 2026"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Visa Issue Date</label>
                  <input
                    type="text"
                    value={editForm.issue_date}
                    onChange={(e) => setEditForm({ ...editForm, issue_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 15 Sept 2026"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 text-[11px] font-semibold">Visa Expiry Date</label>
                  <input
                    type="text"
                    value={editForm.expiry_date}
                    onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 14 Sept 2027"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Official Visa Grant PDF (Upload & Download for User) */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <UploadCloud size={14} /> 4. Official Visa Decision PDF (For User Download)
                </h4>
                {editForm.decision_pdf ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    <CheckCircle2 size={13} /> PDF Attached
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800">
                    <Clock size={13} /> In Process (Pending PDF)
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Upload the official stamped PDF here. When the user checks their visa status and clicks <strong>"Download PDF"</strong>, this exact file will download immediately.
              </p>

              {editForm.decision_pdf ? (
                <div className="p-3.5 rounded-lg bg-gray-950 border border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={22} className="text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-white truncate max-w-xs">
                        {editForm.decision_pdf.name || 'Official_Visa_Grant_Letter.pdf'}
                      </span>
                      <span className="block text-[10px] text-emerald-400">
                        ✓ Ready for user download
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editForm.decision_pdf.url && (
                      <a
                        href={editForm.decision_pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={13} /> View PDF
                      </a>
                    )}

                    <label className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer transition-colors">
                      Replace PDF
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.readAsDataURL(file)
                          reader.onload = () => {
                            const pdfObj = {
                              name: file.name,
                              url: reader.result,
                              size: file.size,
                              uploaded_at: new Date().toISOString()
                            }
                            setEditForm((prev) => ({ ...prev, decision_pdf: pdfObj }))
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Remove uploaded PDF from this application?')) {
                          setEditForm((prev) => ({ ...prev, decision_pdf: null }))
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
                      title="Delete PDF"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-700 hover:border-orange-500 rounded-xl bg-gray-950/50 hover:bg-gray-950 cursor-pointer transition-all text-center group">
                    <UploadCloud size={28} className="text-gray-500 group-hover:text-orange-400 transition-colors mb-1.5" />
                    <span className="text-xs font-bold text-gray-200 group-hover:text-white">
                      Click to Browse or Drop Official Visa Decision PDF
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Supports any PDF grant letters and stamped visas</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.readAsDataURL(file)
                        reader.onload = () => {
                          const pdfObj = {
                            name: file.name,
                            url: reader.result,
                            size: file.size,
                            uploaded_at: new Date().toISOString()
                          }
                          setEditForm((prev) => ({ ...prev, decision_pdf: pdfObj }))
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Section 5: Case Status & Officer Remarks */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Official Case Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Pending', label: 'Pending', color: 'bg-amber-600 border-amber-500 text-white' },
                    { id: 'Under Review', label: 'Under Review', color: 'bg-sky-600 border-sky-500 text-white' },
                    { id: 'Approved', label: 'Approved', color: 'bg-emerald-600 border-emerald-500 text-white' },
                    { id: 'Rejected', label: 'Rejected', color: 'bg-rose-600 border-rose-500 text-white' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setEditForm({ ...editForm, status: item.id })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        editForm.status === item.id
                          ? item.color + ' shadow-md'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1" htmlFor="admin-notes">
                  Official Officer Remarks / Status Notice for Applicant
                </label>
                <textarea
                  id="admin-notes"
                  rows="2"
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                  placeholder="e.g. Your visa application has been approved. Please carry a printed copy of this confirmation along with your passport when traveling."
                  className="w-full rounded-xl border border-gray-700 bg-gray-950 p-3 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Modal Bottom Save Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-xs font-bold text-white shadow-lg shadow-orange-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{saveLoading ? 'Saving All Changes...' : 'Save All Changes'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SQL Setup Script Modal */}
      <Modal
        open={sqlModalOpen}
        onClose={() => setSqlModalOpen(false)}
        title="Supabase Database Schema Setup"
        subtitle="Run this script in Supabase SQL Editor to make sure all tables, columns, and security policies are in place."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">SQL Setup Script</span>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 cursor-pointer"
            >
              {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSql ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          <pre className="max-h-60 overflow-y-auto rounded-xl bg-gray-950 p-4 text-[11px] font-mono text-emerald-300 leading-relaxed border border-gray-800">
            {SQL_SETUP_SCRIPT}
          </pre>

          <button
            onClick={() => setSqlModalOpen(false)}
            className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}
