import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')
    if (token) {
      login(token)
      navigate('/', { replace: true })
    } else {
      navigate(`/login?error=${error ?? 'unknown'}`, { replace: true })
    }
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-sans)' }}>Signing you in…</p>
    </div>
  )
}
