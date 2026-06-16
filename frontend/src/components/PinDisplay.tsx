import { useEffect, useState } from 'react'

interface PinDisplayProps {
  pin: string
  expiresAt: string
}

export default function PinDisplay({ pin, expiresAt }: PinDisplayProps) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isExpiringSoon = secondsLeft < 120

  const digits = pin.split('')

  return (
    <div className="flex flex-col items-center gap-6">
      {/* PIN digits */}
      <div className="flex gap-3">
        {digits.map((d, i) => (
          <div
            key={i}
            className="w-14 h-16 rounded-lg flex items-center justify-center font-mono font-bold text-3xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '2px solid var(--accent)',
              color: 'var(--accent)',
              boxShadow: '0 0 20px var(--accent-dim)',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Countdown */}
      <div
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
        style={{
          background: isExpiringSoon ? 'var(--danger-dim)' : 'var(--accent-dim)',
          color: isExpiringSoon ? 'var(--danger)' : 'var(--accent)',
          border: `1px solid ${isExpiringSoon ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {secondsLeft === 0
          ? 'PIN expired — refreshing…'
          : `Expires in ${minutes}:${String(seconds).padStart(2, '0')}`}
      </div>
    </div>
  )
}
