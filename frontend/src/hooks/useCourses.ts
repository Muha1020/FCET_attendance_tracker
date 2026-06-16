import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCourses,
  getCourse,
  createCourse,
  getCourseStudents,
  assignClassRep,
} from '../api/courses'
import type { CreateCourseRequest, AssignRepRequest } from '../types'

export const useCourses = () =>
  useQuery({ queryKey: ['courses'], queryFn: getCourses })

export const useCourse = (id: number) =>
  useQuery({ queryKey: ['courses', id], queryFn: () => getCourse(id), enabled: !!id })

export const useCourseStudents = (courseId: number) =>
  useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => getCourseStudents(courseId),
    enabled: !!courseId,
  })

export const useCreateCourse = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourseRequest) => createCourse(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export const useAssignClassRep = (courseId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignRepRequest) => assignClassRep(courseId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-students', courseId] }),
  })
}
