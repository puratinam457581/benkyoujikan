import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import TagChips from '../components/TagChips.jsx'
import { NumberField, TextArea, Field } from '../components/form.jsx'
import { useData } from '../data/DataProvider.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { comboKey, topCombos } from '../data/tags.js'
import { resolveMaterialStyle, iconComponent } from '../utils/materialStyle.js'
import { todayStr, addDaysStr, formatMinutes } from '../utils/date.js'

// 記録フロー(spec 6章)。教科 → 教材 → 活動内容 の順に選び、時間を入れて保存。
export default function RecordModal() {
  const { record, closeRecord } = useNavigation()
  const { tags, materialStyles, records, addRecord, updateRecord } = useData()
  const p = record.prefill || {}
  const editingId = p.id || null

  const [subject, setSubject] = useState(p.subject || '')
  const [material, setMaterial] = useState(p.material || '')
  const [activity, setActivity] = useState(p.activity || '')
  const [hours, setHours] = useState(p.minutes ? String(Math.floor(p.minutes / 60)) : '')
  const [minutes, setMinutes] = useState(p.minutes ? String(p.minutes % 60) : '')
  const [dateStr, setDateStr] = useState(p.date || todayStr())
  const [memo, setMemo] = useState(p.memo || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const materialOptions = subject ? tags.materials?.[subject] || [] : []
  const activityOptions =
    subject && material ? tags.activities?.[comboKey(subject, material)] || [] : []

  const totalMin = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0)
  const canSave = subject && material && activity && totalMin > 0 && !saving

  const shortcuts = useMemo(() => topCombos(tags, 6), [tags])
  const last = records[0] || null

  function pickCombo(c) {
    setSubject(c.subject)
    setMaterial(c.material)
    setActivity(c.activity)
  }

  function onSubjectChange(v) {
    setSubject(v)
    setMaterial('')
    setActivity('')
  }
  function onMaterialChange(v) {
    setMaterial(v)
    setActivity('')
  }

  async function save() {
    if (!canSave) return
    setSaving(true)
    setError('')
    const payload = {
      subject: subject.trim(),
      material: material.trim(),
      activity: activity.trim(),
      minutes: totalMin,
      date: dateStr,
      memo: memo.trim(),
    }
    try {
      if (editingId) {
        await updateRecord(editingId, payload)
      } else {
        await addRecord(payload)
      }
      closeRecord()
    } catch (e) {
      setError(e?.message || '保存に失敗しました')
      setSaving(false)
    }
  }

  const materialLeading = (name, forSubject = subject) => {
    const { color, iconName } = resolveMaterialStyle(materialStyles, forSubject, name)
    const Icon = iconComponent(iconName)
    return (
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Icon size={11} strokeWidth={2.25} color="#0f172a" />
      </span>
    )
  }

  return (
    <Modal
      title={editingId ? '記録を編集' : '勉強を記録'}
      onClose={closeRecord}
      footer={
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="font-hud text-sm font-bold text-cyan disabled:opacity-40"
        >
          保存
        </button>
      }
    >
      {/* ショートカット + 前回と同じ(新規記録のときだけ) */}
      {!editingId && (shortcuts.length > 0 || last) && (
        <div className="mb-4">
          <p className="field-label mb-1.5">かんたん入力</p>
          <div className="flex flex-wrap gap-2">
            {last && (
              <button type="button" className="chip" onClick={() => pickCombo(last)}>
                <RotateCcw size={14} strokeWidth={2.5} />
                前回と同じ
              </button>
            )}
            {shortcuts.map((c) => (
              <button
                key={`${c.subject}/${c.material}/${c.activity}`}
                type="button"
                className="chip"
                onClick={() => pickCombo(c)}
              >
                {materialLeading(c.material, c.subject)}
                {c.subject}・{c.material}・{c.activity}
              </button>
            ))}
          </div>
        </div>
      )}

      <TagChips
        label="教科"
        required
        options={tags.subjects || []}
        value={subject}
        onChange={onSubjectChange}
        addPlaceholder="例: 英語"
      />

      <TagChips
        label="教材"
        required
        options={materialOptions}
        value={material}
        onChange={onMaterialChange}
        renderLeading={subject ? materialLeading : null}
        addPlaceholder="例: TOEIC公式問題集"
        disabled={!subject}
      />

      <TagChips
        label="活動内容"
        required
        options={activityOptions}
        value={activity}
        onChange={setActivity}
        addPlaceholder="例: リスニング"
        disabled={!material}
      />

      <Field label="勉強時間" required>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="field-input font-digit w-20"
            />
            <span className="text-sm text-hud-dim">時間</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="field-input font-digit w-20"
            />
            <span className="text-sm text-hud-dim">分</span>
          </div>
        </div>
        {totalMin > 0 && (
          <p className="font-digit mt-1.5 text-xs text-hud-faint">= {formatMinutes(totalMin)}</p>
        )}
      </Field>

      <Field label="日付">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="field-input font-digit w-44"
          />
          <button type="button" className="chip" aria-pressed={dateStr === todayStr()} onClick={() => setDateStr(todayStr())}>
            今日
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={dateStr === addDaysStr(todayStr(), -1)}
            onClick={() => setDateStr(addDaysStr(todayStr(), -1))}
          >
            昨日
          </button>
        </div>
      </Field>

      <TextArea
        label="メモ(任意)"
        value={memo}
        onChange={setMemo}
        placeholder="気づいたこと、進んだ範囲など"
      />

      {error && <p className="mb-3 text-xs text-alert">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className="btn btn-primary w-full disabled:opacity-40"
      >
        {saving ? '保存中…' : 'この内容で保存'}
      </button>
    </Modal>
  )
}
