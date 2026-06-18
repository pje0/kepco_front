import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { getNotices } from '@/api/noticeApi'

export default function NoticePage() {
  const [notices, setNotices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getNotices()
      .then(setNotices)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSpinner className="h-64" />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">공지사항</h1>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="px-4 py-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelected(selected?.id === notice.id ? null : notice)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {notice.isPinned && (
                    <Badge variant="default" className="shrink-0 text-xs">공지</Badge>
                  )}
                  <span className={`text-sm font-medium truncate ${notice.isPinned ? 'text-foreground' : ''}`}>
                    {notice.title}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  <span>{notice.author}</span>
                  <span className="mx-1">·</span>
                  <span>{notice.createdAt}</span>
                  <span className="mx-1">·</span>
                  <span>조회 {notice.views}</span>
                </div>
              </div>

              {/* 상세 내용 토글 */}
              {selected?.id === notice.id && (
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground leading-relaxed">
                  {notice.content}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
