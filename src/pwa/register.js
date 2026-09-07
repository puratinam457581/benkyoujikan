import { registerSW } from 'virtual:pwa-register'
import { setNeedRefresh, setOfflineReady, setUpdater } from './updateBus.js'

// Service Worker を登録する。
// これによりアプリのファイル一式が端末にキャッシュされ、ネットワークが
// 無くても起動できるようになる(spec 4章「オフライン時の記録」)。
// Firestore 側のオフライン処理は SDK が別途行う(config.js)。
//
// 'virtual:pwa-register' は vite-plugin-pwa がビルド時に用意する仮想モジュール。
// 実体ファイルは無いので、このファイルは main.jsx からのみ読み込む。

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1時間ごとに更新確認

export function registerPWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // 勝手に再読み込みせず、画面上で知らせて選んでもらう
      setNeedRefresh(true)
    },
    onOfflineReady() {
      setOfflineReady(true)
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => {
        registration.update().catch(() => {
          // オフライン時は確認できないが正常な動作なので何もしない
        })
      }, UPDATE_CHECK_INTERVAL_MS)
    },
    onRegisterError(error) {
      console.error('Service Worker の登録に失敗しました', error)
    },
  })

  setUpdater(updateSW)
}
