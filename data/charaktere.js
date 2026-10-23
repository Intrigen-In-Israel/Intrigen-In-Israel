/*
 * Zentrale Definition aller Charakter-TYPEN.
 * Neue Charaktere werden hier ergänzt. Die IDs müssen eindeutig sein und
 * werden in data/charaktersets.js referenziert.
 *
 * 'rolle' ist die allgemeine Rollenbezeichnung. Mehrere unterschiedliche
 * Charaktere dürfen dieselbe Rolle haben. Jeder Charakter selbst darf aber
 * höchstens einmal in einem Set vorkommen.
 * 'attribute' ist für spätere charakter-spezifische Eigenschaften vorgesehen.
 * 'prioritaet' bestimmt die Reihenfolge bei der Rollenverteilung.
 */
export const CHARAKTERE = [
  {
    id: "test_ermittler",
    name: "Ermittler",
    rolle: "Ermittler",
    funktion: "Darf in der Nacht einen Mitspieler überprüfen.",
    existiert: true,
    prioritaet: 1,
    wachtAuf: true,
    attribute: { testRolle: true }
  },
  {
    id: "test_schatten",
    name: "Schatten",
    rolle: "Schatten",
    funktion: "Eine geheime Rolle, die nachts aktiv ist.",
    existiert: true,
    prioritaet: 2,
    wachtAuf: true,
    attribute: { testRolle: true }
  },
  {
    id: "test_schatten_2",
    name: "Schatten – Wächter",
    rolle: "Schatten",
    funktion: "Testcharakter mit der allgemeinen Rolle Schatten.",
    existiert: true,
    prioritaet: 2,
    wachtAuf: true,
    attribute: { testRolle: true }
  },
  {
    id: "test_schatten_3",
    name: "Schatten – Späher",
    rolle: "Schatten",
    funktion: "Testcharakter mit der allgemeinen Rolle Schatten.",
    existiert: true,
    prioritaet: 2,
    wachtAuf: true,
    attribute: { testRolle: true }
  },
  {
    id: "test_schatten_4",
    name: "Schatten – Verführer",
    rolle: "Schatten",
    funktion: "Testcharakter mit der allgemeinen Rolle Schatten.",
    existiert: true,
    prioritaet: 2,
    wachtAuf: true,
    attribute: { testRolle: true }
  },
  {
    id: "test_schatten_5",
    name: "Schatten – Intrigant",
    rolle: "Schatten",
    funktion: "Testcharakter mit der allgemeinen Rolle Schatten.",
    existiert: true,
    prioritaet: 2,
    wachtAuf: true,
    attribute: { testRolle: true }
  },
  {
    id: "test_buerger",
    name: "Bürger",
    rolle: "Bürger",
    funktion: "Eine gewöhnliche Rolle ohne eigene Nachtaktion.",
    existiert: true,
    prioritaet: 3,
    wachtAuf: false,
    attribute: { testRolle: true }
  }
];

// Liefert die Charakterdefinition zu einer ID oder undefined.
export function charakterNachId(id) {
  return CHARAKTERE.find((charakter) => charakter.id === id);
}
