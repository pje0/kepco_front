import { useState, useEffect } from 'react'
import { Truck, Plus, RefreshCw, BrainCircuit, Sparkles, X, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { getDispatches, createDispatch, updateDispatch } from '@/api/dispatchApi'
import { getReports } from '@/api/reportApi'
import { getAvailableWorkers } from '@/api/employeeApi'
import axios from 'axios'

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState([])
  const [pendingReports, setPendingReports] = useState([])
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(true)
  
  // ⚡ [구조 개혁]: 장바구니 명칭을 폐기하고, 다중 지정 복수 출동 대원 배열로 관리 통합
  const [form, setForm] = useState({ reportId: '', selectedWorkers: [], note: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // 🧠 [AI 매칭 엔진 연동 상태값]
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  const token = localStorage.getItem('accessToken')

  const loadAll = async () => {
    setIsLoading(true)
    try {
      const [d, r, w] = await Promise.all([
        getDispatches(),
        getReports({ status: 'PENDING' }),
        getAvailableWorkers(),
      ])
      
      // ⚡ [근본 해결 - 런타임 크래시 박멸]: 대시보드 복합 객체 구조에서 순수 dispatches 배열 부만 정밀 선별 바인딩
      if (d && typeof d === 'object' && d.dispatchList) {
        setDispatches(d.dispatchList)
      } else if (Array.isArray(d)) {
        setDispatches(d)
      } else {
        setDispatches([])
      }
      
      setPendingReports(r)
      setWorkers(w)
    } catch (err) {
      console.error('실시간 관제 마스터 데이터 로드 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])
        // 📋 [출동 조 편성 핸들러]: 드롭다운 선택 시 조 편성 현황 목록에 중복 없이 추가 (기본 직급: JUNIOR)
        const handleSelectWorker = (e) => {
          const workerId = Number(e.target.value)
          if (!workerId) return

          const targetWorker = workers.find(w => w.id === workerId)
          if (!targetWorker) return

          // 🚨 [이중 안전장치]: ROLE_WORKER 권한이 없는 인사/행정 직원의 오작동 진입을 원천 차단
          if (targetWorker.role && targetWorker.role !== 'ROLE_WORKER') {
            setFormError('선택한 사원은 현장 복구 대원(ROLE_WORKER) 권한이 없어 출동 조 편성이 불가능합니다.')
            e.target.value = ""
            return
          }

          if (form.selectedWorkers.some(w => w.id === workerId)) {
            setFormError('이미 출동 조에 편성된 대원입니다.')
            e.target.value = ""
            return
          }

          setFormError('')
          setForm(prev => ({
            ...prev,
            selectedWorkers: [...prev.selectedWorkers, { id: targetWorker.id, name: targetWorker.name, department: targetWorker.department, grade: targetWorker.grade }]
          }))
          e.target.value = "" // 셀렉트 박스 선택 상태 초기화
        }

        // 📋 [출동 조 편성 핸들러]: 작은 X 표시를 누르면 편성 현황에서 즉시 제외
        const handleRemoveWorker = (workerId) => {
          setForm(prev => ({
            ...prev,
            selectedWorkers: prev.selectedWorkers.filter(w => w.id !== workerId)
          }))
        }

        // 📋 [출동 조 편성 핸들러]: 편성 조원 내부의 직책(Role) 동적 변경 
        const handleRoleChange = (workerId, nextRole) => {
          setForm(prev => ({
            ...prev,
            selectedWorkers: prev.selectedWorkers.map(w => w.id === workerId ? { ...w, grade: nextRole } : w)
          }))
        }

  const handleInputChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  // 🧠 OpenAI 분석 정밀 매칭 피드 연동 (AI 추천 클릭 시 편성 조에 자동 배치)
  const handleAiRecommend = async () => {
    if (!form.reportId) {
      setFormError('AI 추천을 받으려면 먼저 [신고 건]을 선택해 주세요.')
      return
    }
    setFormError('')
    setIsAiLoading(true)
    setAiRecommendations([])
    
    try {
      const report = pendingReports.find((r) => r.id === Number(form.reportId))
      if (!report) throw new Error('선택된 신고 정보가 존재하지 않습니다.')

      const response = await axios.get('/api/dispatch/ai-recommend', {
        params: {
          disasterType: report.aiCategory || '일반 고장',
          location: (report.region || '') + ' ' + (report.district || ''),
          requiredSkill: report.title || '전기 복구 스펙'
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data && response.data.recommendations) {
        setAiRecommendations(response.data.recommendations)
      } else {
        setFormError('AI로부터 올바른 추천 데이터를 수신하지 못했습니다.')
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'AI 요원 추천 중 오류가 발생했습니다.')
    } finally {
      setIsAiLoading(false)
    }
  }
   // ⚡ [전략 A]: 기존 스키마 변경 없이 1대다 대량 병렬 트랜잭션 출동 유도
  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    
    if (!form.reportId) {
      setFormError('신고 건을 선택해 주세요.')
      return
    }

    if (form.selectedWorkers.length === 0) {
      setFormError('출동 조 편성을 위해 최소 한 명 이상의 대원을 구성 목록에 추가해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const report = pendingReports.find((r) => r.id === Number(form.reportId))
      
      const dispatchPromises = form.selectedWorkers.map(worker => {
        return createDispatch({
          complaintId: Number(form.reportId),
          workerId: Number(worker.id),
          workNote: `[${worker.grade || '요원'}] ${form.note}`,
        })
      })

      await Promise.all(dispatchPromises)
      
      setShowForm(false)
      setAiRecommendations([])
      setForm({ reportId: '', selectedWorkers: [], note: '' })
      loadAll()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateDispatch(id, { status: nextStatus })
      loadAll()
    } catch (err) {
      console.error('상태 변경 실패:', err)
    }
  }

  const getTodayResolvedCount = () => {
    const todayStr = new Date().toISOString().substring(0, 10)
    return dispatches.filter(d => d.status === 'RESOLVED' && d.completedAt && d.completedAt.substring(0, 10) === todayStr).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">파견 관리</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadAll}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => { if (showForm) { setShowForm(false); setAiRecommendations([]); } else { setShowForm(true); } }}>
            <Plus className="h-4 w-4 mr-1" />파견 지시
          </Button>
        </div>
      </div>
      {/* 요약 카드 바: 당일 완료 통계 필터 유기적 반영 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '대기 신고', value: pendingReports.length, color: 'text-yellow-600' },
          { label: '출동 중', value: dispatches.filter((d) => d.status === 'ASSIGNED' || d.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
          { label: '당일 완료', value: getTodayResolvedCount(), color: 'text-green-600' },
          { label: '가용 요원', value: workers.length, color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 파견 지시 생성 폼 및 AI 피드 콘솔 분할 구역 */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <Card className="border-primary/20 lg:col-span-2">
            <CardHeader><CardTitle className="text-base">파견 지시 생성</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>신고 건 선택 *</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={form.reportId} 
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, reportId: e.target.value }));
                        setAiRecommendations([]);
                      }}
                      disabled={isSubmitting}
                    >
                      <option value="">-- 신고 건 선택 --</option>
                      {pendingReports.map((r) => (
                        <option key={r.id} value={r.id}>[{r.aiCategory || '신고'}] {r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>출동요원 검색 및 선택 *</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      onChange={handleSelectWorker}
                      disabled={isSubmitting}
                    >
                      <option value="">-- 출동 대원 구성 목록 --</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} ({w.grade || '현장요원'})</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* 📋 [용어 세척]: 장바구니 흔적을 완벽 차단하고 공기업 행정 표준 라벨로 교정 */}
                <div className="space-y-2 bg-slate-50/50 p-3 border rounded-lg border-dashed">
                  <Label className="text-xs font-bold text-slate-600 block mb-2">📋 지정 출동 조 편성 현황 ({form.selectedWorkers.length}명)</Label>
                  
                  {form.selectedWorkers.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">출동요원 목록에서 대원을 선택하면 이곳에 실시간 출동 조가 편성됩니다.</p>
                  ) : (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {form.selectedWorkers.map((worker) => (
                        <div key={worker.id} className="flex items-center justify-between text-sm bg-background p-2 border rounded-md shadow-sm animate-in zoom-in-95 duration-150">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{worker.name}</span>
                            <span className="text-[10px] text-muted-foreground">({worker.department || '현장부서'})</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* ⚡ [기획 복구 완결]: 임의 수정을 차단하고 DB 대문자 공인 스펙 등급 명찰 전격 고정 */}
                            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200">
                              {worker.grade === 'MASTER' && '마스터 (팀장)'}
                              {worker.grade === 'SENIOR' && '시니어 (부팀장)'}
                              {worker.grade === 'JUNIOR' && '주니어 (조원)'}
                              {!['MASTER', 'SENIOR', 'JUNIOR'].includes(worker.grade) && `일반 요원 (${worker.grade || '미지정'})`}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveWorker(worker.id)}
                              className="text-muted-foreground hover:text-rose-600 p-0.5 rounded transition"
                              title="조에서 제외"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>지시 사항</Label>
                  <Input placeholder="출동 시 참고 사항 입력" value={form.note} onChange={handleInputChange('note')} disabled={isSubmitting} />
                </div>

                {formError && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '처리 중...' : '파견 지시'}</Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                    onClick={handleAiRecommend} 
                    disabled={isSubmitting || isAiLoading || !form.reportId}
                  >
                    <BrainCircuit className="h-4 w-4" />
                    {isAiLoading ? 'AI 분석 중...' : 'AI 복구 요원 추천'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(prev => ({...prev, selectedWorkers: []})); setAiRecommendations([]); }}>취소</Button>
                </div>
              </form>
            </CardContent>
          </Card>

                    {/* 🧠 OpenAI 분석 정밀 매칭 피드 패널 (조원 편성 연동 및 타입 크래시 차단 완결본) */}
          <Card className="border-purple-500/20 bg-purple-50/5 dark:bg-purple-950/5">
            <CardHeader className="pb-3 border-b border-purple-500/10">
              <CardTitle className="text-base font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 fill-purple-600 text-purple-600 animate-pulse" />
                OpenAI 분석 정밀 매칭 피드
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 overflow-y-auto max-h-[360px] space-y-3">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <LoadingSpinner className="h-8 w-8 text-purple-600" />
                  <p className="text-xs font-medium text-purple-600/80 animate-pulse">가용 요원 스펙 및 위치 분석 중...</p>
                </div>
              ) : aiRecommendations.length > 0 ? (
                aiRecommendations.map((rec, index) => {
                  return (
                    <div key={rec.workerId || rec.id || index} className="p-3 rounded-lg border border-purple-500/10 bg-background/80 shadow-sm flex flex-col space-y-2 transition-all hover:border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-foreground">{rec.name}</span>
                          <span className="text-xs text-muted-foreground ml-1.5">{rec.department || '복구팀'}</span>
                        </div>
                        <Badge className={rec.score >= 85 ? "bg-green-600" : rec.score >= 60 ? "bg-blue-600" : "bg-muted text-muted-foreground"}>
                          {rec.score}점
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2 rounded-md border border-muted/50">
                        {rec.reason}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold h-7 border-purple-500/20 hover:bg-purple-600 hover:text-white flex items-center gap-1"
                        onClick={() => {
                          // 🚨 [하이브리드 이중 디펜스 매칭 엔진 장착]: 
                          // OpenAI 페이로드의 가용 속성명(workerId, id, name) 패턴을 정밀 추적하여 타입 단선을 원천 회피합니다.
                          const targetId = rec.workerId || rec.id;
                          const hasWorker = workers.find(w => {
                            if (targetId && w.id === Number(targetId)) return true;
                            if (rec.name && w.name === rec.name) return true; // 이름 기반 차선책 매칭 보루 확보
                            return false;
                          });

                          if (!hasWorker) {
                            alert(`사원 [${rec.name || '알 수 없음'}] 기사는 현재 시스템 가용 명부에 등록되어 있지 않거나 비가용 상태입니다.`);
                            return;
                          }
                          
                          if (form.selectedWorkers.some(w => w.id === hasWorker.id)) {
                            alert("이미 지정 출동 조에 편성되어 있는 대원입니다.");
                            return;
                          }

                          // 📋 정합성 결합: 매싱에 완벽 성공한 진짜 복구 요원 객체 정보만 안전하게 조 적재 푸시
                          setForm(prev => ({
                            ...prev,
                            selectedWorkers: [
                              ...prev.selectedWorkers, 
                              { 
                                id: hasWorker.id, 
                                name: hasWorker.name, 
                                department: hasWorker.department || '현장복구부서', 
                                // 💡 AI가 준 쓰레기 데이터(rec.grade)를 절대 믿지 말고, 프론트 원본 명부에서 찾아낸 진짜 대문자 등급(MASTER 등)을 강제 장착!
                                grade: hasWorker.grade 
                              }
                            ]
                          }));
                        }}
                      >
                        <UserCheck className="w-3 h-3" /> 조원 추가
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground/60 space-y-1.5">
                  <BrainCircuit className="h-8 w-8 stroke-1 text-muted-foreground/40" />
                  <p className="text-xs">상단의 [신고 건]을 선택하신 후<br />AI 추천 버튼을 누르면 연산이 시작됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {/* 하단 실시간 파견 테이블 목록 구역 */}
      {isLoading ? (
        <LoadingSpinner className="h-48" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신고 건</TableHead>
                <TableHead>출동요원</TableHead>
                <TableHead>파견 시각</TableHead>
                <TableHead>지시 사항</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">처리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">파견 내역이 없습니다.</TableCell>
                </TableRow>
              ) : (
               dispatches.map((d, index) => (
                    <TableRow key={d.dispatchId || d.id || index}>
                    <TableCell className="font-medium max-w-[200px] truncate">{d.reportTitle}</TableCell>
                    <TableCell>{d.workerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.assignedAt ? d.assignedAt.replace('T', ' ').substring(0, 16) : '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate" title={d.note}>{d.note || '-'}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-right">
                      {d.status !== 'RESOLVED' && (
                        <select
                          value={d.status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value)}
                          className="text-xs h-8 rounded border border-input px-2 bg-background font-medium"
                        >
                          <option value="ASSIGNED">ASSIGNED (배정완료)</option>
                          <option value="IN_PROGRESS">IN_PROGRESS (복구중)</option>
                          <option value="RESOLVED">RESOLVED (종료)</option>
                        </select>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
