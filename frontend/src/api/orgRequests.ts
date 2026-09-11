import { request } from './client'
import type { OrganizationRequest, OrganizationRequestCreate } from '@/types'

export const orgRequestsApi = {
  create(data: OrganizationRequestCreate) {
    return request<OrganizationRequest>('/organization-requests', { method: 'POST', body: data })
  },
  /** Current user's own requests (any authenticated user). */
  my() {
    return request<OrganizationRequest[]>('/organization-requests/my')
  },
  /** All requests — platform admin only. */
  list() {
    return request<OrganizationRequest[]>('/organization-requests')
  },
  approve(id: number) {
    return request<OrganizationRequest>(`/organization-requests/${id}/approve`, { method: 'POST' })
  },
  reject(id: number) {
    return request<OrganizationRequest>(`/organization-requests/${id}/reject`, { method: 'POST' })
  },
}
