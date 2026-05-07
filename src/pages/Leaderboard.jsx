import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TABS = ['Creators', 'Clips']

const BADGES = ['👑', '🥈', '🥉']
const RANK_COLORS = ['#fbbf24', '#94a3b8', '#fb923c']

const gameColors = {
  'BGMI': '#00f5ff', 'Valorant': '#bf00ff', 'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', 'Other': '#00f5ff'
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

    // Top creators by follower count
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')

    // Count followers per user
    const followerMap = {}
    if (followData) {
      followData.forEach(f => {
        followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1
      })
    }

    // Get profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_id, username, bio')

    // Get clip counts and views per user
    const { data: clipData } = await supabase
      .from('clips')
      .select('user_id, views, likes')

    const clipStats = {}
    if (clipData) {
      clipData.forEach(c => {
        if (!clipStats[c.user_id]) clipStats[c.user_id] = { clips: 0, views: 0, likes: 0 }
        clipStats[c.user_id].clips++
        clipStats[c.user_id].views += (c.views || 0)
        clipStats[c.user_id].likes += (c.likes || 0)
      })
    }

    // Merge and sort creators by followers
    if (profileData) {
      const merged = profileData
        .filter(p => p.username)
        .map(p => ({
          ...p,
          followers: followerMap[p.user_id] || 0,
          clips: clipStats[p.user_id]?.clips || 0,
          views: clipStats[p.user_id]?.views || 0,
          likes: clipStats[p.user_id]?.likes || 0,
        }))
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 10)
      setCreators(merged)
    }

    // Top clips by views
    const { data: topClips } = await supabase
      .from('clips')
      .select('*')
      .order('views', { ascending: false })
      .limit(10)

    if (topClips) {
      // Get usernames for clip creators
      const uniqueIds = [...new Set(topClips.map(c => c.user_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', uniqueIds)

      const usernameMap = {}
      if (profiles) profiles.forEach(p => { usernameMap[p.user_id] = p.username })

      setClips(topClips.map(c => ({ ...c, creatorUsername: usernameMap[c.user_id] || c.user_id?.slice(0, 8) })))
    }

    setLoading(false)
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n || 0
  }

  const topCreators = creators.slice(0, 3)
  const topClips = clips.slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-8 pt-32">
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-[#0b1425] rounded-lg animate-pulse border border-cyan-500/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-16">

        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// LEADERBOARD</p>
        <h1 className="font-black text-4xl md:text-5xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
          Top of the Game 🏆
        </h1>
        <p className="text-slate-400 mb-8">The best creators and clips on FragBeats</p>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
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

        {/* Podium Top 3 */}
        {activeTab === 'Creators' && topCreators.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {topCreators.map((creator, i) => (
              <div
                key={creator.user_id}
                className={`bg-[#0b1425] border rounded-xl p-4 text-center transition-all duration-300 ${
                  i === 0 ? 'border-yellow-400/40 -translate-y-2' : i === 1 ? 'border-slate-400/40' : 'border-orange-400/40'
                }`}
              >
                <div className="text-3xl mb-2">{BADGES[i]}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-black text-black mx-auto mb-2">
                  {creator.username?.[0]?.toUpperCase() || 'G'}
                </div>
                <div className="text-cyan-400 font-bold text-xs tracking-widest truncate">@{creator.username}</div>
                <div className="text-slate-500 text-xs mt-1">{formatNum(creator.followers)} followers</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Clips' && topClips.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {topClips.map((clip, i) => (
              <div
                key={clip.id}
                onClick={() => navigate(`/clip/${clip.id}`)}
                className={`bg-[#0b1425] border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:brightness-110 ${
                  i === 0 ? 'border-yellow-400/40 -translate-y-2' : i === 1 ? 'border-slate-400/40' : 'border-orange-400/40'
                }`}
              >
                <div className="text-3xl mb-2">{BADGES[i]}</div>
                <div className="text-4xl mb-2">{clip.emoji || '🎮'}</div>
                <div className="text-white font-bold text-xs truncate">{clip.title}</div>
                <div className="text-slate-500 text-xs mt-1">👁 {formatNum(clip.views)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Full List */}
        <div className="flex flex-col gap-3">

          {activeTab === 'Creators' && creators.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-slate-400">No creators yet — be the first!</p>
            </div>
          )}

          {activeTab === 'Creators' && creators.map((creator, i) => (
            <div
              key={creator.user_id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 cursor-pointer ${
                i < 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'
              }`}
            >
              <div className="w-8 text-center font-black text-sm flex-shrink-0" style={{
                fontFamily: 'monospace',
                color: i < 3 ? RANK_COLORS[i] : '#475569'
              }}>
                {i < 3 ? BADGES[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-black text-black flex-shrink-0">
                {creator.username?.[0]?.toUpperCase() || 'G'}
              </div>
              <div className="flex-1">
                <div className="text-cyan-400 font-bold text-sm">@{creator.username}</div>
                <div className="text-slate-500 text-xs mt-0.5">{creator.bio || 'FragBeats Creator'} • {creator.clips} clips</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-white text-xs font-bold">{formatNum(creator.views)}</div>
                <div className="text-slate-600 text-xs">total views</div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs font-bold">{formatNum(creator.followers)}</div>
                <div className="text-slate-600 text-xs">followers</div>
              </div>
            </div>
          ))}

          {activeTab === 'Clips' && clips.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-slate-400">No clips yet — upload the first one!</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded font-black text-xs tracking-widest"
                style={{ fontFamily: 'monospace' }}
              >
                UPLOAD CLIP
              </button>
            </div>
          )}

          {activeTab === 'Clips' && clips.map((clip, i) => (
            <div
              key={clip.id}
              onClick={() => navigate(`/clip/${clip.id}`)}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 cursor-pointer ${
                i < 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'
              }`}
            >
              <div className="w-8 text-center font-black text-sm flex-shrink-0" style={{
                fontFamily: 'monospace',
                color: i < 3 ? RANK_COLORS[i] : '#475569'
              }}>
                {i < 3 ? BADGES[i] : `#${i + 1}`}
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${clip.color || gameColors[clip.game] || '#00f5ff'}22` }}
              >
                {clip.emoji || '🎮'}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{clip.title}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  @{clip.creatorUsername} •{' '}
                  <span style={{ color: clip.color || gameColors[clip.game] || '#00f5ff' }}>{clip.game}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs font-bold">👁 {formatNum(clip.views)}</div>
                <div className="text-slate-600 text-xs">❤️ {formatNum(clip.likes)}</div>
              </div>
            </div>
          ))}

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Leaderboard