import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { uploadResource } from '@/api/resourceApi'

const CATEGORIES = [
  { id: '매뉴얼', label: '매뉴얼' },
  { id: '교육자료', label: '교육자료' },
  { id: '보고서', label: '보고서' },
  { id: '서식', label: '서식' },
]

export default function UploadResourcePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    category: '매뉴얼',
    description: '',
    file: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, file }))
      setError('')
    }
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null }))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 필수 필드 검증
    if (!formData.title.trim()) {
      setError('제목을 입력해 주세요.')
      return
    }
    if (!formData.category) {
      setError('카테고리를 선택해 주세요.')
      return
    }
    if (!formData.file) {
      setError('파일을 선택해 주세요.')
      return
    }

    setIsLoading(true)
    try {
        await uploadResource(formData)
        navigate('/resources')

      // 성공 후 자료실로 이동
      navigate('/resources')
    } catch (err) {
      setError(err.message || '등록에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">자료 등록</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">새 자료 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">
                제목 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                name="title"
                placeholder="자료 제목을 입력해 주세요"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isLoading}
                className="text-sm"
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold">
                카테고리 <span className="text-destructive">*</span>
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                설명 <span className="text-muted-foreground text-xs">(선택)</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="자료에 대한 설명을 입력해 주세요"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                className="text-sm resize-none"
              />
            </div>

            {/* 첨부파일 */}
            <div className="space-y-2">
              <Label htmlFor="file" className="font-semibold">
                첨부파일 <span className="text-destructive">*</span>
              </Label>
              {!formData.file ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="hidden"
                    accept=".pdf,.pptx,.docx,.xlsx,.doc,.xls"
                  />
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      파일을 선택하거나 드래그해서 놓으세요
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, PPTX, DOCX, XLSX 파일 지원
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Upload className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(formData.file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isLoading}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/resources')}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '등록 중...' : '등록'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
