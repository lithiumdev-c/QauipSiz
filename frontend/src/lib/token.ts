const TOKEN_KEY = 'qaupsiz.token'

let inMemoryToken: string | null = null

export function getToken(): string | null {
  if (inMemoryToken !== null) return inMemoryToken
  try {
    inMemoryToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    inMemoryToken = null
  }
  return inMemoryToken
}

export function setToken(token: string | null) {
  inMemoryToken = token
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* storage unavailable — in-memory only */
  }
}
