import axiosInstance from './axiosInstance'

/**
 * 대시보드 통계 데이터
 * [실제] TODO: return axiosInstance.get('/dashboard/stats').then(r => r.data)
 */
export async function getDashboardStats() {
  await new Promise((r) => setTimeout(r, 400))
  return {
    totalReports: 1284,
    pendingReports: 47,
    dispatchedReports: 23,
    completedReports: 1214,
    totalWorkers: 38,
    activeWorkers: 12,
    avgResponseMinutes: 28,
    todayReports: 15,
    // 월별 신고 건수 (최근 6개월)
    monthlyReports: [
      { month: '1월', count: 198 },
      { month: '2월', count: 175 },
      { month: '3월', count: 210 },
      { month: '4월', count: 189 },
      { month: '5월', count: 223 },
      { month: '6월', count: 156 },
    ],
    // 신고 유형별
    typeBreakdown: [
      { type: '정전', count: 742 },
      { type: '고장', count: 398 },
      { type: '기타', count: 144 },
    ],
    // 지역별
    regionBreakdown: [
      { region: '서울', count: 312 },
      { region: '경기', count: 287 },
      { region: '인천', count: 145 },
      { region: '부산', count: 198 },
      { region: '기타', count: 342 },
    ],
  }
}
