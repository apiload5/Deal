const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export async function apiClient(endpoint: string, options?: RequestInit) {
  const url = `${BASE_URL}/api${endpoint}`
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    cache: 'no-store'
  })
  
  if (!res.ok) throw new Error('API Error')
  return res.json()
}

export const getProperties = (params?: string) => 
  apiClient(`/properties${params ? `?${params}` : ''}`)

export const getProperty = (id: string) => 
  apiClient(`/properties/${id}`)
