import { useQuery } from '@tanstack/react-query'
import { getSessions, getSemesters } from '../api/academics'

export const useAcademicSessions = () =>
  useQuery({ queryKey: ['sessions'], queryFn: getSessions })

export const useSemesters = () =>
  useQuery({ queryKey: ['semesters'], queryFn: getSemesters })
