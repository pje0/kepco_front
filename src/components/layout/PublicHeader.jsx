import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function PublicHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <Zap className="h-6 w-6 fill-primary" />
          <span className="text-lg">KEPCO MIS</span>
        </Link>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
