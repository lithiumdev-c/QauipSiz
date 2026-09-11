import { request } from './client'
import type { AdminUser } from '@/types'

export const usersApi = {
  /** Platform admin only. */
  list() {
    return request<AdminUser[]>('/users')
  },
}
