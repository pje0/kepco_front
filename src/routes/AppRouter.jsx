import { Routes, Route } from 'react-router-dom'

/**
 * 앱 라우팅 정의 (뼈대)
 *
 * 각자 담당 페이지가 생기면 아래처럼 자기 라우트를 추가하세요.
 *
 * 1) 페이지 import (파일 맨 위)
 *    import WorkPage from '@/pages/work/WorkPage'
 *    import ProtectedRoute from './ProtectedRoute'   // 보호 라우트 쓸 때
 *
 * 2) 공개 페이지 (로그인 불필요)
 *    <Route path="/" element={<LandingPage />} />
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
      {/* 임시 화면 — 페이지가 추가되면 이 줄은 지우세요 */}
      <Route
        path="/"
        element={
          <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>KEPCO MIS 프론트엔드</h1>
            <p>기본 설정 완료. 각자 담당 페이지를 추가하세요.</p>
          </div>
        }
      />

      {/* ===== 여기에 각자 라우트를 추가 ===== */}

    </Routes>
  )
}