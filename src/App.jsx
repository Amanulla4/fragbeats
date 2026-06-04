// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Home from './pages/Home'
import Auth from './pages/Auth'
import Explore from './pages/Explore'
import Upload from './pages/Upload'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Music from './pages/Music'
import NotFound from './pages/NotFound'
import Notifications from './pages/Notifications'
import Search from './pages/Search'
import Leaderboard from './pages/Leaderboard'
import ClipDetail from './pages/ClipDetail'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import About from './pages/About'
import Pricing from './pages/Pricing'
import Waitlist from './pages/Waitlist'
import Terms from './pages/Terms'
import Blog from './pages/Blog'
import Feed from './pages/Feed'
import Collections from './pages/Collections'
import Onboarding from './pages/Onboarding'

import ScrollToTop from './components/ScrollToTop'
import PageLoader from './components/PageLoader'
import MusicPlayer from './components/MusicPlayer'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

// ✅ Redirects new users (no username) to /onboarding
// Redirects logged-out users to /auth
function OnboardingGuard({ children }) {
  const { user, loading, profile, profileLoading } = useAuth()

  if (loading || profileLoading) return null

  if (!user) return <Navigate to="/auth" replace />

  // Already has a username — let them through
  if (profile?.username) return children

  // No username yet — send to onboarding
  return <Navigate to="/onboarding" replace />
}

// ✅ Prevents already-onboarded users from re-visiting /onboarding
function OnboardingRoute() {
  const { user, loading, profile, profileLoading } = useAuth()

  if (loading || profileLoading) return null

  if (!user) return <Navigate to="/auth" replace />

  // Already onboarded — send to feed
  if (profile?.username) return <Navigate to="/feed" replace />

  return <Onboarding />
}

function AnimatedRoutes() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const isFeed = location.pathname === '/feed'

  useEffect(() => {
    if (isFeed) return

    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)

    return () => clearTimeout(timer)
  }, [location.pathname, isFeed])

  return (
    <>
      {loading && <PageLoader />}
      {!isFeed && <MusicPlayer />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/music" element={<Music />} />
        <Route path="/search" element={<Search />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/clip/:id" element={<ClipDetail />} />
        <Route path="/u/:username" element={<PublicProfile />} />

        {/* ✅ Onboarding — smart redirect built in */}
        <Route path="/onboarding" element={<OnboardingRoute />} />

        <Route
          path="/upload"
          element={
            <OnboardingGuard>
              <Upload />
            </OnboardingGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <OnboardingGuard>
              <Profile />
            </OnboardingGuard>
          }
        />

        <Route
          path="/notifications"
          element={
            <OnboardingGuard>
              <Notifications />
            </OnboardingGuard>
          }
        />

        <Route
          path="/analytics"
          element={
            <OnboardingGuard>
              <Analytics />
            </OnboardingGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <OnboardingGuard>
              <Settings />
            </OnboardingGuard>
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App