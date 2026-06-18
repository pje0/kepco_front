import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getNotice, getNotices } from '@/api/noticeApi'; 
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FileText, Calendar, Eye, User, Printer, ListOrdered } from 'lucide-react';
import './NoticePage.css';

export default function NoticeDetailPage() {
  const { id: noticeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const originPage = searchParams.get('page') || '1';

  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [surroundingPosts, setSurroundingPosts] = useState([]);

  useEffect(() => {
    if (noticeId) {
      loadNoticeAndNeighbors();
    }
  }, [noticeId]);

  const loadNoticeAndNeighbors = async () => {
    setIsLoading(true);
    try {
      // 1. 현재 상세 데이터 수집
      const currentData = await getNotice(noticeId);
      setNotice(currentData);

      // 2. 전체 목록에서 주변 게시글 추출
      const allList = await getNotices();
      if (Array.isArray(allList)) {
        allList.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 🚨 목록에서 보던 것과 동일하게 화면용 번호(displayNum)를 미리 계산해서 부여합니다.
        const listWithNums = allList.map((item, index) => ({
          ...item,
          displayNum: item.isPinned ? '공지' : allList.length - index
        }));

        const currentIndex = listWithNums.findIndex(item => String(item.id) === String(noticeId));

        if (currentIndex !== -1) {
          const startIdx = Math.max(0, currentIndex - 2);
          const endIdx = Math.min(listWithNums.length - 1, currentIndex + 2);
          
          setSurroundingPosts(listWithNums.slice(startIdx, endIdx + 1));
        }
      }
    } catch (error) {
      console.error("데이터 통신 오류: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDetailPrint = () => window.print();
  const handleGoBack = () => navigate(`/notice?page=${originPage}`);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  if (!notice) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-700">존재하지 않거나 삭제된 공지사항입니다.</h2>
        <button className="mt-6 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800" onClick={handleGoBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 notice-detail-view">
      
      {/* ── 1. 메인 상세 카드 ── */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:shadow-none print:border-black">
        
        <div className="border-t-4 border-t-blue-700 p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {notice.priority === 'high' && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1">필독 공지</Badge>
              )}
              <span className="text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                {notice.department || '시스템관리팀'}
              </span>
            </div>
            
            <button 
              className="print-hide flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded hover:bg-slate-100 transition-colors"
              onClick={handleDetailPrint}
            >
              <Printer size={14} /> 인쇄하기
            </button>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-snug tracking-tight">
            {notice.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600 bg-slate-50/80 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <span className="font-medium">{notice.author || '관리자'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span>{displayDate(notice.createdAt)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-slate-400" />
              <span>조회 {notice.views}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 min-h-[300px]">
          <div className="prose max-w-none text-slate-800 leading-loose whitespace-pre-wrap text-[15px] md:text-base">
            {notice.content}
          </div>
        </div>
      </div>

      {/* ── 2. 통합된 주변 게시글 리스트 영역 ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print-hide">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <ListOrdered size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700 text-sm">주변 게시글</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {surroundingPosts.map((p) => {
            const isCurrent = String(p.id) === String(noticeId);
            
            return (
              <div 
                key={p.id} 
                className={`flex items-center px-6 py-3.5 transition-colors ${
                  isCurrent 
                    ? 'bg-blue-50/40 cursor-default' 
                    : 'hover:bg-slate-50 cursor-pointer'
                }`}
                onClick={() => {
                  if (!isCurrent) navigate(`/notice/${p.id}?page=${originPage}`);
                }}
              >
                {/* 🚨 수정됨: 하이픈(-) 대신 실제 게시글 번호 또는 '공지' 텍스트를 출력합니다. */}
                <span className={`w-16 shrink-0 text-xs text-center font-medium ${
                  isCurrent ? 'text-blue-600 font-bold' : 'text-slate-400'
                }`}>
                  {isCurrent ? '현재글' : p.displayNum}
                </span>

                <span className={`flex-1 truncate px-4 ${
                  isCurrent 
                    ? 'font-bold text-slate-900' 
                    : 'text-slate-400 font-medium'
                }`}>
                  {p.title}
                </span>

                <span className={`text-xs w-24 text-right ${
                  isCurrent ? 'text-slate-500 font-medium' : 'text-slate-300'
                }`}>
                  {p.createdAt.split('T')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. 하단 목록보기 버튼 ── */}
      <div className="flex justify-center items-center pt-4 print-hide">
        <button 
          className="flex items-center gap-2 px-10 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-full transition-shadow shadow-md hover:shadow-lg"
          onClick={handleGoBack}
        >
          <FileText size={18} /> 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}