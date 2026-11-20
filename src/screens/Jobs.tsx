import { useState, useEffect, useCallback } from 'react'
import MetricCard from '../components/MetricCard'
import Icon from '../components/Icon'
import { api } from '../lib/api'
import type { ApiJob, ApiJobDetail } from '../lib/api'
import type { Metric } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const CATEGORY_FILTERS = ['Pilot', 'Technical', 'Maintenance', 'Administration', 'Manager']
const LOCATION_FILTERS = ['USA', 'Europe', 'Canada', 'Oceania', 'Worldwide', 'UK']

const CATEGORY_COLORS: Record<string, string> = {
  Pilot:          'var(--accent)',
  Technical:      'oklch(0.52 0.14 240)',
  Maintenance:    'oklch(0.52 0.14 160)',
  Administration: 'oklch(0.52 0.12 290)',
  Manager:        'oklch(0.52 0.14 30)',
  Operations:     'var(--accent)',
}

function catColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'var(--ink-3)'
}

// ---------------------------------------------------------------------------
// JobCard
// ---------------------------------------------------------------------------
function JobCard({ job, active, onClick }: { job: ApiJob; active: boolean; onClick: () => void }) {
  const primaryCat = job.categories.find(c => c !== 'Rotorwing') ?? job.categories[0] ?? ''
  const location   = job.locationTags[0] ?? ''

  return (
    <button
      className={'press-card' + (active ? ' active' : '')}
      onClick={onClick}
      style={{ alignItems: 'flex-start' }}
    >
      {job.imageUrl
        ? <img className="press-card-thumb" src={job.imageUrl} alt="" loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        : (
          <div className="press-card-thumb-placeholder">
            <Icon name="briefcase" size={18} />
          </div>
        )
      }
      <div className="press-card-body">
        <div className="press-card-meta">
          {primaryCat && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: catColor(primaryCat), background: `color-mix(in srgb, ${catColor(primaryCat)} 12%, transparent)`,
              padding: '2px 7px', borderRadius: 100, border: `1px solid color-mix(in srgb, ${catColor(primaryCat)} 25%, transparent)`,
            }}>
              {primaryCat}
            </span>
          )}
          {location && (
            <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
              <Icon name="globe" size={11} /> {location}
            </span>
          )}
          <span className="press-card-time">{job.time}</span>
        </div>
        <div className="press-card-headline">{job.title}</div>
        {job.snippet && (
          <div className="press-card-snippet">{job.snippet.slice(0, 140)}</div>
        )}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// JobDetail
