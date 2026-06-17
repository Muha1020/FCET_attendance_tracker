import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAttendanceSession, useSessionPin, useCloseSession, useAttendanceRecords } from '../../hooks/useAttendance'
import PinDisplay from '../../components/PinDisplay'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageLoader from '../../components/ui/PageLoader'
import Toast from '../../components/ui/Toast'
import { extractErrorMessage } from '../../utils/errors'
import { classRepNav } from './nav'

export default function ClassRepSessionPage() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)

  const { data: session, isLoading } = useAttendanceSession(sessionId)
  const { data: pinData } = useSessionPin(sessionId, session?.is_active ?? false)
  const { data: records } = useAttendanceRecords(sessionId)
  const { mutateAsync: closeSession, isPending: closing } = useCloseSession(sessionId)

  const [confirmClose, setConfirmClose] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const present = records?.filter((r) => r.status === 'success') ?? []
  const failed = records?.filter((r) => r.status === 'failed') ?? []

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
    return <DashboardLayout navItems={classRepNav} roleLabel="Class Rep"><PageLoader /></DashboardLayout>
  }

  return (
    <DashboardLayout navItems={classRepNav} roleLabel="Class Rep">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={confirmClose}
        title="Close attendance session?"
        description="Students will no longer be able to mark attendance once the session is closed."
        confirmLabel="Close session"
        danger
        loading={closing}
        onConfirm={handleClose}
        onCancel={() => setConfirmClose(false)}
      />

      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 text-sm mb-6 sm:mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link to="/classrep/courses" className="hover:text-white transition-colors">Rep Courses</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{session?.course_code}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-10">
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
          className="py-10 text-center"
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
          ) : pinData ? (
            <>
              <p
                className="text-xs font-medium uppercase mb-8"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
              >
                Attendance PIN
              </p>
              <PinDisplay pin={pinData.pin} expiresAt={pinData.expires_at} />
            </>
          ) : (
            <div className="flex justify-center py-4">
              <PageLoader />
            </div>
          )}
        </div>

        {/* Live counts */}
        <div className="flex items-center gap-5 sm:gap-8 py-6 sm:py-8" style={{ borderBottom: '1px solid var(--border)' }}>
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
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>failed attempts</p>
          </div>
        </div>

        {session?.is_active && (
          <div className="pt-6">
            <button className="btn-danger w-full" onClick={() => setConfirmClose(true)}>
              Close session
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
