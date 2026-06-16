import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAttendanceSession, useMarkAttendance } from '../../hooks/useAttendance'
import { markAttendanceSchema, type MarkAttendanceFormValues } from '../../utils/validators'
import { extractErrorMessage } from '../../utils/errors'
import PageLoader from '../../components/ui/PageLoader'
import Spinner from '../../components/ui/Spinner'
import { studentNav } from './nav'

export default function MarkAttendancePage() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const { data: session, isLoading: sessionLoading } = useAttendanceSession(sessionId)
  const { mutateAsync: markAttendance } = useMarkAttendance(sessionId)

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<MarkAttendanceFormValues>({ resolver: zodResolver(markAttendanceSchema) })

  async function onSubmit(values: MarkAttendanceFormValues) {
    try {
      const res = await markAttendance({ pin: values.pin })
      setResult({ success: true, message: res.detail })
      reset()
    } catch (err) {
      setResult({
        success: false,
        message: extractErrorMessage(err, 'Could not mark attendance.'),
      })
    }
  }

  return (
    <DashboardLayout navItems={studentNav} roleLabel="Student">
      <div className="max-w-sm mx-auto pt-8">
        {sessionLoading ? (
          <PageLoader />
        ) : (
          <>
            {/* Session context */}
            <div className="mb-10" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
              <p
                className="text-xs font-medium uppercase mb-3"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.14em' }}
              >
                Marking attendance for
              </p>
              <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                {session?.course_code}
              </span>
              <h1
                className="font-display font-bold tracking-tight mt-0.5 mb-1"
                style={{ fontSize: 'clamp(1.25rem, 2vw, 1.6rem)', color: 'var(--text-primary)' }}
              >
                {session?.course_name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {session?.date}
              </p>
            </div>

            {/* Session closed state */}
            {!session?.is_active ? (
              <div className="py-4">
                <p
                  className="font-display font-semibold text-xl mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Session closed
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  This attendance session is no longer accepting submissions.
                </p>
              </div>
            ) : result ? (
              /* Result state */
              <div className="py-4">
                <p
                  className="font-display font-bold tracking-tight mb-3"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                    color: result.success ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {result.success ? 'Marked.' : 'Failed.'}
                </p>
                <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                  {result.message}
                </p>
                {!result.success && (
                  <button className="btn-ghost" onClick={() => setResult(null)}>
                    Try again
                  </button>
                )}
              </div>
            ) : (
              /* PIN form */
              <form onSubmit={handleSubmit(onSubmit)}>
                <label className="label block mb-2">Enter PIN</label>
                <input
                  {...register('pin')}
                  className={`input-base text-center font-mono text-2xl tracking-[0.5em] mb-1 ${errors.pin ? 'error' : ''}`}
                  placeholder="······"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                />
                {errors.pin && (
                  <p className="error-text text-center">{errors.pin.message}</p>
                )}
                <p className="text-xs text-center mt-2 mb-6" style={{ color: 'var(--text-muted)' }}>
                  6-digit code from your lecturer or class rep
                </p>
                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : null}
                  {isSubmitting ? 'Submitting…' : 'Submit PIN'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
