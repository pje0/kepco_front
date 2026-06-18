import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from './ProtectedRoute'
import LandingPage from '@/pages/common/LandingPage'
import HomePage from '@/pages/common/HomePage'
import MyPage from '@/pages/common/MyPage'
import ResourcePage from '@/pages/resource/ResourcePage'
import WorkPage from '@/pages/work/WorkPage'

/**
 * 앱 라우팅 정의 (뼈대)
 *
 * 각자 담당 페이지가 생기면 아래처럼 자기 라우트를 추가하세요.
 *
 * 1) 페이지 import (파일 맨 위)
 *    import WorkPage from '@/pages/work/WorkPage'
 *    import ProtectedRoute from './ProtectedRoute'   // 보호 라우트 쓸 때
 *
 * 2) 공개 페이지 (로그인 불필요) — PublicLayout 안에 넣기
 *    <Route element={<PublicLayout />}>
 *      <Route path="/login" element={<LoginPage />} />
 *    </Route>
 *
 * 3) 로그인만 하면 누구나
 *    <Route element={<ProtectedRoute />}>
 *      <Route path="/mypage" element={<MyPage />} />
 *    </Route>
 *
 * 4) 특정 역할만 (ROLE_ADMIN은 항상 통과)
 *    <Route element={<ProtectedRoute allowedRoles={['ROLE_WORKER']} />}>
 *      <Route path="/work" element={<WorkPage />} />
 *    </Route>
 */

export default function AppRouter() {
  return (
    <Routes>
      {/* ===== 공개 영역 (로그인 전) ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Route>

      {/* ===== 로그인 영역 (ProtectedRoute → Layout) ===== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/mypage" element={<MyPage />} />

          {/* 로그인하면 누구나 */}
          <Route path="/resources" element={<ResourcePage />} />

          {/* 출동요원만 (관리자는 항상 통과) */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_WORKER']} />}>
            <Route path="/work" element={<WorkPage />} />
          </Route>

        </Route>
      </Route>
    </Routes>
  )
}
