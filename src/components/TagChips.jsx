import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Field } from './form.jsx'

// 履歴からワンタップ選択、無ければ「＋ 新規」で手入力(spec 5章)。
//   options   : 過去に使った候補(文字列の配列)
//   value     : 選択中の文字列(空文字なら未選択)
//   onChange  : 選択/入力された文字列を返す
//   renderLeading(opt) : チップ左に置く要素(教材の色ドットなど)。任意
export default function TagChips({
  label,
  required = false,
  options = [],
  value = '',
  onChange,
  renderLeading = null,
  addPlaceholder = '新しい項目を入力',
  disabled = false,
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  // 選択中の値が候補に無い(新規入力された)場合も、チップとして見せる
  const list = value && !options.includes(value) ? [value, ...options] : options

  const commit = () => {
    const v = draft.trim()
    if (v) onChange(v)
    setDraft('')
    setAdding(false)
  }

  return (
    <Field label={label} required={required}>
      <div className="flex flex-wrap gap-2">
        {list.map((opt) => {
          const selected = opt === value
          return (
            <button
              key={opt}
              type="button"
              className="chip"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(opt)}
            >
              {renderLeading?.(opt)}
              {opt}
              {selected && <Check size={14} strokeWidth={2.5} />}
            </button>
          )
        })}

        {!adding && (
          <button
            type="button"
            className="chip"
            disabled={disabled}
            onClick={() => setAdding(true)}
          >
            <Plus size={14} strokeWidth={2.5} />
            新規
          </button>
        )}

        {adding && (
          <span className="flex items-center gap-1.5">
            <input
              autoFocus
              type="text"
              value={draft}
              placeholder={addPlaceholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commit()
                } else if (e.key === 'Escape') {
                  // モーダル側の Esc(閉じる)まで伝わらないようにする
                  e.stopPropagation()
                  setDraft('')
                  setAdding(false)
                }
              }}
              className="field-input w-44 py-1.5"
            />
            <button
              type="button"
              className="chip"
              aria-label="決定"
              onClick={commit}
            >
              <Check size={14} strokeWidth={2.5} />
            </button>
          </span>
        )}
      </div>
    </Field>
  )
}
