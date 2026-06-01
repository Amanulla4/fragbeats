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
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length)
    setProgress(0)
  }

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length)
    setProgress(0)
  }

  return (
    <div
      className="fixed left-0 right-0 bottom-[72px] md:bottom-0 z-40 border-t border-cyan-500/20 backdrop-blur-xl"
      style={{ background: 'rgba(4,8,16,0.95)' }}
    >
      {expanded && (
        <div className="border-b border-cyan-500/10 p-4 max-w-2xl mx-auto">
          <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">
            // QUEUE
          </p>

          <div className="flex flex-col gap-2">
            {TRACKS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTrack(index)
                  setProgress(0)
                  setPlaying(true)
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 text-left ${
                  index === currentTrack
                    ? 'bg-cyan-500/10 border border-cyan-500/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      index === currentTrack
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {index === currentTrack && playing ? '▶' : index + 1}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        index === currentTrack ? 'text-cyan-400' : 'text-white'
                      }`}
                    >
                      {item.name}
                    </div>
                    <div className="text-slate-500 text-xs truncate">{item.artist}</div>
                  </div>
                </div>

                <span className="text-slate-500 text-xs flex-shrink-0 ml-3">
                  {item.duration}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-2 md:py-3 flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-base md:text-lg flex-shrink-0 ${
              playing ? 'animate-pulse' : ''
            }`}
          >
            🎵
          </div>

          <div className="min-w-0">
            <div className="text-white text-xs font-bold truncate">{track.name}</div>
            <div className="text-slate-500 text-xs truncate">{track.artist}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={prevTrack}
            className="text-slate-400 hover:text-white transition-colors duration-200 text-base md:text-lg"
            aria-label="Previous track"
          >
            ⏮
          </button>

          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-black font-bold text-sm hover:brightness-110 transition-all duration-200"
            aria-label={playing ? 'Pause track' : 'Play track'}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            className="text-slate-400 hover:text-white transition-colors duration-200 text-base md:text-lg"
            aria-label="Next track"
          >
            ⏭
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 flex-1">
          <span className="text-slate-500 text-xs">1:02</span>

          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const x = event.clientX - rect.left
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

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setLiked((prev) => !prev)}
            className={`text-base md:text-lg transition-colors duration-200 ${
              liked ? 'text-pink-400' : 'text-slate-400 hover:text-pink-400'
            }`}
            aria-label={liked ? 'Unlike track' : 'Like track'}
          >
            {liked ? '❤️' : '🤍'}
          </button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`text-slate-400 hover:text-cyan-400 transition-colors duration-200 text-base md:text-lg ${
              expanded ? 'text-cyan-400' : ''
            }`}
            aria-label={expanded ? 'Collapse queue' : 'Expand queue'}
          >
            {expanded ? '⬇️' : '⬆️'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer