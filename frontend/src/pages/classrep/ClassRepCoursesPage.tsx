import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAttendanceSessions, useCreateAttendanceSession } from '../../hooks/useAttendance'
import PageLoader from '../../components/ui/PageLoader'
import Toast from '../../components/ui/Toast'
import { extractErrorMessage } from '../../utils/errors'
import { classRepNav } from './nav'
import { useCourses } from '../../hooks/useCourses'

export default function ClassRepCoursesPage() {
  const { data: courses, isLoading } = useCourses()
  const { data: sessions } = useAttendanceSessions()
  const { mutateAsync: openSession, isPending } = useCreateAttendanceSession()
  const navigate = useNavigate()
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [openingId, setOpeningId] = useState<number | null>(null)

  const sessionByCourse = Object.fromEntries(
    (sessions ?? []).filter((s) => s.is_active).map((s) => [s.course, s])
  )

  async function handleOpen(courseId: number) {
    setOpeningId(courseId)
    try {
      const s = await openSession({ course: courseId })
      navigate(`/classrep/attendance/${s.id}`)
    } catch (err) {
      setToast({ msg: extractErrorMessage(err, 'Could not open session.'), type: 'error' })
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <DashboardLayout navItems={classRepNav} roleLabel="Class Rep">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1
            className="font-display font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
          >
            Rep Courses
          </h1>
          {courses && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {courses.length} assigned {courses.length === 1 ? 'course' : 'courses'}
            </p>
          )}
        </div>

        {isLoading ? (
          <PageLoader />
        ) : !courses?.length ? (
          <div className="py-12">
            <p className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              No courses assigned
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              You are not assigned as class rep for any course yet.
            </p>
          </div>
        ) : (
          <div>
            {courses.map((course) => {
              const active = sessionByCourse[course.id]
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between py-4 gap-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="font-mono text-xs shrink-0" style={{ color: 'var(--accent)' }}>
                        {course.course_code}
                      </span>
                      {active && (
                        <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {course.course_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {course.session_name} · {course.semester_type}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {active ? (
                      <Link
                        to={`/classrep/attendance/${active.id}`}
                        className="btn-primary text-sm py-1.5 px-4"
                      >
                        Manage
                      </Link>
                    ) : (
                      <button
                        className="btn-ghost text-sm py-1.5 px-4"
                        onClick={() => handleOpen(course.id)}
                        disabled={openingId === course.id || isPending}
                      >
                        {openingId === course.id ? 'Opening…' : 'Open'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
