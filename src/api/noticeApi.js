import axiosInstance from './axiosInstance'

const mockNotices = [
  { id: 1, title: '2026년 하절기 전력 수급 대책 안내', author: '관리자', createdAt: '2026-06-10', views: 342, isPinned: true, content: '하절기 전력 수급 안정을 위한 절전 협조를 부탁드립니다.' },
  { id: 2, title: '정전·고장 신고 시스템 개편 안내', author: '관리자', createdAt: '2026-06-05', views: 215, isPinned: true, content: '신고 시스템이 새롭게 개편되었습니다.' },
  { id: 3, title: '6월 정기 점검 일정 공지', author: '운영팀', createdAt: '2026-06-01', views: 180, isPinned: false, content: '6월 정기 점검 일정을 안내드립니다.' },
  { id: 4, title: '전기 안전 캠페인 실시', author: '안전팀', createdAt: '2026-05-28', views: 97, isPinned: false, content: '전기 안전 캠페인을 실시합니다.' },
]

/**
 * [실제] TODO: return axiosInstance.get('/notices').then(r => r.data)
 */
export async function getNotices() {
  await new Promise((r) => setTimeout(r, 200))
  return mockNotices
}

/**
 * [실제] TODO: return axiosInstance.get(`/notices/${id}`).then(r => r.data)
 */
export async function getNotice(id) {
  await new Promise((r) => setTimeout(r, 150))
  return mockNotices.find((n) => n.id === Number(id)) || null
}
