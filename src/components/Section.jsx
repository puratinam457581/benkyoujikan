import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// 画面内の1区画。全画面でこれを使い、見出しの字体と余白を1か所に揃える。
//   - 見出しはパネルの外に出す(カードが延々と続く見た目を避け、目線の段差を作る)
//   - bare: 中身が自前でパネルを持つとき(記録の一覧など)は包まない
//   - collapsible: 長い設定などを畳めるようにする
export default function Section({
  title,
  action = null,
  hint = null,
  bare = false,
  collapsible = false,
  defaultOpen = true,
  tone = 'normal', // 'normal' | 'alert'
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const shown = !collapsible || open
  const titleColor = tone === 'alert' ? 'text-alert' : 'text-hud-dim'

  return (
    <section>
      {(title || action) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {collapsible ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className={`field-label flex items-center gap-1 ${titleColor}`}
            >
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`transition-transform ${open ? '' : '-rotate-90'}`}
              />
              {title}
            </button>
          ) : (
            <h2 className={`field-label ${titleColor}`}>{title}</h2>
          )}
          {action}
        </div>
      )}

      {shown &&
        (bare ? (
          children
        ) : (
          <div
            className="panel px-4 py-4"
            style={tone === 'alert' ? { borderColor: 'var(--color-alert)' } : undefined}
          >
            {children}
          </div>
        ))}

      {shown && hint && <p className="mt-1.5 text-[11px] leading-relaxed text-hud-faint">{hint}</p>}
    </section>
  )
}
