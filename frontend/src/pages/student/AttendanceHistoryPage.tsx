import DashboardLayout from '../../components/layout/DashboardLayout'
import { useStudentAttendanceHistory } from '../../hooks/useAttendance'
import PageLoader from '../../components/ui/PageLoader'
import { studentNav } from './nav'
import type { StudentHistoryRecord } from '../../types'

function HistoryRow({ record }: { record: StudentHistoryRecord }) {
  return (
    <div
      className="flex items-center justify-between py-4 gap-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <div className="flex items-center gap-3 mb-0.5">
          <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
            {record.course_code}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {record.session_date}
          </span>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {record.course_name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {record.status === 'failed' && record.failure_reason ? ` · ${record.failure_reason}` : ''}
        </p>
      </div>
      <span
        className="text-xs font-medium shrink-0"
        style={{ color: record.status === 'success' ? 'var(--success)' : 'var(--danger)' }}
      >
        {record.status === 'success' ? 'Present' : 'Failed'}
      </span>
    </div>
  )
}

export default function AttendanceHistoryPage() {
  const { data: records, isLoading } = useStudentAttendanceHistory()

  const present = records?.filter((r) => r.status === 'success') ?? []
  const failed = records?.filter((r) => r.status === 'failed') ?? []

  return (
    <DashboardLayout navItems={studentNav} roleLabel="Student">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1
            className="font-display font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
          >
            Attendance History
          </h1>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : !records?.length ? (
          <div style={{ borderTop: '1px solid var(--border)' }} className="pt-10">
            <p className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              No records yet
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Your attendance records will appear here after you mark attendance for a session.
            </p>
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div
              className="flex items-center gap-8 mb-10 pb-10"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <p
                  className="font-display font-bold text-4xl leading-none"
                  style={{ color: 'var(--success)' }}
                >
                  {present.length}
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
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>missed</p>
              </div>
              <div className="h-10 w-px shrink-0" style={{ background: 'var(--border)' }} />
              <div>
                <p
                  className="font-display font-bold text-4xl leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {records.length > 0
                    ? Math.round((present.length / records.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>rate</p>
              </div>
            </div>

            {/* All records */}
            <div>
              <p
                className="text-xs font-medium uppercase mb-5"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
              >
                All sessions — {records.length}
              </p>
              {records.map((r) => (
                <HistoryRow key={r.id} record={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
