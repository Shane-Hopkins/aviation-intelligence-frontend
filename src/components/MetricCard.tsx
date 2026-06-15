import Icon from './Icon'
import { useCountUp } from '../hooks/useCountUp'
import type { Metric } from '../types'

export default function MetricCard({ m }: { m: Metric }) {
  const display = useCountUp(m.value)
  return (
    <div className="metric">
      <div className="metric-top">
        <span className="metric-label">{m.label}</span>
        <span className="metric-ico"><Icon name={m.icon} size={15} /></span>
      </div>
      <div className="metric-val">{display}</div>
      <div className="metric-foot">
        <span className={'trend ' + (m.trendDir ?? 'flat')}>{m.trend}</span>
        <span>{m.foot}</span>
      </div>
    </div>
  )
}
