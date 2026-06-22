// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import SEO from '../components/SEO'

const gameColors = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function EditProfileModal({ username, bio, onClose, onSave }) {
  const [newUsername, setNewUsername] = useState(username || '')
  const [newBio, setNewBio] = useState(bio || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    const cleanUsername = newUsername.trim().toLowerCase().replace(/\s+/g, '_')

    if (!cleanUsername) {
      setError('Username is required')
      return
    }

    setSaving(true)
    setError('')

    const result = await onSave(cleanUsername, newBio.trim())

    if (result?.error) {
      setError(result.error)
    }

    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 relative">
        <h2
          className="font-black text-xl text-white tracking-widest mb-6"
          style={{ fontFamily: 'monospace' }}
        >
          EDIT PROFILE ✏️
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            ❌ {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-sm font-bold">
                @
              </span>
              <input
                type="text"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                placeholder="your_gamer_tag"
                className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
              />
            </div>
            <p className="text-slate-600 text-xs mt-1">Spaces will become underscores</p>
          </div>

          <div>
            <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">
              Bio
            </label>
            <textarea
              value={newBio}
              onChange={(event) => setNewBio(event.target.value)}
              placeholder="BGMI Conqueror • Lo-fi enthusiast..."
              rows={3}
              maxLength={100}
              className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600 resize-none"
            />
            <p className="text-slate-600 text-xs mt-1 text-right">{newBio.length}/100</p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
              style={{ fontFamily: 'monospace' }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110 transition-all duration-300 disabled:opacity-50"
              style={{ fontFamily: 'monospace' }}
            >
              {saving ? 'SAVING...' : 'SAVE ✅'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ clip, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onConfirm(clip)
    setDeleting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#0b1425] border border-red-500/30 rounded-xl p-8">
        <div className="text-5xl mb-4 text-center">🗑️</div>
        <h2
          className="font-black text-xl text-white tracking-widest mb-2 text-center"
          style={{ fontFamily: 'monospace' }}
        >
          DELETE CLIP?
        </h2>
        <p className="text-slate-400 text-sm text-center mb-2">"{clip.title}"</p>
        <p className="text-slate-600 text-xs text-center mb-6">This cannot be undone</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
            style={{ fontFamily: 'monospace' }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
            style={{ fontFamily: 'monospace' }}
          >
            {deleting ? 'DELETING...' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ClipGrid({ clips, navigate, onDelete, showDelete = false }) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-20 border border-cyan-500/10 rounded-xl bg-[#0b1425]">
        <div className="text-5xl mb-4">🎮</div>
        <p className="text-slate-400 text-sm tracking-widest">NO CLIPS HERE YET</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {clips.map((clip) => {
        const color = clip.color || gameColors[clip.game] || '#00f5ff'
        const hasVideo = Boolean(clip.video_url)

        return (
          <div
            key={clip.id}
            className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:border-cyan-400/30 group relative"
          >
            {showDelete && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); onDelete(clip) }}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-sm transition-all duration-200 hover:bg-red-500/80 text-slate-300"
                title="Delete clip"
              >
                🗑️
              </button>
            )}

            {!hasVideo && (
              <div className="absolute top-2 left-2 z-10 rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-black tracking-widest text-white">
                NO VIDEO
              </div>
            )}

            <div
              onClick={() => hasVideo && navigate(`/clip/${clip.id}`)}
              className={`h-36 flex items-center justify-center relative overflow-hidden ${
                hasVideo ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
              }`}
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
                {hasVideo ? '▶' : '!'}
              </div>
            </div>

            <div
              className={`p-4 ${hasVideo ? 'cursor-pointer' : ''}`}
              onClick={() => hasVideo && navigate(`/clip/${clip.id}`)}
            >
              <div className="font-black text-xs tracking-widest mb-1" style={{ fontFamily: 'monospace', color }}>
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
          </div>
        )
      })}
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [clips, setClips] = useState([])
  const [savedClips, setSavedClips] = useState([])
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [verified, setVerified] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savedLoading, setSavedLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('myClips')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteClip, setDeleteClip] = useState(null)

  const followerChannelRef = useRef(null)

  useEffect(() => {
    if (!user) return

    fetchProfile()
    fetchMyClips()
    fetchFollowers()
    fetchSavedClips()
    subscribeToFollowers()

    return cleanupFollowerChannel
  }, [user?.id])

  function cleanupFollowerChannel() {
    if (followerChannelRef.current) {
      supabase.removeChannel(followerChannelRef.current)
      followerChannelRef.current = null
    }
  }

  function subscribeToFollowers() {
    cleanupFollowerChannel()

    const channel = supabase
      .channel(`profile-followers:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follows', filter: `following_id=eq.${user.id}` },
        () => setFollowerCount((prev) => prev + 1))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'follows', filter: `following_id=eq.${user.id}` },
        () => setFollowerCount((prev) => Math.max(0, prev - 1)))
      .subscribe()

    followerChannelRef.current = channel
  }

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('username, bio, verified')
      .eq('user_id', user.id)
      .single()

    setUsername(data?.username || '')
    setBio(data?.bio || '')
    setVerified(data?.verified || false)
  }

  async function fetchFollowers() {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id)

    setFollowerCount(count || 0)
  }

  async function fetchMyClips() {
    setLoading(true)

    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setClips(data || [])
    setLoading(false)
  }

  async function fetchSavedClips() {
    setSavedLoading(true)

    const { data } = await supabase
      .from('bookmarks')
      .select('clip_id, clips(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const playableSaved = (data || [])
      .map((bookmark) => bookmark.clips)
      .filter((clip) => clip && clip.video_url)

    setSavedClips(playableSaved)
    setSavedLoading(false)
  }

  // ── Save profile: toast on success/failure ─────────────────────────────────
  async function handleSaveProfile(newUsername, newBio) {
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername, bio: newBio })
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message || 'Could not update profile' }
    }

    setUsername(newUsername)
    setBio(newBio)
    setEditOpen(false)
    toast.success('Profile updated!', { icon: '✏️' })

    return { success: true }
  }

  // ── Delete clip: toast on success/failure ──────────────────────────────────
  async function handleDeleteClip(clip) {
    const { error } = await supabase.from('clips').delete().eq('id', clip.id)

    if (error) {
      setDeleteClip(null)
      toast.error('Could not delete clip. Try again.')
      return
    }

    if (clip.video_url) {
      const path = clip.video_url.split('/clips/')[1]
      if (path) await supabase.storage.from('clips').remove([path])
    }

    if (clip.thumbnail_url) {
      const path = clip.thumbnail_url.split('/clips/')[1]
      if (path) await supabase.storage.from('clips').remove([path])
    }

    setClips((prev) => prev.filter((item) => item.id !== clip.id))
    setSavedClips((prev) => prev.filter((item) => item.id !== clip.id))
    setDeleteClip(null)
    toast.show('Clip deleted', { icon: '🗑️' })
  }

  const playableClips = clips.filter((clip) => clip.video_url)
  const totalViews = clips.reduce((sum, clip) => sum + (clip.views || 0), 0)
  const totalLikes = clips.reduce((sum, clip) => sum + (clip.likes || 0), 0)
  const displayName = username || user?.email?.split('@')[0] || 'gamer'

  const stats = [
    { label: 'Clips', value: playableClips.length },
    { label: 'Total Views', value: totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews },
    { label: 'Total Likes', value: totalLikes > 999 ? `${(totalLikes / 1000).toFixed(1)}K` : totalLikes },
    { label: 'Followers', value: followerCount > 999 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO
        title={`@${displayName} — My Profile`}
        description="Manage your FragBeats profile, clips and saved content."
        url="/profile"
      />
      <Navbar />

      {editOpen && (
        <EditProfileModal
          username={username}
          bio={bio}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {deleteClip && (
        <DeleteConfirmModal
          clip={deleteClip}
          onClose={() => setDeleteClip(null)}
          onConfirm={handleDeleteClip}
        />
      )}

      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-24">
        <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl flex-shrink-0">
              🎮
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h1 className="font-black text-2xl text-white tracking-widest" style={{ fontFamily: 'monospace' }}>
                  @{displayName}
                </h1>
                {verified && <span title="Verified Creator" className="text-xl">✅</span>}
              </div>

              <p className="text-cyan-400 text-sm mb-1 tracking-widest">
                FragBeats Creator
                {verified && (
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded ml-1">
                    VERIFIED
                  </span>
                )}
              </p>

              {bio && <p className="text-slate-400 text-sm mb-2">{bio}</p>}
              <p className="text-slate-500 text-xs">{user?.email}</p>

              <div className="flex gap-3 mt-4 justify-center md:justify-start flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200"
                  style={{ fontFamily: 'monospace' }}
                >
                  + UPLOAD CLIP
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-xs tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-cyan-500/10">
            {stats.map((stat) => (
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

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('myClips')}
            className={`px-5 py-2 rounded-lg text-xs font-black tracking-widest transition-all duration-200 ${
              activeTab === 'myClips'
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400'
            }`}
            style={{ fontFamily: 'monospace' }}
          >
            🎮 My Clips ({clips.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2 rounded-lg text-xs font-black tracking-widest transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400'
            }`}
            style={{ fontFamily: 'monospace' }}
          >
            🔖 Saved ({savedClips.length})
          </button>
        </div>

        {activeTab === 'myClips' && (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-36 bg-cyan-500/10" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-cyan-500/10 rounded w-1/3" />
                    <div className="h-4 bg-cyan-500/10 rounded w-2/3" />
                    <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : clips.length === 0 ? (
            <div className="text-center py-20 border border-cyan-500/10 rounded-xl bg-[#0b1425]">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-slate-400 text-sm tracking-widest mb-4">NO CLIPS YET</p>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}
              >
                UPLOAD YOUR FIRST CLIP
              </button>
            </div>
          ) : (
            <ClipGrid clips={clips} navigate={navigate} onDelete={setDeleteClip} showDelete />
          )
        )}

        {activeTab === 'saved' && (
          savedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-36 bg-cyan-500/10" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-cyan-500/10 rounded w-1/3" />
                    <div className="h-4 bg-cyan-500/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : savedClips.length === 0 ? (
            <div className="text-center py-20 border border-cyan-500/10 rounded-xl bg-[#0b1425]">
              <div className="text-5xl mb-4">🔖</div>
              <p className="text-slate-400 text-sm tracking-widest mb-2">NO SAVED CLIPS YET</p>
              <p className="text-slate-600 text-xs mb-4">Tap 📌 on any clip in the feed to save it</p>
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}
              >
                GO TO FEED
              </button>
            </div>
          ) : (
            <ClipGrid clips={savedClips} navigate={navigate} showDelete={false} />
          )
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Profile