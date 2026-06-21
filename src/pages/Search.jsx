// src/pages/Search.jsx
import { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

const TABS = ['All', 'Clips', 'Creators']

const gameColors = {
  BGMI: '#00f5ff',
  Valorant: '#bf00ff',
  'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55',
  'GTA V': '#ffd700',
  Other: '#00f5ff',
}

function Search() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [clips, setClips] = useState([])
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  const handleSearch = useCallback(async (value) => {
    setQuery(value)

    const cleanQuery = value.trim()

    if (!cleanQuery) {
      setClips([])
      setCreators([])
      setSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setSearched(true)

    const escapedQuery = cleanQuery.replaceAll('%', '').replaceAll(',', ' ')

    const { data: clipData, error: clipError } = await supabase
      .from('clips')
      .select('*')
      .not('video_url', 'is', null)
      .or(`title.ilike.%${escapedQuery}%,game.ilike.%${escapedQuery}%,music.ilike.%${escapedQuery}%`)
      .order('views', { ascending: false })
      .limit(10)

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${escapedQuery}%`)
      .limit(10)

    if (clipError) console.error('Search clips error:', clipError.message)
    if (profileError) console.error('Search creators error:', profileError.message)

    setClips(clipData || [])
    setCreators(profileData || [])
    setLoading(false)
  }, [])

  const showClips = activeTab === 'All' || activeTab === 'Clips'
  const showCreators = activeTab === 'All' || activeTab === 'Creators'
  const totalResults = clips.length + creators.length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO
        title="Search"
        description="Search gaming clips and creators on FragBeats."
        url="/search"
      />
      <Navbar />

      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-24">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// SEARCH</p>

        <h1 className="font-black text-4xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Find Anything 🔍
        </h1>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>

          <input
            type="text"
            placeholder="Search clips, games, creators..."
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
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

        <div className="flex gap-3 mb-8 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
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

        {!searched && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">Start typing to search</p>
            <p className="text-slate-600 text-sm mt-2">Find playable clips, games and creators</p>
          </div>
        )}

        {searched && !loading && totalResults === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💀</div>
            <p className="text-slate-400 text-lg">No results for "{query}"</p>
            <p className="text-slate-600 text-sm mt-2">Try a different search</p>
          </div>
        )}

        {searched && !loading && totalResults > 0 && (
          <div className="flex flex-col gap-8">
            {showClips && clips.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">
                  🎮 Clips ({clips.length})
                </p>

                <div className="flex flex-col gap-3">
                  {clips.map((clip) => {
                    const color = clip.color || gameColors[clip.game] || '#00f5ff'

                    return (
                      <button
                        key={clip.id}
                        type="button"
                        onClick={() => navigate(`/clip/${clip.id}`)}
                        className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200 group text-left"
                      >
                        <div
                          className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                          style={{ background: `${color}22` }}
                        >
                          {clip.thumbnail_url ? (
                            <img
                              src={clip.thumbnail_url}
                              alt={clip.title || 'Clip thumbnail'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{clip.emoji || '🎮'}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors duration-200 truncate">
                            {clip.title || 'Untitled Clip'}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5 truncate">
                            <span style={{ color }}>{clip.game || 'Other'}</span>
                            {' • '}🎵 {clip.music || 'No music'}
                            {' • '}👁 {clip.views || 0}
                          </div>
                        </div>

                        <div className="text-slate-600 text-xs group-hover:text-cyan-400 transition-colors duration-200">
                          ▶
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {showCreators && creators.length > 0 && (
              <div>
                <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">
                  👤 Creators ({creators.length})
                </p>

                <div className="flex flex-col gap-3">
                  {creators.map((creator) => (
                    <button
                      key={creator.user_id}
                      type="button"
                      onClick={() => navigate(`/u/${creator.username}`)}
                      className="flex items-center gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-lg cursor-pointer hover:border-cyan-400/30 transition-all duration-200 text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-black text-black flex-shrink-0">
                        {creator.username?.[0]?.toUpperCase() || 'G'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-cyan-400 font-bold text-sm">
                          @{creator.username || 'creator'}
                          {creator.verified && <span title="Verified Creator">✅</span>}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5 truncate">
                          {creator.bio || 'FragBeats Creator'}
                        </div>
                      </div>

                      <div className="text-slate-600 text-xs">→</div>
                    </button>
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