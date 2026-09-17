import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PlantPhoto } from '@/components/PlantPhoto';
import { Plant, plantById } from '@/data/plants';
import { useMyPlants } from '@/hooks/useMyPlants';
import { wateringIntervalDays } from '@/lib/notifications';
import { MyPlant } from '@/lib/storage';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntilNextWatering(entry: MyPlant, plant: Plant): number {
  const lastDate = entry.lastWatered ? new Date(entry.lastWatered) : new Date(entry.addedAt);
  const intervalDays = wateringIntervalDays(plant);
  const nextDate = new Date(lastDate.getTime() + intervalDays * DAY_MS);
  const diffMs = nextDate.getTime() - Date.now();
  return Math.ceil(diffMs / DAY_MS);
}

export default function MojeRastlineScreen() {
  const router = useRouter();
  const { myPlants, loaded, removePlant, setReminders, markWatered } = useMyPlants();

  const entries = useMemo(
    () =>
      myPlants
        .map((entry) => ({ entry, plant: plantById(entry.plantId) }))
        .filter((item): item is { entry: MyPlant; plant: Plant } => !!item.plant),
    [myPlants]
  );

  const dueToday = useMemo(
    () => entries.filter(({ entry, plant }) => daysUntilNextWatering(entry, plant) <= 0),
    [entries]
  );

  const handleRemove = (entry: MyPlant, plant: Plant) => {
    Alert.alert('Odstrani rastlino', `Ali res želiš odstraniti ${plant.imeSlo} iz Mojih rastlin?`, [
      { text: 'Prekliči', style: 'cancel' },
      { text: 'Odstrani', style: 'destructive', onPress: () => removePlant(entry.id) },
    ]);
  };

  const handleReminderToggle = async (entry: MyPlant, plant: Plant, value: boolean) => {
    const ok = await setReminders(entry.id, plant, value);
    if (!ok && value) {
      Alert.alert(
        'Obvestila so onemogočena',
        'Da GrowHere lahko pošilja opomnike za zalivanje, omogoči obvestila v nastavitvah telefona.',
        [
          { text: 'Prekliči', style: 'cancel' },
          { text: 'Odpri nastavitve', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Header subtitle="Moje rastline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header subtitle="Moje rastline" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Moje rastline</Text>
            <Text style={styles.subtitle}>Tvoj zeleni kotiček pod nadzorom</Text>
          </View>
          <View style={styles.countBadge}>
            <MaterialIcons name="spa" size={16} color={colors.primary} />
            <Text style={styles.countBadgeText}>
              {entries.length} {entries.length === 1 ? 'rastlina' : 'rastlin'}
            </Text>
          </View>
        </View>

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="local-florist" size={40} color={colors.primaryContainer} />
            </View>
            <Text style={styles.emptyTitle}>Še nimaš shranjenih rastlin.</Text>
            <Text style={styles.emptyText}>Izmeri svetlobo v svojem bivalnem prostoru in dodaj svojo prvo rastlino.</Text>
            <Button
              title="Skeniraj sobo"
              icon="view-in-ar"
              onPress={() => router.push('/(tabs)/skeniraj')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <>
            {dueToday.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <MaterialIcons name="water-drop" size={20} color={colors.difficultyModerate} />
                    <Text style={styles.sectionTitle}>Nujno za zalivanje</Text>
                  </View>
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>{dueToday.length} danes</Text>
                  </View>
                </View>
                {dueToday.map(({ entry, plant }) => (
                  <DueCard
                    key={entry.id}
                    entry={entry}
                    plant={plant}
                    onWatered={() => markWatered(entry.id, plant)}
                    onLongPress={() => handleRemove(entry, plant)}
                  />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vse shranjene rastline</Text>
              {entries.map(({ entry, plant }) => (
                <PlantRow
                  key={entry.id}
                  entry={entry}
                  plant={plant}
                  onWatered={() => markWatered(entry.id, plant)}
                  onToggleReminder={(value) => handleReminderToggle(entry, plant, value)}
                  onLongPress={() => handleRemove(entry, plant)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DueCard({
  entry,
  plant,
  onWatered,
  onLongPress,
}: {
  entry: MyPlant;
  plant: Plant;
  onWatered: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable onLongPress={onLongPress} accessibilityRole="button" accessibilityLabel={`${plant.imeSlo}, možnosti`}>
      <Card style={styles.dueCard}>
        <View style={styles.dueCardTop}>
          <PlantPhoto source={plant.slika} style={styles.rowPhoto} />
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{plant.imeSlo}</Text>
            <Text style={styles.rowLocation}>
              {entry.prostor}
              {entry.predel ? `, ${entry.predel}` : ''}
            </Text>
            <View style={styles.dueTag}>
              <MaterialIcons name="water-drop" size={12} color={colors.difficultyModerate} />
              <Text style={styles.dueTagText}>Zalij danes</Text>
            </View>
          </View>
        </View>
        <Button title="Zalil sem" icon="check" onPress={onWatered} accessibilityLabel={`Označi, da si zalil ${plant.imeSlo}`} />
      </Card>
    </Pressable>
  );
}

function PlantRow({
  entry,
  plant,
  onWatered,
  onToggleReminder,
  onLongPress,
}: {
  entry: MyPlant;
  plant: Plant;
  onWatered: () => void;
  onToggleReminder: (value: boolean) => void;
  onLongPress: () => void;
}) {
  const days = daysUntilNextWatering(entry, plant);
  const nextWateringLabel = days <= 0 ? 'Zalij danes' : `Naslednje zalivanje: čez ${days} ${days === 1 ? 'dan' : 'dni'}`;

  return (
    <Pressable onLongPress={onLongPress} accessibilityRole="button" accessibilityLabel={`${plant.imeSlo}, možnosti`}>
      <Card style={styles.plantCard}>
        <View style={styles.dueCardTop}>
          <PlantPhoto source={plant.slika} style={styles.rowPhoto} />
          <View style={styles.rowInfo}>
            <View style={styles.rowInfoTop}>
              <Text style={styles.rowName} numberOfLines={1}>
                {plant.imeSlo}
              </Text>
              <Switch
                value={entry.remindersEnabled}
                onValueChange={onToggleReminder}
                trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                thumbColor={colors.surface}
                accessibilityLabel={`Opomniki za zalivanje: ${plant.imeSlo}`}
              />
            </View>
            <Text style={styles.rowLocation}>
              {entry.prostor}
              {entry.predel ? `, ${entry.predel}` : ''}
            </Text>
            <Text style={[styles.nextWatering, days <= 0 && { color: colors.difficultyModerate }]}>
              {nextWateringLabel}
            </Text>
          </View>
        </View>
        <View style={styles.plantCardFooter}>
          <Button title="Zalil sem" icon="check" variant="secondary" onPress={onWatered} accessibilityLabel={`Označi, da si zalil ${plant.imeSlo}`} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.margin, paddingBottom: 120, gap: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontFamily: fontFamily.bold, fontSize: typography.headlineLg.fontSize, color: colors.ink },
  subtitle: { fontFamily: fontFamily.regular, fontSize: typography.caption.fontSize, color: colors.inkMuted, marginTop: 2 },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  countBadgeText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.primary },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: 4,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySm.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyButton: { width: '100%' },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  dueBadge: {
    backgroundColor: `${colors.difficultyModerate}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  dueBadgeText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.difficultyModerate },
  dueCard: { gap: spacing.sm },
  dueCardTop: { flexDirection: 'row', gap: spacing.md },
  rowPhoto: { width: 64, height: 64, borderRadius: radius.md },
  rowInfo: { flex: 1, gap: 2 },
  rowInfoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowName: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink, flexShrink: 1 },
  rowLocation: { fontFamily: fontFamily.regular, fontSize: typography.bodySm.fontSize, color: colors.inkMuted },
  dueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.difficultyModerate}1F`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  dueTagText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.difficultyModerate },
  plantCard: { gap: spacing.sm },
  nextWatering: { fontFamily: fontFamily.medium, fontSize: typography.caption.fontSize, color: colors.primary, marginTop: 4 },
  plantCardFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
});
