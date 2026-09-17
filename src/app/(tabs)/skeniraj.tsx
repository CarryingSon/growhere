import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPosition } from 'suncalc';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CompassDial } from '@/components/CompassDial';
import { Header } from '@/components/Header';
import { DEFAULT_LOCATION } from '@/config';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const DIRECTIONS: { deg: number; short: string; label: string }[] = [
  { deg: 0, short: 'S', label: 'sever' },
  { deg: 45, short: 'SV', label: 'severovzhod' },
  { deg: 90, short: 'V', label: 'vzhod' },
  { deg: 135, short: 'JV', label: 'jugovzhod' },
  { deg: 180, short: 'J', label: 'jug' },
  { deg: 225, short: 'JZ', label: 'jugozahod' },
  { deg: 270, short: 'Z', label: 'zahod' },
  { deg: 315, short: 'SZ', label: 'severozahod' },
];

function directionLabel(deg: number) {
  const normalized = ((deg % 360) + 360) % 360;
  const nearest = DIRECTIONS.reduce((best, d) => {
    const diff = Math.min(Math.abs(d.deg - normalized), 360 - Math.abs(d.deg - normalized));
    const bestDiff = Math.min(Math.abs(best.deg - normalized), 360 - Math.abs(best.deg - normalized));
    return diff < bestDiff ? d : best;
  });
  return nearest;
}

function accuracyLabel(accuracy: number | null) {
  if (accuracy === null) return { text: 'ni na voljo', color: colors.outline };
  if (accuracy >= 3) return { text: 'dobra', color: colors.difficultyEasy };
  if (accuracy === 2) return { text: 'srednja', color: colors.lightBrightOn };
  return { text: 'slaba', color: colors.difficultyDemanding };
}

