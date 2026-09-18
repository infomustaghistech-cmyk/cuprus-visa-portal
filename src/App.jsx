import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import SignIn from './components/SignIn'
import Home from './pages/Home'
import ApplyVisa from './pages/ApplyVisa'
import CheckStatusPage from './pages/CheckStatusPage'
import ContactPage from './pages/ContactPage'

const PAGES = { home: Home, apply: ApplyVisa, status: CheckStatusPage, contact: ContactPage }

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return PAGES[hash] ? hash : 'home'
  })
  const [signInOpen, setSignInOpen] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cyprus_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const navigate = (id) => {
    if (!PAGES[id]) return
    setPage(id)
    window.location.hash = id
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSignIn = (userData) => {
    setUser(userData)
    try {
      localStorage.setItem('cyprus_user', JSON.stringify(userData))
    } catch {}
    setSignInOpen(false)
  }

  const handleSignOut = () => {
    setUser(null)
    try {
      localStorage.removeItem('cyprus_user')
    } catch {}
  }

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (PAGES[hash]) setPage(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const Page = PAGES[page]

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">
        Skip to content
      </a>

      <Header
        page={page}
        user={user}
        onNavigate={navigate}
        onSignIn={() => setSignInOpen(true)}
        onSignOut={handleSignOut}
      />

      <main id="main" className="flex-1">
        <Page
          onNavigate={navigate}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
      </main>

      <Footer onNavigate={navigate} />

      <SignIn
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignIn={handleSignIn}
        onSwitchToApply={() => navigate('apply')}
      />
    </div>
  )
}
