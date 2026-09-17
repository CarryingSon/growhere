import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';

type Props = ViewProps & {
  elevation?: 1 | 2 | 3;
  padding?: number;
};

export function Card({ style, elevation = 1, padding = spacing.md, children, ...rest }: Props) {
  const elevationStyle = elevation === 3 ? shadow.level3 : elevation === 2 ? shadow.level2 : shadow.level1;
  return (
    <View style={[styles.card, elevationStyle, { padding }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
});
