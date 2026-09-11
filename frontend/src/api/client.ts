import { getToken } from '@/lib/token'

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface RequestOptions {
  method?: string
  body?: unknown
  formData?: FormData
  formUrlEncoded?: Record<string, string>
  /** suppress the global 401 redirect (used by login itself) */
  skipAuthRedirect?: boolean
}

function extractDetail(payload: unknown, status: number): string {
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>
    if (typeof p.detail === 'string') return p.detail
    if (Array.isArray(p.detail)) {
      // FastAPI validation errors
      const first = p.detail[0] as { msg?: string; loc?: unknown[] } | undefined
      if (first?.msg) {
        const loc = Array.isArray(first.loc) ? first.loc.filter((v) => typeof v === 'string').join('.') : ''
        return loc ? `${loc}: ${first.msg}` : first.msg
      }
    }
  }
  return `Request failed (${status})`
}

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, formUrlEncoded, skipAuthRedirect } = options

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (formUrlEncoded) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(formUrlEncoded).toString()
  } else if (formData) {
    payload = formData // browser sets multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(0, 'Network error — is the server reachable?')
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let data: unknown = undefined
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuthRedirect && onUnauthorized) {
      onUnauthorized()
    }
    throw new ApiError(response.status, extractDetail(data, response.status))
  }

  return data as T
}
