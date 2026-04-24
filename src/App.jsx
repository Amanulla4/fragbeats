import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Explore from './pages/Explore'
import Upload from './pages/Upload'
import Profile from './pages/Profile'
import Music from './pages/Music'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/music" element={<Music />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App