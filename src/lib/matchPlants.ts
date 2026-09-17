import { Difficulty, Light, Plant } from '@/data/plants';

export type PlantFitStatus = 'fits' | 'outgrows';

export type MatchedPlant = {
  plant: Plant;
  status: PlantFitStatus;
};

export type ZoneSpace = {
  visinaCm: number;
  sirinaCm: number;
};

const YOUNG_PLANT_RATIO = 0.4;

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  enostavna: 0,
  srednja: 1,
  zahtevna: 2,
};

function fitsSpace(heightCm: number, widthCm: number, space: ZoneSpace): boolean {
  return heightCm <= space.visinaCm && widthCm <= space.sirinaCm;
}

function statusForPlant(plant: Plant, space: ZoneSpace): PlantFitStatus | null {
  if (fitsSpace(plant.visinaMaxCm, plant.sirinaMaxCm, space)) {
    return 'fits';
  }
  const youngHeight = plant.visinaMaxCm * YOUNG_PLANT_RATIO;
  const youngWidth = plant.sirinaMaxCm * YOUNG_PLANT_RATIO;
  if (fitsSpace(youngHeight, youngWidth, space)) {
    return 'outgrows';
  }
  return null;
}

/**
 * Rastline, ki ustrezajo svetlobi predela in prostoru. Razvrščene: najprej tiste, ki
 * pašejo v prostor, nato po zahtevnosti (enostavna → zahtevna).
 */
export function matchPlants(plants: Plant[], light: Light, space: ZoneSpace): MatchedPlant[] {
  const matched: MatchedPlant[] = [];

  for (const plant of plants) {
    if (!plant.svetloba.includes(light)) continue;
    const status = statusForPlant(plant, space);
    if (!status) continue;
    matched.push({ plant, status });
  }

  return matched.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'fits' ? -1 : 1;
    }
    return DIFFICULTY_RANK[a.plant.zahtevnost] - DIFFICULTY_RANK[b.plant.zahtevnost];
  });
}
