import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { FilterSheet, PlantFilters } from '@/components/FilterSheet';
import { Header } from '@/components/Header';
import { LightBadge } from '@/components/LightBadge';
import { PlantPhoto } from '@/components/PlantPhoto';
import { RoomPromptSheet } from '@/components/RoomPromptSheet';
import { DEMO } from '@/config';
import { Light, PLANTS } from '@/data/plants';
import { useMyPlants } from '@/hooks/useMyPlants';
import { matchPlants, MatchedPlant } from '@/lib/matchPlants';
import { Zone } from '@/lib/roomAnalysis';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const demoRoomImage = require('../../assets/plants/demo-room.png');

const ZONE_COLORS: Record<Light, string> = {
  direktno: colors.lightDirect,
  svetlo: colors.lightBright,
  srednje: colors.lightMedium,
  malo: colors.lightLow,
};

const LEGEND_ITEMS: { light: Light; label: string }[] = [
  { light: 'direktno', label: 'Direktno sonce' },
  { light: 'svetlo', label: 'Svetlo, posredno' },
  { light: 'srednje', label: 'Srednja svetloba' },
  { light: 'malo', label: 'Malo svetlobe' },
];

function formatHours(h: number) {
  return h.toLocaleString('sl-SI', { maximumFractionDigits: 1 });
}

