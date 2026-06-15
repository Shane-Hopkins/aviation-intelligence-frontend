import { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard'
import Sparkline from '../components/Sparkline'
import data from '../data'
import { api } from '../lib/api'
import type { Metric, LogEntry } from '../types'
import type { ApiScraper } from '../lib/api'

// ---------------------------------------------------------------------------
// ScraperCard — matches the design spec exactly, fed from live or mock data
// ---------------------------------------------------------------------------
function ScraperCard({ s }: { s: ApiScraper }) {
  const rateClass  = s.rate >= 97 ? '' : s.rate >= 80 ? 'warn' : 'bad'
  const sparkColor = s.rate >= 97 ? 'var(--steel)' : s.rate >= 80 ? 'var(--amber)' : 'var(--red)'
  const statusLabel = { healthy: 'Healthy', degraded: 'Degraded', down: 'Down' }[s.status]

  return (
    <div className={'scraper' + (s.status !== 'healthy' ? ' ' + s.status : '')}>
      <div className="scraper-top">
        <div className="scraper-logo">{s.code}</div>
        <div style={{ minWidth: 0 }}>
          <div className="scraper-name">{s.name}</div>
          <div className="scraper-url">{s.url}</div>
        </div>
        <span className={'status-tag' + (s.status !== 'healthy' ? ' ' + s.status : '')}>
          <span className="d" />{statusLabel}
        </span>
      </div>

      <div className="scraper-stats">
        <div className="stat">
          <div className="stat-label">Last run</div>
          <div className="stat-val">{s.lastRun}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Items collected</div>
          <div className="stat-val">{s.items} <small>/ ~{s.avg} avg</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Run at</div>
          <div className="stat-val">{s.lastRunAbs}</div>
        </div>
      </div>

      <div className="spark-row">
        <div className="spark-meta">
          <b className={rateClass}>{s.rate}%</b>
          success · last 12 runs
        </div>
        <Sparkline data={s.history} color={sparkColor} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live / Demo badges (same as CommunityPulse)
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
// Trigger button — manually fires a scrape run
// ---------------------------------------------------------------------------
function TriggerButton({ onClick, running }: { onClick: () => void; running: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={running}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontSize: 12, fontWeight: 600, padding: '6px 13px',
        borderRadius: 100, border: '1px solid var(--border)',
        background: running ? 'var(--surface-2)' : 'var(--surface)',
        color: running ? 'var(--ink-3)' : 'var(--ink-2)',
        cursor: running ? 'default' : 'pointer',
        transition: 'all 0.14s',
      }}
    >
      {running ? 'Running…' : 'Run now'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function SourceHealth() {
  const [metrics,  setMetrics]  = useState<Metric[] | null>(null)
  const [scrapers, setScrapers] = useState<ApiScraper[] | null>(null)
  const [log,      setLog]      = useState<LogEntry[] | null>(null)
  const [isLive,   setIsLive]   = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [running,  setRunning]  = useState(false)

  function loadLiveData() {
    return Promise.all([
      api.health.metrics(),
      api.scraper.status(),
      api.scraper.runs(12),
    ]).then(([m, s, r]) => {
      setMetrics(m.metrics)
      setScrapers(s.scrapers)
      setLog(r.log as LogEntry[])
      setIsLive(true)
      setApiError(null)
    })
  }

  useEffect(() => {
    loadLiveData().catch(err => {
      setApiError(err instanceof Error ? err.message : String(err))
      setIsLive(false)
    })
  }, [])

  async function handleRunNow() {
    setRunning(true)
    try {
      await api.scraper.runAll()
      // Poll for updated data after a short delay to let the run start
      setTimeout(() => {
        loadLiveData().catch(() => {}).finally(() => setRunning(false))
      }, 3000)
    } catch {
      setRunning(false)
    }
  }

  const displayMetrics  = metrics  ?? data.healthSummary
  const displayScrapers = scrapers ?? data.scrapers
  const displayLog      = log      ?? data.logs
  const healthyCount    = displayScrapers.filter(s => s.status === 'healthy').length

  return (
    <div className="wrap">
      {apiError && (
        <div style={{
          marginTop: 20, padding: '10px 14px', borderRadius: 9,
          background: 'var(--amber-tint)', border: '1px solid oklch(0.82 0.08 80)',
          fontSize: 12, color: 'oklch(0.47 0.11 75)',
        }}>
          <strong>Backend offline</strong> — showing demo data.
          Start the backend on port 3001 to see live scraper status.
        </div>
      )}

      <div className="health-summary">
        {displayMetrics.map((m, i) => <MetricCard key={i} m={m} />)}
      </div>

      <div className="section-head">
        <h2>Scrapers</h2>
        <span className="meta">
          {displayScrapers.length} configured · {healthyCount} healthy
        </span>
        <span className="spacer" />
        {isLive ? <LiveBadge /> : <DemoBadge />}
        {isLive && (
          <>
            <span style={{ width: 8 }} />
            <TriggerButton onClick={handleRunNow} running={running} />
          </>
        )}
      </div>

      <div className="health-grid">
        {displayScrapers.map((s, i) => (
          <ScraperCard key={(s as ApiScraper).id ?? s.name ?? i} s={s as ApiScraper} />
        ))}
      </div>

      <div className="section-head">
        <h2>Recent run log</h2>
        <span className="meta">newest first</span>
      </div>
      <div className="log-card">
        {displayLog.map((l, i) => (
          <div className="log-row" key={i}>
            <span className="log-time">{l.time}</span>
            <span className={'log-dot ' + l.level} />
            <span className="log-src">{l.src}</span>
            <span className="log-msg">{l.msg}</span>
          </div>
        ))}
        {displayLog.length === 0 && (
          <div style={{ padding: '20px 17px', color: 'var(--ink-3)', fontSize: 12.5 }}>
            No runs yet — start the backend and trigger a scrape run.
          </div>
        )}
      </div>
    </div>
  )
}
