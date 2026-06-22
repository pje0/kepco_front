import { useState, useEffect } from 'react';
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
  const [recentPosts, setRecentPosts] = useState([]); // 🚨 최근 읽은 글 상태
  
  const [fontSize, setFontSize] = useState(16);

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

        // 1. 주변 게시글 추출
        const currentIndex = listWithNums.findIndex(item => String(item.id) === String(noticeId));
        if (currentIndex !== -1) {
          const startIdx = Math.max(0, currentIndex - 2);
          const endIdx = Math.min(listWithNums.length - 1, currentIndex + 2);
          setSurroundingPosts(listWithNums.slice(startIdx, endIdx + 1));
        }

        // 2. 🚨 최근 방문한 글(Visited) 로직 처리
        const saved = localStorage.getItem('visited_notices');
        let visitedIds = saved ? JSON.parse(saved) : [];
        
        // 현재 보고 있는 글을 기록의 맨 뒤(최신)로 이동
        visitedIds = visitedIds.filter(id => id !== String(noticeId)); 
        visitedIds.push(String(noticeId)); 
        if (visitedIds.length > 20) visitedIds = visitedIds.slice(visitedIds.length - 20); // 최대 20개만 보관
        
        localStorage.setItem('visited_notices', JSON.stringify(visitedIds));

        // 최근 읽은 글 5개 추출 (현재 화면에 띄워둔 글은 제외)
        const recent = visitedIds
          .slice()
          .reverse() // 최신순으로 뒤집기
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

  const increaseFontSize = () => setFontSize(prev => Math.min(24, prev + 2));
  const decreaseFontSize = () => setFontSize(prev => Math.max(12, prev - 2));

  return {
    notice, noticeId, isLoading, surroundingPosts, recentPosts, fontSize, originPage,
    increaseFontSize, decreaseFontSize, displayDate, handleDetailPrint, handleGoBack, handleCopyLink, navigate
  };
}