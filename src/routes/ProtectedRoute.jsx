import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * 역할 기반 접근 제어
 * @param {string[]} [allowedRoles] 허용 역할. 생략하면 로그인만 하면 통과.
 *                                  (ROLE_ADMIN은 hasAnyRole에서 항상 통과)
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth()

  // 세션 복원 중에는 판단 보류 (새로고침 시 튕김 방지)
  if (isLoading) return null

  // 로그인 안 했으면 로그인 페이지로
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // 역할 제한이 있는데 내 역할이 아니면 홈으로
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}