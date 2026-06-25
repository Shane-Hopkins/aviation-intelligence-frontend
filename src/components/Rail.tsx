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
        <div className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M5 22 L14 22 C 20 22, 22 17, 26 8" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"/>
            <circle cx="26" cy="8" r="3.4" fill="#fff"/>
            <circle cx="5" cy="22" r="2" fill="#fff" fillOpacity="0.5"/>
          </svg>
        </div>
        <div>
          <div className="brand-name">Aviation Intelligence</div>
          <div className="brand-sub">Press &amp; regulatory feed</div>
        </div>
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
