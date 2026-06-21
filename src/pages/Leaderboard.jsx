// src/pages/Leaderboard.jsx
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

const TABS = ['Creators', 'Clips']

const BADGES = ['👑', '🥈', '🥉']
const RANK_COLORS = ['#fbbf24', '#94a3b8', '#fb923c']

const gameColors = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Creators')
  const [creators, setCreators] = useState([])
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    setLoading(true)

    const { data: followData } = await supabase.from('follows').select('following_id')
    const followerMap = {}

    ;(followData || []).forEach((follow) => {
      followerMap[follow.following_id] = (followerMap[follow.following_id] || 0) + 1
    })

    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_id, username, bio, verified')

    const { data: clipData } = await supabase
      .from('clips')
      .select('user_id, views, likes, video_url')

    const clipStats = {}

    ;(clipData || []).forEach((clip) => {
      if (!clip.user_id) return
      if (!clipStats[clip.user_id]) clipStats[clip.user_id] = { clips: 0, views: 0, likes: 0 }
      if (clip.video_url) clipStats[clip.user_id].clips += 1
      clipStats[clip.user_id].views += clip.views || 0
      clipStats[clip.user_id].likes += clip.likes || 0
    })

    const mergedCreators = (profileData || [])
      .filter((profile) => profile.username)
      .map((profile) => ({
        ...profile,
        followers: followerMap[profile.user_id] || 0,
        clips: clipStats[profile.user_id]?.clips || 0,
        views: clipStats[profile.user_id]?.views || 0,
        likes: clipStats[profile.user_id]?.likes || 0,
      }))
      .sort((a, b) => {
        if (b.followers !== a.followers) return b.followers - a.followers
        if (b.views !== a.views) return b.views - a.views
        return b.likes - a.likes
      })
      .slice(0, 10)

    setCreators(mergedCreators)

    const { data: topClips, error: clipsError } = await supabase
      .from('clips')
      .select('*')
      .not('video_url', 'is', null)
      .order('views', { ascending: false })
      .limit(10)

    if (clipsError) {
      console.error('Leaderboard clips error:', clipsError.message)
      setClips([])
      setLoading(false)
      return
    }

    const uniqueIds = [...new Set((topClips || []).map((clip) => clip.user_id).filter(Boolean))]
    let usernameMap = {}

    if (uniqueIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', uniqueIds)

      ;(profiles || []).forEach((profile) => {
        usernameMap[profile.user_id] = profile.username
      })
    }

    setClips(
      (topClips || []).map((clip) => ({
        ...clip,
        creatorUsername: usernameMap[clip.user_id] || clip.user_id?.slice(0, 8) || 'creator',
      }))
    )

    setLoading(false)
  }

  function formatNum(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value || 0
  }

  const topCreators = creators.slice(0, 3)
  const topClips = clips.slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-32">
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 bg-[#0b1425] rounded-lg animate-pulse border border-cyan-500/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO
        title="Leaderboard"
        description="Top gaming creators and clips on FragBeats."
        url="/leaderboard"
      />
      <Navbar />

      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-24">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// LEADERBOARD</p>

        <h1 className="font-black text-4xl md:text-5xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
          Top of the Game 🏆
        </h1>

        <p className="text-slate-400 mb-8">The best creators and playable clips on FragBeats</p>

        <div className="flex gap-3 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Creators' && topCreators.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            {topCreators.map((creator, index) => (
              <button
                key={creator.user_id}
                type="button"
                onClick={() => navigate(`/u/${creator.username}`)}
                className={`bg-[#0b1425] border rounded-xl p-3 md:p-4 text-center transition-all duration-300 hover:brightness-110 ${
                  index === 0
                    ? 'border-yellow-400/40 -translate-y-2'
                    : index === 1
                    ? 'border-slate-400/40'
                    : 'border-orange-400/40'
                }`}
              >
                <div className="text-3xl mb-2">{BADGES[index]}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-black text-black mx-auto mb-2">
                  {creator.username?.[0]?.toUpperCase() || 'G'}
                </div>
                <div className="text-cyan-400 font-bold text-xs tracking-widest truncate">
                  @{creator.username}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {formatNum(creator.followers)} followers
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'Clips' && topClips.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
            {topClips.map((clip, index) => (
              <button
                key={clip.id}
                type="button"
                onClick={() => navigate(`/clip/${clip.id}`)}
                className={`bg-[#0b1425] border rounded-xl p-3 md:p-4 text-center cursor-pointer transition-all duration-300 hover:brightness-110 ${
                  index === 0
                    ? 'border-yellow-400/40 -translate-y-2'
                    : index === 1
                    ? 'border-slate-400/40'
                    : 'border-orange-400/40'
                }`}
              >
                <div className="text-3xl mb-2">{BADGES[index]}</div>
                <div className="h-16 rounded-lg overflow-hidden mb-2 bg-black/30 flex items-center justify-center">
                  {clip.thumbnail_url ? (
                    <img src={clip.thumbnail_url} alt={clip.title || 'Top clip'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{clip.emoji || '🎮'}</span>
                  )}
                </div>
                <div className="text-white font-bold text-xs truncate">{clip.title}</div>
                <div className="text-slate-500 text-xs mt-1">👁 {formatNum(clip.views)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {activeTab === 'Creators' && creators.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-slate-400">No creators yet. Be the first!</p>
            </div>
          )}

          {activeTab === 'Creators' && creators.map((creator, index) => (
            <button
              key={creator.user_id}
              type="button"
              onClick={() => navigate(`/u/${creator.username}`)}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 text-left ${
                index < 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'
              }`}
            >
              <div
                className="w-8 text-center font-black text-sm flex-shrink-0"
                style={{ fontFamily: 'monospace', color: index < 3 ? RANK_COLORS[index] : '#475569' }}
              >
                {index < 3 ? BADGES[index] : `#${index + 1}`}
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-black text-black flex-shrink-0">
                {creator.username?.[0]?.toUpperCase() || 'G'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-cyan-400 font-bold text-sm truncate">
                  @{creator.username}
                  {creator.verified && <span title="Verified Creator">✅</span>}
                </div>
                <div className="text-slate-500 text-xs mt-0.5 truncate">
                  {creator.bio || 'FragBeats Creator'} • {creator.clips} clips
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-white text-xs font-bold">{formatNum(creator.views)}</div>
                <div className="text-slate-600 text-xs">total views</div>
              </div>

              <div className="text-right">
                <div className="text-white text-xs font-bold">{formatNum(creator.followers)}</div>
                <div className="text-slate-600 text-xs">followers</div>
              </div>
            </button>
          ))}

          {activeTab === 'Clips' && clips.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-slate-400">No playable clips yet. Upload the first one!</p>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded font-black text-xs tracking-widest"
                style={{ fontFamily: 'monospace' }}
              >
                UPLOAD CLIP
              </button>
            </div>
          )}

          {activeTab === 'Clips' && clips.map((clip, index) => {
            const color = clip.color || gameColors[clip.game] || '#00f5ff'

            return (
              <button
                key={clip.id}
                type="button"
                onClick={() => navigate(`/clip/${clip.id}`)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 cursor-pointer text-left ${
                  index < 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'
                }`}
              >
                <div
                  className="w-8 text-center font-black text-sm flex-shrink-0"
                  style={{ fontFamily: 'monospace', color: index < 3 ? RANK_COLORS[index] : '#475569' }}
                >
                  {index < 3 ? BADGES[index] : `#${index + 1}`}
                </div>

                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden"
                  style={{ background: `${color}22` }}
                >
                  {clip.thumbnail_url ? (
                    <img src={clip.thumbnail_url} alt={clip.title || 'Clip thumbnail'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{clip.emoji || '🎮'}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{clip.title}</div>
                  <div className="text-slate-500 text-xs mt-0.5 truncate">
                    @{clip.creatorUsername} • <span style={{ color }}>{clip.game || 'Other'}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-white text-xs font-bold">👁 {formatNum(clip.views)}</div>
                  <div className="text-slate-600 text-xs">❤️ {formatNum(clip.likes)}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Leaderboard