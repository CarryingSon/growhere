import { StyleSheet, Text, View } from 'react-native';

import { Difficulty } from '@/data/plants';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const LABELS: Record<Difficulty, string> = {
  enostavna: 'Enostavna',
  srednja: 'Srednja',
  zahtevna: 'Zahtevna',
};

const DOT_COLORS: Record<Difficulty, string> = {
  enostavna: colors.difficultyEasy,
  srednja: colors.difficultyModerate,
  zahtevna: colors.difficultyDemanding,
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <View style={styles.badge} accessibilityLabel={`Zahtevnost: ${LABELS[difficulty]}`}>
      <View style={[styles.dot, { backgroundColor: DOT_COLORS[difficulty] }]} />
      <Text style={styles.label}>{LABELS[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 6,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
    color: colors.ink,
  },
});
