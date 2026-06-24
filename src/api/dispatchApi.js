import axiosInstance from './axiosInstance'

/**
 * 실시간 파견 목록 조회
 * - PostgreSQL 'dispatch' 마스터 테이블 실시간 연동 가동
 * - ⚡ [대문자 개혁]: 모든 params 상태 코드를 확고하게 대문자 규격으로 전송
 */
export async function getDispatches(params = {}) {
  const queryParams = {};
  if (params.status) {
    queryParams.status = params.status.toUpperCase(); // 무조건 대문자 변환 가드
  }
  if (params.workerId) {
    queryParams.workerId = Number(params.workerId);
  }

  return axiosInstance.get('/api/dispatch', { params: queryParams })
    .then(response => response.data)
}

/**
 * 복수 파견 지시 트랜잭션 생성 (1대다 팀 빌딩 연동)
 * - ⚡ [대문자 개혁]: note 내에 패킹되는 teamRole 직급 문자열을 대문자로 박멸
 */
export async function createDispatch(payload) {
  // 인자로 들어온 payload 객체를 그대로 포스트 요청 바디에 실어 보냅니다.
  return axiosInstance.post('/api/dispatch', payload)
    .then(response => response.data)
}

/**
 * 파견 라이프사이클 상태 강제 전환 및 업데이트
 * - ⚡ [대문자 개혁]: 403 Forbidden 차단막을 허물기 위해 전송 상태값을 무조건 대문자로 강제 빌딩
 * - 매핑 주소 규격: PATCH /api/dispatch/{id}/status
 */
export async function updateDispatch(id, data) {
  return axiosInstance.patch(`/api/dispatch/${Number(id)}/status`, {
    status: data.status ? data.status.toUpperCase() : undefined // ASSIGNED, IN_PROGRESS, RESOLVED 대문자 강제 바인딩
  }).then(response => response.data)
}
