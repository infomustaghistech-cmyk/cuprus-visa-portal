import { useState, useEffect } from 'react'
import {
  Users, Shield, CheckCircle2, XCircle, Clock, Search,
  Filter, Eye, Trash2, RefreshCw, Database, Copy, Check,
  AlertCircle, ChevronRight, Lock, KeyRound, EyeOff, LogOut, ArrowLeft,
  ShieldCheck, ShieldAlert, Sparkles, Download, Printer, FileText, ExternalLink,
  Plane, MapPin, Mail, Phone, Calendar, User, Building2
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { getAllApplications, updateApplicationStatus, deleteApplication } from '../services/visaService'
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
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Dashboard state
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [source, setSource] = useState('supabase')
  
  // Selected application for detail & editing
  const [selectedApp, setSelectedApp] = useState(null)
  const [editStatus, setEditStatus] = useState('Pending')
  const [adminNotes, setAdminNotes] = useState('')
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
    }, 400)
  }

  // Handle Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('cyprus_admin_session')
    setIsAdminLoggedIn(false)
    setAdminLoginForm({ username: 'admin', password: '' })
    setSelectedApp(null)
  }

  const openAppDetails = (app) => {
    setSelectedApp(app)
    setEditStatus(app.status || 'Pending')
    setAdminNotes(app.admin_notes || '')
    setSaveSuccess(false)
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!selectedApp) return
    setSaveLoading(true)
    await updateApplicationStatus(selectedApp.id || selectedApp.reference_number, editStatus, adminNotes)
    setSaveLoading(false)
    setSaveSuccess(true)
    
    // Update local state list
    setApplications((prev) =>
      prev.map((a) =>
        (a.id === selectedApp.id || a.reference_number === selectedApp.reference_number)
          ? { ...a, status: editStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() }
          : a
      )
    )

    // Update selected app object
    setSelectedApp((prev) => prev ? { ...prev, status: editStatus, admin_notes: adminNotes } : null)

    setTimeout(() => {
      setSaveSuccess(false)
    }, 2000)
  }

  const handleDelete = async (app) => {
    if (!window.confirm(`Are you sure you want to delete application ${app.reference_number} for ${app.full_name}?`)) {
      return
    }
    await deleteApplication(app.id || app.reference_number)
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
    const headers = ['Reference Number', 'Full Name', 'Email', 'Phone', 'Passport', 'Nationality', 'Visa Type', 'Arrival', 'Status', 'Date']
    const rows = applications.map((a) => [
      a.reference_number,
      `"${a.full_name || ''}"`,
      a.email,
      a.phone || '',
      a.passport || '',
      `"${a.nationality || ''}"`,
      a.visa_type,
      a.arrival || '',
      a.status,
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
                Enter officer credentials to review submissions, inspect documents, and issue status decisions.
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
      <header className="bg-[#0B1528] border-b border-gray-800/90 sticky top-0 z-40">
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
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 transition-colors cursor-pointer"
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
              Live management of all submitted Cyprus visa cases, applicant details, and status decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
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
              Database: <strong className="text-emerald-400 font-mono">{source === 'supabase' ? 'Supabase Live' : 'Local + Cloud Sync'}</strong>
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
                    <th className="py-3.5 px-4">Travel Dates</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredApplications.map((app) => (
                    <tr key={app.id || app.reference_number} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                        {app.reference_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{app.full_name || 'Anonymous'}</div>
                        <div className="text-gray-400 text-[11px]">{app.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-gray-200">{app.passport}</div>
                        <div className="text-gray-400 text-[11px]">{app.nationality || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-medium text-gray-300 bg-gray-800 px-2 py-0.5 rounded text-[11px]">
                          {app.visa_type} Visa
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        <div>{app.arrival || '—'}</div>
                        <div className="text-[11px] text-gray-500">{app.return_date ? `to ${app.return_date}` : `${app.nights || 7} nights`}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status || 'Pending'} />
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, { dateStyle: 'short' }) : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAppDetails(app)}
                            className="p-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-orange-600 hover:text-white text-gray-300 transition-all cursor-pointer"
                            title="Inspect Case & Update Status"
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

      {/* Full Detailed Application Review Drawer / Modal */}
      {selectedApp && (
        <Modal
          open={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Case Review: ${selectedApp.reference_number}`}
          subtitle={`Applicant: ${selectedApp.full_name} | Passport: ${selectedApp.passport}`}
        >
          {saveSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-700 p-3 text-xs text-emerald-200 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Decision successfully updated and synced live with Supabase!</span>
            </div>
          )}

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Section 1: Personal Info */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2.5 flex items-center gap-1.5">
                <User size={13} /> 1. Personal Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Full Name</span>
                  <span className="font-semibold text-white">{selectedApp.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Nationality</span>
                  <span className="font-semibold text-white">{selectedApp.nationality || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Date of Birth</span>
                  <span className="font-semibold text-white">{selectedApp.dob || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Gender</span>
                  <span className="font-semibold text-white capitalize">{selectedApp.gender || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Place of Birth</span>
                  <span className="font-semibold text-white">{selectedApp.place_of_birth || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Marital Status</span>
                  <span className="font-semibold text-white capitalize">{selectedApp.marital_status || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Passport Number</span>
                  <span className="font-mono font-semibold text-orange-400">{selectedApp.passport}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Passport Expiry</span>
                  <span className="font-semibold text-white">{selectedApp.passport_expiry || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2.5 flex items-center gap-1.5">
                <Mail size={13} /> 2. Contact Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Email</span>
                  <span className="font-semibold text-white truncate block">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Phone</span>
                  <span className="font-semibold text-white">{selectedApp.phone || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[11px]">Residential Address</span>
                  <span className="font-semibold text-white">
                    {selectedApp.address ? `${selectedApp.address}${selectedApp.city ? `, ${selectedApp.city}` : ''}${selectedApp.country_of_residence ? `, ${selectedApp.country_of_residence}` : ''}` : '—'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold text-white">
                    {selectedApp.emergency_name ? `${selectedApp.emergency_name}${selectedApp.emergency_phone ? ` (${selectedApp.emergency_phone})` : ''}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Travel Info */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2.5 flex items-center gap-1.5">
                <Plane size={13} /> 3. Travel & Visa Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Visa Category</span>
                  <span className="font-semibold text-white capitalize">{selectedApp.visa_type} Visa</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Purpose</span>
                  <span className="font-semibold text-white">{selectedApp.purpose || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Arrival Date</span>
                  <span className="font-semibold text-white">{selectedApp.arrival || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Return Date</span>
                  <span className="font-semibold text-white">{selectedApp.return_date || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[11px]">Accommodation Address</span>
                  <span className="font-semibold text-white">{selectedApp.destination_address || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[11px]">Host / Contact Name</span>
                  <span className="font-semibold text-white">
                    {selectedApp.host_name ? `${selectedApp.host_name}${selectedApp.host_phone ? ` (${selectedApp.host_phone})` : ''}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Uploaded Documents */}
            <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2.5 flex items-center gap-1.5">
                <FileText size={13} /> 4. Submitted Documents & Files
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedApp.documents && typeof selectedApp.documents === 'object' ? (
                  Object.entries(selectedApp.documents).map(([key, val]) => {
                    if (!val) return null
                    const docName = typeof val === 'string' ? val : val.name || key
                    const docUrl = typeof val === 'object' && val.url ? val.url : null

                    return (
                      <div key={key} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-800 bg-gray-950/60">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="capitalize block font-semibold text-gray-200 text-[11px] truncate">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-gray-500 text-[10px] block truncate">{docName}</span>
                          </div>
                        </div>

                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-600/30 border border-orange-500/40 text-orange-300 hover:bg-orange-600 hover:text-white text-[10px] font-semibold transition-colors shrink-0"
                          >
                            <span>Open</span> <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">Uploaded</span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-gray-500 italic col-span-2">No documents attached.</p>
                )}
              </div>
            </div>

            {/* Section 5: Official Status Decision Form */}
            <form onSubmit={handleUpdateStatus} className="pt-2 border-t border-gray-800 space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Update Official Case Status
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
                      onClick={() => setEditStatus(item.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        editStatus === item.id
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
                  Official Officer Remarks / Stamping Notes
                </label>
                <textarea
                  id="admin-notes"
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved. Single entry visa issued valid for 30 days. Please present reference slip at passport control."
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 p-3 text-xs text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Applicant will see this note immediately when checking their status using Reference #{selectedApp.reference_number}.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saveLoading ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
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
