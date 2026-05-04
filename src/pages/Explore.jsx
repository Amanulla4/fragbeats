import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CommentModal from '../components/CommentModal'
import ShareModal from '../components/ShareModal'
import { SkeletonGrid } from '../components/SkeletonCard'
import { supabase } from '../lib/supabase'

const GAMES = ['All', 'BGMI', 'Valorant', 'Free Fire', 'COD Mobile', 'GTA V']

const gameColors = {
  'BGMI': '#00f5ff',
  'Valorant': '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  'Other': '#00f5ff'
}

function Explore() {
  const [activeGame, setActiveGame] = useState('All')
  const [search, setSearch] = useState('')
  const [liked, setLiked] = useState([])
  const [activeComment, setActiveComment] = useState(null)
  const [activeShare, setActiveShare] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(8)
  const [loadingMore, setLoadingMore] = useState(false)
  const [clips, setClips] = useState([])
  const loaderRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchClips()
  }, [])

  async function fetchClips() {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Use real color from DB, fallback to gameColors map if missing
      const formatted = data.map(clip => ({
        ...clip,
        color: clip.color || gameColors[clip.game] || '#00f5ff',
      }))
      setClips(formatted)
    }
    setIsLoading(false)
  }

  const loadMore = useCallback(() => {
    if (loadingMore) return
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + 4)
      setLoadingMore(false)
    }, 800)
  }, [loadingMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const filtered = clips.filter(clip => {
    const matchGame = activeGame === 'All' || clip.game === activeGame
    const matchSearch =
      (clip.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (clip.game || '').toLowerCase().includes(search.toLowerCase()) ||
      (clip.music || '').toLowerCase().includes(search.toLowerCase())
    return matchGame && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 pt-32 pb-32">

        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// EXPLORE</p>
        <h1 className="font-black text-4xl md:text-5xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Find Your Vibe 🎮
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by game, title or music..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3 text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
            style={{ background: 'var(--card)', color: 'var(--text)' }}
          />
        </div>

        {/* Game Filters */}
        <div className="flex gap-3 flex-wrap mb-10">
          {GAMES.map(game => (
            <button
              key={game}
              onClick={() => setActiveGame(game)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
                activeGame === game
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              {game}
            </button>
          ))}
        </div>

        <p className="text-slate-500 text-sm mb-6">{filtered.length} clips found</p>

        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.slice(0, visibleCount).map(clip => (
                <div
                  key={clip.id}
                  className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
                >
                  <div
                    onClick={() => navigate(`/clip/${clip.id}`)}
                    className="h-36 flex items-center justify-center text-5xl relative"
                    style={{
                      background: `linear-gradient(135deg, #0b1425, ${clip.color}22)`,
                      borderBottom: `2px solid ${clip.color}33`
                    }}
                  >
                    {clip.emoji || '🎮'}
                    <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
                      ▶
                    </div>
                  </div>

                  <div className="p-4">
                    <div
                      className="font-black text-xs tracking-widest mb-1"
                      style={{ fontFamily: 'monospace', color: clip.color }}
                    >
                      {clip.game}
                    </div>
                    <div className="text-white text-sm font-bold mb-1">{clip.title || 'Untitled Clip'}</div>
                    <div className="text-slate-500 text-xs mb-3">🎵 {clip.music}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs">👁 {clip.views || 0}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleLike(clip.id)}
                          className={`text-xs transition-all duration-200 ${liked.includes(clip.id) ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'}`}
                        >
                          {liked.includes(clip.id) ? '❤️' : '🤍'} {clip.likes || 0}
                        </button>
                        <button
                          onClick={() => setActiveComment(clip)}
                          className="text-xs text-slate-500 hover:text-cyan-400 transition-all duration-200"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => setActiveShare(clip)}
                          className="text-xs text-slate-500 hover:text-cyan-400 transition-all duration-200"
                        >
                          🔗
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div ref={loaderRef} className="mt-8 text-center">
                {loadingMore ? (
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs tracking-widest uppercase">Scroll for more</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">No clips found</p>
            <p className="text-slate-600 text-sm mt-2">Try a different search or filter</p>
          </div>
        )}

      </div>

      {activeComment && (
        <CommentModal clip={activeComment} onClose={() => setActiveComment(null)} />
      )}

      {activeShare && (
        <ShareModal clip={activeShare} onClose={() => setActiveShare(null)} />
      )}

      <Footer />
    </div>
  )
}

export default Explore