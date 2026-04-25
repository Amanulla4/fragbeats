import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

const ALL_CLIPS = [
  { id: 1, type: 'clip', game: 'BGMI', title: 'Insane 1v4 clutch', creator: '@fragkingAman', views: '128K', emoji: '🎮', color: '#00f5ff' },
  { id: 2, type: 'clip', game: 'Valorant', title: 'Ace round highlight', creator: '@neonwolf99', views: '94K', emoji: '🔫', color: '#bf00ff' },
  { id: 3, type: 'clip', game: 'Free Fire', title: 'Headshot compilation', creator: '@drip_editz', views: '211K', emoji: '🔥', color: '#ff6b35' },
  { id: 4, type: 'clip', game: 'COD Mobile', title: 'Solo win gameplay', creator: '@ghostfrags', views: '76K', emoji: '💀', color: '#00f5ff' },
]

const ALL_CREATORS = [
  { id: 1, type: 'creator', name: '@fragkingAman', bio: 'BGMI Conqueror • Lo-fi enthusiast', clips: 3, followers: '1.2K', emoji: '🎮' },
  { id: 2, type: 'creator', name: '@neonwolf99', bio: 'Valorant Radiant • Synthwave lover', clips: 8, followers: '4.5K', emoji: '🔫' },
  { id: 3, type: 'creator', name: '@drip_editz', bio: 'Free Fire • Edit lord', clips: 15, followers: '12K', emoji: '🔥' },
  { id: 4, type: 'creator', name: '@ghostfrags', bio: 'COD Mobile • Night grinder', clips: 6, followers: '2.8K', emoji: '💀' },
]

const ALL_TRACKS = [
  { id: 1, type: 'track', name: 'Chill Lo-fi Vol.3', artist: 'FragBeats Studio', genre: 'Lo-fi', duration: '3:24' },
  { id: 2, type: 'track', name: 'Midnight Vibes', artist: 'NeonWave', genre: 'Synthwave', duration: '2:58' },
  { id: 3, type: 'track', name: 'Deep Focus', artist: 'MindWave', genre: 'Ambient', duration: '5:01' },
  { id: 4, type: 'track', name: 'Urban Lo-fi', artist: 'CityBeats', genre: 'Lo-fi', duration: '2:33' },
]

const TABS = ['All', 'Clips', 'Creators', 'Music']

function Search() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const navigate = useNavigate()

  const q = query.toLowerCase()

  const filteredClips = ALL_CLIPS.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.creator.toLowerCase().includes(q) ||
    c.game.toLowerCase().includes(q)
  )

  const filteredCreators = ALL_CREATORS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.bio.toLowerCase().includes(q)
  )

  const filteredTracks = ALL_TRACKS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.artist.toLowerCase().includes(q) ||
    t.genre.toLowerCase().includes(q)
  )

  const showClips = activeTab === 'All' || activeTab === 'Clips'
  const showCreators = activeTab === 'All' || activeTab === 'Creators'
  const showTracks = activeTab === 'All' || activeTab === 'Music'

  const totalResults = filteredClips.length + filteredCreators.length + filteredTracks.length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// SEARCH</p>
        <h1 className="font-black text-4xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Find Anything 🔍
        </h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input
            type="text"
            placeholder="Search clips, creators, music..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full border border-cyan-500/20 rounded-xl pl-14 pr-4 py-4 text-lg outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
            style={{ background: 'var(--card)', color: 'var(--text)' }}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${activeTab === tab
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
              style={{ fontFamily: 'monospace' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results */}
        {query === '' ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">Start typing to search</p>
            <p className="text-slate-600 text-sm mt-2">Find clips, creators and music</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💀</div>
            <p className="text-slate-400 text-lg">No results for "{query}"</p>
            <p className="text-slate-600 text-sm mt-2">Try a different search</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* Clips */}
            {showClips && filteredClips.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">🎮 Clips ({filteredClips.length})</p>
                <div className="flex flex-col gap-3">
                  {filteredClips.map(clip => (
                    <div key={clip.id} className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${clip.color}22` }}>
                        {clip.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{clip.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{clip.creator} • {clip.game} • 👁 {clip.views}</div>
                      </div>
                      <div className="text-slate-600 text-xs">▶</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creators */}
            {showCreators && filteredCreators.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">👤 Creators ({filteredCreators.length})</p>
                <div className="flex flex-col gap-3">
                  {filteredCreators.map(creator => (
                    <div key={creator.id} onClick={() => navigate('/profile')} className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl flex-shrink-0">
                        {creator.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-cyan-400 font-bold text-sm">{creator.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{creator.bio}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-bold">{creator.followers}</div>
                        <div className="text-slate-600 text-xs">followers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracks */}
            {showTracks && filteredTracks.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">🎵 Music ({filteredTracks.length})</p>
                <div className="flex flex-col gap-3">
                  {filteredTracks.map(track => (
                    <div key={track.id} onClick={() => navigate('/music')} className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">
                        🎵
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{track.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{track.artist} • {track.genre}</div>
                      </div>
                      <div className="text-slate-500 text-xs">{track.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Search