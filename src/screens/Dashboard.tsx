import { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard'
import SourceBadge from '../components/SourceBadge'
import CategoryTag from '../components/CategoryTag'
import Icon from '../components/Icon'
import AskPanel from '../components/AskPanel'
import data from '../data'
import { api } from '../lib/api'
import type { Release, Metric, Answer } from '../types'
import type { ApiRelease } from '../lib/api'

// ---------------------------------------------------------------------------
// Live / Demo badges (same pattern as CommunityPulse / SourceHealth)
// ---------------------------------------------------------------------------
function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace',
      color: 'oklch(0.44 0.11 152)', background: 'var(--green-tint)',
      border: '1px solid oklch(0.84 0.06 152)', borderRadius: 100,
      padding: '2px 8px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
      live
    </span>
  )
}

function DemoBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace',
      color: 'var(--ink-3)', background: 'var(--surface-2)',
      border: '1px solid var(--border)', borderRadius: 100,
      padding: '2px 8px',
    }}>
      demo data
    </span>
  )
}

// ---------------------------------------------------------------------------
// FeedItem — single press release row in the feed card
// ---------------------------------------------------------------------------
function FeedItem({ r, open, onToggle }: { r: Release | ApiRelease; open: boolean; onToggle: () => void }) {
  return (
    <button className={'feed-item' + (open ? ' open' : '')} onClick={onToggle}>
      <div className="feed-row1">
        <SourceBadge source={r.source} />
        <CategoryTag category={r.category} />
        <span className="feed-time">{r.time}</span>
      </div>
      <div className="feed-head">{r.headline}</div>
      <div className="feed-summary">
        <span className="ai-glyph"><Icon name="ai" size={14} /></span>
        <span>{r.summary}</span>
      </div>
      {open && (
        <div className="feed-expand fade-in">
          <dl className="kv"><dt>Document no.</dt><dd>{r.doc}</dd></dl>
          <dl className="kv"><dt>Jurisdiction</dt><dd>{r.jurisdiction}</dd></dl>
          <dl className="kv"><dt>Published</dt><dd>{r.date}</dd></dl>
          <dl className="kv"><dt>Effective</dt><dd>{r.effective}</dd></dl>
          {'url' in r && r.url && (
            <dl className="kv"><dt>Source</dt><dd><a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{r.url}</a></dd></dl>
          )}
        </div>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const [metrics,  setMetrics]  = useState<Metric[] | null>(null)
  const [releases, setReleases] = useState<ApiRelease[] | null>(null)
  const [openId,   setOpenId]   = useState<number | null>(null)
  const [isLive,   setIsLive]   = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.dashboard.metrics(),
      api.dashboard.releases(20),
    ]).then(([m, r]) => {
      setMetrics(m.metrics)
      setReleases(r.releases)
      setIsLive(true)
      setApiError(null)
      if (r.releases.length > 0) setOpenId(r.releases[0].id)
    }).catch(err => {
      setApiError(err instanceof Error ? err.message : String(err))
      setIsLive(false)
      setOpenId(1)  // open first mock item
    })
  }, [])

  async function handleAsk(query: string): Promise<Answer> {
    const { answer } = await api.dashboard.ask(query)
    return answer
  }

  const displayMetrics  = metrics  ?? data.metrics
  const displayReleases = releases ?? data.releases

  return (
    <div className="wrap">
      {apiError && (
        <div style={{
          marginTop: 20, padding: '10px 14px', borderRadius: 9,
          background: 'var(--amber-tint)', border: '1px solid oklch(0.82 0.08 80)',
          fontSize: 12, color: 'oklch(0.47 0.11 75)',
        }}>
          <strong>Backend offline</strong> — showing demo data.
          Start the backend on port 3001 to see live press releases.
        </div>
      )}

      <div className="metrics">
        {displayMetrics.map((m, i) => <MetricCard key={i} m={m} />)}
      </div>

      <div className="section-head">
        <h2>Latest press releases</h2>
        <span className="meta">
          {isLive
            ? `${displayReleases.length} loaded`
            : `${displayReleases.length} new in the last 8 hours`}
        </span>
        <span className="spacer" />
        {isLive ? <LiveBadge /> : <DemoBadge />}
        {isLive && (
          <span className="meta mono" style={{ marginLeft: 10 }}>auto-refresh · on</span>
        )}
      </div>

      <div className="layout-2col">
        <div className="feed">
          <div className="feed-card">
            {displayReleases.map(r => (
              <FeedItem
                key={r.id}
                r={r}
                open={openId === r.id}
                onToggle={() => setOpenId(openId === r.id ? null : r.id)}
              />
            ))}
          </div>
        </div>
        <AskPanel
          cfg={data.askConfigs.press}
          onAsk={isLive ? handleAsk : undefined}
        />
      </div>
    </div>
  )
}
