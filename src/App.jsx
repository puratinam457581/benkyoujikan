import { isFirebaseConfigured } from './firebase/config.js'

// フェーズ0の骨組み。
// フェーズ1で認証(Googleログイン)とデータ層、
// フェーズ2で画面遷移とテーマ切替を載せていく。
export default function App() {
  return (
    <div className="app-viewport">
      <div className="app-frame">
        <div className="content-normal flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <h1
            className="text-2xl font-semibold tracking-wide"
            style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-cyan)' }}
          >
            勉強時間管理
          </h1>
          <p style={{ color: 'var(--color-hud-dim)' }}>
            フェーズ0: プロジェクト初期化が完了しました。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-hud-faint)' }}>
            Firebase 設定:{' '}
            {isFirebaseConfigured ? '読み込み済み' : '未設定(.env を作成してください)'}
          </p>
        </div>
      </div>
    </div>
  )
}
