# Aviation Intelligence — Logo handoff

Direction: **Runway** — the wordmark's underline starts as a runway and lifts into a flight path, ending in a waypoint node. The node-and-climb is distilled into a compact mark for icons, avatars and favicons.

## Assets (`/assets`)
- `logo-mark.svg` — mark only, brand blue (`#2563EB`). Use on light backgrounds.
- `logo-mark-white.svg` — mark only, white. Use inside the icon or on dark.
- `favicon.svg` — gradient squircle + white mark. App icon / favicon / social avatar.
- `icon-navy.svg` — navy squircle variant.
- `logo-lockup.svg` — horizontal lockup (mark + wordmark + tagline).

All are vector and recolor by editing the `stroke`/`fill` (mark) or gradient stops (`#3B82F6 → #4F46E5`).

## Colors
- Primary blue: `#3B82F6`  ·  Indigo: `#4F46E5`  (icon gradient = `linear-gradient(135deg, #3B82F6, #4F46E5)`)
- Mark on light: `#2563EB`  ·  on dark: `#60A5FA`
- Ink: `#0F172A`  ·  Muted: `#64748B`  ·  Hairline: `#E2E8F0`  ·  Surface: `#F8FAFC`

## Type
- Wordmark: **Space Grotesk** 600, letter-spacing `-0.02em`.
- Tagline / data labels: **Space Mono** 400, uppercase, letter-spacing `0.14em–0.28em`.
- `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');`

## Favicon wiring
```html
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
```
For PNG fallbacks (16/32/180/512), render `favicon.svg` at those sizes — geometry is tuned to stay legible at 16px (flat runway + climb + node).

## Inline mark (copy-paste)
```html
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Aviation Intelligence">
  <path d="M5 22 L14 22 C 20 22, 22 17, 26 8" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="26" cy="8" r="3.4" fill="currentColor"/>
  <circle cx="5" cy="22" r="2" fill="currentColor" fill-opacity=".5"/>
</svg>
```
Uses `currentColor`, so it inherits text color. Wrap in the gradient squircle for the icon:
```html
<span style="display:inline-flex;width:40px;height:40px;border-radius:11px;
  background:linear-gradient(135deg,#3B82F6,#4F46E5);align-items:center;justify-content:center;color:#fff">
  <!-- mark svg here -->
</span>
```

## Notes
- Keep the waypoint node (the dot) — it differentiates the mark from a generic swoosh.
- Don't stretch the gradient angle; keep 135°.
- Clear space around the lockup ≈ the height of the mark on all sides.
- Full visual reference: open `Aviation Intelligence Logo — Runway.dc.html`.
