import { useState } from 'react'

const TRACKS = [
  { id: 1, name: 'Chill Lo-fi Vol.3', artist: 'FragBeats Studio', duration: '3:24' },
  { id: 2, name: 'Midnight Vibes', artist: 'NeonWave', duration: '2:58' },
  { id: 3, name: 'Synthwave Dreams', artist: 'RetroSynth', duration: '4:12' },
  { id: 4, name: 'Rain & Bass', artist: 'DeepDrop', duration: '3:45' },
  { id: 5, name: 'Deep Focus', artist: 'MindWave', duration: '5:01' },
]

function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(30)
  const [expanded, setExpanded] = useState(false)
  const [liked, setLiked] = useState(false)

  const track = TRACKS[currentTrack]

  const nextTrack = () => {
    setCurrentTrack(prev => (prev + 1) % TRACKS.length)
    setProgress(0)
  }

  const prevTrack = () => {
    setCurrentTrack(prev => (prev - 1 + TRACKS.length) % TRACKS.length)
    setProgress(0)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-500/20 backdrop-blur-xl" style={{ background: 'rgba(4,8,16,0.95)' }}>

      {/* Expanded track list */}
      {expanded && (
        <div className="border-b border-cyan-500/10 p-4 max-w-2xl mx-auto">
          <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// QUEUE</p>
          <div className="flex flex-col gap-2">
            {TRACKS.map((t, i) => (
              <div
                key={t.id}
                onClick={() => { setCurrentTrack(i); setProgress(0); setPlaying(true) }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${i === currentTrack ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i === currentTrack ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                    {i === currentTrack && playing ? '▶' : i + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${i === currentTrack ? 'text-cyan-400' : 'text-white'}`}>{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.artist}</div>
                  </div>
                </div>
                <span className="text-slate-500 text-xs">{t.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg flex-shrink-0 ${playing ? 'animate-pulse' : ''}`}>
            🎵
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-bold truncate">{track.name}</div>
            <div className="text-slate-500 text-xs truncate">{track.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={prevTrack} className="text-slate-400 hover:text-white transition-colors duration-200 text-lg">
            ⏮
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-black font-bold text-sm hover:brightness-110 transition-all duration-200"
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={nextTrack} className="text-slate-400 hover:text-white transition-colors duration-200 text-lg">
            ⏭
          </button>
        </div>

        {/* Progress */}
        <div className="hidden md:flex items-center gap-3 flex-1">
          <span className="text-slate-500 text-xs">1:02</span>
          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              setProgress(Math.round((x / rect.width) * 100))
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-slate-500 text-xs">{track.duration}</span>
        </div>

        {/* Extra controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setLiked(!liked)}
            className={`text-lg transition-colors duration-200 ${liked ? 'text-pink-400' : 'text-slate-400 hover:text-pink-400'}`}
          >
            {liked ? '❤️' : '🤍'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-slate-400 hover:text-cyan-400 transition-colors duration-200 text-lg ${expanded ? 'text-cyan-400' : ''}`}
          >
            {expanded ? '⬇️' : '⬆️'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default MusicPlayer