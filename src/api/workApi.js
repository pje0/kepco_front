import axiosInstance from './axiosInstance'

// 내게 배정된 출동 목록 조회
export async function getMyDispatches() {
  return axiosInstance.get('/worker/dispatches').then((r) => r.data)
}

// 출동 상태 변경 (도착/완료)
export async function updateDispatchStatus(id, status, workNote) {
  return axiosInstance
    .patch(`/worker/dispatches/${id}/status`, { status, workNote })
    .then((r) => r.data)
}