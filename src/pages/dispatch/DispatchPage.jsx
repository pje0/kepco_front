import { useState, useEffect } from 'react'
import { Truck, Plus, RefreshCw, BrainCircuit, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { getDispatches, createDispatch, updateDispatch } from '@/api/dispatchApi'
import { getReports } from '@/api/reportApi'
import { getEmployees } from '@/api/employeeApi'
// 🌐 [AI 매칭 엔진 연동]: axios 직접 연동을 위한 기본 축 설정
import axios from 'axios'

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState([])
  const [pendingReports, setPendingReports] = useState([])
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reportId: '', workerId: '', note: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // 🗺️ [AI 매칭 엔진 연동] 실시간 OpenAI 추천 요원 리스트 및 로딩 상태값 정의
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  const loadAll = async () => {
    setIsLoading(true)
    try {
      const [d, r, w] = await Promise.all([
        getDispatches(),
        getReports({ status: 'PENDING' }),
        // 💡 [교정]: 백엔드 엔티티 스키마 권한 규격인 'WORKER' 명칭으로 완벽 매칭 동기화
        getEmployees({ role: 'WORKER' }),
      ])
      setDispatches(d)
      setPendingReports(r)
      setWorkers(w)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])
  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // 🧠 [AI 매칭 엔진 연동]: 선택된 민원(신고) 데이터를 기반으로 OpenAI 실시간 스코어링 API 호출 핸들러
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

      // 💡 [물리 스키마 동기화]: 실제 DB 컬럼 매핑 스펙인 aiCategory, region, district, title 조합 송출
      const response = await axios.get('/api/dispatch/ai-recommend', {
        params: {
          disasterType: report.aiCategory || '일반 고장',
          location: (report.region || '') + ' ' + (report.district || ''),
          requiredSkill: report.title || '전기 복구 스펙'
        }
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

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.reportId || !form.workerId) {
      setFormError('신고 건과 출동요원을 선택해 주세요.')
      return
    }
    setIsSubmitting(true)
    try {
      const report = pendingReports.find((r) => r.id === Number(form.reportId))
      const worker = workers.find((w) => w.id === Number(form.workerId))
      await createDispatch({
        reportId: Number(form.reportId),
        reportTitle: report?.title || '',
        workerId: Number(form.workerId),
        workerName: worker?.name || '',
        note: form.note,
      })
      setShowForm(false)
      // 💡 [AI 매칭 엔진 연동]: 성공적으로 폼을 닫을 때 AI 추천 정보 상태도 완벽하게 클린 포맷
      setAiRecommendations([])
      setForm({ reportId: '', workerId: '', note: '' })
      loadAll()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    await updateDispatch(id, { status })
    loadAll()
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

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '대기 신고', value: pendingReports.length, color: 'text-yellow-600' },
          { label: '출동 중', value: dispatches.filter((d) => d.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
          { label: '완료', value: dispatches.filter((d) => d.status === 'COMPLETED').length, color: 'text-green-600' },
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

      {/* 파견 지시 폼 */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <Card className="border-primary/20 lg:col-span-2">
            <CardHeader><CardTitle className="text-base">파견 지시 생성</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>신고 건 선택 *</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.reportId} 
                    onChange={(e) => {
                      handleChange('reportId')(e);
                      setAiRecommendations([]);
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="">-- 신고 건 선택 --</option>
                    {pendingReports.map((r) => (
                      <option key={r.id} value={r.id}>[{r.aiCategory || r.type || '신고'}] {r.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>출동요원 선택 *</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.workerId} 
                    onChange={handleChange('workerId')} 
                    disabled={isSubmitting}
                  >
                    <option value="">-- 출동요원 선택 --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.department})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>지시 사항</Label>
                  <Input placeholder="출동 시 참고 사항 입력" value={form.note} onChange={handleChange('note')} disabled={isSubmitting} />
                </div>
                {formError && (
                  <p className="sm:col-span-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
                )}
                <div className="sm:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '처리 중...' : '파견 지시'}</Button>
                  {/* 🧠 [AI 매칭 엔진 연동]: OpenAI 요원 실시간 연산 가동 트리거 버튼 */}
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
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setAiRecommendations([]); }}>취소</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {/* 🧠 [AI 매칭 엔진 연동]: 인간의 최종 검증과 연동을 보조하는 우측 AI 스마트 패널 추천 피드 */}
          <Card className="border-purple-500/20 bg-purple-50/5 dark:bg-purple-950/5">
            <CardHeader className="pb-3 border-b border-purple-500/10">
              <CardTitle className="text-base font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 fill-purple-600 text-purple-600 animate-pulse" />
                OpenAI 분석 정밀 매칭 피드
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 overflow-y-auto max-h-[320px] space-y-3">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <LoadingSpinner className="h-8 w-8 text-purple-600" />
                  <p className="text-xs font-medium text-purple-600/80 animate-pulse">가용 요원 스펙 및 위치 분석 중...</p>
                </div>
              ) : aiRecommendations.length > 0 ? (
                aiRecommendations.map((rec, index) => {
                  return (
                    <div key={rec.workerId || index} className="p-3 rounded-lg border border-purple-500/10 bg-background/80 shadow-sm flex flex-col space-y-2 transition-all hover:border-purple-500/30">
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
                        className="w-full text-xs font-semibold h-7 border-purple-500/20 hover:bg-purple-600 hover:text-white"
                        onClick={() => {
                          // 💡 [물리 스키마 동기화]: 외래키 연결 대상인 recovery_worker.id(workerId)가 가용 리스트에 존재하는지 검사
                          const hasWorker = workers.some(w => w.id === Number(rec.workerId));
                          if (hasWorker) {
                            setForm(prev => ({ ...prev, workerId: String(rec.workerId) }));
                          } else {
                            alert("해당 사원은 현재 다른 파견 업무 중이거나 가용 상태가 아닙니다.");
                          }
                        }}
                      >
                        요원 지정
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

      {/* 파견 목록 */}
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
                dispatches.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{d.reportTitle}</TableCell>
                    <TableCell>{d.workerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.dispatchedAt}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{d.note || '-'}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-right">
                      {d.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(d.id, d.status === 'DISPATCHED' ? 'IN_PROGRESS' : 'COMPLETED')}
                        >
                          {d.status === 'DISPATCHED' ? '처리 중으로' : '완료 처리'}
                        </Button>
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
