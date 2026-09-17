# GrowHere

Mobilna aplikacija (iOS in Android), ki pomaga najti najboljše mesto za sobne rastline v sobi.
Uporabnik usmeri telefon proti oknu, zajame sliko sobe, aplikacija pa iz smeri okna in lokacije
izračuna, koliko sonca dobijo posamezni predeli, ter predlaga rastline, ki tja pašejo.

Zgrajeno z Expo (SDK 57), React Native in TypeScriptom. Vmesnik je v slovenščini.

## Zahteve

- Node.js 20+ (razvito na 24 LTS)
- Telefon z aplikacijo **Expo Go** ali emulator
- Za pravo analizo slike še: ključ za Claude API (samo na strežniku)

## Zagon aplikacije

```bash
npm install
npx expo start
```

Skeniraj QR kodo z Expo Go. Aplikacija privzeto teče v **demo načinu** (`DEMO = true` v `src/config.ts`) —
analiza ne kliče strežnika, ampak uporabi testno sliko sobe in tri pripravljene predele. Izračun sonca je
pri tem pravi: uporabi smer okna in lokacijo, ki ju zajameš na zaslonu Skeniraj.

Koristni ukazi:

```bash
npm run typecheck   # npx tsc --noEmit
npm test            # enotski testi za sun.ts in matchPlants.ts
npm run android     # zagon na priključenem Androidu
npm run ios         # zagon na iOS (potreben macOS)
```

## Zagon strežnika (prava analiza slike)

Strežnik je potreben samo, kadar želiš, da sliko sobe dejansko analizira Claude. API ključ je vedno
le na strežniku — aplikacija ga nikoli ne vsebuje.

```bash
cd server
cp .env.example .env     # v Windows PowerShell: Copy-Item .env.example .env
# v .env vpiši ANTHROPIC_API_KEY
npm install
npm start
```

Strežnik posluša na vratih `3001`. Nato v `src/config.ts`:

1. nastavi `DEMO = false`,
2. `SERVER_URL` nastavi na **lokalni IP računalnika**, npr. `http://192.168.1.42:3001`.

IP dobiš z `ipconfig` (Windows) ali `ifconfig` / `ipconfig getifaddr en0` (macOS/Linux). `localhost`
ne deluje, ker na telefonu kaže na telefon sam. Telefon in računalnik morata biti na istem omrežju.

Preveri, da strežnik teče:

```bash
curl http://localhost:3001/health   # -> {"ok":true}
```

## Dovoljenja

| Dovoljenje | Kdaj se zahteva | Zakaj |
|---|---|---|
| Lokacija | ob odprtju zaslona Skeniraj | izračun poti sonca in kompas |
| Kamera | ob "Zajemi sliko sobe" | fotografija sobe |
| Galerija | ob "Izberi iz galerije" | izbira obstoječe slike |
| Obvestila | šele ob prvem vklopu stikala za opomnike | opomniki za zalivanje |

Če uporabnik zavrne lokacijo, aplikacija to jasno pove, uporabi privzeto točko (Ljubljana) in
ponudi ročno izbiro smeri okna. Če zavrne obvestila, se stikalo vrne v izklop in prikaže se
navodilo za vklop v nastavitvah telefona.

**Razvojni build ni potreben.** GrowHere uporablja samo lokalna obvestila, ta pa v Expo Go delujejo.
Razvojni build bi potreboval šele push (oddaljena) obvestila, ki jih aplikacija ne uporablja.

## Struktura

```
src/
  app/                 zasloni (expo-router)
    (tabs)/            moje-rastline, skeniraj, katalog
    analiza.tsx        nalaganje in analiza slike
    rezultat.tsx       predeli na sliki + primerne rastline
    rastlina/[id].tsx  podrobnosti rastline
    nastavitve.tsx     ura opomnikov, vir podatkov, izbris podatkov
  components/          Button, Chip, Card, DifficultyBadge, LightBadge,
                       PlantCard, PlantPhoto, CompassDial, Header, TabBar, Logo ...
  data/plants.ts       baza 16 rastlin
  hooks/               MyPlantsProvider (skupno stanje), useFavorites
  lib/
    sun.ts             ure sonca in kategorija svetlobe (suncalc)
    matchPlants.ts     ujemanje rastlin s predelom
    roomAnalysis.ts    demo predeli ali klic strežnika
    notifications.ts   lokalni opomniki za zalivanje
    storage.ts         AsyncStorage
  theme.ts             barve, tipografija, razmiki, sence (iz design/)
server/                Node + Express + Claude API (ločen projekt)
design/                izvoz iz Google Stitch (vir resnice za videz)
```

## Kako deluje izračun svetlobe

`src/lib/sun.ts` vsak dan razdeli na 15-minutne korake in za 21. junij ter 21. december prešteje,
kdaj je sonce nad 5° in pod 75° višine ter hkrati manj kot 75° stran od smeri okna. Iz povprečja
poletnih in zimskih ur ter oddaljenosti predela od okna določi kategorijo: *direktno sonce*,
*svetlo posredno*, *srednja svetloba* ali *malo svetlobe*.

`src/lib/matchPlants.ts` nato izbere rastline, ki prenesejo to svetlobo in pašejo v prostor predela
(odrasla velikost → "Pase v prostor", 40 % velikosti → "Sčasoma bo prevelika"), ter jih razvrsti po
ustreznosti in zahtevnosti.

Opomba: `suncalc` 2.x vrača kote v **stopinjah**, azimut pa merjen od severa v smeri urinega kazalca
(0 = S, 90 = V, 180 = J, 270 = Z). Starejša različica 1.x je vračala radiane od juga.

## Zasebnost

Vsi podatki ostanejo na telefonu (AsyncStorage): shranjene rastline, priljubljene in nastavitve.
Slik sob in natančne lokacije aplikacija ne shranjuje; lokacija se pred uporabo zaokroži na
2 decimalki. Ko je `DEMO = false`, se slika pošlje strežniku samo za analizo in se ne hrani.

Podatki o strupenosti rastlin so informativni. Pred objavo jih preveri v uradnem viru
(npr. seznam strupenih rastlin ASPCA).

## Znane omejitve

- Ikona in zaslon ob zagonu uporabljata logotip iz `design/` v nizki ločljivosti (120 × 120) —
  pred objavo dodaj kvalitetnejši izvoz (1024 × 1024).
- Fotografijo ima le monstera; ostale rastline prikažejo nadomestno ikono v `PlantPhoto`.
- Izbrana "ura opomnikov" je želja, ne točen čas: opomniki se ponavljajo v intervalu dni od
  zadnjega zalivanja (zahteva `TIME_INTERVAL` s `repeats: true`), zato se sprožijo ob uri, ko si
  nazadnje potrdil "Zalil sem".
