// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  identifier: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  role: 'student' | 'lecturer'
  full_name: string
}

export interface RegisterRequest {
  full_name: string
  identifier: string
  password: string
  level?: number
  department?: string
}

export interface RegisterResponse {
  message: string
  role: string
}

export interface TokenRefreshResponse {
  access: string
}

// ─── Auth store user ─────────────────────────────────────────────────────────

export interface AuthUser {
  role: 'student' | 'lecturer'
  full_name: string
  access: string
  refresh: string
}

// ─── User profiles ───────────────────────────────────────────────────────────

export interface StudentProfile {
  id: number
  full_name: string
  role: string
  matric_number: string
  level: 100 | 200 | 300 | 400 | 500
  department: string
}

export interface LecturerProfile {
  id: number
  full_name: string
  role: string
  staff_id: string
}

// ─── Academics ───────────────────────────────────────────────────────────────

export interface AcademicSession {
  id: number
  session_name: string
  start_year: number
  end_year: number
  is_active: boolean
}

export interface Semester {
  id: number
  academic_session: number
  academic_session_name: string
  semester_type: 'Harmattan' | 'Rain'
  is_active: boolean
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface Course {
  id: number
  course_code: string
  course_name: string
  lecturer: number
  lecturer_name: string
  academic_session: number
  session_name: string
  semester: number
  semester_type: string
  target_levels: number[]
  target_departments: string[]
}

export interface CreateCourseRequest {
  course_code: string
  course_name: string
  session_name: string
  semester_type: 'Harmattan' | 'Rain'
  target_levels: number[]
  target_departments: string[]
}

export interface AssignRepRequest {
  student_id: number
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceSession {
  id: number
  course: number
  course_code: string
  course_name: string
  date: string
  is_active: boolean
  created_by: number
  created_by_name: string
}

export interface CreateAttendanceSessionRequest {
  course: number
  date?: string
}

export interface PinResponse {
  pin: string
  expires_at: string
}

export interface AttendanceRecord {
  id: number
  attendance_session: number
  student: number
  matric_number: string
  student_name: string
  timestamp: string
  status: 'success' | 'failed'
  failure_reason: string | null
}

export interface MarkAttendanceRequest {
  pin: string
}

export interface StudentHistoryRecord {
  id: number
  course_code: string
  course_name: string
  session_date: string
  timestamp: string
  status: 'success' | 'failed'
  failure_reason: string | null
}

// ─── API error shape ─────────────────────────────────────────────────────────

export interface ApiError {
  detail?: string
  non_field_errors?: string[]
  [key: string]: unknown
}
