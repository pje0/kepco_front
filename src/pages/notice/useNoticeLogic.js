import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 페이지 유지를 위해 useSearchParams 추가
import { getNotices, getNotice } from '@/api/noticeApi';

export default function useNoticeLogic() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // URL의 쿼리 파라미터 제어 상태
  
  // ─── [데이터 로드 및 로딩 상태] ───────────────────────────
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── [검색 폼 입력 상태] ──────────────────────────────────
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeType, setRangeType] = useState('1개월');
  const [searchCondition, setSearchCondition] = useState('title_content');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDept, setSearchDept] = useState('전체');

  // ─── [실제 조회 버튼 적용 필터 상태] ───────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    condition: 'title_content',
    keyword: '',
    dept: '전체'
  });

  // ─── [정렬 및 표시 개수 상태] ────────────────────────────
  const [sortBy, setSortBy] = useState('latest');
  const [pageSize, setPageSize] = useState('10');
  
  // 🚨 URL에서 page 파라미터를 읽어와 초기값 설정 (없으면 1페이지)
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // 초기 날짜 및 공지사항 전체 목록 조회 실행
  useEffect(() => {
    console.log("공지사항 컴포넌트 마운트 - 초기 데이터 로드 시작");
    handleDateRange('1개월');
    fetchNotices();
  }, []);

  // 목록 표시 개수나 정렬 조건 변경 시 1페이지로 강제 리셋 및 URL 동기화
  useEffect(() => {
    console.log(`정렬 또는 페이지 크기 변경됨 [정렬: ${sortBy}, 크기: ${pageSize}] - 1페이지로 이동`);
    setSearchParams({ page: '1' });
  }, [pageSize, sortBy]);

  // 백엔드 API로부터 공지사항 데이터 통신 호출 함수
  const fetchNotices = () => {
    setIsLoading(true);
    console.log("getNotices API 호출 발송");
    getNotices()
      .then((data) => {
        console.log("공지사항 목록 수신 완료: ", data);
        if (Array.isArray(data)) setNotices(data);
        else setNotices([]);
      })
      .catch((error) => {
        console.error("공지사항 목록 조회 에러 발생: ", error);
        setNotices([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 🚨 [조건 검색 및 정렬 핵심 연산 로직]
  const filteredAndSortedNotices = useMemo(() => {
    console.log("필터링 및 정렬 연산 수행 시작");
    let result = [...notices];

    // 1. 등록일 기간 필터 가공
    if (appliedFilters.startDate && appliedFilters.endDate) {
      result = result.filter(notice => {
        const noticeDate = notice.createdAt.split('T')[0];
        return noticeDate >= appliedFilters.startDate && noticeDate <= appliedFilters.endDate;
      });
    }

    // 2. 검색어 텍스트 매칭 처리
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

    // 3. 소속 부서 드롭다운 필터 처리
    if (appliedFilters.dept !== '전체') {
      result = result.filter(notice => {
        const dept = notice.department || notice.author || '';
        return dept === appliedFilters.dept;
      });
    }

    // 4. 정렬 가공 (isPinned 우선 배치 보장)
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

    console.log(`필터 및 정렬 완료된 결과 데이터 수: ${result.length}건`);
    return result;
  }, [notices, appliedFilters, sortBy]);

  // ─── [페이지네이션 수학 행렬 연산 구역] ─────────────────
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

  // 🚨 페이지 변경 시 URL의 쿼리 스트링 값을 교체 처리
  const paginate = (pageNumber) => {
    console.log(`페이지 변경 처리 작동 -> 타겟 페이지 번호: ${pageNumber}`);
    setSearchParams({ page: String(pageNumber) });
  };

  // ─── [날짜 유틸리티 가공 함수군] ──────────────────────────
  const handleDateRange = (type) => {
    console.log(`날짜 퀵 버튼 클릭 감지: ${type}`);
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

  const handlePrint = () => {
    console.log("현재 목록 화면 웹 브라우저 인쇄 모듈 기동");
    window.print();
  };

  // 🚨 검색 버튼 조건부 트리거 작동 처리 함수
  const handleSearch = () => {
    console.log("조회 버튼 클릭 처리 - 필터 메모리 변수 적용 가동");
    setAppliedFilters({
      startDate,
      endDate,
      condition: searchCondition,
      keyword: searchKeyword,
      dept: searchDept
    });
    setSearchParams({ page: '1' }); // 검색 필터 작동 시 무조건 1페이지 우선 셋업
  };

  // 🚨 제목 타겟 클릭 시 현재 떠있는 페이징 인덱스 쿼리를 함께 주소창에 파라미터로 명시하여 상세 페이지로 전달 유도
  const handleTitleClick = (id) => {
    console.log(`공지사항 상세 페이지 주소 이동 개시 -> ID: ${id}, 기존 유지될 페이지 번호: ${currentPage}`);
    navigate(`/notice/${id}?page=${currentPage}`);
  };

  // ─── [모달 전용 상태 제어 영역] ───────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openQuickView = async (noticeItem) => {
    if (!noticeItem) return;
    console.log(`간단히 보기 모달창 팝업 가동 -> 대상 공지사항 식별자 ID: ${noticeItem.id}`);
    setIsModalOpen(true);
    setModalData(null);

    try {
      const detail = await getNotice(noticeItem.id);
      setModalData(detail);
      setNotices((prevNotices) => 
        prevNotices.map(n => n.id === detail.id ? detail : n)
      );
    } catch (error) {
      console.error("모달창 내부 상세 통신 예외 발생: ", error);
    }
  };

  return {
    notices, isLoading,
    startDate, endDate, rangeType, searchCondition, searchKeyword, searchDept,
    setStartDate, setEndDate, setSearchCondition, setSearchKeyword, setSearchDept,
    sortBy, setSortBy, pageSize, setPageSize, currentPage,
    isModalOpen, setIsModalOpen, modalData,
    filteredAndSortedNotices, currentNotices, totalPages, pageNumbers, indexOfFirstNotice,
    paginate, handleDateRange, handleDateChange, isNewPost, displayDate,
    handlePrint, handleSearch, handleTitleClick, openQuickView
  };
}