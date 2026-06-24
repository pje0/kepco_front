import { useState, useEffect } from 'react'
import { HardHat, RefreshCw, MapPin, Clock, X, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { getMyDispatches, updateDispatchStatus } from '@/api/workApi'
import { cn } from '@/lib/utils'

// AI 우선순위별 색상 (aiPriority 기준, 없으면 기본)
const PRIORITY = {
  HIGH: { bg: 'bg-red-100 dark:bg-red-950', badge: 'bg-red-500', border: 'border-l-red-500', label: '높음' },
  MEDIUM: { bg: 'bg-orange-100 dark:bg-orange-950', badge: 'bg-orange-500', border: 'border-l-orange-500', label: '보통' },
  LOW: { bg: 'bg-blue-100 dark:bg-blue-950', badge: 'bg-blue-500', border: 'border-l-blue-500', label: '낮음' },
}
const getPriority = (p) => PRIORITY[p] || { bg: 'bg-gray-100 dark:bg-gray-800', badge: 'bg-gray-500', border: 'border-l-gray-500', label: null }

// 날짜 포맷 (null이면 '-')
const fmt = (v) => (v ? new Date(v).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' }) : '-')

export default function WorkPage() {
  const [dispatches, setDispatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDispatch, setSelectedDispatch] = useState(null)
  const [activeTab, setActiveTab] = useState('active')
  const [noteModal, setNoteModal] = useState(null)   // 완료 처리할 dispatch
  const [noteText, setNoteText] = useState('')        // 메모 입력값

  const load = () => {
    setIsLoading(true)
    getMyDispatches()
      .then(setDispatches)
      .catch(() => setDispatches([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusUpdate = async (id, status, workNote = null) => {
    try {
      await updateDispatchStatus(id, status, workNote)
      setSelectedDispatch(null)
      load()
    } catch (e) {
      alert('상태 변경에 실패했습니다.')
    }
  }

  // 완료 버튼 → 메모 모달 열기
  const openNoteModal = (dispatch) => {
    setNoteText('')
    setNoteModal(dispatch)
  }

  // 모달에서 확정 → 메모와 함께 완료 처리
  const submitComplete = async () => {
    if (!noteModal) return
    await handleStatusUpdate(noteModal.id, 'RESOLVED', noteText)
    setNoteModal(null)
  }

  const active = dispatches.filter((d) => d.status !== 'RESOLVED')
  const completed = dispatches.filter((d) => d.status === 'RESOLVED')

  // 컴팩트 리스트 아이템
  const CompactDispatchItem = ({ dispatch, isCompleted = false }) => {
    const priority = getPriority(dispatch.aiPriority)

    return (
      <div
        className={cn(
          'border-l-4 p-3 rounded-r-lg cursor-pointer transition-all hover:shadow-md hover:bg-muted/30',
          priority.border,
          isCompleted ? 'opacity-60 bg-muted/20' : 'bg-card'
        )}
        onClick={() => setSelectedDispatch(dispatch)}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="font-semibold text-sm truncate flex-1 min-w-0 hover:underline">
            {dispatch.complaintTitle}
          </p>
          <StatusBadge status={dispatch.status} />
        </div>

        {(dispatch.aiCategory || priority.label) && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {dispatch.aiCategory && <Badge variant="outline" className="text-xs">{dispatch.aiCategory}</Badge>}
            {priority.label && <Badge className={`text-xs text-white ${priority.badge}`}>{priority.label}</Badge>}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {dispatch.complaintAddress}
          </span>
        </div>

        {/* 시간 정보 강조 */}
        <div className="space-y-1 text-xs mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">배정:</span>
            <span className="font-semibold text-foreground">{fmt(dispatch.assignedAt)}</span>
          </div>
          {dispatch.arrivedAt && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span className="text-muted-foreground">도착:</span>
              <span className="font-semibold">{fmt(dispatch.arrivedAt)}</span>
            </div>
          )}
          {dispatch.completedAt && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span className="text-muted-foreground">완료:</span>
              <span className="font-semibold">{fmt(dispatch.completedAt)}</span>
            </div>
          )}
        </div>

        {/* 상태 변경 버튼 */}
        {!isCompleted && (
          <div className="flex gap-2 pt-2">
            {dispatch.status === 'ASSIGNED' && (
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(dispatch.id, 'IN_PROGRESS') }}
              >
                현장 도착
              </Button>
            )}
            {dispatch.status === 'IN_PROGRESS' && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs h-7"
                onClick={(e) => { e.stopPropagation(); openNoteModal(dispatch) }}
              >
                처리 완료
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  // 상세 모달
  const DetailModal = ({ dispatch, onClose }) => {
    if (!dispatch) return null
    const priority = getPriority(dispatch.aiPriority)

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className={cn('p-6 border-b', priority.bg)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-2">{dispatch.complaintTitle}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {dispatch.aiCategory && <Badge variant="outline">{dispatch.aiCategory}</Badge>}
                  {priority.label && <Badge className={`text-white ${priority.badge}`}>{priority.label}</Badge>}
                  <StatusBadge status={dispatch.status} />
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">현장 주소</h3>
              <p className="text-base flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                {dispatch.complaintAddress}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">처리 진행 상황</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">배정 시각</span>
                  <span className="font-medium">{fmt(dispatch.assignedAt)}</span>
                </div>
                {dispatch.arrivedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">현장 도착</span>
                    <span className="font-medium text-green-600">{fmt(dispatch.arrivedAt)}</span>
                  </div>
                )}
                {dispatch.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">처리 완료</span>
                    <span className="font-medium text-green-600">{fmt(dispatch.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {dispatch.workNote && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">작업 메모</h3>
                <p className="text-base bg-blue-50 dark:bg-blue-950 p-3 rounded-md">{dispatch.workNote}</p>
              </div>
            )}
          </div>

          {/* 푸터 - 상태 변경 */}
          <div className="p-6 border-t flex gap-2 justify-end">
            {dispatch.status === 'ASSIGNED' && (
              <Button onClick={() => handleStatusUpdate(dispatch.id, 'IN_PROGRESS')}>현장 도착 (처리 시작)</Button>
            )}
            {dispatch.status === 'IN_PROGRESS' && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => openNoteModal(dispatch)}>처리 완료</Button>
            )}
            <Button variant="outline" onClick={onClose}>닫기</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">출동 확인</h1>
        </div>
        <Button variant="outline" size="icon" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-48" />
      ) : (
        <>
          {/* 탭 */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              진행 중 ({active.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={cn(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              완료됨 ({completed.length})
            </button>
          </div>

          {/* 진행 중 */}
          {activeTab === 'active' && (
            <div>
              {active.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">현재 배정된 출동 건이 없습니다.</CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {active.map((d) => <CompactDispatchItem key={d.id} dispatch={d} isCompleted={false} />)}
                </div>
              )}
            </div>
          )}

          {/* 완료됨 */}
          {activeTab === 'completed' && (
            <div>
              {completed.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">완료된 출동 건이 없습니다.</CardContent></Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {completed.map((d) => <CompactDispatchItem key={d.id} dispatch={d} isCompleted={true} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 상세 모달 */}
      {selectedDispatch && (
        <DetailModal dispatch={selectedDispatch} onClose={() => setSelectedDispatch(null)} />
      )}

      {/* 메모 입력 모달 (인라인 - 포커스 유지) */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setNoteModal(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">처리 완료</h2>
              <p className="text-sm text-muted-foreground mt-1 truncate">{noteModal.complaintTitle}</p>
            </div>

            <div className="p-6 space-y-2">
              <label className="text-sm font-semibold">작업 메모 (조치 내역)</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
                autoFocus
                placeholder="현장에서 어떤 조치를 했는지 입력하세요"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="p-6 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNoteModal(null)}>취소</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={submitComplete}>완료 처리</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}