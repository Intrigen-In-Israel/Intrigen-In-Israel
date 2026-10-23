/*
 * VORLÄUFIGE TESTSETS. Später hier je ein Set für exakt 5 bis 18 Spieler
 * ergänzen. 'spielerAnzahl' muss exakt zur Anzahl der Spieler passen.
 *
 * 'rollen' enthält eindeutige Charakter-IDs. Jeder konkrete Charakter darf
 * pro Spiel höchstens einmal vorkommen. Mehrere verschiedene Charaktere dürfen
 * dieselbe allgemeine Rolle ('rolle' in charaktere.js) besitzen.
 */
export const CHARAKTERSETS = [
  {
    id: "test_set_5",
    name: "Testset – 5 Spieler",
    spielerAnzahl: 5,
    rollen: ["test_ermittler", "test_schatten", "test_schatten_2", "test_schatten_3", "test_buerger"]
  },
  {
    id: "test_set_6",
    name: "Testset – 6 Spieler",
    spielerAnzahl: 6,
    rollen: ["test_ermittler", "test_schatten", "test_schatten_2", "test_schatten_3", "test_schatten_4", "test_buerger"]
  },
  {
    id: "test_set_7",
    name: "Testset – 7 Spieler",
    spielerAnzahl: 7,
    rollen: ["test_ermittler", "test_schatten", "test_schatten_2", "test_schatten_3", "test_schatten_4", "test_schatten_5", "test_buerger"]
  }
];

export function setFuerSpielerzahl(anzahl) {
  return CHARAKTERSETS.find((set) => set.spielerAnzahl === anzahl) ?? null;
}
