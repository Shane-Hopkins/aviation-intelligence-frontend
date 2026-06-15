import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import data from '../data'

export default function Rail() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const healthyCount = data.scrapers.filter(s => s.status === 'healthy').length

  return (
    <nav className="rail">
      <div className="brand">
        <div className="brand-mark">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 13.5L13.5 13.5 11 21 9 21 10 13.5 5 13.5 3.5 16 2 16 3 12 2 8 3.5 8 5 10.5 10 10.5 9 3 11 3 13.5 10.5 21 10.5z" />
          </svg>
        </div>
        <div>
          <div className="brand-name">Aviation Intelligence</div>
          <div className="brand-sub">Press &amp; regulatory feed</div>
        </div>
      </div>

      <div className="nav">
        <div className="nav-label">Workspace</div>
        <button
          className={'nav-item' + (pathname === '/' ? ' active' : '')}
          onClick={() => navigate('/')}
        >
          <Icon name="dashboard" size={16} />
          Dashboard
        </button>
        <button
          className={'nav-item' + (pathname === '/source-health' ? ' active' : '')}
          onClick={() => navigate('/source-health')}
        >
          <Icon name="health" size={16} />
          Source health
          <span className="nav-count">{healthyCount}/{data.scrapers.length}</span>
        </button>
        <button
          className={'nav-item' + (pathname === '/community-pulse' ? ' active' : '')}
          onClick={() => navigate('/community-pulse')}
        >
          <Icon name="pulse" size={16} />
          Community pulse
          <span className="nav-count">+18</span>
        </button>
      </div>

      <div className="rail-foot">
        <div className="rail-user">
          <span className="avatar">RK</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Reema Kaur</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Analyst · Ops</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
