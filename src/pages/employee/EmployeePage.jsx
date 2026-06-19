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
// ⭕ updateEmployee API 함수 임포트
import { getEmployees, createEmployee, deleteEmployee, updateEmployee } from '@/api/employeeApi'
// 🌐 [공공데이터 연동]: contents 폴더에 생성한 행정구역 데이터셋 임포트
import { REGION_DATA } from '@/contents/regionData'

export default function EmployeePage() {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  // 🎯 [수정 모드 제어 상태]
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // 🗺️ [공공데이터 연동] 시도 및 시군구 동적 필터링 제어용 로컬 상태
  const [selectedSido, setSelectedSido] = useState('')
  const [selectedSigungu, setSelectedSigungu] = useState('')
  
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'WORKER',
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

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSelectChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // 🎯 [사원 이름 클릭 핸들러: 신규 등록 폼과 같은 위치에 데이터를 채워 뿅 띄움]
  const handleNameClick = (emp) => {
    window.scrollTo({ top: 0, behavior: 'smooth' }) // 폼이 있는 상단으로 부드럽게 스크롤
    setFormError('')
    setIsEditMode(true)
    setEditingId(emp.id)
    
    // 💡 [교정]: 백엔드의 'ROLE_WORKER' 형태에서 'ROLE_'를 제거하여 select 박스 value와 완벽 매칭
    const parsedRole = emp.role && emp.role.startsWith('ROLE_') 
      ? emp.role.replace('ROLE_', '') 
      : emp.role || 'WORKER';

    // 💡 [공공데이터 연동]: 기존 저장된 '부산광역시 기장군' 공백 문자열을 분리하여 드롭다운에 강제 바인딩 트리거
    if (emp.assignedDistrict && emp.assignedDistrict.includes(' ')) {
      const firstSpaceIndex = emp.assignedDistrict.indexOf(' ');
      const sidoPart = emp.assignedDistrict.substring(0, firstSpaceIndex);
      const sigunguPart = emp.assignedDistrict.substring(firstSpaceIndex + 1);
      setSelectedSido(sidoPart);
      setSelectedSigungu(sigunguPart);
    } else {
      setSelectedSido(emp.assignedDistrict || '');
      setSelectedSigungu('');
    }
    
    setForm({
      username: emp.username || '',
      password: '', // 비밀번호는 수정 시 공백 허용 정책
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      role: parsedRole,
      empNumber: emp.empNumber || '',
      department: emp.department || '',
      assignedDistrict: emp.assignedDistrict || '',
      certificate: emp.certificate || '',
      grade: emp.grade || 'JUNIOR'
    })
    setShowForm(true)
  }

  // 🎯 [폼 닫기 및 초기화 공통 핸들러]
  const handleCloseForm = () => {
    setShowForm(false)
    setIsEditMode(false)
    setEditingId(null)
    setFormError('')
    // 💡 [공공데이터 연동]: 닫을 때 연동 상태값도 완벽 포맷 클린 초기화
    setSelectedSido('')
    setSelectedSigungu('')
    setForm({
      username: '', password: '', name: '', email: '', phone: '',
      role: 'WORKER', empNumber: '', department: '', assignedDistrict: '', certificate: '', grade: 'JUNIOR'
    })
  }

  // 🎯 [등록 및 수정 통합 제출 핸들러]
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.username || (!isEditMode && !form.password) || !form.name || !form.email || !form.role || !form.empNumber) {
      setFormError('사원 계정 및 기본 신상 정보(* 사번 포함)를 모두 채워주세요.')
      return
    }

    if (form.role === 'WORKER') {
      if (!form.assignedDistrict) {
        setFormError('출동요원(직무전환 포함)은 현장 복구팀 필수 항목(담당 구역)을 모두 채워주세요.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        // ⭕ [수정 모드]: 기존 내근직이 WORKER로 바뀔 시 백엔드 연쇄 인서트 발동 위치
        // 💡 [교정]: 백엔드 AdminUserUpdateRequestDto 스펙에 맞춰 수정 가능한 직무/스펙 데이터만 빌드하여 전송
        const updatePayload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          empNumber: form.empNumber,
          department: form.department,
          assignedDistrict: form.assignedDistrict,
          certificate: form.certificate,
          grade: form.grade
        }
        await updateEmployee(editingId, updatePayload)
      } else {
        // ➕ [등록 모드]
        await createEmployee(form)
      }
      
      handleCloseForm()
      loadEmployees() 
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || '사원 정보 처리 중 오류가 발생했습니다.')
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
        <Button onClick={() => { if (showForm) handleCloseForm(); else { handleCloseForm(); setShowForm(true); } }}>
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? '폼 닫기' : '직원 등록'}
        </Button>
      </div>

