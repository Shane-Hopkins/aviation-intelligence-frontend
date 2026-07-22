import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const oauthError = params.get('error')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = mode === 'signup' ? { email, password, name } : { email, password }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { token?: string; error?: string }
      if (!res.ok || !data.token) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      login(data.token)
      navigate('/', { replace: true })
    } catch {
      setError('Could not reach server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-sub">PRESS · REGULATORY INTELLIGENCE</span>
          <span className="login-brand-name">Aviation Intelligence</span>
        </div>

        <h1 className="login-heading">
          {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
        </h1>

        {oauthError && (
          <div className="login-error">
            {oauthError === 'no_email'
              ? 'Your GitHub account has no public email. Please add one and try again.'
              : 'Social login failed. Please try again.'}
          </div>
        )}

        {/* Social buttons */}
        <div className="login-social">
          <a href={`${API}/api/auth/google`} className="social-btn google-btn">
            <GoogleIcon />
            Continue with Google
          </a>
          <a href={`${API}/api/auth/github`} className="social-btn github-btn">
            <GitHubIcon />
            Continue with GitHub
          </a>
        </div>

        <div className="login-divider"><span>or</span></div>

        {/* Email / password form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 8 : 1}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="login-toggle">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}
