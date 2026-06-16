import api from './axios'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types'

export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/api/auth/login/', data).then((r) => r.data)

export const register = (data: RegisterRequest) =>
  api.post<RegisterResponse>('/api/auth/register/', data).then((r) => r.data)
