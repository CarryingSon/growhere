import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, fontFamily, radius, spacing, typography } from '@/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  dotColor?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function Chip({ label, selected, onPress, icon, dotColor, accessibilityLabel, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {dotColor && <Text style={[styles.dot, { backgroundColor: dotColor }]} />}
      {icon && (
        <MaterialIcons
          name={icon}
          size={16}
          color={selected ? colors.onPrimary : colors.primary}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surface,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: spacing.xs,
    overflow: 'hidden',
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelMd.fontSize,
  },
});
