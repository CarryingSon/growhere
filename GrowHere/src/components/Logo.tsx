import Svg, { Circle, Path } from 'react-native-svg';

// Pretvorjeno iz design/koti_ek_logotip/code.html.
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={54} fill="#2E5B3B" />
      <Path d="M60 22 C40 38 34 64 60 92 C86 64 80 38 60 22 Z" fill="#EDF1EA" />
      <Path d="M60 22 L60 92" stroke="#2E5B3B" strokeWidth={3} strokeLinecap="round" />
      <Path d="M60 45 Q72 50 76 60" stroke="#2E5B3B" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M60 58 Q48 63 44 73" stroke="#2E5B3B" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Circle cx={84} cy={36} r={10} fill="#E3AE2A" />
    </Svg>
  );
}
