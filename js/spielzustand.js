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

const SPIELSTAND_VERSION_PREFIX = `${SPIELSTAND_SCHLUESSEL}-version-`;

function spielstandVersionenAuflisten() {
  if (typeof localStorage === "undefined") return [];
  const versionen = [];
  for (let i = 0; i < localStorage.length; i++) {
    const schluessel = localStorage.key(i);
    if (!schluessel?.startsWith(SPIELSTAND_VERSION_PREFIX)) continue;
    const nummer = Number(schluessel.slice(SPIELSTAND_VERSION_PREFIX.length));
    if (Number.isSafeInteger(nummer) && nummer > 0) versionen.push({ nummer, schluessel });
  }
  return versionen.sort((a, b) => a.nummer - b.nummer);
}

export function spielstandVersionierungZuruecksetzen() {
  if (typeof localStorage === "undefined") return;
  for (const version of spielstandVersionenAuflisten()) localStorage.removeItem(version.schluessel);
}

export function spielstandVersionSpeichern() {
  try {
    if (typeof localStorage === "undefined") return false;
    const versionen = spielstandVersionenAuflisten();
    const nummer = (versionen.at(-1)?.nummer || 0) + 1;
    const eintrag = { version: nummer, erstelltAm: new Date().toISOString(), zustand: JSON.parse(JSON.stringify(spielzustand)) };
    localStorage.setItem(`${SPIELSTAND_VERSION_PREFIX}${String(nummer).padStart(8, "0")}`, JSON.stringify(eintrag));
    return true;
  } catch (fehler) {
    console.warn("Der nummerierte Spielstand konnte nicht gespeichert werden:", fehler);
    return false;
  }
}

export function spielstandVersionZurueck() {
  try {
    if (typeof localStorage === "undefined") return false;
    const versionen = spielstandVersionenAuflisten();
    // Auch ein einzelner gespeicherter Stand ist ein gültiger Rücksprungpunkt.
    // Bei mehreren Ständen wird der unmittelbar vorherige geladen.
    if (versionen.length < 1) return false;
    const ziel = versionen.length >= 2 ? versionen[versionen.length - 2] : versionen[versionen.length - 1];
    const gespeichert = localStorage.getItem(ziel.schluessel);
    const eintrag = JSON.parse(gespeichert || "null");
    if (!eintrag?.zustand || !Array.isArray(eintrag.zustand.spieler)) return false;
    for (const key of Object.keys(spielzustand)) delete spielzustand[key];
    Object.assign(spielzustand, eintrag.zustand);
    for (const version of versionen) {
      if (version.nummer > ziel.nummer) localStorage.removeItem(version.schluessel);
    }
    spielstandSpeichern();
    return true;
  } catch (fehler) {
    console.warn("Der vorherige Spielstand konnte nicht wiederhergestellt werden:", fehler);
    return false;
  }
}

export function spielstandVersionenAnzahl() {
  return spielstandVersionenAuflisten().length;
}

export const spielzustand = {
  spieler: [],
  hardcoreModus: false,
  verliebenFreigegeben: true,
  jakobTauschInNacht: false,
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

