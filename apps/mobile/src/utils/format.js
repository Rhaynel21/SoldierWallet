// Currency + date formatting without relying on Intl (safer across RN engines).

export function peso(amount) {
  const n = Number(amount ?? 0)
  const neg = n < 0
  const fixed = Math.abs(n).toFixed(2)
  const [whole, frac] = fixed.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${neg ? '-' : ''}₱${grouped}.${frac}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function shortDate(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const month = MONTHS[d.getMonth()]
  const day = d.getDate()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${month} ${day}, ${h}:${m} ${ampm}`
}
