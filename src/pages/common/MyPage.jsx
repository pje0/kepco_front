import { useState } from 'react'
import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import RoleBadge from '@/components/common/RoleBadge'
import { changePassword } from '@/api/authApi'

export default function MyPage() {
  const { user } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('모든 필드를 입력해 주세요.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    if (newPw.length < 4) {
      setPwError('비밀번호는 4자 이상이어야 합니다.')
      return
    }
    setIsLoading(true)
    try {
      await changePassword(currentPw, newPw)
      setPwSuccess('비밀번호가 변경되었습니다.')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwError(err.message || '변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      {/* 내 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.department}</CardDescription>
            </div>
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
            <div>
              <p className="text-muted-foreground mb-1">부서</p>
              <p className="font-medium">{user?.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">비밀번호 변경</CardTitle>
          <CardDescription>현재 비밀번호를 확인 후 새 비밀번호로 변경합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPw">현재 비밀번호</Label>
              <Input
                id="currentPw"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="newPw">새 비밀번호</Label>
              <Input
                id="newPw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPw">새 비밀번호 확인</Label>
              <Input
                id="confirmPw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {pwError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{pwError}</p>
            )}
            {pwSuccess && (
              <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">{pwSuccess}</p>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
