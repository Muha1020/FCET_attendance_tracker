import api from './axios'
import type { AcademicSession, Semester } from '../types'

export const getSessions = () =>
  api.get<AcademicSession[]>('/api/sessions/').then((r) => r.data)

export const getSemesters = () =>
  api.get<Semester[]>('/api/semesters/').then((r) => r.data)
