import { request } from './client'
import type { Person, PersonCreate, SignedUrl } from '@/types'

export const peopleApi = {
  list(caseId: number) {
    return request<Person[]>(`/persons/case/${caseId}`)
  },
  get(personId: number) {
    return request<Person>(`/persons/${personId}`)
  },
  create(caseId: number, data: PersonCreate) {
    return request<Person>(`/persons/case/${caseId}`, { method: 'POST', body: data })
  },
  update(personId: number, data: Partial<PersonCreate>) {
    return request<Person>(`/persons/${personId}`, { method: 'PATCH', body: data })
  },
  remove(personId: number) {
    return request<{ msg: string }>(`/persons/${personId}`, { method: 'DELETE' })
  },
  uploadPhoto(personId: number, file: File) {
    const formData = new FormData()
    formData.append('photo', file)
    return request<Person>(`/persons/${personId}/photo`, { method: 'POST', formData })
  },
  /** Signed Supabase URL (1h validity) for the person's stored photo. */
  photoUrl(personId: number) {
    return request<SignedUrl>(`/persons/${personId}/photo/url`)
  },
}
