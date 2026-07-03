import { useEffect, useRef, useState } from 'react'

export default function Dropdown({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="dd" ref={ref}>
      <button
        type="button"
        className={open ? 'dd-btn open' : 'dd-btn'}
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <span className="dd-caret">▾</span>
      </button>
      {open && (
        <div className="dd-menu" role="listbox">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={opt === value ? 'dd-opt active' : 'dd-opt'}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
            >
              <span>{opt}</span>
              {opt === value && <span className="dd-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
