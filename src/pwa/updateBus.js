// Service Worker の状態を画面側に伝えるための小さな入れ物。
// 登録処理(register.js)は Vite の仮想モジュールを読み込むため、
// 画面コンポーネントから直接触らず、状態だけここに置いて切り離す。

let state = {
  needRefresh: false, // 新しいバージョンが用意できている
  offlineReady: false, // 初回キャッシュ完了(オフラインで動く)
}

const listeners = new Set()
let updater = null

function emit(patch) {
  state = { ...state, ...patch }
  for (const listener of listeners) listener()
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState() {
  return state
}

export function setNeedRefresh(value) {
  emit({ needRefresh: value })
}
export function setOfflineReady(value) {
  emit({ offlineReady: value })
}

export function setUpdater(fn) {
  updater = fn
}

export async function applyUpdate() {
  if (!updater) return
  await updater(true)
}

export function dismissUpdate() {
  emit({ needRefresh: false })
}
export function dismissOfflineReady() {
  emit({ offlineReady: false })
}
