import { CHARAKTERE, charakterNachName } from "../data/charaktere.js";
import { spielzustand } from "./spielzustand.js";

export function rollengruppen() {
  if (!spielzustand.ausgewaehltesSet) return [];
  return spielzustand.ausgewaehltesSet.rollen
    .map(name => ({ charakter: charakterNachName(name), anzahl: 1 }))
    .filter(x => x.charakter)
    .sort((a, b) => a.charakter.prioritaet - b.charakter.prioritaet || a.charakter.name.localeCompare(b.charakter.name, "de"));
}

export function nachtCharaktere() {
  return rollengruppen().filter(g => g.charakter.wachtAuf).map(g => g.charakter);
}

export function spielVerteilenStarten() {
  if (!spielzustand.ausgewaehltesSet) return { ok: false, meldung: "Bitte wähle zuerst ein Set aus." };
  if (spielzustand.ausgewaehltesSet.rollen.length !== spielzustand.spieler.length) return { ok: false, meldung: "Die Anzahl der Charaktere muss der Anzahl der Spieler entsprechen." };
  if (new Set(spielzustand.ausgewaehltesSet.rollen).size !== spielzustand.ausgewaehltesSet.rollen.length) return { ok: false, meldung: "Jeder konkrete Charakter darf nur einmal vorkommen." };
  spielzustand.spieler.forEach(p => { p.rolle = null; p.verliebtMit = []; p.lebt = true; p.istAmLeben = true; });
  spielzustand.unbekannteZuordnungen = [];
  spielzustand.unbekannteSpieler = [];
  spielzustand.nachtAktionen = {};
  spielzustand.nachtCharaktere = nachtCharaktere().map(c => c.name);
  spielzustand.nachtIndex = 0;
  spielzustand.nachtZuordnungen = {};
  spielzustand.verbrauchteNachtCharaktere = [];
  spielzustand.nachtPhase = "namen";
  spielzustand.aktuellePrioritaet = spielzustand.nachtCharaktere.length ? charakterNachName(spielzustand.nachtCharaktere[0]).prioritaet : 18;
  spielzustand.aktuellerBildschirm = spielzustand.nachtCharaktere.length ? "verteilung" : "tagzuordnung";
  spielzustand.meldung = "";
  return { ok: true, meldung: "" };
}

export function aktuelleNamen() {
  const c = charakterNachName(spielzustand.nachtCharaktere[spielzustand.nachtIndex]);
  if (!c) return [];
  return spielzustand.nachtCharaktere.slice(spielzustand.nachtIndex).filter(name => charakterNachName(name)?.prioritaet === c.prioritaet);
}

export function tagCharaktereZuordnen(zuordnungen) {
  const offene = rollengruppen().filter(({ charakter }) => !charakter.wachtAuf && !spielzustand.spieler.some(p => p.rolle?.name === charakter.name));
  const normal = [], unbekannt = [];
  for (const g of offene) {
    const id = zuordnungen[g.charakter.name];
    if (!id) return { ok: false, meldung: `Bitte ordne ${g.charakter.name} zu oder wähle „Unbekannt“.` };
    if (id === "__unbekannt__") unbekannt.push(g.charakter.name);
    else normal.push({ name: g.charakter.name, id });
  }
  const used = new Set();
  for (const x of normal) {
    if (!spielzustand.spieler.some(p => p.id === x.id) || used.has(x.id) || spielzustand.spieler.some(p => p.id === x.id && p.rolle)) return { ok: false, meldung: "Ein Spieler kann nicht mehreren Rollen zugeordnet werden." };
    used.add(x.id);
  }
  const rest = spielzustand.spieler.filter(p => !p.rolle && !normal.some(x => x.id === p.id));
  if (unbekannt.length === 1 && rest.length === 1) { normal.push({ name: unbekannt[0], id: rest[0].id }); unbekannt.length = 0; }
  for (const x of normal) spielzustand.spieler.find(p => p.id === x.id).rolle = { ...charakterNachName(x.name) };
  spielzustand.unbekannteZuordnungen = unbekannt;
  spielzustand.unbekannteSpieler = spielzustand.spieler.filter(p => !p.rolle).map(p => p.id);
  spielzustand.aktuellerBildschirm = "fertig";
  spielzustand.meldung = unbekannt.length ? "Die unbekannte Zuordnung bleibt offen, da mehrere Möglichkeiten bestehen." : "Alle Charaktere wurden zugeordnet.";
  return { ok: true, meldung: spielzustand.meldung };
}
