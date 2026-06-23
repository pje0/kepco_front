import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calendar, 
  BrainCircuit, 
  AlertTriangle, 
  MapPin, 
  Search, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'

export default function DispatchHistory() {
  // 📅 초기 상태 진입 시 '최근 1주일' 날짜를 자동 계산하는 수식
  const getPastDateString = (daysAgo) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split('T')[0]
  }

  // 1. 달력 기간 선택 및 복합 조건 검색 필터 상태 관리
  const [filters, setFilters] = useState({
    startDate: getPastDateString(7), // 7일 전 디폴트 자동 세팅
    endDate: getPastDateString(0),   // 오늘 날짜 디폴트 자동 세팅
    region: '',
    district: '',
    aiCategory: '',
    aiPriority: '',
    citizenId: ''
  })

  // 2. 백엔드(Server-side) 페이징 메타데이터 및 청정 목록 데이터 상태 관리
  const [historyList, setHistoryList] = useState([])
  const [page, setPage] = useState(0)                       // 🎯 백엔드 인덱스 규격 매싱 (0번부터 시작)
  const [totalPages, setTotalPages] = useState(0)           // 백엔드 반환 "totalPages" 매핑
  const [totalElements, setTotalElements] = useState(0)       // 백엔드 반환 "totalElements" 매핑
  const [isLoading, setIsLoading] = useState(false)

  // 7대 AI 명세 카테고리 고정
  const categories = ['정전', '계량기 고장', '변압기 이상', '전선 단선', '지중 설비 이상', '누전 및 감전 위험', '선로 이물질 및 수목 접촉']
  const priorities = ['CRITICAL', 'MAJOR', 'MINOR']

  // 3. ⚙️ PostgreSQL 부분 복합 인덱스 스캔 API 고속 호출 파이프라인
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      // 주소창 오염 및 파싱 버그를 원천 차단하기 위해 URLSearchParams 안전 인터페이스 활용
      const searchParams = new URLSearchParams()
      if (filters.startDate) searchParams.append('startDate', filters.startDate)
      if (filters.endDate) searchParams.append('endDate', filters.endDate)
      if (filters.region) searchParams.append('region', filters.region)
      if (filters.district) searchParams.append('district', filters.district)
      if (filters.aiCategory) searchParams.append('aiCategory', filters.aiCategory)
      if (filters.aiPriority) searchParams.append('aiPriority', filters.aiPriority)
      if (filters.citizenId) searchParams.append('citizenId', filters.citizenId)
      
      // 백엔드 엔지니어링 규격 강제 동기화 (한 페이지 최대 20건 스펙)
      searchParams.append('page', page.toString())
      searchParams.append('size', '20')

      // 프로젝트 보안 세션 정책에 매칭하여 토큰 바인딩
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`/api/dispatch/history?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const pageData = await response.json()
        // 🎯 포스트맨으로 완벽하게 입증했던 백엔드 Response JSON 스펙 일대일 바인딩
        setHistoryList(pageData.content || [])
        setTotalPages(pageData.totalPages || 0)
        setTotalElements(pageData.totalElements || 0)
      } else if (response.status === 403) {
        alert("🚨 관제 인가 권한이 만료되었거나 접근할 수 없습니다. 보안 토큰을 확인해 주세요.")
      }
    } catch (error) {
      console.error("@# 과거 완료 이력 통신 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  // 현재 가동 페이지 인덱스가 스위칭될 때마다 백엔드 고속 스캔 유기적 재가동
  useEffect(() => {
    loadHistory()
  }, [page, loadHistory])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(0) // 📆 달력 범위나 검색 필터를 바꾸면 무조건 첫 페이지(0번)로 리셋시키는 것이 실무 표준
    loadHistory()
  }
  return (
    <div className="p-6 space-y-6">
      {/* 📡 대시보드 상단 헤더 텍스트 정보 및 총 개수 요약 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            ⚡ 과거 완료 이력 관제 센터
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            보안 제약 구역: 복구 작업 완료(resolved)가 각인되어 물리 격리 보존된 대용량 파견 전산 로그를 고속 조회합니다.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl text-center min-w-[120px]">
          <span className="text-[10px] block text-slate-400 font-bold tracking-wider uppercase">조회된 완료 총계</span>
          <strong className="text-2xl font-black text-emerald-600">{totalElements}</strong> <span className="text-xs font-bold text-slate-500">건</span>
        </div>
      </div>

      {/* 📅 기간 선택 및 동적 복합 조건 검색 컴포넌트 */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border border-slate-200 shadow-sm">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> 조회 시작일</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> 조회 종료일</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><BrainCircuit className="h-3.5 w-3.5 text-slate-400" /> AI 카테고리</label>
          <select name="aiCategory" value={filters.aiCategory} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold">
            <option value="">전체 카테고리</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><AlertTriangle className="h-3.5 w-3.5 text-slate-400" /> AI 심각도</label>
          <select name="aiPriority" value={filters.aiPriority} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold">
            <option value="">전체 등급</option>
            {priorities.map(prio => <option key={prio} value={prio}>{prio}</option>)}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> 관할 시 / 도</label>
          <input type="text" placeholder="예: 부산광역시" name="region" value={filters.region} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium placeholder-slate-400" />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> 시 / 군 / 구</label>
          <input type="text" placeholder="예: 남구, 금정구" name="district" value={filters.district} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium placeholder-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">👤 민원인 고유 ID</label>
          <input type="number" placeholder="민원인 유저 번호" name="citizenId" value={filters.citizenId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium placeholder-slate-400" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg py-2.5 px-4 text-sm transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5">
            <Search className="h-4 w-4" /> 지정 기간 고속 스캔
          </button>
        </div>
      </form>

      {/* 📊 데이터 출력 리스트 대형 테이블 그리드 */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 w-[120px]">파견 고유 ID</th>
                <th className="p-4 min-w-[240px]">매핑 민원 정보 (신고 내용 요약)</th>
                <th className="p-4 w-[150px]">복구 완료 요원</th>
                <th className="p-4 w-[180px]">파견 지시 일시</th>
                <th className="p-4 min-w-[280px]">조치 마감 결과 내역 (Note)</th>
                <th className="p-4 w-[120px]">최종 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700 font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center p-20 text-slate-400 font-medium animate-pulse tracking-wide">
                    PostgreSQL 완료 인덱스 버퍼 데이터셋을 실시간 병렬 가공 중입니다...
                  </td>
                </tr>
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-20 text-slate-400 font-medium tracking-wide">
                    지정한 달력 기간 및 검색 조건 범위 내에 격리 완료된 복구 이력이 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                historyList.map((row) => (
                  <tr key={row.dispatchId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-slate-400 text-xs font-bold">#DP-{row.dispatchId}</td>
                    <td className="p-4 text-slate-900 font-bold tracking-tight">
                      <span className="line-clamp-1">{row.complaintTitle}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200">
                        👷 {row.workerName}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">
                      {row.assignedAt ? new Date(row.assignedAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-slate-600 font-medium max-w-[320px]">
                      <div className="flex items-start gap-1">
                        {row.workNote ? (
                          <span className="line-clamp-2 text-xs leading-relaxed">{row.workNote}</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">결과 메모 미기재 완료건</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block text-[11px] font-black tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                        resolved
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

               {/* 📟 백엔드 수신 페이징 메타데이터 연동 하단 네비게이션 제어 장치 */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(prev => prev - 1)} 
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-xs font-bold text-slate-600 transition-all shadow-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> 이전 페이지
            </button>
            <span className="text-xs text-slate-500 font-mono font-bold tracking-widest">
              PAGE <strong className="text-slate-800">{page + 1}</strong> OF {totalPages}
            </span>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(prev => prev + 1)} 
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-xs font-bold text-slate-600 transition-all shadow-sm"
            >
              다음 페이지 <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
