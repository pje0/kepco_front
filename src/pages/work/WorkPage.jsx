import { useState, useEffect } from 'react'
import { HardHat, RefreshCw, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { getDispatches, updateDispatch } from '@/api/dispatchApi'

export default function WorkPage() {
  const { user } = useAuth()
  const [dispatches, setDispatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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
                  <Card key={d.id} className="border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{d.reportTitle}</p>
                          {d.note && (
                            <p className="text-sm text-muted-foreground mt-1">
                              지시 사항: {d.note}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          파견: {d.dispatchedAt}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {d.status === 'DISPATCHED' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(d.id, 'IN_PROGRESS')}
                          >
                            현장 도착 (처리 시작)
                          </Button>
                        )}
                        {d.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate(d.id, 'COMPLETED')}
                          >
                            처리 완료
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card key={d.id} className="opacity-70">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{d.reportTitle}</p>
                        <StatusBadge status={d.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{d.dispatchedAt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
