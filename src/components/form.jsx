// 入力フォームの共通部品。見た目は index.css の .field-* が持つ。

export function Field({ label, required = false, hint = null, error = null, children }) {
  return (
    <div className="mb-4 last:mb-0">
      {label && (
        <label className="field-label mb-1.5 flex items-center gap-1">
          {label}
          {required && <span className="text-alert">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-hud-faint">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-alert">{error}</p>}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  hint = null,
  error = null,
  inputMode,
  onKeyDown,
  autoFocus = false,
}) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <input
        type="text"
        inputMode={inputMode}
        autoFocus={autoFocus}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="field-input"
      />
    </Field>
  )
}

// 数値入力。空欄を許すため値は文字列で扱い、保存時に数値へ変換する。
export function NumberField({ label, value, onChange, min = 0, max, unit = null, hint = null }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="field-input font-digit"
        />
        {unit && <span className="shrink-0 text-sm text-hud-dim">{unit}</span>}
      </div>
    </Field>
  )
}

export function TextArea({ label, value, onChange, placeholder = '', rows = 3, hint = null }) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        value={value ?? ''}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field-input resize-none leading-relaxed"
      />
    </Field>
  )
}
