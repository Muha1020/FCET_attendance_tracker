import api from './axios'
import type { StudentProfile, LecturerProfile } from '../types'

export const getStudentMe = () =>
  api.get<StudentProfile>('/api/students/me/').then((r) => r.data)

export const getLecturerMe = () =>
  api.get<LecturerProfile>('/api/lecturers/me/').then((r) => r.data)

export const getStudents = (params?: { level?: number; department?: string }) =>
  api.get<StudentProfile[]>('/api/students/', { params }).then((r) => r.data)
