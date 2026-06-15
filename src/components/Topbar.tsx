import { useLocation } from 'react-router-dom'
import data from '../data'

const metaMap: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Aggregated aviation press & regulatory intelligence' },
  '/source-health': { title: 'Source health', sub: 'Scraper status, run history & throughput' },
  '/community-pulse': { title: 'Community pulse', sub: 'Forum sentiment across the aviation community' },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const meta = metaMap[pathname] ?? metaMap['/']

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
      </div>
    </header>
  )
}
