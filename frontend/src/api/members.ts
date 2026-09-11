import { request } from './client'
import type { OrganizationMember, OrganizationMemberCreate } from '@/types'

export const membersApi = {
  list(organizationId: number) {
    return request<OrganizationMember[]>(`/organization-members/${organizationId}`)
  },
  create(data: OrganizationMemberCreate) {
    return request<OrganizationMember>('/organization-members', { method: 'POST', body: data })
  },
  get(memberId: number) {
    return request<OrganizationMember>(`/organization-members/member/${memberId}`)
  },
  remove(memberId: number) {
    return request<{ msg: string }>(`/organization-members/member/${memberId}`, { method: 'DELETE' })
  },
  update(memberId: number, data: { department_id?: number | null }) {
    return request<OrganizationMember>(`/organization-members/member/${memberId}`, { method: 'PATCH', body: data })
  },
}
