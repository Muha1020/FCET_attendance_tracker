import DashboardLayout from '../../components/layout/DashboardLayout'
import { useCourses } from '../../hooks/useCourses'
import PageLoader from '../../components/ui/PageLoader'
import { studentNav } from './nav'

export default function StudentCoursesPage() {
  const { data: courses, isLoading } = useCourses()

  return (
    <DashboardLayout navItems={studentNav} roleLabel="Student">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1
            className="font-display font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
          >
            My Courses
          </h1>
          {courses && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} this semester
            </p>
          )}
        </div>

        {isLoading ? (
          <PageLoader />
        ) : !courses?.length ? (
          <div className="py-12">
            <p className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              No courses found
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No courses match your current level and department.
            </p>
          </div>
        ) : (
          <div>
            {courses.map((course) => (
              <div
                key={course.id}
                className="py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                    {course.course_code}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {course.semester_type}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {course.course_name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {course.lecturer_name} · {course.session_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
