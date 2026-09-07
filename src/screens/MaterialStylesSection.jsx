import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useData } from '../data/DataProvider.jsx'
import { comboKey } from '../data/tags.js'
import {
  PRESET_COLORS,
  MATERIAL_ICON_NAMES,
  resolveMaterialStyle,
  iconComponent,
} from '../utils/materialStyle.js'
import { readableTextOn } from '../utils/color.js'

// 教材ごとの色・アイコンの設定(spec 6章)+ 使わなくなった候補の削除。
// 教科 → 教材 → 活動内容 を階層で並べ、各階層に削除ボタンを置く。
// 削除しても過去の記録は消えない(記録を再保存すると候補として復活する)。
export default function MaterialStylesSection() {
  const { tags, materialStyles, updateMaterialStyle, deleteTag } = useData()
  const [openKey, setOpenKey] = useState(null)

  const subjects = tags.subjects || []

  if (subjects.length === 0) {
    return (
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">教材・活動内容</p>
        <p className="mt-1 text-sm text-hud-faint">
          記録を追加すると、ここで教材の色・アイコンの設定や、使わない候補の削除ができます。
        </p>
      </section>
    )
  }

  return (
    <section className="panel px-4 py-3">
      <p className="text-xs text-hud-dim">教材・活動内容</p>
      <p className="mt-1 mb-3 text-[11px] leading-relaxed text-hud-faint">
        色・アイコンは記録画面の候補チップに出ます。使わなくなった候補は
        <Trash2 size={11} strokeWidth={2} className="mx-0.5 inline align-[-1px]" />
        で削除できます（過去の記録は消えません）。
      </p>

      <div className="flex flex-col gap-3">
        {subjects.map((subject) => {
          const materials = tags.materials?.[subject] || []
          return (
            <div key={subject}>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex-1 truncate text-sm font-semibold text-hud">{subject}</span>
                <button
                  type="button"
                  aria-label={`教科「${subject}」を削除`}
                  onClick={() => {
                    if (
                      confirm(
                        `教科「${subject}」を候補から削除します。\nぶら下がる教材・活動内容もまとめて消えます。`,
                      )
                    ) {
                      deleteTag({ subject })
                    }
                  }}
                  className="shrink-0 rounded-sharp border border-line p-1 text-hud-faint hover:text-alert"
                >
                  <Trash2 size={13} strokeWidth={1.75} />
                </button>
              </div>

              {materials.length === 0 ? (
                <p className="pl-1 text-[11px] text-hud-faint">（教材の記録なし）</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {materials.map((material) => {
                    const key = comboKey(subject, material)
                    const { color, iconName } = resolveMaterialStyle(
                      materialStyles,
                      subject,
                      material,
                    )
                    const Icon = iconComponent(iconName)
                    const open = openKey === key
                    const activities = tags.activities?.[key] || []
                    return (
                      <li key={key} className="rounded-sharp border border-line">
                        <div className="flex items-center gap-2 px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => setOpenKey(open ? null : key)}
                            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: color }}
                            >
                              <Icon size={15} strokeWidth={2} color={readableTextOn(color)} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-hud">
                              {material}
                            </span>
                            <span className="shrink-0 text-xs text-hud-faint">
                              {open ? '閉じる' : '変更'}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={`教材「${material}」を削除`}
                            onClick={() => {
                              if (
                                confirm(
                                  `教材「${material}」を候補から削除します。\nこの教材の活動内容もまとめて消えます。`,
                                )
                              ) {
                                if (open) setOpenKey(null)
                                deleteTag({ subject, material })
                              }
                            }}
                            className="shrink-0 rounded-sharp border border-line p-1 text-hud-faint hover:text-alert"
                          >
                            <Trash2 size={13} strokeWidth={1.75} />
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
                                    updateMaterialStyle(subject, material, {
                                      color: c,
                                      icon: iconName,
                                    })
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
                                      updateMaterialStyle(subject, material, {
                                        color,
                                        icon: name,
                                      })
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

                            <p className="field-label mb-1.5">活動内容</p>
                            {activities.length === 0 ? (
                              <p className="text-[11px] text-hud-faint">（記録なし）</p>
                            ) : (
                              <ul className="flex flex-col">
                                {activities.map((activity) => (
                                  <li
                                    key={activity}
                                    className="flex items-center gap-2 border-b border-line py-1.5 text-sm last:border-b-0"
                                  >
                                    <span className="min-w-0 flex-1 truncate text-hud">
                                      {activity}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label={`活動内容「${activity}」を削除`}
                                      onClick={() => {
                                        if (confirm(`活動内容「${activity}」を候補から削除します。`)) {
                                          deleteTag({ subject, material, activity })
                                        }
                                      }}
                                      className="shrink-0 rounded-sharp border border-line p-1 text-hud-faint hover:text-alert"
                                    >
                                      <Trash2 size={12} strokeWidth={1.75} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
