import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import SignIn from './components/SignIn'
import Home from './pages/Home'
import ApplyVisa from './pages/ApplyVisa'
import CheckStatusPage from './pages/CheckStatusPage'
import VisaStatusResultPage from './pages/VisaStatusResultPage'
import ContactPage from './pages/ContactPage'
import AdminPanel from './pages/AdminPanel'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

const PAGES = {
  home: Home,
  apply: ApplyVisa,
  status: CheckStatusPage,
  result: VisaStatusResultPage,
  'visa-status-result': VisaStatusResultPage,
  contact: ContactPage,
  admin: AdminPanel
}

function resolvePageFromLocation() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  const hash = window.location.hash.replace('#', '').split('?')[0].toLowerCase()
  
  if (path === 'admin' || hash === 'admin') {
    return 'admin'
  }
  if (PAGES[hash]) return hash
  if (PAGES[path]) return path
  if (path.includes('visa-status-result') || hash.includes('visa-status-result') || hash.includes('result')) {
    return 'result'
  }
  return 'home'
}

function MainApp() {
  const [page, setPage] = useState(resolvePageFromLocation)
  const [signInOpen, setSignInOpen] = useState(false)
  const { user, signOut } = useAuth()

  const navigate = (id) => {
    if (!PAGES[id]) return
    setPage(id)
    if (id === 'admin') {
      window.location.hash = 'admin'
    } else {
      window.location.hash = id
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleLocationChange = () => {
      setPage(resolvePageFromLocation())
    }

    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  const Page = PAGES[page]

  // Standalone Admin Portal (completely isolated from public website)
  if (page === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        <AdminPanel onNavigate={navigate} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <Header
        page={page}
        user={user}
        onNavigate={navigate}
        onSignIn={() => setSignInOpen(true)}
        onSignOut={signOut}
      />

      <main id="main" className="flex-1">
        <Page
          onNavigate={navigate}
          user={user}
          onSignIn={() => setSignInOpen(true)}
          onSignOut={signOut}
        />
      </main>

      <Footer onNavigate={navigate} />

      <SignIn
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitchToApply={() => navigate('apply')}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  )
}
