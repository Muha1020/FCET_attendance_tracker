import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { createCourseSchema, type CreateCourseFormValues } from '../../utils/validators'
import { useCreateCourse } from '../../hooks/useCourses'
import { extractErrorMessage } from '../../utils/errors'
import Spinner from '../../components/ui/Spinner'
import { lecturerNav } from './nav'

const LEVELS = [100, 200, 300, 400, 500]
const DEPARTMENTS = ['Computer Science', 'Cybersecurity', 'Software Engineering', 'Information Systems']

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const { mutateAsync: createCourse } = useCreateCourse()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<CreateCourseFormValues>({ resolver: zodResolver(createCourseSchema) })

  async function onSubmit(values: CreateCourseFormValues) {
    setServerError('')
    try {
      const course = await createCourse(values)
      navigate(`/lecturer/courses/${course.id}`)
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Failed to create course.'))
    }
  }

  return (
    <DashboardLayout navItems={lecturerNav} roleLabel="Lecturer">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link to="/lecturer/courses" className="hover:text-white transition-colors">Courses</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>New course</span>
        </div>

        <h1
          className="font-display font-bold tracking-tight mb-10"
          style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
        >
          New Course
        </h1>

        {serverError && (
          <p className="text-sm mb-6" style={{ color: 'var(--danger)' }}>{serverError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Course code</label>
              <input
                {...register('course_code')}
                className={`input-base ${errors.course_code ? 'error' : ''}`}
                placeholder="e.g. CST101"
              />
              {errors.course_code && <p className="error-text">{errors.course_code.message}</p>}
            </div>
            <div>
              <label className="label">Course name</label>
              <input
                {...register('course_name')}
                className={`input-base ${errors.course_name ? 'error' : ''}`}
                placeholder="e.g. Introduction to Computing"
              />
              {errors.course_name && <p className="error-text">{errors.course_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Academic session</label>
              <input
                {...register('session_name')}
                className={`input-base ${errors.session_name ? 'error' : ''}`}
                placeholder="e.g. 2026/2027"
              />
              {errors.session_name && <p className="error-text">{errors.session_name.message}</p>}
            </div>
            <div>
              <label className="label">Semester</label>
              <select
                {...register('semester_type')}
                className={`input-base ${errors.semester_type ? 'error' : ''}`}
              >
                <option value="">Select semester</option>
                <option value="Harmattan">Harmattan</option>
                <option value="Rain">Rain</option>
              </select>
              {errors.semester_type && <p className="error-text">{errors.semester_type.message}</p>}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <label className="label mb-2 block">Target levels</label>
            <Controller
              name="target_levels"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => {
                    const checked = field.value?.includes(l)
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? field.value.filter((v: number) => v !== l)
                            : [...(field.value ?? []), l]
                          field.onChange(next)
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: checked ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                          color: checked ? 'var(--accent)' : 'var(--text-secondary)',
                          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        {l}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.target_levels && <p className="error-text mt-2">{errors.target_levels.message}</p>}
          </div>

          <div>
            <label className="label mb-2 block">Target departments</label>
            <Controller
              name="target_departments"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((d) => {
                    const checked = field.value?.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? field.value.filter((v: string) => v !== d)
                            : [...(field.value ?? []), d]
                          field.onChange(next)
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: checked ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                          color: checked ? 'var(--accent)' : 'var(--text-secondary)',
                          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.target_departments && <p className="error-text mt-2">{errors.target_departments.message}</p>}
          </div>

          <div
            className="flex gap-3 pt-2"
            style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}
          >
            <Link to="/lecturer/courses" className="btn-ghost flex-1 justify-center">
              Cancel
            </Link>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : null}
              {isSubmitting ? 'Creating…' : 'Create course'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
