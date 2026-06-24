import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import MetricCard from '../components/MetricCard'
import SourceBadge from '../components/SourceBadge'
import CategoryTag from '../components/CategoryTag'
import Icon from '../components/Icon'
import data from '../data'
import { api } from '../lib/api'
import type { Metric } from '../types'
import type { ApiRelease } from '../lib/api'

// ---------------------------------------------------------------------------
// Live / Demo badges
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
// PressCard — compact list item in the left column
// ---------------------------------------------------------------------------
function PressCard({ r, active, onClick }: { r: ApiRelease; active: boolean; onClick: () => void }) {
  return (
    <button className={'press-card' + (active ? ' active' : '')} onClick={onClick}>
      {r.imageUrl
        ? <img className="press-card-thumb" src={r.imageUrl} alt="" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        : (
          <div className="press-card-thumb-placeholder">
            <Icon name="ai" size={18} />
          </div>
        )
      }
      <div className="press-card-body">
        <div className="press-card-meta">
          <SourceBadge source={r.source} />
          <CategoryTag category={r.category} />
          <span className="press-card-time">{r.time}</span>
        </div>
        <div className="press-card-headline">{r.headline}</div>
        {r.fullContent && (() => {
          const snippet = r.fullContent.replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim()
          return snippet ? <div className="press-card-snippet">{snippet.slice(0, 140)}</div> : null
        })()}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// PressDetail — full article reader in the right column
// ---------------------------------------------------------------------------
function PressDetail({ r }: { r: ApiRelease | null }) {
  if (!r) {
    return (
      <div className="press-detail-empty">
        <Icon name="ai" size={32} />
        <span>Select a press release to read</span>
      </div>
    )
  }

  const paragraphs = (r.fullContent ?? '').split('\n\n').filter(Boolean)

  return (
    <div className="press-detail fade-in" key={r.id}>
      {r.imageUrl && (
        <img
          className="press-hero"
          src={r.imageUrl}
          alt=""
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      <div className="press-detail-body">
        <h2 className="press-detail-headline">
          {r.url
            ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{r.headline}</a>
            : r.headline}
        </h2>

        <div className="press-detail-tags">
          <SourceBadge source={r.source} />
          <CategoryTag category={r.category} />
        </div>

        <div className="press-detail-kv">
          <div className="kv">
            <dt>Published</dt>
            <dd>{r.date}</dd>
          </div>
          <div className="kv">
            <dt>Document</dt>
            <dd>{r.doc}</dd>
          </div>
          {r.jurisdiction && r.jurisdiction !== '—' && (
            <div className="kv">
              <dt>Jurisdiction</dt>
              <dd>{r.jurisdiction}</dd>
            </div>
          )}
          {r.effective && r.effective !== '—' && (
            <div className="kv">
              <dt>Effective</dt>
              <dd>{r.effective}</dd>
            </div>
          )}
        </div>

        {paragraphs.length > 0 && (
          <div className="press-content-section">
            <div className="press-content-label">Full content</div>
            <div className="press-content-body">
              {paragraphs.map((p, i) => {
                const img = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
                if (img) return <img key={i} className="press-inline-img" src={img[2]} alt={img[1]} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                const heading = p.match(/^##\s+(.+)$/)
                if (heading) return <h3 key={i} className="press-content-heading">{heading[1]}</h3>
                return <p key={i}>{p}</p>
              })}
            </div>
          </div>
        )}

        {r.url && (
          <a className="press-source-link" href={r.url} target="_blank" rel="noopener noreferrer">
            <Icon name="arrow" size={13} />
            View original source
          </a>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sourceFilter = searchParams.get('source') ?? undefined

  const [metrics,   setMetrics]   = useState<Metric[] | null>(null)
  const [releases,  setReleases]  = useState<ApiRelease[] | null>(null)
  const [selected,  setSelected]  = useState<ApiRelease | null>(null)
  const [isLive,    setIsLive]    = useState(false)
  const [apiError,  setApiError]  = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.dashboard.metrics(),
      api.dashboard.releases(50, sourceFilter),
    ]).then(([m, r]) => {
      setMetrics(m.metrics)
      setReleases(r.releases)
      setIsLive(true)
      setApiError(null)
      setSelected(r.releases.length > 0 ? r.releases[0] : null)
    }).catch(err => {
      setApiError(err instanceof Error ? err.message : String(err))
      setIsLive(false)
    })
  }, [sourceFilter])

  // When a card is selected, fetch the full detail (which includes fullContent)
  async function handleSelect(r: ApiRelease) {
    setSelected(r)
    if (isLive) {
      try {
        const { release } = await api.dashboard.release(r.id)
        setSelected(release)
      } catch {
        // keep the list version if detail fetch fails
      }
    }
  }

  const displayMetrics  = metrics  ?? data.metrics
  const displayReleases = releases ?? (data.releases as ApiRelease[])
  const selectedId      = selected?.id ?? null

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
        <h2>Press release archive</h2>
        <span className="meta">{displayReleases.length} releases</span>
        {sourceFilter && (
          <>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace',
              color: 'oklch(0.35 0.14 250)', background: 'oklch(0.96 0.03 250)',
              border: '1px solid oklch(0.84 0.06 250)', borderRadius: 100,
              padding: '2px 10px', marginLeft: 8,
            }}>
              {sourceFilter}
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, lineHeight: 1, color: 'inherit', fontSize: 13, fontWeight: 700,
                }}
                title="Clear filter"
              >×</button>
            </span>
          </>
        )}
        <span className="spacer" />
        {isLive ? <LiveBadge /> : <DemoBadge />}
      </div>

      <div className="press-archive">
        <div className="press-list">
          {displayReleases.map(r => (
            <PressCard
              key={r.id}
              r={r}
              active={selectedId === r.id}
              onClick={() => handleSelect(r)}
            />
          ))}
          {displayReleases.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No press releases yet — trigger a scrape run.
            </div>
          )}
        </div>
        <PressDetail r={selected ?? (displayReleases[0] as ApiRelease | undefined) ?? null} />
      </div>
    </div>
  )
}
