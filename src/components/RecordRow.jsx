import { Pencil, Trash2 } from 'lucide-react'
import { useData } from '../data/DataProvider.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { resolveMaterialStyle, iconComponent } from '../utils/materialStyle.js'
import { readableTextOn } from '../utils/color.js'
import { formatMinutes } from '../utils/date.js'

// 1件の記録の行。教材の色・アイコン、内容、時間、日付、編集/削除。
export default function RecordRow({ record: r, showDate = true }) {
  const { materialStyles, deleteRecord } = useData()
  const { openRecord } = useNavigation()
  const { color, iconName } = resolveMaterialStyle(materialStyles, r.subject, r.material)
  const Icon = iconComponent(iconName)

  return (
    <div className="panel flex items-center gap-3 px-3 py-2.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Icon size={18} strokeWidth={2} color={readableTextOn(color)} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-hud">
          {[r.subject, r.material, r.activity].filter(Boolean).join('・')}
        </p>
        <p className="text-[11px] text-hud-faint">
          {showDate ? `${r.date}・` : ''}
          <span className="font-digit">{formatMinutes(r.minutes)}</span>
          {r.memo ? `・${r.memo}` : ''}
        </p>
      </div>

      <button
        type="button"
        aria-label="編集"
        onClick={() => openRecord({ ...r })}
        className="shrink-0 rounded-sharp border border-line p-1.5 text-hud-dim hover:text-hud"
      >
        <Pencil size={14} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="削除"
        onClick={() => {
          if (confirm('この記録を削除しますか？')) deleteRecord(r.id)
        }}
        className="shrink-0 rounded-sharp border border-line p-1.5 text-hud-dim hover:text-alert"
      >
        <Trash2 size={14} strokeWidth={1.75} />
      </button>
    </div>
  )
}
