import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import Section from '../components/Section.jsx'
import BarChart from '../components/BarChart.jsx'
import GroupBreakdown from '../components/GroupBreakdown.jsx'
import { useData } from '../data/DataProvider.jsx'
import { comparePeriods } from '../utils/compare.js'
import { formatMinutes, fromDateStr } from '../utils/date.js'

const MODES = [
  { key: 'day', label: '日次' },
  { key: 'week', label: '週次' },
  { key: 'month', label: '月次' },
]

const md = (s) => {
  const d = fromDateStr(s)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
const rangeText = ([a, b]) => (a === b ? md(a) : `${md(a)}–${md(b)}`)

// 「分析」タブの比較ビュー(旧・比較画面)。月次が spec 7.3 の月間サマリーを兼ねる。
export default function CompareView() {
  const { records, loading } = useData()
  const [mode, setMode] = useState('week')
  const c = useMemo(() => comparePeriods(records, mode), [records, mode])

  const up = c.diff > 0
  const flat = c.diff === 0
  const DiffIcon = flat ? Minus : up ? ArrowUp : ArrowDown
  const diffColor = flat ? 'var(--color-hud-dim)' : up ? 'var(--color-cyan)' : 'var(--color-alert)'

  const summary = flat
    ? `${c.curLabel}は${c.prevLabel}と同じ勉強時間です`
    : `${c.curLabel}は${c.prevLabel}より ${formatMinutes(Math.abs(c.diff))} ${up ? '多い' : '少ない'}`

  return (
    <>
      <div className="segmented">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={mode === m.key}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-hud-faint">読み込み中…</p>
      ) : (
        <>
          {/* サマリー + 棒グラフ。分けていた2枚を1枚にまとめる */}
          <section className="panel px-4 py-5">
            <p className="text-center text-sm text-hud">{summary}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <DiffIcon size={18} strokeWidth={2.5} style={{ color: diffColor }} />
              <span className="font-digit text-2xl font-bold" style={{ color: diffColor }}>
                {c.diff > 0 ? '+' : c.diff < 0 ? '−' : '±'}
                {formatMinutes(Math.abs(c.diff))}
              </span>
              {c.prevTotal > 0 && (
                <span className="font-digit text-sm" style={{ color: diffColor }}>
                  ({c.diff > 0 ? '+' : c.diff < 0 ? '−' : ''}
                  {Math.abs(Math.round(c.pct))}%)
                </span>
              )}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <BarChart
                data={[
                  {
                    label: `${c.prevLabel} (${rangeText(c.prev)})`,
                    value: c.prevTotal,
                    display: formatMinutes(c.prevTotal),
                    color: 'var(--color-hud-faint)',
                  },
                  {
                    label: `${c.curLabel} (${rangeText(c.cur)})`,
                    value: c.curTotal,
                    display: formatMinutes(c.curTotal),
                    color: 'var(--color-cyan)',
                  },
                ]}
              />
            </div>
          </section>

          <Section title="教科別の増減">
            {c.subjects.length === 0 ? (
              <p className="py-2 text-center text-sm text-hud-faint">
                どちらの期間も記録がありません。
              </p>
            ) : (
              <ul className="flex flex-col">
                {c.subjects.map((s) => {
                  const sUp = s.diff > 0
                  const sFlat = s.diff === 0
                  return (
                    <li
                      key={s.key}
                      className="flex items-center gap-2 border-b border-line py-2.5 text-sm first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-hud">{s.key}</span>
                      <span className="font-digit shrink-0 text-xs text-hud-faint">
                        {formatMinutes(s.prev)} → {formatMinutes(s.cur)}
                      </span>
                      <span
                        className="font-digit w-16 shrink-0 text-right text-xs"
                        style={{
                          color: sFlat
                            ? 'var(--color-hud-faint)'
                            : sUp
                              ? 'var(--color-cyan)'
                              : 'var(--color-alert)',
                        }}
                      >
                        {sFlat ? '±0' : `${sUp ? '+' : '−'}${formatMinutes(Math.abs(s.diff))}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>

          {c.curTotal > 0 && (
            <Section title={`${c.curLabel}の教科別`}>
              <GroupBreakdown
                records={c.curRecords}
                field="subject"
                centerTop={c.curLabel}
                size={150}
              />
            </Section>
          )}
        </>
      )}
    </>
  )
}
