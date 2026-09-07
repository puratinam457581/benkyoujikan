import { useState } from 'react'
import { Trash2, Check, Plus, Sparkles } from 'lucide-react'
import { useData } from '../data/DataProvider.jsx'
import { comboKey } from '../data/tags.js'
import { subjectRank } from '../data/master.js'
import {
  PRESET_COLORS,
  MATERIAL_ICON_NAMES,
  resolveMaterialStyle,
  iconComponent,
} from '../utils/materialStyle.js'
import { readableTextOn } from '../utils/color.js'

// 教材マスタ(学習管理システム連携)。
// 教科ごとに教材を並べ、色/アイコン・完了フラグ・削除・活動内容の整理を行う。
// 過去ログ出力の「全期間累計」「完了状況」はこのマスタが元になる。
// 削除しても過去の記録は消えない。
export default function MaterialStylesSection() {
  const {
    tags,
    materialStyles,
    master,
    records,
    updateMaterialStyle,
    deleteTag,
    addMaterial,
    setMaterialDone,
    deleteMaterial,
    deleteSubject,
    seedMaterials,
  } = useData()
  const [openId, setOpenId] = useState(null)

  // 教科ごとにまとめる
  const bySubject = new Map()
  for (const it of master.items) {
    if (!bySubject.has(it.subject)) bySubject.set(it.subject, [])
    bySubject.get(it.subject).push(it)
  }
  const subjects = [...bySubject.keys()].sort(
    (a, b) => subjectRank(a) - subjectRank(b) || (a < b ? -1 : a > b ? 1 : 0),
  )

  const hasRecords = (subject, name) =>
    records.some((r) => r.subject === subject && r.material === name)

  return (
    <section className="panel px-4 py-3">
      <p className="text-xs text-hud-dim">教材(学習管理システム連携)</p>
      <p className="mt-1 mb-3 text-[11px] leading-relaxed text-hud-faint">
        色・アイコン、完了フラグ、使わない教材の整理。過去ログ出力の一覧はこの教材マスタが元になります（
        <Trash2 size={11} strokeWidth={2} className="mx-0.5 inline align-[-1px]" />
        で削除しても過去の記録は消えません）。
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="chip"
          onClick={() => {
            const s = prompt('追加する教科名')
            if (s && s.trim()) {
              const m = prompt(`「${s.trim()}」に追加する教材名`)
              if (m && m.trim()) addMaterial(s.trim(), m.trim())
            }
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          教科を追加
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (confirm('学習フェーズの教材（mikan(単語) / でる問1000(文法) / 公式問題集(過去問) / マセマ線形代数 / マセマ微積分 / 編入数学徹底研究 / APG4b）を、未登録ぶんだけ一括で追加します。')) {
              seedMaterials()
            }
          }}
        >
          <Sparkles size={14} strokeWidth={2.5} />
          学習フェーズの教材を一括登録
        </button>
      </div>

      {subjects.length === 0 ? (
        <p className="text-sm text-hud-faint">
          「学習フェーズの教材を一括登録」か「教科を追加」から始めるか、記録を追加すると自動でここに並びます。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {subjects.map((subject) => (
            <div key={subject}>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex-1 truncate text-sm font-semibold text-hud">{subject}</span>
                <button
                  type="button"
                  className="chip px-2 py-1 text-[11px]"
                  onClick={() => {
                    const m = prompt(`「${subject}」に追加する教材名`)
                    if (m && m.trim()) addMaterial(subject, m.trim())
                  }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  教材
                </button>
                <button
                  type="button"
                  aria-label={`教科「${subject}」を削除`}
                  onClick={() => {
                    if (confirm(`教科「${subject}」を削除します。\nぶら下がる教材もまとめて消えます（記録は残ります）。`)) {
                      deleteSubject(subject)
                    }
                  }}
                  className="shrink-0 rounded-sharp border border-line p-1 text-hud-faint hover:text-alert"
                >
                  <Trash2 size={13} strokeWidth={1.75} />
                </button>
              </div>

              <ul className="flex flex-col gap-1">
                {bySubject.get(subject).map((it) => {
                  const { color, iconName } = resolveMaterialStyle(materialStyles, subject, it.name)
                  const Icon = iconComponent(iconName)
                  const open = openId === it.id
                  const ck = comboKey(subject, it.name)
                  const activities = tags.activities?.[ck] || []
                  const status = it.done ? '完了' : hasRecords(subject, it.name) ? '学習中' : '未着手'
                  return (
                    <li key={it.id} className="rounded-sharp border border-line">
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : it.id)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: color }}
                          >
                            <Icon size={15} strokeWidth={2} color={readableTextOn(color)} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-sm ${it.done ? 'text-hud-faint line-through' : 'text-hud'}`}
                            >
                              {it.name}
                            </span>
                            <span className="block text-[11px] text-hud-faint">{status}</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          aria-label={it.done ? '完了を解除' : '完了にする'}
                          onClick={() => setMaterialDone(it.id, !it.done)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sharp border ${
                            it.done ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line text-hud-faint'
                          }`}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : it.id)}
                          className="shrink-0 text-[11px] text-hud-faint"
                        >
                          {open ? '閉じる' : '色/削除'}
                        </button>
                      </div>

                      {open && (
                        <div className="border-t border-line px-2.5 py-3">
                          <p className="field-label mb-1.5">色</p>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                aria-label={`色 ${c}`}
                                aria-pressed={c.toLowerCase() === color.toLowerCase()}
                                onClick={() =>
                                  updateMaterialStyle(subject, it.name, { color: c, icon: iconName })
                                }
                                className="h-8 w-8 rounded-sharp"
                                style={{
                                  backgroundColor: c,
                                  boxShadow:
                                    c.toLowerCase() === color.toLowerCase()
                                      ? '0 0 0 2px var(--color-hud)'
                                      : 'none',
                                }}
                              />
                            ))}
                          </div>

                          <p className="field-label mb-1.5">アイコン</p>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {MATERIAL_ICON_NAMES.map((name) => {
                              const I = iconComponent(name)
                              const sel = name === iconName
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  aria-label={`アイコン ${name}`}
                                  aria-pressed={sel}
                                  onClick={() =>
                                    updateMaterialStyle(subject, it.name, { color, icon: name })
                                  }
                                  className={`flex h-8 w-8 items-center justify-center rounded-sharp border ${
                                    sel ? 'border-cyan text-cyan' : 'border-line text-hud-dim'
                                  }`}
                                >
                                  <I size={16} strokeWidth={1.75} />
                                </button>
                              )
                            })}
                          </div>

                          {activities.length > 0 && (
                            <>
                              <p className="field-label mb-1.5">活動内容(候補)</p>
                              <ul className="mb-3 flex flex-col">
                                {activities.map((activity) => (
                                  <li
                                    key={activity}
                                    className="flex items-center gap-2 border-b border-line py-1.5 text-sm last:border-b-0"
                                  >
                                    <span className="min-w-0 flex-1 truncate text-hud">{activity}</span>
                                    <button
                                      type="button"
                                      aria-label={`活動内容「${activity}」を削除`}
                                      onClick={() => {
                                        if (confirm(`活動内容「${activity}」を候補から削除します。`)) {
                                          deleteTag({ subject, material: it.name, activity })
                                        }
                                      }}
                                      className="shrink-0 rounded-sharp border border-line p-1 text-hud-faint hover:text-alert"
                                    >
                                      <Trash2 size={12} strokeWidth={1.75} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `教材「${it.name}」を削除します。\n候補・色設定・活動内容も消えます（記録は残ります）。`,
                                )
                              ) {
                                setOpenId(null)
                                deleteMaterial(it.id)
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-sharp border border-line px-3 py-1.5 text-xs text-alert"
                          >
                            <Trash2 size={13} strokeWidth={1.75} />
                            この教材を削除
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
