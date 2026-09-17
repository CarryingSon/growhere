import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DEMO } from '@/config';
import { analyzeRoom, Zone } from '@/lib/roomAnalysis';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const demoRoomImage = require('../../assets/plants/demo-room.png');

type Status = 'loading' | 'error';

export default function AnalizaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    photoUri: string;
    direction: string;
    latitude: string;
    longitude: string;
    locationIsDefault: string;
  }>();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress] = useState(() => new Animated.Value(0));
  const [progressPercent, setProgressPercent] = useState(8);

  const windowDeg = Number(params.direction ?? '0');
  const latitude = Number(params.latitude ?? '46.05');
  const longitude = Number(params.longitude ?? '14.51');

  useEffect(() => {
    const listenerId = progress.addListener(({ value }) => setProgressPercent(Math.round(value)));
    return () => progress.removeListener(listenerId);
  }, [progress]);

  const runAnalysis = () => {
    setStatus('loading');
    setErrorMessage('');
    progress.setValue(8);
    Animated.timing(progress, {
      toValue: 92,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    analyzeRoom({ photoUri: params.photoUri ?? '', windowDeg, latitude, longitude })
      .then((zones: Zone[]) => {
        Animated.timing(progress, { toValue: 100, duration: 200, useNativeDriver: false }).start(() => {
          router.replace({
            pathname: '/rezultat',
            params: {
              photoUri: params.photoUri ?? '',
              zones: JSON.stringify(zones),
            },
          });
        });
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Prišlo je do nepričakovane napake.');
      });
  };

  useEffect(() => {
    const timeoutId = setTimeout(runAnalysis, 0);
    return () => {
      clearTimeout(timeoutId);
      progress.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backgroundSource = DEMO || !params.photoUri ? demoRoomImage : { uri: params.photoUri };

  if (status === 'error') {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="cloud-off" size={40} color={colors.difficultyDemanding} />
        <Text style={styles.errorTitle}>Analiza ni uspela</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <View style={styles.errorActions}>
          <Button title="Poskusi znova" onPress={runAnalysis} icon="refresh" style={styles.errorButton} />
          <Button title="Nazaj" variant="secondary" onPress={() => router.back()} style={styles.errorButton} />
        </View>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundSource} style={styles.background} blurRadius={6}>
      <View style={styles.scrim} />
      <View style={styles.content}>
        <View style={styles.hudRow}>
          <View style={styles.hudPill}>
            <View style={styles.hudDot} />
            <Text style={styles.hudPillText}>Analiza v teku</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SunArc progress={progress} />
          <Text style={styles.headline}>Iščem najboljša mesta za rastline …</Text>
          <Text style={styles.subtext}>Ocenjujem, koliko sonca dobi vsak del prostora.</Text>

          <View style={styles.statusList}>
            <StatusRow label="Zaznavanje oken …" done={progressPercent > 35} />
            <StatusRow label="Izračun svetlobnih con …" done={progressPercent > 75} active={progressPercent <= 75} />
          </View>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footerRow}>
          <FooterFact icon="compass-calibration" label="Orientacija" value={directionShortLabel(windowDeg)} />
          <FooterFact
            icon="thermostat"
            label="Lokacija"
            value={`${latitude.toFixed(2)}° S, ${longitude.toFixed(2)}° V`}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

function directionShortLabel(deg: number) {
  const dirs = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ'];
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return dirs[index];
}

function StatusRow({ label, done, active }: { label: string; done: boolean; active?: boolean }) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusLabelRow}>
        <MaterialIcons
          name={done ? 'check-circle' : 'sync'}
          size={18}
          color={done ? colors.secondaryContainer : colors.primary}
        />
        <Text style={styles.statusLabel}>{label}</Text>
      </View>
      {!done && active && <View style={styles.statusPulse} />}
    </View>
  );
}

function FooterFact({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.factCard}>
      <View style={styles.factIconWrap}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.factTextWrap}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SunArc({ progress }: { progress: Animated.Value }) {
  const translateX = progress.interpolate({ inputRange: [0, 100], outputRange: [-70, 70] });
  const translateY = progress.interpolate({ inputRange: [0, 50, 100], outputRange: [10, -30, 10] });
  return (
    <View style={styles.arcWrap}>
      <View style={styles.arcLine} />
      <Animated.View style={[styles.sunDot, { transform: [{ translateX }, { translateY }] }]}>
        <MaterialIcons name="wb-sunny" size={20} color={colors.onSecondaryContainer} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.primary },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(21, 67, 38, 0.72)' },
  content: { flex: 1, padding: spacing.margin, justifyContent: 'space-between' },
  hudRow: { flexDirection: 'row', paddingTop: spacing.lg },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  hudDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondaryContainer },
  hudPillText: { fontFamily: fontFamily.semiBold, fontSize: typography.labelSm.fontSize, color: colors.primary },
  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  arcWrap: { width: 180, height: 90, alignItems: 'center', justifyContent: 'flex-end', marginBottom: spacing.sm },
  arcLine: {
    position: 'absolute',
    bottom: 8,
    width: 160,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  sunDot: {
    position: 'absolute',
    bottom: 30,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineMd.fontSize,
    color: colors.primary,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySm.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  statusList: { width: '100%', gap: 8, marginTop: spacing.md },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm + 4,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  statusLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel: { fontFamily: fontFamily.medium, fontSize: typography.labelMd.fontSize, color: colors.ink },
  statusPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondaryContainer },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHighest,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  footerRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.lg },
  factCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.sm + 4,
    padding: spacing.sm + 4,
  },
  factIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factTextWrap: { flexShrink: 1 },
  factLabel: { fontFamily: fontFamily.regular, fontSize: typography.caption.fontSize, color: colors.inkMuted },
  factValue: { fontFamily: fontFamily.semiBold, fontSize: typography.labelMd.fontSize, color: colors.ink },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  errorTitle: { fontFamily: fontFamily.semiBold, fontSize: typography.headlineSm.fontSize, color: colors.ink },
  errorText: { fontFamily: fontFamily.regular, fontSize: typography.bodyMd.fontSize, color: colors.inkMuted, textAlign: 'center' },
  errorActions: { width: '100%', gap: spacing.sm, marginTop: spacing.md },
  errorButton: { width: '100%' },
});
