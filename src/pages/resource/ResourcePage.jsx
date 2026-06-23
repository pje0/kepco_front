import { useState, useEffect, useMemo } from 'react'
import { FolderOpen, Download, FileText, BookOpen, Lightbulb, FileCheck, ClipboardList, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { getResources, downloadResource } from '@/api/resourceApi'

const CATEGORIES = [
  { id: '', label: '전체' },
  { id: '매뉴얼', label: '매뉴얼' },
  { id: '교육자료', label: '교육자료' },
  { id: '보고서', label: '보고서' },
  { id: '서식', label: '서식' },
]

const FILE_TYPE_COLOR = {
  PDF: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  PPTX: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  DOCX: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  XLSX: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
}

const ITEMS_PER_PAGE = 10

export default function ResourcePage() {
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 초기 데이터 로드
  useEffect(() => {
    setIsLoading(true)
    getResources(selectedCategory ? { category: selectedCategory } : {})
      .then(setResources)
      .finally(() => setIsLoading(false))
  }, [selectedCategory])

  // 카테고리 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  // 검색 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // 검색 + 필터링된 자료
  const filteredResources = useMemo(() => {
    return resources.filter((res) =>
      res.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [resources, searchQuery])

  // 페이징 계산
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedResources = filteredResources.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // 페이지 번호 배열 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  if (isLoading) return <LoadingSpinner className="h-64" />

  const selectedCategoryLabel = CATEGORIES.find((cat) => cat.id === selectedCategory)?.label || '전체'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <FolderOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">자료실</h1>
      </div>

      {/* 필터 + 검색 영역 */}
      <div className="flex items-center gap-4">
        {/* 카테고리 필터 */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* 검색 입력창 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="제목으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* 자료 목록 */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `"${searchQuery}"에 해당하는 자료가 없습니다.`
                  : selectedCategory
                  ? `"${selectedCategoryLabel}" 카테고리에 자료가 없습니다.`
                  : '자료가 없습니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 자료 목록 테이블 형태 */}
          <div className="border border-border rounded-lg overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border font-semibold text-sm">
              <div className="col-span-6">제목</div>
              <div className="col-span-2">파일 형식</div>
              <div className="col-span-2">크기</div>
              <div className="col-span-2">다운로드</div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-y divide-border">
              {paginatedResources.map((res) => (
                <div key={res.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                  {/* 제목 */}
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{res.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{res.uploadedAt}</p>
                    </div>
                  </div>

                  {/* 파일 형식 */}
                  <div className="col-span-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium ${FILE_TYPE_COLOR[res.fileType] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {res.fileType}
                    </Badge>
                  </div>

                  {/* 크기 */}
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">{res.fileSize}</p>
                  </div>

                  {/* 다운로드 버튼 */}
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{res.downloads}</span>
                   <Button
                    variant="outline"
                    size="sm"
                    disabled={!res.fileUrl}
                    onClick={() => downloadResource(res.id)}
                    className="gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">다운</span>
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {/* 이전 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              {/* 페이지 번호 */}
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-10"
                >
                  {page}
                </Button>
              ))}

              {/* 다음 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </>
      )}
    </div>
  )
}
