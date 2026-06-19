import { useState, useEffect } from 'react'
import { FolderOpen, Download, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { getResources, downloadResource } from '@/api/resourceApi'

const FILE_TYPE_COLOR = {
  PDF: 'bg-red-100 text-red-700',
  PPTX: 'bg-orange-100 text-orange-700',
  DOCX: 'bg-blue-100 text-blue-700',
  XLSX: 'bg-green-100 text-green-700',
}

export default function ResourcePage() {
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    setIsLoading(true)
    getResources(category ? { category } : {})
      .then(setResources)
      .finally(() => setIsLoading(false))
  }, [category])

  if (isLoading) return <LoadingSpinner className="h-64" />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">자료실</h1>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-40"
        >
          <option value="">전체 카테고리</option>
          <option value="매뉴얼">매뉴얼</option>
          <option value="교육자료">교육자료</option>
          <option value="보고서">보고서</option>
          <option value="서식">서식</option>
        </select>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {resources.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">자료가 없습니다.</p>
          ) : (
            resources.map((res) => (
              <div key={res.id} className="flex items-center justify-between px-4 py-4 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{res.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${FILE_TYPE_COLOR[res.fileType] || 'bg-gray-100 text-gray-700'}`}>
                        {res.fileType}
                      </span>
                      <span className="text-xs text-muted-foreground">{res.fileSize}</span>
                      <span className="text-xs text-muted-foreground">{res.uploadedAt}</span>
                      <span className="text-xs text-muted-foreground">다운로드 {res.downloads}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={!res.fileUrl}
                  onClick={() => downloadResource(res.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}