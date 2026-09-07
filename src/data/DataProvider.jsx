import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import {
  fetchAllRecords,
  addRecord as fbAddRecord,
  updateRecord as fbUpdateRecord,
  deleteRecord as fbDeleteRecord,
} from './records.js'
import {
  fetchTags,
  recordTagUsage,
  fetchMaterialStyles,
  setMaterialStyle,
  deleteTag as fbDeleteTag,
} from './tags.js'

const DataContext = createContext(null)

// ログイン後、記録・タグ履歴・教材スタイルを起動時に1回読み込み、
// メモリ上の state として保持する(spec 4章: リアルタイム同期はしない)。
// 追加/編集/削除は Firestore に書いてから state を更新する。
export function DataProvider({ children }) {
  const { uid } = useAuth()
  const [records, setRecords] = useState([])
  const [tags, setTags] = useState({ subjects: [], materials: {}, activities: {}, combos: [] })
  const [materialStyles, setMaterialStyles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const loadedFor = useRef(null)

  const load = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    setError('')
    try {
      const [r, t, s] = await Promise.all([
        fetchAllRecords(uid),
        fetchTags(uid),
        fetchMaterialStyles(uid),
      ])
      setRecords(r)
      setTags(t)
      setMaterialStyles(s)
      loadedFor.current = uid
    } catch (e) {
      setError(e?.message || 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setRecords([])
      setTags({ subjects: [], materials: {}, activities: {}, combos: [] })
      setMaterialStyles({})
      setLoading(false)
      loadedFor.current = null
      return
    }
    if (loadedFor.current !== uid) load()
  }, [uid, load])

  // ---- 記録の操作 ----------------------------------------------------
  const addRecord = useCallback(
    async (input) => {
      const rec = await fbAddRecord(uid, input)
      setRecords((prev) =>
        [rec, ...prev].sort((a, b) =>
          a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt,
        ),
      )
      // タグ履歴・よく使う組み合わせも更新
      try {
        const nextTags = await recordTagUsage(uid, input)
        setTags(nextTags)
      } catch {
        /* 履歴更新の失敗は記録本体を妨げない */
      }
      return rec
    },
    [uid],
  )

  const updateRecord = useCallback(
    async (id, patch) => {
      await fbUpdateRecord(uid, id, patch)
      setRecords((prev) =>
        prev
          .map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r))
          .sort((a, b) =>
            a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt,
          ),
      )
      // 教科/教材/活動を変更した場合、その組み合わせも履歴に残す
      if (patch.subject && patch.material && patch.activity) {
        try {
          const nextTags = await recordTagUsage(uid, patch)
          setTags(nextTags)
        } catch {
          /* 履歴更新の失敗は編集本体を妨げない */
        }
      }
    },
    [uid],
  )

  const deleteRecord = useCallback(
    async (id) => {
      await fbDeleteRecord(uid, id)
      setRecords((prev) => prev.filter((r) => r.id !== id))
    },
    [uid],
  )

  const updateMaterialStyle = useCallback(
    async (subject, material, style) => {
      await setMaterialStyle(uid, subject, material, style)
      const next = await fetchMaterialStyles(uid)
      setMaterialStyles(next)
    },
    [uid],
  )

  // 候補(タグ履歴)から削除。target は { subject } / { subject, material } /
  // { subject, material, activity } のいずれか。過去の記録は消さない。
  const deleteTag = useCallback(
    async (target) => {
      const { tags: nextTags, materialStyles: nextStyles } = await fbDeleteTag(uid, target)
      setTags(nextTags)
      setMaterialStyles(nextStyles)
    },
    [uid],
  )

  const value = {
    records,
    tags,
    materialStyles,
    loading,
    error,
    reload: load,
    addRecord,
    updateRecord,
    deleteRecord,
    updateMaterialStyle,
    deleteTag,
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData は DataProvider の中で使ってください')
  return ctx
}
