import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const gameColors = {
  'BGMI': '#00f5ff', 'Valorant': '#bf00ff', 'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', 'Other': '#00f5ff'
}

function Trending() {
  const [clips, setClips] = useState([])
  const [usernames, setUsernames] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrending()
  }, [])

  async function fetchTrending() {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .order('views', { ascending: false })
      .limit(4)

    if (data) {
      setClips(data)
      const uniqueIds = [...new Set(data.map(c => c.user_id).filter(Boolean))]
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', uniqueIds)
        if (profiles) {
          const map = {}
          profiles.forEach(p => { map[p.user_id] = p.username })
          setUsernames(map)
        }
      }
    }
  }

  function getUsername(userId) {
    return usernames[userId] ? `@${usernames[userId]}` : `@${userId?.slice(0, 8) || 'creator'}`
  }

  return (
    <section className="bg-[#040810] py-24 px-8">
      <div className="max-w-5xl mx-auto">

        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// TRENDING NOW</p>
        <h2 className="font-black text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: 'monospace' }}>
          Hot Right Now 🔥
        </h2>
        <p className="text-slate-400 max-w-md mb-12 leading-relaxed">
          The clips everyone's watching. Your turn to drop something bigger.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clips.map(clip => {
            const color = clip.color || gameColors[clip.game] || '#00f5ff'
            return (
              <div
                key={clip.id}
                onClick={() => navigate(`/clip/${clip.id}`)}
                className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
              >
                <div
                  className="h-36 flex items-center justify-center text-5xl relative"
                  style={{ background: `linear-gradient(135deg, #0b1425, ${color}22)`, borderBottom: `2px solid ${color}33` }}
                >
                  {clip.emoji || '🎮'}
                  <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">
                    ▶
                  </div>
                </div>

                <div className="p-4">
                  <div className="font-black text-xs tracking-widest mb-1" style={{ fontFamily: 'monospace', color }}>
                    {clip.game}
                  </div>
                  <div className="text-white text-sm font-bold mb-1 truncate">{clip.title}</div>
                  <div className="text-slate-400 text-xs mb-3">{getUsername(clip.user_id)}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs truncate">🎵 {clip.music}</span>
                    <span className="text-slate-500 text-xs ml-2">👁 {clip.views || 0}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {clips.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/explore')}
              className="border border-cyan-500/20 text-cyan-400 px-8 py-3 rounded-lg text-xs font-black tracking-widest hover:border-cyan-400 hover:bg-cyan-500/5 transition-all duration-200"
              style={{ fontFamily: 'monospace' }}
            >
              VIEW ALL CLIPS →
            </button>
          </div>
        )}

      </div>
    </section>
  )
}

export default Trending