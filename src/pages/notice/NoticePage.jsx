import React from 'react';
import { Bell, Search, Printer, Eye, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react'; // 🚨 Edit3 추가
import { useAuth } from '@/context/AuthContext'; // 로그인 유저 확인용
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom'; // 🚨 추가: 페이지 이동 함수
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useNoticeLogic from './useNoticeLogic';
import './NoticePage.css';

export default function NoticePage() {
  const { user } = useAuth(); 
  const isAdmin = user?.role === 'ROLE_ADMIN'; 
  const navigate = useNavigate(); // 🚨 추가: 플로팅 버튼용
  const {
    notices, isLoading,
    startDate, endDate, rangeType, searchCondition, searchKeyword, searchDept,
    setSearchCondition, setSearchKeyword, setSearchDept,
    sortBy, setSortBy, pageSize, setPageSize, currentPage,
    isModalOpen, setIsModalOpen, modalData, modalIndex, handleModalNav,
    filteredAndSortedNotices, currentNotices, totalPages, pageNumbers, indexOfFirstNotice,
    paginate, handleDateRange, handleDateChange, isNewPost, displayDate,
    handlePrint, handleSearch, handleTitleClick, openQuickView,
    appliedFilters, visitedPosts
  } = useNoticeLogic();

  // 🚨 [신규 기능 2] 검색어 하이라이팅 함수
  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === keyword.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 text-blue-900 font-bold px-0.5 rounded">{part}</span> : part
    );
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="notice-container">
      <div className="notice-header print-hide">
        <Bell className="notice-icon" />
        <h1 className="notice-title">공지사항</h1>
      </div>

      {/* ── 1. 상단 조건별 통합 검색 바 영역 ── */}
      <div className="search-box print-hide">
        <div className="search-row">
          <label className="search-label">등록일</label>
          <div className="search-input-group">
            <input type="date" className="input-box w-32" value={startDate} onChange={(e) => handleDateChange(true, e.target.value)} />
            <span className="tilde">~</span>
            <input type="date" className="input-box w-32" value={endDate} onChange={(e) => handleDateChange(false, e.target.value)} />
            <div className="quick-btn-group">
              {['직접입력', '오늘', '1주일', '1개월', '6개월', '1년'].map((btn) => (
                <button key={btn} className={`quick-btn ${rangeType === btn ? 'active' : ''}`} onClick={() => handleDateRange(btn)}>
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="search-row mt-3">
          <label className="search-label">검색어</label>
          <div className="search-input-group flex-1">
            <select className="input-box w-28" value={searchCondition} onChange={(e) => setSearchCondition(e.target.value)}>
              <option value="title_content">제목+내용</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
            <input 
              type="text" 
              className="input-box flex-1" 
              placeholder="검색어를 입력하세요" 
              value={searchKeyword} 
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            />
            <div className="divider" />
            <label className="search-label w-auto pr-2">부서찾기</label>
            <select className="input-box w-36" value={searchDept} onChange={(e) => setSearchDept(e.target.value)}>
              <option value="전체">전체 부서</option>
              <option value="총괄관리부">총괄관리부</option>
              <option value="인사관리팀">인사관리팀</option>
              <option value="시스템운영팀">시스템운영팀</option>
              <option value="안전관리본부">안전관리본부</option>
              <option value="복구팀">복구팀</option>
            </select>
            <button className="search-submit-btn" onClick={handleSearch}>
              <Search size={16} /> 조회
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. 중단 데이터 제어 바 영역 ── */}
      <div className="control-bar print-hide">
        <div className="control-left">
          <span className="total-count">
            조회 결과 <strong className="text-blue-700">{filteredAndSortedNotices.length}</strong>건 
            <span className="text-slate-400 ml-1">(전체 {notices.length}건)</span>
          </span>
        </div>
        <div className="control-right">
          <select className="input-box" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="title">제목순</option>
            <option value="dept">부서순</option>
            <option value="views">조회순</option>
          </select>
          <select className="input-box" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
            <option value="10">10개씩</option>
            <option value="20">20개씩</option>
            <option value="30">30개씩</option>
            <option value="40">40개씩</option>
            <option value="50">50개씩</option>
          </select>
          <button className="print-btn" onClick={handlePrint}>
            <Printer size={16} /> 현재 화면 인쇄
          </button>
        </div>
      </div>

      {/* ── 3. 메인 게시판 리스트 테이블 ── */}
      <div className="table-wrapper">
        <table className="notice-table">
          <thead>
            <tr>
              <th className="th-num">번호</th>
              <th className="th-title">제목</th>
              <th className="th-dept">작성부서</th>
              <th className="th-date">작성일</th>
              <th className="th-views">조회수</th>
            </tr>
          </thead>
          <tbody>
            {currentNotices.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-message">검색 조건에 일치하는 공지사항이 없습니다.</td>
              </tr>
            ) : (
              currentNotices.map((notice, index) => {
                const deptName = notice.department || notice.author || '시스템관리팀';
                const realIndex = filteredAndSortedNotices.length - (indexOfFirstNotice + index);
                
                // 🚨 String 변환으로 타입 불일치 방지 (완벽한 방문 기록 체크)
                const isVisited = visitedPosts && visitedPosts.some(vId => String(vId) === String(notice.id));
                
                return (
                  <tr key={notice.id} className="table-row">
                    <td className="td-num">
                      {notice.isPinned ? <Badge className="badge-pinned">공지</Badge> : realIndex}
                    </td>
                    <td className="td-title text-left">
                      <button className="quick-view-btn" title="간단히 보기 (모달)" onClick={() => openQuickView(notice)}>
                        <Eye size={18} />
                      </button>
                      <span 
                        className={`title-link transition-colors ${
                          notice.isPinned ? 'font-bold text-black' : ''
                        } ${isVisited ? 'text-slate-400' : 'text-slate-700'}`} 
                        onClick={() => handleTitleClick(notice.id)} 
                        title="상세 페이지로 이동"
                      >
                        {highlightText(notice.title, appliedFilters.keyword)}
                      </span>
                      {isNewPost(notice.createdAt) && <span className="icon-n">N</span>}
                    </td>
                    <td className={`td-dept ${isVisited ? 'text-slate-400' : ''}`}>{deptName}</td>
                    <td className={`td-date ${isVisited ? 'text-slate-400' : ''}`}>{displayDate(notice.createdAt)}</td>
                    <td className={`td-views font-semibold ${isVisited ? 'text-slate-400' : 'text-slate-600'}`}>{notice.views}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. 하단 고정 스퀘어형 페이지네이션 바 ── */}
      {totalPages > 0 && (
        <div className="pagination-container print-hide">
          <button className="page-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>이전</button>
          <div className="page-numbers">
            {pageNumbers.map(number => (
              <button key={number} className={`page-number ${currentPage === number ? 'active' : ''}`} onClick={() => paginate(number)}>
                {number}
              </button>
            ))}
          </div>
          <button className="page-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>다음</button>
        </div>
      )}

      {/* ── 5. 간단히 보기 기능 모달 팝업 윈도우 ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl leading-relaxed text-slate-900 pr-6">
              {modalData?.priority === 'high' && <Badge className="bg-red-500 mr-2">필독</Badge>}
              {modalData ? highlightText(modalData.title, appliedFilters.keyword) : '데이터를 불러오는 중입니다...'}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-2 pt-2 border-t">
              <span className="font-medium text-blue-800">{modalData?.department}</span>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-700">{modalData?.author}</span>
              <span className="text-slate-300">|</span>
              <span>{modalData ? displayDate(modalData.createdAt) : ''}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-[150px] max-h-[400px] overflow-y-auto py-4 text-slate-700 whitespace-pre-wrap leading-loose">
            {modalData ? (
              <div 
                className="ql-editor p-0" 
                dangerouslySetInnerHTML={{ __html: modalData.content }} 
              />
            ) : (
              <LoadingSpinner className="h-24" />
            )}
          </div>

          {/* 🚨 추가됨: 하단 심플 화살표 네비게이션 및 상세보기 버튼 */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 print-hide">
            <button
              onClick={() => handleModalNav(-1)}
              disabled={modalIndex <= 0}
              className="p-2 -ml-2 text-slate-300 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="이전 글"
            >
              <ChevronLeft size={36} strokeWidth={1.5} />
            </button>

            {/* 🚨 [신규] 상세 페이지 이동 버튼 추가 */}
            <button
              onClick={() => {
                setIsModalOpen(false); // 모달 닫기
                if (modalData?.id) handleTitleClick(modalData.id); // 상세 페이지로 이동
              }}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#1e3a8a] rounded hover:bg-blue-800 transition-colors"
            >
              상세보기
            </button>

            <button
              onClick={() => handleModalNav(1)}
              disabled={modalIndex >= filteredAndSortedNotices.length - 1}
              className="p-2 -mr-2 text-slate-300 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="다음 글"
            >
              <ChevronRight size={36} strokeWidth={1.5} />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =관리자 전용 플로팅 글쓰기 버튼 */}
      {isAdmin && (
        <button 
          className="notice-write-fab print-hide"
          onClick={() => navigate('/notice/new')}
        >
          <Edit3 size={14} /> 새 공지사항
        </button>
      )}
    </div>
  );
}