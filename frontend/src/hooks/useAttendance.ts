import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAttendanceSessions,
  getAttendanceSession,
  createAttendanceSession,
  getSessionPin,
  markAttendance,
  getAttendanceRecords,
  closeAttendanceSession,
  getStudentAttendanceHistory,
} from '../api/attendance'
import type { CreateAttendanceSessionRequest, MarkAttendanceRequest } from '../types'

export const useAttendanceSessions = () =>
  useQuery({ queryKey: ['attendance-sessions'], queryFn: getAttendanceSessions })

export const useAttendanceSession = (id: number) =>
  useQuery({
    queryKey: ['attendance-sessions', id],
    queryFn: () => getAttendanceSession(id),
    enabled: !!id,
  })

export const useSessionPin = (sessionId: number, enabled = true) =>
  useQuery({
    queryKey: ['session-pin', sessionId],
    queryFn: () => getSessionPin(sessionId),
    enabled: !!sessionId && enabled,
    // Refetch every 55 minutes — the PIN is valid for 60 min, so we refresh slightly before expiry
    refetchInterval: 55 * 60 * 1000,
    staleTime: 0,
  })

export const useAttendanceRecords = (sessionId: number) =>
  useQuery({
    queryKey: ['attendance-records', sessionId],
    queryFn: () => getAttendanceRecords(sessionId),
    enabled: !!sessionId,
    refetchInterval: 15000, // live-ish updates every 15s
  })

export const useCreateAttendanceSession = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAttendanceSessionRequest) => createAttendanceSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance-sessions'] }),
  })
}

export const useMarkAttendance = (sessionId: number) =>
  useMutation({
    mutationFn: (data: MarkAttendanceRequest) => markAttendance(sessionId, data),
  })

export const useCloseSession = (sessionId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => closeAttendanceSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-sessions', sessionId] })
      qc.invalidateQueries({ queryKey: ['attendance-sessions'] })
    },
  })
}

export const useStudentAttendanceHistory = () =>
  useQuery({
    queryKey: ['student-attendance-history'],
    queryFn: getStudentAttendanceHistory,
  })
