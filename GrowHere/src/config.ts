// Ko DEMO = false, mora biti SERVER_URL nastavljen na lokalni IP računalnika,
// na katerem teče strežnik iz mape server/ (npr. "http://192.168.1.42:3001").
// "localhost" na telefonu kaže na telefon sam, zato ne bo delovalo.
// IP najdeš z `ipconfig` (Windows) oz. `ifconfig` (macOS/Linux) — vrstica IPv4.
export const SERVER_URL = 'http://192.168.1.100:3001';

// DEMO = true: analiza ne kliče strežnika, uporabi testno sliko sobe in tri pripravljene predele.
// DEMO = false: analiza pošlje zajeto sliko na SERVER_URL/analyze (potreben je zagnan strežnik).
export const DEMO = true;

// Privzeta lokacija (Ljubljana), uporabljena, ko uporabnik zavrne dovoljenje za lokacijo.
export const DEFAULT_LOCATION = { latitude: 46.05, longitude: 14.51 };
