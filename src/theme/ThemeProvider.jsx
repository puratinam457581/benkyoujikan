import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const KEY = 'benkyoujikan-theme'
const ThemeContext = createContext(null)

// index.html の先行スクリプトが起動前に <html data-theme> を確定させている。
// ここではその値を引き継ぎ、切り替え時に data-theme と theme-color を更新する。
function readInitial() {
  if (typeof document !== 'undefined') {
    const t = document.documentElement.dataset.theme
    if (t === 'light' || t === 'dark') return t
  }
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#070b14')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* プライベートブラウズ等では保存できないが動作には影響しない */
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme は ThemeProvider の中で使ってください')
  return ctx
}
