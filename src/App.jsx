import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Explore from './pages/Explore'
import Upload from './pages/Upload'
import Profile from './pages/Profile'
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
import ScrollToTop from './components/ScrollToTop'
import PageLoader from './components/PageLoader'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function AnimatedRoutes() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      {loading && <PageLoader />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/music" element={<Music />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/search" element={<Search />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/clip/:id" element={<ClipDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/waitlist" element={<Waitlist />} />
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