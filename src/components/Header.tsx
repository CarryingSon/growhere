import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, radius, typography } from '@/theme';

import { Logo } from './Logo';

type Props = {
  subtitle?: string;
  title?: string;
  showBack?: boolean;
};

export function Header({ subtitle, title, showBack }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Nazaj"
              hitSlop={8}
              style={styles.iconButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
          ) : (
            <Logo size={32} />
          )}
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title ?? 'GrowHere'}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.right}>
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/katalog', params: { focusSearch: '1' } })}
            accessibilityRole="button"
            accessibilityLabel="Išči po katalogu rastlin"
            hitSlop={8}
            style={styles.iconButton}
          >
            <MaterialIcons name="search" size={22} color={colors.inkMuted} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/nastavitve')}
            accessibilityRole="button"
            accessibilityLabel="Odpri nastavitve"
            hitSlop={8}
            style={styles.profileButton}
          >
            <MaterialIcons name="person" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(237, 241, 234, 0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.stroke,
  },
  row: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  titleWrap: {
    flexShrink: 1,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineSm.fontSize,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: typography.caption.fontSize,
    color: colors.inkMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
