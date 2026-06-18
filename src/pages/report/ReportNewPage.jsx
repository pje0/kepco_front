import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { createReport } from '@/api/reportApi'

export default function ReportNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', type: '정전', address: '', description: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.address.trim() || !form.description.trim()) {
      setError('모든 필드를 입력해 주세요.')
      return
    }
    setIsLoading(true)
    try {
      await createReport({
        ...form,
        citizenId: user.id,
        citizenName: user.name,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || '신고 접수에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-20 gap-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold mb-2">신고가 접수되었습니다!</h2>
          <p className="text-muted-foreground">담당자가 확인 후 신속하게 처리하겠습니다.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/report/my')}>내 신고 현황 보기</Button>
          <Button variant="outline" onClick={() => { setSuccess(false); setForm({ title: '', type: '정전', address: '', description: '' }) }}>
            추가 신고
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">정전·고장 신고</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>신고 접수</CardTitle>
          <CardDescription>정전 또는 전기 고장 내용을 상세히 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="예) 아파트 단지 전체 정전"
                value={form.title}
                onChange={handleChange('title')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">신고 유형 *</Label>
              <Select
                id="type"
                value={form.type}
                onChange={handleChange('type')}
                disabled={isLoading}
              >
                <option value="정전">정전</option>
                <option value="고장">고장</option>
                <option value="기타">기타</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">발생 주소 *</Label>
              <Input
                id="address"
                placeholder="예) 서울시 강남구 역삼동 123-45"
                value={form.address}
                onChange={handleChange('address')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상세 내용 *</Label>
              <Textarea
                id="description"
                placeholder="정전·고장 상황을 자세히 설명해 주세요."
                rows={5}
                value={form.description}
                onChange={handleChange('description')}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '접수 중...' : '신고 접수'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
