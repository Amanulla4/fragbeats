import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const GAMES = ['All', 'BGMI', 'Valorant', 'Free Fire', 'COD Mobile', 'GTA V']

const CLIPS = [
  { id: 1, game: 'BGMI', creator: '@fragkingAman', music: 'Chill Lo-fi Vol.3', views: '128K', likes: '4.2K', emoji: '🎮', color: '#00f5ff' },
  { id: 2, game: 'Valorant', creator: '@neonwolf99', music: 'Midnight Vibes', views: '94K', likes: '3.1K', emoji: '🔫', color: '#bf00ff' },
  { id: 3, game: 'Free Fire', creator: '@drip_editz', music: 'Synthwave Dreams', views: '211K', likes: '8.7K', emoji: '🔥', color: '#ff6b35' },
  { id: 4, game: 'COD Mobile', creator: '@ghostfrags', music: 'Rain & Bass', views: '76K', likes: '2.9K', emoji: '💀', color: '#00f5ff' },
  { id: 5, game: 'GTA V', creator: '@cityvibes', music: 'Urban Lo-fi', views: '143K', likes: '5.3K', emoji: '🚗', color: '#bf00ff' },
  { id: 6, game: 'BGMI', creator: '@sniperking', music: 'Deep Focus', views: '89K', likes: '3.8K', emoji: '🎯', color: '#00f5ff' },
  { id: 7, game: 'Valorant', creator: '@flashpoint', music: 'Neon Nights', views: '167K', likes: '6.1K', emoji: '⚡', color: '#bf00ff' },
  { id: 8, game: 'Free Fire', creator: '@blazeshot', music: 'Fire Beats', views: '55K', likes: '1.9K', emoji: '💥', color: '#ff6b35' },
]

function Explore() {
  const [activeGame, setActiveGame] = useState('All')
  const [search, setSearch] = useState('')
  const [liked, setLiked] = useState([])

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const filtered = CLIPS.filter(clip => {
    const matchGame = activeGame === 'All' || clip.game === activeGame
    const matchSearch = clip.creator.toLowerCase().includes(search.toLowerCase()) ||
      clip.game.toLowerCase().includes(search.toLowerCase()) ||
      clip.music.toLowerCase().includes(search.toLowerCase())
    return matchGame && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// EXPLORE</p>
        <h1 className="font-black text-4xl md:text-5xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Find Your Vibe 🎮
        </h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by game, creator or music..."
            value={search}
            onChange={e => setSearch(e.target.value)}
             className="w-full border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3 text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600" style={{ background: 'var(--card)', color: 'var(--text)' }}
          />
        </div>

        {/* Game Filters */}
        <div className="flex gap-3 flex-wrap mb-10">
          {GAMES.map(game => (
            <button
              key={game}
              onClick={() => setActiveGame(game)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${activeGame === game
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
                }`}
              style={{ fontFamily: 'monospace' }}
            >
              {game}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-slate-500 text-sm mb-6">{filtered.length} clips found</p>

        {/* Clips Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(clip => (
              <div
                key={clip.id}
                className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
              >
                {/* Thumbnail */}
                <div
                  className="h-36 flex items-center justify-center text-5xl relative"
                  style={{ background: `linear-gradient(135deg, #0b1425, ${clip.color}22)`, borderBottom: `2px solid ${clip.color}33` }}
                >
                  {clip.emoji}
                  <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
                    ▶
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="font-black text-xs tracking-widest mb-1" style={{ fontFamily: 'monospace', color: clip.color }}>
                    {clip.game}
                  </div>
                  <div className="text-white text-sm font-bold mb-1">{clip.creator}</div>
                  <div className="text-slate-500 text-xs mb-3">🎵 {clip.music}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">👁 {clip.views}</span>
                    <button
                      onClick={() => toggleLike(clip.id)}
                      className={`text-xs transition-all duration-200 ${liked.includes(clip.id) ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'}`}
                    >
                      {liked.includes(clip.id) ? '❤️' : '🤍'} {clip.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">No clips found</p>
            <p className="text-slate-600 text-sm mt-2">Try a different search or filter</p>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Explore