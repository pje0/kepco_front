import React from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FileText, Calendar, Eye, User, Printer, ListOrdered, Link as LinkIcon, Clock, ZoomIn, ZoomOut, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // 🚨 관리자 권한 확인용
import { toast } from 'sonner';
import { deleteNotice } from '@/api/noticeApi';
import useNoticeDetailLogic from './useNoticeDetailLogic';
import './NoticeDetailPage.css';
export default function NoticeDetailPage() {
  const { user } = useAuth();
  // 🚨 수정: 시민(ROLE_CITIZEN)을 제외한 모든 한전 직원에게 권한 부여
  const isEmployee = user?.role && user.role !== 'ROLE_CITIZEN';
  
  const {
    notice, noticeId, isLoading, surroundingPosts, recentPosts, originPage,
    displayDate, handleDetailPrint, handleGoBack, handleCopyLink, navigate, // 🚨 hook에서 주는 것만 사용!
    zoomLevel, zoomIn, zoomOut, zoomControlRef
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
                  {/* 🚨 휠 스크롤 줌 컨트롤러 */}
                  <div 
                    ref={zoomControlRef}
                    className="nd-font-control cursor-ns-resize"
                    title="여기에 마우스를 올리고 휠을 위아래로 굴려보세요!"
                  >
                    <button type="button" onClick={zoomOut} title="화면 축소"><ZoomOut size={14} /></button>
                    <div className="nd-divider"></div>
                    <button type="button" onClick={zoomIn} title="화면 확대"><ZoomIn size={14} /></button>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded ml-1 w-12 text-center pointer-events-none">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>
                  
                  {/* 🚨 복구된 공유 및 인쇄 버튼 */}
                  <button className="nd-util-btn" onClick={handleCopyLink} title="주소 복사">
                    <LinkIcon size={14} /> 공유
                  </button>
                  <button className="nd-util-btn" onClick={handleDetailPrint}>
                    <Printer size={14} /> 인쇄
                  </button>

                  {/* 🚨 직원 전용 수정/삭제 버튼 */}
                  {isEmployee && (
                    <>
                      <div className="nd-divider"></div>
                      <button className="nd-util-btn edit" onClick={() => navigate(`/notice/edit/${noticeId}`)}>
                        <Edit size={14} /> 수정
                      </button>
                      <button className="nd-util-btn delete" onClick={() => {
                        if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                          deleteNotice(noticeId).then(() => {
                            toast.success('공지사항이 완벽하게 삭제되었습니다.', { position: 'bottom-right' });
                            navigate('/notice');
                          }).catch(() => toast.error('삭제에 실패했습니다.'));
                        }
                      }}>
                        <Trash2 size={14} /> 삭제
                      </button>
                    </>
                  )}
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

            {/* 🚨 선(hr) 아래 본문에만 zoom 배율 적용 */}
            {/* 🚨 HTML 태그를 인식하여 색상, 볼드체 등을 화면에 그대로 렌더링합니다 */}
            <div 
              className="nd-content ql-editor transition-all duration-200 transform-origin-top" 
              style={{ zoom: zoomLevel }}
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
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