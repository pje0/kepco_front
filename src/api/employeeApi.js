import axiosInstance from './axiosInstance'

const API_BASE_URL = '/hr'

/**
 * 1. [실제 DB] 임직원 명부 전체 조회 (하이브리드 페이징용)
 * - 백엔드 URL 변경: GET /api/hr/users ➡️ GET /api/hr/users/all
 * - 응답: AdminUserResponseDto 기반 임직원 전체 배열 반환
 */
export async function getEmployees() {
  // 🌟 /users 대신 백엔드의 2-5번 메서드 주소인 /users/all 로 변경합니다.
  return axiosInstance.get(`${API_BASE_URL}/users/all`)
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
 */
export async function createEmployee(adminUserData) {
  return axiosInstance.post(`${API_BASE_URL}/user`, adminUserData)
    .then((r) => r.data)
}

/**
 * 4. [실제 DB] 사원 정보 및 OpenAI 역량 스펙 통합 수정
 * - 백엔드 URL: PUT /api/hr/user/{id}
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
