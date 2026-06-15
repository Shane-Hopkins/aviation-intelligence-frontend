export interface Metric {
  label: string
  value: string
  trend?: string
  trendDir?: 'up' | 'flat' | 'down'
  foot: string
  icon: string
}

export interface Release {
  id: number
  source: string
  category: string
  doc: string
  headline: string
  time: string
  date: string
  summary: string
  jurisdiction: string
  effective: string
}

export interface AnswerParagraph {
  text: string
  cites?: string[]
  tail?: string
  cites2?: string[]
}

export interface AnswerSource {
  num: string
  label: string
  src: string
}

export interface Answer {
  paragraphs: AnswerParagraph[]
  sources: AnswerSource[]
}

export interface AskRoute {
  kw: string
  key: string
}

export interface AskConfig {
  title: string
  desc: string
  placeholder: string
  sourceNoun: string
  sourcesLabel: string
  defaultKey: string
  routes: AskRoute[]
  suggestions: string[]
  answers: Record<string, Answer>
}

export interface Topic {
  id: string
  title: string
  doc: string
  url?: string | null
  posts: string
  forums: number
  pos: number
  neu: number
  neg: number
  net: number
  label: string
  tone: 'pos' | 'neu' | 'neg'
  theme: string
  top: string[]
}

export interface Forum {
  name: string
  handle: string
  posts: string
  net: number
  tone: 'pos' | 'neu' | 'neg'
  status: 'healthy' | 'degraded' | 'down'
}

export interface Scraper {
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

export interface LogEntry {
  time: string
  level: 'ok' | 'warn' | 'err'
  src: string
  msg: string
}

export interface AppData {
  lastScrape: string
  metrics: Metric[]
  releases: Release[]
  askConfigs: {
    press: AskConfig
    sentiment: AskConfig
  }
  forumStats: Metric[]
  topics: Topic[]
  forums: Forum[]
  scrapers: Scraper[]
  healthSummary: Metric[]
  logs: LogEntry[]
}
