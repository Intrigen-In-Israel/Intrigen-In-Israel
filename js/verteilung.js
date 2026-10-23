import { CHARAKTERE, charakterNachId } from "../data/charaktere.js";
import { spielzustand } from "./spielzustand.js";

/* Baut die aktiven Rollengruppen auf. Gleiche Charaktere werden zusammengefasst. */
export function rollengruppen() {
  if (!spielzustand.ausgewaehltesSet) return [];
  const anzahlJeCharakter = new Map();
  for (const id of spielzustand.ausgewaehltesSet.rollen) {
    anzahlJeCharakter.set(id, (anzahlJeCharakter.get(id) ?? 0) + 1);
  }
  return [...anzahlJeCharakter.entries()]
    .map(([id, anzahl]) => ({ charakter: charakterNachId(id), anzahl }))
    .filter((eintrag) => eintrag.charakter)
    .sort((a, b) => a.charakter.prioritaet - b.charakter.prioritaet);
}

export function prioritaetsgruppen() {
  const gruppen = rollengruppen();
  return [...new Set(gruppen.map((g) => g.charakter.prioritaet))].sort((a, b) => a - b);
}

export function spielVerteilenStarten() {
  if (!spielzustand.ausgewaehltesSet) return { ok: false, meldung: "Bitte wähle zuerst ein Set aus." };
  if (spielzustand.ausgewaehltesSet.rollen.length !== spielzustand.spieler.length) {
    return { ok: false, meldung: "Die Anzahl der Charaktere muss der Anzahl der Spieler entsprechen." };
  }
  if (new Set(spielzustand.ausgewaehltesSet.rollen).size !== spielzustand.ausgewaehltesSet.rollen.length) {
    return { ok: false, meldung: "Ein Charakter ist mehrfach im Set. Jeder konkrete Charakter darf nur einmal vorkommen." };
  }
  spielzustand.spieler.forEach((spieler) => { spieler.rolle = null; });
  spielzustand.aktuellePrioritaet = prioritaetsgruppen()[0] ?? null;
  spielzustand.aktuellerBildschirm = "verteilung";
  spielzustand.meldung = "";
  return { ok: true, meldung: "" };
}

/* Speichert eine Zuordnung pro Charaktertyp. Ein Charakter kann mehrfach vergeben werden,
   jedoch höchstens so oft, wie er im gewählten Set enthalten ist. */
export function rollenZuordnen(zuordnungen) {
  const gruppen = rollengruppen().filter((g) => g.charakter.prioritaet === spielzustand.aktuellePrioritaet);
  const alleIds = new Set();
  for (const gruppe of gruppen) {
    const ids = zuordnungen[gruppe.charakter.id] ?? [];
    if (ids.length !== gruppe.anzahl) {
      return { ok: false, meldung: `Für ${gruppe.charakter.name} müssen genau ${gruppe.anzahl} Spieler ausgewählt sein.` };
    }
    for (const id of ids) {
      if (!spielzustand.spieler.some((p) => p.id === id)) return { ok: false, meldung: "Ein ausgewählter Spieler wurde nicht gefunden." };
      if (alleIds.has(id)) return { ok: false, meldung: "Ein Spieler kann nicht mehreren Rollen zugeordnet werden." };
      alleIds.add(id);
    }
  }

  // Bereits verteilte Spieler dieser Priorität werden aktualisiert.
  for (const spieler of spielzustand.spieler) {
    if (spieler.rolle && spieler.rolle.prioritaet === spielzustand.aktuellePrioritaet) spieler.rolle = null;
  }
  for (const gruppe of gruppen) {
    for (const id of (zuordnungen[gruppe.charakter.id] ?? [])) {
      const spieler = spielzustand.spieler.find((p) => p.id === id);
      spieler.rolle = gruppe.charakter;
    }
  }
  return { ok: true, meldung: "Rollen dieser Priorität wurden zugeordnet." };
}

export function alleCharaktere() { return CHARAKTERE; }
