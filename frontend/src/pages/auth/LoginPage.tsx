import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../../utils/validators'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { extractErrorMessage } from '../../utils/errors'
import Spinner from '../../components/ui/Spinner'

const FEATURES = [
  'Instant 6-digit PIN sessions',
  'Live attendance records',
  'Class rep delegation',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next')
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setServerError('')
    try {
      const data = await login(values)
      setUser({ role: data.role, full_name: data.full_name, access: data.access, refresh: data.refresh })
      const destination = nextUrl && nextUrl.startsWith('/') ? nextUrl : `/${data.role}`
      navigate(destination, { replace: true })
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Invalid identifier or password.'))
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
            Attendance management built for the Faculty of Computing.
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
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

        <div style={{ maxWidth: 380, width: '100%' }}>
          <div className="mb-8">
            <h2
              className="font-display font-bold tracking-tight mb-1.5"
              style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}
            >
              Sign in
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Enter your matric number or staff ID
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
              <label className="label">Identifier</label>
              <input
                {...register('identifier')}
                className={`input-base ${errors.identifier ? 'error' : ''}`}
                placeholder="e.g. 23/03CMP019 or LECT001"
                autoComplete="username"
                autoFocus
              />
              {errors.identifier && <p className="error-text">{errors.identifier.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`input-base ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
