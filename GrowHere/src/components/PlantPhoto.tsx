import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, ImageSource, ImageStyle } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  source?: ImageSource | number;
  style?: ViewStyle;
  borderRadius?: number;
};

export function PlantPhoto({ source, style, borderRadius = radius.md }: Props) {
  if (!source) {
    return (
      <View style={[styles.placeholder, { borderRadius }, style]}>
        <MaterialCommunityIcons name="flower" size={28} color={colors.primary} />
      </View>
    );
  }
  return (
    <Image
      source={source}
      style={[{ borderRadius, backgroundColor: colors.surfaceContainerLow }, style as ImageStyle]}
      contentFit="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
