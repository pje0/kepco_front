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

  // 📊 TSV 방식 엑셀 추출 (오픈오피스/MS엑셀 칸 쪼개짐 완벽 호환)
  // 오픈오피스 실행 시 구분 기호에 탭 추가
  const exportToExcel = () => {
    if (!stats) return;
    
    // 1. TSV 데이터 생성 (쉼표 대신 무조건 탭(\t)으로 열을 강제 분리)
    let tsvData = "대분류\t분류 항목\t발생 건수\n";
    stats.typeBreakdown.forEach(item => tsvData += `신고 유형별\t${item.type}\t${item.count}\n`);
    stats.monthlyReports.forEach(item => tsvData += `월별 접수건수\t${item.month}\t${item.count}\n`);
    stats.regionBreakdown.forEach(item => tsvData += `지역별 접수건수\t${item.region}\t${item.count}\n`);
    
    tsvData += `\n[처리 현황 요약]\t\t\n`;
    tsvData += `처리 완료\t\t${stats.completedReports}\n`;
    tsvData += `출동 중\t\t${stats.dispatchedReports}\n`;
    tsvData += `접수 대기\t\t${stats.pendingReports}\n`;

    // 2. 한글 깨짐 방지 BOM(\uFEFF) 추가 및 엑셀 전용(.xls) MIME 타입 선언
    const blob = new Blob(['\uFEFF' + tsvData], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    
    // 3. 다운로드 트리거 (확장자를 .xls로 지정)
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `KEPCO_대시보드_통계리포트_${new Date().toISOString().slice(0,10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { stats, isLoading, isAutoRefresh, setIsAutoRefresh, currentTime, exportToExcel };
}