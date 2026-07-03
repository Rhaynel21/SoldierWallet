import Svg, { Path, Text as SvgText } from 'react-native-svg'

// Shield + S emblem, white on transparent — for blue screens.
export default function LogoMark({ size = 44 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 12 L84 24 V50 C84 73 69 86 50 94 C31 86 16 73 16 50 V24 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <SvgText
        x={50}
        y={70}
        textAnchor="middle"
        fontSize={54}
        fontWeight="900"
        fill="#ffffff"
      >
        S
      </SvgText>
      <SvgText x={70} y={82} textAnchor="middle" fontSize={18} fill="#f5b301">
        ★
      </SvgText>
    </Svg>
  )
}
