import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { watchAuth, signInWithGoogle, signOut } from '../firebase/auth.js'
import { isFirebaseConfigured } from '../firebase/config.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // ログイン状態の変化を購読。初回の判定が返ってきたら loading を解除する。
    const unsub = watchAuth((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = useCallback(async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (e) {
      // ポップアップを閉じただけならエラー表示しない
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
        return
      }
      setError(e?.message || 'ログインに失敗しました')
    }
  }, [])

  const doSignOut = useCallback(async () => {
    setError('')
    try {
      await signOut()
    } catch (e) {
      setError(e?.message || 'サインアウトに失敗しました')
    }
  }, [])

  const value = {
    user,
    uid: user?.uid ?? null,
    loading,
    error,
    configured: isFirebaseConfigured,
    signIn,
    signOut: doSignOut,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は AuthProvider の中で使ってください')
  return ctx
}
