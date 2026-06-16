import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAttendanceSession, useSessionPin, useCloseSession } from '../../hooks/useAttendance'
import PinDisplay from '../../components/PinDisplay'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageLoader from '../../components/ui/PageLoader'
import Toast from '../../components/ui/Toast'
import { extractErrorMessage } from '../../utils/errors'
import { lecturerNav } from './nav'

export default function AttendanceSessionPage() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)

  const { data: session, isLoading } = useAttendanceSession(sessionId)
  const { data: pinData, isLoading: pinLoading } = useSessionPin(sessionId, session?.is_active ?? false)
  const { mutateAsync: closeSession, isPending: closing } = useCloseSession(sessionId)

  const [confirmClose, setConfirmClose] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/student/mark/${sessionId}`)
      setToast({ msg: 'Student attendance link copied', type: 'success' })
    } catch {
      setToast({ msg: 'Could not copy link', type: 'error' })
    }
  }

  async function handleClose() {
    try {
      const res = await closeSession()
      setToast({ msg: res.detail, type: 'success' })
    } catch (err) {
      setToast({ msg: extractErrorMessage(err, 'Failed to close session.'), type: 'error' })
    } finally {
      setConfirmClose(false)
    }
  }

  if (isLoading) {
    return <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer"><PageLoader /></DashboardLayout>
  }

  return (
    <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={confirmClose}
        title="Close attendance session?"
        description="Students will no longer be able to mark their attendance after the session is closed."
        confirmLabel="Close session"
        danger
        loading={closing}
        onConfirm={handleClose}
        onCancel={() => setConfirmClose(false)}
      />

      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link to="/lecturer/courses" className="hover:text-white transition-colors">Courses</Link>
          <span>/</span>
          <Link
            to={`/lecturer/courses/${session?.course}`}
            className="hover:text-white transition-colors"
          >
            {session?.course_code}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>Session</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1
              className="font-display font-bold tracking-tight mb-1"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
            >
              {session?.course_code}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{session?.date}</p>
          </div>
          {session?.is_active ? (
            <span className="text-xs font-medium pt-1" style={{ color: 'var(--success)' }}>Active</span>
          ) : (
            <span className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>Closed</span>
          )}
        </div>

        {/* PIN area */}
        <div
          className="py-10 text-center mb-8"
          style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        >
          {!session?.is_active ? (
            <div>
              <p
                className="font-display font-semibold text-xl mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Session closed
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Attendance is no longer being recorded.
              </p>
            </div>
          ) : pinLoading ? (
            <div className="flex justify-center py-4">
              <PageLoader />
            </div>
          ) : pinData ? (
            <>
              <p
                className="text-xs font-medium uppercase mb-8"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
              >
                Attendance PIN
              </p>
              <PinDisplay pin={pinData.pin} expiresAt={pinData.expires_at} />
              <p className="text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
                Refreshes automatically every 60 minutes
              </p>
            </>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to={`/lecturer/records/${sessionId}`} className="btn-ghost flex-1 justify-center">
            View records
          </Link>
          {session?.is_active && (
            <button className="btn-ghost flex-1" onClick={handleCopyLink}>
              Copy student link
            </button>
          )}
          {session?.is_active && (
            <button className="btn-danger flex-1" onClick={() => setConfirmClose(true)}>
              Close session
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
