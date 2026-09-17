import { computeSunHours, lightCategory, sunAzimuthDeg } from '@/lib/sun';

// Ljubljana
const LAT = 46.05;
const LON = 14.51;

const NORTH = 0;
const SOUTH = 180;
const EAST = 90;
const WEST = 270;

function angularDiff(a: number, b: number) {
  return Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
}

describe('computeSunHours', () => {
  it('daje južnemu oknu pozimi več sonca kot severnemu', () => {
    const south = computeSunHours(LAT, LON, SOUTH);
    const north = computeSunHours(LAT, LON, NORTH);

    expect(south.winterHours).toBeGreaterThan(north.winterHours);
  });

  it('severno okno pozimi ne dobi skoraj nič neposrednega sonca', () => {
    const north = computeSunHours(LAT, LON, NORTH);
    expect(north.winterHours).toBeLessThan(0.5);
  });

  it('vzhodno in zahodno okno imata poleti podobno skupno število ur sonca', () => {
    const east = computeSunHours(LAT, LON, EAST);
    const west = computeSunHours(LAT, LON, WEST);

    expect(east.summerHours).toBeGreaterThan(0);
    expect(west.summerHours).toBeGreaterThan(0);
    expect(Math.abs(east.summerHours - west.summerHours)).toBeLessThan(1.5);
  });
});

describe('sunAzimuthDeg', () => {
  it('zahodno okno dobi sonce popoldne, ne zjutraj', () => {
    const year = new Date().getUTCFullYear();
    const morning = new Date(Date.UTC(year, 5, 21, 6, 0, 0)); // ~08:00 lokalno
    const afternoon = new Date(Date.UTC(year, 5, 21, 16, 0, 0)); // ~18:00 lokalno

    const morningAzimuth = sunAzimuthDeg(morning, LAT, LON);
    const afternoonAzimuth = sunAzimuthDeg(afternoon, LAT, LON);

    expect(angularDiff(afternoonAzimuth, WEST)).toBeLessThan(75);
    expect(angularDiff(morningAzimuth, WEST)).toBeGreaterThan(90);
  });

  it('vzhodno okno dobi sonce zjutraj, ne popoldne', () => {
    const year = new Date().getUTCFullYear();
    const morning = new Date(Date.UTC(year, 5, 21, 6, 0, 0));
    const afternoon = new Date(Date.UTC(year, 5, 21, 16, 0, 0));

    const morningAzimuth = sunAzimuthDeg(morning, LAT, LON);
    const afternoonAzimuth = sunAzimuthDeg(afternoon, LAT, LON);

    expect(angularDiff(morningAzimuth, EAST)).toBeLessThan(75);
    expect(angularDiff(afternoonAzimuth, EAST)).toBeGreaterThan(90);
  });
});

describe('lightCategory', () => {
  it('severno okno blizu je svetlo, daleč pa malo svetlobe', () => {
    expect(lightCategory(0.5, 0.8)).toBe('svetlo');
    expect(lightCategory(0.5, 3)).toBe('malo');
  });

  it('južno okno blizu z veliko ur sonca je direktno', () => {
    expect(lightCategory(5, 0.5)).toBe('direktno');
  });

  it('okno daleč od predela je vedno malo svetlobe', () => {
    expect(lightCategory(5, 4)).toBe('malo');
  });
});
