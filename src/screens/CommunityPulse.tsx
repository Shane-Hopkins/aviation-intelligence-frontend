import React, { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard'
import AskPanel from '../components/AskPanel'
import data from '../data'
import { api } from '../lib/api'
import type { Metric, Topic, Forum, Answer } from '../types'
import type { ApiTopic, ApiForum } from '../lib/api'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NetChip({ net, label, tone }: { net: number; label: string; tone: string }) {
  return (
    <span className={'net-chip ' + tone}>
      <span className="nv">{net > 0 ? '+' + net : net}</span>{label}
    </span>
  )
}

function SentBar({ pos, neu, neg }: { pos: number; neu: number; neg: number }) {
  return (
    <div>
      <div className="sent-bar">
        <div className="seg pos" style={{ width: pos + '%' }} />
        <div className="seg neu" style={{ width: neu + '%' }} />
        <div className="seg neg" style={{ width: neg + '%' }} />
      </div>
      <div className="sent-legend">
        <span className="lk"><span className="sw pos" /> Positive <span className="pct">{pos}%</span></span>
        <span className="lk"><span className="sw neu" /> Neutral <span className="pct">{neu}%</span></span>
        <span className="lk"><span className="sw neg" /> Negative <span className="pct">{neg}%</span></span>
      </div>
    </div>
  )
}

const quietLink: React.CSSProperties = { color: 'inherit', textDecoration: 'none' }

function TopicCard({ t, forumMap }: { t: Topic; forumMap: Map<string, string> }) {
  return (
    <div className="topic">
      <div className="topic-top">
        <div style={{ minWidth: 0 }}>
          {t.url
            ? <a className="topic-title" href={t.url} target="_blank" rel="noopener noreferrer" style={quietLink}>{t.title}</a>
            : <div className="topic-title">{t.title}</div>
          }
          <div className="topic-meta">
            <span><span className="mono">{t.posts}</span> posts</span>
            <span>·</span>
            <span>{t.forums === 1 ? '1 forum' : `${t.forums} forums`}</span>
            <span>·</span>
            {t.top.map((name, i) => {
              const url = forumMap.get(name.trim())
              return url
                ? <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={quietLink} className="doc-chip">{name.trim()}</a>
                : <span key={i} className="doc-chip">{name.trim()}</span>
            })}
          </div>
        </div>
        <NetChip net={t.net} label={t.label} tone={t.tone} />
      </div>
      <SentBar pos={t.pos} neu={t.neu} neg={t.neg} />
      {t.synopsis && (
        <div className="topic-theme">
          <span className="lab">AI synopsis</span>
          <span>{t.synopsis}</span>
        </div>
      )}
    </div>
  )
}

function ForumCard({ f }: { f: Forum & { url?: string } }) {
  const inner = (
    <div className="forum">
      <div className="forum-top">
        <span className={'forum-status ' + f.status} title={f.status} />
        <div style={{ minWidth: 0 }}>
          <div className="forum-name">{f.name}</div>
          <div className="forum-handle">{f.handle}</div>
        </div>
      </div>
      <div className="forum-foot">
        <span className="forum-posts"><b>{f.posts}</b> posts · 7d</span>
        <span className={'net-mini ' + f.tone}>{f.net > 0 ? '+' + f.net : f.net}</span>
      </div>
    </div>
  )
  return f.url
    ? <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>
    : inner
}

// ---------------------------------------------------------------------------
// Map API shapes → frontend types
// ---------------------------------------------------------------------------
function mapTopic(t: ApiTopic): Topic {
  return {
    id: String(t.id),
    title: t.title,
    doc: t.doc,
    url: t.url,
    synopsis: t.synopsis,
    posts: t.posts,
    forums: t.forums,
    pos: t.pos,
    neu: t.neu,
    neg: t.neg,
    net: t.net,
    label: t.label,
    tone: t.tone,
    theme: t.theme,
    top: t.top,
  }
}

function mapForum(f: ApiForum): Forum & { url?: string } {
  return {
    name: f.name,
    handle: f.handle,
    posts: f.posts,
    net: f.net,
    tone: f.tone,
    status: f.status,
    url: f.url,
  }
}

// ---------------------------------------------------------------------------
// Data source indicator — shows in section head when using live data
// ---------------------------------------------------------------------------
function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10.5, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace',
      color: 'oklch(0.44 0.11 152)', background: 'var(--green-tint)',
      border: '1px solid oklch(0.84 0.06 152)', borderRadius: 100,
      padding: '2px 8px', letterSpacing: 0,
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
// Main screen
// ---------------------------------------------------------------------------
export default function CommunityPulse() {
  const [metrics, setMetrics] = useState<Metric[] | null>(null)
  const [topics, setTopics] = useState<Topic[] | null>(null)
  const [forums, setForums] = useState<Forum[] | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.community.metrics(),
      api.community.topics(),
      api.community.forums(),
    ])
      .then(([m, t, f]) => {
        setMetrics(m.metrics)
        setTopics(t.topics.map(mapTopic))
        setForums(f.forums.map(mapForum))
        setIsLive(true)
      })
      .catch(err => {
        // Backend not available — fall back to mock data silently
        setApiError(err instanceof Error ? err.message : String(err))
        setIsLive(false)
      })
  }, [])

  // Use live data if available, mock otherwise
  const displayMetrics = metrics ?? data.forumStats
  const displayTopics  = topics  ?? data.topics
  const displayForums  = forums  ?? data.forums

  // "Ask the community" handler — calls real API when live, undefined when mock
  async function handleAsk(query: string): Promise<Answer> {
    const res = await api.community.ask(query)
    return res.answer
  }

  // AskPanel config: if live, pass onAsk for real API; if not, leave undefined
  // so AskPanel falls back to keyword routing
  const askProps = isLive
    ? { cfg: data.askConfigs.sentiment, onAsk: handleAsk }
    : { cfg: data.askConfigs.sentiment }

  return (
    <div className="wrap">
      {/* Connection error notice (subtle — screen still works with mock data) */}
      {apiError && (
        <div style={{
          marginTop: 20, padding: '10px 14px', borderRadius: 9,
          background: 'var(--amber-tint)', border: '1px solid oklch(0.82 0.08 80)',
          fontSize: 12, color: 'oklch(0.47 0.11 75)', display: 'flex', gap: 8,
        }}>
          <strong>Backend offline</strong> — showing demo data.
          Start the backend on port 3001 to see live forum data.
        </div>
      )}

      <div className="metrics">
        {displayMetrics.map((m, i) => <MetricCard key={i} m={m} />)}
      </div>

      <div className="section-head">
        <h2>Trending discussions</h2>
        <span className="meta">
          ranked by volume · sentiment from {displayForums.length} active forums
        </span>
        <span className="spacer" />
        {isLive ? <LiveBadge /> : <DemoBadge />}
        <span style={{ width: 8 }} />
        <span className="meta mono">last 7 days</span>
      </div>

      <div className="layout-2col">
        <div className="topic-list">
          {displayTopics.length > 0 ? (
            (() => {
              const forumMap = new Map(
                (displayForums as Array<Forum & { url?: string }>)
                  .filter(f => f.url)
                  .map(f => [f.name, f.url!])
              )
              return displayTopics.map(t => <TopicCard key={t.id} t={t} forumMap={forumMap} />)
            })()
          ) : (
            <div style={{
              padding: '40px 20px', textAlign: 'center',
              color: 'var(--ink-3)', fontSize: 13,
              border: '1px dashed var(--border)', borderRadius: 15,
            }}>
              No topics yet — waiting for the first scrape run to complete.
            </div>
          )}
        </div>
        <AskPanel {...askProps} />
      </div>

      <div className="section-head">
        <h2>Forums monitored</h2>
        <span className="meta">
          {displayForums.length} of {isLive ? displayForums.length : 24} shown
          · collectors feeding the sentiment model
        </span>
      </div>
      <div className="forum-grid">
        {displayForums.map(f => <ForumCard key={f.name} f={f} />)}
      </div>
    </div>
  )
}
