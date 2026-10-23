/* Vorgefertigte Sets für exakt 6 bis 18 Spieler.
 * 'rollen' enthält eindeutige Charakternamen. Jeder konkrete Charakter kommt
 * pro Set höchstens einmal vor; mehrere Charaktere dürfen dieselbe Rolle haben.
 */
export const CHARAKTERSETS = [
  {
    id: "set_6",
    name: "6 Spieler",
    spielerAnzahl: 6,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas"]
  },
  {
    id: "set_7",
    name: "7 Spieler",
    spielerAnzahl: 7,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Elisa"]
  },
  {
    id: "set_8",
    name: "8 Spieler",
    spielerAnzahl: 8,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Elisa"]
  },
  {
    id: "set_9",
    name: "9 Spieler",
    spielerAnzahl: 9,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Elisa", "Abraham"]
  },
  {
    id: "set_10",
    name: "10 Spieler",
    spielerAnzahl: 10,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Elisa", "Abraham", "Bileam"]
  },
  {
    id: "set_11",
    name: "11 Spieler",
    spielerAnzahl: 11,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Elisa", "Abraham", "Bileam", "Mordechai"]
  },
  {
    id: "set_12",
    name: "12 Spieler",
    spielerAnzahl: 12,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai"]
  },
  {
    id: "set_13",
    name: "13 Spieler",
    spielerAnzahl: 13,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai", "Hanna"]
  },
  {
    id: "set_14",
    name: "14 Spieler",
    spielerAnzahl: 14,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai", "Hanna", "Ruth"]
  },
  {
    id: "set_15",
    name: "15 Spieler",
    spielerAnzahl: 15,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai", "Hanna", "Ruth", "Petrus"]
  },
  {
    id: "set_16",
    name: "16 Spieler",
    spielerAnzahl: 16,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai", "Hanna", "Ruth", "Petrus", "Nehemia"]
  },
  {
    id: "set_17",
    name: "17 Spieler",
    spielerAnzahl: 17,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai", "Hanna", "Ruth", "Petrus", "Nehemia", "Martha"]
  },
  {
    id: "set_18",
    name: "18 Spieler",
    spielerAnzahl: 18,
    rollen: ["Jakob", "Simson", "David", "Salomo", "Jona", "Judas", "Atalja", "Isebel", "Elisa", "Abraham", "Bileam", "Mordechai", "Hanna", "Ruth", "Petrus", "Nehemia", "Martha", "Abigail"]
  }
];

export function setFuerSpielerzahl(anzahl) {
  return CHARAKTERSETS.find((set) => set.spielerAnzahl === anzahl) ?? null;
}
