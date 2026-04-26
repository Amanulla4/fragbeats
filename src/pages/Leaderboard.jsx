import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TABS = ['Creators', 'Clips', 'Music']

const TOP_CREATORS = [
  { rank: 1, name: '@drip_editz', bio: 'Free Fire • Edit lord', clips: 15, followers: '12K', views: '1.2M', emoji: '🔥', badge: '👑' },
  { rank: 2, name: '@neonwolf99', bio: 'Valorant Radiant', clips: 8, followers: '4.5K', views: '890K', emoji: '🔫', badge: '🥈' },
  { rank: 3, name: '@ghostfrags', bio: 'COD Mobile • Night grinder', clips: 6, followers: '2.8K', views: '654K', emoji: '💀', badge: '🥉' },
  { rank: 4, name: '@fragkingAman', bio: 'BGMI Conqueror', clips: 3, followers: '1.2K', views: '428K', emoji: '🎮', badge: null },
  { rank: 5, name: '@cityvibes', bio: 'GTA V • Urban clips', clips: 9, followers: '3.1K', views: '398K', emoji: '🚗', badge: null },
  { rank: 6, name: '@flashpoint', bio: 'Valorant • Flash king', clips: 11, followers: '5.2K', views: '356K', emoji: '⚡', badge: null },
  { rank: 7, name: '@sniperking', bio: 'BGMI • Long range', clips: 4, followers: '987', views: '289K', emoji: '🎯', badge: null },
  { rank: 8, name: '@blazeshot', bio: 'Free Fire • Rusher', clips: 7, followers: '1.8K', views: '201K', emoji: '💥', badge: null },
]

const TOP_CLIPS = [
  { rank: 1, title: 'Headshot compilation', creator: '@drip_editz', game: 'Free Fire', views: '211K', likes: '8.7K', emoji: '🔥', badge: '👑' },
  { rank: 2, title: 'Ace round highlight', creator: '@flashpoint', game: 'Valorant', views: '167K', likes: '6.1K', emoji: '⚡', badge: '🥈' },
  { rank: 3, title: 'Solo win gameplay', creator: '@cityvibes', game: 'GTA V', views: '143K', likes: '5.3K', emoji: '🚗', badge: '🥉' },
  { rank: 4, title: 'Insane 1v4 clutch', creator: '@fragkingAman', game: 'BGMI', views: '128K', likes: '4.2K', emoji: '🎮', badge: null },
  { rank: 5, title: 'Neon rush gameplay', creator: '@neonwolf99', game: 'Valorant', views: '94K', likes: '3.1K', emoji: '🔫', badge: null },
  { rank: 6, title: 'Solo vs Squad win', creator: '@fragkingAman', game: 'BGMI', views: '89K', likes: '3.8K', emoji: '🎯', badge: null },
  { rank: 7, title: 'Ghost mode gameplay', creator: '@ghostfrags', game: 'COD Mobile', views: '76K', likes: '2.9K', emoji: '💀', badge: null },
  { rank: 8, title: 'Blaze rush clips', creator: '@blazeshot', game: 'Free Fire', views: '55K', likes: '1.9K', emoji: '💥', badge: null },
]

