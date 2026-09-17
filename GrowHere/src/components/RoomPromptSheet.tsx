import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { colors, fontFamily, radius, spacing, typography } from '@/theme';

const SUGGESTIONS = ['Dnevna soba', 'Spalnica', 'Kuhinja', 'Kopalnica', 'Pisarna', 'Hodnik'];

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (room: string) => void;
};

export function RoomPromptSheet({ visible, onCancel, onConfirm }: Props) {
  const [room, setRoom] = useState('');

  const handleConfirm = () => {
    const trimmed = room.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setRoom('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Zapri" />
        <View style={styles.sheet}>
          <Text style={styles.title}>V kateri prostor gre rastlina?</Text>
          <TextInput
            value={room}
            onChangeText={setRoom}
            placeholder="npr. Dnevna soba"
            placeholderTextColor={colors.outline}
            style={styles.input}
            accessibilityLabel="Ime prostora"
            autoFocus
          />
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} selected={room === s} onPress={() => setRoom(s)} />
            ))}
          </View>
          <View style={styles.actions}>
            <Button title="Prekliči" variant="ghost" onPress={onCancel} style={styles.actionButton} />
            <Button title="Shrani" onPress={handleConfirm} disabled={!room.trim()} style={styles.actionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 42, 33, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: typography.headlineSm.fontSize,
    color: colors.ink,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: typography.bodyMd.fontSize,
    color: colors.ink,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
