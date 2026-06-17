import axiosInstance from './axiosInstance'

/**
 * mock 사용자 목록
 * DB 저장값: citizen/hr/dispatch/admin/worker
 * Spring Security가 ROLE_ 접두사를 붙여 JWT에 담음
 */
const MOCK_USERS = [
  {
    id: 1,
    username: 'citizen1',
    password: '1234',
    name: '김시민',
    role: 'ROLE_CITIZEN',
    email: 'citizen1@kepco.co.kr',
    phone: '010-1234-5678',
    department: '일반 시민',
  },
  {
    id: 2,
    username: 'hr1',
    password: '1234',
    name: '이인사',
    role: 'ROLE_HR',
    email: 'hr1@kepco.co.kr',
    phone: '010-2345-6789',
    department: '인사팀',
  },
  {
    id: 3,
    username: 'dispatch1',
    password: '1234',
    name: '박파견',
    role: 'ROLE_DISPATCH',
    email: 'dispatch1@kepco.co.kr',
    phone: '010-3456-7890',
    department: '파견관리팀',
  },
  {
    id: 4,
    username: 'admin1',
    password: '1234',
    name: '최관리',
    role: 'ROLE_ADMIN',
    email: 'admin1@kepco.co.kr',
    phone: '010-4567-8901',
    department: '시스템관리팀',
  },
  {
    id: 5,
    username: 'worker1',
    password: '1234',
    name: '정출동',
    role: 'ROLE_WORKER',
    email: 'worker1@kepco.co.kr',
    phone: '010-5678-9012',
    department: '현장출동팀',
  },
]

/**
 * 로그인 API
 *
 * [현재] mock: username/password를 MOCK_USERS에서 검색
 * [실제] TODO: 아래 주석 해제 후 mock 블록 제거
 *   return axiosInstance.post('/auth/login', { username, password })
 *     .then(res => {
 *       // res.data = { accessToken, user: { id, name, role, ... } }
 *       localStorage.setItem('accessToken', res.data.accessToken)
 *       localStorage.setItem('user', JSON.stringify(res.data.user))
 *       return res.data
 *     })
 */
export async function login(username, password) {
  // ── mock 구현 시작 ──
  await new Promise((r) => setTimeout(r, 500)) // 네트워크 지연 시뮬레이션
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  )
  if (!user) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
  }
  const mockToken = `mock-jwt-token-${user.role}-${Date.now()}`
  const { password: _pw, ...safeUser } = user
  localStorage.setItem('accessToken', mockToken)
  localStorage.setItem('user', JSON.stringify(safeUser))
  return { accessToken: mockToken, user: safeUser }
  // ── mock 구현 끝 ──
}

/**
 * 로그아웃 API
 *
 * [현재] mock: localStorage 정리
 * [실제] TODO:
 *   return axiosInstance.post('/auth/logout').finally(() => {
 *     localStorage.removeItem('accessToken')
 *     localStorage.removeItem('user')
 *   })
 */
export async function logout() {
  // ── mock 구현 시작 ──
  await new Promise((r) => setTimeout(r, 200))
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  // ── mock 구현 끝 ──
}

/**
 * 내 정보 조회
 *
 * [현재] mock: localStorage에서 user 정보 반환
 * [실제] TODO:
 *   return axiosInstance.get('/auth/me').then(res => res.data)
 */
export async function getMe() {
  // ── mock 구현 시작 ──
  const raw = localStorage.getItem('user')
  if (!raw) throw new Error('로그인이 필요합니다.')
  return JSON.parse(raw)
  // ── mock 구현 끝 ──
}

/**
 * 비밀번호 변경
 *
 * [현재] mock: 항상 성공
 * [실제] TODO:
 *   return axiosInstance.put('/auth/password', { currentPassword, newPassword })
 */
export async function changePassword(currentPassword, newPassword) {
  // ── mock 구현 시작 ──
  await new Promise((r) => setTimeout(r, 400))
  return { message: '비밀번호가 변경되었습니다.' }
  // ── mock 구현 끝 ──
}
