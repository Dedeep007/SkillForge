interface Props {
  current: number
  total: number
  label: string
}

export default function ProgressBar({ current, total, label }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted mb-2 font-mono">
        <span>{label}</span>
        <span>{current}/{total}</span>
      </div>
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}
