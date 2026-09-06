// ドーナツ型の円グラフ(SVG 自前描画。外部ライブラリ不要)。
//   data: [{ key, minutes, color }] を想定(minutes が値、色は各行)
//   中央に合計などを表示できる。
export default function PieChart({
  data = [],
  size = 176,
  thickness = 26,
  centerTop = null,
  centerMain = null,
}) {
  const total = data.reduce((s, d) => s + (d.minutes || 0), 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2

  // 累積割合(0〜100)。stroke-dasharray で弧を描く。
  let acc = 0
  const slices = data
    .filter((d) => (d.minutes || 0) > 0)
    .map((d) => {
      const pct = total > 0 ? (d.minutes / total) * 100 : 0
      const slice = { color: d.color || 'var(--color-hud-faint)', pct, offset: acc }
      acc += pct
      return slice
    })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="教科別の割合"
    >
      {/* 背景トラック */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth={thickness}
      />

      {/* 各スライス。12時方向から時計回りに並べる */}
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            pathLength={100}
            strokeDasharray={`${Math.max(0, s.pct - 0.6)} ${100 - Math.max(0, s.pct - 0.6)}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </g>

      {(centerTop || centerMain) && (
        <>
          {centerTop && (
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              style={{ fill: 'var(--color-hud-dim)', fontSize: 11 }}
            >
              {centerTop}
            </text>
          )}
          {centerMain && (
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              style={{
                fill: 'var(--color-hud)',
                fontSize: 18,
                fontFamily: 'var(--font-digit)',
                fontWeight: 700,
              }}
            >
              {centerMain}
            </text>
          )}
        </>
      )}
    </svg>
  )
}
