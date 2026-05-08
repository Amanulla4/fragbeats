import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function EditProfileModal({ username, bio, onClose, onSave }) {
  const [newUsername, setNewUsername] = useState(username || '')
  const [newBio, setNewBio] = useState(bio || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!newUsername.trim()) { setError('Username is required'); return }
    setSaving(true)
    setError('')
    await onSave(newUsername.trim().toLowerCase().replace(/\s+/g, '_'), newBio.trim())
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="font-black text-xl text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
          EDIT PROFILE ✏️
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            ❌ {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-sm font-bold">@</span>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="your_gamer_tag"
                className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
              />
            </div>
            <p className="text-slate-600 text-xs mt-1">Spaces will become underscores</p>
          </div>

          <div>
            <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Bio</label>
            <textarea
              value={newBio}
              onChange={e => setNewBio(e.target.value)}
              placeholder="BGMI Conqueror • Lo-fi enthusiast..."
              rows={3}
              maxLength={100}
              className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600 resize-none"
            />
            <p className="text-slate-600 text-xs mt-1 text-right">{newBio.length}/100</p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
              style={{ fontFamily: 'monospace' }}
            >
              CANCEL
            </button>
            <button
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

function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (user) { fetchProfile(); fetchMyClips() }
  }, [user])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('username, bio')
      .eq('user_id', user.id)
      .single()
    if (data?.username) setUsername(data.username)
    if (data?.bio) setBio(data.bio)
  }

  async function fetchMyClips() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clips').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (!error) setClips(data)
    setLoading(false)
  }

  async function handleSaveProfile(newUsername, newBio) {
    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername, bio: newBio })
      .eq('user_id', user.id)

    if (!error) {
      setUsername(newUsername)
      setBio(newBio)
      setEditOpen(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const totalViews = clips.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalLikes = clips.reduce((sum, c) => sum + (c.likes || 0), 0)
  const displayName = username || user?.email?.split('@')[0] || 'gamer'

  const STATS = [
    { label: 'Clips', value: clips.length },
    { label: 'Total Views', value: totalViews > 999 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews },
    { label: 'Total Likes', value: totalLikes > 999 ? (totalLikes / 1000).toFixed(1) + 'K' : totalLikes },
    { label: 'Followers', value: '0' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {editOpen && (
        <EditProfileModal
          username={username}
          bio={bio}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm mb-6 text-center">
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl flex-shrink-0">🎮</div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-black text-2xl text-white tracking-widest mb-1" style={{ fontFamily: 'monospace' }}>
                @{displayName}
              </h1>
              <p className="text-cyan-400 text-sm mb-1 tracking-widest">FragBeats Creator</p>
              {bio && <p className="text-slate-400 text-sm mb-2">{bio}</p>}
              <p className="text-slate-500 text-xs">{user?.email}</p>

              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all duration-200"
                  style={{ fontFamily: 'monospace' }}
                >
                  + UPLOAD CLIP
                </button>
                <button
                  onClick={() => setEditOpen(true)}
                  className="border border-cyan-500/20 text-slate-400 px-5 py-2 rounded text-xs tracking-widest hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-cyan-500/10">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-black text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                  {stat.value}
                </div>
                <div className="text-slate-500 text-xs tracking-widest uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// MY CLIPS</p>
        <h2 className="font-black text-3xl text-white mb-6" style={{ fontFamily: 'monospace' }}>My Frags 🎮</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden animate-pulse">
                <div className="h-36 bg-cyan-500/10" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-cyan-500/10 rounded w-1/3" />
                  <div className="h-4 bg-cyan-500/10 rounded w-2/3" />
                  <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && clips.length === 0 && (
          <div className="text-center py-20 border border-cyan-500/10 rounded-xl bg-[#0b1425]">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-slate-400 text-sm tracking-widest mb-4">NO CLIPS YET</p>
            <button onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded font-black text-xs tracking-widest hover:brightness-110 transition-all"
              style={{ fontFamily: 'monospace' }}>
              UPLOAD YOUR FIRST CLIP
            </button>
          </div>
        )}

        {!loading && clips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {clips.map(clip => (
              <div
                key={clip.id}
                onClick={() => navigate(`/clip/${clip.id}`)}
                className="bg-[#0b1425] border border-cyan-500/10 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:border-cyan-400/30 group"
              >
                <div
                  className="h-36 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #0b1425, ${clip.color || '#00f5ff'}22)`,
                    borderBottom: `2px solid ${clip.color || '#00f5ff'}33`
                  }}
                >
                  {clip.thumbnail_url ? (
                    <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{clip.emoji || '🎮'}</span>
                  )}
                  <div className="absolute w-12 h-12 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center text-sm backdrop-blur-sm group-hover:border-cyan-400/60 group-hover:scale-110 transition-all duration-300">▶</div>
                </div>
                <div className="p-4">
                  <div className="font-black text-xs tracking-widest mb-1" style={{ fontFamily: 'monospace', color: clip.color || '#00f5ff' }}>{clip.game}</div>
                  <div className="text-white text-sm font-bold mb-1">{clip.title}</div>
                  <div className="text-slate-500 text-xs mb-3">🎵 {clip.music}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">👁 {clip.views || 0}</span>
                    <span className="text-slate-500 text-xs">❤️ {clip.likes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Profile