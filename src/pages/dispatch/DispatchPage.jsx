import { useState, useEffect } from 'react'
import { Truck, Plus, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { getDispatches, createDispatch, updateDispatch } from '@/api/dispatchApi'
import { getReports } from '@/api/reportApi'
import { getEmployees } from '@/api/employeeApi'

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState([])
  const [pendingReports, setPendingReports] = useState([])
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reportId: '', workerId: '', note: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadAll = async () => {
    setIsLoading(true)
    try {
      const [d, r, w] = await Promise.all([
        getDispatches(),
        getReports({ status: 'PENDING' }),
        getEmployees({ role: 'ROLE_WORKER' }),
      ])
      setDispatches(d)
      setPendingReports(r)
      setWorkers(w)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.reportId || !form.workerId) {
      setFormError('신고 건과 출동요원을 선택해 주세요.')
      return
    }
    setIsSubmitting(true)
    try {
      const report = pendingReports.find((r) => r.id === Number(form.reportId))
      const worker = workers.find((w) => w.id === Number(form.workerId))
      await createDispatch({
        reportId: Number(form.reportId),
        reportTitle: report?.title || '',
        workerId: Number(form.workerId),
        workerName: worker?.name || '',
        note: form.note,
      })
      setShowForm(false)
      setForm({ reportId: '', workerId: '', note: '' })
      loadAll()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    await updateDispatch(id, { status })
    loadAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">파견 관리</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadAll}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" />파견 지시
          </Button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '대기 신고', value: pendingReports.length, color: 'text-yellow-600' },
          { label: '출동 중', value: dispatches.filter((d) => d.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
          { label: '완료', value: dispatches.filter((d) => d.status === 'COMPLETED').length, color: 'text-green-600' },
          { label: '가용 요원', value: workers.length, color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 파견 지시 폼 */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="text-base">파견 지시 생성</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>신고 건 선택 *</Label>
                <Select value={form.reportId} onChange={handleChange('reportId')} disabled={isSubmitting}>
                  <option value="">-- 신고 건 선택 --</option>
                  {pendingReports.map((r) => (
                    <option key={r.id} value={r.id}>[{r.type}] {r.title}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>출동요원 선택 *</Label>
                <Select value={form.workerId} onChange={handleChange('workerId')} disabled={isSubmitting}>
                  <option value="">-- 출동요원 선택 --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.department})</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>지시 사항</Label>
                <Input placeholder="출동 시 참고 사항 입력" value={form.note} onChange={handleChange('note')} disabled={isSubmitting} />
              </div>
              {formError && (
                <p className="sm:col-span-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
              )}
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '처리 중...' : '파견 지시'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>취소</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 파견 목록 */}
      {isLoading ? (
        <LoadingSpinner className="h-48" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신고 건</TableHead>
                <TableHead>출동요원</TableHead>
                <TableHead>파견 시각</TableHead>
                <TableHead>지시 사항</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">처리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">파견 내역이 없습니다.</TableCell>
                </TableRow>
              ) : (
                dispatches.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{d.reportTitle}</TableCell>
                    <TableCell>{d.workerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.dispatchedAt}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{d.note || '-'}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-right">
                      {d.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(d.id, d.status === 'DISPATCHED' ? 'IN_PROGRESS' : 'COMPLETED')}
                        >
                          {d.status === 'DISPATCHED' ? '처리 중으로' : '완료 처리'}
                        </Button>
                      )}
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
