import axios from 'axios'

/**
 * ─────────────────────────────────────────────────────────────
 * [API 계층] axios 인스턴스
 *
 * 현재: mock 모드 (실제 요청 없음)
 * 실제 연동 시:
 *   1. VITE_API_BASE_URL 환경변수를 .env에 설정
 *   2. 아래 baseURL 주석 해제
 *   3. 각 api/*.js 파일에서 axiosInstance를 사용해 실제 호출
 * ─────────────────────────────────────────────────────────────
 */
const axiosInstance = axios.create({
  // TODO: Spring Boot 연동 시 아래 주석 해제
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  baseURL: '/api', // 개발 프록시용 (vite.config server.proxy 설정 필요)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── 요청 인터셉터: localStorage에서 JWT 토큰을 꺼내 Authorization 헤더에 주입
axiosInstance.interceptors.request.use(
  (config) => {
    // TODO: Spring Boot + JWT 연동 시 이 블록이 실제로 동작함
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── 응답 인터셉터: 401 → 로그인 페이지로 리다이렉트
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Spring Boot JWT 만료 시 토큰 갱신(refresh) 로직 추가 가능
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
