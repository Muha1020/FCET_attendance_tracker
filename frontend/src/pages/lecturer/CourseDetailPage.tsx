import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useCourse, useCourseStudents, useAssignClassRep } from '../../hooks/useCourses'
import { useCreateAttendanceSession, useAttendanceSessions } from '../../hooks/useAttendance'
import PageLoader from '../../components/ui/PageLoader'
import Toast from '../../components/ui/Toast'
import { extractErrorMessage } from '../../utils/errors'
import { lecturerNav } from './nav'
import type { StudentProfile } from '../../types'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const navigate = useNavigate()

  const { data: course, isLoading: courseLoading } = useCourse(courseId)
  const { data: students, isLoading: studentsLoading } = useCourseStudents(courseId)
  const { data: allSessions } = useAttendanceSessions()
  const { mutateAsync: assignRep, isPending: assigningRep } = useAssignClassRep(courseId)
  const { mutateAsync: openSession, isPending: openingSession } = useCreateAttendanceSession()

  const courseSessions = allSessions?.filter((s) => s.course === courseId) ?? []

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [assigningId, setAssigningId] = useState<number | null>(null)

  async function handleAssignRep(student: StudentProfile) {
    setAssigningId(student.id)
    try {
      const res = await assignRep({ student_id: student.id })
      setToast({ msg: res.detail, type: 'success' })
    } catch (err) {
      setToast({ msg: extractErrorMessage(err, 'Failed to assign class rep.'), type: 'error' })
    } finally {
      setAssigningId(null)
    }
  }

  async function handleOpenSession() {
    try {
      const session = await openSession({ course: courseId })
      navigate(`/lecturer/attendance/${session.id}`)
    } catch (err) {
      setToast({ msg: extractErrorMessage(err, 'Failed to open session.'), type: 'error' })
    }
  }

  if (courseLoading) {
    return <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer"><PageLoader /></DashboardLayout>
  }

  if (!course) {
    return (
      <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
        <p style={{ color: 'var(--danger)' }}>Course not found.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 text-sm mb-6 sm:mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link to="/lecturer/courses" className="hover:text-white transition-colors">Courses</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{course.course_code}</span>
        </div>

        {/* Course header */}
        <div className="mb-6 sm:mb-10">
          <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
            {course.course_code}
          </span>
          <h1
            className="font-display font-bold tracking-tight mt-1 mb-2"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
          >
            {course.course_name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {course.session_name} · {course.semester_type} · Levels {course.target_levels.join(', ')} · {course.target_departments.join(', ')}
          </p>
          <div className="flex gap-3 mt-6">
            <button className="btn-primary text-sm" onClick={handleOpenSession} disabled={openingSession}>
              {openingSession ? 'Opening…' : 'Open session'}
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-8 mb-10">
          <p
            className="text-xs font-medium uppercase mb-5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
          >
            Sessions — {courseSessions.length}
          </p>
          {courseSessions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No sessions yet. Open one to start tracking attendance.
            </p>
          ) : (
            courseSessions
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3.5 gap-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {s.date}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: s.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {s.is_active ? 'Active' : 'Closed'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.is_active && (
                      <Link
                        to={`/lecturer/attendance/${s.id}`}
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        Manage
                      </Link>
                    )}
                    <Link
                      to={`/lecturer/records/${s.id}`}
                      className="btn-ghost text-xs py-1.5 px-3"
                    >
                      Records
                    </Link>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Student list */}
        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <p
              className="text-xs font-medium uppercase"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
            >
              Eligible students
            </p>
            {students && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {students.length}
              </span>
            )}
          </div>

          {studentsLoading ? (
            <PageLoader />
          ) : !students?.length ? (
            <div className="py-8">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                No matching students
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No students match this course's target level and department.
              </p>
            </div>
          ) : (
            <div>
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-3.5 gap-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {student.full_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {student.matric_number} · {student.department} · {student.level} Level
                    </p>
                  </div>
                  <button
                    className="btn-ghost text-xs py-1.5 px-3 shrink-0"
                    onClick={() => handleAssignRep(student)}
                    disabled={assigningId === student.id || assigningRep}
                  >
                    {assigningId === student.id ? 'Assigning…' : 'Set as rep'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
