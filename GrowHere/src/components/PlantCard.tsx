import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Plant } from '@/data/plants';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

import { DifficultyBadge } from './DifficultyBadge';
import { PlantPhoto } from './PlantPhoto';

type Props = {
  plant: Plant;
  favorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
};

export function PlantCard({ plant, favorite, onPress, onToggleFavorite }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${plant.imeSlo}, ${plant.imeLat}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.photoWrap}>
        <PlantPhoto source={plant.slika} style={styles.photo} borderRadius={0} />
        {onToggleFavorite && (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={favorite ? `Odstrani ${plant.imeSlo} iz priljubljenih` : `Dodaj ${plant.imeSlo} med priljubljene`}
            style={styles.favoriteButton}
          >
            <MaterialIcons
              name={favorite ? 'favorite' : 'favorite-border'}
              size={18}
              color={favorite ? colors.error : colors.inkMuted}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {plant.imeSlo}
        </Text>
        <Text style={styles.latin} numberOfLines={1}>
          {plant.imeLat}
        </Text>
        <View style={styles.footer}>
          <DifficultyBadge difficulty={plant.zahtevnost} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  photoWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.sm + 4,
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineSm.fontSize,
    color: colors.ink,
  },
  latin: {
    fontFamily: fontFamily.italic,
    fontStyle: 'italic',
    fontSize: typography.bodySm.fontSize,
    color: colors.inkMuted,
    marginTop: 2,
  },
  footer: {
    marginTop: 10,
    paddingTop: 8,
  },
});
