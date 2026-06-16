import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '../../utils/validators'
import { register as registerUser } from '../../api/auth'
import { extractErrorMessage } from '../../utils/errors'
import Spinner from '../../components/ui/Spinner'

const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Z]+\d{3}$/
const DEPARTMENTS = ['Computer Science', 'Cybersecurity', 'Software Engineering', 'Information Systems']
const LEVELS = [100, 200, 300, 400, 500]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const watchedIdentifier = watch('identifier', '')
  const showStudentFields = MATRIC_REGEX.test(watchedIdentifier)

  async function onSubmit(values: RegisterFormValues) {
    setServerError('')
    try {
      await registerUser({
        full_name: values.full_name,
        identifier: values.identifier,
        password: values.password,
        ...(showStudentFields && { level: values.level, department: values.department }),
      })
      navigate('/login')
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Registration failed. Please try again.'))
    }
  }

  return (
    <div className="flex min-h-[100dvh]">

      {/* ── Left: brand panel ── */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          alignSelf: 'flex-start',
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.13) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        {/* Amber corner glow */}
        <div
          className="absolute -bottom-32 -left-24 w-[30rem] h-[30rem] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.11), transparent 70%)' }}
        />

        <div className="relative">
          <span
            className="text-[11px] font-medium uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.18em' }}
          >
            FCET · Al-Hikmah University
          </span>
        </div>

        <div className="relative">
          <h1
            className="font-display font-bold leading-[0.88] tracking-tight mb-6"
            style={{ fontSize: 'clamp(3.5rem, 5vw, 5.5rem)', color: 'var(--text-primary)' }}
          >
            Atten
            <br />
            <span style={{ color: 'var(--accent)' }}>tra.</span>
          </h1>
          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: 'var(--text-secondary)', maxWidth: '22rem' }}
          >
            Role is auto-detected from your matric number or staff ID — no manual selection needed.
          </p>
          <div className="space-y-3">
            {[
              'Students: use your matric number',
              'Lecturers: use your staff ID',
              'Class rep roles are assigned by lecturers',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <span
                  className="flex-shrink-0 rounded-full"
                  style={{ width: 5, height: 5, background: 'var(--accent)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Attentra v1.0 — {new Date().getFullYear()}
          </span>
        </div>
      </aside>

      {/* ── Right: form ── */}
      <main
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-14"
        style={{ background: 'var(--bg-base)' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <p
            className="text-[11px] font-medium uppercase mb-3"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.18em' }}
          >
            FCET · Al-Hikmah University
          </p>
          <h1
            className="font-display font-bold text-3xl tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Atten<span style={{ color: 'var(--accent)' }}>tra</span>
          </h1>
        </div>

        <div style={{ maxWidth: 400, width: '100%' }}>
          <div className="mb-8">
            <h2
              className="font-display font-bold tracking-tight mb-1.5"
              style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}
            >
              Create account
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Your role is detected from your identifier
            </p>
          </div>

          {serverError && (
            <div
              className="rounded-lg px-4 py-3 text-sm mb-5"
              style={{
                background: 'var(--danger-dim)',
                color: 'var(--danger)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                {...register('full_name')}
                className={`input-base ${errors.full_name ? 'error' : ''}`}
                placeholder="e.g. Ameen Balogun"
                autoFocus
              />
              {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="label">Matric number or Staff ID</label>
              <input
                {...register('identifier')}
                className={`input-base ${errors.identifier ? 'error' : ''}`}
                placeholder="e.g. 23/03CMP019 or LECT001"
                autoComplete="username"
              />
              {errors.identifier && <p className="error-text">{errors.identifier.message}</p>}
              {watchedIdentifier && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Detected role:{' '}
                  <span style={{ color: 'var(--accent)' }}>
                    {showStudentFields ? 'Student' : 'Lecturer'}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`input-base ${errors.password ? 'error' : ''}`}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            {showStudentFields && (
              <>
                <div
                  className="rounded-lg p-4 space-y-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                    Student details
                  </p>
                  <div>
                    <label className="label">Level</label>
                    <select
                      {...register('level', { valueAsNumber: true })}
                      className={`input-base ${errors.level ? 'error' : ''}`}
                    >
                      <option value="">Select level</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l} Level</option>
                      ))}
                    </select>
                    {errors.level && <p className="error-text">{errors.level.message}</p>}
                  </div>

                  <div>
                    <label className="label">Department</label>
                    <select
                      {...register('department')}
                      className={`input-base ${errors.department ? 'error' : ''}`}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.department && <p className="error-text">{errors.department.message}</p>}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
