// 各画面の共通の外枠。本文は読みやすい幅で中央寄せ、上下に余白。
export default function ScreenScaffold({ title, description, children }) {
  return (
    <div className="content-normal flex flex-col gap-4 px-4 pt-5 pb-28 sm:px-5">
      {(title || description) && (
        <div>
          {title && (
            <h1 className="font-hud text-xl font-bold tracking-wide text-hud">{title}</h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-hud-dim">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
