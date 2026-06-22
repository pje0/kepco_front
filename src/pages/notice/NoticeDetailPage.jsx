import React from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FileText, Calendar, Eye, User, Printer, ListOrdered, Link as LinkIcon, Type, Clock } from 'lucide-react';
import useNoticeDetailLogic from './useNoticeDetailLogic';
import './NoticeDetailPage.css';

export default function NoticeDetailPage() {
  const {
    notice, noticeId, isLoading, surroundingPosts, recentPosts, fontSize, originPage,
    increaseFontSize, decreaseFontSize, displayDate, handleDetailPrint, 
    handleGoBack, handleCopyLink, navigate
  } = useNoticeDetailLogic();

  if (isLoading) return <LoadingSpinner className="h-64" />;

  if (!notice) {
    return (
      <div className="error-container">
        <h2>존재하지 않거나 삭제된 공지사항입니다.</h2>
        <button className="error-back-btn" onClick={handleGoBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="nd-wrapper">
      <div className="nd-grid-layout">
        
        {/* =========================================
            좌측: 메인 상세 본문 (테두리 없는 포털 스타일)
        ========================================= */}
        <div className="nd-main-column">
          <div className="nd-card main-card">
            <div className="nd-header">
              <div className="nd-header-top">
                <div className="nd-badges">
                  {notice.priority === 'high' && <span className="nd-badge urgent">필독 공지</span>}
                  <span className="nd-badge dept">{notice.department || '시스템관리팀'}</span>
                </div>
                
                <div className="nd-utils print-hide">
                  <div className="nd-font-control">
                    <button onClick={decreaseFontSize} title="글자 작게"><Type size={14} />-</button>
                    <div className="nd-divider"></div>
                    <button onClick={increaseFontSize} className="bold" title="글자 크게"><Type size={16} />+</button>
                  </div>
                  <button className="nd-util-btn" onClick={handleCopyLink} title="주소 복사">
                    <LinkIcon size={14} /> 공유
                  </button>
                  <button className="nd-util-btn" onClick={handleDetailPrint}>
                    <Printer size={14} /> 인쇄
                  </button>
                </div>
              </div>
              
              <h1 className="nd-title">{notice.title}</h1>
              
              <div className="nd-meta">
                <div className="nd-meta-item"><User size={14} /> <span>{notice.author || '관리자'}</span></div>
                <div className="nd-dot"></div>
                <div className="nd-meta-item"><Calendar size={14} /> <span>{displayDate(notice.createdAt)}</span></div>
                <div className="nd-dot"></div>
                <div className="nd-meta-item"><Eye size={14} /> <span>조회 {notice.views}</span></div>
              </div>
            </div>

            <div className="nd-content" style={{ fontSize: `${fontSize}px` }}>
              {notice.content}
            </div>
          </div>

          <div className="nd-footer print-hide">
            <button className="nd-back-btn" onClick={handleGoBack}>
              <FileText size={16} /> 목록으로 돌아가기
            </button>
          </div>
        </div>

        {/* =========================================
            우측: 세로 압축형 미니멀 사이드바
        ========================================= */}
        <aside className="nd-sidebar print-hide">
          
          <div className="sidebar-card">
            <div className="sidebar-header">
              <ListOrdered size={14} />
              <h3>주변 게시글</h3>
            </div>
            <div className="sidebar-list">
              {surroundingPosts.map((p) => {
                const isCurrent = String(p.id) === String(noticeId);
                return (
                  <div 
                    key={p.id} 
                    className={`sidebar-item ${isCurrent ? 'is-current' : 'is-normal'}`}
                    onClick={() => { if (!isCurrent) navigate(`/notice/${p.id}?page=${originPage}`); }}
                  >
                    <span className="s-num">{isCurrent ? '현재글' : p.displayNum}</span>
                    <span className="s-title" title={p.title}>{p.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {recentPosts.length > 0 && (
            <div className="sidebar-card recent-posts">
              <div className="sidebar-header">
                <Clock size={14} />
                <h3>최근 읽은 글</h3>
              </div>
              <div className="sidebar-list">
                {recentPosts.map((p) => (
                  <div 
                    key={p.id} 
                    className="sidebar-item is-normal"
                    onClick={() => navigate(`/notice/${p.id}?page=${originPage}`)}
                  >
                    <span className="s-num">{p.displayNum}</span>
                    <span className="s-title" title={p.title}>{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}