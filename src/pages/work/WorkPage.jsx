import { useState, useEffect } from 'react'
import { HardHat, RefreshCw, MapPin, Clock, AlertTriangle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { getDispatches, updateDispatch } from '@/api/dispatchApi'
import { cn } from '@/lib/utils'

// 심각도별 색상 매핑
const SEVERITY_COLORS = {
  emergency: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-500' },
  normal: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-500' },
  low: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', badge: 'bg-gray-500' },
}

// 카테고리별 한글 표시
const CATEGORY_LABELS = {
  '단전': '단전',
  '전선끊어짐': '전선끊어짐',
  '스파크': '스파크',
  '변압기이상': '변압기이상',
}

export default function WorkPage() {
  const { user } = useAuth()
  const [dispatches, setDispatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDispatch, setSelectedDispatch] = useState(null)

  const load = () => {
    setIsLoading(true)
    // 실제: workerId 필터로 내 파견만 조회
    getDispatches({ workerId: user?.id })
      .then(setDispatches)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusUpdate = async (id, status) => {
    await updateDispatch(id, { status })
    load()
  }

  const active = dispatches.filter((d) => d.status !== 'COMPLETED')
  const completed = dispatches.filter((d) => d.status === 'COMPLETED')

  const getSeverityColor = (severity) => SEVERITY_COLORS[severity] || SEVERITY_COLORS.low

  const DispatchCard = ({ dispatch, isCompleted = false }) => {
    const severityColor = getSeverityColor(dispatch.severity)
    const region = dispatch.district ? `${dispatch.district}` : dispatch.region

    return (
      <>
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            isCompleted ? 'opacity-70' : `border-l-4 ${severityColor.bg}`
          )}
          onClick={() => setSelectedDispatch(dispatch)}
        >
          <CardContent className="p-4 space-y-3">
            {/* 제목 + 상태 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base cursor-pointer hover:underline truncate">
                  {dispatch.title}
                </p>
              </div>
              <StatusBadge status={dispatch.status} />
            </div>

            {/* 카테고리 + 심각도 배지 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {CATEGORY_LABELS[dispatch.category] || dispatch.category}
              </Badge>
              <Badge className={`text-xs text-white ${severityColor.badge}`}>
                {dispatch.severity === 'emergency' && '긴급'}
                {dispatch.severity === 'high' && '높음'}
                {dispatch.severity === 'normal' && '보통'}
                {dispatch.severity === 'low' && '낮음'}
              </Badge>
            </div>

            {/* 위치 + 파견 시각 */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {region}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                파견: {dispatch.dispatchedAt}
              </span>
            </div>

            {/* 상태 업데이트 버튼 (진행 중만) */}
            {!isCompleted && (
              <div className="flex gap-2 pt-2">
                {dispatch.status === 'DISPATCHED' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusUpdate(dispatch.id, 'IN_PROGRESS')
                    }}
                  >
                    현장 도착 (처리 시작)
                  </Button>
                )}
                {dispatch.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusUpdate(dispatch.id, 'COMPLETED')
                    }}
                  >
                    처리 완료
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  // 상세 정보 모달 (Tailwind 직접 구현)
  const DetailModal = ({ dispatch, onClose }) => {
    if (!dispatch) return null

    const severityColor = getSeverityColor(dispatch.severity)

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className={cn('p-6 border-b', severityColor.bg)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-2">{dispatch.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[dispatch.category] || dispatch.category}
                  </Badge>
                  <Badge className={`text-white ${severityColor.badge}`}>
                    {dispatch.severity === 'emergency' && '긴급'}
                    {dispatch.severity === 'high' && '높음'}
                    {dispatch.severity === 'normal' && '보통'}
                    {dispatch.severity === 'low' && '낮음'}
                  </Badge>
                  <StatusBadge status={dispatch.status} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-black/10 rounded-full transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6 space-y-6">
            {/* 신고 내용 */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">신고 내용</h3>
              <p className="text-base leading-relaxed bg-muted/30 p-3 rounded-md">
                {dispatch.content}
              </p>
            </div>

            {/* 위치 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">지역</h3>
                <p className="text-base">{dispatch.region}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">구/군</h3>
                <p className="text-base">{dispatch.district}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">상세 주소</h3>
              <p className="text-base flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                {dispatch.address}
              </p>
            </div>

            {/* 시간 정보 */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">처리 진행 상황</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">파견 시각</span>
                  <span className="font-medium">{dispatch.dispatchedAt}</span>
                </div>
                {dispatch.arrivedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">현장 도착</span>
                    <span className="font-medium text-green-600">{dispatch.arrivedAt}</span>
                  </div>
                )}
                {dispatch.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">처리 완료</span>
                    <span className="font-medium text-green-600">{dispatch.completedAt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 작업 메모 */}
            {dispatch.workNote && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">작업 메모</h3>
                <p className="text-base bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                  {dispatch.workNote}
                </p>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          {/* 진행 중 출동 */}
          <section>
            <h2 className="text-lg font-semibold mb-3">
              진행 중 출동
              {active.length > 0 && (
                <Badge variant="default" className="ml-2">{active.length}</Badge>
              )}
            </h2>
            {active.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  현재 배정된 출동 건이 없습니다.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {active.map((d) => (
                  <DispatchCard key={d.id} dispatch={d} isCompleted={false} />
                ))}
              </div>
            )}
          </section>

          {/* 완료된 출동 */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3">완료된 출동</h2>
              <div className="space-y-2">
                {completed.map((d) => (
                  <DispatchCard key={d.id} dispatch={d} isCompleted={true} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* 상세 정보 모달 */}
      {selectedDispatch && (
        <DetailModal dispatch={selectedDispatch} onClose={() => setSelectedDispatch(null)} />
      )}
    </div>
  )
}
