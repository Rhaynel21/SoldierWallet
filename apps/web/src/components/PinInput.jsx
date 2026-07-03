import { useRef } from 'react'

// 4-digit PIN entry shown as 4 boxes, backed by a single numeric input.
export default function PinInput({ value, onChange, autoFocus }) {
  const ref = useRef(null)
  return (
    <div className="pin-input" onClick={() => ref.current?.focus()}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`pin-box${value.length === i ? ' active' : ''}${value[i] ? ' filled' : ''}`}
        >
          {value[i] ? '•' : ''}
        </div>
      ))}
      <input
        ref={ref}
        className="pin-hidden"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
      />
    </div>
  )
}
