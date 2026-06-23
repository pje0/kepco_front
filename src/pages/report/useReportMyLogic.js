import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyReports } from '@/api/reportApi';

export default function useReportMyLogic() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── 아코디언(펼침) 상태 관리 ──
  const [expandedId, setExpandedId] = useState(null);

  // ── 검색 필터 상태 ──
  const [rangeType, setRangeType] = useState('1개월');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchStatus, setSearchStatus] = useState('전체');
  const [searchCondition, setSearchCondition] = useState('title');
  const [searchKeyword, setSearchKeyword] = useState('');

  // ── 조회용 확정 필터 ──
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '', endDate: '', status: '전체', condition: 'title', keyword: ''
  });

  // 초기 데이터 로드 및 날짜 세팅
  useEffect(() => {
    handleDateRange('1개월');
    if (user?.id) {
      getReportsData();
    }
  }, [user]);

  const getReportsData = () => {
    setIsLoading(true);
    getMyReports(user.id)
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch(() => setReports([]))
      .finally(() => setIsLoading(false));
  };

  // ── 날짜 계산 유틸리티 ──
  const handleDateRange = (type) => {
    setRangeType(type);
    if (type === '전체') {
      setStartDate(''); setEndDate(''); return;
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

    if (type === '1주일') startD.setDate(startD.getDate() - 7);
    else if (type === '1개월') startD.setMonth(startD.getMonth() - 1);
    else if (type === '3개월') startD.setMonth(startD.getMonth() - 3);
    else if (type === '6개월') startD.setMonth(startD.getMonth() - 6);
    else if (type === '1년') startD.setFullYear(startD.getFullYear() - 1);

    setStartDate(formatDate(startD));
    setEndDate(endStr);
  };

  // ── 필터 적용 (조회 버튼 클릭) ──
  const handleSearch = () => {
    setAppliedFilters({ startDate, endDate, status: searchStatus, condition: searchCondition, keyword: searchKeyword });
    setExpandedId(null); // 검색 시 열려있던 아코디언 닫기
  };

  // ── 필터링 연산 ──
  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (appliedFilters.startDate && appliedFilters.endDate) {
      result = result.filter(r => {
        const rDate = r.createdAt?.split('T')[0];
        return rDate >= appliedFilters.startDate && rDate <= appliedFilters.endDate;
      });
    }
    if (appliedFilters.status !== '전체') {
      result = result.filter(r => r.status === appliedFilters.status);
    }
    if (appliedFilters.keyword) {
      const lowerKeyword = appliedFilters.keyword.toLowerCase();
      result = result.filter(r => {
        if (appliedFilters.condition === 'title') return r.title?.toLowerCase().includes(lowerKeyword);
        if (appliedFilters.condition === 'id') return String(r.id) === appliedFilters.keyword;
        return false;
      });
    }
    return result;
  }, [reports, appliedFilters]);

  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return {
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
    reports
  };
}