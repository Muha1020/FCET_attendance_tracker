import api from './axios'
import type {
  AttendanceSession,
  CreateAttendanceSessionRequest,
  PinResponse,
  AttendanceRecord,
  MarkAttendanceRequest,
  StudentHistoryRecord,
} from '../types'

export const getAttendanceSessions = () =>
  api.get<AttendanceSession[]>('/api/attendance/sessions/').then((r) => r.data)

export const getAttendanceSession = (id: number) =>
  api.get<AttendanceSession>(`/api/attendance/sessions/${id}/`).then((r) => r.data)

export const createAttendanceSession = (data: CreateAttendanceSessionRequest) =>
  api.post<AttendanceSession>('/api/attendance/sessions/', data).then((r) => r.data)

export const getSessionPin = (sessionId: number) =>
  api.get<PinResponse>(`/api/attendance/sessions/${sessionId}/pin/`).then((r) => r.data)

export const markAttendance = (sessionId: number, data: MarkAttendanceRequest) =>
  api
    .post<{ detail: string }>(`/api/attendance/sessions/${sessionId}/mark/`, data)
    .then((r) => r.data)

export const getAttendanceRecords = (sessionId: number) =>
  api
    .get<AttendanceRecord[]>(`/api/attendance/sessions/${sessionId}/records/`)
    .then((r) => r.data)

export const closeAttendanceSession = (sessionId: number) =>
  api
    .patch<{ detail: string }>(`/api/attendance/sessions/${sessionId}/close/`)
    .then((r) => r.data)

export const getStudentAttendanceHistory = () =>
  api.get<StudentHistoryRecord[]>('/api/attendance/my-records/').then((r) => r.data)
