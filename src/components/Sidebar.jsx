import { TABS, useNavigation } from '../navigation/NavigationContext.jsx'
import { NAV_ICONS } from './navIcons.js'

// PC(md以上)専用のナビゲーション。スマホでは下部の TabBar が出る。
// 中身はどちらも同じ5タブで、変わるのは並べ方だけ。
export default function Sidebar() {
  const { tab, setTab } = useNavigation()

  return (
    <nav className="hidden w-56 shrink-0 flex-col border-r border-line bg-void md:flex">
      <div className="border-b border-line px-5 py-4">
        <p className="font-hud text-glow text-base font-bold tracking-widest text-cyan">
          BENKYO&nbsp;TIME
        </p>
        <p className="mt-0.5 text-[11px] text-hud-faint">勉強時間管理</p>
      </div>

      <ul className="flex-1 p-3">
        {TABS.map(({ key, label }) => {
          const Icon = NAV_ICONS[key]
          const active = tab === key
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setTab(key)}
                aria-current={active ? 'page' : undefined}
                className={`relative mb-1 flex w-full items-center gap-3 rounded-sharp px-3 py-2.5 text-left transition-colors ${
                  active
                    ? 'bg-cyan/10 text-cyan'
                    : 'text-hud-dim hover:bg-panel-2 hover:text-hud'
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="glow-sm absolute inset-y-1.5 left-0 w-0.5 bg-cyan"
                  />
                )}
                <Icon size={19} strokeWidth={1.5} />
                <span className="font-hud text-sm font-semibold tracking-wide">
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
