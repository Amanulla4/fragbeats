import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const GAMES = ['BGMI', 'Valorant', 'Free Fire', 'COD Mobile', 'GTA V', 'Other']

// Real lo-fi YouTube tracks (royalty free)
const MUSIC_TRACKS = [
  { id: 1, name: 'Chill Lo-fi Vol.3', artist: 'Lofi Girl', duration: '3:24', youtubeId: 'jfKfPfyJRdk', genre: 'Lo-fi' },
  { id: 2, name: 'Midnight Vibes', artist: 'ChilledCow', duration: '2:58', youtubeId: '5qap5aO4i9A', genre: 'Lo-fi' },
  { id: 3, name: 'Synthwave Dreams', artist: 'Lofi Hip Hop', duration: '4:12', youtubeId: 'MVPTGNGiI-4', genre: 'Synthwave' },
  { id: 4, name: 'Rain & Bass', artist: 'Lofi Girl', duration: '3:45', youtubeId: 'jfKfPfyJRdk', genre: 'Lo-fi' },
  { id: 5, name: 'Urban Lo-fi', artist: 'City Vibes', duration: '2:33', youtubeId: '5qap5aO4i9A', genre: 'Lo-fi' },
  { id: 6, name: 'Deep Focus', artist: 'Study Music', duration: '5:01', youtubeId: 'MVPTGNGiI-4', genre: 'Ambient' },
  { id: 7, name: 'Gaming Mode', artist: 'FragBeats', duration: '3:12', youtubeId: 'jfKfPfyJRdk', genre: 'Gaming' },
  { id: 8, name: 'Night Drive', artist: 'ChilledCow', duration: '4:30', youtubeId: '5qap5aO4i9A', genre: 'Synthwave' },
]

const GENRE_COLORS = {
  'Lo-fi': '#00f5ff', 'Synthwave': '#bf00ff',
  'Ambient': '#ff6b35', 'Gaming': '#ff2d55'
}

const gameEmojis = {
  'BGMI': '🎮', 'Valorant': '🔫', 'Free Fire': '🔥',
  'COD Mobile': '💀', 'GTA V': '🚗', 'Other': '🎯'
}

const gameColors = {
  'BGMI': '#00f5ff', 'Valorant': '#bf00ff', 'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', 'Other': '#00f5ff'
}

function extractThumbnail(videoFile) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(videoFile)
    video.src = url
    video.onloadeddata = () => { video.currentTime = 1 }
    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => { URL.revokeObjectURL(url); resolve(blob) }, 'image/jpeg', 0.8)
    }
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
  })
}

