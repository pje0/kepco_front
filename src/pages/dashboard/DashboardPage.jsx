// src/pages/dashboard/DashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, AlertTriangle, CheckCircle, RefreshCw, Download, FileSpreadsheet, X, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useDashboardLogic from './useDashboardLogic';
import DashboardFAB from './DashboardFAB';
import './DashboardPage.css';

/** 간단한 막대 차트 (SVG 기반, 외부 라이브러리 없음) */ 
function BarChart({ data, valueKey, labelKey, color = '#3b82f6', onDrillDown }) { 
  if (!data || data.length === 0) return <div className="chart-empty">데이터가 없습니다.</div>; 
  const max = Math.max(...data.map((d) => d[valueKey])); 
  return ( 
    <div className="bar-chart-container"> 
      {data.map((item) => { 
        const height = max > 0 ? (item[valueKey] / max) * 100 : 0; 
        return ( 
          <div key={item[labelKey]} className={`bar-col ${onDrillDown ? 'cursor-pointer hover-chart' : ''}`} title="클릭하여 상세 조회"
               onClick={() => onDrillDown && onDrillDown(labelKey, item[labelKey], item[valueKey])}> 
            <span className="bar-val">{item[valueKey]}</span> 
            {/* 🚨 막대가 숫자를 밀어내고 뚫고 나가지 못하도록 가둬두는 트랙 추가 */}
            <div className="bar-track">
              <div className="bar-fill" style={{ height: `${height}%`, backgroundColor: color }} /> 
            </div>
            <span className="bar-label">{item[labelKey]}</span> 
          </div> 
        ); 
      })} 
    </div> 
  ); 
}

