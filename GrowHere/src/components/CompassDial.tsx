import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors, radius as themeRadius } from '@/theme';

type Props = {
  headingDeg: number;
  sunAzimuthDeg?: number;
  size?: number;
};

function polarToXY(angleDeg: number, radius: number, center: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: center + radius * Math.sin(rad),
    y: center - radius * Math.cos(rad),
  };
}

const TICKS = [0, 45, 90, 135, 180, 225, 270, 315];

export function CompassDial({ headingDeg, sunAzimuthDeg, size = 256 }: Props) {
  const center = size / 2;
  const sunPos = sunAzimuthDeg !== undefined ? polarToXY(sunAzimuthDeg, center - 18, center) : null;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={styles.glow} />
      <View style={[styles.disc, { width: size, height: size, borderRadius: center }]}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={center}
            cy={center}
            r={center - 8}
            stroke={colors.surfaceContainerHigh}
            strokeWidth={1.5}
            strokeDasharray="2 6"
            fill="none"
          />
          <Circle cx={center} cy={center} r={center - 24} stroke={colors.surfaceContainerHighest} strokeWidth={1} fill="none" />
          {TICKS.map((deg) => {
            const outer = polarToXY(deg, center - 8, center);
            const inner = polarToXY(deg, center - 16, center);
            return (
              <Line
                key={deg}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={colors.outlineVariant}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

        <Text style={[styles.cardinal, styles.cardinalTop]}>S</Text>
        <Text style={[styles.cardinal, styles.cardinalRight]}>V</Text>
        <Text style={[styles.cardinal, styles.cardinalBottom]}>J</Text>
        <Text style={[styles.cardinal, styles.cardinalLeft]}>Z</Text>

        <View style={[styles.needle, { transform: [{ rotate: `${headingDeg}deg` }] }]}>
          <View style={styles.needleNorth} />
          <View style={styles.needleSouth} />
          <View style={styles.pivot}>
            <View style={styles.pivotDot} />
          </View>
        </View>

        {sunPos && (
          <View style={[styles.sunBadge, { left: sunPos.x - 12, top: sunPos.y - 12 }]}>
            <MaterialIcons name="wb-sunny" size={14} color={colors.onSecondaryContainer} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(254, 198, 67, 0.15)',
  },
  disc: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 36,
    elevation: 6,
  },
  cardinal: { position: 'absolute', fontWeight: '700', fontSize: 15, color: colors.inkMuted },
  cardinalTop: { top: 16, color: colors.error },
  cardinalRight: { right: 16 },
  cardinalBottom: { bottom: 16 },
  cardinalLeft: { left: 16 },
  needle: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  needleNorth: {
    position: 'absolute',
    top: 36,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 62,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.error,
  },
  needleSouth: {
    position: 'absolute',
    bottom: 36,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 62,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.inkMuted,
  },
  pivot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  pivotDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  sunBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: themeRadius.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
