// src/pages/Onboarding.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const GAMES = ['BGMI', 'Valorant', 'Free Fire', 'COD Mobile', 'GTA V', 'Other']

const gameEmojis = {
  BGMI: '🎮', Valorant: '🔫', 'Free Fire': '🔥',
  'COD Mobile': '💀', 'GTA V': '🚗', Other: '🎯',
}

const gameColors = {
  BGMI: '#00f5ff', Valorant: '#bf00ff', 'Free Fire': '#ff6b35',
  'COD Mobile': '#ff2d55', 'GTA V': '#ffd700', Other: '#00f5ff',
}

function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [favoriteGames, setFavoriteGames] = useState([])
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [usernameOk, setUsernameOk] = useState(false)

  function isValidUsername(value) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value)
  }

  async function checkUsername(value) {
    setUsernameOk(false)
    setUsernameError('')

    if (!value) return

    if (!isValidUsername(value)) {
      setUsernameError('3–20 chars, letters, numbers and _ only')
      return
    }

    setChecking(true)

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', value)
      .maybeSingle()

    setChecking(false)

    if (data) {
      setUsernameError('Username already taken')
    } else {
      setUsernameOk(true)
    }
  }

  function handleUsernameChange(e) {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(value)
    setUsernameOk(false)
    setUsernameError('')
  }

  function handleUsernameBlur() {
    checkUsername(username)
  }

  function toggleGame(game) {
    setFavoriteGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    )
  }

  async function handleFinish() {
    if (!usernameOk || saving) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        username,
        bio: favoriteGames.length > 0
          ? `I play ${favoriteGames.join(', ')}`
          : '',
        avatar_url: null,
        verified: false,
      }, { onConflict: 'user_id' })

    if (error) {
      setSaving(false)
      setUsernameError('Could not save. Please try again.')
      return
    }

    await refreshProfile()
    navigate('/feed', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{ background: '#040810' }}
    >
      <SEO title="Welcome to FragBeats" url="/onboarding" />

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,245,255,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🎮</div>
          <h1
            className="font-black text-2xl text-white tracking-widest"
            style={{ fontFamily: 'monospace' }}
          >
            FRAGBEATS
          </h1>
          <p className="text-slate-500 text-xs tracking-widest mt-1">
            LET'S SET UP YOUR PROFILE
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                    : 'bg-[#0b1425] border border-cyan-500/20 text-slate-500'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 2 && (
                <div
                  className={`h-px w-16 transition-all duration-300 ${
                    step > s ? 'bg-cyan-400' : 'bg-cyan-500/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Username ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-6">
            <h2
              className="font-black text-lg text-white tracking-widest mb-1"
              style={{ fontFamily: 'monospace' }}
            >
              PICK YOUR USERNAME
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              This is how the community will know you.
            </p>

            <div className="relative mb-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                @
              </span>
              <input
                type="text"
                placeholder="fragking99"
                value={username}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                maxLength={20}
                autoComplete="off"
                autoCapitalize="none"
                className={`w-full bg-[#040810] rounded-lg pl-8 pr-10 py-3 text-white text-sm outline-none transition-colors duration-200 placeholder-slate-600 border ${
                  usernameError
                    ? 'border-red-500/60 focus:border-red-500'
                    : usernameOk
                    ? 'border-green-400/60 focus:border-green-400'
                    : 'border-cyan-500/20 focus:border-cyan-400'
                }`}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {checking && (
                  <span className="text-slate-500 animate-pulse">⏳</span>
                )}
                {!checking && usernameOk && (
                  <span className="text-green-400">✓</span>
                )}
                {!checking && usernameError && (
                  <span className="text-red-400">✕</span>
                )}
              </div>
            </div>

            {usernameError && (
              <p className="text-red-400 text-xs mb-4">{usernameError}</p>
            )}
            {usernameOk && (
              <p className="text-green-400 text-xs mb-4">@{username} is available ✓</p>
            )}
            {!usernameError && !usernameOk && (
              <p className="text-slate-600 text-xs mb-4">
                3–20 chars · letters, numbers, underscores
              </p>
            )}

            <button
              onClick={() => usernameOk && setStep(2)}
              disabled={!usernameOk}
              className={`w-full py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${
                usernameOk
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                  : 'bg-[#040810] text-slate-600 cursor-not-allowed border border-cyan-500/10'
              }`}
              style={{ fontFamily: 'monospace' }}
            >
              NEXT →
            </button>
          </div>
        )}

        {/* ── Step 2: Favorite games ────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-[#0b1425] border border-cyan-500/20 rounded-xl p-6">
            <h2
              className="font-black text-lg text-white tracking-widest mb-1"
              style={{ fontFamily: 'monospace' }}
            >
              WHAT DO YOU PLAY?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Pick your games — you can change this later.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {GAMES.map((game) => {
                const selected = favoriteGames.includes(game)
                return (
                  <button
                    key={game}
                    onClick={() => toggleGame(game)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-bold tracking-widest transition-all duration-200 ${
                      selected
                        ? 'border-transparent text-black'
                        : 'bg-[#040810] border-cyan-500/20 text-slate-400 hover:border-cyan-400/50'
                    }`}
                    style={
                      selected
                        ? { background: `linear-gradient(135deg, ${gameColors[game]}cc, ${gameColors[game]}88)` }
                        : {}
                    }
                  >
                    <span className="text-lg">{gameEmojis[game]}</span>
                    <span style={{ fontFamily: 'monospace' }}>{game}</span>
                  </button>
                )
              })}
            </div>

            {favoriteGames.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {favoriteGames.map((game) => (
                  <span
                    key={game}
                    className="px-2 py-1 rounded text-xs font-bold tracking-widest"
                    style={{
                      background: `${gameColors[game]}22`,
                      color: gameColors[game],
                      fontFamily: 'monospace',
                    }}
                  >
                    {gameEmojis[game]} {game}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={saving}
                className="flex-1 py-3 rounded-lg font-black text-sm tracking-widest border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 disabled:opacity-50"
                style={{ fontFamily: 'monospace' }}
              >
                ← BACK
              </button>

              <button
                onClick={handleFinish}
                disabled={saving}
                className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all duration-300 ${
                  saving
                    ? 'bg-[#040810] text-slate-600 cursor-not-allowed border border-cyan-500/10'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                {saving ? 'SAVING...' : favoriteGames.length > 0 ? "LET'S GO 🔥" : 'SKIP & ENTER →'}
              </button>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-slate-700 text-xs mt-6">
          You can edit everything later in your profile settings.
        </p>
      </div>
    </div>
  )
}

export default Onboarding