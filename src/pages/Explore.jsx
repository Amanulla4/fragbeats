// src/pages/Explore.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CommentModal from '../components/CommentModal'
import ShareModal from '../components/ShareModal'
import { SkeletonGrid } from '../components/SkeletonCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import SEO from '../components/SEO'

const GAMES = ['All', 'BGMI', 'Valorant', 'Free Fire', 'COD Mobile', 'GTA V', 'Other']

const gameColors = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function ClipCard({ clip, onLike, liked, onComment, onShare, onClick }) {
  const color = clip.color || gameColors[clip.game] || '#00f5ff'

  return (
    <div className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group">
      <div
        onClick={onClick}
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0b1425, ${color}22)`,
          borderBottom: `2px solid ${color}33`,
        }}
      >
        {clip.thumbnail_url ? (
          <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{clip.emoji || '🎮'}</span>
        )}

        <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
          ▶
        </div>
      </div>

      <div className="p-4">
        <div
          className="font-black text-xs tracking-widest mb-1"
          style={{ fontFamily: 'monospace', color }}
        >
          {clip.game || 'Other'}
        </div>

        <div className="text-white text-sm font-bold mb-1 truncate">
          {clip.title || 'Untitled Clip'}
        </div>

        <div className="text-slate-500 text-xs mb-3 truncate">
          🎵 {clip.music || 'No music'}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs">👁 {clip.views || 0}</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onLike(clip)
              }}
              className={`text-xs transition-all duration-200 ${
                liked ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'
              }`}
            >
              {liked ? '❤️' : '🤍'} {clip.likes || 0}
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onComment(clip)
              }}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-all duration-200"
            >
              💬
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onShare(clip)
              }}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-all duration-200"
            >
              🔗
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Explore() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const loaderRef = useRef(null)

  const initialGame = GAMES.includes(searchParams.get('game')) ? searchParams.get('game') : 'All'

  const [activeGame, setActiveGame] = useState(initialGame)
  const [search, setSearch] = useState('')
  const [liked, setLiked] = useState([])
  const [activeComment, setActiveComment] = useState(null)
  const [activeShare, setActiveShare] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(8)
  const [loadingMore, setLoadingMore] = useState(false)
  const [clips, setClips] = useState([])

  useEffect(() => {
    fetchClips()
  }, [user?.id])

  useEffect(() => {
    setVisibleCount(8)
  }, [activeGame, search])

  function handleGameChange(game) {
    setActiveGame(game)
    if (game === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ game })
    }
  }

  async function fetchClips() {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Explore clips error:', error.message)
      toast.error('Could not load clips. Please refresh.')
      setIsLoading(false)
      return
    }

    const clipData = (data || []).map((clip) => ({
      ...clip,
      color: clip.color || gameColors[clip.game] || '#00f5ff',
    }))

    setClips(clipData)

    if (user) {
      const { data: likedData } = await supabase
        .from('clip_likes')
        .select('clip_id')
        .eq('user_id', user.id)

      setLiked(likedData ? likedData.map((item) => item.clip_id) : [])
    } else {
      setLiked([])
    }

    setIsLoading(false)
  }

  const loadMore = useCallback(() => {
    if (loadingMore) return

    setLoadingMore(true)

    setTimeout(() => {
      setVisibleCount((prev) => prev + 4)
      setLoadingMore(false)
    }, 600)
  }, [loadingMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) observer.observe(loaderRef.current)

    return () => observer.disconnect()
  }, [loadMore])

  // ── Like: optimistic + rollback + error toast ─────────────────────────────
  async function toggleLike(clip) {
    if (!user) {
      navigate('/auth')
      return
    }

    const isLiked = liked.includes(clip.id)
    const currentLikes = clip.likes || 0
    const nextLikes = Math.max(0, currentLikes + (isLiked ? -1 : 1))

    // Optimistic update
    setLiked((prev) =>
      isLiked ? prev.filter((id) => id !== clip.id) : [...prev, clip.id]
    )
    setClips((prev) =>
      prev.map((item) => (item.id === clip.id ? { ...item, likes: nextLikes } : item))
    )

    if (isLiked) {
      const { error } = await supabase
        .from('clip_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('clip_id', clip.id)

      if (error) {
        // Rollback
        setLiked((prev) => [...prev, clip.id])
        setClips((prev) =>
          prev.map((item) => (item.id === clip.id ? { ...item, likes: currentLikes } : item))
        )
        toast.error('Could not unlike. Try again.')
        return
      }

      await supabase.from('clips').update({ likes: nextLikes }).eq('id', clip.id)
    } else {
      const { error } = await supabase
        .from('clip_likes')
        .insert({ user_id: user.id, clip_id: clip.id })

      if (error) {
        // Rollback
        setLiked((prev) => prev.filter((id) => id !== clip.id))
        setClips((prev) =>
          prev.map((item) => (item.id === clip.id ? { ...item, likes: currentLikes } : item))
        )
        toast.error('Could not like clip. Try again.')
        return
      }

      await supabase.from('clips').update({ likes: nextLikes }).eq('id', clip.id)

      if (clip.user_id && user.id !== clip.user_id) {
        await supabase.from('notifications').insert({
          user_id: clip.user_id,
          from_user_id: user.id,
          type: 'like',
          clip_id: clip.id,
          message: `liked your clip "${clip.title}"`,
          read: false,
        })
      }
    }
  }

  const filtered = clips.filter((clip) => {
    const query = search.trim().toLowerCase()
    const matchGame = activeGame === 'All' || clip.game === activeGame
    const matchSearch =
      !query ||
      (clip.title || '').toLowerCase().includes(query) ||
      (clip.game || '').toLowerCase().includes(query) ||
      (clip.music || '').toLowerCase().includes(query)
    return matchGame && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO
        title="Explore"
        description="Discover the best gaming clips from Indian creators. Filter by BGMI, Valorant, Free Fire and more."
        url="/explore"
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-32">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// EXPLORE</p>

        <h1
          className="font-black text-4xl md:text-5xl text-white mb-8"
          style={{ fontFamily: 'monospace' }}
        >
          Find Your Vibe 🎮
        </h1>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by game, title or music..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3 text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
            style={{ background: 'var(--card)', color: 'var(--text)' }}
          />
        </div>

        <div className="flex gap-3 flex-wrap mb-10">
          {GAMES.map((game) => (
            <button
              key={game}
              type="button"
              onClick={() => handleGameChange(game)}
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

        <p className="text-slate-500 text-sm mb-6">{filtered.length} playable clips found</p>

        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.slice(0, visibleCount).map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  liked={liked.includes(clip.id)}
                  onLike={toggleLike}
                  onComment={setActiveComment}
                  onShare={setActiveShare}
                  onClick={() => navigate(`/clip/${clip.id}`)}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div ref={loaderRef} className="mt-8 text-center">
                {loadingMore ? (
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
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
            <p className="text-slate-400 text-lg">No playable clips found</p>
            <p className="text-slate-600 text-sm mt-2">Try a different search or filter</p>
          </div>
        )}
      </div>

      {activeComment && <CommentModal clip={activeComment} onClose={() => setActiveComment(null)} />}
      {activeShare && <ShareModal clip={activeShare} onClose={() => setActiveShare(null)} />}

      <Footer />
    </div>
  )
}

export default Explore