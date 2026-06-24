// src/pages/Upload.jsx
import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const GAMES = ['BGMI', 'Valorant', 'Free Fire', 'COD Mobile', 'GTA V', 'Other']

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
  'Ambient': '#ff6b35', 'Gaming': '#ff2d55',
}

const gameEmojis = {
  'BGMI': '🎮', 'Valorant': '🔫', 'Free Fire': '🔥',
  'COD Mobile': '💀', 'GTA V': '🚗', 'Other': '🎯',
}

const gameColors = {
  'BGMI': '#00f5ff', 'Valorant': '#bf00ff', 'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', 'Other': '#00f5ff',
}

// ✅ Max file size — Supabase Free Plan hard limit
const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

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
    setTimeout(() => { URL.revokeObjectURL(url); resolve(null) }, 8000)
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
  const [uploadStage, setUploadStage] = useState('')
  const [error, setError] = useState('')
  const [fileTooLarge, setFileTooLarge] = useState(false)

  async function handleFileSelect(file) {
    if (!file) return

    setFileTooLarge(false)
    setError('')

    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file (MP4, MOV, etc.)')
      return
    }

    // ✅ 50MB hard limit — Supabase Free Plan
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileTooLarge(true)
      setError(`File is ${(file.size / (1024 * 1024)).toFixed(0)}MB — max allowed is ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setVideoFile(file)

    const blob = await extractThumbnail(file)
    if (blob) {
      setThumbnailPreview(URL.createObjectURL(blob))
    } else {
      setThumbnailPreview(null)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  function handleFileInput(e) {
    handleFileSelect(e.target.files[0])
  }

  async function handleSubmit() {
    if (!videoFile) { setError('No video file selected.'); return }
    if (!videoFile.type.startsWith('video/')) { setError('Invalid file type.'); return }

    setSaving(true)
    setError('')
    setFileTooLarge(false)
    setUploadProgress(5)
    setUploadStage('Generating thumbnail...')

    try {
      const fileExt = videoFile.name.split('.').pop() || 'mp4'
      const baseName = `${user.id}_${Date.now()}`

      let thumbnailUrl = null
      const thumbBlob = await extractThumbnail(videoFile)

      if (thumbBlob) {
        setUploadProgress(15)
        setUploadStage('Uploading thumbnail...')

        const { error: thumbError } = await supabase.storage
          .from('clips')
          .upload(`${baseName}_thumb.jpg`, thumbBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          })

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage
            .from('clips')
            .getPublicUrl(`${baseName}_thumb.jpg`)
          thumbnailUrl = thumbUrlData?.publicUrl || null
        }
      }

      setUploadProgress(30)
      setUploadStage('Uploading video...')

      const videoPath = `${baseName}.${fileExt}`

      const { error: storageError } = await supabase.storage
        .from('clips')
        .upload(videoPath, videoFile, { cacheControl: '3600', upsert: false })

      if (storageError) {
        // ✅ Friendly message for size errors from Supabase
        if (storageError.message?.toLowerCase().includes('size') ||
            storageError.message?.toLowerCase().includes('limit') ||
            storageError.message?.toLowerCase().includes('exceeded')) {
          setFileTooLarge(true)
          throw new Error(`File too large for upload. Please compress your clip to under ${MAX_FILE_SIZE_MB}MB and try again.`)
        }
        throw new Error(`Upload failed: ${storageError.message}`)
      }

      setUploadProgress(80)
      setUploadStage('Getting video URL...')

      const { data: urlData } = supabase.storage.from('clips').getPublicUrl(videoPath)

      if (!urlData?.publicUrl) {
        throw new Error('Could not get video URL. Please try again.')
      }

      const videoUrl = urlData.publicUrl
      setUploadProgress(90)
      setUploadStage('Saving clip...')

      const selectedTrackData = MUSIC_TRACKS.find((t) => t.id === selectedTrack)

      const { error: dbError } = await supabase.from('clips').insert({
        title: title.trim() || 'Untitled Clip',
        game: selectedGame,
        music: selectedTrackData?.name || null,
        emoji: gameEmojis[selectedGame] || '🎮',
        color: gameColors[selectedGame] || '#00f5ff',
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        views: 0,
        likes: 0,
        user_id: user.id,
      })

      if (dbError) throw new Error(`Failed to save clip: ${dbError.message}`)

      setUploadProgress(100)
      setUploadStage('Done!')
      setSubmitted(true)
      setTimeout(() => navigate('/explore'), 3000)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
      setSaving(false)
      setUploadProgress(0)
      setUploadStage('')
    }
  }

  function getProgressLabel() {
    if (uploadStage) return uploadStage
    if (uploadProgress < 30) return 'Generating thumbnail...'
    if (uploadProgress < 80) return 'Uploading video...'
    if (uploadProgress < 95) return 'Saving clip...'
    return 'Almost done...'
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center">
        <SEO title="Upload Complete" url="/upload" />
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
      <SEO
        title="Upload Your Frag"
        description="Share your best gaming moment with the FragBeats community."
        url="/upload"
      />
      <Navbar />

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

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                    : 'bg-[#0b1425] border border-cyan-500/20 text-slate-500'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`h-px w-12 transition-all duration-300 ${step > s ? 'bg-cyan-400' : 'bg-cyan-500/20'}`} />
              )}
            </div>
          ))}
          <span className="text-slate-500 text-xs ml-2">
            {step === 1 ? 'Upload Clip' : step === 2 ? 'Add Details' : 'Pick Music (Optional)'}
          </span>
        </div>

        {/* ✅ Standard error */}
        {error && !fileTooLarge && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-6">
            ❌ {error}
          </div>
        )}

        {/* ✅ File too large — special helpful error with tips */}
        {fileTooLarge && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📦</span>
              <div>
                <p className="text-orange-400 font-bold text-sm mb-1">{error}</p>
                <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                  Most gaming clips under 60 seconds are well within the limit. Try one of these:
                </p>
                <ul className="text-slate-500 text-xs space-y-1 mb-3">
                  <li>• Trim your clip to the best 30–45 seconds</li>
                  <li>• Compress with <span className="text-cyan-400">CapCut</span>, <span className="text-cyan-400">HandBrake</span>, or <span className="text-cyan-400">VN Video Editor</span></li>
                  <li>• Lower the resolution to 720p before exporting</li>
                  <li>• Export as MP4 (H.264) for smallest file size</li>
                </ul>
                <button
                  onClick={() => {
                    setFileTooLarge(false)
                    setError('')
                    setVideoFile(null)
                    setThumbnailPreview(null)
                    fileInputRef.current?.click()
                  }}
                  className="text-xs font-black tracking-widest px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110 transition-all"
                  style={{ fontFamily: 'monospace' }}
                >
                  CHOOSE ANOTHER FILE →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileInput} className="hidden" />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !fileTooLarge && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl overflow-hidden text-center transition-all duration-300 ${
                fileTooLarge
                  ? 'border-orange-500/40 opacity-50 cursor-not-allowed'
                  : dragging
                  ? 'border-cyan-400 bg-cyan-500/10 cursor-pointer'
                  : videoFile
                  ? 'border-green-400 cursor-pointer'
                  : 'border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5 cursor-pointer'
              }`}
            >
              {videoFile && thumbnailPreview ? (
                <div className="relative">
                  <img src={thumbnailPreview} alt="thumbnail" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-green-400 font-bold tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>
                      CLIP READY!
                    </p>
                    <p className="text-slate-300 text-xs mt-1">{videoFile.name}</p>
                    <p className="text-slate-500 text-xs">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                </div>
              ) : videoFile ? (
                <div className="p-16">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-green-400 font-bold tracking-widest" style={{ fontFamily: 'monospace' }}>CLIP READY!</p>
                  <p className="text-slate-500 text-sm mt-2">{videoFile.name}</p>
                  <p className="text-slate-600 text-xs mt-1">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
              ) : (
                <div className="p-16">
                  <div className="text-5xl mb-4">🎮</div>
                  <p className="text-white font-bold mb-2">Drag & drop your clip here</p>
                  <p className="text-slate-500 text-sm">or click to browse files</p>
                  {/* ✅ Updated copy to match real limit */}
                  <p className="text-slate-600 text-xs mt-4">MP4, MOV up to {MAX_FILE_SIZE_MB}MB</p>
                  <p className="text-slate-700 text-xs mt-1">Keep clips under 60s for best results</p>
                </div>
              )}
            </div>

            <button
              onClick={() => videoFile && !fileTooLarge && setStep(2)}
              disabled={!videoFile || fileTooLarge}
              className={`w-full mt-6 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${
                videoFile && !fileTooLarge
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                  : 'bg-[#0b1425] text-slate-600 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              NEXT — ADD DETAILS →
            </button>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
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
              <input
                type="text"
                placeholder="My insane 1v4 clutch..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="w-full bg-[#0b1425] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-3 block">Select Game *</label>
              <div className="grid grid-cols-3 gap-3">
                {GAMES.map((game) => (
                  <button
                    key={game}
                    onClick={() => setSelectedGame(game)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
                      selectedGame === game
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                        : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
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
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                style={{ fontFamily: 'monospace' }}
              >
                ← BACK
              </button>
              <button
                onClick={() => title.trim() && selectedGame && setStep(3)}
                disabled={!title.trim() || !selectedGame}
                className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${
                  title.trim() && selectedGame
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                    : 'bg-[#0b1425] text-slate-600 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                NEXT — PICK MUSIC →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────────────────────── */}
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
              {MUSIC_TRACKS.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    selectedTrack === track.id
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-cyan-500/20 bg-[#0b1425] hover:border-cyan-400/50'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 flex-shrink-0 ${
                        selectedTrack === track.id
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                          : 'bg-[#040810] text-slate-400'
                      }`}
                    >
                      {selectedTrack === track.id ? '✓' : '♪'}
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">{track.name}</div>
                      <div className="text-slate-500 text-xs">
                        {track.artist} •{' '}
                        <span
                          className="ml-1 px-1.5 py-0.5 rounded text-xs"
                          style={{ background: `${GENRE_COLORS[track.genre]}22`, color: GENRE_COLORS[track.genre] }}
                        >
                          {track.genre}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{track.duration}</span>
                    <button
                      onClick={() => setPreviewTrack(previewTrack === track.youtubeId ? null : track.youtubeId)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                        previewTrack === track.youtubeId
                          ? 'bg-purple-500/30 text-purple-400'
                          : 'bg-[#040810] text-slate-400 hover:text-cyan-400'
                      }`}
                      title="Preview"
                    >
                      {previewTrack === track.youtubeId ? '⏹' : '▶'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedTrack && !saving && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
                <span className="text-lg">🎵</span>
                <div>
                  <p className="text-cyan-400 text-xs font-bold">
                    {MUSIC_TRACKS.find((t) => t.id === selectedTrack)?.name}
                  </p>
                  <p className="text-slate-500 text-xs">Will be shown on your clip</p>
                </div>
              </div>
            )}

            {saving && (
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{getProgressLabel()}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#0b1425] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={saving}
                className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50"
                style={{ fontFamily: 'monospace' }}
              >
                ← BACK
              </button>

              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${
                  saving
                    ? 'bg-[#0b1425] text-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                {saving
                  ? `${getProgressLabel().replace('...', '')} ${uploadProgress}%`
                  : selectedTrack
                  ? 'UPLOAD FRAG 🔥'
                  : 'SKIP & UPLOAD →'}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Upload