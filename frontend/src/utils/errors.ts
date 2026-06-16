import type { AxiosError } from 'axios'
import type { ApiError } from '../types'

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const axiosErr = err as AxiosError<ApiError>
  const data = axiosErr?.response?.data

  if (!data) return fallback

  if (typeof data.detail === 'string') return data.detail

  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0]

  // Collect first field-level error
  for (const value of Object.values(data)) {
    if (typeof value === 'string') return value
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  }

  return fallback
}
