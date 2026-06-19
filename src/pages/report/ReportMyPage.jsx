import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, ChevronDown, ChevronUp, Search, MapPin, Calendar, Clock, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { getMyReports } from '@/api/reportApi'
import './ReportMyPage.css'

export default function ReportMyPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // ── 아코디언(펼침) 상태 관리 ──
  const [expandedId, setExpandedId] = useState(null)

  // ── 검색 필터 상태 ──
  const [rangeType, setRangeType] = useState('1개월')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchStatus, setSearchStatus] = useState('전체')
  const [searchCondition, setSearchCondition] = useState('title')
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 조회용 확정 필터
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '', endDate: '', status: '전체', condition: 'title', keyword: ''
  })

  // 초기 데이터 로드 및 날짜 세팅
  useEffect(() => {
    handleDateRange('1개월')
    if (user?.id) {
      getReportsData()
    }
  }, [user])

  const getReportsData = () => {
    setIsLoading(true)
    getMyReports(user.id)
      .then((data) => {
        if (Array.isArray(data)) setReports(data)
      })
      .catch(() => setReports([]))
      .finally(() => setIsLoading(false))
  }

  // ── 날짜 계산 유틸리티 ──
  const handleDateRange = (type) => {
    setRangeType(type)
    if (type === '전체') {
      setStartDate(''); setEndDate(''); return;
    }
    const today = new Date()
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    const endStr = formatDate(today)
    let startD = new Date(today)

    if (type === '1주일') startD.setDate(startD.getDate() - 7)
    else if (type === '1개월') startD.setMonth(startD.getMonth() - 1)
    else if (type === '3개월') startD.setMonth(startD.getMonth() - 3)
    else if (type === '6개월') startD.setMonth(startD.getMonth() - 6)
    else if (type === '1년') startD.setFullYear(startD.getFullYear() - 1)

    setStartDate(formatDate(startD))
    setEndDate(endStr)
  }

  // ── 필터 적용 (조회 버튼 클릭) ──
  const handleSearch = () => {
    setAppliedFilters({ startDate, endDate, status: searchStatus, condition: searchCondition, keyword: searchKeyword })
    setExpandedId(null) // 검색 시 열려있던 아코디언 닫기
  }

  // ── 필터링 연산 ──
  const filteredReports = useMemo(() => {
    let result = [...reports]

    if (appliedFilters.startDate && appliedFilters.endDate) {
      result = result.filter(r => {
        const rDate = r.createdAt?.split('T')[0]
        return rDate >= appliedFilters.startDate && rDate <= appliedFilters.endDate
      })
    }
    if (appliedFilters.status !== '전체') {
      result = result.filter(r => r.status === appliedFilters.status)
    }
    if (appliedFilters.keyword) {
      const lowerKeyword = appliedFilters.keyword.toLowerCase()
      result = result.filter(r => {
        if (appliedFilters.condition === 'title') return r.title?.toLowerCase().includes(lowerKeyword)
        if (appliedFilters.condition === 'id') return String(r.id) === appliedFilters.keyword
        return false
      })
    }
    return result
  }, [reports, appliedFilters])

  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  if (isLoading) return <LoadingSpinner className="h-64" />

  return (
    <div className="report-container max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b-2 border-blue-800 pb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-blue-800" />
          <h1 className="text-2xl font-bold text-slate-900">내 신고 현황</h1>
        </div>
        <Button asChild className="bg-blue-700 hover:bg-blue-800 shadow-sm">
          <Link to="/report/new"><Plus className="h-4 w-4 mr-1" /> 새 신고 접수</Link>
        </Button>
      </div>

      {/* ── 통합 검색 필터 박스 ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-20 text-sm font-bold text-slate-700">조회 기간</span>
          <div className="flex items-center gap-2">
            <input type="date" className="border px-3 py-1.5 rounded text-sm outline-none focus:border-blue-600" value={startDate} onChange={e => {setStartDate(e.target.value); setRangeType('직접입력')}} />
            <span className="text-slate-400">~</span>
            <input type="date" className="border px-3 py-1.5 rounded text-sm outline-none focus:border-blue-600" value={endDate} onChange={e => {setEndDate(e.target.value); setRangeType('직접입력')}} />
            <div className="flex gap-1 ml-2">
              {['1주일', '1개월', '3개월', '6개월', '1년', '전체'].map((btn) => (
                <button key={btn} className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${rangeType === btn ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`} onClick={() => handleDateRange(btn)}>
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-20 text-sm font-bold text-slate-700">상세 검색</span>
          <div className="flex flex-1 items-center gap-2">
            <select className="border px-3 py-1.5 rounded text-sm outline-none focus:border-blue-600 w-28" value={searchStatus} onChange={e => setSearchStatus(e.target.value)}>
              <option value="전체">상태 전체</option>
              <option value="미처리">미처리</option>
              <option value="처리중">처리중</option>
              <option value="처리완료">처리완료</option>
            </select>
            <div className="w-px h-5 bg-slate-300 mx-1" />
            <select className="border px-3 py-1.5 rounded text-sm outline-none focus:border-blue-600 w-28" value={searchCondition} onChange={e => setSearchCondition(e.target.value)}>
              <option value="title">제목</option>
              <option value="id">신청번호</option>
            </select>
            <input type="text" className="border px-3 py-1.5 rounded text-sm outline-none focus:border-blue-600 flex-1" placeholder="검색어를 입력하세요" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch} className="bg-slate-800 hover:bg-slate-900 px-6 ml-2"><Search size={16} className="mr-1" /> 조회</Button>
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-600 font-medium">
        조회 결과 <strong className="text-blue-700">{filteredReports.length}</strong> 건
      </div>

      {/* ── 아코디언 리스트 영역 ── */}
      <div className="border-t-2 border-slate-800">
        {filteredReports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-slate-50 border-b">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
            조건에 일치하는 민원 내역이 없습니다.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="border-b border-slate-200 bg-white">
              
              {/* 항상 보이는 1줄 요약 (Row) */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleAccordion(report.id)}
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <span className="w-20 text-center text-xs font-semibold text-slate-400 bg-slate-100 py-1 rounded">
                    NO. {report.id}
                  </span>
                  <div className="w-24 shrink-0">
                    <StatusBadge status={report.status} />
                  </div>
                  <span className="font-bold text-slate-800 truncate flex-1 pr-4">{report.title}</span>
                  <span className="text-sm text-slate-500 w-36 text-right shrink-0">{formatDisplayDate(report.createdAt)}</span>
                </div>
                <div className="w-10 flex justify-end shrink-0 text-slate-400">
                  {expandedId === report.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </div>

              {/* 🚨 클릭 시 부드럽게 열리는 아코디언 본문 영역 */}
              {expandedId === report.id && (
                <div className="bg-slate-50/80 p-6 border-t border-slate-100 shadow-inner text-sm animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    
                    {/* 왼쪽 정보 */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-700 mb-1">발생 위치</div>
                          <div className="text-slate-600">{report.address}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <User size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-700 mb-1">처리 담당 (분석/배정)</div>
                          <div className="text-slate-600 font-medium text-blue-800">
                            {report.category || '분석 대기'}
                            <span className="text-slate-400 mx-2">|</span>
                            <span className="text-slate-600">{report.assignedWorkerName || '담당자 배정 중'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 오른쪽 정보 */}
                    <div className="flex items-start gap-3 bg-white p-4 rounded-md border border-slate-200">
                      <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="w-full">
                        <div className="font-semibold text-slate-700 mb-2">신고 상세 내용</div>
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {report.content}
                        </p>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}