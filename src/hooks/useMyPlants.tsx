import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Plant, PLANTS } from '@/data/plants';
import {
  cancelWateringReminder,
  hasSeasonChanged,
  recordCurrentSeason,
  requestNotificationPermission,
  scheduleWateringReminder,
} from '@/lib/notifications';
import { getMyPlants, MyPlant, setMyPlants as saveMyPlants } from '@/lib/storage';

type AddInput = {
  plant: Plant;
  prostor: string;
  predel?: string;
  remindersEnabled: boolean;
};

type MyPlantsValue = {
  myPlants: MyPlant[];
  loaded: boolean;
  addPlant: (input: AddInput) => Promise<MyPlant>;
  removePlant: (id: string) => void;
  setReminders: (id: string, plant: Plant, enabled: boolean) => Promise<boolean>;
  markWatered: (id: string, plant: Plant) => Promise<void>;
  clearAll: () => void;
  hasPlant: (plantId: string) => boolean;
};

const MyPlantsContext = createContext<MyPlantsValue | null>(null);

export function MyPlantsProvider({ children }: { children: ReactNode }) {
  const [myPlants, setMyPlantsState] = useState<MyPlant[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Zadnje stanje je v ref, da async akcije vedno berejo svež seznam, ne zamrznjenega iz closure.
  const latest = useRef<MyPlant[]>([]);

  const commit = useCallback((next: MyPlant[]) => {
    latest.current = next;
    setMyPlantsState(next);
    saveMyPlants(next);
  }, []);

  useEffect(() => {
    let mounted = true;
    getMyPlants().then((items) => {
      if (!mounted) return;
      latest.current = items;
      setMyPlantsState(items);
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Ob zagonu: če se je letni čas zamenjal, opomnike nastavimo znova z novim intervalom.
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;

    (async () => {
      const changed = await hasSeasonChanged();
      if (changed && !cancelled) {
        const byId = new Map(PLANTS.map((p) => [p.id, p]));
        const next: MyPlant[] = [];
        for (const entry of latest.current) {
          if (!entry.remindersEnabled) {
            next.push(entry);
            continue;
          }
          const plant = byId.get(entry.plantId);
          if (!plant) {
            next.push(entry);
            continue;
          }
          await cancelWateringReminder(entry.notificationId);
          const notificationId = await scheduleWateringReminder(plant);
          next.push({ ...entry, notificationId });
        }
        if (!cancelled) commit(next);
      }
      await recordCurrentSeason();
    })();

    return () => {
      cancelled = true;
    };
  }, [loaded, commit]);

  const addPlant = useCallback(
    async (input: AddInput): Promise<MyPlant> => {
      let remindersEnabled = input.remindersEnabled;
      let notificationId: string | undefined;

      if (remindersEnabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
          notificationId = await scheduleWateringReminder(input.plant);
        } else {
          remindersEnabled = false;
        }
      }

      const entry: MyPlant = {
        id: `${input.plant.id}-${Date.now()}`,
        plantId: input.plant.id,
        prostor: input.prostor,
        predel: input.predel,
        remindersEnabled,
        notificationId,
        addedAt: new Date().toISOString(),
      };

      commit([...latest.current, entry]);
      return entry;
    },
    [commit]
  );

  const removePlant = useCallback(
    (id: string) => {
      const target = latest.current.find((p) => p.id === id);
      if (target?.notificationId) {
        cancelWateringReminder(target.notificationId);
      }
      commit(latest.current.filter((p) => p.id !== id));
    },
    [commit]
  );

  const patch = useCallback(
    (id: string, changes: Partial<MyPlant>) => {
      commit(latest.current.map((p) => (p.id === id ? { ...p, ...changes } : p)));
    },
    [commit]
  );

  /** Vklopi/izklopi opomnike. Vrne false, če je uporabnik zavrnil dovoljenje za obvestila. */
  const setReminders = useCallback(
    async (id: string, plant: Plant, enabled: boolean): Promise<boolean> => {
      const entry = latest.current.find((p) => p.id === id);
      if (!entry) return false;

      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) return false;
        const notificationId = await scheduleWateringReminder(plant);
        patch(id, { remindersEnabled: true, notificationId });
        return true;
      }

      await cancelWateringReminder(entry.notificationId);
      patch(id, { remindersEnabled: false, notificationId: undefined });
      return true;
    },
    [patch]
  );

  const markWatered = useCallback(
    async (id: string, plant: Plant) => {
      const entry = latest.current.find((p) => p.id === id);
      if (!entry) return;

      let notificationId = entry.notificationId;
      if (entry.remindersEnabled) {
        await cancelWateringReminder(entry.notificationId);
        notificationId = await scheduleWateringReminder(plant);
      }
      patch(id, { lastWatered: new Date().toISOString(), notificationId });
    },
    [patch]
  );

  const clearAll = useCallback(() => {
    for (const entry of latest.current) {
      cancelWateringReminder(entry.notificationId);
    }
    commit([]);
  }, [commit]);

  const hasPlant = useCallback((plantId: string) => myPlants.some((p) => p.plantId === plantId), [myPlants]);

  return (
    <MyPlantsContext.Provider
      value={{ myPlants, loaded, addPlant, removePlant, setReminders, markWatered, clearAll, hasPlant }}
    >
      {children}
    </MyPlantsContext.Provider>
  );
}

export function useMyPlants(): MyPlantsValue {
  const value = useContext(MyPlantsContext);
  if (!value) {
    throw new Error('useMyPlants je treba uporabiti znotraj MyPlantsProvider.');
  }
  return value;
}
