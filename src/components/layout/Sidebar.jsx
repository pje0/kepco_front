import { NavLink } from 'react-router-dom'
import {
  Home,
  Bell,
  FolderOpen,
  User,
  FileText,
  ClipboardList,
  Users,
  Truck,
  HardHat,
  BarChart3,
  History, // 🚨 [추가] 과거 이력 메뉴용 시각적 앵커 아이콘 임포트
  Zap,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * 역할별 메뉴 정의
 * roles 배열: 해당 메뉴를 볼 수 있는 역할 목록 (빈 배열 = 로그인 후 누구나)
 */
const NAV_ITEMS = [
  // 공통
  { to: '/home',      label: '홈',        icon: Home,          roles: [] },
  { to: '/notice',    label: '공지사항',  icon: Bell,          roles: [] },
  { to: '/mypage',    label: '마이페이지', icon: User,          roles: [] },
  // 시민 제외 전부(자료실)
  { to: '/resources', label: '자료실',    icon: FolderOpen,    roles: ['ROLE_HR', 'ROLE_DISPATCH', 'ROLE_DISPATCHER', 'ROLE_WORKER', 'ROLE_ADMIN'] },
  // 시민
  { to: '/report/new', label: '정전·고장 신고', icon: FileText,     roles: ['ROLE_CITIZEN'] },
  { to: '/report/my',  label: '내 신고 현황',   icon: ClipboardList, roles: ['ROLE_CITIZEN'] },
  // 인사
  { to: '/employee',  label: '인사관리',  icon: Users,         roles: ['ROLE_HR'] },
  // 파견
  { to: '/dispatch',  label: '파견 관리', icon: Truck,         roles: ['ROLE_DISPATCHER'], exact: true },
  
  // 🔐 [최종 과업: 관제 책임자 전용 동적 은닉 메뉴 등록]
  // - 컨벤션에 맞춰 '파견 관리' 바로 아래에 정교하게 배치 완료했습니다.
  // - AppRouter 가드 스펙과 100% 일치시켜 오직 관리자 및 파견관제 운영진에게만 동적으로 노출합니다.
  { 
    to: '/dispatch/history', 
    label: '과거 완료 이력', 
    icon: History, 
    roles: ['ROLE_DISPATCH', 'ROLE_DISPATCHER', 'ROLE_ADMIN'], 
  },
  
  // 출동요원
  { to: '/work',      label: '출동 확인', icon: HardHat,       roles: ['ROLE_WORKER'] },
  // 관리자
  { to: '/dashboard', label: '통계 대시보드', icon: BarChart3,  roles: ['ROLE_ADMIN'] },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, hasAnyRole } = useAuth()

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || hasAnyRole(item.roles)
  )

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-sidebar-background text-sidebar-foreground',
          'flex flex-col transition-transform duration-300 ease-in-out',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 로고 영역 */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-bold text-white">
            <Zap className="h-6 w-6 fill-sidebar-primary text-sidebar-primary" />
            <span>KEPCO MIS</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 사용자 정보 */}
        {user && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user.department}</p>
          </div>
        )}

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )
                  }
                >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40 text-center">
            © 2026 한국전력공사
          </p>
        </div>
      </aside>
    </>
  )
}
