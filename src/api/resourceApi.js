import axiosInstance from './axiosInstance'

const mockResources = [
  { id: 1, title: '정전 신고 매뉴얼 v2.0', category: '매뉴얼', fileType: 'PDF', fileSize: '2.3MB', uploadedAt: '2026-05-20', downloads: 128 },
  { id: 2, title: '전기 안전 교육 자료', category: '교육자료', fileType: 'PPTX', fileSize: '5.1MB', uploadedAt: '2026-05-15', downloads: 89 },
  { id: 3, title: '2025년 정전 통계 보고서', category: '보고서', fileType: 'PDF', fileSize: '1.8MB', uploadedAt: '2026-04-30', downloads: 203 },
  { id: 4, title: '현장 출동 체크리스트', category: '서식', fileType: 'DOCX', fileSize: '0.5MB', uploadedAt: '2026-04-10', downloads: 67 },
]

/**
 * [실제] TODO: return axiosInstance.get('/resources').then(r => r.data)
 */
export async function getResources(params = {}) {
  await new Promise((r) => setTimeout(r, 200))
  let result = [...mockResources]
  if (params.category) result = result.filter((r) => r.category === params.category)
  return result
}
