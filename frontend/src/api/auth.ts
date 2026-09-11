import { request } from './client'
import type { LoginResponse, Me, User } from '@/types'

export const authApi = {
  register(data: { username: string; email: string; password: string }) {
    return request<User>('/auth/register', { method: 'POST', body: data })
  },

  /** Backend expects OAuth2 form-urlencoded (username, not email). */
  login(username: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      formUrlEncoded: { username, password },
      skipAuthRedirect: true,
    })
  },

  me() {
    return request<Me>('/auth/me')
  },
}
