import { useState } from 'react'
import { LogOut, Sun, Moon, Trash2 } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import Section from '../components/Section.jsx'
import MaterialStylesSection from './MaterialStylesSection.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { useData } from '../data/DataProvider.jsx'
import { formatMinutes, formatDateLabel } from '../utils/date.js'

const THEMES = [
  { key: 'dark', label: 'ダーク', icon: Moon },
  { key: 'light', label: 'ライト', icon: Sun },
]

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { records, appConfig, setPhaseStart, wipeAll } = useData()
  const totalMin = records.reduce((s, r) => s + r.minutes, 0)
  const [wiping, setWiping] = useState(false)

  async function handleWipe() {
    if (
      !confirm(
        '記録・教材マスタ・タグ・設定をすべて削除します。\nこの操作は取り消せません。続けますか？',
      )
    )
      return
    if (prompt('確認のため「削除」と入力してください') !== '削除') return
    setWiping(true)
    try {
      await wipeAll()
      alert('すべてのデータを削除しました。')
    } catch (e) {
      alert('削除に失敗しました: ' + (e?.message || e))
    } finally {
      setWiping(false)
    }
  }

  return (
    <ScreenScaffold>
      <Section title="アカウント">
        <p className="font-semibold text-hud">{user?.displayName || '(名前なし)'}</p>
        <p className="text-sm text-hud-faint">{user?.email}</p>
        <p className="mt-2 text-xs text-hud-faint">
          記録 {records.length} 件 / 累計 {formatMinutes(totalMin)}
        </p>
        <button className="btn btn-ghost mt-3 text-sm" onClick={signOut}>
          <LogOut size={16} strokeWidth={1.5} />
          サインアウト
        </button>
      </Section>

      <Section title="テーマ" hint="選んだテーマはこの端末に保存され、次回起動時も同じ表示になります。">
        <div className="segmented">
          {THEMES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTheme(key)}
              aria-pressed={theme === key}
              className="flex items-center justify-center gap-2"
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="現在フェーズ開始日"
        hint="過去ログ出力の「現在フェーズの累計」の起点。学習フェーズが切り替わったら（例: 10/1, 10/26）ここを更新してください。"
      >
        <input
          type="date"
          value={appConfig.phaseStart || ''}
          onChange={(e) => e.target.value && setPhaseStart(e.target.value)}
          className="field-input font-digit w-44"
        />
        {appConfig.phaseStart && (
          <p className="mt-1.5 text-[11px] text-hud-faint">
            {formatDateLabel(appConfig.phaseStart)} から
          </p>
        )}
      </Section>

      <MaterialStylesSection />

      <Section
        title="データの全削除"
        tone="alert"
        collapsible
        defaultOpen={false}
        hint="記録・教材マスタ・タグ・色設定・進捗・日記をすべて消します。取り消せません。アカウント自体は残ります。"
      >
        <button
          type="button"
          className="btn btn-danger text-sm"
          disabled={wiping}
          onClick={handleWipe}
        >
          <Trash2 size={15} strokeWidth={1.75} />
          {wiping ? '削除中…' : 'すべてのデータを削除'}
        </button>
      </Section>
    </ScreenScaffold>
  )
}
