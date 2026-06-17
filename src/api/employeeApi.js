import axiosInstance from './axiosInstance'

let mockEmployees = [
  { id: 1, name: '정출동', role: 'ROLE_WORKER', department: '현장출동1팀', phone: '010-5678-9012', email: 'worker1@kepco.co.kr', status: 'ACTIVE', joinedAt: '2020-03-02' },
  { id: 2, name: '한출동', role: 'ROLE_WORKER', department: '현장출동2팀', phone: '010-6789-0123', email: 'worker2@kepco.co.kr', status: 'ACTIVE', joinedAt: '2021-07-15' },
  { id: 3, name: '박파견', role: 'ROLE_DISPATCH', department: '파견관리팀', phone: '010-3456-7890', email: 'dispatch1@kepco.co.kr', status: 'ACTIVE', joinedAt: '2019-01-10' },
  { id: 4, name: '이인사', role: 'ROLE_HR', department: '인사팀', phone: '010-2345-6789', email: 'hr1@kepco.co.kr', status: 'ACTIVE', joinedAt: '2018-05-20' },
  { id: 5, name: '최관리', role: 'ROLE_ADMIN', department: '시스템관리팀', phone: '010-4567-8901', email: 'admin1@kepco.co.kr', status: 'ACTIVE', joinedAt: '2017-11-01' },
]
let nextId = 6

/**
 * 직원 목록 조회
 * [실제] TODO: return axiosInstance.get('/employees', { params }).then(r => r.data)
 */
export async function getEmployees(params = {}) {
  await new Promise((r) => setTimeout(r, 300))
  let result = [...mockEmployees]
  if (params.role) result = result.filter((e) => e.role === params.role)
  if (params.department) result = result.filter((e) => e.department.includes(params.department))
  return result
}

/**
 * 직원 단건 조회
 * [실제] TODO: return axiosInstance.get(`/employees/${id}`).then(r => r.data)
 */
export async function getEmployee(id) {
  await new Promise((r) => setTimeout(r, 200))
  const emp = mockEmployees.find((e) => e.id === Number(id))
  if (!emp) throw new Error('직원을 찾을 수 없습니다.')
  return emp
}

/**
 * 직원 등록
 * [실제] TODO: return axiosInstance.post('/employees', data).then(r => r.data)
 */
export async function createEmployee(data) {
  await new Promise((r) => setTimeout(r, 400))
  const newEmp = { id: nextId++, ...data, status: 'ACTIVE', joinedAt: new Date().toISOString().slice(0, 10) }
  mockEmployees.push(newEmp)
  return newEmp
}

/**
 * 직원 정보 수정
 * [실제] TODO: return axiosInstance.put(`/employees/${id}`, data).then(r => r.data)
 */
export async function updateEmployee(id, data) {
  await new Promise((r) => setTimeout(r, 300))
  const idx = mockEmployees.findIndex((e) => e.id === Number(id))
  if (idx === -1) throw new Error('직원을 찾을 수 없습니다.')
  mockEmployees[idx] = { ...mockEmployees[idx], ...data }
  return mockEmployees[idx]
}

/**
 * 직원 삭제
 * [실제] TODO: return axiosInstance.delete(`/employees/${id}`).then(r => r.data)
 */
export async function deleteEmployee(id) {
  await new Promise((r) => setTimeout(r, 300))
  mockEmployees = mockEmployees.filter((e) => e.id !== Number(id))
  return { message: '삭제되었습니다.' }
}
