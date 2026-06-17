import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

/**
 * Layout
 * 로그인 후 모든 보호된 페이지에 적용되는 레이아웃
 *
 * 구조:
 *   ┌──────────────────────────────┐
 *   │  Sidebar  │  Header          │
 *   │  (왼쪽)   │──────────────────│
 *   │           │  <Outlet />      │
 *   │           │  (페이지 본문)   │
 *   └──────────────────────────────┘
 *
 * 모바일: 사이드바는 오버레이 방식으로 열림/닫힘
 * 데스크톱(lg+): 사이드바가 항상 표시
 */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 메인 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
