import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { getDashboardStats } from '@/api/dashboardApi'

/** 간단한 막대 차트 (SVG 기반, 외부 라이브러리 없음) */
function BarChart({ data, valueKey, labelKey, color = '#3b82f6' }) {
  const max = Math.max(...data.map((d) => d[valueKey]))
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item) => {
        const height = max > 0 ? (item[valueKey] / max) * 100 : 0
        return (
          <div key={item[labelKey]} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs text-muted-foreground">{item[valueKey]}</span>
            <div
              className="w-full rounded-t transition-all"
              style={{ height: `${height}%`, backgroundColor: color, minHeight: '4px' }}
            />
            <span className="text-xs text-muted-foreground">{item[labelKey]}</span>
          </div>
        )
      })}
    </div>
  )
}

/** 도넛 차트 (SVG 기반) */
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444']
  let offset = 0
  const segments = data.map((d, i) => {
    const pct = total > 0 ? (d.count / total) * 100 : 0
    const seg = { ...d, pct, offset, color: COLORS[i % COLORS.length] }
    offset += pct
    return seg
  })
  const r = 40
  const circ = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {segments.map((seg) => (
          <circle
            key={seg.type || seg.region}
            cx="50" cy="50" r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${(seg.pct / 100) * circ} ${circ}`}
            strokeDashoffset={-((seg.offset / 100) * circ)}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <div className="space-y-1">
        {segments.map((seg) => (
          <div key={seg.type || seg.region} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.type || seg.region}</span>
            <span className="font-medium">{seg.count}</span>
            <span className="text-muted-foreground">({seg.pct.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const STAT_CARDS = [
  { key: 'totalReports',    label: '전체 신고',    icon: Activity,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950' },
  { key: 'pendingReports',  label: '접수 대기',    icon: AlertTriangle,  color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  { key: 'dispatchedReports', label: '출동 중',   icon: TrendingUp,     color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950' },
  { key: 'completedReports', label: '처리 완료',   icon: CheckCircle,    color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
  { key: 'totalWorkers',    label: '전체 요원',    icon: Users,          color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
  { key: 'activeWorkers',   label: '출동 중 요원', icon: Users,          color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  { key: 'avgResponseMinutes', label: '평균 응답(분)', icon: Clock,      color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-950' },
  { key: 'todayReports',    label: '오늘 신고',    icon: BarChart3,      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSpinner className="h-64" />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">통계 대시보드</h1>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{stats[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 행 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 신고 건수 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">월별 신고 건수 (최근 6개월)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={stats.monthlyReports} valueKey="count" labelKey="month" color="#3b82f6" />
          </CardContent>
        </Card>

        {/* 신고 유형별 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">신고 유형별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={stats.typeBreakdown} />
          </CardContent>
        </Card>

        {/* 지역별 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">지역별 신고 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={stats.regionBreakdown} valueKey="count" labelKey="region" color="#10b981" />
          </CardContent>
        </Card>

        {/* 처리 현황 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">처리 현황 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: '처리 완료율', value: stats.totalReports > 0 ? ((stats.completedReports / stats.totalReports) * 100).toFixed(1) + '%' : '0%', color: 'bg-green-500' },
              { label: '출동 중 비율', value: stats.totalReports > 0 ? ((stats.dispatchedReports / stats.totalReports) * 100).toFixed(1) + '%' : '0%', color: 'bg-blue-500' },
              { label: '대기 비율', value: stats.totalReports > 0 ? ((stats.pendingReports / stats.totalReports) * 100).toFixed(1) + '%' : '0%', color: 'bg-yellow-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: value }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
