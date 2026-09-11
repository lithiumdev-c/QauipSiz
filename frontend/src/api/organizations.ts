import { request } from './client'
import type { Organization } from '@/types'

export const organizationsApi = {
  list() {
    return request<Organization[]>('/organization')
  },
  get(orgId: number) {
    return request<Organization>(`/organization/${orgId}`)
  },
}
