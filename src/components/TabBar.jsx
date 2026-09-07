import { TABS, useNavigation } from '../navigation/NavigationContext.jsx'
import { NAV_ICONS } from './navIcons.js'

// 画面下部に固定されるタブバー。PC(md以上)ではサイドバーに置き換わる。
export default function TabBar() {
  const { tab, setTab } = useNavigation()

  return (
    <nav
      className="relative shrink-0 border-t border-line bg-void md:hidden"
      // 下端はホームバー(スワイプ用の帯)の安全余白ぶん、タブバーの背景を
      // そのまま伸ばす。ここを不透明にしておくと、余白が「空きスペース」に見えない。
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span
        aria-hidden
        className="edge-line pointer-events-none absolute inset-x-0 top-0 h-px"
      />
      <ul className="flex">
        {TABS.map(({ key, label }) => {
          const Icon = NAV_ICONS[key]
          const active = tab === key
          return (
            <li key={key} className="relative flex-1">
              <button
                type="button"
                onClick={() => setTab(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 py-2 ${
                  active ? 'text-cyan' : 'text-hud-faint'
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="glow-sm absolute inset-x-5 top-0 h-0.5 bg-cyan"
                  />
                )}
                <Icon size={21} strokeWidth={1.5} />
                <span className="font-hud text-[10px] font-semibold tracking-wide">
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
