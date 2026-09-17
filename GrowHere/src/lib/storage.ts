import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  favorites: 'growhere:favorites',
  myPlants: 'growhere:my-plants',
  settings: 'growhere:settings',
  lastSeason: 'growhere:last-season',
} as const;

export type Season = 'poletje' | 'zima';

export type MyPlant = {
  id: string;
  plantId: string;
  prostor: string;
  predel?: string;
  remindersEnabled: boolean;
  notificationId?: string;
  lastWatered?: string;
  addedAt: string;
};

export type Settings = {
  reminderHour: number;
  reminderMinute: number;
};

export const DEFAULT_SETTINGS: Settings = { reminderHour: 9, reminderMinute: 0 };

export async function getFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.favorites);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setFavorites(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(ids));
  } catch {
    // shranjevanje ni uspelo, uporabnik nadaljuje brez trajne persistence
  }
}

export async function getMyPlants(): Promise<MyPlant[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.myPlants);
    return raw ? (JSON.parse(raw) as MyPlant[]) : [];
  } catch {
    return [];
  }
}

export async function setMyPlants(plants: MyPlant[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.myPlants, JSON.stringify(plants));
  } catch {
    // shranjevanje ni uspelo, uporabnik nadaljuje brez trajne persistence
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch {
    // shranjevanje ni uspelo
  }
}

export async function getLastSeason(): Promise<Season | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.lastSeason);
    return raw === 'poletje' || raw === 'zima' ? raw : null;
  } catch {
    return null;
  }
}

export async function setLastSeason(season: Season): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.lastSeason, season);
  } catch {
    // shranjevanje ni uspelo
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.favorites, KEYS.myPlants, KEYS.settings, KEYS.lastSeason]);
  } catch {
    // brisanje ni uspelo
  }
}
