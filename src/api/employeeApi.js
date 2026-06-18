import axiosInstance from './axiosInstance'

// 💡 vite.config.js에서 '/api' 경로를 프록시 처리하고 있으므로, 
// 백엔드 AuthController에 튜닝 완료한 '/api/hr' 주소 체계와 완벽 동기화합니다.
const API_BASE_URL = '/hr'

/**
 * 1. [실제 DB] 임직원 명부 전체 조회
 * - 백엔드 URL: GET /api/hr/users
 * - 응답: AdminUserResponseDto 기반 임직원 전체 배열 반환
 */
export async function getEmployees(params = {}) {
  return axiosInstance.get(`${API_BASE_URL}/users`, { params })
    .then((r) => r.data)
}

/**
 * 2. [실제 DB] 사원 단건 상세 조회
 * - 백엔드 URL: GET /api/hr/user/{id}
 */
export async function getEmployee(id) {
  return axiosInstance.get(`${API_BASE_URL}/user/${id}`)
    .then((r) => r.data)
}

/**
 * 3. [실제 DB] 신입 사원 대행 등록
 * - 백엔드 URL: POST /api/hr/user
 * - 페이로드: AdminUserRegisterDto 11개 필드 규격
 * - 주의: role 전송 시 백엔드 보정식에 맞게 접두사를 제외한 단어(WORKER 등)를 실어 보냅니다.
 */
export async function createEmployee(adminUserData) {
  return axiosInstance.post(`${API_BASE_URL}/user`, adminUserData)
    .then((r) => r.data)
}

/**
 * 4. [실제 DB] 사원 정보 및 OpenAI 역량 스펙 통합 수정
 * - 백엔드 URL: PUT /api/hr/user/{id}
 * - 페이로드: AdminUserUpdateRequestDto 규격
 */
export async function updateEmployee(id, adminUserUpdateData) {
  return axiosInstance.put(`${API_BASE_URL}/user/${id}`, adminUserUpdateData)
    .then((r) => r.data)
}

/**
 * 5. [실제 DB] 사원 퇴사 처리 (영구 삭제)
 * - 백엔드 URL: DELETE /api/hr/user/{id}
 */
export async function deleteEmployee(id) {
  return axiosInstance.delete(`${API_BASE_URL}/user/${id}`)
    .then((r) => r.data)
}
