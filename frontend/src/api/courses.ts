import api from './axios'
import type {
  Course,
  CreateCourseRequest,
  StudentProfile,
  AssignRepRequest,
} from '../types'

export const getCourses = () =>
  api.get<Course[]>('/courses/').then((r) => r.data)

export const getCourse = (id: number) =>
  api.get<Course>(`/courses/${id}/`).then((r) => r.data)

export const createCourse = (data: CreateCourseRequest) =>
  api.post<Course>('/courses/', data).then((r) => r.data)

export const getCourseStudents = (courseId: number) =>
  api.get<StudentProfile[]>(`/courses/${courseId}/students/`).then((r) => r.data)

export const assignClassRep = (courseId: number, data: AssignRepRequest) =>
  api.post<{ detail: string }>(`/courses/${courseId}/assign-rep/`, data).then((r) => r.data)
