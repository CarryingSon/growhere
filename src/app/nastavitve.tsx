import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PLANTS } from '@/data/plants';
import { useMyPlants } from '@/hooks/useMyPlants';
import { clearAllData, DEFAULT_SETTINGS, getSettings, setSettings } from '@/lib/storage';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const HOURS = [6, 7, 8, 9, 10, 12, 17, 18, 19, 20];

export default function NastavitveScreen() {
  const { clearAll } = useMyPlants();
  const [reminderHour, setReminderHour] = useState(DEFAULT_SETTINGS.reminderHour);

  useEffect(() => {
    let mounted = true;
    getSettings().then((s) => {
      if (mounted) setReminderHour(s.reminderHour);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleHourChange = (hour: number) => {
    setReminderHour(hour);
    setSettings({ reminderHour: hour, reminderMinute: 0 });
  };

  const handleClearAll = () => {
    Alert.alert(
      'Izbriši vse podatke',
      'To bo odstranilo vse tvoje rastline, priljubljene in nastavitve ter preklicalo vse opomnike. Dejanja ni mogoče razveljaviti.',
      [
        { text: 'Prekliči', style: 'cancel' },
        {
          text: 'Izbriši vse',
          style: 'destructive',
          onPress: async () => {
            clearAll();
            await clearAllData();
            setReminderHour(DEFAULT_SETTINGS.reminderHour);
            Alert.alert('Podatki izbrisani', 'Vsi shranjeni podatki so bili odstranjeni.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header showBack title="Nastavitve" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="notifications-active" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Ura opomnikov</Text>
          </View>
          <Text style={styles.cardHint}>
            Želena ura opomnikov. Opomniki se ponavljajo na toliko dni, kot jih rastlina potrebuje v tem letnem
            času, in se sprožijo ob uri, ko si nazadnje zalil oziroma vklopil opomnik — izbrana ura je zato le
            želja, ki jo dosežeš, če ob njej potrdiš “Zalil sem”.
          </Text>
          <View style={styles.hourGrid}>
            {HOURS.map((hour) => {
              const selected = hour === reminderHour;
              return (
                <Pressable
                  key={hour}
                  onPress={() => handleHourChange(hour)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ura opomnikov: ${hour}:00`}
                  accessibilityState={{ selected }}
                  style={[styles.hourChip, selected && styles.hourChipSelected]}
                >
                  <Text style={[styles.hourChipText, selected && styles.hourChipTextSelected]}>{hour}:00</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="menu-book" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Vir podatkov o rastlinah</Text>
          </View>
          <Text style={styles.cardHint}>
            Aplikacija vsebuje {PLANTS.length} sobnih rastlin z osnovnimi podatki o svetlobi, zalivanju, substratu
            in strupenosti.
          </Text>
          <Text style={styles.cardHint}>
            Podatki o strupenosti so informativni in povzeti po javno dostopnih seznamih strupenih rastlin (npr.
            ASPCA). Če rastlino zaužije otrok ali žival, se takoj posvetuj z zdravnikom oziroma veterinarjem.
          </Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="delete-outline" size={20} color={colors.difficultyDemanding} />
            <Text style={styles.cardTitle}>Izbris vseh podatkov</Text>
          </View>
          <Text style={styles.cardHint}>
            GrowHere hrani podatke samo na tvojem telefonu. Slik sob in natančne lokacije ne shranjujemo.
          </Text>
          <Pressable
            onPress={handleClearAll}
            accessibilityRole="button"
            accessibilityLabel="Izbriši vse shranjene podatke"
            style={styles.dangerButton}
          >
            <MaterialIcons name="delete-outline" size={20} color={colors.onError} />
            <Text style={styles.dangerButtonText}>Izbriši vse podatke</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.margin, paddingBottom: 48, gap: spacing.md },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  cardHint: { fontFamily: fontFamily.regular, fontSize: typography.bodySm.fontSize, color: colors.inkMuted },
  hourGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  hourChip: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  hourChipSelected: { backgroundColor: colors.primary },
  hourChipText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelMd.fontSize, color: colors.ink },
  hourChipTextSelected: { color: colors.onPrimary },
  dangerButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.difficultyDemanding,
    marginTop: spacing.xs,
  },
  dangerButtonText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelLg.fontSize, color: colors.onError },
});
