import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const REASONS = [
  '🔞 Inappropriate content',
  '🤬 Hate speech or harassment',
  '🎭 Fake or misleading',
  '⚠️ Violence or gore',
  '🔊 Spam or repeated content',
  '📛 Other',
]

function ReportModal({ clip, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alreadyReported, setAlreadyReported] = useState(false)

  async function handleSubmit() {
    if (!user) { navigate('/auth'); return }
    if (!selected) return
    setLoading(true)

    const { error } = await supabase.from('reports').insert({
      user_id: user.id,
      clip_id: clip.id,
      reason: selected,
    })

    if (error?.code === '23505') {
      setAlreadyReported(true)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-cyan-500/20 p-6"
        style={{ background: '#0b1425' }}
        onClick={e => e.stopPropagation()}>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-white font-black tracking-widest text-sm mb-1" style={{ fontFamily: 'monospace' }}>
              REPORT SUBMITTED
            </p>
            <p className="text-slate-500 text-xs mb-5">Thanks for keeping FragBeats safe 🙏</p>
            <button onClick={onClose}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-2 rounded-lg font-black text-xs tracking-widest"
              style={{ fontFamily: 'monospace' }}>
              CLOSE
            </button>
          </div>
        ) : alreadyReported ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🚩</div>
            <p className="text-white font-black tracking-widest text-sm mb-1" style={{ fontFamily: 'monospace' }}>
              ALREADY REPORTED
            </p>
            <p className="text-slate-500 text-xs mb-5">You've already reported this clip.</p>
            <button onClick={onClose}
              className="border border-cyan-500/20 text-slate-400 px-6 py-2 rounded-lg text-xs tracking-widest"
              style={{ fontFamily: 'monospace' }}>
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-white tracking-widest text-sm" style={{ fontFamily: 'monospace' }}>
                  🚩 REPORT CLIP
                </h2>
                <p className="text-slate-500 text-xs mt-1 truncate max-w-[200px]">"{clip.title}"</p>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* Reasons */}
            <p className="text-slate-400 text-xs tracking-widest mb-3" style={{ fontFamily: 'monospace' }}>
              SELECT A REASON
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    selected === reason
                      ? 'border-red-400/60 text-red-400 bg-red-400/10'
                      : 'border-cyan-500/10 text-slate-400 hover:border-cyan-500/30 hover:text-white'
                  }`}>
                  {reason}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selected || loading}
              className="w-full py-3 rounded-lg font-black text-xs tracking-widest transition-all duration-200 disabled:opacity-40"
              style={{
                fontFamily: 'monospace',
                background: selected ? 'linear-gradient(to right, #ff2d55, #bf00ff)' : undefined,
                color: selected ? 'white' : undefined,
                border: selected ? 'none' : '1px solid rgba(100,116,139,0.3)',
              }}>
              {loading ? 'SUBMITTING...' : '🚩 SUBMIT REPORT'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ReportModal