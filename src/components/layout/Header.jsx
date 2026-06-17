import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, LogOut, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import RoleBadge from '@/components/common/RoleBadge'

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm">
      {/* 햄버거 버튼 (모바일에서 사이드바 열기) */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* 로고 (모바일에서만 표시) */}
      <div className="flex items-center gap-2 font-bold text-primary lg:hidden">
        <Zap className="h-5 w-5 fill-primary" />
        <span>KEPCO MIS</span>
      </div>

      {/* 우측 영역 */}
      <div className="ml-auto flex items-center gap-3">
        {/* 사용자 정보 */}
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <RoleBadge role={user.role} />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        )}

        {/* 테마 전환 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="테마 전환"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* 마이페이지 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/mypage')}
          aria-label="마이페이지"
        >
          <User className="h-4 w-4" />
        </Button>

        {/* 로그아웃 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="로그아웃"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
