import { useState, useEffect, useCallback } from 'react'
import MetricCard from '../components/MetricCard'
import Icon from '../components/Icon'
import { api } from '../lib/api'
import type { ApiListing, ApiListingDetail } from '../lib/api'
import type { Metric } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TYPE_FILTERS = [
  { label: 'Turbine', value: 'turbine' },
  { label: 'Piston',  value: 'piston'  },
]

const MAKE_FILTERS = ['Airbus', 'Bell', 'Robinson', 'Sikorsky', 'Leonardo', 'MD Helicopters', 'Enstrom']

const TYPE_COLORS: Record<string, string> = {
  'turbine': 'var(--accent)',
  'piston':  'oklch(0.52 0.12 290)',
}

function typeColor(type: string | null): string {
  return TYPE_COLORS[type ?? ''] ?? 'var(--ink-3)'
}

function typeLabel(type: string | null): string {
  if (!type) return ''
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ---------------------------------------------------------------------------
// ListingCard
// ---------------------------------------------------------------------------
function ListingCard({ listing, active, onClick }: {
  listing: ApiListing
  active: boolean
  onClick: () => void
}) {
  const color = typeColor(listing.aircraftType)

  return (
    <button
      className={'press-card' + (active ? ' active' : '')}
      onClick={onClick}
      style={{ alignItems: 'flex-start' }}
    >
      {listing.imageUrl
        ? <img className="press-card-thumb" src={listing.imageUrl} alt="" loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        : (
          <div className="press-card-thumb-placeholder">
            <Icon name="helicopter" size={18} />
          </div>
        )
      }
      <div className="press-card-body">
        <div className="press-card-meta">
          {listing.aircraftType && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color, background: `color-mix(in srgb, ${color} 12%, transparent)`,
              padding: '2px 7px', borderRadius: 100, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            }}>
              {typeLabel(listing.aircraftType)}
            </span>
          )}
          {listing.location && (
            <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
              <Icon name="globe" size={11} /> {listing.location}
            </span>
          )}
          {listing.totalTime && (
            <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {listing.totalTime} hrs TT
            </span>
          )}
        </div>
        <div className="press-card-headline">{listing.title}</div>
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {listing.price && (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {listing.price}
            </span>
          )}
          {listing.snippet && (
            <span className="press-card-snippet" style={{ flex: 1, marginLeft: listing.price ? 10 : 0 }}>
              {listing.snippet.slice(0, 100)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Image gallery
// ---------------------------------------------------------------------------
function ImageGallery({ images, imageUrl }: { images: string[]; imageUrl: string | null }) {
  const [active, setActive] = useState(0)
  const all = images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
  if (all.length === 0) return null

  return (
    <div style={{ padding: '20px 30px 0' }}>
      <img
        src={all[active]}
        alt=""
        style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, display: 'block' }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {all.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: 52, height: 36, padding: 0, border: `2px solid ${i === active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 4, overflow: 'hidden', cursor: 'pointer', background: 'none', flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rich description renderer — handles ## / ### headings + plain lines
// ---------------------------------------------------------------------------
function DescriptionBlock({ text }: { text: string }) {
  const blocks = text.split('\n\n').filter(Boolean)
  return (
    <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)', marginTop: 20 }}>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          const heading = block.slice(3).split('\n')[0]
          const rest = block.slice(3 + heading.length + 1)
          return (
            <div key={i}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--ink-3)', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 16, marginBottom: 6,
              }}>
                {heading}
              </div>
              {rest && <DescriptionLines text={rest} />}
            </div>
          )
        }
        return <DescriptionLines key={i} text={block} />
      })}
    </div>
  )
}

function DescriptionLines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').filter(Boolean).map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <div key={i} style={{ fontWeight: 600, color: 'var(--ink)', marginTop: 8, marginBottom: 2, fontSize: 13 }}>
              {line.slice(4)}
            </div>
          )
        }
        return <p key={i} style={{ margin: '0 0 4px' }}>{line}</p>
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// ListingDetail
// ---------------------------------------------------------------------------
function ListingDetail({ listing }: { listing: ApiListingDetail | null }) {
  if (!listing) {
    return (
      <div className="press-detail-empty">
        <Icon name="helicopter" size={32} />
        <p>Select a listing to view full details</p>
      </div>
    )
  }

  const color = typeColor(listing.aircraftType)

  const specs = [
    { label: 'Year',         value: listing.year         },
    { label: 'Make',         value: listing.make         },
    { label: 'Model',        value: listing.model        },
    { label: 'Total Time',   value: listing.totalTime ? `${listing.totalTime} hrs` : null },
    { label: 'Serial No.',   value: listing.serialNumber },
    { label: 'Registration', value: listing.registration },
    { label: 'Location',     value: listing.location     },
    { label: 'Type',         value: typeLabel(listing.aircraftType) || null },
  ].filter(s => s.value)

  return (
    <div className="press-detail">
      <ImageGallery images={listing.images ?? []} imageUrl={listing.imageUrl} />
      <div className="press-detail-body">
        {/* Type + location tags */}
        <div className="press-detail-tags">
          {listing.aircraftType && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color, background: `color-mix(in srgb, ${color} 12%, transparent)`,
              padding: '3px 9px', borderRadius: 100, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            }}>
              {typeLabel(listing.aircraftType)}
            </span>
          )}
          {listing.location && (
            <span style={{
              fontSize: 10.5, color: 'var(--ink-3)', background: 'var(--surface-2)',
              padding: '3px 9px', borderRadius: 100, border: '1px solid var(--border)',
            }}>
              {listing.location}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="press-detail-headline">{listing.title}</div>

        {/* Price */}
        {listing.price && (
          <div style={{
            marginTop: 14, padding: '12px 16px', borderRadius: 8,
            background: 'var(--accent-tint)', border: '1px solid oklch(0.55 0.15 264 / 0.2)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="tag" size={14} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {listing.price}
            </span>
          </div>
        )}

        {/* Specs grid */}
        {specs.length > 0 && (
          <div style={{
            marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '8px 16px', fontSize: 13,
          }}>
            {specs.map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}>
                  {s.label}
                </span>
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {listing.description && <DescriptionBlock text={listing.description} />}

        {/* CTA */}
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24,
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            textDecoration: 'none', padding: '8px 16px',
            border: '1px solid var(--accent)', borderRadius: 6,
          }}
        >
          View on AvBuyer <Icon name="arrow" size={13} />
        </a>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11.5, fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent-ink)' : 'var(--ink-2)',
        background: active ? 'var(--accent-tint)' : 'var(--surface-2)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 100, padding: '4px 11px', cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function Listings() {
  const [metrics,    setMetrics]    = useState<Metric[]>([])
  const [listings,   setListings]   = useState<ApiListing[]>([])
  const [total,      setTotal]      = useState(0)
  const [selected,   setSelected]   = useState<ApiListingDetail | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [makeFilter, setMakeFilter] = useState<string | null>(null)

  const loadListings = useCallback(async (type: string | null, make: string | null) => {
    setLoading(true)
    try {
      const { listings: l, total: t } = await api.listings.list({
        limit: 40,
        type:  type ?? undefined,
        make:  make ?? undefined,
      })
      setListings(l)
      setTotal(t)
      setSelected(null)
    } catch {
      // keep empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    api.listings.metrics().then(({ metrics: m }) => setMetrics(m)).catch(() => {})
    loadListings(null, null)
  }, [loadListings])

  function toggleType(type: string) {
    const next = typeFilter === type ? null : type
    setTypeFilter(next)
    loadListings(next, makeFilter)
  }

  function toggleMake(make: string) {
    const next = makeFilter === make ? null : make
    setMakeFilter(next)
    loadListings(typeFilter, next)
  }

  async function selectListing(l: ApiListing) {
    if (selected?.id === l.id) return
    try {
      const { listing } = await api.listings.detail(l.id)
      setSelected(listing)
    } catch {
      setSelected({ ...l, registration: null, description: l.snippet } as ApiListingDetail)
    }
  }

  return (
    <div className="wrap">
      {/* Metrics */}
      <div className="metrics">
        {metrics.map(m => <MetricCard key={m.label} m={m} />)}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
          Helicopters For Sale
          <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--ink-3)', marginLeft: 8, fontFamily: 'IBM Plex Mono, monospace' }}>
            via avbuyer.com
          </span>
        </h2>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {total.toLocaleString()} listings
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', alignSelf: 'center', marginRight: 2 }}>Type:</span>
        {TYPE_FILTERS.map(f => (
          <FilterChip key={f.value} label={f.label} active={typeFilter === f.value} onClick={() => toggleType(f.value)} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--ink-3)', alignSelf: 'center', marginLeft: 8, marginRight: 2 }}>Make:</span>
        {MAKE_FILTERS.map(m => (
          <FilterChip key={m} label={m} active={makeFilter === m} onClick={() => toggleMake(m)} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="press-archive">
        {/* Left — listing cards */}
        <div className="press-list">
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Loading listings…
            </div>
          ) : listings.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No listings found. The scraper may still be running its first pass.
            </div>
          ) : (
            listings.map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                active={selected?.id === l.id}
                onClick={() => selectListing(l)}
              />
            ))
          )}
        </div>

        {/* Right — listing detail */}
        <ListingDetail listing={selected} />
      </div>
    </div>
  )
}
