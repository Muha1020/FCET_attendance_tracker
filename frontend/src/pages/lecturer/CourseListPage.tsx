import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useCourses } from '../../hooks/useCourses'
import PageLoader from '../../components/ui/PageLoader'
import { lecturerNav } from './nav'

export default function CourseListPage() {
  const { data: courses, isLoading } = useCourses()

  return (
    <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1
              className="font-display font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
            >
              My Courses
            </h1>
            {courses && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </p>
            )}
          </div>
          <Link to="/lecturer/courses/new" className="btn-primary shrink-0 text-sm">
            New course
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : !courses?.length ? (
          <div className="py-12">
            <p className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              No courses yet
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Create your first course to start tracking attendance.
            </p>
            <Link to="/lecturer/courses/new" className="btn-primary text-sm">
              Create course
            </Link>
          </div>
        ) : (
          <div>
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/lecturer/courses/${course.id}`}
                className="flex items-center justify-between py-4 gap-4 group"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="font-mono text-xs shrink-0" style={{ color: 'var(--accent)' }}>
                      {course.course_code}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {course.semester_type}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {course.course_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {course.session_name} · Levels {course.target_levels.join(', ')}
                  </p>
                </div>
                <span
                  className="shrink-0 text-base transition-transform group-hover:translate-x-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
