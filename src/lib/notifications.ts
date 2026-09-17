import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Plant } from '@/data/plants';
import { getLastSeason, Season, setLastSeason } from '@/lib/storage';

const CHANNEL_ID = 'opomniki-zalivanje';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelReady = false;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Opomniki za zalivanje',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelReady = true;
}

/** Zahteva dovoljenje za obvestila, če še ni bilo podeljeno. Vrne true, če je dovoljeno. */
export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export function currentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1;
  return month >= 4 && month <= 9 ? 'poletje' : 'zima';
}

export function wateringIntervalDays(plant: Plant, date: Date = new Date()): number {
  return currentSeason(date) === 'poletje' ? plant.zalivanjeDniPoleti : plant.zalivanjeDniPozimi;
}

/** Nastavi ponavljajoč opomnik za zalivanje glede na trenutni letni čas rastline. */
export async function scheduleWateringReminder(plant: Plant): Promise<string> {
  await ensureAndroidChannel();
  const days = Math.max(1, wateringIntervalDays(plant));
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Čas za zalivanje',
      body: `${plant.imeSlo}: ${plant.zalivanjeOpis}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: days * 24 * 60 * 60,
      repeats: true,
    },
  });
}

export async function cancelWateringReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // opomnik je bil morda že preklican
  }
}

/** Ob zagonu aplikacije preveri, ali se je letni čas (poletje/zima) zamenjal od zadnjega zagona. */
export async function hasSeasonChanged(): Promise<boolean> {
  const last = await getLastSeason();
  return last !== null && last !== currentSeason();
}

export async function recordCurrentSeason(): Promise<void> {
  await setLastSeason(currentSeason());
}
