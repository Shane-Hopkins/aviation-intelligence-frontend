interface IconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
}

export default function Icon({ name, size = 16, stroke = 1.6, className }: IconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }
  switch (name) {
    case 'dashboard':
      return <svg {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
    case 'health':
      return <svg {...p}><path d="M3 12h4l2 5 4-13 2 8h6"/></svg>
    case 'pulse':
      return <svg {...p}><path d="M21 11.5a8.5 8.5 0 1 1-3.6-6.9"/><path d="M8 12l2.5 2.5L15 9"/></svg>
    case 'doc':
      return <svg {...p}><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 3h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 13h6M9 17h4"/></svg>
    case 'globe':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>
    case 'spark':
      return <svg {...p}><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></svg>
    case 'check':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.2 2.2 4.5-4.8"/></svg>
    case 'send':
      return <svg {...p} strokeWidth="1.8"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
    case 'refresh':
      return <svg {...p}><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v4h-4"/></svg>
    case 'clock':
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case 'alert':
      return <svg {...p}><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>
    case 'arrow':
      return <svg {...p}><path d="M7 17L17 7M9 7h8v8"/></svg>
    case 'chevron':
      return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>
    case 'ai':
      return <svg {...p} strokeWidth="1.5"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>
    default:
      return null
  }
}
