import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { ApiKeyWithFeeds, ApiKeyFeedItem, ApiScraper, ApiForum } from '../lib/api'

const FEED_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace('/api', '')

export default function Account() {
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  const [keys, setKeys] = useState<ApiKeyWithFeeds[]>([])
  const [sources, setSources] = useState<ApiScraper[]>([])
  const [forums, setForums] = useState<ApiForum[]>([])
  const [selectedKey, setSelectedKey] = useState<ApiKeyWithFeeds | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [saving, setSaving] = useState(false)

  // Local feed selection state (edited before save)
  const [feedSelection, setFeedSelection] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.keys.list().then(r => {
      setKeys(r.keys)
      if (r.keys.length > 0) selectKey(r.keys[0])
    }).catch(() => {})
    api.press.sourceStatus().then(r => setSources(r.scrapers)).catch(() => {})
    api.community.forums().then(r => setForums(r.forums)).catch(() => {})
  }, [])

  function selectKey(k: ApiKeyWithFeeds) {
    setSelectedKey(k)
    setFeedSelection(new Set(k.feeds.map(f => `${f.feedType}::${f.feedCode}`)))
  }

  function toggleFeed(feedType: 'press' | 'community', feedCode: string) {
    const id = `${feedType}::${feedCode}`
    setFeedSelection(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function createKey() {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const { key } = await api.keys.create(newKeyName.trim())
      setKeys(prev => [key, ...prev])
      selectKey(key)
      setNewKeyName('')
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: number) {
    if (!confirm('Revoke this key? Any site using it will stop working.')) return
    await api.keys.revoke(id)
    const updated = keys.filter(k => k.id !== id)
    setKeys(updated)
    if (selectedKey?.id === id) {
      const next = updated[0] ?? null
      if (next) selectKey(next) else setSelectedKey(null)
    }
  }

  async function saveFeeds() {
    if (!selectedKey) return
    setSaving(true)
    try {
      const feeds: ApiKeyFeedItem[] = Array.from(feedSelection).map(s => {
        const [feedType, feedCode] = s.split('::') as ['press' | 'community', string]
        return { feedType, feedCode }
      })
      const { key } = await api.keys.setFeeds(selectedKey.id, feeds)
      setKeys(prev => prev.map(k => k.id === key.id ? key : k))
      setSelectedKey(key)
    } finally {
      setSaving(false)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const feedsDirty = selectedKey
    ? JSON.stringify([...feedSelection].sort()) !== JSON.stringify(selectedKey.feeds.map(f => `${f.feedType}::${f.feedCode}`).sort())
    : false

  const feedUrl = selectedKey ? `${FEED_URL}/v1/feed?key=${selectedKey.key}` : ''

  return (
    <div className="wrap" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, maxWidth: 1000 }}>

        {/* Left col: profile + key list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile */}
          <div className="account-card">
            <div className="account-card-head">
              <UserIcon /> Profile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
              <div className="account-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                <div className="account-tier-pill" style={{ marginTop: 6 }}>
                  <StarIcon /> {user?.tier ?? 'free'} plan
                </div>
              </div>
            </div>
          </div>

          {/* API keys list */}
          <div className="account-card">
            <div className="account-card-head">
              <KeyIcon /> API keys
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {keys.map(k => (
                <button
                  key={k.id}
                  className={`account-key-row${selectedKey?.id === k.id ? ' selected' : ''}`}
                  onClick={() => selectKey(k)}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono, monospace', marginTop: 2 }}>
                      {k.key.slice(0, 14)}…
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', flexShrink: 0 }}>
                    {k.feeds.length} feed{k.feeds.length !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}

              {/* Create new key */}
              {creating ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    className="account-key-input"
                    placeholder="Key name…"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createKey(); if (e.key === 'Escape') { setCreating(false); setNewKeyName('') } }}
                    autoFocus
                  />
                  <button className="account-btn-sm" onClick={createKey}>Create</button>
                </div>
              ) : (
                <button className="account-btn-new" onClick={() => setCreating(true)}>
                  + New key
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right col: key detail + feed selector */}
        {selectedKey ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Key value + endpoint */}
            <div className="account-card">
              <div className="account-card-head" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><KeyIcon /> {selectedKey.name}</span>
                <button className="account-revoke-btn" onClick={() => revokeKey(selectedKey.id)}>Revoke</button>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>API key</div>
                  <div className="account-key-display">
                    <code style={{ flex: 1, fontFamily: 'IBM Plex Mono, monospace', fontSize: 12.5, color: 'var(--ink)', letterSpacing: '0.02em' }}>
                      {selectedKey.key}
                    </code>
                    <button className="account-copy-btn" onClick={() => copyToClipboard(selectedKey.key, 'key')}>
                      {copied === 'key' ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Feed endpoint</div>
                  <div className="account-key-display">
                    <code style={{ flex: 1, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, color: 'var(--accent-ink)', letterSpacing: '0.01em', wordBreak: 'break-all' }}>
                      {feedUrl}
                    </code>
                    <button className="account-copy-btn" onClick={() => copyToClipboard(feedUrl, 'url')}>
                      {copied === 'url' ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8 }}>
                    Add <code style={{ fontFamily: 'IBM Plex Mono, monospace', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4 }}>&limit=50</code> or <code style={{ fontFamily: 'IBM Plex Mono, monospace', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4 }}>&offset=0</code> to paginate. Max 200 per request.
                  </div>
                </div>
                {selectedKey.lastUsedAt && (
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                    Last used: {new Date(selectedKey.lastUsedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Feed selection */}
            <div className="account-card">
              <div className="account-card-head" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><LayersIcon /> Feed selection</span>
                {feedsDirty && (
                  <button className="account-save-btn" onClick={saveFeeds} disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                )}
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* Press sources */}
                <div>
                  <div className="account-feed-group-label">Press sources</div>
                  <div className="account-feed-grid">
                    {sources.map(s => {
                      const id = `press::${s.code}`
                      const checked = feedSelection.has(id)
                      return (
                        <label key={s.code} className={`account-feed-item${checked ? ' checked' : ''}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleFeed('press', s.code)} style={{ display: 'none' }} />
                          <div className={`account-feed-check${checked ? ' on' : ''}`}>
                            {checked && <CheckIcon size={10} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.code}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.name}
                            </div>
                          </div>
                          <div className={`account-status-dot ${s.status}`} title={s.status} />
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Community forums */}
                <div>
                  <div className="account-feed-group-label">Community forums</div>
                  <div className="account-feed-grid">
                    {forums.map(f => {
                      const id = `community::${f.handle}`
                      const checked = feedSelection.has(id)
                      return (
                        <label key={f.handle} className={`account-feed-item${checked ? ' checked' : ''}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleFeed('community', f.handle)} style={{ display: 'none' }} />
                          <div className={`account-feed-check${checked ? ' on' : ''}`}>
                            {checked && <CheckIcon size={10} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.handle}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.name}
                            </div>
                          </div>
                          <div className={`account-status-dot ${f.status}`} title={f.status} />
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="account-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
            <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              <KeyIcon />
              <div style={{ marginTop: 10 }}>Create your first API key to get started</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────

function UserIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
}
function KeyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
}
function LayersIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
}
function StarIcon() {
  return <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.4L6 8.5l-3.1 1.6.6-3.4L1 4.3l3.6-.5z"/></svg>
}
function CopyIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
}
function CheckIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
