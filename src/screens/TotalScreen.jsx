import { useState } from 'react'
import Section from '../components/Section.jsx'
import GroupBreakdown from '../components/GroupBreakdown.jsx'
import { useData } from '../data/DataProvider.jsx'
import { studyStats, comboBreakdown, sumMinutes } from '../utils/aggregate.js'
import { formatMinutes, formatDateLabel } from '../utils/date.js'

const GROUPS = [
  { field: 'subject', label: '教科別' },
  { field: 'material', label: '教材別' },
  { field: 'activity', label: '活動内容別' },
]

// 「分析」タブの累計ビュー(旧・総計画面)。
export default function TotalView() {
  const { records, loading } = useData()
  const [field, setField] = useState('subject')
  const stats = studyStats(records)
  const combos = comboBreakdown(records)
  const comboTotal = sumMinutes(records)

  return (
    <>
      {/* 総勉強時間 */}
      <section className="panel px-5 py-6 text-center">
        <p className="text-xs tracking-wide text-hud-dim">これまでの総勉強時間</p>
        <p className="font-digit text-glow mt-1.5 text-4xl font-bold leading-none text-cyan">
          {formatMinutes(stats.totalMin)}
        </p>
        {stats.firstDate && (
          <p className="mt-2.5 text-[11px] text-hud-faint">
            {formatDateLabel(stats.firstDate)} 〜 {formatDateLabel(stats.lastDate)}
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden border-t border-line pt-4">
          <Stat label="記録数" value={`${stats.count}件`} />
          <Stat label="勉強した日数" value={`${stats.days}日`} />
          <Stat label="1日あたり" value={formatMinutes(stats.avgPerDayMin)} />
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-hud-faint">読み込み中…</p>
      ) : stats.totalMin === 0 ? (
        <p className="panel px-4 py-8 text-center text-sm text-hud-faint">まだ記録がありません。</p>
      ) : (
        <>
          <Section title="内訳">
            <div className="segmented mb-4">
              {GROUPS.map((g) => (
                <button
                  key={g.field}
                  type="button"
                  aria-pressed={field === g.field}
                  onClick={() => setField(g.field)}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <GroupBreakdown records={records} field={field} centerTop="累計" showCount />
          </Section>

          <Section title="教科・教材・活動内容 の組み合わせ">
            <ul className="flex flex-col">
              {combos.map((c) => (
                <li
                  key={`${c.subject}/${c.material}/${c.activity}`}
                  className="flex items-center gap-2 border-b border-line py-2.5 text-sm last:border-b-0 last:pb-0 first:pt-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-hud">
                      {[c.subject, c.material, c.activity].filter(Boolean).join('・')}
                    </span>
                    <span className="text-[11px] text-hud-faint">{c.count}件</span>
                  </span>
                  <span className="font-digit shrink-0 text-hud-dim">
                    {formatMinutes(c.minutes)}
                  </span>
                  <span className="font-digit w-10 shrink-0 text-right text-hud-faint">
                    {comboTotal > 0 ? Math.round((c.minutes / comboTotal) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}
    </>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[11px] text-hud-dim">{label}</p>
      <p className="font-digit mt-0.5 text-sm font-bold text-hud">{value}</p>
    </div>
  )
}
