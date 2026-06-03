import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const gameColors = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function ClipGrid({ clips, navigate }) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-20 border border-cyan-500/10 rounded-xl bg-[#0b1425]">
        <div className="text-5xl mb-4">🎮</div>
        <p className="text-slate-400 text-sm tracking-widest">NO PUBLIC CLIPS YET</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {clips.map((clip) => {
        const color = clip.color || gameColors[clip.game] || '#00f5ff'

        return (
          <button
            key={clip.id}
            type="button"
            onClick={() => navigate(`/clip/${clip.id}`)}
            className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:border-cyan-400/30 group text-left"
          >
            <div
              className="h-36 flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #0b1425, ${color}22)`,
                borderBottom: `2px solid ${color}33`,
              }}
            >
              {clip.thumbnail_url ? (
                <img src={clip.thumbnail_url} alt={clip.title || 'Clip'} className="w-full h-full object-cover" />
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
                <span className="text-slate-500 text-xs">❤️ {clip.likes || 0}</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PublicProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  const followerChannelRef = useRef(null)

  useEffect(() => {
    if (!username) return

    fetchPublicProfile()

    return cleanupFollowerChannel
  }, [username, user?.id])

  function cleanupFollowerChannel() {
    if (followerChannelRef.current) {
      supabase.removeChannel(followerChannelRef.current)
      followerChannelRef.current = null
    }
  }

  async function fetchPublicProfile() {
    setLoading(true)
    cleanupFollowerChannel()

    const cleanUsername = username.toLowerCase()

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('user_id, username, bio, avatar_url, verified, email')
      .eq('username', cleanUsername)
      .single()

    if (error || !profileData) {
      setProfile(null)
      setClips([])
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: clipData } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', profileData.user_id)
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })

    setClips(clipData || [])

    await fetchFollowerCount(profileData.user_id)
    subscribeToFollowers(profileData.user_id)

    if (user) {
      await checkFollowing(profileData.user_id)
    } else {
      setFollowing(false)
    }

    setLoading(false)
  }

  async function fetchFollowerCount(userId) {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    setFollowerCount(count || 0)
  }

  async function checkFollowing(userId) {
    if (!user || user.id === userId) {
      setFollowing(false)
      return
    }

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .maybeSingle()

    setFollowing(Boolean(data))
  }

  function subscribeToFollowers(userId) {
    const channel = supabase
      .channel(`public-profile-followers:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'follows', filter: `following_id=eq.${userId}` },
        () => setFollowerCount((prev) => prev + 1)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'follows', filter: `following_id=eq.${userId}` },
        () => setFollowerCount((prev) => Math.max(0, prev - 1))
      )
      .subscribe()

    followerChannelRef.current = channel
  }

  async function handleFollow() {
    if (!user) {
      navigate('/auth')
      return
    }

    if (!profile || user.id === profile.user_id || followLoading) return

    setFollowLoading(true)

    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.user_id)

      setFollowing(false)
      setFollowLoading(false)
      return
    }

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: profile.user_id })

    if (!error) {
      setFollowing(true)

      await supabase.from('notifications').insert({
        user_id: profile.user_id,
        from_user_id: user.id,
        type: 'follow',
        clip_id: null,
        message: 'started following you',
        read: false,
      })
    }

    setFollowLoading(false)
  }

  function formatNum(value) {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value || 0
  }

  const totalViews = clips.reduce((sum, clip) => sum + (clip.views || 0), 0)
  const totalLikes = clips.reduce((sum, clip) => sum + (clip.likes || 0), 0)
  const isOwnProfile = user?.id === profile?.user_id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div
          className="text-cyan-400 text-xs tracking-widest animate-pulse"
          style={{ fontFamily: 'monospace' }}
        >
          LOADING CREATOR...
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: 'var(--bg)' }}>
        <Navbar />
        <div className="text-center">
          <div className="text-5xl mb-4">💀</div>
          <p className="text-slate-400 text-sm tracking-widest mb-4">CREATOR NOT FOUND</p>
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="text-cyan-400 text-xs tracking-widest"
          >
            ← BACK TO EXPLORE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-24">
        <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                '🎮'
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h1
                  className="font-black text-2xl text-white tracking-widest"
                  style={{ fontFamily: 'monospace' }}
                >
                  @{profile.username}
                </h1>
                {profile.verified && <span title="Verified Creator" className="text-xl">✅</span>}
              </div>

              <p className="text-cyan-400 text-sm mb-1 tracking-widest">
                FragBeats Creator
                {profile.verified && (
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded ml-1">
                    VERIFIED
                  </span>
                )}
              </p>

              {profile.bio && <p className="text-slate-400 text-sm mb-2">{profile.bio}</p>}

              <div className="flex gap-3 mt-4 justify-center md:justify-start flex-wrap">
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200"
                    style={{ fontFamily: 'monospace' }}
                  >
                    EDIT YOUR PROFILE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-5 py-2 rounded font-black text-xs tracking-widest transition-all duration-200 disabled:opacity-50 ${
                      following
                        ? 'border border-cyan-500/20 text-slate-400 hover:border-red-400 hover:text-red-400'
                        : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {followLoading ? '...' : following ? 'FOLLOWING ✓' : '+ FOLLOW'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-cyan-500/10">
            {[
              { label: 'Clips', value: clips.length },
              { label: 'Views', value: formatNum(totalViews) },
              { label: 'Likes', value: formatNum(totalLikes) },
              { label: 'Followers', value: formatNum(followerCount) },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-black text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
                  style={{ fontFamily: 'monospace' }}
                >
                  {stat.value}
                </div>
                <div className="text-slate-500 text-xs tracking-widest uppercase mt-1 flex items-center justify-center gap-1">
                  {stat.label}
                  {stat.label === 'Followers' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" title="Live" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <h2
            className="font-black text-white tracking-widest text-lg"
            style={{ fontFamily: 'monospace' }}
          >
            PUBLIC CLIPS
          </h2>

          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="text-cyan-400 text-xs tracking-widest hover:text-cyan-300 transition-colors duration-200"
          >
            EXPLORE →
          </button>
        </div>

        <ClipGrid clips={clips} navigate={navigate} />
      </div>

      <Footer />
    </div>
  )
}

export default PublicProfile