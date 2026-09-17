import { Image } from 'react-native';

import { DEMO, SERVER_URL } from '@/config';
import { Light } from '@/data/plants';
import { classifyLight, SunHours } from '@/lib/sun';

export type ZoneType = 'tla' | 'polica' | 'okenska polica' | 'miza';

export type RawZone = {
  x: number;
  y: number;
  sirina: number;
  visina: number;
  tip: ZoneType;
  oddaljenostOdOknaM: number;
  prostorVisinaCm: number;
  prostorSirinaCm: number;
};

export type WindowBox = { x: number; y: number; sirina: number; visina: number };
export type ObstacleBox = { tip: string; x: number; y: number; sirina: number; visina: number };

export type RawAnalysisResult = {
  okna: WindowBox[];
  ovire: ObstacleBox[];
  predeli: RawZone[];
};

export type Zone = RawZone & {
  id: string;
  index: number;
  opis: string;
  svetloba: Light;
  sunHours: SunHours;
};

const ZONE_TYPE_LABEL: Record<ZoneType, string> = {
  tla: 'Tla',
  polica: 'Polica',
  'okenska polica': 'Okenska polica',
  miza: 'Miza',
};

const DEMO_ZONES: RawZone[] = [
  {
    x: 4,
    y: 40,
    sirina: 18,
    visina: 50,
    tip: 'tla',
    oddaljenostOdOknaM: 0.3,
    prostorVisinaCm: 180,
    prostorSirinaCm: 70,
  },
  {
    x: 2,
    y: 8,
    sirina: 40,
    visina: 12,
    tip: 'okenska polica',
    oddaljenostOdOknaM: 0.1,
    prostorVisinaCm: 30,
    prostorSirinaCm: 80,
  },
  {
    x: 80,
    y: 22,
    sirina: 19,
    visina: 58,
    tip: 'polica',
    oddaljenostOdOknaM: 3,
    prostorVisinaCm: 35,
    prostorSirinaCm: 45,
  },
];

function formatDistance(m: number) {
  return m.toLocaleString('sl-SI', { minimumFractionDigits: m % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 });
}

function enrichZones(rawZones: RawZone[], latitude: number, longitude: number, windowDeg: number): Zone[] {
  return rawZones.map((zone, index) => {
    const { light, sunHours } = classifyLight(latitude, longitude, windowDeg, zone.oddaljenostOdOknaM);
    return {
      ...zone,
      id: `predel-${index + 1}`,
      index: index + 1,
      opis: `${ZONE_TYPE_LABEL[zone.tip]}, ${formatDistance(zone.oddaljenostOdOknaM)} m od okna`,
      svetloba: light,
      sunHours,
    };
  });
}

export type AnalyzeInput = {
  photoUri: string;
  windowDeg: number;
  latitude: number;
  longitude: number;
};

export type AnalyzeError = { message: string };

export async function analyzeRoom(input: AnalyzeInput): Promise<Zone[]> {
  if (DEMO) {
    await new Promise((resolve) => setTimeout(resolve, 2200));
    return enrichZones(DEMO_ZONES, input.latitude, input.longitude, input.windowDeg);
  }

  let response: Response;
  try {
    const base64 = await encodePhotoAsBase64(input.photoUri);
    response = await fetch(`${SERVER_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
  } catch {
    throw new Error('Ni povezave s strežnikom. Preveri, ali strežnik teče in ali je SERVER_URL pravilen.');
  }

  if (!response.ok) {
    let message = 'Strežnik ni uspel analizirati slike.';
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // obdrži privzeto sporočilo
    }
    throw new Error(message);
  }

  const result = (await response.json()) as RawAnalysisResult;
  return enrichZones(result.predeli, input.latitude, input.longitude, input.windowDeg);
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

const MAX_LONG_SIDE = 1600;

async function encodePhotoAsBase64(uri: string): Promise<string> {
  const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
  const { width, height } = await getImageSize(uri);
  const resize = width >= height ? { width: Math.min(width, MAX_LONG_SIDE) } : { height: Math.min(height, MAX_LONG_SIDE) };

  const manipulated = await manipulateAsync(uri, [{ resize }], {
    compress: 0.5,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!manipulated.base64) {
    throw new Error('Slike ni bilo mogoče pripraviti za pošiljanje.');
  }
  return manipulated.base64;
}
