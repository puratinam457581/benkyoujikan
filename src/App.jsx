import { AuthProvider, useAuth } from './auth/AuthProvider.jsx'
import { DataProvider } from './data/DataProvider.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { NavigationProvider } from './navigation/NavigationContext.jsx'
import LoginScreen from './auth/LoginScreen.jsx'
import AppShell from './components/AppShell.jsx'

// 画面の出し分け:
//   Firebase未設定 / 未ログイン → LoginScreen
//   ログイン判定中               → スプラッシュ
//   ログイン済み                 → AppShell(ナビ + 各画面)
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  )
}

function Gate() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (!user) return <LoginScreen />

  return (
    <DataProvider>
      <NavigationProvider>
        <AppShell />
      </NavigationProvider>
    </DataProvider>
  )
}

function Splash() {
  return (
    <div className="app-viewport">
      <div className="app-frame">
        <div className="flex h-full items-center justify-center">
          <p className="font-hud text-hud-dim">読み込み中…</p>
        </div>
      </div>
    </div>
  )
}
