import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TEAM = [
  { name: 'Aman Pathan', role: 'Founder & Developer', bio: 'Started as a gamer. Became a developer. Now building the platform I always wished existed. FragBeats is just the beginning 🔥', emoji: '🎮', social: 'fragkingAman' },
]

const VALUES = [
  { icon: '🎮', title: 'Gamers First', desc: 'Everything we build is for the gaming community. We are gamers ourselves and we build what we want to use.' },
  { icon: '🎵', title: 'Music + Gaming', desc: 'We believe lo-fi music and gaming are the perfect combo. FragBeats brings them together in one place.' },
  { icon: '🔥', title: 'Community', desc: 'FragBeats is not just a platform — it is a community of creators who support and inspire each other.' },
  { icon: '💪', title: 'Built Different', desc: 'We are not another generic platform. FragBeats is designed specifically for gamers by someone who lives the culture.' },
]

const STATS = [
  { value: '12K+', label: 'Creators' },
  { value: '89K+', label: 'Clips Shared' },
  { value: '4.2M', label: 'Vibes Heard' },
  { value: '50+', label: 'Countries' },
]

function About() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16 text-center">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">// ABOUT FRAGBEATS</p>
        <h1 className="font-black text-5xl md:text-7xl text-white mb-6 leading-none" style={{ fontFamily: 'monospace' }}>
          Built for the
          <span className="block bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Culture 🔥
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          FragBeats was born in Latur, Maharashtra — built by a gamer, for gamers. We believe every clutch moment deserves the perfect beat.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-[#0b1425] border-t border-b border-cyan-500/10 py-12 px-8 mb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-black text-3xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-1" style={{ fontFamily: 'monospace' }}>
                {stat.value}
              </div>
              <div className="text-slate-500 text-xs tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-8 mb-16">
        <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">// OUR MISSION</p>
            <h2 className="font-black text-3xl text-white mb-4" style={{ fontFamily: 'monospace' }}>
              Why FragBeats?
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Every day millions of gamers create incredible moments — clutch plays, insane frags, funny fails. But there was no dedicated place to share these moments with the perfect soundtrack.
            </p>
            <p className="text-slate-400 leading-relaxed">
              FragBeats fixes that. We built a platform where gaming clips and lo-fi music come together — creating a unique experience that feels like home for every gamer and creator.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-4xl mx-auto px-8 mb-16">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// OUR VALUES</p>
        <h2 className="font-black text-3xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VALUES.map(value => (
            <div key={value.title} className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 hover:border-cyan-400/30 transition-all duration-300">
              <div className="text-3xl mb-3">{value.icon}</div>
              <h3 className="font-black text-white text-sm tracking-widest mb-2" style={{ fontFamily: 'monospace' }}>
                {value.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="max-w-4xl mx-auto px-8 mb-16">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// THE TEAM</p>
        <h2 className="font-black text-3xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Who Built This
        </h2>
        {TEAM.map(member => (
          <div key={member.name} className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl flex-shrink-0">
              {member.emoji}
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-black text-xl text-white mb-1" style={{ fontFamily: 'monospace' }}>
                {member.name}
              </h3>
              <p className="text-cyan-400 text-sm mb-3 tracking-widest">{member.role}</p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="max-w-2xl mx-auto px-8 mb-16">
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// CONTACT</p>
        <h2 className="font-black text-3xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Get In Touch 📬
        </h2>

        {submitted ? (
          <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-black text-white text-xl mb-2" style={{ fontFamily: 'monospace' }}>MESSAGE SENT!</h3>
            <p className="text-slate-400">We'll get back to you within 24 hours 🔥</p>
          </div>
        ) : (
          <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Your Name</label>
              <input
                type="text"
                placeholder="Aman Pathan"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Message</label>
              <textarea
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600 resize-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all duration-200"
              style={{ fontFamily: 'monospace' }}
            >
              SEND MESSAGE →
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default About