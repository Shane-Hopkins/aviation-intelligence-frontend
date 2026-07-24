import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import data from '../data'
import { api } from '../lib/api'

export default function Rail() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [healthyCount, setHealthyCount] = useState(data.scrapers.filter(s => s.status === 'healthy').length)
  const [totalCount, setTotalCount] = useState(data.scrapers.length)

  useEffect(() => {
    api.scraper.status().then(({ scrapers }) => {
      setHealthyCount(scrapers.filter(s => s.status === 'healthy').length)
      setTotalCount(scrapers.length)
    }).catch(() => {/* keep mock counts */})
  }, [])

  return (
    <nav className="rail">
      <div className="brand">
        <div className="brand-sub">Press · Regulatory Intelligence</div>
        <div className="brand-name">Aviation Intelligence</div>
        <svg className="brand-runway" width="162" height="14" viewBox="0 -4 162 14" fill="none" aria-hidden="true">
          <path d="M0 8 L122 8 C 140 8, 152 4, 159 1" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="159" cy="1" r="2.8" fill="#2563EB"/>
        </svg>
      </div>

      <div className="nav">
        <div className="nav-label">Press</div>
        <button
          className={'nav-item' + (pathname === '/' ? ' active' : '')}
          onClick={() => navigate('/')}
        >
          <Icon name="dashboard" size={16} />
          Press archive
        </button>
        <button
          className={'nav-item' + (pathname === '/press-sources' ? ' active' : '')}
          onClick={() => navigate('/press-sources')}
        >
          <Icon name="health" size={16} />
          Press crawlers
        </button>

        <div className="nav-label" style={{ marginTop: 10 }}>Forums</div>
        <button
          className={'nav-item' + (pathname === '/community-pulse' ? ' active' : '')}
          onClick={() => navigate('/community-pulse')}
        >
          <Icon name="pulse" size={16} />
          Community pulse
        </button>
        <button
          className={'nav-item' + (pathname === '/source-health' ? ' active' : '')}
          onClick={() => navigate('/source-health')}
        >
          <Icon name="health" size={16} />
          Forum crawlers
          <span className="nav-count">{healthyCount}/{totalCount}</span>
        </button>
      </div>

      <div className="nav" style={{ marginTop: 'auto' }}>
        <div className="nav-label">Account</div>
        <button
          className={'nav-item' + (pathname === '/account' ? ' active' : '')}
          onClick={() => navigate('/account')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          My account
        </button>
      </div>

      <div className="rail-foot">
        <div className="rail-user">
          <span className="avatar">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M5 22 L14 22 C 20 22, 22 17, 26 8" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"/>
              <circle cx="26" cy="8" r="3.4" fill="#fff"/>
              <circle cx="5" cy="22" r="2" fill="#fff" fillOpacity="0.5"/>
            </svg>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Aviation Intelligence</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Press &amp; regulatory feed</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
