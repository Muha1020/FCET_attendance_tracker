import api from './axios'
import type {
  Course,
  CreateCourseRequest,
  StudentProfile,
  AssignRepRequest,
} from '../types'

export const getCourses = () =>
  api.get<Course[]>('/api/courses/').then((r) => r.data)

export const getCourse = (id: number) =>
  api.get<Course>(`/api/courses/${id}/`).then((r) => r.data)

export const createCourse = (data: CreateCourseRequest) =>
  api.post<Course>('/api/courses/', data).then((r) => r.data)

export const getCourseStudents = (courseId: number) =>
  api.get<StudentProfile[]>(`/api/courses/${courseId}/students/`).then((r) => r.data)

export const assignClassRep = (courseId: number, data: AssignRepRequest) =>
  api.post<{ detail: string }>(`/api/courses/${courseId}/assign-rep/`, data).then((r) => r.data)
