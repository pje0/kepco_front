import { useState, useEffect } from 'react'
import { Users, Plus, Search, Trash2, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
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
  const [form, setForm] = useState({ name: '', role: 'ROLE_WORKER', department: '', phone: '', email: '' })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEmployees = () => {
    setIsLoading(true)
    getEmployees().then(setEmployees).finally(() => setIsLoading(false))
  }

  useEffect(() => { loadEmployees() }, [])

  const filtered = employees.filter(
    (e) =>
      e.name.includes(search) ||
      e.department.includes(search) ||
      e.email.includes(search)
  )

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name || !form.department || !form.phone || !form.email) {
      setFormError('모든 필드를 입력해 주세요.')
      return
    }
    setIsSubmitting(true)
    try {
      await createEmployee(form)
      setShowForm(false)
      setForm({ name: '', role: 'ROLE_WORKER', department: '', phone: '', email: '' })
      loadEmployees()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${name} 직원을 삭제하시겠습니까?`)) return
    await deleteEmployee(id)
    loadEmployees()
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

      {/* 등록 폼 */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">신규 직원 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>이름 *</Label>
                <Input placeholder="홍길동" value={form.name} onChange={handleChange('name')} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label>역할 *</Label>
                <Select value={form.role} onChange={handleChange('role')} disabled={isSubmitting}>
                  <option value="ROLE_WORKER">출동요원</option>
                  <option value="ROLE_DISPATCH">파견담당</option>
                  <option value="ROLE_HR">인사담당</option>
                  <option value="ROLE_ADMIN">관리자</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>부서 *</Label>
                <Input placeholder="현장출동1팀" value={form.department} onChange={handleChange('department')} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label>연락처 *</Label>
                <Input placeholder="010-0000-0000" value={form.phone} onChange={handleChange('phone')} disabled={isSubmitting} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>이메일 *</Label>
                <Input type="email" placeholder="name@kepco.co.kr" value={form.email} onChange={handleChange('email')} disabled={isSubmitting} />
              </div>
              {formError && (
                <p className="sm:col-span-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
              )}
              <div className="sm:col-span-2 flex gap-3">
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

      {/* 목록 */}
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
                    <TableCell>{emp.joinedAt}</TableCell>
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
