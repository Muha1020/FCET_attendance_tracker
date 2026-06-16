import api from './axios'
import type { AcademicSession, Semester } from '../types'

export const getSessions = () =>
  api.get<AcademicSession[]>('/sessions/').then((r) => r.data)

export const getSemesters = () =>
  api.get<Semester[]>('/semesters/').then((r) => r.data)
