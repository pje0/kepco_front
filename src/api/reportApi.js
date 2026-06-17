import axiosInstance from './axiosInstance'

/** mock 신고 데이터 */
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
  },
  {
    id: 3,
    title: '변압기 이상 소음',
    type: '고장',
    address: '서울시 마포구 합정동 789-01',
    status: 'COMPLETED',
    reportedAt: '2026-06-14 14:20',
    citizenId: 2,
    citizenName: '이인사',
    description: '변압기에서 이상한 소리가 납니다.',
    dispatchedAt: '2026-06-14 15:00',
    workerId: 5,
    workerName: '정출동',
  },
]
let nextId = 4

/**
 * 신고 목록 조회
 * [실제] TODO: return axiosInstance.get('/reports', { params }).then(r => r.data)
 */
export async function getReports(params = {}) {
  await new Promise((r) => setTimeout(r, 300))
  let result = [...mockReports]
  if (params.citizenId) result = result.filter((r) => r.citizenId === params.citizenId)
  if (params.status) result = result.filter((r) => r.status === params.status)
  return result
}

/**
 * 신고 단건 조회
 * [실제] TODO: return axiosInstance.get(`/reports/${id}`).then(r => r.data)
 */
export async function getReport(id) {
  await new Promise((r) => setTimeout(r, 200))
  const report = mockReports.find((r) => r.id === Number(id))
  if (!report) throw new Error('신고를 찾을 수 없습니다.')
  return report
}

/**
 * 신고 접수
 * [실제] TODO: return axiosInstance.post('/reports', data).then(r => r.data)
 */
export async function createReport(data) {
  await new Promise((r) => setTimeout(r, 400))
  const newReport = {
    id: nextId++,
    ...data,
    status: 'PENDING',
    reportedAt: new Date().toLocaleString('ko-KR'),
    dispatchedAt: null,
    workerId: null,
    workerName: null,
  }
  mockReports.push(newReport)
  return newReport
}

/**
 * 신고 상태 변경 (파견 담당자용)
 * [실제] TODO: return axiosInstance.patch(`/reports/${id}/status`, { status, workerId }).then(r => r.data)
 */
export async function updateReportStatus(id, status, workerId) {
  await new Promise((r) => setTimeout(r, 300))
  const idx = mockReports.findIndex((r) => r.id === Number(id))
  if (idx === -1) throw new Error('신고를 찾을 수 없습니다.')
  mockReports[idx] = { ...mockReports[idx], status, workerId }
  return mockReports[idx]
}
