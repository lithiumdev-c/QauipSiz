import { request } from './client'
import type { Detection, SignedUrl, Video } from '@/types'

export const videosApi = {
  list(caseId: number) {
    return request<Video[]>(`/videos/case/${caseId}`)
  },
  get(videoId: number) {
    return request<Video>(`/videos/${videoId}`)
  },
  upload(caseId: number, file: File) {
    const formData = new FormData()
    formData.append('video', file)
    return request<Video>(`/videos/case/${caseId}`, { method: 'POST', formData })
  },
  remove(videoId: number) {
    return request<{ msg: string }>(`/videos/${videoId}`, { method: 'DELETE' })
  },
  url(videoId: number) {
    return request<SignedUrl>(`/videos/${videoId}/url`)
  },
  /** Synchronous processing run — long request; poll GET /videos/{id} for status. */
  process(videoId: number) {
    return request<Record<string, unknown>>(`/videos/${videoId}/process`, { method: 'POST' })
  },
}

export const detectionsApi = {
  list(videoId: number) {
    return request<Detection[]>(`/detections/video/${videoId}`)
  },
}
