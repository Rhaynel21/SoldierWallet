// Shield + S emblem only (no blue tile), white on transparent — for blue screens.
export default function LogoMark({ size = 44 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="SALUDO"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 12 L84 24 V50 C84 73 69 86 50 94 C31 86 16 73 16 50 V24 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fontFamily="'Segoe UI', system-ui, sans-serif"
        fontSize="54"
        fontWeight="900"
        fill="#ffffff"
      >
        S
      </text>
      <text x="70" y="82" textAnchor="middle" fontSize="18" fill="#f5b301">
        ★
      </text>
    </svg>
  )
}
