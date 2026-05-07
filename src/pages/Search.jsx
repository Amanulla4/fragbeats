import { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TABS = ['All', 'Clips', 'Creators']

const gameColors = {
  'BGMI': '#00f5ff', 'Valorant': '#bf00ff', 'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', 'Other': '#00f5ff'
}

function Search() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [clips, setClips] = useState([])
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  const handleSearch = useCallback(async (q) => {
    setQuery(q)
    if (!q.trim()) {
      setClips([]); setCreators([]); setSearched(false); return
    }
    setLoading(true)
    setSearched(true)

    // Search clips by title or game
    const { data: clipData } = await supabase
      .from('clips')
      .select('*')
      .or(`title.ilike.%${q}%,game.ilike.%${q}%,music.ilike.%${q}%`)
      .order('views', { ascending: false })
      .limit(10)

    // Search creators by username
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${q}%`)
      .limit(10)

    if (clipData) setClips(clipData)
    if (profileData) setCreators(profileData)
    setLoading(false)
  }, [])

  const showClips = activeTab === 'All' || activeTab === 'Clips'
  const showCreators = activeTab === 'All' || activeTab === 'Creators'
  const totalResults = clips.length + creators.length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-16">

        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// SEARCH</p>
        <h1 className="font-black text-4xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Find Anything 🔍
        </h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input
            type="text"
            placeholder="Search clips, games, creators..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
            className="w-full border border-cyan-500/20 rounded-xl pl-14 pr-4 py-4 text-lg outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
            style={{ background: 'var(--card)', color: 'var(--text)' }}
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
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

        {/* Empty state */}
        {!searched && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">Start typing to search</p>
            <p className="text-slate-600 text-sm mt-2">Find clips, games and creators</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && totalResults === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💀</div>
            <p className="text-slate-400 text-lg">No results for "{query}"</p>
            <p className="text-slate-600 text-sm mt-2">Try a different search</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && totalResults > 0 && (
          <div className="flex flex-col gap-8">

            {/* Clips */}
            {showClips && clips.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">🎮 Clips ({clips.length})</p>
                <div className="flex flex-col gap-3">
                  {clips.map(clip => (
                    <div
                      key={clip.id}
                      onClick={() => navigate(`/clip/${clip.id}`)}
                      className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200 group"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${clip.color || gameColors[clip.game] || '#00f5ff'}22` }}
                      >
                        {clip.emoji || '🎮'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors duration-200">
                          {clip.title}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          <span style={{ color: clip.color || gameColors[clip.game] || '#00f5ff' }}>{clip.game}</span>
                          {' • '}🎵 {clip.music}
                          {' • '}👁 {clip.views || 0}
                        </div>
                      </div>
                      <div className="text-slate-600 text-xs group-hover:text-cyan-400 transition-colors duration-200">▶</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creators */}
            {showCreators && creators.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">👤 Creators ({creators.length})</p>
                <div className="flex flex-col gap-3">
                  {creators.map(creator => (
                    <div
                      key={creator.user_id}
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-black text-black flex-shrink-0">
                        {creator.username?.[0]?.toUpperCase() || 'G'}
                      </div>
                      <div className="flex-1">
                        <div className="text-cyan-400 font-bold text-sm">@{creator.username}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{creator.bio || 'FragBeats Creator'}</div>
                      </div>
                      <div className="text-slate-600 text-xs">→</div>
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