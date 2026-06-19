import { Link } from 'react-router-dom'
import { FileText, ClipboardList, Users, Truck, HardHat, BarChart3, Bell, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import RoleBadge from '@/components/common/RoleBadge'

const QUICK_MENUS = [
  { to: '/report/new',  label: '정전·고장 신고', icon: FileText,     roles: ['ROLE_CITIZEN'],  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950' },
  { to: '/report/my',   label: '내 신고 현황',   icon: ClipboardList, roles: ['ROLE_CITIZEN'],  color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950' },
  { to: '/employee',    label: '인사관리',        icon: Users,         roles: ['ROLE_HR'],       color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
  { to: '/dispatch',    label: '파견 관리',       icon: Truck,         roles: ['ROLE_DISPATCHER'], color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  { to: '/work',        label: '출동 확인',       icon: HardHat,       roles: ['ROLE_WORKER'],   color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  { to: '/dashboard',   label: '통계 대시보드',   icon: BarChart3,     roles: ['ROLE_ADMIN'],    color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
  { to: '/notice',      label: '공지사항',        icon: Bell,          roles: [],                color: 'text-sky-500',    bg: 'bg-sky-50 dark:bg-sky-950' },
  { to: '/resources',   label: '자료실',          icon: FolderOpen,    roles: [],                color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-950' },
]

export default function HomePage() {
  const { user, hasAnyRole } = useAuth()

  const visibleMenus = QUICK_MENUS.filter(
    (m) => m.roles.length === 0 || hasAnyRole(m.roles)
  )

  return (
    <div className="space-y-6">
      {/* 인사말 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            안녕하세요, {user?.name}님 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.department} · <RoleBadge role={user?.role} />
          </p>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleMenus.map(({ to, label, icon: Icon, color, bg }) => (
            <Link key={to} to={to}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-full ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <span className="text-sm font-medium text-center">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 공지 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">최근 공지사항</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/notice">전체 보기</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="divide-y p-0">
            {[
              { id: 1, title: '2026년 하절기 전력 수급 대책 안내', date: '2026-06-10', isPinned: true },
              { id: 2, title: '정전·고장 신고 시스템 개편 안내', date: '2026-06-05', isPinned: true },
              { id: 3, title: '6월 정기 점검 일정 공지', date: '2026-06-01', isPinned: false },
            ].map((notice) => (
              <div key={notice.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">공지</span>
                  )}
                  <span className="text-sm">{notice.title}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{notice.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
