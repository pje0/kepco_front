import axiosInstance from './axiosInstance'

let mockDispatches = [
  { id: 1, reportId: 1, reportTitle: '아파트 단지 전체 정전', workerId: 1, workerName: '정출동', dispatchedAt: '2026-06-15 09:45', status: 'IN_PROGRESS', note: '현장 도착, 점검 중' },
  { id: 2, reportId: 3, reportTitle: '변압기 이상 소음', workerId: 2, workerName: '한출동', dispatchedAt: '2026-06-14 15:00', status: 'COMPLETED', note: '변압기 교체 완료' },
]
let nextId = 3

/**
 * 파견 목록 조회
 * [실제] TODO: return axiosInstance.get('/dispatches', { params }).then(r => r.data)
 */
export async function getDispatches(params = {}) {
  await new Promise((r) => setTimeout(r, 300))
  let result = [...mockDispatches]
  if (params.status) result = result.filter((d) => d.status === params.status)
  if (params.workerId) result = result.filter((d) => d.workerId === params.workerId)
  return result
}

/**
 * 파견 지시 생성
 * [실제] TODO: return axiosInstance.post('/dispatches', data).then(r => r.data)
 */
export async function createDispatch(data) {
  await new Promise((r) => setTimeout(r, 400))
  const newDispatch = {
    id: nextId++,
    ...data,
    dispatchedAt: new Date().toLocaleString('ko-KR'),
    status: 'DISPATCHED',
  }
  mockDispatches.push(newDispatch)
  return newDispatch
}

/**
 * 파견 상태 업데이트
 * [실제] TODO: return axiosInstance.patch(`/dispatches/${id}`, { status, note }).then(r => r.data)
 */
export async function updateDispatch(id, data) {
  await new Promise((r) => setTimeout(r, 300))
  const idx = mockDispatches.findIndex((d) => d.id === Number(id))
  if (idx === -1) throw new Error('파견 정보를 찾을 수 없습니다.')
  mockDispatches[idx] = { ...mockDispatches[idx], ...data }
  return mockDispatches[idx]
}
