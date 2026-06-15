// ---------------------------------------------------------------------------
// Aviation Intelligence API client
// All backend calls go through here. BASE_URL defaults to localhost:3001
// and can be overridden via VITE_API_URL in .env for staging/production.
// ---------------------------------------------------------------------------
import type { Metric, Topic, Forum, Answer } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status} ${path}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status} ${path}`)
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Response shapes from the backend (may include extra fields vs. frontend types)
// ---------------------------------------------------------------------------
export interface ApiTopic extends Omit<Topic, 'id'> {
  id: number
  updatedAt: string
}

export interface ApiForum extends Forum {
  id: number
  url: string
  scraperType: string
  enabled: boolean
}

export interface ScraperRunEntry {
  id: number
  forumId: number
  forumName: string
  startedAt: string
  completedAt: string | null
  itemsCollected: number
  status: 'running' | 'ok' | 'warn' | 'err'
  error: string | null
}

export interface ApiScraper {
  id: number
  name: string
  url: string
  code: string
  status: 'healthy' | 'degraded' | 'down'
  lastRun: string
  lastRunAbs: string
  items: number
  avg: number
  rate: number
  history: number[]
}

export interface ApiLogEntry {
  time: string
  level: 'ok' | 'warn' | 'err'
  src: string
  msg: string
}

export interface NewForumPayload {
  name: string
  handle: string
  url: string
  scraperType: string
  scraperConfig?: Record<string, unknown>
}

export interface ApiRelease {
  id: number
  source: string        // e.g. 'FAA'
  category: string      // 'Safety' | 'Regulation' | 'Industry'
  doc: string           // docRef or externalId
  headline: string
  url: string | null
  time: string          // "32 min ago"
  date: string          // "2026-06-12 13:30 UTC"
  summary: string
  jurisdiction: string
  effective: string
}

// ---------------------------------------------------------------------------
// API namespaces
// ---------------------------------------------------------------------------
export const api = {
  community: {
    metrics: () => get<{ metrics: Metric[] }>('/api/metrics/community'),
    topics:  () => get<{ topics: ApiTopic[] }>('/api/topics'),
    forums:  () => get<{ forums: ApiForum[] }>('/api/forums'),
    ask:     (query: string) =>
      post<{ answer: Answer; sourceCount: number }>('/api/ask/community', { query }),
  },

  scraper: {
    status: () => get<{ scrapers: ApiScraper[] }>('/api/scraper/status'),
    runs:   (limit = 20) => get<{ runs: ScraperRunEntry[]; log: ApiLogEntry[] }>(`/api/scraper/runs?limit=${limit}`),
    runAll: () => post<{ message: string }>('/api/scraper/run-all', {}),
    runOne: (forumId: number) => post<{ message: string }>(`/api/scraper/run/${forumId}`, {}),
  },

  health: {
    metrics: () => get<{ metrics: Metric[] }>('/api/metrics/health'),
  },

  forums: {
    list:   () => get<{ forums: ApiForum[] }>('/api/forums'),
    add:    (data: NewForumPayload) => post<{ forum: ApiForum }>('/api/forums', data),
    toggle: (id: number, enabled: boolean) =>
      post<{ forum: ApiForum }>(`/api/forums/${id}`, { enabled }),
  },

  dashboard: {
    metrics:  () => get<{ metrics: import('../types').Metric[] }>('/api/metrics/dashboard'),
    releases: (limit = 20) => get<{ releases: ApiRelease[] }>(`/api/releases?limit=${limit}`),
    ask:      (query: string) =>
      post<{ answer: import('../types').Answer; sourceCount: number }>('/api/ask/press', { query }),
  },
}
