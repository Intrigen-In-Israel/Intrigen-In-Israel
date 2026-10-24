/* Gemeinsamer Zustand der laufenden Sitzung mit lokaler Zwischenspeicherung. */
export const SPIELSTAND_SCHLUESSEL = "intrigen-in-israel-spielstand-v1";

export function protokollieren(text, phase = null) {
  if (!Array.isArray(spielzustand.protokoll)) spielzustand.protokoll = [];
  const tagBildschirme = ["tagphase", "tagbericht", "buergermeister"];
  const aktuellePhase = phase || (spielzustand.aktuellerBildschirm === "spielende" ? "Spielende" : tagBildschirme.includes(spielzustand.aktuellerBildschirm) ? "Tag" : "Nacht");
  spielzustand.protokoll.push({ runde: Number(spielzustand.runde || 1), phase: aktuellePhase, text: String(text), zeit: new Date().toISOString() });
}

export function spielstandSpeichern() {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(SPIELSTAND_SCHLUESSEL, JSON.stringify(spielzustand));
    return true;
  } catch (fehler) {
    console.warn("Spielstand konnte nicht lokal gespeichert werden:", fehler);
    return false;
  }
}

export function spielstandLaden() {
  try {
    if (typeof localStorage === "undefined") return false;
    const gespeichert = localStorage.getItem(SPIELSTAND_SCHLUESSEL);
    if (!gespeichert) return false;
    const daten = JSON.parse(gespeichert);
    if (!daten || typeof daten !== "object" || !Array.isArray(daten.spieler)) return false;
    Object.assign(spielzustand, daten);
    if (!Array.isArray(spielzustand.protokoll)) spielzustand.protokoll = [];
    return true;
  } catch (fehler) {
    console.warn("Gespeicherter Spielstand konnte nicht geladen werden:", fehler);
    return false;
  }
}
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
  simsonFolgedeutErledigt: false,
  protokoll: []
};

