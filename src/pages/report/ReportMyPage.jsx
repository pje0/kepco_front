import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { useAuth } from '@/context/AuthContext'
import { getReports } from '@/api/reportApi'

export default function ReportMyPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getReports({ citizenId: user?.id })
      .then(setReports)
      .finally(() => setIsLoading(false))
  }, [user])

  if (isLoading) return <LoadingSpinner className="h-64" />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">내 신고 현황</h1>
        </div>
        <Button asChild>
          <Link to="/report/new">
            <Plus className="h-4 w-4 mr-1" />
            신고 접수
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">접수된 신고가 없습니다.</p>
            <Button asChild>
              <Link to="/report/new">첫 신고 접수하기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs shrink-0">{report.type}</Badge>
                      <span className="font-medium text-sm truncate">{report.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{report.address}</p>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={report.status} />
                    <span className="text-xs text-muted-foreground">{report.reportedAt}</span>
                  </div>
                </div>
                {report.workerName && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    출동요원: <span className="font-medium text-foreground">{report.workerName}</span>
                    {report.dispatchedAt && <span className="ml-2">· 출동: {report.dispatchedAt}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
