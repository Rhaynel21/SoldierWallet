// SALUDO app logo (transparent PNG). Served from /public/logo.png.
// `white` renders it as a white silhouette for use on blue backgrounds.
export default function Logo({ size = 80, white = false }) {
  return (
    <img
      src="/logo.png"
      alt="SALUDO"
      width={size}
      height={size}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        filter: white ? 'brightness(0) invert(1)' : 'none',
      }}
    />
  )
}
