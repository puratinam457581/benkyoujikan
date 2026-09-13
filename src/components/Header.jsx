import { TABS, useNavigation } from '../navigation/NavigationContext.jsx'

// 画面上部の細いバー。アプリ名 + いま開いている画面名。
// 画面名をここで出すぶん、各画面は本文だけを持つ(見出しの二重表示をなくす)。
// テーマ切替は設定画面に集約した(同じ操作が2か所にあると探しにくいため)。
export default function Header() {
  const { tab } = useNavigation()
  const label = TABS.find((t) => t.key === tab)?.label ?? ''

  return (
    <header
      className="relative shrink-0 border-b border-line bg-void backdrop-blur-sm"
      // iPhone のステータスバー(時計・電波・電池)と重ならないよう、
      // 上端に安全余白を足す。ホーム画面から起動した PWA で効く。
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <span
        aria-hidden
        className="edge-line pointer-events-none absolute inset-x-0 bottom-0 h-px"
      />
      <div className="flex items-baseline gap-2 px-4 py-3">
        <span className="font-hud text-glow text-xs font-bold tracking-widest text-cyan md:hidden">
          勉強時間
        </span>
        <span aria-hidden className="text-hud-faint md:hidden">
          /
        </span>
        <h1 className="font-hud text-base font-bold tracking-wide text-hud">{label}</h1>
      </div>
    </header>
  )
}
