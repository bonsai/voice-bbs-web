import type { CSSProperties, PointerEvent } from 'react'

type VoiceBubbleState = 'idle' | 'playing' | 'recording'

export function VoiceBubble({
  label,
  state = 'idle',
  onClick,
  onPointerDown,
}: {
  label: string
  state?: VoiceBubbleState
  onClick?: () => void
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void
}) {
  const style: CSSProperties = {
    width: 96,
    height: 96,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,.22)',
    background: state === 'playing' ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)',
    color: '#fff',
    boxShadow: state === 'playing' ? '0 0 36px rgba(255,255,255,.24)' : '0 10px 28px rgba(0,0,0,.28)',
    transform: state === 'playing' ? 'scale(1.08)' : state === 'recording' ? 'scale(1.04)' : 'scale(1)',
  }

  return (
    <button
      type="button"
      aria-label={label}
      style={style}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      {state === 'playing' ? '♪' : state === 'recording' ? '●' : '声'}
    </button>
  )
}