// ---------------------------------------------------------------------------
function JobDetail({ job }: { job: ApiJobDetail | null }) {
  if (!job) {
    return (
      <div className="press-detail-empty">
        <Icon name="briefcase" size={32} />
        <p>Select a job posting to read the full details</p>
      </div>
    )
  }

  return (
    <div className="press-detail">
      {job.imageUrl && (
        <div style={{ padding: '20px 30px 0' }}>
          <img
            src={job.imageUrl}
            alt=""
            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div className="press-detail-body">
        <div className="press-detail-tags">
          {job.categories.filter(c => c !== 'Rotorwing').map(cat => (
            <span key={cat} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: catColor(cat), background: `color-mix(in srgb, ${catColor(cat)} 12%, transparent)`,
              padding: '3px 9px', borderRadius: 100, border: `1px solid color-mix(in srgb, ${catColor(cat)} 25%, transparent)`,
            }}>
              {cat}
            </span>
          ))}
          {job.locationTags.map(loc => (
            <span key={loc} style={{
              fontSize: 10.5, color: 'var(--ink-3)', background: 'var(--surface-2)',
              padding: '3px 9px', borderRadius: 100, border: '1px solid var(--border)',
            }}>
              {loc}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono, monospace' }}>
            {job.time}
          </span>
        </div>

        <div className="press-detail-headline">{job.title}</div>

        {job.fullContent ? (
          <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', marginTop: 20 }}>
            {job.fullContent.split('\n\n').map((para, i) => {
              if (para.startsWith('## ')) {
                return <h3 key={i} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: '18px 0 6px' }}>{para.slice(3)}</h3>
              }
              return <p key={i} style={{ margin: '0 0 12px' }}>{para}</p>
            })}
          </div>
        ) : (
          <p style={{ marginTop: 20, fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 13.5 }}>
            Full job description not yet loaded.
          </p>
        )}

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24,
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            textDecoration: 'none', padding: '8px 16px',
            border: '1px solid var(--accent)', borderRadius: 6,
          }}
        >
          View on HeliJobs <Icon name="arrow" size={13} />
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11.5, fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent-ink)' : 'var(--ink-2)',
        background: active ? 'var(--accent-tint)' : 'var(--surface-2)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 100, padding: '4px 11px', cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function Jobs() {
  const [metrics,       setMetrics]       = useState<Metric[]>([])
  const [jobs,          setJobs]          = useState<ApiJob[]>([])
  const [total,         setTotal]         = useState(0)
  const [selected,      setSelected]      = useState<ApiJobDetail | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [catFilter,     setCatFilter]     = useState<string | null>(null)
  const [locFilter,     setLocFilter]     = useState<string | null>(null)

  const loadJobs = useCallback(async (cat: string | null, loc: string | null) => {
    setLoading(true)
    try {
      const { jobs: j, total: t } = await api.jobs.list({
        limit: 40,
        category: cat ?? undefined,
        location: loc ?? undefined,
      })
      setJobs(j)
      setTotal(t)
      setSelected(null)
    } catch {
      // keep empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    api.jobs.metrics().then(({ metrics: m }) => setMetrics(m)).catch(() => {})
    loadJobs(null, null)
  }, [loadJobs])

  function toggleCat(cat: string) {
    const next = catFilter === cat ? null : cat
    setCatFilter(next)
    loadJobs(next, locFilter)
  }

  function toggleLoc(loc: string) {
    const next = locFilter === loc ? null : loc
    setLocFilter(next)
    loadJobs(catFilter, next)
  }

  async function selectJob(job: ApiJob) {
    if (selected?.id === job.id) return
    if (job.hasContent) {
      try {
        const { job: detail } = await api.jobs.detail(job.id)
        setSelected(detail)
      } catch {
        setSelected({ ...job, fullContent: null } as ApiJobDetail)
      }
    } else {
      setSelected({ ...job, fullContent: null } as ApiJobDetail)
    }
  }

  return (
    <div className="wrap">
      {/* Metrics */}
      <div className="metrics">
        {metrics.map(m => <MetricCard key={m.label} m={m} />)}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
          Helicopter &amp; Aviation Jobs
          <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--ink-3)', marginLeft: 8, fontFamily: 'IBM Plex Mono, monospace' }}>
            via helijobs.net
          </span>
        </h2>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {total.toLocaleString()} postings
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', alignSelf: 'center', marginRight: 2 }}>Type:</span>
        {CATEGORY_FILTERS.map(c => (
          <FilterChip key={c} label={c} active={catFilter === c} onClick={() => toggleCat(c)} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--ink-3)', alignSelf: 'center', marginLeft: 8, marginRight: 2 }}>Region:</span>
        {LOCATION_FILTERS.map(l => (
          <FilterChip key={l} label={l} active={locFilter === l} onClick={() => toggleLoc(l)} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="press-archive">
        {/* Left — job list */}
        <div className="press-list">
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Loading jobs…
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No jobs found. The scraper may still be running its first pass.
            </div>
          ) : (
            jobs.map(j => (
              <JobCard
                key={j.id}
                job={j}
                active={selected?.id === j.id}
                onClick={() => selectJob(j)}
              />
            ))
          )}
        </div>

        {/* Right — job detail */}
        <JobDetail job={selected} />
      </div>
    </div>
  )
}
