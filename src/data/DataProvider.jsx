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
import {
  fetchMaster,
  fetchAppConfig,
  reconcileMaster,
  addMasterMaterial as fbAddMaster,
  setMaterialDone as fbSetDone,
  renameMasterMaterial as fbRename,
  deleteMasterMaterial as fbDeleteMaster,
  deleteMasterSubject as fbDeleteMasterSubject,
  seedMasterMaterials as fbSeedMaster,
  setPhaseStart as fbSetPhaseStart,
} from './master.js'

const DataContext = createContext(null)

const EMPTY_TAGS = { subjects: [], materials: {}, activities: {}, combos: [] }

// ログイン後、記録・タグ履歴・教材スタイル・教材マスタ・設定を起動時に1回読み込み、
// メモリ上の state として保持する(spec 4章: リアルタイム同期はしない)。
// 追加/編集/削除は Firestore に書いてから state を更新する。
export function DataProvider({ children }) {
  const { uid } = useAuth()
  const [records, setRecords] = useState([])
  const [tags, setTags] = useState(EMPTY_TAGS)
  const [materialStyles, setMaterialStyles] = useState({})
  const [master, setMaster] = useState({ items: [] })
  const [appConfig, setAppConfig] = useState({ phaseStart: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const loadedFor = useRef(null)

  const load = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    setError('')
    try {
      const [r, t, s, m, cfg] = await Promise.all([
        fetchAllRecords(uid),
        fetchTags(uid),
        fetchMaterialStyles(uid),
        fetchMaster(uid),
        fetchAppConfig(uid),
      ])
      setRecords(r)
      setTags(t)
      setMaterialStyles(s)
      setAppConfig(cfg)
      // 記録・タグに出てくる教材でマスタに無いものを取り込む(非破壊)
      const { master: m2 } = await reconcileMaster(uid, m, r, t)
      setMaster(m2)
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
      setTags(EMPTY_TAGS)
      setMaterialStyles({})
      setMaster({ items: [] })
      setAppConfig({ phaseStart: '' })
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
      try {
        const nextTags = await recordTagUsage(uid, input)
        setTags(nextTags)
      } catch {
        /* 履歴更新の失敗は記録本体を妨げない */
      }
      // 記録した教材がマスタに無ければ足す
      if (input.subject && input.material) {
        try {
          const next = await fbAddMaster(uid, input.subject, input.material, master)
          if (next !== master) setMaster(next)
        } catch {
          /* マスタ更新の失敗は記録本体を妨げない */
        }
      }
      return rec
    },
    [uid, master],
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
      if (patch.subject && patch.material && patch.activity) {
        try {
          const nextTags = await recordTagUsage(uid, patch)
          setTags(nextTags)
        } catch {
          /* noop */
        }
      }
      if (patch.subject && patch.material) {
        try {
          const next = await fbAddMaster(uid, patch.subject, patch.material, master)
          if (next !== master) setMaster(next)
        } catch {
          /* noop */
        }
      }
    },
    [uid, master],
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

  const deleteTag = useCallback(
    async (target) => {
      const { tags: nextTags, materialStyles: nextStyles } = await fbDeleteTag(uid, target)
      setTags(nextTags)
      setMaterialStyles(nextStyles)
    },
    [uid],
  )

  // ---- 教材マスタの操作 --------------------------------------------
  const addMaterial = useCallback(
    async (subject, name) => {
      const next = await fbAddMaster(uid, subject, name, master)
      setMaster(next)
    },
    [uid, master],
  )
  const setMaterialDone = useCallback(
    async (id, done) => {
      setMaster(await fbSetDone(uid, id, done, master))
    },
    [uid, master],
  )
  const renameMaterial = useCallback(
    async (id, name) => {
      setMaster(await fbRename(uid, id, name, master))
    },
    [uid, master],
  )
  // マスタから教材を削除。タグ履歴・色設定・組み合わせも合わせて掃除する。
  const deleteMaterial = useCallback(
    async (id) => {
      const item = master.items.find((it) => it.id === id)
      const next = await fbDeleteMaster(uid, id, master)
      setMaster(next)
      if (item) {
        try {
          const { tags: nt, materialStyles: ns } = await fbDeleteTag(uid, {
            subject: item.subject,
            material: item.name,
          })
          setTags(nt)
          setMaterialStyles(ns)
        } catch {
          /* noop */
        }
      }
    },
    [uid, master],
  )
  const deleteSubject = useCallback(
    async (subject) => {
      const next = await fbDeleteMasterSubject(uid, subject, master)
      setMaster(next)
      try {
        const { tags: nt, materialStyles: ns } = await fbDeleteTag(uid, { subject })
        setTags(nt)
        setMaterialStyles(ns)
      } catch {
        /* noop */
      }
    },
    [uid, master],
  )
  const seedMaterials = useCallback(async () => {
    setMaster(await fbSeedMaster(uid, master))
  }, [uid, master])

  const setPhaseStart = useCallback(
    async (dateStr) => {
      await fbSetPhaseStart(uid, dateStr)
      setAppConfig((prev) => ({ ...prev, phaseStart: dateStr }))
    },
    [uid],
  )

  const value = {
    records,
    tags,
    materialStyles,
    master,
    appConfig,
    loading,
    error,
    reload: load,
    addRecord,
    updateRecord,
    deleteRecord,
    updateMaterialStyle,
    deleteTag,
    addMaterial,
    setMaterialDone,
    renameMaterial,
    deleteMaterial,
    deleteSubject,
    seedMaterials,
    setPhaseStart,
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData は DataProvider の中で使ってください')
  return ctx
}
