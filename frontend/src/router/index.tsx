import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard, RoleGuard, GuestGuard } from './guards'
import { useAuthStore } from '../store/auth'

// Auth
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Lecturer
import LecturerDashboard from '../pages/lecturer/LecturerDashboard'
import CourseListPage from '../pages/lecturer/CourseListPage'
import CreateCoursePage from '../pages/lecturer/CreateCoursePage'
import CourseDetailPage from '../pages/lecturer/CourseDetailPage'
import AttendanceSessionPage from '../pages/lecturer/AttendanceSessionPage'
import AttendanceRecordsPage from '../pages/lecturer/AttendanceRecordsPage'

// Class Rep
import ClassRepDashboard from '../pages/classrep/ClassRepDashboard'
import ClassRepCoursesPage from '../pages/classrep/ClassRepCoursesPage'
import ClassRepSessionPage from '../pages/classrep/ClassRepSessionPage'

// Student
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentCoursesPage from '../pages/student/StudentCoursesPage'
import MarkAttendancePage from '../pages/student/MarkAttendancePage'
import AttendanceHistoryPage from '../pages/student/AttendanceHistoryPage'

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },

  // Guest-only routes
  {
    element: <GuestGuard />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Lecturer routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard role="lecturer" />,
        children: [
          { path: '/lecturer', element: <LecturerDashboard /> },
          { path: '/lecturer/courses', element: <CourseListPage /> },
          { path: '/lecturer/courses/new', element: <CreateCoursePage /> },
          { path: '/lecturer/courses/:id', element: <CourseDetailPage /> },
          { path: '/lecturer/attendance/:id', element: <AttendanceSessionPage /> },
          { path: '/lecturer/records/:id', element: <AttendanceRecordsPage /> },
        ],
      },

      // Student routes (includes class rep functionality)
      {
        element: <RoleGuard role="student" />,
        children: [
          { path: '/student', element: <StudentDashboard /> },
          { path: '/student/courses', element: <StudentCoursesPage /> },
          { path: '/student/mark/:id', element: <MarkAttendancePage /> },
          { path: '/student/history', element: <AttendanceHistoryPage /> },
          // Class rep routes under student role
          { path: '/classrep', element: <ClassRepDashboard /> },
          { path: '/classrep/courses', element: <ClassRepCoursesPage /> },
          { path: '/classrep/attendance/:id', element: <ClassRepSessionPage /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])
