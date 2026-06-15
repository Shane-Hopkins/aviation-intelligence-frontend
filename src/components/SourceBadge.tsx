export default function SourceBadge({ source }: { source: string }) {
  return (
    <span className="badge src">
      <span className="src-dot" />
      {source}
    </span>
  )
}
