import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getNotices, getNotice } from '@/api/noticeApi';

export default function useNoticeLogic() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeType, setRangeType] = useState('1개월');
  const [searchCondition, setSearchCondition] = useState('title_content');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDept, setSearchDept] = useState('전체');

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '', endDate: '', condition: 'title_content', keyword: '', dept: '전체'
  });

  const [sortBy, setSortBy] = useState('latest');
  const [pageSize, setPageSize] = useState('10');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // 🚨 [신규 기능 1] 방문한 글 기록 (localStorage 활용)
  const [visitedPosts, setVisitedPosts] = useState(() => {
    const saved = localStorage.getItem('visited_notices');
    return saved ? JSON.parse(saved) : [];
  });

  const markAsVisited = (id) => {
    setVisitedPosts(prev => {
      if (prev.includes(String(id))) return prev;
      const newVisited = [...prev, String(id)];
      localStorage.setItem('visited_notices', JSON.stringify(newVisited));
      return newVisited;
    });
  };

  useEffect(() => {
    handleDateRange('1개월');
    fetchNotices();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSearchParams({ page: '1' });
  }, [pageSize, sortBy]);

  const fetchNotices = () => {
    setIsLoading(true);
    getNotices()
      .then((data) => {
        if (Array.isArray(data)) setNotices(data);
        else setNotices([]);
      })
      .catch(() => setNotices([]))
      .finally(() => setIsLoading(false));
  };

  const filteredAndSortedNotices = useMemo(() => {
    let result = [...notices];

    if (appliedFilters.startDate && appliedFilters.endDate) {
      result = result.filter(notice => {
        const noticeDate = notice.createdAt.split('T')[0];
        return noticeDate >= appliedFilters.startDate && noticeDate <= appliedFilters.endDate;
      });
    }

    if (appliedFilters.keyword) {
      const lowerKeyword = appliedFilters.keyword.toLowerCase();
      result = result.filter(notice => {
        const titleMatch = notice.title.toLowerCase().includes(lowerKeyword);
        const contentMatch = notice.content.toLowerCase().includes(lowerKeyword);
        
        if (appliedFilters.condition === 'title') return titleMatch;
        if (appliedFilters.condition === 'content') return contentMatch;
        return titleMatch || contentMatch;
      });
    }

    if (appliedFilters.dept !== '전체') {
      result = result.filter(notice => {
        const dept = notice.department || notice.author || '';
        return dept === appliedFilters.dept;
      });
    }

    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'dept') {
        const deptA = a.department || a.author || '';
        const deptB = b.department || b.author || '';
        return deptA.localeCompare(deptB);
      }
      return 0;
    });

    return result;
  }, [notices, appliedFilters, sortBy]);

  const indexOfLastNotice = currentPage * Number(pageSize);
  const indexOfFirstNotice = indexOfLastNotice - Number(pageSize);
  const currentNotices = filteredAndSortedNotices.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalPages = Math.ceil(filteredAndSortedNotices.length / Number(pageSize));

  const pageGroupSize = 10;
  const currentGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setSearchParams({ page: String(pageNumber) });

  const handleDateRange = (type) => {
    setRangeType(type);
    if (type === '직접입력') {
      setStartDate(''); setEndDate('');
      return;
    }
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const endStr = formatDate(today);
    let startD = new Date(today);

    if (type === '오늘') startD = new Date(today);
    else if (type === '1주일') startD.setDate(startD.getDate() - 7);
    else if (type === '1개월') startD.setMonth(startD.getMonth() - 1);
    else if (type === '6개월') startD.setMonth(startD.getMonth() - 6);
    else if (type === '1년') startD.setFullYear(startD.getFullYear() - 1);

    setStartDate(formatDate(startD));
    setEndDate(endStr);
  };

  const handleDateChange = (isStart, value) => {
    if (isStart) setStartDate(value);
    else setEndDate(value);
    setRangeType('직접입력');
  };

  const isNewPost = (dateString) => {
    if (!dateString) return false;
    const postTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffHours = (now - postTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  };

  const displayDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const handlePrint = () => window.print();

  const handleSearch = () => {
    setAppliedFilters({
      startDate, endDate, condition: searchCondition, keyword: searchKeyword, dept: searchDept
    });
    setSearchParams({ page: '1' }); 
  };

  const handleTitleClick = (id) => {
    markAsVisited(id); 
    navigate(`/notice/${id}?page=${currentPage}`);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalIndex, setModalIndex] = useState(-1); // 🚨 추가: 현재 모달에 뜬 글의 전체 순번

  const openQuickView = async (noticeItem) => {
    if (!noticeItem) return;

    // 🚨 추가: 전체 리스트(filteredAndSortedNotices) 기준의 위치 인덱스를 찾아서 저장합니다.
    const globalIndex = filteredAndSortedNotices.findIndex(n => String(n.id) === String(noticeItem.id));
    setModalIndex(globalIndex);

    markAsVisited(noticeItem.id); 
    setIsModalOpen(true);
    setModalData(null);

    try {
      const detail = await getNotice(noticeItem.id);
      setModalData(detail);
      setNotices((prevNotices) => 
        prevNotices.map(n => String(n.id) === String(detail.id) ? detail : n)
      );
    } catch (error) {
      console.error("데이터 통신 에러", error);
    }
  };

  // 🚨 추가: 화살표를 눌렀을 때 좌우로 이동하는 함수
  const handleModalNav = (direction) => {
    const newIndex = modalIndex + direction;
    if (newIndex >= 0 && newIndex < filteredAndSortedNotices.length) {
      const targetNotice = filteredAndSortedNotices[newIndex];
      openQuickView(targetNotice); // 다음/이전 글로 모달 갱신

      // 모달을 넘기다가 다음 페이지 글이 나오면, 뒤에 깔린 테이블의 페이지 번호도 맞게 넘겨줍니다.
      const newPage = Math.floor(newIndex / Number(pageSize)) + 1;
      if (newPage !== currentPage) {
        setSearchParams({ page: String(newPage) });
      }
    }
  };

  return {
    notices, isLoading,
    startDate, endDate, rangeType, searchCondition, searchKeyword, searchDept,
    setStartDate, setEndDate, setSearchCondition, setSearchKeyword, setSearchDept,
    sortBy, setSortBy, pageSize, setPageSize, currentPage,
    isModalOpen, setIsModalOpen, modalData, modalIndex, handleModalNav, // 🚨 반환 항목 2개 추가
    filteredAndSortedNotices, currentNotices, totalPages, pageNumbers, indexOfFirstNotice,
    paginate, handleDateRange, handleDateChange, isNewPost, displayDate,
    handlePrint, handleSearch, handleTitleClick, openQuickView,
    appliedFilters, visitedPosts 
  };
}