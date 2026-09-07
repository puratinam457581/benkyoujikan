import { useMemo, useState } from 'react'
import { Copy, Share2, Check, Settings2 } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import { useData } from '../data/DataProvider.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { buildExportLog } from '../utils/exportLog.js'
import { formatDateLabel, addDaysStr, todayStr } from '../utils/date.js'

// 過去ログ出力(学習管理システム連携)。
// 毎朝これを iPad/iPhone の Claude に渡すと、今日の学習計画を作ってもらえる。
export default function ExportScreen() {
  const { records, master, appConfig, loading } = useData()
  const { setTab } = useNavigation()
  const [copied, setCopied] = useState(false)

  const text = useMemo(
    () => buildExportLog(records, master, appConfig),
    [records, master, appConfig],
  )

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const yesterday = addDaysStr(todayStr(), -1)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボードが使えない場合は選択して手動コピーしてもらう
      const el = document.getElementById('export-text')
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }

  async function share() {
    try {
      await navigator.share({ title: '過去ログ', text })
    } catch {
      /* 共有シートを閉じただけ等は無視 */
    }
  }

  return (
    <ScreenScaffold title="過去ログ出力">
      <p className="text-sm leading-relaxed text-hud-dim">
        毎朝これをコピーして、iPad/iPhone の Claude（学習計画のプロジェクト）に貼り付けると、
        今日の学習計画を作ってもらえます。対象は <span className="font-digit">{yesterday}</span>{' '}
        まで（当日ぶんは含みません）。
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary text-sm" onClick={copy}>
          {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={1.75} />}
          {copied ? 'コピーしました' : 'コピー'}
        </button>
        {canShare && (
          <button type="button" className="btn btn-ghost text-sm" onClick={share}>
            <Share2 size={16} strokeWidth={1.75} />
            共有
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost text-sm"
          onClick={() => setTab('settings')}
        >
          <Settings2 size={16} strokeWidth={1.75} />
          フェーズ開始日: {appConfig.phaseStart ? formatDateLabel(appConfig.phaseStart) : '未設定'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-hud-faint">読み込み中…</p>
      ) : (
        <pre
          id="export-text"
          className="panel overflow-x-auto whitespace-pre-wrap break-words px-3 py-3 text-[12px] leading-relaxed text-hud"
          style={{ fontFamily: 'var(--font-digit)' }}
        >
          {text}
        </pre>
      )}
    </ScreenScaffold>
  )
}
