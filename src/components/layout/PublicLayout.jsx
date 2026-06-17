import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'

/**
 * PublicLayout
 * 로그인 전 페이지(/, /login)에 적용되는 레이아웃
 * 상단 PublicHeader + 본문(Outlet)
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
