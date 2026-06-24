import axiosInstance from './axiosInstance'

const API_BASE_URL = '/hr'

/**
 * 1. [실제 DB] 임직원 명부 전체 조회 (하이브리드 페이징 및 권한 필터링 대응)
 * - 💡 [물리 스키마 동기화]: 관제창에서 유입되는 'WORKER'를 DB 스펙인 'ROLE_WORKER' 표준 접두사 규격으로 자동 보정하여 송출
 */
export async function getEmployees(params = {}) {
  const queryParams = {};
  
  if (params.role) {
    // 유입된 권한 문자열에 ROLE_ 접두사가 없다면 Spring Security 표준 규격으로 빌딩
    queryParams.role = params.role.startsWith('ROLE_') ? params.role : `ROLE_${params.role}`;
  }

  // axiosInstance 인터셉터에 의해 주소는 자동으로 http://localhost:8383/api/hr/users 로 정렬 통신됩니다.
  return axiosInstance.get(`${API_BASE_URL}/users`, { params: queryParams })
    .then((r) => r.data)
    .catch((err) => {
      console.error('임직원 명부 조회 실패:', err);
      return [];
    });
}

/**
 * 2. [실제 DB] 사원 단건 상세 조회
 */
export async function getEmployee(id) {
  return axiosInstance.get(`${API_BASE_URL}/user/${id}`)
    .then((r) => r.data)
}

/**
 * 3. [실제 DB] 신입 사원 대행 등록
 */
export async function createEmployee(adminUserData) {
  return axiosInstance.post(`${API_BASE_URL}/user`, adminUserData)
    .then((r) => r.data)
}

/**
 * 4. [실제 DB] 사원 정보 및 OpenAI 역량 스펙 통합 수정
 */
export async function updateEmployee(id, adminUserUpdateData) {
  return axiosInstance.put(`${API_BASE_URL}/user/${id}`, adminUserUpdateData)
    .then((r) => r.data)
}

/**
 * 5. [실제 DB] 사원 퇴사 처리 (영구 삭제)
 */
export async function deleteEmployee(id) {
  return axiosInstance.delete(`${API_BASE_URL}/user/${id}`)
    .then((r) => r.data)
}
export async function getAvailableWorkers() {
  // axiosInstance에 의해 자동으로 http://localhost:8383/api/dispatch/available-workers 로 저격 통신됩니다.
  return axiosInstance.get('/dispatch/available-workers')
    .then((r) => r.data)
    .catch((err) => {
      console.error('가용 출동 요원 목록 조회 실패:', err);
      return [];
    });
}