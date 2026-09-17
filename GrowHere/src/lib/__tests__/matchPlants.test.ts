import { Plant } from '@/data/plants';
import { matchPlants } from '@/lib/matchPlants';

function makePlant(overrides: Partial<Plant> & Pick<Plant, 'id'>): Plant {
  return {
    imeSlo: overrides.id,
    imeLat: overrides.id,
    svetloba: ['svetlo'],
    zahtevnost: 'enostavna',
    visinaMaxCm: 50,
    sirinaMaxCm: 50,
    zalivanjeDniPoleti: 7,
    zalivanjeDniPozimi: 14,
    zalivanjeOpis: '',
    zemlja: '',
    oznakaZemlje: '',
    strupena: { pes: false, macka: false, otroci: false },
    ...overrides,
  };
}

describe('matchPlants', () => {
  it('izloči rastline, ki ne prenesejo svetlobe predela', () => {
    const plant = makePlant({ id: 'a', svetloba: ['direktno'] });
    const result = matchPlants([plant], 'malo', { visinaCm: 200, sirinaCm: 200 });
    expect(result).toHaveLength(0);
  });

  it('rastlina, ki pase v prostor kot odrasla, dobi status fits', () => {
    const plant = makePlant({ id: 'a', visinaMaxCm: 60, sirinaMaxCm: 40, svetloba: ['svetlo'] });
    const result = matchPlants([plant], 'svetlo', { visinaCm: 100, sirinaCm: 100 });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('fits');
  });

  it('rastlina, ki pase le kot mlada (40% odrasle velikosti), dobi status outgrows', () => {
    // odrasla 200x150 ne gre v 100x100, mlada (40%) je 80x60, gre
    const plant = makePlant({ id: 'a', visinaMaxCm: 200, sirinaMaxCm: 150, svetloba: ['svetlo'] });
    const result = matchPlants([plant], 'svetlo', { visinaCm: 100, sirinaCm: 100 });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('outgrows');
  });

  it('rastlina, ki ne gre v prostor niti kot mlada, se ne prikaže', () => {
    const plant = makePlant({ id: 'a', visinaMaxCm: 500, sirinaMaxCm: 500, svetloba: ['svetlo'] });
    const result = matchPlants([plant], 'svetlo', { visinaCm: 100, sirinaCm: 100 });
    expect(result).toHaveLength(0);
  });

  it('razvrsti najprej fits pred outgrows, znotraj tega po zahtevnosti', () => {
    const fitsHard = makePlant({ id: 'fits-hard', visinaMaxCm: 50, sirinaMaxCm: 50, zahtevnost: 'zahtevna' });
    const fitsEasy = makePlant({ id: 'fits-easy', visinaMaxCm: 50, sirinaMaxCm: 50, zahtevnost: 'enostavna' });
    const outgrows = makePlant({ id: 'outgrows', visinaMaxCm: 200, sirinaMaxCm: 150, zahtevnost: 'enostavna' });

    const result = matchPlants([fitsHard, outgrows, fitsEasy], 'svetlo', { visinaCm: 100, sirinaCm: 100 });

    expect(result.map((r) => r.plant.id)).toEqual(['fits-easy', 'fits-hard', 'outgrows']);
  });
});
