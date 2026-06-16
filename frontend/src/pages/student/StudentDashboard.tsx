import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useStudentProfile } from '../../hooks/useProfile'
import { useCourses } from '../../hooks/useCourses'
import PageLoader from '../../components/ui/PageLoader'
import { studentNav } from './nav'

export default function StudentDashboard() {
  const { data: profile, isLoading } = useStudentProfile()
  const { data: courses } = useCourses()

  const firstName = profile?.full_name?.split(' ')[0]

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNav} roleLabel="Student">
        <PageLoader />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} roleLabel="Student">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1
            className="font-display font-bold tracking-tight leading-tight mb-2"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--text-primary)' }}
          >
            Hello, {firstName}.
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {profile?.matric_number} · {profile?.department} · {profile?.level} Level
          </p>
        </div>

        {/* Course count */}
        <div className="mb-10 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-baseline gap-3">
            <span
              className="font-display font-bold leading-none"
              style={{ fontSize: '3.5rem', color: 'var(--text-primary)' }}
            >
              {courses?.length ?? 0}
            </span>
            <span className="text-base" style={{ color: 'var(--text-muted)' }}>
              enrolled courses
            </span>
          </div>
        </div>

        {/* Actions */}
        <div>
          <p
            className="text-xs font-medium uppercase mb-5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Go to
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/student/courses"
              className="flex items-center justify-between py-4 group"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                My courses
              </span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </Link>
            <Link
              to="/student/history"
              className="flex items-center justify-between py-4 group"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Attendance history
              </span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
