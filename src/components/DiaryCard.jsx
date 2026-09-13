import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Section from './Section.jsx'
import { useData } from '../data/DataProvider.jsx'

// 日記(任意)。書いても書かなくてもよい。
// 前日ぶんが過去ログ出力に「前日の日記」として載り、AIが前日の実績・所感を把握できる。
export default function DiaryCard({ date, title = '日記(任意)' }) {
  const { diary, setDiaryEntry } = useData()
  const saved = diary[date] || ''
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(saved)
  const [saving, setSaving] = useState(false)

  // 表示中の日付が変わったら(カレンダーで別の日を選んだ等)下書きを作り直す
  useEffect(() => {
    setDraft(saved)
    setEditing(false)
  }, [date, saved])

  async function save() {
    setSaving(true)
    try {
      await setDiaryEntry(date, draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(saved)
    setEditing(false)
  }

  if (editing) {
    return (
      <Section title={title}>
        <textarea
          autoFocus
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="例: 今日は数学を勉強できなかった。明日まとめてやる"
          className="field-input resize-none leading-relaxed"
        />
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn btn-primary text-sm" disabled={saving} onClick={save}>
            {saving ? '保存中…' : '保存'}
          </button>
          <button type="button" className="btn btn-ghost text-sm" onClick={cancel}>
            キャンセル
          </button>
        </div>
      </Section>
    )
  }

  return (
    <Section
      title={title}
      action={
        <button
          type="button"
          className="chip shrink-0 px-2.5 py-1 text-[11px]"
          onClick={() => setEditing(true)}
        >
          <Pencil size={12} strokeWidth={2} />
          {saved ? '編集' : '書く'}
        </button>
      }
    >
      {saved ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-hud">{saved}</p>
      ) : (
        <p className="text-[11px] leading-relaxed text-hud-faint">
          その日にあったことを一言メモできます。書かなくてもかまいません。
        </p>
      )}
    </Section>
  )
}
