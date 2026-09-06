import { useState } from 'react'
import { useData } from '../data/DataProvider.jsx'
import { comboKey } from '../data/tags.js'
import {
  PRESET_COLORS,
  MATERIAL_ICON_NAMES,
  resolveMaterialStyle,
  iconComponent,
} from '../utils/materialStyle.js'
import { readableTextOn } from '../utils/color.js'

// 教材ごとの色・アイコンの設定(spec 6章)。
// tags.materials に登録済みの「教科 → 教材」を一覧し、その場で編集する。
export default function MaterialStylesSection() {
  const { tags, materialStyles, updateMaterialStyle } = useData()
  const [openKey, setOpenKey] = useState(null)

  const rows = []
  for (const subject of tags.subjects || []) {
    for (const material of tags.materials?.[subject] || []) {
      rows.push({ subject, material, key: comboKey(subject, material) })
    }
  }

  if (rows.length === 0) {
    return (
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">教材の見た目</p>
        <p className="mt-1 text-sm text-hud-faint">
          記録を追加すると、ここで教材ごとの色とアイコンを設定できます。
        </p>
      </section>
    )
  }

  return (
    <section className="panel px-4 py-3">
      <p className="text-xs text-hud-dim">教材の見た目</p>
      <p className="mt-1 mb-2 text-[11px] text-hud-faint">
        色とアイコンは記録画面の候補チップに表示されます。
      </p>
      <ul className="flex flex-col gap-1">
        {rows.map(({ subject, material, key }) => {
          const { color, iconName } = resolveMaterialStyle(materialStyles, subject, material)
          const Icon = iconComponent(iconName)
          const open = openKey === key
          return (
            <li key={key} className="rounded-sharp border border-line">
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : key)}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: color }}
                >
                  <Icon size={16} strokeWidth={2} color={readableTextOn(color)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-hud">{material}</span>
                  <span className="block truncate text-[11px] text-hud-faint">{subject}</span>
                </span>
                <span className="text-xs text-hud-faint">{open ? '閉じる' : '変更'}</span>
              </button>

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
                        onClick={() => updateMaterialStyle(subject, material, { color: c, icon: iconName })}
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
                  <div className="flex flex-wrap gap-2">
                    {MATERIAL_ICON_NAMES.map((name) => {
                      const I = iconComponent(name)
                      const sel = name === iconName
                      return (
                        <button
                          key={name}
                          type="button"
                          aria-label={`アイコン ${name}`}
                          aria-pressed={sel}
                          onClick={() => updateMaterialStyle(subject, material, { color, icon: name })}
                          className={`flex h-8 w-8 items-center justify-center rounded-sharp border ${
                            sel ? 'border-cyan text-cyan' : 'border-line text-hud-dim'
                          }`}
                        >
                          <I size={16} strokeWidth={1.75} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