{/* 🎯 기존 신규사원등록과 정확히 같은 위치의 통합 폼 카드 */}
      {showForm && (
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isEditMode ? `🚨 사원 정보 수정 및 직무전환 [대상: ${form.username}]` : '신규 직원 대행 등록'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* [구획 1]: 기본 계정 정보 영역 */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground"> 사원 계정 및 기본 신상 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>사원 아이디 *</Label>
                    <Input placeholder="사원 고유 아이디 (4자 이상)" value={form.username} onChange={handleChange('username')} disabled={isEditMode || isSubmitting} autoComplete="off" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isEditMode ? '새 임시 비밀번호 (변경 시에만)' : '초기 임시 비밀번호 *'}</Label>
                    <Input type="password" placeholder={isEditMode ? "비밀번호를 변경하지 않으려면 공백" : "초기 임시 비밀번호 (6자 이상)"} value={form.password} onChange={handleChange('password')} disabled={isSubmitting} autoComplete="new-password" />
                  </div>
                  <div className="space-y-2">
                    <Label>사원 실명 *</Label>
                    <Input placeholder="홍길동" value={form.name} onChange={handleChange('name')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>직무 권한 *</Label>
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
                    <Label>사번 *</Label>
                    <Input placeholder="EMP-2026XX" value={form.empNumber} onChange={handleChange('empNumber')} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label>소속 지사 및 부서</Label>
                    <Input placeholder="부산본부 기장지사 배전운영부" value={form.department} onChange={handleChange('department')} disabled={isSubmitting} />
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

              {/* [구획 2]: 내근직일 때 흐리게 잠기고, WORKER로 바꿀 때 뿅 열리는 동적 영역 */}
              <div className={`space-y-2 transition-all duration-200 ${form.role !== 'WORKER' ? 'opacity-35 pointer-events-none select-none bg-muted/5 p-2 rounded-lg' : ''}`}>
                <h3 className="text-sm font-semibold text-muted-foreground"> 현장 복구팀 역량 정보 (OpenAI 분석 연동 소스) {form.role === 'WORKER' && <span className="text-destructive font-bold">*</span>}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>담당 시·도 선택 *</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={selectedSido} 
                      onChange={(e) => {
                        const sido = e.target.value;
                        setSelectedSido(sido);
                        setSelectedSigungu('');
                        handleSelectChange('assignedDistrict', '');
                      }}
                      disabled={form.role !== 'WORKER' || isSubmitting}
                    >
                      <option value="">시·도 선택</option>
                      {Object.keys(REGION_DATA).map((sido) => (
                        <option key={sido} value={sido}>{sido}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>담당 시·군·구 지정 *</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={selectedSigungu} 
                      onChange={(e) => {
                        const sigungu = e.target.value;
                        setSelectedSigungu(sigungu);
                        handleSelectChange('assignedDistrict', selectedSido + " " + sigungu);
                      }}
                      disabled={form.role !== 'WORKER' || !selectedSido || isSubmitting}
                    >
                      <option value="">시·군·구 선택</option>
                      {selectedSido && REGION_DATA[selectedSido].map((sigungu) => (
                        <option key={sigungu} value={sigungu}>{sigungu}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>기술 숙련도 직급</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={form.grade} 
                      onChange={(e) => handleSelectChange('grade', e.target.value)}
                      disabled={form.role !== 'WORKER' || isSubmitting}
                    >
                         <option value="JUNIOR">JUNIOR (초급)</option>
                        <option value="SENIOR">SENIOR (중급)</option>
                        <option value="MASTER">MASTER (고급/명장)</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>보유 자격증 목록 (쉼표 구분)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-md border border-input bg-background/50">
                      {['전기기사', '전기산업기사', '전기공사기사', '전기공사산업기사', '전기기능장', '전기안전기술사', '발송배전기술사', '정보처리기사', '소방설비기사(전기)', '산업안전기사'].map((cert) => {
                        const currentCerts = form.certificate ? form.certificate.split(',').map(c => c.trim()).filter(Boolean) : [];
                        const isChecked = currentCerts.includes(cert);
                        return (
                          <label key={cert} className={`flex items-center gap-2 text-sm p-2 rounded-md border cursor-pointer transition-all ${isChecked ? 'bg-primary/5 border-primary text-primary font-medium' : 'hover:bg-muted/50 border-transparent text-muted-foreground'}`}>
                            <input
                              type="checkbox"
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                              checked={isChecked}
                              disabled={form.role !== 'WORKER' || isSubmitting}
                              onChange={(e) => {
                                let updatedList = [...currentCerts];
                                if (e.target.checked) {
                                  updatedList.push(cert);
                                } else {
                                  updatedList = updatedList.filter((c) => c !== cert);
                                }
                                handleSelectChange('certificate', updatedList.join(', '));
                              }}
                            />
                            {cert}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
              )}
              
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '처리 중...' : isEditMode ? '수정 완료' : '등록'}
                </Button>
<Button type="button" variant="outline" onClick={handleCloseForm}>취소</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 검색 바 */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="이름, 부서, 이메일 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
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
                <TableHead className="text-center w-[120px] pr-6">관리</TableHead>
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
                  <TableRow key={emp.id} className="hover:bg-muted/40 transition-colors">
                    {/* 🎯 사원 이름 열의 기존 마우스 클릭 핸들러 제거 후 순수 텍스트로 복원 */}
                    <TableCell className="font-semibold text-foreground">
                      {emp.name}
                    </TableCell>
                    <TableCell><RoleBadge role={emp.role} /></TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    <TableCell>{emp.phone || '-'}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.hiredAt || '-'}</TableCell>
                    {/* 관리 액션 버튼 영역: 오른쪽 정렬(justify-end)을 중앙 정렬(justify-center)로 완벽 교정 */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary/90 hover:bg-primary/10 h-8 w-8"
                          onClick={() => handleNameClick(emp)}
                          disabled={isSubmitting}
                        >
                          <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleDelete(emp.id, emp.name)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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