const TOP_MUSIC = [
  { rank: 1, name: 'Deep Focus', artist: 'MindWave', genre: 'Ambient', plays: '198K', duration: '5:01', badge: '👑' },
  { rank: 2, name: 'Synthwave Dreams', artist: 'RetroSynth', genre: 'Synthwave', plays: '121K', duration: '4:12', badge: '🥈' },
  { rank: 3, name: 'Chill Lo-fi Vol.3', artist: 'FragBeats Studio', genre: 'Lo-fi', plays: '89K', duration: '3:24', badge: '🥉' },
  { rank: 4, name: 'Ghost Mode', artist: 'PhantomBeats', genre: 'Ambient', plays: '87K', duration: '4:33', badge: null },
  { rank: 5, name: 'Urban Lo-fi', artist: 'CityBeats', genre: 'Lo-fi', plays: '76K', duration: '2:33', badge: null },
  { rank: 6, name: 'Midnight Vibes', artist: 'NeonWave', genre: 'Synthwave', plays: '64K', duration: '2:58', badge: null },
  { rank: 7, name: 'Street Level', artist: 'CityBeats', genre: 'Hip-hop', plays: '61K', duration: '2:21', badge: null },
  { rank: 8, name: 'Neon Nights', artist: 'NeonWave', genre: 'Synthwave', plays: '55K', duration: '3:18', badge: null },
]

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Creators')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// LEADERBOARD</p>
        <h1 className="font-black text-4xl md:text-5xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
          Top of the Game 🏆
        </h1>
        <p className="text-slate-400 mb-8">The best creators, clips and music on FragBeats</p>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${activeTab === tab
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
              style={{ fontFamily: 'monospace' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {activeTab === 'Creators' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {TOP_CREATORS.slice(0, 3).map((creator, i) => (
              <div
                key={creator.rank}
                className={`bg-[#0b1425] border rounded-xl p-4 text-center transition-all duration-300 ${i === 0 ? 'border-yellow-400/40 -translate-y-2' : i === 1 ? 'border-slate-400/40' : 'border-orange-400/40'}`}
              >
                <div className="text-3xl mb-2">{creator.badge}</div>
                <div className="text-4xl mb-2">{creator.emoji}</div>
                <div className="text-cyan-400 font-bold text-xs tracking-widest truncate">{creator.name}</div>
                <div className="text-slate-500 text-xs mt-1">{creator.views} views</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Clips' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {TOP_CLIPS.slice(0, 3).map((clip, i) => (
              <div
                key={clip.rank}
                className={`bg-[#0b1425] border rounded-xl p-4 text-center transition-all duration-300 ${i === 0 ? 'border-yellow-400/40 -translate-y-2' : i === 1 ? 'border-slate-400/40' : 'border-orange-400/40'}`}
              >
                <div className="text-3xl mb-2">{clip.badge}</div>
                <div className="text-4xl mb-2">{clip.emoji}</div>
                <div className="text-white font-bold text-xs truncate">{clip.title}</div>
                <div className="text-slate-500 text-xs mt-1">👁 {clip.views}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Music' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {TOP_MUSIC.slice(0, 3).map((track, i) => (
              <div
                key={track.rank}
                className={`bg-[#0b1425] border rounded-xl p-4 text-center transition-all duration-300 ${i === 0 ? 'border-yellow-400/40 -translate-y-2' : i === 1 ? 'border-slate-400/40' : 'border-orange-400/40'}`}
              >
                <div className="text-3xl mb-2">{track.badge}</div>
                <div className="text-4xl mb-2">🎵</div>
                <div className="text-white font-bold text-xs truncate">{track.name}</div>
                <div className="text-slate-500 text-xs mt-1">▶ {track.plays}</div>
              </div>
            ))}
          </div>
        )}

        {/* Full List */}
        <div className="flex flex-col gap-3">
          {activeTab === 'Creators' && TOP_CREATORS.map(creator => (
            <div key={creator.rank} className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 cursor-pointer ${creator.rank <= 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'}`}>
              <div className="w-8 text-center font-black text-sm" style={{ fontFamily: 'monospace', color: creator.rank === 1 ? '#fbbf24' : creator.rank === 2 ? '#94a3b8' : creator.rank === 3 ? '#fb923c' : '#475569' }}>
                {creator.badge || `#${creator.rank}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg flex-shrink-0">
                {creator.emoji}
              </div>
              <div className="flex-1">
                <div className="text-cyan-400 font-bold text-sm">{creator.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{creator.bio}</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-white text-xs font-bold">{creator.views}</div>
                <div className="text-slate-600 text-xs">total views</div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs font-bold">{creator.followers}</div>
                <div className="text-slate-600 text-xs">followers</div>
              </div>
            </div>
          ))}

          {activeTab === 'Clips' && TOP_CLIPS.map(clip => (
            <div key={clip.rank} className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 cursor-pointer ${clip.rank <= 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'}`}>
              <div className="w-8 text-center font-black text-sm" style={{ fontFamily: 'monospace', color: clip.rank === 1 ? '#fbbf24' : clip.rank === 2 ? '#94a3b8' : clip.rank === 3 ? '#fb923c' : '#475569' }}>
                {clip.badge || `#${clip.rank}`}
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#040810] flex items-center justify-center text-xl flex-shrink-0">
                {clip.emoji}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{clip.title}</div>
                <div className="text-slate-500 text-xs mt-0.5">{clip.creator} • {clip.game}</div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs font-bold">👁 {clip.views}</div>
                <div className="text-slate-600 text-xs">❤️ {clip.likes}</div>
              </div>
            </div>
          ))}

          {activeTab === 'Music' && TOP_MUSIC.map(track => (
            <div key={track.rank} className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:border-cyan-400/30 cursor-pointer ${track.rank <= 3 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-[#0b1425] border-cyan-500/10'}`}>
              <div className="w-8 text-center font-black text-sm" style={{ fontFamily: 'monospace', color: track.rank === 1 ? '#fbbf24' : track.rank === 2 ? '#94a3b8' : track.rank === 3 ? '#fb923c' : '#475569' }}>
                {track.badge || `#${track.rank}`}
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">
                🎵
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{track.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{track.artist} • {track.genre}</div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs font-bold">▶ {track.plays}</div>
                <div className="text-slate-600 text-xs">{track.duration}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Leaderboard