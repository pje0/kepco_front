// src/pages/dashboard/useDashboardLogic.js
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/api/dashboardApi';

export default function useDashboardLogic() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((data) => {
      setStats({
        ...data,
        // 차트용 데이터 안전 변환 (이미 배열인지 확인하여 이중 매핑 방지)
        typeBreakdown: Array.isArray(data.reportsByCategory)
          ? data.reportsByCategory
          : data.reportsByCategory 
            ? Object.entries(data.reportsByCategory).map(([key, value]) => ({ type: key, count: value }))
            : [],
            
        regionBreakdown: Array.isArray(data.reportsByDistrict)
          ? data.reportsByDistrict
          : data.reportsByDistrict 
            ? Object.entries(data.reportsByDistrict).map(([key, value]) => ({ region: key, count: value }))
            : [],
            
        monthlyReports: Array.isArray(data.monthlyReports)
          ? data.monthlyReports
          : data.monthlyReports 
            ? Object.entries(data.monthlyReports).map(([key, value]) => ({ month: key, count: value }))
            : [],

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