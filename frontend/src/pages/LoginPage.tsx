import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #111827, #1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', padding: '36px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#c17d3a', marginBottom: '4px' }}>StayBook</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: isLoading ? '#e8a03a' : '#c17d3a',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#a8622a' }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#c17d3a' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '20px' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#c17d3a', fontWeight: 500 }}>Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
