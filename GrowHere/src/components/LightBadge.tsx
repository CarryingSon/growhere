import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Light } from '@/data/plants';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const LABELS: Record<Light, string> = {
  direktno: 'Direktno sonce',
  svetlo: 'Svetlo, posredno',
  srednje: 'Srednja svetloba',
  malo: 'Malo svetlobe',
};

const STYLES: Record<Light, { bg: string; fg: string }> = {
  direktno: { bg: colors.lightDirectBg, fg: colors.lightDirectOn },
  svetlo: { bg: colors.lightBrightBg, fg: colors.lightBrightOn },
  srednje: { bg: colors.lightMediumBg, fg: colors.lightMediumOn },
  malo: { bg: colors.lightLowBg, fg: colors.lightLowOn },
};

export function LightBadge({ light }: { light: Light }) {
  const s = STYLES[light];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]} accessibilityLabel={`Svetloba: ${LABELS[light]}`}>
      <MaterialIcons name="wb-sunny" size={14} color={s.fg} style={styles.icon} />
      <Text style={[styles.label, { color: s.fg }]}>{LABELS[light]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
  },
});
