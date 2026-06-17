import { Badge } from '@/components/ui/badge'

/**
 * StatusBadge — 신고/파견 상태를 색상 배지로 표시
 *
 * 상태값:
 *   PENDING     → 접수 대기 (노란색)
 *   DISPATCHED  → 출동 중   (파란색)
 *   IN_PROGRESS → 처리 중   (보라색)
 *   COMPLETED   → 완료      (초록색)
 *   CANCELLED   → 취소      (회색)
 */
const STATUS_MAP = {
  PENDING:     { label: '접수 대기', variant: 'warning' },
  DISPATCHED:  { label: '출동 중',   variant: 'info' },
  IN_PROGRESS: { label: '처리 중',   variant: 'default' },
  COMPLETED:   { label: '완료',      variant: 'success' },
  CANCELLED:   { label: '취소',      variant: 'secondary' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, variant: 'outline' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
