// 各画面の共通の外枠。本文は読みやすい幅で中央寄せ。
// 画面名はヘッダーが表示するので、ここでは持たない(二重表示を避ける)。
export default function ScreenScaffold({ children }) {
  return (
    <div className="content-normal flex flex-col gap-5 px-4 pt-4 pb-20 sm:px-5">{children}</div>
  )
}
