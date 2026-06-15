import { useState, useEffect } from 'react'
import Sparkline from '../components/Sparkline'
import Icon from '../components/Icon'
import { api } from '../lib/api'
import type { ApiScraper, ApiLogEntry } from '../lib/api'

// ---------------------------------------------------------------------------
// Source card — one per press source (FAA, EASA, TC, Boeing, Airbus, ICAO)
// ---------------------------------------------------------------------------
function SourceCard({ s, onRun }: { s: ApiScraper; onRun: (id: number) => void }) {
  const rateClass  = s.rate >= 97 ? '' : s.rate >= 80 ? 'warn' : 'bad'
  const sparkColor = s.rate >= 97 ? 'var(--steel)' : s.rate >= 80 ? 'var(--amber)' : 'var(--red)'
  const statusLabel = { healthy: 'Healthy', degraded: 'Degraded', down: 'Down' }[s.status]

  return (
    <div className={'scraper' + (s.status !== 'healthy' ? ' ' + s.status : '')}>
      <div className="scraper-top">
        <div className="scraper-logo">{s.code}</div>
        <div style={{ minWidth: 0 }}>
          <div className="scraper-name">{s.name}</div>
          <a className="scraper-url" href={'https://' + s.url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}>{s.url}</a>
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
          <div className="stat-label">New items</div>
          <div className="stat-val">{s.items} <small>/ ~{s.avg} avg</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Completed</div>
          <div className="stat-val">{s.lastRunAbs}</div>
        </div>
      </div>

      <div className="spark-row">
        <div className="spark-meta">
          <b className={rateClass}>{s.rate}%</b>
          success · last 12 runs
        </div>
        <Sparkline data={s.history} color={sparkColor} />
        <button
          onClick={() => onRun(s.id)}
          style={{
            fontSize: 11.5, fontWeight: 600, padding: '5px 12px',
            borderRadius: 100, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--ink-2)',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          Run now
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function PressHealth() {
  const [sources,  setSources]  = useState<ApiScraper[] | null>(null)
  const [log,      setLog]      = useState<ApiLogEntry[] | null>(null)
  const [isLive,   setIsLive]   = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [running,  setRunning]  = useState(false)

  function loadData() {
    return Promise.all([
      api.press.sourceStatus(),
      api.press.runs(40),
    ]).then(([s, r]) => {
      setSources(s.scrapers)
      setLog(r.log)
      setIsLive(true)
      setApiError(null)
    })
  }

  useEffect(() => {
    loadData().catch(err => {
      setApiError(err instanceof Error ? err.message : String(err))
      setIsLive(false)
    })
  }, [])

  async function handleRunAll() {
    setRunning(true)
    try {
      await api.press.runAll()
      setTimeout(() => {
        loadData().catch(() => {}).finally(() => setRunning(false))
      }, 3000)
    } catch {
      setRunning(false)
    }
  }

  async function handleRunOne(sourceId: number) {
    try {
      await api.press.runOne(sourceId)
      setTimeout(() => loadData().catch(() => {}), 3000)
    } catch {}
  }

  const displaySources = sources ?? []
  const displayLog     = log ?? []
  const healthyCount   = displaySources.filter(s => s.status === 'healthy').length

  return (
    <div className="wrap">
      {apiError && (
        <div style={{
          marginTop: 20, padding: '10px 14px', borderRadius: 9,
          background: 'var(--amber-tint)', border: '1px solid oklch(0.82 0.08 80)',
          fontSize: 12, color: 'oklch(0.47 0.11 75)',
        }}>
          <strong>Backend offline</strong> — cannot load press source status.
        </div>
      )}

      <div className="section-head" style={{ marginTop: 36 }}>
        <h2>Press crawlers</h2>
        <span className="meta">
          {displaySources.length} sources · {healthyCount} healthy
        </span>
        <span className="spacer" />
        {isLive && (
          <button
            onClick={handleRunAll}
            disabled={running}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontSize: 12, fontWeight: 600, padding: '6px 13px',
              borderRadius: 100, border: '1px solid var(--border)',
              background: running ? 'var(--surface-2)' : 'var(--surface)',
              color: running ? 'var(--ink-3)' : 'var(--ink-2)',
              cursor: running ? 'default' : 'pointer',
            }}
          >
            {running ? 'Running…' : 'Run all now'}
          </button>
        )}
      </div>

      {displaySources.length === 0 && !apiError && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          <Icon name="ai" size={28} />
          <div style={{ marginTop: 12 }}>No press sources configured yet.</div>
        </div>
      )}

      <div className="health-grid">
        {displaySources.map(s => (
          <SourceCard key={s.id} s={s} onRun={handleRunOne} />
        ))}
      </div>

      <div className="section-head">
        <h2>Run log</h2>
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
            No runs yet — click "Run all now" to start.
          </div>
        )}
      </div>
    </div>
  )
}
