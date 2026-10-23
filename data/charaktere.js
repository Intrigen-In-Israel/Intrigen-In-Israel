/*
 * Zentrale Definition aller Charaktere.
 *
 * Der eindeutige Charaktername wird als Schlüssel verwendet.
 * Mehrere Charaktere dürfen dieselbe allgemeine Rolle besitzen.
 * Jeder konkrete Charakter darf pro Spiel höchstens einmal vorkommen.
 *
 * 'prioritaet' bestimmt die Reihenfolge bei der Rollenverteilung.
 * 'attribute' bzw. charakter-spezifische Eigenschaften werden bei Bedarf
 * direkt am jeweiligen Charakter hinterlegt.
 */
export const CHARAKTERE = [
  // Echte Charaktere
  {
    name: "Bileam",
    rolle: "Weiser",
    funktion: "Spricht Flüche und Heilungen aus <4.Mose 22,6 + 23,11>.",
    existiert: true,
    prioritaet: 6,
    wachtAuf: true,
    hatGeheilt: false,
    hatGetötet: false
  },
  {
    name: "Salomo",
    rolle: "Poet",
    funktion: "Leitet andere mit seiner weisen Redensart <1. Könige 3,16-28>.",
    existiert: true,
    prioritaet: 3,
    wachtAuf: true,
    // Kann nicht zwei Mal nacheinander dieselbe Person inspirieren.
    // Der entsprechende Spieler wird in diesem Attribut vermerkt.
    hatInspiriert: null
  },
  {
    name: "Jona",
    rolle: "Dorfdepp",
    funktion: "Bringt mit seiner Lebensmüdigkeit Chaos ins Dorf <1Jona 4,3-8>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Abraham",
    rolle: "Vermittler",
    funktion: "Verbindet Menschen mit Hilfe der Liebe <1. Mose 14,1-67>.",
    existiert: true,
    prioritaet: 0,
    wachtAuf: true,
    // Wacht nur auf, wenn er noch keinen verliebt hat.
    hatBereitsVerliebt: false
  },
  {
    name: "Mordechai",
    rolle: "Beobachter",
    funktion: "Beobachtet und deckt Geheimnisse auf <Esther 2,19-23>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Jakob",
    rolle: "Unruhestifter",
    funktion: "Manipuliert und betrügt zu seinen Gunsten <1. Mose 27,18-36>.",
    existiert: true,
    prioritaet: 7,
    wachtAuf: true
  },
  {
    name: "Hanna",
    rolle: "Dorfbewohner",
    funktion: "Gläubige Mutter, die ihr Versprechen hält <1. Samuel 1,10-11+20>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Ruth",
    rolle: "Dorfbewohner",
    funktion: "Liebende Schwiegertochter und treue Gefährtin <Ruth 1,16-17>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Petrus",
    rolle: "Dorfbewohner",
    funktion: "Ein störrischer Fischer und Jünger von Jesus <Matthäus 14,28-31>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Nehemia",
    rolle: "Dorfbewohner",
    funktion: "Inspirierender Führer und Bauleiter in Jerusalem <Nehemia 2,17-18>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Martha",
    rolle: "Dorfbewohner",
    funktion: "Eine treue und fleißige Hausfrau <Lukas 10,38-42>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Abigail",
    rolle: "Dorfbewohner",
    funktion: "Klug, besonnen und weiß, wie man Konflikte entschärft <1. Samuel 25,2-42>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "David",
    rolle: "Beschützer",
    funktion: "Schützer des Volkes und der Schafherde <1. Samuel 18,5>.",
    existiert: true,
    prioritaet: 2,
    wachtAuf: true,
    // David kann nicht zwei Mal nacheinander dieselbe Person beschützen.
    hatBeschützt: null
  },
  {
    name: "Elisa",
    rolle: "Prophet",
    funktion: "Enthüllt Intrigen und Identitäten <2 Könige 6,8-12>.",
    existiert: true,
    prioritaet: 1,
    wachtAuf: true
  },
  {
    name: "Simson",
    rolle: "Richter",
    funktion: "Reißt Gottes Feinde mit in den Tod <Richter 16,28-30>.",
    existiert: true,
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Judas",
    rolle: "Mörder",
    funktion: "Wacht nachts auf und eliminiert Dorfbewohner <Matthäus 16,14-16 + 47-50>.",
    existiert: true,
    prioritaet: 5,
    wachtAuf: true
  },
  {
    name: "Atalja",
    rolle: "Mörder",
    funktion: "Wacht nachts auf und eliminiert Dorfbewohner <2. Chronik 22,10>.",
    existiert: true,
    prioritaet: 5,
    wachtAuf: true
  },
  {
    name: "Isebel",
    rolle: "Mörder",
    funktion: "Wacht nachts auf und eliminiert Dorfbewohner <1. Könige 21,25-26>.",
    existiert: true,
    prioritaet: 5,
    wachtAuf: true
  }
];

// Liefert die Charakterdefinition anhand des eindeutigen Namens oder undefined.
export function charakterNachName(name) {
  return CHARAKTERE.find((charakter) => charakter.name === name);
}
