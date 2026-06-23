import { useState } from 'react'
import { User, Edit2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import RoleBadge from '@/components/common/RoleBadge'
import { updateProfile } from '@/api/authApi'

export default function MyPage() {
  const { user } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    currentPw: '',
    newPw: '',
    confirmPw: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // 비밀번호 변경 시 검증
    if (formData.newPw || formData.confirmPw) {
      if (!formData.currentPw) {
        setError('현재 비밀번호를 입력해 주세요.')
        return
      }
      if (formData.newPw !== formData.confirmPw) {
        setError('새 비밀번호가 일치하지 않습니다.')
        return
      }
      if (formData.newPw.length < 4) {
        setError('비밀번호는 4자 이상이어야 합니다.')
        return
      }
    }

    setIsLoading(true)
    try {
      // 실제: 백엔드에서 이메일, 연락처, 비밀번호 한 번에 업데이트
      // TODO: updateProfile(formData) API 호출
              await updateProfile({
        email: formData.email,
        phone: formData.phone,
        ...(formData.newPw ? { password: formData.newPw } : {}),
      })
      setSuccess('개인정보가 변경되었습니다.')
      setTimeout(() => {
        setShowEditModal(false)
        setFormData({
          email: user?.email || '',
          phone: user?.phone || '',
          currentPw: '',
          newPw: '',
          confirmPw: '',
        })
      }, 1500)
    } catch (err) {
      setError(err.message || '변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowEditModal(false)
    setFormData({
      email: user?.email || '',
      phone: user?.phone || '',
      currentPw: '',
      newPw: '',
      confirmPw: '',
    })
    setError('')
    setSuccess('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {/* 내 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{user?.name}</CardTitle>
                {user?.department && (
                  <CardDescription>{user.department}</CardDescription>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              수정
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">역할</p>
              <RoleBadge role={user?.role} />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">이메일</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">연락처</p>
              <p className="font-medium">{user?.phone}</p>
            </div>
            {user?.department && (
              <div>
                <p className="text-muted-foreground mb-1">부서</p>
                <p className="font-medium">{user.department}</p>
              </div>
            )}
            {user?.id && (
              <div>
                <p className="text-muted-foreground mb-1">사원번호</p>
                <p className="font-medium">{user.id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 개인정보 수정 모달 */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <div
            className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">개인정보 수정</h2>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                {/* 이메일 */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                {/* 연락처 */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">
                    연락처
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                {/* 비밀번호 변경 구분선 */}
                <Separator className="my-4" />

                {/* 현재 비밀번호 */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPw" className="text-sm">
                    현재 비밀번호
                    <span className="text-muted-foreground text-xs ml-1">(변경 시만 입력)</span>
                  </Label>
                  <Input
                    id="currentPw"
                    type="password"
                    name="currentPw"
                    placeholder="비밀번호를 변경하지 않으면 비워두세요"
                    value={formData.currentPw}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                {/* 새 비밀번호 */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPw" className="text-sm">
                    새 비밀번호
                  </Label>
                  <Input
                    id="newPw"
                    type="password"
                    name="newPw"
                    placeholder="변경할 비밀번호"
                    value={formData.newPw}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                {/* 새 비밀번호 확인 */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPw" className="text-sm">
                    새 비밀번호 확인
                  </Label>
                  <Input
                    id="confirmPw"
                    type="password"
                    name="confirmPw"
                    placeholder="비밀번호 확인"
                    value={formData.confirmPw}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="text-sm"
                  />
                </div>

                {/* 에러/성공 메시지 */}
                {error && (
                  <p className="text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1.5">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-xs text-green-700 bg-green-50 rounded-md px-2 py-1.5">
                    {success}
                  </p>
                )}

                {/* 버튼 */}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? '저장 중...' : '저장'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
