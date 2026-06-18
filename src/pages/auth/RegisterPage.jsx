import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { register as apiRegister } from '@/api/authApi'

export default function RegisterPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 💡 1. 백엔드 RegisterRequestDto 필수 조건 매칭 및 유효성 사전 검사
    if (!loginId.trim() || !password.trim() || !name.trim()) {
      setError('필수 입력 항목(아이디, 비밀번호, 성명)을 입력해 주세요.')
      return
    }
    if (loginId.length < 4 || loginId.length > 50) {
      setError('아이디는 4자 이상 50자 이하로 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상 입력해 주세요.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    try {
      // 💡 2. 아까 완성한 authApi.js의 register 함수를 호출하여 백엔드 DTO 규격 그대로 post 전송
      await apiRegister(loginId, password, name, email, phone)
      alert('한전 MIS 시스템에 회원가입이 완료되었습니다! 로그인 후 이용해 주세요.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || err.message || '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Zap className="h-8 w-8 text-primary fill-primary" />
          </div>
          <h1 className="text-2xl font-bold">KEPCO MIS</h1>
          <p className="text-sm text-muted-foreground mt-1">정전·고장 신고 파견 관리 시스템</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>민원인 회원가입</CardTitle>
            <CardDescription>신고 서비스 이용을 위한 정보를 입력해 주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 아이디 입력 */}
              <div className="space-y-2">
                <Label htmlFor="loginId">아이디 <span className="text-destructive">*</span></Label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="4자 이상 50자 이하"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* 성명 입력 */}
              <div className="space-y-2">
                <Label htmlFor="name">성명 (실명) <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름 입력"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="6자 이상 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 입력 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인 <span className="text-destructive">*</span></Label>
                <Input
                  id="confirmPassword"
                  type={showPw ? 'text' : 'password'}
                  placeholder="비밀번호 재입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@kepco.co.kr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* 연락처 입력 */}
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="010-XXXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '가입 처리 중...' : '회원가입 완료'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="hover:text-primary underline underline-offset-4">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  )
}
