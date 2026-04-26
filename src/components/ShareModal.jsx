import { useState } from 'react'

function ShareModal({ clip, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://fragbeats.vercel.app/clip/${clip.id}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=Check out this clip on FragBeats 🎮🔥 ${shareUrl}`, '_blank')
  }

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out this insane clip on FragBeats 🎮🔥&url=${shareUrl}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0b1425] border border-cyan-500/20 rounded-xl p-6 z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-white tracking-widest" style={{ fontFamily: 'monospace' }}>
            SHARE CLIP
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Share options */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-4 p-4 bg-[#040810] border border-green-500/20 rounded-lg hover:border-green-400/50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
              💬
            </div>
            <div className="text-left">
              <div className="text-white text-sm font-bold">WhatsApp</div>
              <div className="text-slate-500 text-xs">Share with your squad</div>
            </div>
          </button>

          <button
            onClick={shareTwitter}
            className="flex items-center gap-4 p-4 bg-[#040810] border border-blue-500/20 rounded-lg hover:border-blue-400/50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
              🐦
            </div>
            <div className="text-left">
              <div className="text-white text-sm font-bold">Twitter / X</div>
              <div className="text-slate-500 text-xs">Tweet your frag</div>
            </div>
          </button>
        </div>

        {/* Copy Link */}
        <div className="flex gap-2">
          <div className="flex-1 bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-slate-400 text-xs truncate">
            {shareUrl}
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-3 rounded-lg font-black text-xs tracking-widest transition-all duration-200 ${copied
              ? 'bg-green-500 text-black'
              : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'}`}
            style={{ fontFamily: 'monospace' }}
          >
            {copied ? '✅ COPIED!' : 'COPY'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ShareModal