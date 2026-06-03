import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const gameColors = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function Trending() {
  const [clips, setClips] = useState([])
  const [usernames, setUsernames] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrending()
  }, [])

  async function fetchTrending() {
    setLoading(true)

    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .not('video_url', 'is', null)
      .order('views', { ascending: false })
      .limit(4)

    if (error) {
      console.error('Trending clips error:', error.message)
      setLoading(false)
      return
    }

    const clipData = data || []
    setClips(clipData)

    const uniqueIds = [...new Set(clipData.map((clip) => clip.user_id).filter(Boolean))]

    if (uniqueIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', uniqueIds)

      if (profiles) {
        const map = {}

        profiles.forEach((profile) => {
          map[profile.user_id] = profile.username
        })

        setUsernames(map)
      }
    }

    setLoading(false)
  }

  function getUsername(userId) {
    return usernames[userId] ? `@${usernames[userId]}` : `@${userId?.slice(0, 8) || 'creator'}`
  }

  return (
    <section className="bg-[#040810] py-24 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">
          // TRENDING NOW
        </p>

        <h2
          className="font-black text-4xl md:text-5xl text-white mb-4"
          style={{ fontFamily: 'monospace' }}
        >
          Hot Right Now 🔥
        </h2>

        <p className="text-slate-400 max-w-md mb-12 leading-relaxed">
          The clips everyone's watching. Your turn to drop something bigger.
        </p>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden animate-pulse"
              >
                <div className="h-36 bg-cyan-500/10" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-cyan-500/10 rounded w-1/3" />
                  <div className="h-4 bg-cyan-500/10 rounded w-3/4" />
                  <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && clips.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {clips.map((clip) => {
                const color = clip.color || gameColors[clip.game] || '#00f5ff'

                return (
                  <div
                    key={clip.id}
                    onClick={() => navigate(`/clip/${clip.id}`)}
                    className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
                  >
                    <div
                      className="h-36 flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, #0b1425, ${color}22)`,
                        borderBottom: `2px solid ${color}33`,
                      }}
                    >
                      {clip.thumbnail_url ? (
                        <img
                          src={clip.thumbnail_url}
                          alt={clip.title || 'Trending clip'}
                          className="w-full h-full object-cover"
                        />
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

                      <div className="text-slate-400 text-xs mb-3 truncate">
                        {getUsername(clip.user_id)}
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-500 text-xs truncate">
                          🎵 {clip.music || 'No music'}
                        </span>
                        <span className="text-slate-500 text-xs flex-shrink-0">
                          👁 {clip.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="border border-cyan-500/20 text-cyan-400 px-8 py-3 rounded-lg text-xs font-black tracking-widest hover:border-cyan-400 hover:bg-cyan-500/5 transition-all duration-200"
                style={{ fontFamily: 'monospace' }}
              >
                VIEW ALL CLIPS →
              </button>
            </div>
          </>
        )}

        {!loading && clips.length === 0 && (
          <div className="border border-cyan-500/10 bg-[#0b1425] rounded-lg p-8 text-center">
            <div className="text-4xl mb-3">🎮</div>
            <p className="text-slate-400 text-sm">No playable trending clips yet.</p>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="mt-5 bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg text-xs font-black tracking-widest hover:brightness-110 transition-all duration-200"
              style={{ fontFamily: 'monospace' }}
            >
              UPLOAD FIRST FRAG
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Trending