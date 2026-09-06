import { useAuth } from './AuthProvider.jsx'

// 未ログイン時に出す画面。
// Firebase が未設定(.env が無い)のときは「設定待ち」を表示する。
export default function LoginScreen() {
  const { signIn, error, configured } = useAuth()

  return (
    <div className="app-viewport">
      <div className="app-frame">
        <div className="content-normal flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <h1
              className="text-3xl font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-cyan)' }}
            >
              勉強時間管理
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-hud-dim)' }}>
              勉強した時間を記録して、積み上げを見える化する
            </p>
          </div>

          {configured ? (
            <>
              <button className="btn btn-primary w-full max-w-xs" onClick={signIn}>
                Google アカウントでログイン
              </button>
              <p
                className="max-w-xs text-xs leading-relaxed"
                style={{ color: 'var(--color-hud-faint)' }}
              >
                Google の画面が開きます。パスワードはこのアプリを通りません。
                記録は自分のアカウントに紐づいて保存され、別の端末でも同じアカウントで
                ログインすれば同じデータが見られます。
              </p>
              {error && (
                <p className="max-w-xs text-xs" style={{ color: 'var(--color-alert)' }}>
                  {error}
                </p>
              )}
            </>
          ) : (
            <div
              className="panel max-w-sm px-4 py-4 text-left text-sm leading-relaxed"
              style={{ color: 'var(--color-hud-dim)' }}
            >
              <p className="mb-2 font-semibold" style={{ color: 'var(--color-hud)' }}>
                Firebase が未設定です
              </p>
              <p>
                プロジェクト直下の <code>.env.example</code> をコピーして{' '}
                <code>.env</code> を作り、Firebase コンソールで取得した設定値を記入して
                開発サーバーを起動し直してください。手順は{' '}
                <code>FIREBASE_SETUP.md</code> にあります。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
