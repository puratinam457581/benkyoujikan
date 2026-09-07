import { useState } from 'react'
import { LogOut, Sun, Moon, Trash2 } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import MaterialStylesSection from './MaterialStylesSection.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { useData } from '../data/DataProvider.jsx'
import { formatMinutes, formatDateLabel } from '../utils/date.js'

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
    <ScreenScaffold title="設定">
      {/* アカウント */}
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">ログイン中のアカウント</p>
        <p className="mt-1 font-semibold text-hud">{user?.displayName || '(名前なし)'}</p>
        <p className="text-sm text-hud-faint">{user?.email}</p>
        <p className="mt-2 text-xs text-hud-faint">
          記録 {records.length} 件 / 累計 {formatMinutes(totalMin)}
        </p>
        <button className="btn btn-ghost mt-3 text-sm" onClick={signOut}>
          <LogOut size={16} strokeWidth={1.5} />
          サインアウト
        </button>
      </section>

      {/* テーマ */}
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">テーマ</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-panel border px-3 py-2 text-sm ${
              theme === 'dark'
                ? 'border-cyan text-cyan'
                : 'border-line text-hud-dim hover:text-hud'
            }`}
          >
            <Sun size={16} strokeWidth={1.5} />
            ダーク
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-panel border px-3 py-2 text-sm ${
              theme === 'light'
                ? 'border-cyan text-cyan'
                : 'border-line text-hud-dim hover:text-hud'
            }`}
          >
            <Moon size={16} strokeWidth={1.5} />
            ライト
          </button>
        </div>
        <p className="mt-2 text-xs text-hud-faint">
          選んだテーマはこの端末に保存され、次回起動時も同じ表示になります。
        </p>
      </section>

      {/* 学習管理システム連携 */}
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">現在フェーズ開始日</p>
        <p className="mt-1 mb-2 text-[11px] leading-relaxed text-hud-faint">
          過去ログ出力の「現在フェーズの累計」の起点。学習フェーズが切り替わったら
          （例: 10/1, 10/26）ここを更新してください。
        </p>
        <input
          type="date"
          value={appConfig.phaseStart || ''}
          onChange={(e) => e.target.value && setPhaseStart(e.target.value)}
          className="field-input font-digit w-44"
        />
        {appConfig.phaseStart && (
          <p className="mt-1 text-[11px] text-hud-faint">
            {formatDateLabel(appConfig.phaseStart)} から
          </p>
        )}
      </section>

      <MaterialStylesSection />

      {/* データの全削除 */}
      <section className="panel px-4 py-3" style={{ borderColor: 'var(--color-alert)' }}>
        <p className="text-xs" style={{ color: 'var(--color-alert)' }}>
          データの全削除
        </p>
        <p className="mt-1 mb-2 text-[11px] leading-relaxed text-hud-faint">
          記録・教材マスタ・タグ・色設定・フェーズ開始日をすべて消します。
          <strong>取り消せません。</strong>アカウント自体は残ります。
        </p>
        <button
          type="button"
          className="btn btn-danger text-sm"
          disabled={wiping}
          onClick={handleWipe}
        >
          <Trash2 size={15} strokeWidth={1.75} />
          {wiping ? '削除中…' : 'すべてのデータを削除'}
        </button>
      </section>
    </ScreenScaffold>
  )
}
