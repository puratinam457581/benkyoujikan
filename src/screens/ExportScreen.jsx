import { useMemo, useState } from 'react'
import { Copy, Share2, Check, Settings2 } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import Section from '../components/Section.jsx'
import { useData } from '../data/DataProvider.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { buildExportLog } from '../utils/exportLog.js'
import { formatDateLabel, addDaysStr, todayStr } from '../utils/date.js'

// 過去ログ出力(学習管理システム連携)。
// 毎朝これを iPad/iPhone の Claude に渡すと、今日の学習計画を作ってもらえる。
export default function ExportScreen() {
  const { records, master, appConfig, diary, loading } = useData()
  const { setTab } = useNavigation()
  const [copied, setCopied] = useState(false)

  const text = useMemo(
    () => buildExportLog(records, master, appConfig, diary),
    [records, master, appConfig, diary],
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
      // 可能なら .md ファイルとして共有(ファイルアプリ保存 / Claude へ送るのに便利)
      const file = new File([text], `過去ログ_${todayStr()}.md`, { type: 'text/markdown' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '過去ログ' })
        return
      }
      await navigator.share({ title: '過去ログ', text })
    } catch {
      /* 共有シートを閉じただけ等は無視 */
    }
  }

  return (
    <ScreenScaffold>
      <section className="panel px-4 py-4">
        <p className="text-sm leading-relaxed text-hud-dim">
          毎朝これをコピーして、iPad/iPhone の Claude（学習計画のプロジェクト）に貼り付けると、
          今日の学習計画を作ってもらえます。
        </p>

        <div className="mt-4 flex gap-2">
          <button type="button" className="btn btn-primary flex-1 text-sm" onClick={copy}>
            {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={1.75} />}
            {copied ? 'コピーしました' : 'コピー'}
          </button>
          {canShare && (
            <button type="button" className="btn btn-ghost flex-1 text-sm" onClick={share}>
              <Share2 size={16} strokeWidth={1.75} />
              共有
            </button>
          )}
        </div>

        <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-3 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-hud-faint">対象</dt>
            <dd className="font-digit text-hud-dim">{yesterday} まで（当日ぶんは含まず）</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-hud-faint">フェーズ開始日</dt>
            <dd>
              <button
                type="button"
                onClick={() => setTab('settings')}
                className="flex items-center gap-1 text-cyan"
              >
                <Settings2 size={12} strokeWidth={1.75} />
                {appConfig.phaseStart ? formatDateLabel(appConfig.phaseStart) : '未設定'}
              </button>
            </dd>
          </div>
        </dl>
      </section>

      <Section title="出力内容のプレビュー">
        {loading ? (
          <p className="text-sm text-hud-faint">読み込み中…</p>
        ) : (
          <pre
            id="export-text"
            className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-hud"
            style={{ fontFamily: 'var(--font-digit)' }}
          >
            {text}
          </pre>
        )}
      </Section>
    </ScreenScaffold>
  )
}
