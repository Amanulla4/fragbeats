// src/pages/Analytics.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const PERIODS = ['7 Days', '30 Days', '90 Days']

function MiniChart({ data, color = '#00f5ff' }) {
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-20 flex items-center justify-center">
        <p className="text-slate-600 text-xs">Not enough data yet</p>
      </div>
    )
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 300
  const height = 80

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace('#', '')})`}
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

function StatCard({ icon, label, value, sub, loading }) {
  return (
    <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-5">
      <div className="text-2xl mb-3">{icon}</div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-7 bg-cyan-500/10 rounded w-2/3 mb-2" />
          <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
        </div>
      ) : (
        <>
          <div className="font-black text-2xl text-white mb-1" style={{ fontFamily: 'monospace' }}>
            {value}
          </div>
          <div className="text-slate-500 text-xs mb-1">{label}</div>
          {sub && <div className="text-xs text-cyan-400/70">{sub}</div>}
        </>
      )}
    </div>
  )
}

function fmt(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function Analytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('7 Days')
  const [loading, setLoading] = useState(true)

  const [totalViews, setTotalViews] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [clipCount, setClipCount] = useState(0)
  const [topClips, setTopClips] = useState([])
  const [viewsChart, setViewsChart] = useState([])
  const [followersChart, setFollowersChart] = useState([])

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user])

  async function fetchAnalytics() {
    setLoading(true)

    // ── All user's clips ───────────────────────────────────────────────────
    const { data: clips } = await supabase
      .from('clips')
      .select('id, title, views, likes, thumbnail_url, emoji, created_at')
      .eq('user_id', user.id)
      .order('views', { ascending: false })

    const clipData = clips || []
    setClipCount(clipData.length)

    const views = clipData.reduce((sum, c) => sum + (c.views || 0), 0)
    const likes = clipData.reduce((sum, c) => sum + (c.likes || 0), 0)
    setTotalViews(views)
    setTotalLikes(likes)
    setTopClips(clipData.slice(0, 5))

    // ── Followers ─────────────────────────────────────────────────────────
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id)

    setFollowerCount(followers || 0)

    // ── Comments on user's clips ───────────────────────────────────────────
    const clipIds = clipData.map((c) => c.id)

    if (clipIds.length > 0) {
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('clip_id', clipIds)

      setTotalComments(commentCount || 0)
    }

    // ── Views chart: views per clip bucketed by created_at ─────────────────
    // Simple approach: spread clip views across their upload date buckets
    const days = period === '7 Days' ? 7 : period === '30 Days' ? 30 : 90
    const now = Date.now()
    const buckets = Array(days).fill(0)

    clipData.forEach((clip) => {
      const age = Math.floor((now - new Date(clip.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const bucket = days - 1 - Math.min(age, days - 1)
      buckets[bucket] += clip.views || 0
    })

    setViewsChart(buckets)

    // ── Followers chart: simulate growth from follow timestamps ────────────
    const { data: followData } = await supabase
      .from('follows')
      .select('created_at')
      .eq('following_id', user.id)
      .order('created_at', { ascending: true })

    const followBuckets = Array(days).fill(0)
    let runningTotal = 0

    ;(followData || []).forEach((follow) => {
      const age = Math.floor((now - new Date(follow.created_at).getTime()) / (1000 * 60 * 60 * 24))
      if (age < days) {
        const bucket = days - 1 - age
        followBuckets[bucket]++
      }
    })

    // Convert to cumulative
    const cumulativeFollowers = followBuckets.map((val) => {
      runningTotal += val
      return runningTotal
    })

    setFollowersChart(cumulativeFollowers.length > 0 ? cumulativeFollowers : [0, 0])
    setLoading(false)
  }

  // Refetch when period changes
  useEffect(() => {
    if (user && !loading) fetchAnalytics()
  }, [period])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <SEO title="Analytics" url="/analytics" />
      <Navbar />

      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-32 pb-44 md:pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-cyan-400 text-xs tracking-widest uppercase mb-2">// ANALYTICS</p>
            <h1 className="font-black text-4xl text-white" style={{ fontFamily: 'monospace' }}>
              Your Stats 📊
            </h1>
          </div>

          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${
                  period === p
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                    : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👁" label="Total Views" value={fmt(totalViews)} sub={`${clipCount} clips`} loading={loading} />
          <StatCard icon="❤️" label="Total Likes" value={fmt(totalLikes)} loading={loading} />
          <StatCard icon="👤" label="Followers" value={fmt(followerCount)} loading={loading} />
          <StatCard icon="💬" label="Comments" value={fmt(totalComments)} loading={loading} />
        </div>

        {/* Views chart */}
        <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>
              VIEWS BY UPLOAD DATE
            </h3>
            <span className="text-cyan-400 text-xs">👁 Views</span>
          </div>
          {loading ? (
            <div className="w-full h-20 animate-pulse bg-cyan-500/5 rounded" />
          ) : (
            <MiniChart data={viewsChart} color="#00f5ff" />
          )}
          <div className="flex justify-between mt-2">
            <span className="text-slate-600 text-xs">{period === '7 Days' ? '7 days ago' : period === '30 Days' ? '30 days ago' : '90 days ago'}</span>
            <span className="text-slate-600 text-xs">Today</span>
          </div>
        </div>

        {/* Followers chart */}
        <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>
              FOLLOWERS GROWTH
            </h3>
            <span className="text-purple-400 text-xs">👤 Followers</span>
          </div>
          {loading ? (
            <div className="w-full h-20 animate-pulse bg-purple-500/5 rounded" />
          ) : (
            <MiniChart data={followersChart} color="#bf00ff" />
          )}
          <div className="flex justify-between mt-2">
            <span className="text-slate-600 text-xs">{period === '7 Days' ? '7 days ago' : period === '30 Days' ? '30 days ago' : '90 days ago'}</span>
            <span className="text-slate-600 text-xs">Today</span>
          </div>
        </div>

        {/* Top clips */}
        <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6">
          <h3 className="font-black text-white tracking-widest mb-6 text-sm" style={{ fontFamily: 'monospace' }}>
            TOP PERFORMING CLIPS
          </h3>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 bg-[#040810] rounded-lg">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-cyan-500/10 rounded w-1/2" />
                    <div className="h-3 bg-cyan-500/10 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : topClips.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-slate-500 text-sm">No clips yet</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-5 py-2 rounded-lg font-black text-xs tracking-widest hover:brightness-110 transition-all"
                style={{ fontFamily: 'monospace' }}
              >
                + UPLOAD YOUR FIRST FRAG
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topClips.map((clip, i) => (
                <button
                  key={clip.id}
                  onClick={() => navigate(`/clip/${clip.id}`)}
                  className="flex items-center gap-4 p-4 bg-[#040810] rounded-lg border border-cyan-500/10 hover:border-cyan-400/30 transition-all duration-200 text-left group"
                >
                  <div
                    className="font-black text-xl w-8 text-center flex-shrink-0"
                    style={{
                      fontFamily: 'monospace',
                      color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#fb923c' : '#475569',
                    }}
                  >
                    #{i + 1}
                  </div>

                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-cyan-500/10 flex items-center justify-center">
                    {clip.thumbnail_url ? (
                      <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{clip.emoji || '🎮'}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                      {clip.title || 'Untitled Clip'}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                      <span>👁 {fmt(clip.views || 0)}</span>
                      <span>❤️ {fmt(clip.likes || 0)}</span>
                    </div>
                  </div>

                  <div className="text-slate-600 text-xs group-hover:text-cyan-400 transition-colors">→</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CTA if no clips */}
        {!loading && clipCount === 0 && (
          <div className="mt-6 text-center p-6 border border-cyan-500/10 rounded-xl">
            <p className="text-slate-500 text-sm mb-4">Upload clips to start seeing your analytics grow 🚀</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all"
              style={{ fontFamily: 'monospace' }}
            >
              + UPLOAD YOUR FRAG
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Analytics