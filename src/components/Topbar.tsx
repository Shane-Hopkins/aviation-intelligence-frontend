import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import data from '../data'
import { useAuth } from '../contexts/AuthContext'

const metaMap: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Aggregated aviation press & regulatory intelligence' },
  '/source-health': { title: 'Source health', sub: 'Scraper status, run history & throughput' },
  '/community-pulse': { title: 'Community pulse', sub: 'Forum sentiment across the aviation community' },
}

export default function Topbar() {
  const { pathname } = useLocation()
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
                  <span className="user-dropdown-name">{user.name ?? user.email}</span>
                  {user.name && <span className="user-dropdown-email">{user.email}</span>}
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
