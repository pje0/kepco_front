import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getNotice, getNotices } from '@/api/noticeApi'; 
import { toast } from 'sonner';

export default function useNoticeDetailLogic() {
  const { id: noticeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const originPage = searchParams.get('page') || '1';

  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [surroundingPosts, setSurroundingPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]); 
  
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const zoomControlRef = useRef(null);

  // 🚨 [핵심 수정 포인트] 의존성 배열에 isLoading, notice를 추가했습니다.
  // 로딩 스피너가 끝나고 실제 버튼이 화면에 그려진 '직후'에 센서가 정확하게 부착됩니다!
  useEffect(() => {
    const el = zoomControlRef.current;
    if (!el) return;

    const handleNativeWheel = (e) => {
      e.preventDefault(); 
      if (e.deltaY < 0) {
        setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
      } else if (e.deltaY > 0) {
        setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [isLoading, notice]);

  useEffect(() => {
    if (noticeId) {
      loadNoticeAndNeighbors();
    }
  }, [noticeId]);

  const loadNoticeAndNeighbors = async () => {
    setIsLoading(true);
    try {
      const currentData = await getNotice(noticeId);
      setNotice(currentData);

      const allList = await getNotices();
      if (Array.isArray(allList)) {
        allList.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

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

        const saved = localStorage.getItem('visited_notices');
        let visitedIds = saved ? JSON.parse(saved) : [];
        
        visitedIds = visitedIds.filter(id => id !== String(noticeId)); 
        visitedIds.push(String(noticeId)); 
        if (visitedIds.length > 20) visitedIds = visitedIds.slice(visitedIds.length - 20); 
        
        localStorage.setItem('visited_notices', JSON.stringify(visitedIds));

        const recent = visitedIds
          .slice()
          .reverse() 
          .map(vId => listWithNums.find(n => String(n.id) === String(vId)))
          .filter(n => n && String(n.id) !== String(noticeId))
          .slice(0, 5);
        
        setRecentPosts(recent);
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
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDetailPrint = () => window.print();
  const handleGoBack = () => navigate(`/notice?page=${originPage}`);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("링크가 클립보드에 복사되었습니다.", { position: 'bottom-right' });
    });
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  // 🚨 [신규] Ctrl+S 저장 방지 로직 (프로젝트 전체 전역 적용)
  useEffect(() => {
    const preventSave = (e) => {
      // Mac의 Cmd(metaKey)와 Windows의 Ctrl(ctrlKey) + S 조합 감지
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault(); // 브라우저의 기본 '저장창 띄우기'를 강제로 취소(차단)합니다.
        
        // 화면엔 보이지 않는 의미 없는 행동
        console.log("보안 정책에 의해 페이지 저장이 차단되었습니다."); 
      }
    };

    // 키보드 이벤트 리스너 부착
    window.addEventListener('keydown', preventSave);
    
    // 컴포넌트 언마운트 시 클린업
    return () => window.removeEventListener('keydown', preventSave);
  }, []);

  return {
    notice, noticeId, isLoading, surroundingPosts, recentPosts, originPage,
    displayDate, handleDetailPrint, handleGoBack, handleCopyLink, navigate,
    zoomLevel, zoomIn, zoomOut, zoomControlRef
  };
}