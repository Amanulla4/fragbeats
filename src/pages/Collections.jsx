import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'

const GAMES = [
  { name: 'BGMI', emoji: '🔫', color: '#00f5ff' },
  { name: 'Valorant', emoji: '⚔️', color: '#bf00ff' },
  { name: 'Free Fire', emoji: '🔥', color: '#ff6b35' },
  { name: 'COD Mobile', emoji: '💥', color: '#ff2d55' },
  { name: 'GTA V', emoji: '🚗', color: '#ffd700' },
  { name: 'Other', emoji: '🎮', color: '#00f5ff' },
]

function Collections() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCollections() }, [])

  async function fetchCollections() {
    setLoading(true)
    const { data } = await supabase
      .from('clips')
      .select('*')
      .order('views', { ascending: false })

    if (data) {
      const grouped = {}
      GAMES.forEach(g => { grouped[g.name] = [] })
      data.forEach(clip => {
        const key = GAMES.find(g => g.name === clip.game) ? clip.game : 'Other'
        if (grouped[key]) grouped[key].push(clip)
        else grouped['Other'].push(clip)
      })
      setCollections(grouped)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div className="text-cyan-400 text-xs tracking-widest animate-pulse" style={{ fontFamily: 'monospace' }}>
          LOADING COLLECTIONS...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-black text-3xl md:text-4xl text-white tracking-widest mb-2"
            style={{ fontFamily: 'monospace' }}>
            🗂️ COLLECTIONS
          </h1>
          <p className="text-slate-500 text-sm tracking-widest">Browse frags by game</p>
        </div>

        {/* Game Shelves */}
        <div className="flex flex-col gap-12">
          {GAMES.map(game => {
            const clips = collections[game.name] || []
            if (clips.length === 0) return null
            return (
              <div key={game.name}>

                {/* Shelf Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black"
                      style={{ background: `${game.color}22`, border: `1px solid ${game.color}44` }}>
                      {game.emoji}
                    </div>
                    <div>
                      <h2 className="font-black text-white tracking-widest text-lg"
                        style={{ fontFamily: 'monospace', color: game.color }}>
                        {game.name}
                      </h2>
                      <p className="text-slate-600 text-xs">{clips.length} clip{clips.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/explore?game=${encodeURIComponent(game.name)}`)}
                    className="text-xs tracking-widest px-3 py-1 rounded-lg border transition-all duration-200 hover:brightness-125"
                    style={{ borderColor: `${game.color}44`, color: game.color, fontFamily: 'monospace' }}>
                    VIEW ALL →
                  </button>
                </div>

                {/* Horizontal Scroll Row */}
                <div className="flex gap-4 overflow-x-auto pb-3"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: `${game.color}44 transparent` }}>
                  {clips.slice(0, 10).map(clip => (
                    <div
                      key={clip.id}
                      onClick={() => navigate(`/clip/${clip.id}`)}
                      className="flex-shrink-0 w-44 cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <div className="w-44 h-28 rounded-xl overflow-hidden relative mb-2 border transition-all duration-300 group-hover:scale-105"
                        style={{ borderColor: `${game.color}22`, background: `linear-gradient(135deg, #0b1425, ${game.color}22)` }}>
                        {clip.thumbnail_url ? (
                          <img src={clip.thumbnail_url} alt={clip.title}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {clip.emoji || game.emoji}
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background: 'rgba(0,0,0,0.4)' }}>
                          <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm"
                            style={{ borderColor: game.color, color: game.color, background: 'rgba(0,0,0,0.6)' }}>
                            ▶
                          </div>
                        </div>
                        {/* Views badge */}
                        <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5 text-xs text-white/80">
                          👁 {clip.views > 999 ? (clip.views / 1000).toFixed(1) + 'K' : clip.views || 0}
                        </div>
                      </div>
                      {/* Clip title */}
                      <p className="text-white text-xs font-bold truncate"
                        style={{ fontFamily: 'monospace' }}>
                        {clip.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: `${game.color}99` }}>
                        ❤️ {clip.likes > 999 ? (clip.likes / 1000).toFixed(1) + 'K' : clip.likes || 0}
                      </p>
                    </div>
                  ))}

                  {/* View All Card */}
                  {clips.length > 10 && (
                    <div
                      onClick={() => navigate(`/explore?game=${encodeURIComponent(game.name)}`)}
                      className="flex-shrink-0 w-44 h-28 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-300 hover:brightness-125 mb-8"
                      style={{ borderColor: `${game.color}44`, background: `${game.color}11` }}>
                      <span className="text-2xl">➕</span>
                      <span className="text-xs font-black tracking-widest"
                        style={{ fontFamily: 'monospace', color: game.color }}>
                        +{clips.length - 10} MORE
                      </span>
                    </div>
                  )}
                </div>

              </div>
            )
          })}

          {/* Empty state */}
          {GAMES.every(g => (collections[g.name] || []).length === 0) && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-slate-600 text-sm tracking-widest">NO CLIPS YET — BE THE FIRST TO UPLOAD!</p>
              <button onClick={() => navigate('/upload')}
                className="mt-6 bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}>
                + UPLOAD YOUR FRAG
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Collections