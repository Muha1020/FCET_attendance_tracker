import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAttendanceSession, useAttendanceRecords } from '../../hooks/useAttendance'
import PageLoader from '../../components/ui/PageLoader'
import { lecturerNav } from './nav'
import type { AttendanceRecord } from '../../types'

function RecordRow({ record }: { record: AttendanceRecord }) {
  return (
    <div
      className="flex items-center justify-between py-3.5 gap-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {record.student_name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {record.matric_number} · {new Date(record.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <div className="text-right shrink-0">
        {record.status === 'success' ? (
          <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>Present</span>
        ) : (
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--danger)' }}>Failed</span>
            {record.failure_reason && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {record.failure_reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AttendanceRecordsPage() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)

  const { data: session } = useAttendanceSession(sessionId)
  const { data: records, isLoading } = useAttendanceRecords(sessionId)

  const successful = records?.filter((r) => r.status === 'success') ?? []
  const failed = records?.filter((r) => r.status === 'failed') ?? []

  return (
    <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link to="/lecturer/courses" className="hover:text-white transition-colors">Courses</Link>
          <span>/</span>
          <Link
            to={`/lecturer/attendance/${sessionId}`}
            className="hover:text-white transition-colors"
          >
            Session
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>Records</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1
            className="font-display font-bold tracking-tight mb-1"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
          >
            {session?.course_code}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session?.date}</p>
        </div>

        {/* Stats strip */}
        <div
          className="flex items-center gap-8 mb-10 pb-10"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p className="font-display font-bold text-4xl leading-none" style={{ color: 'var(--success)' }}>
              {successful.length}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>present</p>
          </div>
          <div className="h-10 w-px shrink-0" style={{ background: 'var(--border)' }} />
          <div>
            <p
              className="font-display font-bold text-4xl leading-none"
              style={{ color: failed.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}
            >
              {failed.length}
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>failed</p>
          </div>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <div>
            {/* Present section */}
            <div className="mb-10">
              <p
                className="text-xs font-medium uppercase mb-5"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
              >
                Present — {successful.length}
              </p>
              {successful.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No records yet.</p>
              ) : (
                successful.map((r) => <RecordRow key={r.id} record={r} />)
              )}
            </div>

            {/* Failed section */}
            <div style={{ borderTop: '1px solid var(--border)' }} className="pt-10">
              <p
                className="text-xs font-medium uppercase mb-5"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
              >
                Failed attempts — {failed.length}
              </p>
              {failed.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No failed attempts.</p>
              ) : (
                failed.map((r) => <RecordRow key={r.id} record={r} />)
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
