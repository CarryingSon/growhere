import { MaterialIcons } from '@expo/vector-icons';
import ExpoCheckbox from 'expo-checkbox';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { Header } from '@/components/Header';
import { PlantPhoto } from '@/components/PlantPhoto';
import { RoomPromptSheet } from '@/components/RoomPromptSheet';
import { plantById } from '@/data/plants';
import { useMyPlants } from '@/hooks/useMyPlants';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

export default function PlantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plant = plantById(id ?? '');
  const { myPlants, addPlant, setReminders } = useMyPlants();
  const [promptVisible, setPromptVisible] = useState(false);
  const [pendingReminders, setPendingReminders] = useState(false);

  const existingEntry = useMemo(
    () => (plant ? myPlants.find((p) => p.plantId === plant.id) : undefined),
    [myPlants, plant]
  );
  const remindersEnabled = existingEntry?.remindersEnabled ?? false;

  if (!plant) {
    return (
      <View style={styles.container}>
        <Header showBack title="Podrobnosti rastline" />
        <View style={styles.missing}>
          <Text style={styles.missingText}>Te rastline nismo našli.</Text>
        </View>
      </View>
    );
  }

  const handleAddPress = () => {
    if (existingEntry) return;
    setPendingReminders(false);
    setPromptVisible(true);
  };

  const handleReminderToggle = async (value: boolean) => {
    if (existingEntry) {
      const ok = await setReminders(existingEntry.id, plant, value);
      if (!ok && value) {
        showPermissionGuidance();
      }
      return;
    }
    if (value) {
      setPendingReminders(true);
      setPromptVisible(true);
    }
  };

  const handleConfirmRoom = async (room: string) => {
    const entry = await addPlant({ plant, prostor: room, remindersEnabled: pendingReminders });
    if (pendingReminders && !entry.remindersEnabled) {
      showPermissionGuidance();
    }
    setPromptVisible(false);
  };

  const showPermissionGuidance = () => {
    Alert.alert(
      'Obvestila so onemogočena',
      'Da GrowHere lahko pošilja opomnike za zalivanje, omogoči obvestila v nastavitvah telefona.',
      [
        { text: 'Prekliči', style: 'cancel' },
        { text: 'Odpri nastavitve', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header showBack title={plant.imeSlo} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoWrap}>
          <PlantPhoto source={plant.slika} style={styles.photo} borderRadius={radius.sm} />
          <View style={styles.soilBadge}>
            <MaterialIcons name="eco" size={16} color={colors.primary} />
            <Text style={styles.soilBadgeText}>{plant.oznakaZemlje}</Text>
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.name}>{plant.imeSlo}</Text>
          <DifficultyBadge difficulty={plant.zahtevnost} />
        </View>
        <Text style={styles.latin}>{plant.imeLat}</Text>

        <Card style={styles.infoCard}>
          <InfoRow
            icon="straighten"
            label="Dimenzije"
            value={`Velikost: do ${plant.visinaMaxCm} × ${plant.sirinaMaxCm} cm`}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="water-drop"
            label="Zalivanje"
            value={`Poleti na ${plant.zalivanjeDniPoleti} dni, pozimi na ${plant.zalivanjeDniPozimi} dni`}
          />
          <View style={styles.adviceBox}>
            <MaterialIcons name="info" size={18} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={styles.adviceText}>{plant.zalivanjeOpis}</Text>
          </View>
          <View style={styles.divider} />
          <InfoRow icon="grass" label="Substrat" value={`Zemlja: ${plant.zemlja}`} soil />
        </Card>

        <Card style={styles.dangerCard}>
          <View style={styles.dangerHeader}>
            <MaterialIcons name="warning" size={20} color={colors.difficultyDemanding} />
            <Text style={styles.dangerTitle}>Nevarna za:</Text>
          </View>
          <View style={styles.dangerRow}>
            <DangerItem label="Pes" checked={plant.strupena.pes} />
            <DangerItem label="Mačka" checked={plant.strupena.macka} />
            <DangerItem label="Otroci" checked={plant.strupena.otroci} />
          </View>
        </Card>

        <Card style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderLabelRow}>
              <MaterialIcons name="notifications-active" size={22} color={colors.primary} />
              <Text style={styles.reminderLabel}>Opomniki za zalivanje</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.surface}
              accessibilityLabel="Opomniki za zalivanje"
            />
          </View>
          <Text style={styles.reminderHint}>Obvestilo te bo opomnilo, ko bo čas za zalivanje.</Text>
        </Card>

        <Button
          title={existingEntry ? 'Že v mojih rastlinah' : 'Dodaj v moje rastline'}
          onPress={handleAddPress}
          disabled={!!existingEntry}
          icon={existingEntry ? 'check' : 'add'}
          accessibilityLabel={
            existingEntry ? `${plant.imeSlo} je že v mojih rastlinah` : `Dodaj ${plant.imeSlo} v moje rastline`
          }
        />
      </ScrollView>

      <RoomPromptSheet
        visible={promptVisible}
        onCancel={() => setPromptVisible(false)}
        onConfirm={handleConfirmRoom}
      />
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  soil,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  soil?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, soil && { backgroundColor: colors.soilTintBase }]}>
        <MaterialIcons name={icon} size={20} color={soil ? colors.soilAccent : colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={[styles.infoLabel, soil && { color: colors.soilAccent }]}>{label.toUpperCase()}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function DangerItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <View style={styles.dangerItem}>
      <ExpoCheckbox
        value={checked}
        disabled
        color={checked ? colors.difficultyDemanding : undefined}
        style={styles.checkbox}
        accessibilityLabel={`${label}: ${checked ? 'strupeno' : 'ni strupeno'}`}
      />
      <Text style={[styles.dangerLabel, !checked && { color: colors.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.margin, paddingBottom: 48, gap: spacing.md },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { fontFamily: fontFamily.medium, color: colors.inkMuted },
  photoWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
  },
  photo: { width: '100%', height: '100%' },
  soilBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  soilBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
    color: colors.ink,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontFamily: fontFamily.bold,
    fontSize: typography.displayHeroMobile.fontSize,
    color: colors.ink,
  },
  latin: {
    fontFamily: fontFamily.italic,
    fontStyle: 'italic',
    fontSize: typography.bodyMd.fontSize,
    color: colors.inkMuted,
  },
  infoCard: { gap: 0 },
  divider: { height: 1, backgroundColor: colors.stroke, marginVertical: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 2 },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: { flexShrink: 1 },
  infoLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
    color: colors.inkMuted,
    letterSpacing: 0.4,
  },
  infoValue: {
    fontFamily: fontFamily.medium,
    fontSize: typography.bodyMd.fontSize,
    color: colors.ink,
    marginTop: 2,
  },
  adviceBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    marginTop: spacing.sm,
    marginLeft: 52,
  },
  adviceText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: typography.caption.fontSize,
    color: colors.inkMuted,
  },
  dangerCard: { gap: spacing.md },
  dangerHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dangerTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineSm.fontSize,
    color: colors.ink,
  },
  dangerRow: { flexDirection: 'row', gap: spacing.sm },
  dangerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  checkbox: { borderRadius: 4 },
  dangerLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelMd.fontSize,
    color: colors.ink,
  },
  reminderCard: { gap: spacing.xs },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  reminderLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelLg.fontSize,
    color: colors.ink,
    flexShrink: 1,
  },
  reminderHint: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySm.fontSize,
    color: colors.inkMuted,
    paddingLeft: 32,
  },
});
