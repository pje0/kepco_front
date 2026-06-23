import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/authApi'

/**
 * AuthContext (하이브리드 auth 규격 정밀 보정본)
 * - user: { id, name, role, auth, email, phone, department } | null
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 앱 시작 시 localStorage에서 사용자 정보 복원 및 백엔드 물리 스펙 동기화
  useEffect(() => {
    const restore = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const me = await getMe()
          
          // 💡 [물리 스키마 무결함 보정]: 백엔드가 auth 필드로 유저 권한을 주더라도 role 필드와 완벽 하이브리드 바인딩
          if (me && !me.role && me.auth) {
            me.role = me.auth;
          }
          
          setUser(me)
        }
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password)
    
    // 로그인 직후 페이로드 데이터 유실 차단을 위한 이중 가드 장치
    if (data && data.user && !data.user.role && data.user.auth) {
      data.user.role = data.user.auth;
    }
    
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])
  /** 단일 역할 및 권한 식별 확인 연산 장치 */
  const hasRole = useCallback(
    (role) => {
      if (!user) return false
      
      // 💡 [물리 스키마 무결함 보정]: auth와 role 필드를 동시에 정밀 검증
      const currentRole = user.role || user.auth;
      
      // ROLE_ADMIN 또는 ROLE_ROLE_ADMIN 등 상위 마스터 권한 프리패스 가드
      if (currentRole === 'ROLE_ADMIN' || currentRole === 'ROLE_ROLE_ADMIN') return true
      return currentRole === role;
    },
    [user]
  )

  /** 여러 역할 등급 중 하나라도 매싱되면 true 리턴 (ProtectedRoute 및 AppRouter 전용) */
  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return false
      
      const currentRole = user.role || user.auth;
      if (currentRole === 'ROLE_ADMIN' || currentRole === 'ROLE_ROLE_ADMIN') return true
      
      // 🚨 [이중 접두사 방어 매트릭스]: 백엔드 SecurityConfig 중복 부착 현상 자동 상쇄 가드
      const sanitizedRoles = roles.flatMap(r => [
        r,
        r.replace('ROLE_', ''),
        r.startsWith('ROLE_') ? `ROLE_${r}` : r
      ]);

      return sanitizedRoles.includes(currentRole);
    },
    [user]
  )

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** useAuth 훅 — 컴포넌트 내부 비즈니스 연동 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
