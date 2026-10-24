/* Gemeinsamer Zustand der laufenden Sitzung. Noch keine dauerhafte Speicherung. */
export const spielzustand = {
  spieler: [],
  ausgewaehltesSet: null,
  unbekannteZuordnungen: [],
  aktuellePrioritaet: null,
  nachtCharaktere: [],
  nachtIndex: 0,
  nachtPhase: "namen",
  nachtZuordnungen: {},
  verbrauchteNachtCharaktere: [],
  nachtAktionen: {},
  poetLetzterSpieler: null,
  unbekannteSpieler: [],
  aktuellerBildschirm: "spieler",
  meldung: "",
  runde: 1,
  spielende: null,
  ersteNachtAbgeschlossen: false,
  tagTodesgrund: null,
  reimFehlerIds: [],
  simsonFolgedeutErledigt: false
};

