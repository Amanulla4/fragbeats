import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center">
        <div className="text-center">
          <div className="font-black text-2xl tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'monospace' }}>
            FRAGBEATS
          </div>
          <div className="w-48 h-1 bg-cyan-500/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default ProtectedRoute