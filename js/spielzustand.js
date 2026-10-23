/* Gemeinsamer Zustand der laufenden Sitzung. Noch keine dauerhafte Speicherung. */
export const spielzustand = {
  spieler: [],
  ausgewaehltesSet: null,
  eigeneRollen: [],
  aktuellePrioritaet: null,
  aktuellerBildschirm: "spieler",
  meldung: ""
};

export function setMeldung(text) {
  spielzustand.meldung = text;
}
