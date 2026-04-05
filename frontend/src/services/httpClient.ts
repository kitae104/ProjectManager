import axios from 'axios'

type PersistedAuthState = {
  state?: {
    accessToken?: string | null
  }
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const persisted = localStorage.getItem('pm-auth-storage')
  if (!persisted) {
    return config
  }

  try {
    const parsed = JSON.parse(persisted) as PersistedAuthState
    const token = parsed.state?.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Ignore invalid localStorage payload.
  }

  return config
})
