import { useState, useRef } from 'react'
import Icon from './Icon'
import type { AskConfig, Answer } from '../types'

// ---------------------------------------------------------------------------
// AnswerCard — renders a structured AI answer with inline citation chips
// ---------------------------------------------------------------------------
function AnswerCard({ answer, cfg }: { answer: Answer; cfg: AskConfig }) {
  return (
    <div className="answer fade-in">
      <div className="answer-head">
        <Icon name="ai" size={14} className="live" />
        <span>AI ANSWER</span>
        <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
          synthesized from {answer.sources.length} {cfg.sourceNoun}
        </span>
      </div>
      <div className="answer-body">
        {answer.paragraphs.map((p, i) => (
          <p key={i}>
            {p.text}
            {(p.cites ?? []).map(c => (
              <a key={c} className="cite" href="#" onClick={e => e.preventDefault()}>{c}</a>
            ))}
            {p.tail}
            {(p.cites2 ?? []).map(c => (
              <a key={c} className="cite" href="#" onClick={e => e.preventDefault()}>{c}</a>
            ))}
          </p>
        ))}
      </div>
      <div className="answer-sources">
        <span className="src-label">{cfg.sourcesLabel}</span>
        {answer.sources.map(s => s.url
          ? (
            <a key={s.num} className="src-link" href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="num">{s.num}</span>
              <span>{s.label}</span>
              <span className="badge src" style={{ fontSize: 10, padding: '2px 6px' }}>
                <span className="src-dot" />{s.src}
              </span>
              <span className="arr"><Icon name="arrow" size={13} /></span>
            </a>
          ) : (
            <div key={s.num} className="src-link">
              <span className="num">{s.num}</span>
              <span>{s.label}</span>
              <span className="badge src" style={{ fontSize: 10, padding: '2px 6px' }}>
                <span className="src-dot" />{s.src}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AskPanel
//
// Props:
//   cfg     — static config: title, desc, suggestions, keyword routes, etc.
//   onAsk   — optional async override; when provided, replaces keyword routing
//             with a real API call. Receives the query, returns an Answer.
//             Pass this for the "Ask the community" panel (real backend).
//             Omit for the "Ask the data" panel (still mock/keyword-routed).
// ---------------------------------------------------------------------------
type PanelState = 'idle' | 'thinking' | 'answered' | 'error'

interface AskPanelProps {
  cfg: AskConfig
  onAsk?: (query: string) => Promise<Answer>
}

export default function AskPanel({ cfg, onAsk }: AskPanelProps) {
  const [value, setValue] = useState(cfg.suggestions[0])
  const [state, setState] = useState<PanelState>('answered')
  const [answer, setAnswer] = useState<Answer | null>(cfg.answers[cfg.defaultKey])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keyword routing for mock mode (no onAsk provided)
  function pickMockAnswer(q: string): Answer {
    for (const r of cfg.routes) {
      if (new RegExp(r.kw, 'i').test(q)) return cfg.answers[r.key]
    }
    return cfg.answers.default ?? cfg.answers[cfg.defaultKey]
  }

  async function submit(q?: string) {
    const query = (q ?? value).trim()
    if (!query) return
    setValue(query)
    setState('thinking')
    setAnswer(null)
    setErrorMsg(null)

    if (onAsk) {
      // Real API mode
      try {
        const result = await onAsk(query)
        setAnswer(result)
        setState('answered')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Request failed')
        setState('error')
      }
    } else {
      // Mock keyword-routing mode (Dashboard "Ask the data")
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setAnswer(pickMockAnswer(query))
        setState('answered')
      }, 1100)
    }
  }

  const searchingLabel =
    cfg.sourceNoun === 'discussions' ? 'SEARCHING THREADS' : 'SEARCHING DOCUMENTS'

  return (
    <aside className="ask">
      <div className="ask-head">
        <span className="ask-spark"><Icon name="ai" size={14} /></span>
        <h3>{cfg.title}</h3>
      </div>
      <p className="ask-desc">{cfg.desc}</p>

      <div className="ask-input-wrap">
        <textarea
          className="ask-input mono"
          rows={3}
          value={value}
          placeholder={cfg.placeholder}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        />
        <button
          className="ask-send"
          onClick={() => submit()}
          disabled={state === 'thinking' || !value.trim()}
          aria-label="Ask"
        >
          <Icon name="send" size={15} />
        </button>
      </div>

      <div className="suggest">
        {cfg.suggestions.map(s => (
          <button key={s} className="chip" onClick={() => submit(s)}>{s}</button>
        ))}
      </div>

      {state === 'thinking' && (
        <div className="answer fade-in">
          <div className="answer-head">
            <Icon name="ai" size={14} className="live" />
            <span>{searchingLabel}</span>
          </div>
          <div className="answer-body" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)' }}>
            <span className="typing"><span /><span /><span /></span>
            <span style={{ fontSize: 12.5 }}>Retrieving &amp; summarizing relevant {cfg.sourceNoun}…</span>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="answer fade-in">
          <div className="answer-head" style={{ color: 'var(--red)' }}>
            <Icon name="alert" size={14} />
            <span>REQUEST FAILED</span>
          </div>
          <div className="answer-body" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            {errorMsg ?? 'Could not reach the backend. Is it running?'}
          </div>
        </div>
      )}

      {state === 'answered' && answer && <AnswerCard answer={answer} cfg={cfg} />}
    </aside>
  )
}
