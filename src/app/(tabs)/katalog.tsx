import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { Header } from '@/components/Header';
import { PlantCard } from '@/components/PlantCard';
import { Plant, PLANTS } from '@/data/plants';
import { useFavorites } from '@/hooks/useFavorites';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

type FilterKey = 'all' | 'enostavna' | 'srednja' | 'zahtevna' | 'pet-safe' | 'low-light' | 'hanging';

const FILTERS: { key: FilterKey; label: string; icon?: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'all', label: 'Vse' },
  { key: 'enostavna', label: 'Enostavna' },
  { key: 'srednja', label: 'Srednja' },
  { key: 'zahtevna', label: 'Zahtevna' },
  { key: 'pet-safe', label: 'Varno za živali', icon: 'pets' },
  { key: 'low-light', label: 'Malo svetlobe', icon: 'bedtime' },
  { key: 'hanging', label: 'Viseče', icon: 'swap-vert' },
];

const DIFFICULTY_DOT: Partial<Record<FilterKey, string>> = {
  enostavna: colors.difficultyEasy,
  srednja: colors.difficultyModerate,
  zahtevna: colors.difficultyDemanding,
};

function isPetSafe(plant: Plant) {
  return !plant.strupena.pes && !plant.strupena.macka && !plant.strupena.otroci;
}

function matchesFilter(plant: Plant, filter: FilterKey) {
  switch (filter) {
    case 'all':
      return true;
    case 'enostavna':
    case 'srednja':
    case 'zahtevna':
      return plant.zahtevnost === filter;
    case 'pet-safe':
      return isPetSafe(plant);
    case 'low-light':
      return plant.svetloba.includes('malo');
    case 'hanging':
      return !!plant.visece;
    default:
      return true;
  }
}

export default function KatalogScreen() {
  const router = useRouter();
  const { focusSearch } = useLocalSearchParams<{ focusSearch?: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (focusSearch) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [focusSearch]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return PLANTS.filter((plant) => {
      const matchesQuery =
        normalizedQuery === '' ||
        plant.imeSlo.toLowerCase().includes(normalizedQuery) ||
        plant.imeLat.toLowerCase().includes(normalizedQuery);
      return matchesQuery && matchesFilter(plant, filter);
    });
  }, [query, filter]);

  const countLabel = useMemo(() => {
    const n = filtered.length;
    if (n === 1) return '1 rastlina';
    if (n === 2) return '2 rastlini';
    if (n >= 3 && n <= 4) return `${n} rastline`;
    return `${n} rastlin`;
  }, [filtered.length]);

  return (
    <View style={styles.container}>
      <Header subtitle="Katalog" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={22} color={colors.outline} style={styles.searchIcon} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Išči rastlino"
                placeholderTextColor={colors.outline}
                style={styles.searchInput}
                accessibilityLabel="Išči rastlino po imenu"
                returnKeyType="search"
              />
            </View>
            <FlatList
              data={FILTERS}
              keyExtractor={(item) => item.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item }) => (
                <Chip
                  label={item.label}
                  icon={item.icon}
                  dotColor={DIFFICULTY_DOT[item.key]}
                  selected={filter === item.key}
                  onPress={() => setFilter(item.key)}
                  style={styles.filterChip}
                />
              )}
            />
            <View style={styles.countRow}>
              <Text style={styles.countLabelStatic}>Rastline v bazi</Text>
              <Text style={styles.countValue}>{countLabel}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PlantCard
            plant={item}
            favorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/rastlina/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={28} color={colors.inkMuted} />
            <Text style={styles.emptyTitle}>Ni najdenih rastlin</Text>
            <Text style={styles.emptyText}>Poskusi z drugačnim iskalnim nizom ali odstrani izbrane filtre.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  listContent: { paddingHorizontal: spacing.margin, paddingBottom: 120 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: typography.bodyMd.fontSize,
    color: colors.ink,
    height: '100%',
  },
  filterRow: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  filterChip: { marginRight: 0 },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  countLabelStatic: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMd.fontSize,
    color: colors.inkMuted,
  },
  countValue: {
    fontFamily: fontFamily.regular,
    fontSize: typography.caption.fontSize,
    color: colors.outline,
  },
  row: {
    gap: spacing.sm + 4,
    marginBottom: spacing.sm + 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineSm.fontSize,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySm.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
