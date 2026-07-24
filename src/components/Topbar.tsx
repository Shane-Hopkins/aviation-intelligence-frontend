import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import data from '../data'
import { useAuth } from '../contexts/AuthContext'

const metaMap: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Aggregated aviation press & regulatory intelligence' },
  '/source-health': { title: 'Source health', sub: 'Scraper status, run history & throughput' },
  '/community-pulse': { title: 'Community pulse', sub: 'Forum sentiment across the aviation community' },
  '/press-sources': { title: 'Press crawlers', sub: 'Source health, run history & throughput' },
  '/account': { title: 'My account', sub: 'API access, preferences & billing' },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const meta = metaMap[pathname] ?? metaMap['/']
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div>
          <div className="page-title">{meta.title}</div>
          <div className="page-sub">{meta.sub}</div>
        </div>
        <span className="topbar-spacer" />
        <div className="timestamp">
          <span className="dot" />
          Last scrape&nbsp;<span style={{ color: 'var(--ink)' }}>{data.lastScrape}</span>
        </div>
        <span className="pill">
          <span className="pulse" /> Pipeline healthy
        </span>
        {user && (
          <div className="user-menu" style={{ position: 'relative' }}>
            <button
              className="user-avatar"
              onClick={() => setMenuOpen(o => !o)}
              title={user.email}
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="user-dropdown" onMouseLeave={() => setMenuOpen(false)}>
                <div className="user-dropdown-info">
                  <div className="user-dropdown-avatar">{initials}</div>
                  <span className="user-dropdown-name">{user.name ?? user.email}</span>
                  {user.name && <span className="user-dropdown-email">{user.email}</span>}
                  <div className="user-dropdown-tier">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.4L6 8.5l-3.1 1.6.6-3.4L1 4.3l3.6-.5z"/>
                    </svg>
                    {user.tier ?? 'free'}
                  </div>
                </div>
                <div className="user-dropdown-links">
                  <button className="user-dropdown-link" onClick={() => { navigate('/account'); setMenuOpen(false) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    My account
                  </button>
                </div>
                <button className="user-dropdown-signout" onClick={() => { logout(); setMenuOpen(false) }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
