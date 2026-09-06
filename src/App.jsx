import { useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx'
import { DataProvider, useData } from './data/DataProvider.jsx'
import LoginScreen from './auth/LoginScreen.jsx'
import { formatMinutes, todayStr } from './utils/date.js'

// フェーズ1の骨組み:
//   Firebase未設定 → 設定待ち画面(LoginScreen 内で分岐)
//   ログイン判定中 → スプラッシュ
//   未ログイン     → LoginScreen
//   ログイン済み   → DataProvider を挟んで、暫定の確認画面
// フェーズ2で下部タブ・サイドバー・テーマ切替を載せ、暫定画面を本物に置き換える。
export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

function Gate() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (!user) return <LoginScreen />

  return (
    <DataProvider>
      <Phase1Placeholder />
    </DataProvider>
  )
}

function Splash() {
  return (
    <div className="app-viewport">
      <div className="app-frame">
        <div className="flex h-full items-center justify-center">
          <p style={{ color: 'var(--color-hud-dim)', fontFamily: 'var(--font-hud)' }}>
            読み込み中…
          </p>
        </div>
      </div>
    </div>
  )
}

// ── ここから下はフェーズ1の動作確認用。フェーズ2以降で置き換える ──
function Phase1Placeholder() {
  const { user, signOut } = useAuth()
  const { records, tags, loading, error, addRecord, deleteRecord } = useData()
  const [busy, setBusy] = useState(false)

  const totalMin = records.reduce((s, r) => s + r.minutes, 0)

  async function addSample() {
    setBusy(true)
    try {
      await addRecord({
        subject: 'テスト教科',
        material: 'テスト教材',
        activity: 'テスト活動',
        minutes: 30,
        date: todayStr(),
        memo: '動作確認',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-viewport">
      <div className="app-frame overflow-y-auto">
        <div className="content-normal flex flex-col gap-4 px-5 py-6">
          <div>
            <h1
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-cyan)' }}
            >
              フェーズ1: 認証 + データ層
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-hud-dim)' }}>
              ログインと Firestore の読み書きの確認用の画面です。
            </p>
          </div>

          <div className="panel px-4 py-3 text-sm">
            <p style={{ color: 'var(--color-hud-dim)' }}>ログイン中</p>
            <p className="mt-1 font-semibold" style={{ color: 'var(--color-hud)' }}>
              {user.displayName || '(名前なし)'}
            </p>
            <p style={{ color: 'var(--color-hud-faint)' }}>{user.email}</p>
            <p className="mt-1 break-all text-xs" style={{ color: 'var(--color-hud-faint)' }}>
              uid: {user.uid}
            </p>
          </div>

          <div className="panel px-4 py-3 text-sm">
            <div className="flex items-baseline justify-between">
              <span style={{ color: 'var(--color-hud-dim)' }}>保存済みの記録</span>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-digit)', color: 'var(--color-hud)' }}
              >
                {records.length} 件 / 合計 {formatMinutes(totalMin)}
              </span>
            </div>
            {loading && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-hud-faint)' }}>
                読み込み中…
              </p>
            )}
            {error && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-alert)' }}>
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={addSample} disabled={busy}>
              テスト記録を1件追加
            </button>
            <button className="btn btn-ghost" onClick={signOut}>
              サインアウト
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="panel flex items-center justify-between px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate" style={{ color: 'var(--color-hud)' }}>
                    {r.subject} ▸ {r.material} ▸ {r.activity}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-hud-faint)' }}>
                    {r.date} ・ {formatMinutes(r.minutes)}
                    {r.memo ? ` ・ ${r.memo}` : ''}
                  </p>
                </div>
                <button
                  className="btn btn-ghost shrink-0 px-3 py-1 text-xs"
                  onClick={() => deleteRecord(r.id)}
                >
                  削除
                </button>
              </div>
            ))}
            {!loading && records.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--color-hud-faint)' }}>
                まだ記録がありません。「テスト記録を1件追加」で書き込みを試せます。
              </p>
            )}
          </div>

          <div className="text-xs" style={{ color: 'var(--color-hud-faint)' }}>
            <p>タグ履歴(教科): {tags.subjects.join('、') || '(なし)'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
