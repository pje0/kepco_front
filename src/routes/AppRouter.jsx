import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import ProtectedRoute from './ProtectedRoute' // 🔒 권한 방어용 라우트 (존재 확인 필요)
import Layout from '@/components/layout/Layout' // 💡 로그인 유저용 진짜 조립식 Layout 임포트
import RegisterPage from '@/pages/auth/RegisterPage'

// 📁 1. 공통 영역 (common / auth)
import LandingPage from '@/pages/common/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import HomePage from '@/pages/common/HomePage'
import MyPage from '@/pages/common/MyPage'
import NotFoundPage from '@/pages/common/NotFoundPage'

// 📁 2. 기능별 실무 영역 (직무 이원화 매핑)
import DashboardPage from '@/pages/dashboard/DashboardPage'
import DispatchPage from '@/pages/dispatch/DispatchPage'
import EmployeePage from '@/pages/employee/EmployeePage'
import NoticePage from '@/pages/notice/NoticePage'
import NoticeDetailPage from '@/pages/notice/NoticeDetailPage'
import NoticeFormPage from '@/pages/notice/NoticeFormPage'
import WorkPage from '@/pages/work/WorkPage'
import ResourcePage from '@/pages/resource/ResourcePage'
import DispatchHistory from '@/pages/dispatch/DispatchHistory'

// 📁 3. 신고 처리 영역 (report)
import ReportNewPage from '@/pages/report/ReportNewPage'
import ReportMyPage from '@/pages/report/ReportMyPage'

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
      {/* 🟢 [공개 영역] - 로그인 전 누구나 접근 가능 */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 🟡 [인증 필수 영역] - 로그인만 하면 누구나 (시민/임직원 공통) */}
      <Route element={<ProtectedRoute />}>
        {/* 💡 Layout 컴포넌트로 내부 보호 경로들을 통째로 감싸서 상단바/사이드바를 조립합니다. */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          {/* 💡 Sidebar.jsx의 메뉴 주소인 /resources 와 철자를 완벽하게 일치시켰습니다. */}
          <Route path="/resources" element={<ResourcePage />} />
              
          {/* 민원 신고 접수 및 내역 확인 */}
          <Route path="/report/new" element={<ReportNewPage />} />
          <Route path="/report/my" element={<ReportMyPage />} />

          {/* 🚨 [임직원 전용 권한 제한] - 공지사항 작성 및 수정은 시민(ROLE_CITIZEN) 제외 모든 직원 접근 가능 */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_HR', 'ROLE_DISPATCHER', 'ROLE_DISPATCH', 'ROLE_WORKER']} />}>
            <Route path="/notice/new" element={<NoticeFormPage />} />
            <Route path="/notice/edit/:id" element={<NoticeFormPage />} />
          </Route>

          {/* 🔴 [인사팀 전용 권한 제한] - ROLE_HR 또는 ROLE_ADMIN만 */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_HR', 'ROLE_ADMIN']} />}>
            <Route path="/employee" element={<EmployeePage />} />
          </Route>

          {/* 🔴 [파견관리팀 전용 권한 제한] - ROLE_DISPATCHER, ROLE_DISPATCH 또는 ROLE_ADMIN만 */}
          {/* 💡 Sidebar.jsx 및 백엔드 설정과의 크래시를 방지하기 위해 권한 명칭을 이중 매핑했습니다. */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_DISPATCH', 'ROLE_DISPATCHER', 'ROLE_ADMIN']} />}>
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dispatch/history" element={<DispatchHistory />} />
          </Route>

          {/* 🔴 [현장출동 기사 전용 권한 제한] - ROLE_WORKER만 */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_WORKER']} />}>
            <Route path="/work" element={<WorkPage />} />
          </Route>
        </Route>
      </Route>

      {/* 🚫 [404 예외 처리] - 정의되지 않은 주소는 전부 NotFound 페이지로 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}