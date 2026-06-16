import { useQuery } from '@tanstack/react-query'
import { getStudentMe, getLecturerMe } from '../api/students'
import { useAuthStore } from '../store/auth'

export const useStudentProfile = () => {
  const role = useAuthStore((s) => s.user?.role)
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: getStudentMe,
    enabled: role === 'student',
  })
}

export const useLecturerProfile = () => {
  const role = useAuthStore((s) => s.user?.role)
  return useQuery({
    queryKey: ['lecturer-profile'],
    queryFn: getLecturerMe,
    enabled: role === 'lecturer',
  })
}
