import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, radius, shadow, typography } from '@/theme';

const LABELS: Record<string, string> = {
  'moje-rastline': 'Moje rastline',
  skeniraj: 'Skeniraj',
  katalog: 'Katalog',
};

const ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'moje-rastline': 'flower',
  katalog: 'book-open-variant',
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = LABELS[route.name] ?? options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === 'skeniraj') {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Skeniraj sobo"
                style={styles.centerItem}
              >
                <View style={styles.centerButton}>
                  <MaterialIcons name="photo-camera" size={26} color={colors.onPrimary} />
                </View>
                <Text style={styles.centerLabel}>{label}</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isFocused }}
              style={styles.item}
            >
              <MaterialCommunityIcons
                name={ICONS[route.name] ?? 'circle'}
                size={24}
                color={isFocused ? colors.primary : colors.inkMuted}
              />
              <Text style={[styles.label, { color: isFocused ? colors.primary : colors.inkMuted }]}>{label}</Text>
              {isFocused && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(237, 241, 234, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.stroke,
    ...shadow.nav,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 64,
    paddingHorizontal: 16,
  },
  item: {
    minWidth: 64,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
  },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  centerItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    top: -12,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.level2,
  },
  centerLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
    color: colors.inkMuted,
  },
});
