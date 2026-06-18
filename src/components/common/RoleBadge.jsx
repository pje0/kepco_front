import { Badge } from '@/components/ui/badge'

const ROLE_MAP = {
  ROLE_CITIZEN:  { label: '시민',     variant: 'secondary' },
  ROLE_HR:       { label: '인사담당', variant: 'info' },
  ROLE_DISPATCHER: { label: '파견담당', variant: 'warning' },
  ROLE_ADMIN:    { label: '관리자',   variant: 'destructive' },
  ROLE_WORKER:   { label: '출동요원', variant: 'success' },
}

export default function RoleBadge({ role }) {
  const config = ROLE_MAP[role] || { label: role, variant: 'outline' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
