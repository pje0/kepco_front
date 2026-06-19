import axiosInstance from './axiosInstance'

// mock 데이터: 실제 archive + archive_attachment에서 올 모양과 동일하게 맞춤
const mockResources = [
  { id: 1, title: '정전 신고 매뉴얼 v2.0',  category: '매뉴얼',   fileType: 'PDF',  fileSize: '2.3MB', uploadedAt: '2026-05-20', downloads: 128, fileUrl: '/files/archive/1/outage-manual-v2.pdf' },
  { id: 2, title: '전기 안전 교육 자료',      category: '교육자료', fileType: 'PPTX', fileSize: '5.1MB', uploadedAt: '2026-05-15', downloads: 89,  fileUrl: '/files/archive/2/safety-edu.pptx' },
  { id: 3, title: '2025년 정전 통계 보고서', category: '보고서',   fileType: 'PDF',  fileSize: '1.8MB', uploadedAt: '2026-04-30', downloads: 203, fileUrl: '/files/archive/3/outage-stats-2025.pdf' },
  { id: 4, title: '현장 출동 체크리스트',     category: '서식',     fileType: 'DOCX', fileSize: '0.5MB', uploadedAt: '2026-04-10', downloads: 67,  fileUrl: '/files/archive/4/dispatch-checklist.docx' },
]

/**
 * 자료실 목록 조회
 *   { id, title, category, fileType, fileSize, uploadedAt, downloads, fileUrl }
 *     id         ← archive.id
 *     title      ← archive.title
 *     category   ← archive.category
 *     uploadedAt ← archive.created_at
 *     downloads  ← archive.download_count
 *     fileType   ← archive_attachment.file_name 확장자에서 추출 (PDF/PPTX/DOCX/XLSX)
 *     fileSize   ← archive_attachment.file_size(BIGINT)를 사람이 읽는 문자열로 포맷 (예: '2.3MB')
 *     fileUrl    ← archive_attachment.file_url (다운로드용)
 */
export async function getResources(params = {}) {
  return axiosInstance.get('/archive', { params }).then((r) => r.data)
}

export async function downloadResource(id) {
  try {
    const res = await axiosInstance.get(`/archive/${id}/download`, { responseType: 'blob' })

    // 파일명 추출 (디코딩 실패해도 죽지 않게)
    const disposition = res.headers['content-disposition'] || ''
    let filename = 'download'
    const match = disposition.match(/filename="?([^";]+)"?/i)
    if (match) {
      try {
        filename = decodeURIComponent(match[1])
      } catch {
        filename = match[1]   // 디코딩 안 되면 원본 그대로 사용
      }
    }

    const url = window.URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)   // DOM에 붙여야 click이 확실히 동작
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('다운로드 실패:', e)
    alert('다운로드에 실패했습니다. 콘솔을 확인해주세요.')
  }
}
