import { request } from './client'
import type { Department } from '@/types'

export const departmentsApi = {
  list(organizationId: number) {
    return request<Department[]>(`/departments/organization/${organizationId}`)
  },
  create(organizationId: number, data: { name: string }) {
    return request<Department>(`/departments/organization/${organizationId}`, { method: 'POST', body: data })
  },
  get(departmentId: number) {
    return request<Department>(`/departments/${departmentId}`)
  },
  update(departmentId: number, data: { name?: string }) {
    return request<Department>(`/departments/${departmentId}`, { method: 'PATCH', body: data })
  },
  remove(departmentId: number) {
    return request<{ msg: string }>(`/departments/${departmentId}`, { method: 'DELETE' })
  },
}
