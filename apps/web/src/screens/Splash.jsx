import saludoLogo from '../assets/saludoLogo.js'

export default function Splash() {
  return (
    <div className="splash">
      <div className="splash-logo">
        <img
          src={saludoLogo}
          alt="SALUDO"
          width={140}
          height={140}
          className="splash-logo-img"
        />
      </div>
      <h1 className="splash-title">SALUDO</h1>
      <p className="splash-tagline">Built for those who serve.</p>
      <div className="splash-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
