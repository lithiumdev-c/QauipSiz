import { request } from './client'
import type { Case, CaseCreate, CaseUpdate } from '@/types'

export const casesApi = {
  list(organizationId: number) {
    return request<Case[]>(`/cases/organization/${organizationId}`)
  },
  get(caseId: number) {
    return request<Case>(`/cases/${caseId}`)
  },
  create(organizationId: number, departmentId: number, data: CaseCreate) {
    return request<Case>(`/cases/organization/${organizationId}/department/${departmentId}`, {
      method: 'POST',
      body: data,
    })
  },
  update(caseId: number, data: CaseUpdate) {
    return request<Case>(`/cases/${caseId}`, { method: 'PATCH', body: data })
  },
  remove(caseId: number) {
    return request<{ msg: string }>(`/cases/${caseId}`, { method: 'DELETE' })
  },
}
