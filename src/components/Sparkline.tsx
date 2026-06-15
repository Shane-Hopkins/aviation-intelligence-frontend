interface SparklineProps {
  data: number[]
  w?: number
  h?: number
  color?: string
}

export default function Sparkline({ data, w = 132, h = 40, color = 'var(--steel)' }: SparklineProps) {
  const min = Math.min(...data, 85)
  const max = 100
  const range = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3])
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = line + ` L${w} ${h} L0 ${h} Z`
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
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill={color} fillOpacity="0.2" />
    </svg>
  )
}
