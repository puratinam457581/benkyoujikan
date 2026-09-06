import GroupBreakdown from './GroupBreakdown.jsx'

// 教科別の割合(ドーナツ + 凡例)。GroupBreakdown の教科版ショートカット。
// ホーム・カレンダーが使う。
export default function SubjectBreakdown({ records, centerTop = '合計', size = 176 }) {
  return <GroupBreakdown records={records} field="subject" centerTop={centerTop} size={size} />
}
