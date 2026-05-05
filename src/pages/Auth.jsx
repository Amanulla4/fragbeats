import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSuccess('Login successful! 🎮')
        setTimeout(() => navigate('/explore'), 1000)
      } else {
        if (!username.trim()) throw new Error('Username is required')

        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Save username + user_id to profiles table
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              username: username.trim().toLowerCase().replace(/\s+/g, '_'),
              email: email,
            })
          if (profileError) console.error('Profile save error:', profileError)
        }

        setSuccess('Account created! Welcome to FragBeats 🔥')
        setTimeout(() => navigate('/explore'), 1000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#040810] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-[#0b1425] border border-cyan-500/20 rounded-xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-black text-2xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'monospace' }}>
            FRAGBEATS
          </div>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Welcome back, gamer 🎮' : 'Join the community 🔥'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#040810] rounded-lg p-1 mb-8">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-md text-sm font-bold tracking-widest transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black' : 'text-slate-400 hover:text-white'}`}
            style={{ fontFamily: 'monospace' }}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
            className={`flex-1 py-2 rounded-md text-sm font-bold tracking-widest transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black' : 'text-slate-400 hover:text-white'}`}
            style={{ fontFamily: 'monospace' }}
          >
            SIGN UP
          </button>
        </div>

        {/* Error/Success */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm mb-4">
            ✅ {success}
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">

          {!isLogin && (
            <div>
              <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Username</label>
              <input
                type="text"
                placeholder="your_gamer_tag"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
              />
              <p className="text-slate-600 text-xs mt-1">Spaces will be replaced with underscores</p>
            </div>
          )}

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

          <div>
            <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 placeholder-slate-600"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 hover:-translate-y-1 transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'monospace' }}
          >
            {loading ? 'LOADING...' : isLogin ? 'LOGIN →' : 'CREATE ACCOUNT →'}
          </button>

        </div>

        {/* Bottom text */}
        <p className="text-center text-slate-500 text-xs mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
            className="text-cyan-400 cursor-pointer hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>

      </div>
    </div>
  )
}

export default Auth