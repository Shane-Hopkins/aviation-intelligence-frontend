import { useAuth } from '../contexts/AuthContext'

export default function Account() {
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860 }}>

        {/* Profile card */}
        <div className="account-card">
          <div className="account-card-head">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Profile
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px' }}>
            <div className="account-avatar">{initials}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{user?.name ?? '—'}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{user?.email}</div>
              <div className="account-tier-pill">
                <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.4L6 8.5l-3.1 1.6.6-3.4L1 4.3l3.6-.5z"/>
                </svg>
                {user?.tier ?? 'free'} plan
              </div>
            </div>
          </div>
        </div>

        {/* API key card */}
        <div className="account-card">
          <div className="account-card-head">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            API access
          </div>
          <div style={{ padding: '20px 22px' }}>
            <div className="account-coming-soon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-3)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>API keys coming soon</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 }}>
                Generate keys to consume the press archive and<br/>community feed via REST API.
              </div>
            </div>
          </div>
        </div>

        {/* Data access card — full width */}
        <div className="account-card" style={{ gridColumn: '1 / -1' }}>
          <div className="account-card-head">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Data access
          </div>
          <div style={{ padding: '20px 22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Press archive', sub: 'FAA, EASA, Boeing, Airbus & more', on: true },
                { label: 'Community pulse', sub: 'Forum sentiment & trending topics', on: true },
                { label: 'AI summaries', sub: 'Claude-powered release summaries', on: false },
              ].map(({ label, sub, on }) => (
                <div key={label} className="account-access-row">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
                  </div>
                  <div className={`account-access-badge ${on ? 'on' : 'off'}`}>{on ? 'Active' : 'Unavailable'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
