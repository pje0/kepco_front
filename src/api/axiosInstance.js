import axios from 'axios'

/**
 * ─────────────────────────────────────────────────────────────
 * [API 계층] KEPCO MIS 공인 인증 보안 통신 인스턴스 (인프라 매싱 수선본)
 * - vite.config.js의 server.proxy(/api) 장치가 정상 작동할 수 있도록
 *   프록시 트리거 문자열 유실 결함을 원천 방어 완료했습니다.
 * ─────────────────────────────────────────────────────────────
 */
const axiosInstance = axios.create({
  // ⚡ [근본 해결]: 절대 주소를 제거하고 Vite 내장 프록시 접두사 장착
  baseURL: '/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── 요청 인터셉터: 프록시 트리거 보호막 가동 및 Bearer 토큰 영구 적재
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url) {
      let cleanUrl = config.url;
      
      // 💡 [중요]: 각 API 파일에서 주입된 중복 주소(/api/api) 패턴만 정밀 소독합니다.
      if (cleanUrl.startsWith('/api/api')) {
        cleanUrl = cleanUrl.replace('/api/api', '/api');
      }
      
      // 🚀 Vite 프록시가 안전하게 가로챌 수 있도록 config.url 맨 앞의 '/api' 접두사 유실을 원천 방어합니다.
      // 만약 각 api/*.js 파일에서 '/api'를 생략하고 쐈다면, 자동으로 프록시 경로를 결합해 줍니다.
      if (!cleanUrl.startsWith('/api')) {
        cleanUrl = cleanUrl.startsWith('/') ? `/api${cleanUrl}` : `/api/${cleanUrl}`;
      }
      
      // 🚨 Axios 내부 규격상 baseURL이 '/api'이면 config.url과 중복 결합되어 '/api/api/complaint'가 되는 현상을 방지하기 위해
      // config.url에서 베이스 중복 구역을 지워 최종 프록시 경로 규칙을 강제 조율합니다.
      config.url = cleanUrl.replace('/api', '');
    }

    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── 응답 인터셉터: 비인가 예외 세션 인프라 제어 가드 가동
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
