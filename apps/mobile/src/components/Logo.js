import { Image } from 'react-native'

const source = require('../../assets/saludo-logo.png')

// SALUDO brand logo. `white` renders it as a white silhouette for blue backgrounds.
export default function Logo({ size = 80, white = false }) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        resizeMode: 'contain',
        tintColor: white ? '#ffffff' : undefined,
      }}
    />
  )
}
