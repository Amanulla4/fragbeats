import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const GENRES = ['All', 'Lo-fi', 'Synthwave', 'Bass', 'Ambient', 'Hip-hop']

const TRACKS = [
  { id: 1, name: 'Chill Lo-fi Vol.3', artist: 'FragBeats Studio', genre: 'Lo-fi', duration: '3:24', plays: '89K', color: '#00f5ff' },
  { id: 2, name: 'Midnight Vibes', artist: 'NeonWave', genre: 'Synthwave', duration: '2:58', plays: '64K', color: '#bf00ff' },
  { id: 3, name: 'Synthwave Dreams', artist: 'RetroSynth', genre: 'Synthwave', duration: '4:12', plays: '121K', color: '#bf00ff' },
  { id: 4, name: 'Rain & Bass', artist: 'DeepDrop', genre: 'Bass', duration: '3:45', plays: '43K', color: '#00f5ff' },
  { id: 5, name: 'Urban Lo-fi', artist: 'CityBeats', genre: 'Lo-fi', duration: '2:33', plays: '76K', color: '#ff6b35' },
  { id: 6, name: 'Deep Focus', artist: 'MindWave', genre: 'Ambient', duration: '5:01', plays: '198K', color: '#00f5ff' },
  { id: 7, name: 'Neon Nights', artist: 'NeonWave', genre: 'Synthwave', duration: '3:18', plays: '55K', color: '#bf00ff' },
  { id: 8, name: 'Fire Beats', artist: 'FragBeats Studio', genre: 'Hip-hop', duration: '2:47', plays: '32K', color: '#ff6b35' },
  { id: 9, name: 'Ghost Mode', artist: 'PhantomBeats', genre: 'Ambient', duration: '4:33', plays: '87K', color: '#00f5ff' },
  { id: 10, name: 'Pixel Dreams', artist: 'RetroSynth', genre: 'Lo-fi', duration: '3:02', plays: '44K', color: '#bf00ff' },
  { id: 11, name: 'Street Level', artist: 'CityBeats', genre: 'Hip-hop', duration: '2:21', plays: '61K', color: '#ff6b35' },
  { id: 12, name: 'Zero Gravity', artist: 'MindWave', genre: 'Ambient', duration: '6:14', plays: '29K', color: '#00f5ff' },
]

function Music() {
  const [activeGenre, setActiveGenre] = useState('All')
  const [playing, setPlaying] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = TRACKS.filter(track => {
    const matchGenre = activeGenre === 'All' || track.genre === activeGenre
    const matchSearch = track.name.toLowerCase().includes(search.toLowerCase()) ||
      track.artist.toLowerCase().includes(search.toLowerCase())
    return matchGenre && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#040810]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// MUSIC LIBRARY</p>
        <h1 className="font-black text-4xl md:text-5xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
          Pick Your Beat 🎵
        </h1>
        <p className="text-slate-400 mb-8">Free lo-fi tracks for your gaming clips</p>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search tracks or artists..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0b1425] border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
          />
        </div>

        {/* Genre Filters */}
        <div className="flex gap-3 flex-wrap mb-8">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${activeGenre === genre
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
              style={{ fontFamily: 'monospace' }}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Track count */}
        <p className="text-slate-500 text-sm mb-4">{filtered.length} tracks available</p>

        {/* Tracks List */}
        <div className="flex flex-col gap-3">
          {filtered.map((track, index) => (
            <div
              key={track.id}
              onClick={() => setPlaying(playing === track.id ? null : track.id)}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all duration-200 group ${playing === track.id
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-cyan-500/10 bg-[#0b1425] hover:border-cyan-400/40'}`}
            >
              {/* Left side */}
              <div className="flex items-center gap-4">

                {/* Number / Play button */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 flex-shrink-0 ${playing === track.id
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  : 'bg-[#040810] text-slate-500 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'}`}
                  style={{ fontFamily: 'monospace' }}
                >
                  {playing === track.id ? '⏸' : index + 1}
                </div>

                {/* Track info */}
                <div>
                  <div className={`font-bold text-sm transition-colors duration-200 ${playing === track.id ? 'text-cyan-400' : 'text-white'}`}>
                    {track.name}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">{track.artist}</div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-6">
                <span
                  className="text-xs px-2 py-1 rounded hidden sm:block"
                  style={{ background: `${track.color}22`, color: track.color }}
                >
                  {track.genre}
                </span>
                <span className="text-slate-500 text-xs hidden sm:block">▶ {track.plays}</span>
                <span className="text-slate-500 text-xs">{track.duration}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Music