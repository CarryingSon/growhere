import { getPosition } from 'suncalc';

import { Light } from '@/data/plants';

export type WindowOrientationDeg = number;

const MINUTES_STEP = 15;

/** Azimut sonca v stopinjah (0 = S, 90 = V, 180 = J, 270 = Z) ob danem trenutku in lokaciji. */
export function sunAzimuthDeg(date: Date, latitude: number, longitude: number): number {
  return getPosition(date, latitude, longitude).azimuth;
}

/**
 * Ure neposrednega sonca za en koledarski dan na dani lokaciji in usmerjenosti okna.
 * Sonce šteje kot "direktno" na okno, ko je nad 5° in pod 75° višine, razlika med
 * azimutom sonca in smerjo okna pa je manjša od 75° (suncalc 2.x: stopinje, azimut
 * merjen od severa v smeri urinega kazalca).
 */
export function directSunHoursForDay(
  date: Date,
  latitude: number,
  longitude: number,
  windowDeg: WindowOrientationDeg
): number {
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  let matchingSteps = 0;
  const totalStepsPerDay = (24 * 60) / MINUTES_STEP;

  for (let step = 0; step < totalStepsPerDay; step++) {
    const t = new Date(dayStart.getTime() + step * MINUTES_STEP * 60 * 1000);
    const { altitude, azimuth } = getPosition(t, latitude, longitude);

    if (altitude <= 5 || altitude >= 75) continue;

    const diff = Math.min(Math.abs(azimuth - windowDeg), 360 - Math.abs(azimuth - windowDeg));
    if (diff < 75) {
      matchingSteps++;
    }
  }

  return (matchingSteps * MINUTES_STEP) / 60;
}

export type SunHours = {
  summerHours: number;
  winterHours: number;
  averageHours: number;
};

/** Ure sonca za poletni (21. junij) in zimski (21. december) solsticij tekočega leta. */
export function computeSunHours(latitude: number, longitude: number, windowDeg: WindowOrientationDeg): SunHours {
  const year = new Date().getUTCFullYear();
  const summer = new Date(Date.UTC(year, 5, 21));
  const winter = new Date(Date.UTC(year, 11, 21));

  const summerHours = directSunHoursForDay(summer, latitude, longitude, windowDeg);
  const winterHours = directSunHoursForDay(winter, latitude, longitude, windowDeg);

  return {
    summerHours,
    winterHours,
    averageHours: (summerHours + winterHours) / 2,
  };
}

/** Ali je okno "severno" (ne dobi neposrednega sonca) za namen kategorizacije svetlobe. */
function isNorthFacingByHours(averageHours: number) {
  return averageHours < 1;
}

/**
 * Kategorija svetlobe glede na povprečno število ur sonca (poletje+zima)/2 in
 * oddaljenost predela od okna v metrih.
 */
export function lightCategory(averageHours: number, distanceFromWindowM: number): Light {
  if (isNorthFacingByHours(averageHours)) {
    if (distanceFromWindowM <= 1) return 'svetlo';
    if (distanceFromWindowM <= 2) return 'srednje';
    return 'malo';
  }

  if (distanceFromWindowM <= 1 && averageHours >= 3) return 'direktno';
  if (distanceFromWindowM <= 1.5) return 'svetlo';
  if (distanceFromWindowM <= 2.5 && averageHours >= 3) return 'svetlo';
  if (distanceFromWindowM <= 3.5) return 'srednje';
  return 'malo';
}

export function classifyLight(
  latitude: number,
  longitude: number,
  windowDeg: WindowOrientationDeg,
  distanceFromWindowM: number
): { light: Light; sunHours: SunHours } {
  const sunHours = computeSunHours(latitude, longitude, windowDeg);
  return { light: lightCategory(sunHours.averageHours, distanceFromWindowM), sunHours };
}
