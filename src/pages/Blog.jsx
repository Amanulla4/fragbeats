import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CATEGORIES = ['All', 'Updates', 'Gaming', 'Music', 'Creator Tips']

const POSTS = [
  {
    id: 1,
    category: 'Updates',
    title: 'FragBeats is officially live! 🚀',
    excerpt: 'After months of building, FragBeats is finally here. The platform where gaming clips meet lo-fi music is now open for everyone.',
    author: 'Aman Pathan',
    date: 'Jan 15, 2025',
    readTime: '3 min read',
    emoji: '🚀',
    color: '#00f5ff',
  },
  {
    id: 2,
    category: 'Gaming',
    title: 'Top 5 BGMI clips of the month 🎮',
    excerpt: 'We rounded up the most insane BGMI clips uploaded to FragBeats this month. These frags are absolutely wild.',
    author: 'FragBeats Team',
    date: 'Jan 12, 2025',
    readTime: '5 min read',
    emoji: '🎮',
    color: '#00f5ff',
  },
  {
    id: 3,
    category: 'Music',
    title: 'Why lo-fi music and gaming go perfectly together 🎵',
    excerpt: 'There is something magical about playing games with lo-fi music in the background. We explore the science behind why it works.',
    author: 'FragBeats Team',
    date: 'Jan 10, 2025',
    readTime: '4 min read',
    emoji: '🎵',
    color: '#bf00ff',
  },
  {
    id: 4,
    category: 'Creator Tips',
    title: 'How to make your gaming clips go viral 🔥',
    excerpt: 'We analyzed the top 100 clips on FragBeats and found 5 things they all have in common. Here is what you need to know.',
    author: 'Aman Pathan',
    date: 'Jan 8, 2025',
    readTime: '6 min read',
    emoji: '🔥',
    color: '#ff6b35',
  },
  {
    id: 5,
    category: 'Updates',
    title: 'Introducing FragBeats Pro 💎',
    excerpt: 'FragBeats Pro is here with unlimited uploads, 100+ lo-fi tracks, advanced analytics and no ads. Here is everything you need to know.',
    author: 'Aman Pathan',
    date: 'Jan 5, 2025',
    readTime: '4 min read',
    emoji: '💎',
    color: '#bf00ff',
  },
  {
    id: 6,
    category: 'Creator Tips',
    title: 'Best games to clip for maximum views 👀',
    excerpt: 'Not all games perform equally on FragBeats. We looked at the data and here are the games that get the most views.',
    author: 'FragBeats Team',
    date: 'Jan 2, 2025',
    readTime: '3 min read',
    emoji: '👀',
    color: '#00f5ff',
  },
]

function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = POSTS.filter(post => {
    const matchCategory = activeCategory === 'All' || post.category === activeCategory
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// BLOG</p>
        <h1 className="font-black text-4xl md:text-5xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
          FragBeats Blog 📝
        </h1>
        <p className="text-slate-400 mb-8">Updates, gaming tips and music vibes</p>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-cyan-500/20 rounded-lg pl-12 pr-4 py-3 text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
            style={{ background: 'var(--card)', color: 'var(--text)' }}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 flex-wrap mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${activeCategory === cat
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
              style={{ fontFamily: 'monospace' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {activeCategory === 'All' && search === '' && (
          <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 mb-8 relative overflow-hidden cursor-pointer hover:border-cyan-400/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-cyan-400 text-xs tracking-widest uppercase font-bold">⭐ Featured</span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-slate-500 text-xs">{POSTS[0].category}</span>
              </div>
              <div className="text-6xl mb-4">{POSTS[0].emoji}</div>
              <h2 className="font-black text-2xl text-white mb-3" style={{ fontFamily: 'monospace' }}>
                {POSTS[0].title}
              </h2>
              <p className="text-slate-400 mb-4 leading-relaxed">{POSTS[0].excerpt}</p>
              <div className="flex items-center gap-4 text-slate-500 text-xs">
                <span>✍️ {POSTS[0].author}</span>
                <span>📅 {POSTS[0].date}</span>
                <span>⏱ {POSTS[0].readTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(activeCategory === 'All' && search === '' ? 1 : 0).map(post => (
            <div
              key={post.id}
              className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 cursor-pointer hover:border-cyan-400/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4">{post.emoji}</div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs px-2 py-1 rounded font-bold"
                  style={{ background: `${post.color}22`, color: post.color }}
                >
                  {post.category}
                </span>
              </div>
              <h3 className="font-black text-white text-sm mb-2 group-hover:text-cyan-400 transition-colors duration-200" style={{ fontFamily: 'monospace' }}>
                {post.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-slate-400">No posts found</p>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Blog