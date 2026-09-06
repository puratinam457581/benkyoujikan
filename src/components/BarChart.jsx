// 期間を並べた棒グラフ(spec 8章)。div ベースで軽量に。
//   data: [{ label, value, display, color }]
export default function BarChart({ data = [], maxHeight = 140 }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="flex items-end justify-center gap-10" style={{ minHeight: maxHeight + 44 }}>
      {data.map((d) => (
        <div key={d.label} className="flex w-20 flex-col items-center gap-1.5">
          <span className="font-digit text-xs font-bold text-hud">{d.display}</span>
          <div className="flex w-full items-end" style={{ height: maxHeight }}>
            <div
              className="w-full rounded-t-sharp"
              style={{
                height: `${Math.max(3, (d.value / max) * 100)}%`,
                backgroundColor: d.color || 'var(--color-cyan)',
              }}
            />
          </div>
          <span className="text-[11px] text-hud-faint">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