export default function RezultatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoUri?: string; zones?: string }>();
  const { addPlant, hasPlant } = useMyPlants();

  const zones: Zone[] = useMemo(() => {
    try {
      return params.zones ? (JSON.parse(params.zones) as Zone[]) : [];
    } catch {
      return [];
    }
  }, [params.zones]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [filters, setFilters] = useState<PlantFilters>({ difficulty: 'all', petSafeOnly: false });
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedPlantsByZone, setSelectedPlantsByZone] = useState<Record<string, string[]>>({});
  const [roomPromptVisible, setRoomPromptVisible] = useState(false);

  const selectedZone = zones[selectedIndex];

  const onImageLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setImageSize({ width, height });
  };

  const matchedPlants: MatchedPlant[] = useMemo(() => {
    if (!selectedZone) return [];
    let result = matchPlants(PLANTS, selectedZone.svetloba, {
      visinaCm: selectedZone.prostorVisinaCm,
      sirinaCm: selectedZone.prostorSirinaCm,
    });
    if (filters.difficulty !== 'all') {
      result = result.filter((m) => m.plant.zahtevnost === filters.difficulty);
    }
    if (filters.petSafeOnly) {
      result = result.filter((m) => !m.plant.strupena.pes && !m.plant.strupena.macka && !m.plant.strupena.otroci);
    }
    return result;
  }, [selectedZone, filters]);

  const selectedIds = selectedZone ? (selectedPlantsByZone[selectedZone.id] ?? []) : [];

  const togglePlantSelection = (plantId: string) => {
    if (!selectedZone) return;
    setSelectedPlantsByZone((prev) => {
      const current = prev[selectedZone.id] ?? [];
      const next = current.includes(plantId) ? current.filter((id) => id !== plantId) : [...current, plantId];
      return { ...prev, [selectedZone.id]: next };
    });
  };

  const handleAddSelected = () => {
    if (selectedIds.length === 0) return;
    setRoomPromptVisible(true);
  };

  const handleConfirmRoom = async (room: string) => {
    for (const plantId of selectedIds) {
      const plant = PLANTS.find((p) => p.id === plantId);
      if (plant && !hasPlant(plantId)) {
        await addPlant({
          plant,
          prostor: room,
          predel: selectedZone ? `Predel ${selectedZone.index}` : undefined,
          remindersEnabled: false,
        });
      }
    }
    setRoomPromptVisible(false);
    if (selectedZone) {
      setSelectedPlantsByZone((prev) => ({ ...prev, [selectedZone.id]: [] }));
    }
  };

  if (zones.length === 0) {
    return (
      <View style={styles.container}>
        <Header showBack title="Rezultat analize" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Rezultatov ni bilo mogoče prikazati.</Text>
          <Button title="Nazaj na skeniranje" onPress={() => router.replace('/(tabs)/skeniraj')} />
        </View>
      </View>
    );
  }

  const backgroundSource = DEMO || !params.photoUri ? demoRoomImage : { uri: params.photoUri };

  return (
    <View style={styles.container}>
      <Header showBack title="Rezultat analize" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageCard}>
          <View style={styles.imageWrap} onLayout={onImageLayout}>
            <Image source={backgroundSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
            {imageSize.width > 0 &&
              zones.map((zone) => {
                const isSelected = zone.id === selectedZone?.id;
                const color = ZONE_COLORS[zone.svetloba];
                return (
                  <Pressable
                    key={zone.id}
                    onPress={() => setSelectedIndex(zone.index - 1)}
                    accessibilityRole="button"
                    accessibilityLabel={`Izberi predel ${zone.index}`}
                    style={[
                      styles.zoneBox,
                      {
                        left: (zone.x / 100) * imageSize.width,
                        top: (zone.y / 100) * imageSize.height,
                        width: (zone.sirina / 100) * imageSize.width,
                        height: (zone.visina / 100) * imageSize.height,
                        borderColor: color,
                        backgroundColor: `${color}26`,
                      },
                      isSelected && { borderWidth: 3 },
                    ]}
                  >
                    <View style={[styles.zoneNumber, { backgroundColor: color }]}>
                      <Text style={styles.zoneNumberText}>{zone.index}</Text>
                    </View>
                  </Pressable>
                );
              })}
          </View>
          <View style={styles.legend}>
            {LEGEND_ITEMS.map((item) => (
              <View key={item.light} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: ZONE_COLORS[item.light] }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.segmentRow}>
          {zones.map((zone) => {
            const selected = zone.id === selectedZone?.id;
            return (
              <Pressable
                key={zone.id}
                onPress={() => setSelectedIndex(zone.index - 1)}
                accessibilityRole="button"
                accessibilityLabel={`Predel ${zone.index}`}
                accessibilityState={{ selected }}
                style={[styles.segment, selected && styles.segmentSelected]}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>Predel {zone.index}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedZone && (
          <Card style={styles.zoneCard}>
            <View style={styles.zoneCardHeader}>
              <View style={styles.zoneCardTitleRow}>
                <View style={styles.zoneCardBadgeNumber}>
                  <Text style={styles.zoneCardBadgeNumberText}>{selectedZone.index}</Text>
                </View>
                <View>
                  <Text style={styles.zoneCardTitle}>Predel {selectedZone.index}</Text>
                  <Text style={styles.zoneCardSubtitle}>{selectedZone.opis}</Text>
                </View>
              </View>
              <LightBadge light={selectedZone.svetloba} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialIcons name="sunny" size={18} color={colors.lightDirectOn} />
                <View>
                  <Text style={styles.statLabel}>Poletje</Text>
                  <Text style={styles.statValue}>{formatHours(selectedZone.sunHours.summerHours)} h sonca</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="ac-unit" size={18} color={colors.lightLowOn} />
                <View>
                  <Text style={styles.statLabel}>Zima</Text>
                  <Text style={styles.statValue}>{formatHours(selectedZone.sunHours.winterHours)} h sonca</Text>
                </View>
              </View>
            </View>

            <View style={styles.spaceRow}>
              <MaterialIcons name="square-foot" size={18} color={colors.primary} />
              <Text style={styles.spaceText}>
                Prostor: do {selectedZone.prostorVisinaCm} × {selectedZone.prostorSirinaCm} cm
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.plantsHeader}>
          <View style={styles.plantsHeaderTitleRow}>
            <Text style={styles.plantsHeaderTitle}>Primerne rastline</Text>
            <View style={styles.plantsCountBadge}>
              <Text style={styles.plantsCountText}>{matchedPlants.length}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setFilterVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Odpri filtre rastlin"
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>Filtri</Text>
            <MaterialIcons name="tune" size={18} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.plantsList}>
          {matchedPlants.map(({ plant, status }) => {
            const isSelected = selectedIds.includes(plant.id);
            const alreadyAdded = hasPlant(plant.id);
            return (
              <Pressable
                key={plant.id}
                onPress={() => router.push(`/rastlina/${plant.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${plant.imeSlo}, podrobnosti`}
                style={styles.plantRow}
              >
                <PlantPhoto source={plant.slika} style={styles.plantPhoto} />
                <View style={styles.plantInfo}>
                  <View style={styles.plantInfoTop}>
                    <View style={styles.plantNameWrap}>
                      <Text style={styles.plantName} numberOfLines={1}>
                        {plant.imeSlo}
                      </Text>
                      <Text style={styles.plantLatin} numberOfLines={1}>
                        {plant.imeLat}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => togglePlantSelection(plant.id)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isSelected ? `Odstrani ${plant.imeSlo} iz izbranih` : `Dodaj ${plant.imeSlo} med izbrane`
                      }
                      hitSlop={8}
                      style={styles.bookmarkButton}
                    >
                      <MaterialIcons
                        name={isSelected ? 'bookmark' : 'bookmark-border'}
                        size={20}
                        color={isSelected ? colors.primary : colors.inkMuted}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.plantBadgeRow}>
                    <DifficultyBadge difficulty={plant.zahtevnost} />
                    {alreadyAdded ? (
                      <View style={styles.addedBadge}>
                        <MaterialIcons name="check-circle" size={14} color={colors.difficultyEasy} />
                        <Text style={styles.addedBadgeText}>Že dodana</Text>
                      </View>
                    ) : status === 'fits' ? (
                      <View style={styles.fitBadge}>
                        <MaterialIcons name="check-circle" size={14} color={colors.difficultyEasy} />
                        <Text style={styles.fitBadgeText}>Pase v prostor</Text>
                      </View>
                    ) : (
                      <View style={styles.outgrowBadge}>
                        <MaterialIcons name="info" size={14} color={colors.lightDirectOn} />
                        <Text style={styles.outgrowBadgeText}>Sčasoma bo prevelika</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
          {matchedPlants.length === 0 && (
            <Text style={styles.noPlantsText}>Za ta predel in izbrane filtre ni primernih rastlin.</Text>
          )}
        </View>

        <Button
          title="Dodaj izbrano v Moje rastline"
          icon="add-circle"
          onPress={handleAddSelected}
          disabled={selectedIds.length === 0}
          accessibilityLabel="Dodaj izbrane rastline v Moje rastline"
        />
      </ScrollView>

      <FilterSheet visible={filterVisible} filters={filters} onChange={setFilters} onClose={() => setFilterVisible(false)} />
      <RoomPromptSheet
        visible={roomPromptVisible}
        onCancel={() => setRoomPromptVisible(false)}
        onConfirm={handleConfirmRoom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.margin, paddingBottom: 64, gap: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  emptyText: { fontFamily: fontFamily.medium, color: colors.inkMuted, textAlign: 'center' },
  imageCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrap: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.surfaceContainerLow },
  zoneBox: { position: 'absolute', borderWidth: 2, borderRadius: radius.sm, padding: 6 },
  zoneNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneNumberText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.surface },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.sm + 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fontFamily.regular, fontSize: typography.caption.fontSize, color: colors.inkMuted },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, minHeight: 48, justifyContent: 'center', borderRadius: radius.full, alignItems: 'center' },
  segmentSelected: { backgroundColor: colors.primary },
  segmentText: { fontFamily: fontFamily.medium, fontSize: typography.labelMd.fontSize, color: colors.inkMuted },
  segmentTextSelected: { color: colors.onPrimary, fontFamily: fontFamily.semiBold },
  zoneCard: { gap: spacing.sm },
  zoneCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  zoneCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  zoneCardBadgeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneCardBadgeNumberText: { fontFamily: fontFamily.bold, color: colors.primary },
  zoneCardTitle: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  zoneCardSubtitle: { fontFamily: fontFamily.regular, fontSize: typography.caption.fontSize, color: colors.inkMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm + 4,
    padding: spacing.sm + 4,
  },
  statLabel: { fontFamily: fontFamily.regular, fontSize: typography.caption.fontSize, color: colors.inkMuted },
  statValue: { fontFamily: fontFamily.semiBold, fontSize: typography.labelMd.fontSize, color: colors.ink },
  spaceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spaceText: { fontFamily: fontFamily.regular, fontSize: typography.bodySm.fontSize, color: colors.ink },
  plantsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  plantsHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  plantsHeaderTitle: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineMd.fontSize, color: colors.ink },
  plantsCountBadge: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  plantsCountText: { fontFamily: fontFamily.bold, fontSize: typography.labelSm.fontSize, color: colors.primary },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48, paddingHorizontal: 4 },
  filterButtonText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelMd.fontSize, color: colors.primary },
  plantsList: { gap: spacing.sm },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  plantPhoto: { width: 76, height: 76, borderRadius: radius.sm },
  plantInfo: { flex: 1, gap: 8 },
  plantInfoTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  plantNameWrap: { flexShrink: 1 },
  plantName: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  plantLatin: { fontFamily: fontFamily.italic, fontStyle: 'italic', fontSize: typography.bodySm.fontSize, color: colors.inkMuted },
  bookmarkButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  plantBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.difficultyEasy}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  addedBadgeText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.difficultyEasy },
  fitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.difficultyEasy}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  fitBadgeText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.difficultyEasy },
  outgrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.lightDirectOn}22`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  outgrowBadgeText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.lightDirectOn },
  noPlantsText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySm.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
