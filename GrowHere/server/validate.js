const ZONE_TYPES = ['tla', 'polica', 'okenska polica', 'miza'];

/** Odstrani morebitne ```json ograde in obrobni tekst okoli JSON-a. */
export function stripFences(raw) {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    text = fenced[1].trim();
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

function clamp(value, min, max, fallback) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

// x in y omejimo na 95, da za okvir vedno ostane vsaj 5 % prostora in ni ploskih okvirjev.
const MAX_ORIGIN = 95;

function normalizeBox(box) {
  const x = clamp(box?.x, 0, MAX_ORIGIN, 0);
  const y = clamp(box?.y, 0, MAX_ORIGIN, 0);
  return {
    x,
    y,
    sirina: clamp(box?.sirina, 1, 100 - x, Math.min(10, 100 - x)),
    visina: clamp(box?.visina, 1, 100 - y, Math.min(10, 100 - y)),
  };
}

function normalizeZone(zone) {
  const box = normalizeBox(zone);
  const tip = ZONE_TYPES.includes(zone?.tip) ? zone.tip : 'tla';
  return {
    ...box,
    tip,
    oddaljenostOdOknaM: clamp(zone?.oddaljenostOdOknaM, 0, 15, 1),
    prostorVisinaCm: Math.round(clamp(zone?.prostorVisinaCm, 5, 400, 60)),
    prostorSirinaCm: Math.round(clamp(zone?.prostorSirinaCm, 5, 400, 40)),
  };
}

/**
 * Preveri obliko odgovora in vrednosti omeji na veljavna območja.
 * Vrže napako z jasnim sporočilom, če odgovora ni mogoče uporabiti.
 */
export function validateAnalysis(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Model ni vrnil veljavnega JSON objekta.');
  }

  const rawZones = Array.isArray(parsed.predeli) ? parsed.predeli : [];
  if (rawZones.length === 0) {
    throw new Error('Na sliki ni bilo mogoče najti primernih predelov za rastline.');
  }

  const okna = (Array.isArray(parsed.okna) ? parsed.okna : []).map(normalizeBox);
  const ovire = (Array.isArray(parsed.ovire) ? parsed.ovire : []).map((o) => ({
    tip: typeof o?.tip === 'string' && o.tip.trim() ? o.tip.trim().slice(0, 40) : 'ovira',
    ...normalizeBox(o),
  }));
  const predeli = rawZones.slice(0, 5).map(normalizeZone);

  return { okna, ovire, predeli };
}
