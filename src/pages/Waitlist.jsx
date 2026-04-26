import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PERKS = [
  { icon: '🎮', title: 'Early Access', desc: 'Be the first to upload clips when FragBeats Pro launches' },
  { icon: '🎵', title: 'Free Pro Month', desc: 'Get 1 month of FragBeats Pro absolutely free' },
  { icon: '👑', title: 'Founder Badge', desc: 'Exclusive founder badge on your profile forever' },
  { icon: '🔥', title: 'Priority Support', desc: 'Direct access to the FragBeats team' },
]

const WAITLIST_COUNT = 1247

function Waitlist() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [position, setPosition] = useState(null)

  const handleSubmit = () => {
    if (!email || !name) return
    const pos = WAITLIST_COUNT + Math.floor(Math.random() * 10) + 1
    setPosition(pos)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 rounded-full px-4 py-2 text-cyan-400 text-xs tracking-widest uppercase mb-6 bg-cyan-500/5">
            🚀 Coming Soon
          </div>
          <h1 className="font-black text-5xl md:text-7xl text-white mb-6 leading-none" style={{ fontFamily: 'monospace' }}>
            Join the
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
              Waitlist 🔥
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            FragBeats Pro is launching soon. Join the waitlist to get early access, a free month and an exclusive founder badge.
          </p>
        </div>

        {/* Waitlist counter */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-[#0b1425] border border-cyan-500/20 rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {['🎮', '🔫', '🔥', '💀', '⚡'].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm border-2 border-[#0b1425]">
                  {emoji}
                </div>
              ))}
            </div>
            <span className="text-white text-sm font-bold">
              <span className="text-cyan-400">{WAITLIST_COUNT.toLocaleString()}+</span> gamers already waiting
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

          {/* Form */}
          <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-black text-2xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
                  YOU'RE IN!
                </h3>
                <p className="text-slate-400 mb-4">You're #{position} on the waitlist</p>
                <div className="bg-[#040810] border border-cyan-500/20 rounded-lg p-4 mb-4">
                  <div className="text-cyan-400 text-xs tracking-widest uppercase mb-1">Your Position</div>
                  <div className="font-black text-4xl text-white" style={{ fontFamily: 'monospace' }}>
                    #{position}
                  </div>
                </div>
                <p className="text-slate-500 text-sm">Share FragBeats to move up the waitlist! 🚀</p>
                <div className="flex gap-3 mt-4 justify-center">
                  <button
                    onClick={() => window.open(`https://wa.me/?text=I just joined the FragBeats waitlist! 🎮🔥 Join here: https://fragbeats.vercel.app/waitlist`, '_blank')}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-bold hover:border-green-400 transition-all duration-200"
                  >
                    Share on WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=I just joined the FragBeats waitlist! 🎮🔥 Join here: https://fragbeats.vercel.app/waitlist`, '_blank')}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold hover:border-blue-400 transition-all duration-200"
                  >
                    Share on Twitter
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-black text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
                  RESERVE YOUR SPOT
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Your Name</label>
                    <input
                      type="text"
                      placeholder="Aman Pathan"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all duration-200"
                    style={{ fontFamily: 'monospace' }}
                  >
                    JOIN WAITLIST 🚀
                  </button>
                  <p className="text-slate-600 text-xs text-center">
                    No spam. Ever. We'll only email you about FragBeats.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Perks */}
          <div className="flex flex-col gap-4">
            <h3 className="font-black text-white tracking-widest" style={{ fontFamily: 'monospace' }}>
              WHAT YOU GET 🎁
            </h3>
            {PERKS.map(perk => (
              <div key={perk.title} className="flex gap-4 p-4 bg-[#0b1425] border border-cyan-500/10 rounded-xl hover:border-cyan-400/30 transition-all duration-300">
                <div className="text-3xl flex-shrink-0">{perk.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm mb-1">{perk.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{perk.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Waitlist