export default function SkenirajScreen() {
  const router = useRouter();
  const [liveHeading, setLiveHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [manualDeg, setManualDeg] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; isDefault: boolean }>({
    ...DEFAULT_LOCATION,
    isDefault: true,
  });
  const [busy, setBusy] = useState<'camera' | 'gallery' | null>(null);
  const headingSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) {
          setLocation({
            latitude: Math.round(position.coords.latitude * 100) / 100,
            longitude: Math.round(position.coords.longitude * 100) / 100,
            isDefault: false,
          });
        }
      } catch {
        // uporabimo privzeto lokacijo
      }

      const sub = await Location.watchHeadingAsync((heading) => {
        const deg = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
        setLiveHeading(deg);
        setAccuracy(heading.accuracy);
      });
      if (cancelled) {
        sub.remove();
      } else {
        headingSubscription.current = sub;
      }
    })();

    return () => {
      cancelled = true;
      headingSubscription.current?.remove();
      headingSubscription.current = null;
    };
  }, []);

  const effectiveHeading = manualDeg ?? liveHeading;
  const currentDirection = directionLabel(effectiveHeading);
  const accuracyInfo = accuracyLabel(manualDeg !== null ? null : accuracy);

  const sunAzimuth = (() => {
    try {
      const pos = getPosition(new Date(), location.latitude, location.longitude);
      return pos.azimuth;
    } catch {
      return undefined;
    }
  })();

  const capture = async (source: 'camera' | 'gallery') => {
    setBusy(source);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          source === 'camera' ? 'Dostop do kamere ni dovoljen' : 'Dostop do galerije ni dovoljen',
          source === 'camera'
            ? 'GrowHere potrebuje kamero, da fotografira sobo. Dovoljenje lahko vklopiš v nastavitvah telefona.'
            : 'GrowHere potrebuje dostop do galerije, da lahko izbereš sliko sobe. Dovoljenje lahko vklopiš v nastavitvah telefona.',
          [
            { text: 'Prekliči', style: 'cancel' },
            { text: 'Odpri nastavitve', onPress: () => Linking.openSettings() },
          ]
        );
        setBusy(null);
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: false })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.5, allowsEditing: false });

      if (result.canceled || !result.assets?.[0]) {
        setBusy(null);
        return;
      }

      const lockedDirection = effectiveHeading;
      router.push({
        pathname: '/analiza',
        params: {
          photoUri: result.assets[0].uri,
          direction: String(Math.round(lockedDirection)),
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          locationIsDefault: String(location.isDefault),
        },
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header subtitle="Skeniraj" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBlock}>
          <View style={styles.sensorBadge}>
            <View style={styles.sensorDot} />
            <Text style={styles.sensorBadgeText}>Kompas in lokacija</Text>
          </View>
          <Text style={styles.title}>Kam z rastlino?</Text>
          <Text style={styles.subtitle}>Usmeri telefon proti glavnemu oknu v sobi.</Text>
        </View>

        <View style={styles.dialWrap}>
          <CompassDial headingDeg={effectiveHeading} sunAzimuthDeg={sunAzimuth} />
        </View>

        <Card style={styles.orientationCard}>
          <Text style={styles.orientationLabel}>Zaznana orientacija</Text>
          <Text style={styles.orientationValue}>
            Okno gleda proti:{' '}
            <Text style={styles.orientationValueStrong}>
              {currentDirection.label} ({Math.round(effectiveHeading)}°)
            </Text>
          </Text>
          <View style={styles.accuracyBadge}>
            <View style={[styles.accuracyDot, { backgroundColor: accuracyInfo.color }]} />
            <Text style={styles.accuracyText}>Natančnost kompasa: {accuracyInfo.text}</Text>
          </View>
          {locationDenied && (
            <Text style={styles.locationWarning}>
              Brez dovoljenja za lokacijo uporabljamo privzeto točko (Ljubljana). Smer okna lahko izbereš ročno spodaj.
            </Text>
          )}
        </Card>

        <View style={styles.manualBlock}>
          <View style={styles.manualHeaderRow}>
            <Text style={styles.manualLabel}>Izberi smer okna ročno</Text>
            {manualDeg !== null && (
              <Pressable onPress={() => setManualDeg(null)} accessibilityRole="button" accessibilityLabel="Prekliči ročno izbiro">
                <Text style={styles.manualReset}>Prekliči</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.manualGrid}>
            {DIRECTIONS.map((d) => {
              const selected = manualDeg === d.deg;
              return (
                <Pressable
                  key={d.short}
                  onPress={() => setManualDeg(d.deg)}
                  accessibilityRole="button"
                  accessibilityLabel={`Smer okna: ${d.label}`}
                  accessibilityState={{ selected }}
                  style={[styles.manualChip, selected && styles.manualChipSelected]}
                >
                  <Text style={[styles.manualChipText, selected && styles.manualChipTextSelected]}>{d.short}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Zajemi sliko sobe"
            icon="photo-camera"
            onPress={() => capture('camera')}
            loading={busy === 'camera'}
            disabled={busy !== null}
          />
          <Button
            title="Izberi iz galerije"
            icon="photo-library"
            variant="secondary"
            onPress={() => capture('gallery')}
            loading={busy === 'gallery'}
            disabled={busy !== null}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.margin, paddingBottom: 140, gap: spacing.lg, alignItems: 'center' },
  titleBlock: { alignItems: 'center', gap: 6, paddingHorizontal: spacing.md },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 4,
  },
  sensorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sensorBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.labelSm.fontSize,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: typography.headlineLg.fontSize,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodyMd.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  dialWrap: { paddingVertical: spacing.sm },
  orientationCard: { width: '100%', alignItems: 'center', gap: 4 },
  orientationLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.caption.fontSize,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  orientationValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineSm.fontSize,
    color: colors.ink,
    textAlign: 'center',
  },
  orientationValueStrong: { color: colors.primary, fontFamily: fontFamily.bold },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 6,
  },
  accuracyDot: { width: 8, height: 8, borderRadius: 4 },
  accuracyText: { fontFamily: fontFamily.medium, fontSize: typography.caption.fontSize, color: colors.inkMuted },
  locationWarning: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySm.fontSize,
    color: colors.difficultyDemanding,
    textAlign: 'center',
  },
  manualBlock: { width: '100%', gap: spacing.xs },
  manualHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  manualLabel: { fontFamily: fontFamily.medium, fontSize: typography.caption.fontSize, color: colors.inkMuted },
  manualReset: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.primary },
  manualGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  manualChip: {
    flexBasis: '22%',
    flexGrow: 1,
    height: 48,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  manualChipSelected: { backgroundColor: colors.primary },
  manualChipText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelMd.fontSize, color: colors.ink },
  manualChipTextSelected: { color: colors.onPrimary },
  actions: { width: '100%', gap: spacing.sm, paddingTop: spacing.xs },
});
