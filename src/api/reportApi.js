import axiosInstance from './axiosInstance';

// =========================================================================
// 🚨 [진짜 DB 통신 영역] 조성민 담당 (시민용 민원 신청 및 내 민원 조회)
// =========================================================================

/**
 * 신규 민원 접수 API
 */
export async function createReport(data) {
  try {
    const response = await axiosInstance.post('/reports', data);
    return response.data;
  } catch (error) {
    console.error('민원 접수 실패:', error);
    throw error;
  }
}

/**
 * 내 민원 목록 조회 API (시민 전용)
 */
export async function getMyReports(citizenId) {
  try {
    const response = await axiosInstance.get(`/reports/my/${citizenId}`);
    return response.data;
  } catch (error) {
    console.error('내 민원 조회 실패:', error);
    throw error;
  }
}

// =========================================================================
// 🩹 [파견 관제팀 서비스 영역] 홍현민 담당 (실시간 PostgreSQL 마스터 매핑)
// =========================================================================

/**
 * 파견팀용 전체 신고 목록 실시간 조회
 * - ⚡ [대문자 개혁]: 소문자 변환 찌꺼기 로직을 전면 박멸하고, DB와 백엔드 규격에 맞춰 확고하게 대문자 전송
 */
export async function getReports(params = {}) {
  const queryParams = {};
  if (params.citizenId) queryParams.citizenId = params.citizenId;
  
  // 💡 [수선]: 기존 .toLowerCase()를 폐기하고 백엔드가 기대하는 대문자(PENDING 등) 포맷을 강제 유지
  if (params.status) {
    queryParams.status = params.status.toUpperCase();
  }

  return axiosInstance.get('/api/complaint', { params: queryParams })
    .then((r) => r.data);
}

/**
 * 파견팀용 단건 민원 상세 실시간 조회
 */
export async function getReport(id) {
  return axiosInstance.get(`/api/complaint/${Number(id)}`)
    .then((r) => r.data);
}

/**
 * 파견팀용 신고 상태 변경 및 대원 배정 트랜잭션
 * - ⚡ [대문자 개혁]: 백엔드 엔티티 수선 스펙과 일치하도록 상태 파라미터를 대문자로 보정 송출
 */
export async function updateReportStatus(id, status, workerId) {
  return axiosInstance.patch(`/api/complaint/${Number(id)}`, { 
    // 💡 [수선]: 대문자(ASSIGNED, IN_PROGRESS, RESOLVED) 패킷 규격 강제 동기화
    status: status ? status.toUpperCase() : undefined, 
    workerId: workerId ? Number(workerId) : undefined 
  })
  .then((r) => r.data);
}
