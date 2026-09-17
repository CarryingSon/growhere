import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Difficulty } from '@/data/plants';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

export type PlantFilters = {
  difficulty: Difficulty | 'all';
  petSafeOnly: boolean;
};

const DIFFICULTY_OPTIONS: { key: Difficulty | 'all'; label: string }[] = [
  { key: 'all', label: 'Vse' },
  { key: 'enostavna', label: 'Enostavna' },
  { key: 'srednja', label: 'Srednja' },
  { key: 'zahtevna', label: 'Zahtevna' },
];

type Props = {
  visible: boolean;
  filters: PlantFilters;
  onChange: (filters: PlantFilters) => void;
  onClose: () => void;
};

export function FilterSheet({ visible, filters, onChange, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Zapri filtre" />
        <View style={styles.sheet}>
          <Text style={styles.title}>Filtri</Text>

          <Text style={styles.sectionLabel}>Zahtevnost</Text>
          <View style={styles.row}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                selected={filters.difficulty === opt.key}
                onPress={() => onChange({ ...filters, difficulty: opt.key })}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Varnost</Text>
          <View style={styles.row}>
            <Chip
              label="Varno za živali"
              icon="pets"
              selected={filters.petSafeOnly}
              onPress={() => onChange({ ...filters, petSafeOnly: !filters.petSafeOnly })}
            />
          </View>

          <Button title="Prikaži rezultate" onPress={onClose} style={styles.applyButton} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30, 42, 33, 0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  applyButton: { marginTop: spacing.md },
});
