// src/pages/dashboard/useDashboardLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardStats } from '@/api/dashboardApi';

export default function useDashboardLogic() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🕒 실시간 자동 갱신 상태
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // 🚨 실시간 시계 상태로 변경
  const timerRef = useRef(null);

  // 🚨 1초마다 시계 업데이트 (데이터 갱신과 무관하게 독립적으로 작동)
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const fetchStats = useCallback((silent = false) => {
    if (!silent) setIsLoading(true);
    getDashboardStats().then((data) => {
      setStats({
        ...data,
        typeBreakdown: Array.isArray(data.reportsByCategory) ? data.reportsByCategory : data.reportsByCategory ? Object.entries(data.reportsByCategory).map(([key, value]) => ({ type: key, count: value })) : [],
        regionBreakdown: Array.isArray(data.reportsByDistrict) ? data.reportsByDistrict : data.reportsByDistrict ? Object.entries(data.reportsByDistrict).map(([key, value]) => ({ region: key, count: value })) : [],
        monthlyReports: Array.isArray(data.monthlyReports) ? data.monthlyReports : data.monthlyReports ? Object.entries(data.monthlyReports).map(([key, value]) => ({ month: key, count: value })) : [],
        dispatchedReports: data.inProgressReports || 0,
        totalWorkers: (data.availableEmployees || 0) + (data.busyEmployees || 0) + (data.unavailableEmployees || 0),
        activeWorkers: data.busyEmployees || 0,
        todayReports: 0 
      });
    }).finally(() => {
      if (!silent) setIsLoading(false);
    });
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // 🕒 시연 최적화: 버튼 켜는 즉시 1회 갱신 및 10초 단위 백그라운드 갱신
  useEffect(() => {
    if (isAutoRefresh) {
      fetchStats(true); // 🚨 버튼을 ON으로 켜는 순간 즉시 시간을 최신화
      timerRef.current = setInterval(() => fetchStats(true), 10000); // 🚨 시연용으로 10초(10000ms)마다 갱신되도록 단축
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isAutoRefresh, fetchStats]);

  // 📊 HTML Table 기반 엑셀(.xls) 추출 (콤마 분리 오류 완벽 해결)
  const exportToExcel = () => {
    if (!stats) return;
    const tableHtml = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"></head>
        <body>
          <table border="1">
            <tr><th>대분류</th><th>분류 항목</th><th>발생 건수</th></tr>
            ${stats.typeBreakdown.map(item => `<tr><td>신고 유형별</td><td>${item.type}</td><td>${item.count}</td></tr>`).join('')}
            ${stats.monthlyReports.map(item => `<tr><td>월별 접수건수</td><td>${item.month}</td><td>${item.count}</td></tr>`).join('')}
            ${stats.regionBreakdown.map(item => `<tr><td>지역별 접수건수</td><td>${item.region}</td><td>${item.count}</td></tr>`).join('')}
            <tr><td colspan="3"></td></tr>
            <tr><th colspan="3" style="text-align:left;">[처리 현황 요약]</th></tr>
            <tr><td colspan="2">처리 완료</td><td>${stats.completedReports}</td></tr>
            <tr><td colspan="2">출동 중</td><td>${stats.dispatchedReports}</td></tr>
            <tr><td colspan="2">접수 대기</td><td>${stats.pendingReports}</td></tr>
          </table>
        </body>
      </html>
    `;
    // 🚨 한글 깨짐(Mojibake) 방지를 위해 \uFEFF (BOM) 추가 및 charset 명시
    const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KEPCO_대시보드_통계리포트_${new Date().toISOString().slice(0,10)}.xls`;
    link.click();
  };

  return { stats, isLoading, isAutoRefresh, setIsAutoRefresh, currentTime, exportToExcel };
}