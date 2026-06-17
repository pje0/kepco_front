import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/authApi'

/**
 * AuthContext
 * - user: { id, name, role, email, phone, department } | null
 * - isAuthenticated: boolean
 * - isLoading: boolean (초기 로딩 중)
 * - login(username, password): Promise
 * - logout(): Promise
 * - hasRole(role): boolean  — 단일 역할 확인
 * - hasAnyRole(roles[]): boolean — 여러 역할 중 하나라도 해당하면 true
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 앱 시작 시 localStorage에서 사용자 정보 복원
  useEffect(() => {
    const restore = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const me = await getMe()
          setUser(me)
        }
      } catch {
        // 토큰 만료 등 → 로그아웃 처리
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
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  /** 단일 역할 확인 */
  const hasRole = useCallback(
    (role) => {
      if (!user) return false
      // ROLE_ADMIN은 모든 역할 포함
      if (user.role === 'ROLE_ADMIN') return true
      return user.role === role
    },
    [user]
  )

  /** 여러 역할 중 하나라도 해당하면 true */
  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return false
      if (user.role === 'ROLE_ADMIN') return true
      return roles.includes(user.role)
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

/** useAuth 훅 — 컴포넌트에서 사용 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
