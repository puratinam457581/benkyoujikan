import { useEffect } from 'react'

// スマホでは下からせり上がるシート、PCでは中央のダイアログ。
// 背景(暗い部分)のタップ / Esc で閉じる。
export default function Modal({ title, onClose, footer = null, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      // 入力中(テキスト欄にフォーカス)の Esc は、その欄の操作に任せて閉じない
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-layer">
      <button type="button" aria-label="閉じる" className="modal-scrim" onClick={onClose} />
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-deep px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="font-hud text-sm text-hud-dim active:opacity-60"
          >
            キャンセル
          </button>
          <h2 className="font-hud text-sm font-semibold tracking-wide text-hud">{title}</h2>
          <div className="min-w-[4.5rem] text-right">{footer}</div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
