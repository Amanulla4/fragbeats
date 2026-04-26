import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PERIODS = ['7 Days', '30 Days', '90 Days']

const STATS = [
  { label: 'Total Views', value: '428K', change: '+12.4%', up: true, icon: '👁' },
  { label: 'Total Likes', value: '16.7K', change: '+8.2%', up: true, icon: '❤️' },
  { label: 'New Followers', value: '+234', change: '+23.1%', up: true, icon: '👤' },
  { label: 'Comments', value: '1.2K', change: '-3.4%', up: false, icon: '💬' },
]

const CHART_DATA = {
  '7 Days': [40, 65, 50, 80, 75, 90, 128],
  '30 Days': [20, 35, 45, 30, 55, 60, 75, 80, 65, 90, 85, 95, 70, 88, 92, 78, 85, 95, 100, 88, 92, 85, 90, 95, 88, 92, 98, 105, 115, 128],
  '90 Days': [15, 20, 25, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 70, 68, 75, 80, 78, 85, 90, 88, 95, 100, 98, 105, 110, 115, 120, 118, 125, 128, 130, 128, 135, 140, 138, 145, 150, 148, 155, 160, 158, 165, 170, 168, 175, 180, 178, 185, 190, 188, 195, 200, 198, 205, 210, 208, 215, 220, 218, 225, 230, 228, 235, 240, 238, 245, 250, 248, 255, 260, 258, 265, 270, 268, 275, 280, 278, 285, 290, 288, 295, 300, 298, 305, 310, 315, 320],
}

const TOP_CLIPS = [
  { title: 'Insane 1v4 clutch', views: '128K', likes: '4.2K', comments: '234', growth: '+12%' },
  { title: 'Solo vs Squad win', views: '89K', likes: '3.8K', comments: '189', growth: '+8%' },
  { title: 'Headshot compilation', views: '211K', likes: '8.7K', comments: '412', growth: '+24%' },
]

function MiniChart({ data, color = '#00f5ff' }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 300
  const height = 80
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#chartGrad)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Analytics() {
  const [period, setPeriod] = useState('7 Days')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-cyan-400 text-xs tracking-widest uppercase mb-2">// ANALYTICS</p>
            <h1 className="font-black text-4xl text-white" style={{ fontFamily: 'monospace' }}>
              Your Stats 📊
            </h1>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${period === p
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                  : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400'}`}
                style={{ fontFamily: 'monospace' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-5">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="font-black text-2xl text-white mb-1" style={{ fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              <div className="text-slate-500 text-xs mb-2">{stat.label}</div>
              <div className={`text-xs font-bold ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change} vs last period
              </div>
            </div>
          ))}
        </div>

        {/* Views Chart */}
        <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-white tracking-widest" style={{ fontFamily: 'monospace' }}>
              VIEWS OVER TIME
            </h3>
            <span className="text-cyan-400 text-xs">👁 Total views</span>
          </div>
          <MiniChart data={CHART_DATA[period]} color="#00f5ff" />
          <div className="flex justify-between mt-2">
            <span className="text-slate-600 text-xs">Start</span>
            <span className="text-slate-600 text-xs">End</span>
          </div>
        </div>

        {/* Followers Chart */}
        <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-white tracking-widest" style={{ fontFamily: 'monospace' }}>
              FOLLOWERS GROWTH
            </h3>
            <span className="text-purple-400 text-xs">👤 Followers</span>
          </div>
          <MiniChart data={CHART_DATA[period].map((v, i) => v * 0.3 + i * 2)} color="#bf00ff" />
          <div className="flex justify-between mt-2">
            <span className="text-slate-600 text-xs">Start</span>
            <span className="text-slate-600 text-xs">End</span>
          </div>
        </div>

        {/* Top Performing Clips */}
        <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6">
          <h3 className="font-black text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
            TOP PERFORMING CLIPS
          </h3>
          <div className="flex flex-col gap-4">
            {TOP_CLIPS.map((clip, i) => (
              <div key={clip.title} className="flex items-center gap-4 p-4 bg-[#040810] rounded-lg border border-cyan-500/10">
                <div className="font-black text-2xl" style={{ fontFamily: 'monospace', color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : '#fb923c' }}>
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm mb-1">{clip.title}</div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>👁 {clip.views}</span>
                    <span>❤️ {clip.likes}</span>
                    <span>💬 {clip.comments}</span>
                  </div>
                </div>
                <div className="text-green-400 text-xs font-bold">{clip.growth}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Analytics