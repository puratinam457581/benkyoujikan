import { Plus } from 'lucide-react'
import { useNavigation } from '../navigation/NavigationContext.jsx'

// 画面右下に常時浮かぶ「記録する」ボタン(spec 6章: 押しやすい位置に配置)。
export default function Fab() {
  const { openRecord, record } = useNavigation()
  if (record.open) return null
  return (
    <button type="button" className="fab" onClick={() => openRecord()}>
      <Plus size={20} strokeWidth={2.5} />
      記録する
    </button>
  )
}
