import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, ChevronDown, ChevronUp, Search, MapPin, User, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import useReportMyLogic from './useReportMyLogic';
import './ReportMyPage.css';

export default function ReportMyPage() {
  const {
    isLoading,
    expandedId,
    rangeType,
    startDate,
    endDate,
    searchStatus,
    searchCondition,
    searchKeyword,
    filteredReports,
    setStartDate,
    setEndDate,
    setRangeType,
    setSearchStatus,
    setSearchCondition,
    setSearchKeyword,
    handleDateRange,
    handleSearch,
    toggleAccordion,
    formatDisplayDate,
    reports // 🚨 전체 리스트 길이 계산을 위해 꺼내옵니다.
  } = useReportMyLogic();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="rm-container">
      
      {/* ── 헤더 타이틀 영역 ── */}
      <div className="rm-header">
        <div className="rm-title-wrap">
          <ClipboardList className="rm-title-icon" />
          <h1 className="rm-title">내 신고 현황</h1>
        </div>
        <Link to="/report/new" className="rm-new-btn">
          <Plus size={16} className="icon-mr" /> 새 신고 접수
        </Link>
      </div>

      {/* ── 통합 검색 필터 박스 ── */}
      <div className="rm-search-box">
        
        {/* 기간 필터 */}
        <div className="rm-search-row">
          <span className="rm-label">조회 기간</span>
          <div className="rm-input-wrap">
            <input 
              type="date" 
              className="rm-input" 
              value={startDate} 
              onChange={e => {setStartDate(e.target.value); setRangeType('직접입력')}} 
            />
            <span className="rm-tilde">~</span>
            <input 
              type="date" 
              className="rm-input" 
              value={endDate} 
              onChange={e => {setEndDate(e.target.value); setRangeType('직접입력')}} 
            />
            <div className="rm-quick-btns">
              {['1주일', '1개월', '3개월', '6개월', '1년', '전체'].map((btn) => (
                <button 
                  key={btn} 
                  className={`rm-quick-btn ${rangeType === btn ? 'active' : ''}`} 
                  onClick={() => handleDateRange(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 상세 검색 필터 */}
        <div className="rm-search-row">
          <span className="rm-label">상세 검색</span>
          <div className="rm-input-wrap">
            <select className="rm-input rm-select" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
              <option value="전체">상태 전체</option>
              <option value="미처리">미처리</option>
              <option value="처리중">처리중</option>
              <option value="처리완료">처리완료</option>
            </select>
            <div className="rm-divider" />
            <select className="rm-input rm-select" value={searchCondition} onChange={e => setSearchCondition(e.target.value)}>
              <option value="title">제목</option>
              <option value="id">신청번호</option>
            </select>
            <input 
              type="text" 
              className="rm-input rm-search-input" 
              placeholder="검색어를 입력하세요" 
              value={searchKeyword} 
              onChange={e => setSearchKeyword(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSearch()} 
            />
            <button type="button" onClick={handleSearch} className="rm-search-btn">
              <Search size={16} className="icon-mr" /> 조회
            </button>
          </div>
        </div>
      </div>

      {/* ── 건수 표시 ── */}
      <div className="rm-result-count">
        조회 결과 <strong>{filteredReports.length}</strong> 건
      </div>

      {/* ── 아코디언 리스트 영역 ── */}
      <div className="rm-list-wrapper">
        
        {/* 컬럼 헤더 (리스트 설명줄) */}
        {filteredReports.length > 0 && (
          <div className="rm-list-header print-hide">
            <div className="rm-item-info">
              <span className="rm-item-no">신청번호</span>
              <div className="rm-item-status">처리상태</div>
              <span className="rm-item-title">신고 제목</span>
              <span className="rm-item-date">신고 일시</span>
            </div>
            <div className="rm-item-arrow"></div>
          </div>
        )}

        {filteredReports.length === 0 ? (
          <div className="rm-empty">
            <ClipboardList className="rm-empty-icon" />
            조건에 일치하는 민원 내역이 없습니다.
          </div>
        ) : (
          filteredReports.map((report) => {
            // 🚨 핵심 수정: DB ID가 아닌 '유저 기준 몇 번째 신고인지' 순차 번호 부여
            const displayNum = reports.length - reports.findIndex(r => r.id === report.id);

            return (
              <div key={report.id} className="rm-list-item">
                
                {/* 항상 보이는 1줄 요약 (Row) */}
                <div 
                  className="rm-item-header"
                  onClick={() => toggleAccordion(report.id)}
                >
                  <div className="rm-item-info">
                    <span className="rm-item-no">NO. {displayNum}</span>
                    <div className="rm-item-status">
                      <StatusBadge status={report.status} />
                    </div>
                    <span className="rm-item-title">{report.title}</span>
                    <span className="rm-item-date">{formatDisplayDate(report.createdAt)}</span>
                  </div>
                  <div className="rm-item-arrow">
                    {expandedId === report.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>

                {/* 클릭 시 스르륵 열리는 본문 영역 */}
                {expandedId === report.id && (
                  <div className="rm-item-content animate-in slide-in-from-top-2">
                    <div className="rm-content-grid">
                      
                      {/* 왼쪽 정보 */}
                      <div className="rm-content-left">
                        <div className="rm-info-row">
                          <MapPin size={18} className="rm-info-icon" />
                          <div className="rm-info-text-group">
                            <div className="rm-info-label">발생 위치</div>
                            <div className="rm-info-value">{report.address}</div>
                          </div>
                        </div>
                        <div className="rm-info-row">
                          <User size={18} className="rm-info-icon" />
                          <div className="rm-info-text-group">
                            <div className="rm-info-label">처리 담당 (분석/배정)</div>
                            <div className="rm-info-value rm-worker-wrap">
                              <span className="rm-worker-category">{report.category || '분석 대기'}</span>
                              <span className="rm-info-sep">|</span>
                              <span className="rm-worker-name">{report.assignedWorkerName || '담당자 배정 중'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽 정보 */}
                      <div className="rm-content-right">
                        <FileText size={18} className="rm-info-icon" />
                        <div className="rm-detail-wrap">
                          <div className="rm-info-label">신고 상세 내용</div>
                          <p className="rm-detail-text">
                            {report.content}
                          </p>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}