function Upload() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [previewTrack, setPreviewTrack] = useState(null)
  const [title, setTitle] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  async function handleFileSelect(file) {
    if (!file) return
    if (!file.type.startsWith('video/')) { setError('Please upload a video file (MP4, MOV)'); return }
    if (file.size > 500 * 1024 * 1024) { setError('File too large. Max size is 500MB'); return }
    setError('')
    setVideoFile(file)
    const blob = await extractThumbnail(file)
    if (blob) setThumbnailPreview(URL.createObjectURL(blob))
  }

  function handleDrop(e) { e.preventDefault(); setDragging(false); handleFileSelect(e.dataTransfer.files[0]) }
  function handleFileInput(e) { handleFileSelect(e.target.files[0]) }

  async function handleSubmit() {
    if (!videoFile) return
    setSaving(true)
    setError('')

    try {
      const fileExt = videoFile.name.split('.').pop()
      const baseName = `${user.id}_${Date.now()}`
      setUploadProgress(10)

      // 1. Thumbnail
      let thumbnailUrl = null
      const thumbBlob = await extractThumbnail(videoFile)
      if (thumbBlob) {
        const { error: thumbError } = await supabase.storage
          .from('clips').upload(`${baseName}_thumb.jpg`, thumbBlob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false })
        if (!thumbError) {
          const { data: thumbUrl } = supabase.storage.from('clips').getPublicUrl(`${baseName}_thumb.jpg`)
          thumbnailUrl = thumbUrl.publicUrl
        }
      }

      setUploadProgress(40)

      // 2. Upload video
      const { error: storageError } = await supabase.storage
        .from('clips').upload(`${baseName}.${fileExt}`, videoFile, { cacheControl: '3600', upsert: false })
      if (storageError) throw storageError

      setUploadProgress(80)

      const { data: urlData } = supabase.storage.from('clips').getPublicUrl(`${baseName}.${fileExt}`)
      setUploadProgress(90)

      // 3. Save — music is optional
      const selectedTrackData = MUSIC_TRACKS.find(t => t.id === selectedTrack)

      const { error: dbError } = await supabase.from('clips').insert({
        title: title || 'Untitled Clip',
        game: selectedGame,
        music: selectedTrackData?.name || null,
        emoji: gameEmojis[selectedGame] || '🎮',
        color: gameColors[selectedGame] || '#00f5ff',
        video_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        views: 0,
        likes: 0,
        user_id: user?.id,
      })

      if (dbError) throw dbError

      setUploadProgress(100)
      setSubmitted(true)
      setTimeout(() => navigate('/explore'), 3000)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
      setSaving(false)
      setUploadProgress(0)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔥</div>
          <h2 className="font-black text-4xl text-white mb-4" style={{ fontFamily: 'monospace' }}>CLIP UPLOADED!</h2>
          <p className="text-slate-400 mb-2">Your frag is live on FragBeats 🎮</p>
          <p className="text-slate-600 text-sm">Redirecting to Explore...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#040810]">
      <Navbar />

      {/* YouTube preview iframe - hidden, just for audio */}
      {previewTrack && (
        <iframe
          src={`https://www.youtube.com/embed/${previewTrack}?autoplay=1&controls=0`}
          className="hidden"
          allow="autoplay"
          title="music preview"
        />
      )}

      <div className="max-w-2xl mx-auto px-8 pt-32 pb-16">

        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// UPLOAD</p>
        <h1 className="font-black text-4xl text-white mb-2" style={{ fontFamily: 'monospace' }}>Drop Your Frag 🎮</h1>
        <p className="text-slate-400 mb-10">Share your best gaming moment with the world</p>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${step >= s ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black' : 'bg-[#0b1425] border border-cyan-500/20 text-slate-500'}`}
                style={{ fontFamily: 'monospace' }}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-px w-12 transition-all duration-300 ${step > s ? 'bg-cyan-400' : 'bg-cyan-500/20'}`} />}
            </div>
          ))}
          <span className="text-slate-500 text-xs ml-2">
            {step === 1 ? 'Upload Clip' : step === 2 ? 'Add Details' : 'Pick Music (Optional)'}
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-6">❌ {error}</div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInput} className="hidden" />
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl overflow-hidden text-center cursor-pointer transition-all duration-300 ${dragging ? 'border-cyan-400 bg-cyan-500/10' : videoFile ? 'border-green-400' : 'border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5'}`}
            >
              {videoFile && thumbnailPreview ? (
                <div className="relative">
                  <img src={thumbnailPreview} alt="thumbnail" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-green-400 font-bold tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>CLIP READY!</p>
                    <p className="text-slate-300 text-xs mt-1">{videoFile.name}</p>
                    <p className="text-slate-500 text-xs">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                </div>
              ) : videoFile ? (
                <div className="p-16">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-green-400 font-bold tracking-widest" style={{ fontFamily: 'monospace' }}>CLIP READY!</p>
                  <p className="text-slate-500 text-sm mt-2">{videoFile.name}</p>
                </div>
              ) : (
                <div className="p-16">
                  <div className="text-5xl mb-4">🎮</div>
                  <p className="text-white font-bold mb-2">Drag & drop your clip here</p>
                  <p className="text-slate-500 text-sm">or click to browse files</p>
                  <p className="text-slate-600 text-xs mt-4">MP4, MOV up to 500MB</p>
                </div>
              )}
            </div>
            <button
              onClick={() => videoFile && setStep(2)}
              className={`w-full mt-6 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${videoFile ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110' : 'bg-[#0b1425] text-slate-600 cursor-not-allowed'}`}
              style={{ fontFamily: 'monospace' }}
            >
              NEXT — ADD DETAILS →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {thumbnailPreview && (
              <div className="rounded-lg overflow-hidden border border-cyan-500/20">
                <img src={thumbnailPreview} alt="thumbnail preview" className="w-full h-32 object-cover" />
                <p className="text-slate-500 text-xs text-center py-2">Auto-generated thumbnail ✅</p>
              </div>
            )}

            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Clip Title</label>
              <input type="text" placeholder="My insane 1v4 clutch..." value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#0b1425] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600" />
            </div>

            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-3 block">Select Game</label>
              <div className="grid grid-cols-3 gap-3">
                {GAMES.map(game => (
                  <button key={game} onClick={() => setSelectedGame(game)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${selectedGame === game ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black' : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400'}`}
                    style={{ fontFamily: 'monospace' }}>
                    {gameEmojis[game]} {game}
                  </button>
                ))}
              </div>
              {selectedGame && (
                <p className="text-xs mt-3 tracking-widest" style={{ color: gameColors[selectedGame] }}>
                  {gameEmojis[selectedGame]} {selectedGame} selected
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300" style={{ fontFamily: 'monospace' }}>← BACK</button>
              <button
                onClick={() => (title && selectedGame) && setStep(3)}
                className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${title && selectedGame ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110' : 'bg-[#0b1425] text-slate-600 cursor-not-allowed'}`}
                style={{ fontFamily: 'monospace' }}>
                NEXT — PICK MUSIC →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Music Optional */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white font-bold text-sm">Choose a lo-fi track 🎵</p>
                <p className="text-slate-500 text-xs mt-1">Optional — you can skip this step</p>
              </div>
              {selectedTrack && (
                <button
                  onClick={() => { setSelectedTrack(null); setPreviewTrack(null) }}
                  className="text-slate-500 text-xs hover:text-red-400 transition-colors duration-200"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {MUSIC_TRACKS.map(track => (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${selectedTrack === track.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-cyan-500/20 bg-[#0b1425] hover:border-cyan-400/50'}`}
                >
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedTrack(track.id)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 flex-shrink-0 ${selectedTrack === track.id ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black' : 'bg-[#040810] text-slate-400'}`}>
                      {selectedTrack === track.id ? '✓' : '♪'}
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">{track.name}</div>
                      <div className="text-slate-500 text-xs">{track.artist} •
                        <span className="ml-1 px-1.5 py-0.5 rounded text-xs" style={{ background: `${GENRE_COLORS[track.genre]}22`, color: GENRE_COLORS[track.genre] }}>
                          {track.genre}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{track.duration}</span>
                    <button
                      onClick={() => setPreviewTrack(previewTrack === track.youtubeId ? null : track.youtubeId)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${previewTrack === track.youtubeId ? 'bg-purple-500/30 text-purple-400' : 'bg-[#040810] text-slate-400 hover:text-cyan-400'}`}
                      title="Preview"
                    >
                      {previewTrack === track.youtubeId ? '⏹' : '▶'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected track info */}
            {selectedTrack && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
                <span className="text-lg">🎵</span>
                <div>
                  <p className="text-cyan-400 text-xs font-bold">{MUSIC_TRACKS.find(t => t.id === selectedTrack)?.name}</p>
                  <p className="text-slate-500 text-xs">Will be shown on your clip</p>
                </div>
              </div>
            )}

            {saving && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{uploadProgress < 40 ? 'Generating thumbnail...' : uploadProgress < 80 ? 'Uploading video...' : 'Saving clip...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#0b1425] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} disabled={saving}
                className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50"
                style={{ fontFamily: 'monospace' }}>
                ← BACK
              </button>
              {/* Skip music button */}
              {!selectedTrack && !saving && (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                  style={{ fontFamily: 'monospace' }}
                >
                  SKIP & UPLOAD →
                </button>
              )}
              {/* Upload with music */}
              {(selectedTrack || saving) && (
                <button
                  onClick={() => !saving && handleSubmit()}
                  disabled={saving}
                  className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${!saving ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110' : 'bg-[#0b1425] text-slate-600 cursor-not-allowed'}`}
                  style={{ fontFamily: 'monospace' }}
                >
                  {saving ? `${uploadProgress < 40 ? 'THUMBNAIL...' : uploadProgress < 80 ? 'UPLOADING...' : 'SAVING...'} ${uploadProgress}%` : 'UPLOAD FRAG 🔥'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Upload