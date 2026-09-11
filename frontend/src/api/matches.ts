import { request } from './client'
import type { Match, MatchStatusUpdate, SignedUrl } from '@/types'

export const matchesApi = {
  byVideo(videoId: number) {
    return request<Match[]>(`/matches/video/${videoId}`)
  },
  byOrganization(organizationId: number) {
    return request<Match[]>(`/matches/organization/${organizationId}`)
  },
  /** Org admins only — pending_review | confirmed | rejected. */
  updateStatus(matchId: number, data: MatchStatusUpdate) {
    return request<Match>(`/matches/${matchId}/status`, { method: 'PATCH', body: data })
  },
  /** Signed Supabase URL for the match frame image. */
  frameUrl(matchId: number) {
    return request<SignedUrl>(`/matches/${matchId}/frame/url`)
  },
}
