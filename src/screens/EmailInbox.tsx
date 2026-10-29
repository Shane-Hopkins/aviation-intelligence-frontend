import { useState, useEffect, useCallback } from 'react'
import Icon from '../components/Icon'
import MetricCard from '../components/MetricCard'
import { api } from '../lib/api'
import type {
  ApiEmailAccount, ApiEmailMessage, ApiEmailMessageDetail,
  ApiEmailAttachment, ApiEmailArticle, ApiEmailAccountInput,
} from '../lib/api'
import type { Metric } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function fmtBytes(n: number | null): string {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function statusColor(status: ApiEmailAccount['status']) {
  return status === 'healthy' ? 'var(--green)' : status === 'down' ? 'var(--red)' : 'var(--amber)'
}

// ---------------------------------------------------------------------------
// Account config form
// ---------------------------------------------------------------------------
function AccountForm({
  existing,
  onSave,
  onCancel,
}: {
  existing: ApiEmailAccount | null
  onSave: (acct: ApiEmailAccount) => void
  onCancel: () => void
}) {
  const [label,    setLabel]    = useState(existing?.label ?? 'Press inbox')
  const [host,     setHost]     = useState(existing?.host ?? '')
  const [port,     setPort]     = useState(existing?.port ?? 993)
  const [tls,      setTls]      = useState(existing?.tls ?? true)
  const [user,     setUser]     = useState(existing?.user ?? '')
  const [password, setPassword] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Preset helpers
  function applyPreset(preset: string) {
    if (preset === 'gmail')   { setHost('imap.gmail.com');           setPort(993); setTls(true) }
    if (preset === 'outlook') { setHost('outlook.office365.com');    setPort(993); setTls(true) }
    if (preset === 'yahoo')   { setHost('imap.mail.yahoo.com');      setPort(993); setTls(true) }
    if (preset === 'icloud')  { setHost('imap.mail.me.com');         setPort(993); setTls(true) }
    if (preset === 'zoho')    { setHost('imap.zoho.com');            setPort(993); setTls(true) }
  }

  async function handleSave() {
    if (!host || !user || !password) { setError('Host, email and password are required'); return }
    setSaving(true); setError(null)
    try {
      const payload: ApiEmailAccountInput = { label, host, port, tls, user, password }
      const { account } = await api.email.saveAccount(payload)
      onSave(account)
    } catch {
      setError('Failed to save account. Check your details and try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: 13,
    border: '1px solid var(--border)', borderRadius: 6,
    background: 'var(--surface)', color: 'var(--ink-1)',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '20px 24px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
        {existing ? 'Edit email account' : 'Connect an email account'}
      </div>

      {/* Provider presets */}
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Quick setup</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['gmail', 'outlook', 'yahoo', 'icloud', 'zoho'].map(p => (
            <button key={p} onClick={() => applyPreset(p)} style={{
              fontSize: 11.5, fontWeight: 600, padding: '4px 12px',
              border: '1px solid var(--border)', borderRadius: 100,
              background: 'var(--surface-2)', color: 'var(--ink-2)', cursor: 'pointer',
            }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
          Gmail: enable IMAP in Settings and use an App Password (not your Google login).
          Outlook personal accounts require IMAP to be enabled in settings.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={labelStyle}>Label</div>
          <input style={inputStyle} value={label} onChange={e => setLabel(e.target.value)} placeholder="Press inbox" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={labelStyle}>Email address</div>
          <input style={inputStyle} type="email" value={user} onChange={e => setUser(e.target.value)} placeholder="press@yourdomain.com" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={labelStyle}>Password / App Password</div>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" />
        </div>
        <div>
          <div style={labelStyle}>IMAP host</div>
          <input style={inputStyle} value={host} onChange={e => setHost(e.target.value)} placeholder="imap.gmail.com" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Port</div>
            <input style={inputStyle} type="number" value={port} onChange={e => setPort(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={tls} onChange={e => setTls(e.target.checked)} />
              TLS / SSL
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--red)', background: 'var(--red-tint)', padding: '7px 10px', borderRadius: 6 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
          background: 'var(--blue)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Saving…' : 'Save account'}
        </button>
        <button onClick={onCancel} style={{
          padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
          background: 'var(--surface-2)', color: 'var(--ink-2)',
          border: '1px solid var(--border)', cursor: 'pointer',
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Account status strip
// ---------------------------------------------------------------------------
function AccountStrip({
  account,
  checking,
  onConfigure,
  onCheck,
  onDelete,
}: {
  account: ApiEmailAccount
  checking: boolean
  onConfigure: () => void
  onCheck: () => void
  onDelete: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 18px',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: statusColor(account.status), flexShrink: 0,
      }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{account.label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {account.user} · {account.host}:{account.port} · {account.tls ? 'TLS' : 'plain'}
          {account.lastCheckedAt && ` · checked ${timeAgo(account.lastCheckedAt)}`}
        </div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: account.status === 'healthy' ? 'oklch(0.44 0.11 152)' : account.status === 'down' ? 'var(--red)' : 'var(--amber)',
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {account.status}
      </span>
      <button onClick={onCheck} disabled={checking} style={{
        fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 100,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--ink-2)', cursor: checking ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
      }}>
        {checking ? 'Checking…' : 'Check now'}
      </button>
      <button onClick={onConfigure} style={{
        fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 100,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        Configure
      </button>
      <button onClick={onDelete} style={{
        fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 100,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--red)', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        Remove
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Message row
// ---------------------------------------------------------------------------
function MessageRow({ msg, active, onClick }: { msg: ApiEmailMessage; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '11px 14px', borderRadius: 8,
        background: active ? 'var(--surface-2)' : 'transparent',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-1)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {msg.fromName ?? msg.fromAddress}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{timeAgo(msg.receivedAt ?? msg.createdAt)}</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-1)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {msg.subject ?? '(no subject)'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {msg.hasAttachments && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-3)' }}>
            <Icon name="attach" size={11} /> attachment
          </span>
        )}
        {msg.artyTitle ? (
          <span style={{
            fontSize: 10.5, fontWeight: 600, padding: '1px 7px', borderRadius: 100,
            background: 'var(--green-tint)', color: 'oklch(0.44 0.11 152)',
            border: '1px solid oklch(0.84 0.06 152)',
          }}>
            article ready
          </span>
        ) : (
          <span style={{
            fontSize: 10.5, fontWeight: 600, padding: '1px 7px', borderRadius: 100,
            background: 'var(--surface-2)', color: 'var(--ink-3)',
            border: '1px solid var(--border)',
          }}>
            processing
          </span>
        )}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------
function MessageDetail({
  msgId,
}: {
  msgId: number | null
}) {
  const [data, setData] = useState<{
    message: ApiEmailMessageDetail
    attachments: ApiEmailAttachment[]
    article: ApiEmailArticle | null
  } | null>(null)
  const [tab, setTab] = useState<'original' | 'article'>('original')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!msgId) { setData(null); return }
    setLoading(true)
    api.email.message(msgId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [msgId])

  if (!msgId) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 10, color: 'var(--ink-3)',
      }}>
        <Icon name="email" size={32} />
        <span style={{ fontSize: 14 }}>Select a message to view</span>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
        Loading…
      </div>
    )
  }

  const { message: msg, attachments, article } = data
  const tabBtn = (t: 'original' | 'article', label: string, disabled?: boolean): React.ReactNode => (
    <button
      onClick={() => !disabled && setTab(t)}
      disabled={!!disabled}
      style={{
        padding: '5px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 100,
        border: tab === t ? '1px solid var(--blue)' : '1px solid var(--border)',
        background: tab === t ? 'var(--blue-tint, #eff6ff)' : 'var(--surface)',
        color: tab === t ? 'var(--blue)' : disabled ? 'var(--ink-3)' : 'var(--ink-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
          {msg.subject ?? '(no subject)'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>
          From: <strong style={{ color: 'var(--ink-2)' }}>{msg.fromName ? `${msg.fromName} <${msg.fromAddress}>` : msg.fromAddress}</strong>
          {msg.receivedAt && <> · {new Date(msg.receivedAt).toLocaleString()}</>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabBtn('original', 'Original email')}
          {tabBtn('article', article ? 'Generated article' : 'Article (pending…)', !article)}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {tab === 'original' && (
          <>
            {/* Attachments list */}
            {attachments.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Attachments ({attachments.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {attachments.map(att => (
                    <div key={att.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px', borderRadius: 6,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      fontSize: 12,
                    }}>
                      <Icon name="attach" size={12} />
                      <span>{att.filename ?? 'attachment'}</span>
                      <span style={{ color: 'var(--ink-3)' }}>{fmtBytes(att.sizeBytes)}</span>
                      {att.extractedText && (
                        <span style={{ color: 'oklch(0.44 0.11 152)', fontSize: 10.5, fontWeight: 600 }}>✓ extracted</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email body — prefer HTML, fall back to plain text */}
            {msg.bodyHtml ? (
              <div
                style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-1)' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.bodyHtml) }}
              />
            ) : msg.bodyText ? (
              <pre style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--ink-1)', fontFamily: 'inherit', margin: 0 }}>
                {msg.bodyText}
              </pre>
            ) : (
              <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>No body content</div>
            )}
          </>
        )}

        {tab === 'article' && article && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: 'var(--ink-1)' }}>
              {article.artyTitle}
            </h2>
            <div
              style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink-1)' }}
              dangerouslySetInnerHTML={{ __html: article.artyHtml }}
            />
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--ink-3)' }}>
              Generated {new Date(article.processedAt).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Very light HTML sanitiser — strips script/style/on* attrs before rendering inline email HTML.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function EmailInbox() {
  const [account,    setAccount]    = useState<ApiEmailAccount | null>(null)
  const [metrics,    setMetrics]    = useState<Metric[]>([])
  const [messages,   setMessages]   = useState<ApiEmailMessage[]>([])
  const [total,      setTotal]      = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [checking,   setChecking]   = useState(false)
  const [loading,    setLoading]    = useState(true)

  const loadData = useCallback(async () => {
    const [acctRes, msgRes] = await Promise.allSettled([
      api.email.account(),
      api.email.messages(50),
    ])
    if (acctRes.status === 'fulfilled') setAccount(acctRes.value.account)
    if (msgRes.status === 'fulfilled')  { setMessages(msgRes.value.messages); setTotal(msgRes.value.total) }

    api.email.metrics().then(r => setMetrics(r.metrics)).catch(() => {})
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleCheck() {
    setChecking(true)
    try {
      await api.email.check()
      // Refresh after a short delay to pick up new messages
      setTimeout(() => loadData(), 3000)
    } finally {
      setChecking(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Remove this account and all its messages?')) return
    await api.email.deleteAccount()
    setAccount(null)
    setMessages([])
    setTotal(0)
  }

  if (loading) {
    return <div className="wrap" style={{ padding: '32px 40px', color: 'var(--ink-3)' }}>Loading…</div>
  }

  return (
    <div className="wrap" style={{ paddingBottom: 0 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px' }}>
        <div>
          <div className="page-title">Email inbox</div>
          <div className="page-sub">Monitor inbound press releases delivered by email</div>
        </div>
        {!showForm && !account && (
          <button onClick={() => setShowForm(true)} style={{
            padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
            background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            + Connect inbox
          </button>
        )}
      </div>

      {/* Metrics */}
      {metrics.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {metrics.map(m => <MetricCard key={m.label} m={m} />)}
        </div>
      )}

      {/* Account config */}
      {showForm ? (
        <div style={{ marginBottom: 16 }}>
          <AccountForm
            existing={account}
            onSave={acct => { setAccount(acct); setShowForm(false); loadData() }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : account ? (
        <div style={{ marginBottom: 16 }}>
          <AccountStrip
            account={account}
            checking={checking}
            onConfigure={() => setShowForm(true)}
            onCheck={handleCheck}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        <div style={{
          marginBottom: 16, padding: '16px 20px',
          background: 'var(--surface)', border: '1px dashed var(--border)',
          borderRadius: 10, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5,
        }}>
          No email account connected. Click{' '}
          <button onClick={() => setShowForm(true)} style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: 'var(--blue)', fontWeight: 600, fontSize: 'inherit',
          }}>
            Connect inbox
          </button>
          {' '}to add an IMAP account.
        </div>
      )}

      {/* Messages + detail split */}
      <div style={{
        display: 'flex', border: '1px solid var(--border)', borderRadius: 10,
        overflow: 'hidden', height: 'calc(100vh - 340px)', minHeight: 400,
      }}>
        {/* Message list */}
        <div style={{
          width: 300, flexShrink: 0, borderRight: '1px solid var(--border)',
          overflow: 'auto', padding: '10px 8px',
        }}>
          {messages.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              {account ? 'No messages yet. Click "Check now" to poll the inbox.' : 'Connect an inbox to start receiving emails.'}
            </div>
          ) : (
            <>
              <div style={{ padding: '2px 6px 8px', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                {total} message{total !== 1 ? 's' : ''}
              </div>
              {messages.map(msg => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  active={selectedId === msg.id}
                  onClick={() => setSelectedId(msg.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* Detail */}
        <MessageDetail msgId={selectedId} />
      </div>
    </div>
  )
}