/** 🎯 드릴다운 클릭 이벤트를 추가한 도넛 차트 */
function DonutChart({ data, onDrillDown }) {
  if (!data || data.length === 0) return <div className="chart-empty">데이터가 없습니다.</div>;
  const total = data.reduce((s, d) => s + d.count, 0);
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
  let offset = 0;
  
  const segments = data.map((d, i) => {
    const pct = total > 0 ? (d.count / total) * 100 : 0;
    const seg = { ...d, pct, offset, color: COLORS[i % COLORS.length] };
    offset += pct;
    return seg;
  });
  
  const circ = 2 * Math.PI * 40;

  return (
    <div className="donut-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {segments.map((seg) => (
          <circle key={seg.type} cx="50" cy="50" r={40} fill="none" stroke={seg.color} strokeWidth="18"
            strokeDasharray={`${(seg.pct / 100) * circ} ${circ}`} strokeDashoffset={-((seg.offset / 100) * circ)}
            transform="rotate(-90 50 50)" className={onDrillDown ? 'cursor-pointer hover-donut' : ''}
            onClick={() => onDrillDown && onDrillDown('유형별', seg.type, seg.count)}><title>클릭하여 상세 조회</title>
          </circle>
        ))}
      </svg>
      <div className="donut-legend">
        {segments.map((seg) => (
          <div key={seg.type} className={`donut-item ${onDrillDown ? 'cursor-pointer hover-legend' : ''}`} onClick={() => onDrillDown && onDrillDown('유형별', seg.type, seg.count)}>
            <span className="donut-dot" style={{ backgroundColor: seg.color }} />
            <span className="donut-text">{seg.type}</span><span className="donut-num">{seg.count}</span><span className="donut-text">({seg.pct.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAT_CARDS = [
  { key: 'pendingReports',  label: '접수 대기',    icon: AlertTriangle, theme: 'kpi-yellow' },
  { key: 'dispatchedReports', label: '출동 중',   icon: TrendingUp,    theme: 'kpi-indigo' },
  { key: 'completedReports', label: '최근 7일 완료', icon: CheckCircle,   theme: 'kpi-green', link: '/dispatch/history' },
  { key: 'totalWorkers',    label: '전체 요원',    icon: Users,         theme: 'kpi-purple' },
  { key: 'activeWorkers',   label: '출동 중 요원', icon: Users,         theme: 'kpi-orange' },
  { key: 'todayReports',    label: '오늘 신고',    icon: BarChart3,     theme: 'kpi-red' },
];

export default function DashboardPage() {
  const { stats, isLoading, isAutoRefresh, setIsAutoRefresh, currentTime, exportToExcel } = useDashboardLogic();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner className="h-64" />;
  const summaryTotal = stats.pendingReports + stats.dispatchedReports + stats.completedReports;

  // 📄 브라우저 내장 인쇄 최적화를 통한 PDF 추출
  const handlePrintPDF = () => window.print();

  return (
    <div className="db-wrapper" id="print-area">
      {/* 🎛️ 상단 제어 패널 */}
      <div className="db-header-panel">
        <div className="db-header">
          <BarChart3 className="db-icon text-blue-600" />
          <h1 className="db-title">통계 대시보드</h1>
          <span className="text-sm text-gray-400 ml-4 hidden sm:block">{currentTime.toLocaleTimeString()}</span> {/* 🚨 텍스트 제거 및 실시간 연동 */}
        </div>
        <div className="db-controls no-print">
          <button className={`control-btn ${isAutoRefresh ? 'active' : ''}`} onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
            <RefreshCw size={16} className={isAutoRefresh ? 'animate-spin text-blue-600' : ''} /> {/* 🚨 정방향 아이콘으로 교체 */}
            <span className="hidden sm:inline">{isAutoRefresh ? '자동 갱신 ON' : '자동 갱신 OFF'}</span>
          </button>
          <button className="control-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={16} className="text-green-600" /><span className="hidden sm:inline">Excel 추출</span>
          </button>
          <button className="control-btn" onClick={handlePrintPDF}>
            <Download size={16} className="text-red-500" /><span className="hidden sm:inline">PDF 리포트</span>
          </button>
        </div>
      </div>

      <div className="db-kpi-grid">
        {STAT_CARDS.map(({ key, label, icon: Icon, theme, link }) => (
          <Card key={key} className={`kpi-card-hover ${link ? 'cursor-pointer' : ''}`} onClick={() => link && navigate(link)}>
            <CardContent className="p-4">
              <div className={`kpi-card-inner ${theme}`}><div className="kpi-header"><p className="kpi-label">{label}</p><div className="kpi-icon-wrap"><Icon size={16} /></div></div><p className="kpi-value">{stats[key]}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="db-chart-grid">
        {/* 1. 신고 유형별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">신고 유형별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={stats.typeBreakdown} />
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base">월별 신고 건수 (최근 6개월)</CardTitle></CardHeader>
          <CardContent><BarChart data={stats.monthlyReports} valueKey="count" labelKey="month" color="#3b82f6" /></CardContent>
        </Card>
        {/* 3. 지역별 신고 건수 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">지역별 신고 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={stats.regionBreakdown} valueKey="count" labelKey="region" color="#10b981" />
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base">처리 현황 요약</CardTitle></CardHeader>
          <CardContent className="summary-container">
            {[{ label: '처리 완료율', value: summaryTotal > 0 ? ((stats.completedReports / summaryTotal) * 100).toFixed(1) + '%' : '0%', color: 'bg-green' },
              { label: '출동 중 비율', value: summaryTotal > 0 ? ((stats.dispatchedReports / summaryTotal) * 100).toFixed(1) + '%' : '0%', color: 'bg-blue' },
              { label: '대기 비율', value: summaryTotal > 0 ? ((stats.pendingReports / summaryTotal) * 100).toFixed(1) + '%' : '0%', color: 'bg-yellow' }]
            .map(({ label, value, color }) => (
              <div key={label}>
                <div className="prog-header"><span className="prog-label">{label}</span><span className="prog-val">{value}</span></div>
                <div className="prog-track"><div className={`prog-fill ${color}`} style={{ width: value }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 🚀 우측 하단 플로팅 퀵 메뉴 */}
      <DashboardFAB />
    </div>
  );
}