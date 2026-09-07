import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerPWA } from './pwa/register.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service Worker を登録(オフライン動作・ホーム画面追加)。描画を待たせないよう render の後で。
registerPWA()
