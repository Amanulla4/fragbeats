// src/pages/Collections.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const GAMES = [
  { name: 'BGMI', emoji: '🔫', color: '#00f5ff' },
  { name: 'Valorant', emoji: '⚔️', color: '#bf00ff' },
  { name: 'Free Fire', emoji: '🔥', color: '#ff6b35' },
  { name: 'COD Mobile', emoji: '💥', color: '#ff2d55' },
  { name: 'GTA V', emoji: '🚗', color: '#ffd700' },
  { name: 'Other', emoji: '🎮', color: '#00f5ff' },
]

// ── Skeleton for a single shelf row ──────────────────────────────────────────
function ShelfSkeleton({ color = '#00f5ff' }) {
  return (
    <div>
      {/* Shelf header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg animate-shimmer flex-shrink-0"
            style={{ background: `${color}22` }}
          />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded animate-shimmer bg-cyan-500/10" />
            <div className="h-3 w-16 rounded animate-shimmer bg-cyan-500/10" />
          </div>
        </div>
        <div className="h-7 w-20 rounded-lg animate-shimmer bg-cyan-500/10" />
      </div>

      {/* Clip cards row */}
      <div className="flex gap-4 overflow-hidden pb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 w-44 space-y-2">
            <div
              className="w-44 h-28 rounded-xl animate-shimmer"
              style={{ background: `${color}11` }}
            />
            <div className="h-3 w-32 rounded animate-shimmer bg-cyan-500/10" />
            <div className="h-3 w-16 rounded animate-shimmer bg-cyan-500/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Collections() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [collections, setCollections] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  async function fetchCollections() {
    setLoading(true)
    setError(false)

    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .not('video_url', 'is', null)
      .order('views', { ascending: false })

    if (error) {
      console.error('Collections clips error:', error.message)
      setError(true)
      setLoading(false)
      return
    }

    const grouped = {}
    GAMES.forEach((game) => {
      grouped[game.name] = []
    })

    ;(data || []).forEach((clip) => {
      const key = GAMES.some((game) => game.name === clip.game) ? clip.game : 'Other'
      grouped[key].push(clip)
    })

    setCollections(grouped)
    setLoading(false)
  }

  function formatNum(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value || 0
  }

  const isEmpty = GAMES.every((game) => (collections[game.name] || []).length === 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO
        title="Collections"
        description="Browse gaming clip collections by game on FragBeats."
        url="/collections"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-44 md:pb-24">
        {/* Header — always visible */}
        <div className="mb-10">
          <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">
            // COLLECTIONS
          </p>
          <h1
            className="font-black text-3xl md:text-4xl text-white tracking-widest mb-2"
            style={{ fontFamily: 'monospace' }}
          >
            Browse By Game 🗂️
          </h1>
          <p className="text-slate-500 text-sm tracking-widest">
            Playable frags grouped by game
          </p>
        </div>

        {/* ── Loading skeleton — matches real layout ──────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-12">
            {GAMES.slice(0, 3).map((game) => (
              <ShelfSkeleton key={game.name} color={game.color} />
            ))}
          </div>
        )}

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="text-center py-24 border border-red-500/20 rounded-xl bg-red-500/5">
            <div className="text-5xl mb-4">⚠️</div>
            <p
              className="font-black text-white tracking-widest mb-2"
              style={{ fontFamily: 'monospace' }}
            >
              COULDN'T LOAD COLLECTIONS
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Something went wrong. Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={fetchCollections}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
              style={{ fontFamily: 'monospace' }}
            >
              TRY AGAIN →
            </button>
          </div>
        )}

        {/* ── Empty state — no clips at all ───────────────────────────────── */}
        {!loading && !error && isEmpty && (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🎮</div>
            <p
              className="font-black text-xl text-white tracking-widest mb-2"
              style={{ fontFamily: 'monospace' }}
            >
              NO COLLECTIONS YET
            </p>
            <p className="text-slate-500 text-sm mb-2 max-w-xs mx-auto">
              Clips will appear here once creators upload frags for each game.
            </p>
            <p className="text-slate-600 text-xs mb-8">
              Be the first to drop a clip 👇
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
                  style={{ fontFamily: 'monospace' }}
                >
                  + UPLOAD YOUR FRAG
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
                    style={{ fontFamily: 'monospace' }}
                  >
                    JOIN FRAGBEATS →
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/explore')}
                    className="border border-cyan-500/20 text-cyan-400 px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:border-cyan-400 transition-all"
                    style={{ fontFamily: 'monospace' }}
                  >
                    EXPLORE CLIPS →
                  </button>
                </>
              )}
            </div>

            {/* Game pills to show what's coming */}
            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {GAMES.map((game) => (
                <span
                  key={game.name}
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-widest opacity-40"
                  style={{
                    background: `${game.color}15`,
                    color: game.color,
                    border: `1px solid ${game.color}30`,
                    fontFamily: 'monospace',
                  }}
                >
                  {game.emoji} {game.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Real content ─────────────────────────────────────────────────── */}
        {!loading && !error && !isEmpty && (
          <div className="flex flex-col gap-12">
            {GAMES.map((game) => {
              const clips = collections[game.name] || []
              if (clips.length === 0) return null

              return (
                <section key={game.name}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black flex-shrink-0"
                        style={{ background: `${game.color}22`, border: `1px solid ${game.color}44` }}
                      >
                        {game.emoji}
                      </div>

                      <div className="min-w-0">
                        <h2
                          className="font-black tracking-widest text-lg truncate"
                          style={{ fontFamily: 'monospace', color: game.color }}
                        >
                          {game.name}
                        </h2>
                        <p className="text-slate-600 text-xs">
                          {clips.length} playable clip{clips.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/explore?game=${encodeURIComponent(game.name)}`)}
                      className="text-xs tracking-widest px-3 py-1 rounded-lg border transition-all duration-200 hover:brightness-125 flex-shrink-0"
                      style={{ borderColor: `${game.color}44`, color: game.color, fontFamily: 'monospace' }}
                    >
                      VIEW ALL →
                    </button>
                  </div>

                  <div
                    className="flex gap-4 overflow-x-auto pb-3"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: `${game.color}44 transparent` }}
                  >
                    {clips.slice(0, 10).map((clip) => (
                      <button
                        key={clip.id}
                        type="button"
                        onClick={() => navigate(`/clip/${clip.id}`)}
                        className="flex-shrink-0 w-44 cursor-pointer group text-left"
                      >
                        <div
                          className="w-44 h-28 rounded-xl overflow-hidden relative mb-2 border transition-all duration-300 group-hover:scale-105"
                          style={{
                            borderColor: `${game.color}22`,
                            background: `linear-gradient(135deg, #0b1425, ${game.color}22)`,
                          }}
                        >
                          {clip.thumbnail_url ? (
                            <img
                              src={clip.thumbnail_url}
                              alt={clip.title || 'Clip thumbnail'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {clip.emoji || game.emoji}
                            </div>
                          )}

                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ background: 'rgba(0,0,0,0.4)' }}
                          >
                            <div
                              className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm"
                              style={{ borderColor: game.color, color: game.color, background: 'rgba(0,0,0,0.6)' }}
                            >
                              ▶
                            </div>
                          </div>

                          <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5 text-xs text-white/80">
                            👁 {formatNum(clip.views)}
                          </div>
                        </div>

                        <p className="text-white text-xs font-bold truncate" style={{ fontFamily: 'monospace' }}>
                          {clip.title || 'Untitled Clip'}
                        </p>

                        <p className="text-xs mt-0.5" style={{ color: `${game.color}99` }}>
                          ❤️ {formatNum(clip.likes)}
                        </p>
                      </button>
                    ))}

                    {clips.length > 10 && (
                      <button
                        type="button"
                        onClick={() => navigate(`/explore?game=${encodeURIComponent(game.name)}`)}
                        className="flex-shrink-0 w-44 h-28 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer border transition-all duration-300 hover:brightness-125 mb-8"
                        style={{ borderColor: `${game.color}44`, background: `${game.color}11` }}
                      >
                        <span className="text-2xl">＋</span>
                        <span
                          className="text-xs font-black tracking-widest"
                          style={{ fontFamily: 'monospace', color: game.color }}
                        >
                          +{clips.length - 10} MORE
                        </span>
                      </button>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Collections