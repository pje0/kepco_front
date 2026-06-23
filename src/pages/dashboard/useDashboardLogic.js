import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/api/dashboardApi';

export default function useDashboardLogic() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((data) => {
      setStats({
        ...data,
        // 1. 차트용 데이터 변환 (백엔드 Map 객체를 프론트엔드 Array 객체로 변환)
        typeBreakdown: data.reportsByCategory 
          ? Object.entries(data.reportsByCategory).map(([key, value]) => ({ type: key, count: value }))
          : [],
        regionBreakdown: data.reportsByDistrict 
          ? Object.entries(data.reportsByDistrict).map(([key, value]) => ({ region: key, count: value }))
          : [],
        monthlyReports: [], // 백엔드 미구현 데이터 (에러 방지용 빈 배열)

        // 2. KPI 카드용 키값 매핑 (백엔드 변수명을 프론트엔드 변수명으로 연결)
        dispatchedReports: data.inProgressReports || 0,
        totalWorkers: (data.availableEmployees || 0) + (data.busyEmployees || 0) + (data.unavailableEmployees || 0),
        activeWorkers: data.busyEmployees || 0,
        avgResponseMinutes: 0, 
        todayReports: 0 
      });
    }).finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}