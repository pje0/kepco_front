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
// 🩹 [가짜 Mock 데이터 영역] 홍현민 담당 (파견팀/대시보드 에러 방지용 복구)
// =========================================================================

let mockReports = [
  {
    id: 1,
    title: '아파트 단지 전체 정전',
    type: '정전',
    address: '서울시 강남구 역삼동 123-45',
    status: 'DISPATCHED',
    reportedAt: '2026-06-15 09:12',
    citizenId: 1,
    citizenName: '김시민',
    description: '어제 저녁부터 아파트 전체가 정전 상태입니다.',
    dispatchedAt: '2026-06-15 09:45',
    workerId: 5,
    workerName: '정출동',
  },
  {
    id: 2,
    title: '가로등 고장',
    type: '고장',
    address: '서울시 서초구 방배동 456-78',
    status: 'PENDING',
    reportedAt: '2026-06-16 07:30',
    citizenId: 1,
    citizenName: '김시민',
    description: '골목 가로등 3개가 며칠째 꺼져 있습니다.',
    dispatchedAt: null,
    workerId: null,
    workerName: null,
  }
];
let nextId = 3;

/**
 * 파견팀용 전체 신고 목록 조회 (Mock)
 */
export async function getReports(params = {}) {
  await new Promise((r) => setTimeout(r, 300));
  let result = [...mockReports];
  if (params.citizenId) result = result.filter((r) => r.citizenId === params.citizenId);
  if (params.status) result = result.filter((r) => r.status === params.status);
  return result;
}

/**
 * 파견팀용 단건 조회 (Mock)
 */
export async function getReport(id) {
  await new Promise((r) => setTimeout(r, 200));
  const report = mockReports.find((r) => r.id === Number(id));
  if (!report) throw new Error('신고를 찾을 수 없습니다.');
  return report;
}

/**
 * 파견팀용 신고 상태 변경 (Mock)
 */
export async function updateReportStatus(id, status, workerId) {
  await new Promise((r) => setTimeout(r, 300));
  const idx = mockReports.findIndex((r) => r.id === Number(id));
  if (idx === -1) throw new Error('신고를 찾을 수 없습니다.');
  mockReports[idx] = { ...mockReports[idx], status, workerId };
  return mockReports[idx];
}