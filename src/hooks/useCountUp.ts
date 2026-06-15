import { useState, useEffect, useRef } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function groupThousands(s: string): string {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function useCountUp(rawValue: string): string {
  const [display, setDisplay] = useState(rawValue)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const m = rawValue.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/s)
    if (!m) {
      setDisplay(rawValue)
      return
    }
    const [, prefix, numStr, suffix] = m
    const hasComma = numStr.includes(',')
    const dotIdx = numStr.indexOf('.')
    const decimals = dotIdx === -1 ? 0 : numStr.length - dotIdx - 1
    const target = parseFloat(numStr.replace(/,/g, ''))
    if (!isFinite(target)) {
      setDisplay(rawValue)
      return
    }

    function fmt(v: number): string {
      let s = v.toFixed(decimals)
      if (hasComma) {
        const parts = s.split('.')
        parts[0] = groupThousands(parts[0])
        s = parts.join('.')
      }
      return prefix + s + suffix
    }

    const dur = 950
    const start = performance.now()
    setDisplay(fmt(0))

    function tick(now: number) {
      const t = Math.min(1, (now - start) / dur)
      if (t < 1) {
        setDisplay(fmt(target * easeOutCubic(t)))
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(prefix + numStr + suffix)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [rawValue])

  return display
}
