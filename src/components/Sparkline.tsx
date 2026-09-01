// Score sentinel: 50 means "no data yet" (never ran). Real scores are 0, 40, 70, or 100.
const NO_DATA = 50

interface SparklineProps {
  data: number[]
  w?: number
  h?: number
  color?: string
}

export default function Sparkline({ data, w = 132, h = 40, color = 'var(--steel)' }: SparklineProps) {
  // Only consider real data points for the Y scale floor
  const realValues = data.filter(v => v !== NO_DATA)
  const min = realValues.length > 0 ? Math.min(...realValues, 85) : 85
  const max = 100
  const range = max - min || 1
  const step = w / (data.length - 1)

  // Map each point to SVG coords. No-data points sit at the mid-line visually.
  const rawMidY = h - ((70 - min) / range) * (h - 6) - 3
  const midY = Math.max(3, Math.min(h - 3, rawMidY))  // clamp within chart bounds
  const pts = data.map((v, i) => {
    const y = v === NO_DATA
      ? midY
      : h - ((v - min) / range) * (h - 6) - 3
    return { x: i * step, y, noData: v === NO_DATA }
  })

  // Build two separate paths: real data (colored) and no-data segments (gray dashed)
  let realPath = ''
  let grayPath = ''
  pts.forEach((p, i) => {
    const cmd = i === 0 || (pts[i - 1].noData !== p.noData) ? 'M' : 'L'
    const seg = `${cmd}${p.x.toFixed(1)} ${p.y.toFixed(1)} `
    if (p.noData) grayPath += seg
    else realPath += seg
  })

  // Area fill only under the real-data portion
  const realPts = pts.filter(p => !p.noData)
  const area = realPts.length >= 2
    ? realPts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ')
      + ` L${realPts[realPts.length - 1].x.toFixed(1)} ${h} L${realPts[0].x.toFixed(1)} ${h} Z`
    : ''

  const gid = 'g' + Math.round(min) + data.length + Math.round(data[0])
  const last = pts[pts.length - 1]

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#${gid})`} />}
      {grayPath && (
        <path d={grayPath} fill="none" stroke="var(--border)" strokeWidth="1.4"
          strokeDasharray="3 3" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {realPath && (
        <path d={realPath} fill="none" stroke={color} strokeWidth="1.6"
          strokeLinejoin="round" strokeLinecap="round" />
      )}
      <circle cx={last.x} cy={last.y} r="2.6" fill={last.noData ? 'var(--border)' : color} />
      <circle cx={last.x} cy={last.y} r="4.5" fill={last.noData ? 'var(--border)' : color} fillOpacity="0.2" />
    </svg>
  )
}
