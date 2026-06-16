import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useLecturerProfile } from '../../hooks/useProfile'
import { useCourses } from '../../hooks/useCourses'
import { useAttendanceSessions } from '../../hooks/useAttendance'
import PageLoader from '../../components/ui/PageLoader'
import { lecturerNav } from './nav'

export default function LecturerDashboard() {
  const { data: profile, isLoading } = useLecturerProfile()
  const { data: courses } = useCourses()
  const { data: sessions } = useAttendanceSessions()

  const activeSessions = sessions?.filter((s) => s.is_active) ?? []
  const firstName = profile?.full_name?.split(' ')[0]

  if (isLoading) {
    return (
      <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
        <PageLoader />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1
              className="font-display font-bold tracking-tight leading-tight mb-1"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--text-primary)' }}
            >
              Good day, {firstName}.
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {profile?.staff_id}
            </p>
          </div>
          <Link to="/lecturer/courses/new" className="btn-primary shrink-0 text-sm">
            New course
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="flex items-center gap-8 mb-10 pb-10"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p className="font-display font-bold text-4xl leading-none" style={{ color: 'var(--text-primary)' }}>
              {courses?.length ?? 0}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>courses</p>
          </div>

          <div className="h-10 w-px shrink-0" style={{ background: 'var(--border)' }} />

          <div>
            <p
              className="font-display font-bold text-4xl leading-none"
              style={{ color: activeSessions.length > 0 ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              {activeSessions.length}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>active</p>
          </div>

          <div className="h-10 w-px shrink-0" style={{ background: 'var(--border)' }} />

          <div>
            <p className="font-display font-bold text-4xl leading-none" style={{ color: 'var(--text-primary)' }}>
              {sessions?.length ?? 0}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>total sessions</p>
          </div>
        </div>

        {/* Active sessions */}
        <div className="mb-10">
          <p
            className="text-xs font-medium uppercase mb-5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Active now
          </p>

          {activeSessions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No active sessions. Open a session from a course page to start tracking.
            </p>
          ) : (
            <div>
              {activeSessions.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-4 gap-4"
                  style={{
                    borderBottom: i < activeSessions.length - 1 ? '1px solid var(--border)' : undefined,
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {s.course_code}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {s.date}
                    </p>
                  </div>
                  <Link
                    to={`/lecturer/attendance/${s.id}`}
                    className="btn-ghost text-sm py-1.5 px-4 shrink-0"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <Link
          to="/lecturer/courses"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          View all courses
        </Link>

      </div>
    </DashboardLayout>
  )
}
