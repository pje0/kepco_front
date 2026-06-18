import { useState, useEffect } from 'react'
import { Users, Plus, Search, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import RoleBadge from '@/components/common/RoleBadge'
import { getEmployees, createEmployee, deleteEmployee } from '@/api/employeeApi'

export default function EmployeePage() {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  // 💡 [교정]: AdminUserRegisterDto 11개 필드 스펙으로 초기값 완벽 확장
  const [form, setForm] = useState({
    loginId: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'WORKER', // 백엔드 자동 보정식에 맞춘 접두사 제외 순수 단어
    empNumber: '',
    department: '',
    assignedDistrict: '',
    certificate: '',
    grade: 'JUNIOR'
  })
  
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEmployees = () => {
    setIsLoading(true)
    getEmployees().then(setEmployees).finally(() => setIsLoading(false))
  }

  useEffect(() => { loadEmployees() }, [])

  const filtered = employees.filter(
    (e) =>
      (e.name && e.name.includes(search)) ||
      (e.department && e.department.includes(search)) ||
      (e.email && e.email.includes(search))
  )

  // 표준 Input용 핸들러
  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // 💡 [드롭다운 버그 박멸]: Radix UI Select의 e.target.value 누락 오류를 방어하는 전용 직접 주입 핸들러
  const handleSelectChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')

    // 1단계: 모든 직군 공통 필수 계정 정보 검증 (사번, 담당 구역 제외)
    if (!form.loginId || !form.password || !form.name || !form.email || !form.role) {
      setFormError('사원 계정 및 기본 신상 정보(*)를 모두 채워주세요.')
      return
    }

    // 2단계 [핵심 분기]: 현장 출동요원(WORKER)일 때만 하단 역량 정보를 필수로 강제
    if (form.role === 'WORKER') {
      if (!form.empNumber || !form.assignedDistrict) {
        setFormError('출동요원은 현장 복구팀 필수 항목(사번, 담당 구역)을 모두 채워주세요.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      // 실제 Axios 레이어를 타고 DB에 연쇄 인서트 실행
      await createEmployee(form)
      setShowForm(false)
      
      // 폼 초기화
      setForm({
        loginId: '', password: '', name: '', email: '', phone: '',
        role: 'WORKER', empNumber: '', department: '', assignedDistrict: '', certificate: '', grade: 'JUNIOR'
      })
      loadEmployees() // 등록 성공 후 진짜 DB 목록 리로드
    } catch (err) {
      // 백엔드 @Valid 에러 메시지 바인딩 가동
      setFormError(err.response?.data?.message || err.message || '사원 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${name} 직원을 퇴사 처리(계정 영구 삭제) 하시겠습니까?`)) return
    try {
      await deleteEmployee(id)
      loadEmployees()
    } catch (err) {
      alert('삭제 실패: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">인사관리</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          직원 등록
        </Button>
      </div>

      {/* 11개 필드 통합 확장 등록 폼 */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">신규 직원 대행 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              
              {/* [구획 1]: 기본 계정 정보 영역 (users 매핑) */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">[1] 사원 계정 및 기본 신상 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>사원 아이디 *</Label>
                    <Input placeholder="사원 고유 아이디 (4자 이상)" value={form.loginId} onChange={handleChange('loginId')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>초기 임시 비밀번호 *</Label>
                    <Input type="password" placeholder="초기 임시 비밀번호 (6자 이상)" value={form.password} onChange={handleChange('password')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>사원 실명 *</Label>
                    <Input placeholder="홍길동" value={form.name} onChange={handleChange('name')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>직무 권한 *</Label>
                    {/* 💡 표준 안정형 디자인 가로채기로 드롭다운 깨짐 버그 원천 봉쇄 */}
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={form.role} 
                      onChange={(e) => handleSelectChange('role', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="WORKER">출동요원 (WORKER)</option>
                      <option value="DISPATCHER">관제센터 (DISPATCHER)</option>
                      <option value="HR">인사담당 (HR)</option>
                      <option value="ADMIN">관리자 (ADMIN)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>이메일 주소 *</Label>
                    <Input type="email" placeholder="name@kepco.co.kr" value={form.email} onChange={handleChange('email')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>연락처 (선택)</Label>
                    <Input placeholder="010-0000-0000" value={form.phone} onChange={handleChange('phone')} disabled={isSubmitting} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* [구획 2]: 복구팀 확장 인력 정보 영역 (recovery_worker 매핑) */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">[2] 현장 복구팀 역량 정보 (OpenAI 분석 연동 소스)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>사번 *</Label>
                    <Input placeholder="EMP-2026XX" value={form.empNumber} onChange={handleChange('empNumber')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>소속 지사 및 부서</Label>
                    <Input placeholder="부산본부 기장지사 배전운영부" value={form.department} onChange={handleChange('department')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>담당 구역 지정 *</Label>
                    <Input placeholder="기장군 / 사상구 / 수영구" value={form.assignedDistrict} onChange={handleChange('assignedDistrict')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>기술 숙련도 직급</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={form.grade} 
                      onChange={(e) => handleSelectChange('grade', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="JUNIOR">JUNIOR (초급)</option>
                      <option value="SENIOR">SENIOR (중급)</option>
                      <option value="MASTER">MASTER (고급/명장)</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>보유 자격증 목록 (쉼표 구분)</Label>
                    <Input placeholder="전기기사, 전기산업기사, 정보처리기사" value={form.certificate} onChange={handleChange('certificate')} disabled={isSubmitting} />
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
              )}
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '등록'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>취소</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 검색 */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="이름, 부서, 이메일 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* 실제 DB 연동 목록 테이블 */}
      {isLoading ? (
        <LoadingSpinner className="h-48" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>입사일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell><RoleBadge role={emp.role} /></TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.phone}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.hiredAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(emp.id, emp.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
