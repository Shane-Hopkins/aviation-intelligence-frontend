import type { AppData } from './types'

// ---------------------------------------------------------------------------
// Mock data — replace with real API calls in production.
// Shapes are documented by example; see types.ts for the full interfaces.
// ---------------------------------------------------------------------------

const data: AppData = {
  lastScrape: '2026-06-12 14:02 UTC',

  metrics: [
    { label: 'Total releases scraped', value: '18,432', trend: '16,204 with full text', trendDir: 'up', foot: 'all time', icon: 'doc' },
    { label: 'Sources live', value: '11 / 12', trend: '1 degraded', trendDir: 'flat', foot: 'monitored feeds', icon: 'globe' },
    { label: 'New last 24 h', value: '47', trend: '214 this week', trendDir: 'up', foot: 'recently scraped', icon: 'spark' },
    { label: 'Scrape success rate', value: '98.6%', trend: '2 fails (24h)', trendDir: 'flat', foot: 'trailing 24h', icon: 'check' },
  ],

  releases: [
    {
      id: 1, source: 'FAA', category: 'Safety', doc: 'AD-2026-12-08',
      headline: 'Airworthiness Directive: main rotor gearbox inspection for Bell 429 helicopters',
      time: '32 min ago', date: '2026-06-12 13:30 UTC',
      summary: 'The FAA mandates repetitive ultrasonic inspections of the main rotor gearbox housing on all Bell 429 helicopters following three reports of hairline cracking. Operators must comply within the next 25 flight hours.',
      jurisdiction: 'United States', effective: '2026-06-26',
    },
    {
      id: 2, source: 'EASA', category: 'Regulation', doc: 'EASA-NPA-2026-04',
      headline: 'Proposed rule expands beyond-visual-line-of-sight drone operations in controlled airspace',
      time: '1 hr ago', date: '2026-06-12 12:55 UTC',
      summary: 'EASA opened consultation on a framework permitting BVLOS drone flights above 120m in Class C airspace, contingent on certified detect-and-avoid systems. Comment period runs through September.',
      jurisdiction: 'European Union', effective: 'Consultation',
    },
    {
      id: 3, source: 'Transport Canada', category: 'Industry', doc: 'TC-CASA-2026-117',
      headline: 'Transport Canada certifies first hydrogen-electric powertrain for regional aircraft',
      time: '2 hr ago', date: '2026-06-12 11:48 UTC',
      summary: 'A supplemental type certificate was granted for a 1.8MW hydrogen fuel-cell powertrain retrofit on the Dash 8-300, clearing the design for revenue service trials beginning Q4 2026.',
      jurisdiction: 'Canada', effective: '2026-06-11',
    },
    {
      id: 4, source: 'FAA', category: 'Regulation', doc: 'FAA-2026-0944',
      headline: 'Final rule updates pilot rest requirements for supplemental cargo operations',
      time: '3 hr ago', date: '2026-06-12 10:30 UTC',
      summary: 'The FAA aligned Part 121 supplemental cargo crew rest rules with passenger operations, introducing a minimum 10-hour rest period. Carriers have 12 months to update scheduling systems.',
      jurisdiction: 'United States', effective: '2027-06-12',
    },
    {
      id: 5, source: 'EASA', category: 'Safety', doc: 'EASA-SIB-2026-09',
      headline: 'Safety bulletin highlights lithium battery thermal events in cargo holds',
      time: '5 hr ago', date: '2026-06-12 08:55 UTC',
      summary: 'EASA issued a non-mandatory safety information bulletin urging operators to review fire-suppression coverage for bulk lithium shipments after two contained thermal runaway incidents this quarter.',
      jurisdiction: 'European Union', effective: 'Advisory',
    },
    {
      id: 6, source: 'Transport Canada', category: 'Safety', doc: 'TC-AD-CF-2026-22',
      headline: 'Directive grounds select De Havilland fleet pending fuel line replacement',
      time: '7 hr ago', date: '2026-06-12 06:40 UTC',
      summary: 'Transport Canada ordered temporary grounding of 14 affected DHC-6 Twin Otters until chafed fuel supply lines near the firewall are inspected and replaced under an emergency directive.',
      jurisdiction: 'Canada', effective: '2026-06-12',
    },
  ],

  askConfigs: {
    press: {
      title: 'Ask the data',
      desc: 'Query 18,432 press releases in natural language. Answers cite the source documents they draw from.',
      placeholder: 'What are the latest FAA changes affecting helicopters?',
      sourceNoun: 'documents',
      sourcesLabel: 'Cited sources',
      defaultKey: 'helicopter',
      routes: [{ kw: 'helicopter|rotor|429|bell', key: 'helicopter' }],
      suggestions: [
        'What are the latest FAA changes affecting helicopters?',
        'Summarize this week\'s safety directives',
        'Which new rules take effect in 2027?',
      ],
      answers: {
        helicopter: {
          paragraphs: [
            { text: 'Two recent FAA actions directly affect helicopter operators. The most significant is an emergency airworthiness directive requiring repetitive ultrasonic inspection of the main rotor gearbox on the Bell 429 after reports of housing cracks ', cites: ['AD-2026-12-08'], tail: ', with compliance required inside 25 flight hours.' },
            { text: 'The FAA also finalized updated crew rest rules ', cites: ['FAA-2026-0944'], tail: ', which apply to rotorcraft flown under supplemental cargo operations. No new EASA or Transport Canada rotorcraft rules were published in the last 30 days.' },
          ],
          sources: [
            { num: 'AD-2026-12-08', label: 'Bell 429 main rotor gearbox inspection', src: 'FAA' },
            { num: 'FAA-2026-0944', label: 'Supplemental cargo crew rest rule', src: 'FAA' },
          ],
        },
        default: {
          paragraphs: [
            { text: 'Across all monitored sources in the last 24 hours, safety actions dominate. The highest-priority item is an FAA emergency directive on the Bell 429 rotor gearbox ', cites: ['AD-2026-12-08'], tail: ', followed by a Transport Canada grounding of select Twin Otters over fuel-line chafing ' },
            { text: '', cites: ['TC-AD-CF-2026-22'], tail: '. On the regulatory side, EASA opened consultation on BVLOS drone operations in controlled airspace ' },
            { text: '', cites: ['EASA-NPA-2026-04'], tail: ', and Transport Canada certified the first hydrogen-electric powertrain for a regional aircraft type ', cites2: ['TC-CASA-2026-117'] },
          ],
          sources: [
            { num: 'AD-2026-12-08', label: 'Bell 429 main rotor gearbox inspection', src: 'FAA' },
            { num: 'TC-AD-CF-2026-22', label: 'DHC-6 fuel line grounding directive', src: 'Transport Canada' },
            { num: 'EASA-NPA-2026-04', label: 'BVLOS drone operations consultation', src: 'EASA' },
          ],
        },
      },
    },

    sentiment: {
      title: 'Ask the community',
      desc: 'Query 142k forum posts in natural language. Answers cite the discussion threads behind each sentiment read.',
      placeholder: 'How is the pilot community reacting to the Bell 429 directive?',
      sourceNoun: 'discussions',
      sourcesLabel: 'Referenced threads',
      defaultKey: 'bell429',
      routes: [
        { kw: 'bell|429|helicopter|rotor|gearbox', key: 'bell429' },
        { kw: 'drone|bvlos|uas|unmanned', key: 'drone' },
      ],
      suggestions: [
        'How is the pilot community reacting to the Bell 429 directive?',
        'What\'s sentiment on the BVLOS drone rules?',
        'Which topic is most controversial this week?',
      ],
      answers: {
        bell429: {
          paragraphs: [
            { text: 'Reaction to the Bell 429 gearbox directive is sharply negative — concern dominates roughly 57% of 1,840 posts across rotorcraft forums ', cites: ['PPRuNe #88421'], tail: '. The discussion centers on unscheduled downtime and the tight 25-flight-hour compliance window rather than the engineering itself.' },
            { text: 'Sentiment is most negative on professional pilot boards, while general-aviation forums skew neutral ', cites: ['Rotorheads #12044'], tail: '. A vocal minority welcomes the proactive inspection given the crack reports.' },
          ],
          sources: [
            { num: 'PPRuNe #88421', label: 'Bell 429 MGB AD — operators\' thread', src: 'PPRuNe' },
            { num: 'Rotorheads #12044', label: '429 gearbox cracks — discussion', src: 'Rotorheads' },
          ],
        },
        drone: {
          paragraphs: [
            { text: 'BVLOS consultation sentiment is net positive (+30) across 920 posts; commercial drone operators are optimistic about expanded Class C access ', cites: ['Reddit #4471'], tail: '.' },
            { text: 'Skepticism concentrates on detect-and-avoid certification cost and timeline ', cites: ['PPRuNe #88533'], tail: ', with several manned-aviation posters raising deconfliction concerns.' },
          ],
          sources: [
            { num: 'Reddit #4471', label: 'r/drones — EASA BVLOS megathread', src: 'Reddit r/drones' },
            { num: 'PPRuNe #88533', label: 'BVLOS in controlled airspace — debate', src: 'PPRuNe' },
          ],
        },
        default: {
          paragraphs: [
            { text: 'This week the community is most energized by the hydrogen-electric Dash 8 certification, which carries the strongest positive sentiment (+64) ', cites: ['Airliners #20933'], tail: ' — optimism about regional decarbonization outweighs range skepticism.' },
            { text: 'The most negative reaction is to the Bell 429 gearbox directive (−45), driven by downtime concerns ', cites: ['PPRuNe #88421'], tail: ', followed by the lithium-battery cargo bulletin (−15).' },
          ],
          sources: [
            { num: 'Airliners #20933', label: 'Hydrogen Dash 8 STC — reaction thread', src: 'Airliners.net' },
            { num: 'PPRuNe #88421', label: 'Bell 429 MGB AD — operators\' thread', src: 'PPRuNe' },
          ],
        },
      },
    },
  },

  forumStats: [
    { label: 'Forums monitored', value: '24', trend: '+3', trendDir: 'up', foot: 'communities', icon: 'globe' },
    { label: 'Posts analyzed (7d)', value: '142,380', trend: '+9.4%', trendDir: 'up', foot: 'deduplicated', icon: 'doc' },
    { label: 'Net sentiment', value: '+18', trend: '+4 wk/wk', trendDir: 'up', foot: 'slightly positive', icon: 'spark' },
    { label: 'Active discussions', value: '1,247', trend: '312 new', trendDir: 'up', foot: 'tracked threads', icon: 'health' },
  ],

  topics: [
    { id: 't1', title: 'Bell 429 main rotor gearbox AD', doc: 'AD-2026-12-08', posts: '1,840', forums: 6, pos: 12, neu: 31, neg: 57, net: -45, label: 'Concerned', tone: 'neg', theme: 'Unscheduled downtime & 25-hr compliance window', top: ['PPRuNe', 'Rotorheads', 'r/aviation'] },
    { id: 't2', title: 'Hydrogen-electric Dash 8 certification', doc: 'TC-CASA-2026-117', posts: '1,210', forums: 5, pos: 71, neu: 22, neg: 7, net: 64, label: 'Very positive', tone: 'pos', theme: 'Optimism on regional decarbonization', top: ['Airliners.net', 'r/aviation', 'PPRuNe'] },
    { id: 't3', title: 'EASA BVLOS drone consultation', doc: 'EASA-NPA-2026-04', posts: '920', forums: 4, pos: 48, neu: 34, neg: 18, net: 30, label: 'Positive', tone: 'pos', theme: 'Expanded Class C access vs. detect-and-avoid cost', top: ['r/drones', 'PPRuNe'] },
    { id: 't4', title: 'Part 121 cargo crew rest rule', doc: 'FAA-2026-0944', posts: '640', forums: 4, pos: 38, neu: 29, neg: 33, net: 5, label: 'Mixed', tone: 'neu', theme: 'Scheduling impact debate among cargo crews', top: ['PPRuNe', 'Pilots of America'] },
    { id: 't5', title: 'Lithium battery cargo fire bulletin', doc: 'EASA-SIB-2026-09', posts: '510', forums: 3, pos: 22, neu: 41, neg: 37, net: -15, label: 'Concerned', tone: 'neg', theme: 'Suppression coverage adequacy', top: ['PPRuNe', 'Airliners.net'] },
  ],

  forums: [
    { name: 'PPRuNe', handle: 'pprune.org', posts: '38.2k', net: 6, tone: 'neu', status: 'healthy' },
    { name: 'Reddit r/aviation', handle: 'r/aviation', posts: '41.7k', net: 22, tone: 'pos', status: 'healthy' },
    { name: 'Reddit r/flying', handle: 'r/flying', posts: '22.1k', net: 15, tone: 'pos', status: 'healthy' },
    { name: 'Airliners.net', handle: 'airliners.net', posts: '14.6k', net: 28, tone: 'pos', status: 'healthy' },
    { name: 'Rotorheads', handle: 'pprune · rotor', posts: '6.8k', net: -22, tone: 'neg', status: 'healthy' },
    { name: 'Pilots of America', handle: 'pilotsofamerica.com', posts: '9.3k', net: 9, tone: 'neu', status: 'degraded' },
    { name: 'StuckMic (ATC)', handle: 'stuckmic.com', posts: '3.1k', net: 4, tone: 'neu', status: 'healthy' },
    { name: 'Reddit r/drones', handle: 'r/drones', posts: '6.5k', net: 33, tone: 'pos', status: 'healthy' },
  ],

  scrapers: [
    { name: 'FAA — Dynamic Reg. System', url: 'faa.gov/regulations', code: 'FAA', status: 'healthy', lastRun: '4 min ago', lastRunAbs: '14:02 UTC', items: 47, avg: 41, rate: 99.4, history: [98, 99, 100, 97, 99, 100, 98, 99, 100, 99, 99, 100] },
    { name: 'EASA — Publications', url: 'easa.europa.eu/publications', code: 'EASA', status: 'healthy', lastRun: '6 min ago', lastRunAbs: '14:00 UTC', items: 31, avg: 28, rate: 98.9, history: [97, 99, 98, 100, 99, 98, 100, 99, 97, 99, 100, 99] },
    { name: 'Transport Canada — CASA', url: 'tc.canada.ca/aviation', code: 'TC', status: 'degraded', lastRun: '38 min ago', lastRunAbs: '13:28 UTC', items: 12, avg: 22, rate: 91.2, history: [99, 98, 100, 97, 95, 93, 96, 90, 88, 92, 89, 91] },
    { name: 'Boeing — Media Room', url: 'boeing.com/mediaroom', code: 'BA', status: 'healthy', lastRun: '9 min ago', lastRunAbs: '13:57 UTC', items: 8, avg: 6, rate: 100, history: [100, 99, 100, 100, 98, 100, 99, 100, 100, 99, 100, 100] },
    { name: 'Airbus — Newsroom', url: 'airbus.com/newsroom', code: 'AB', status: 'healthy', lastRun: '11 min ago', lastRunAbs: '13:55 UTC', items: 6, avg: 7, rate: 99.7, history: [99, 100, 98, 99, 100, 99, 100, 98, 99, 100, 99, 100] },
    { name: 'ICAO — Newsroom', url: 'icao.int/newsroom', code: 'ICAO', status: 'down', lastRun: '3 hr ago', lastRunAbs: '11:06 UTC', items: 0, avg: 4, rate: 0, history: [98, 99, 97, 100, 99, 98, 99, 80, 40, 0, 0, 0] },
  ],

  healthSummary: [
    { label: 'Pipeline uptime', value: '99.2%', foot: 'trailing 30 days', icon: 'check' },
    { label: 'Runs today', value: '284', foot: 'across 12 sources', icon: 'refresh' },
    { label: 'Avg. scrape latency', value: '1.8s', foot: 'per document', icon: 'clock' },
    { label: 'Failed runs (24h)', value: '4', foot: '1 source down', icon: 'alert' },
  ],

  logs: [
    { time: '14:02 UTC', level: 'ok', src: 'FAA', msg: 'Run complete — 47 documents collected, 47 summarized' },
    { time: '14:00 UTC', level: 'ok', src: 'EASA', msg: 'Run complete — 31 documents collected, 31 summarized' },
    { time: '13:57 UTC', level: 'ok', src: 'Boeing', msg: 'Run complete — 8 documents collected' },
    { time: '13:28 UTC', level: 'warn', src: 'Transport Canada', msg: 'Partial run — 6 documents timed out, retry scheduled' },
    { time: '11:06 UTC', level: 'err', src: 'ICAO', msg: 'Run failed — connection refused, endpoint returned 503' },
    { time: '10:42 UTC', level: 'ok', src: 'Airbus', msg: 'Run complete — 6 documents collected, 6 summarized' },
  ],
}

export default data
