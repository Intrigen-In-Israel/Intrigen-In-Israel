import { spielzustand } from "./spielzustand.js";
import { charakterNachName } from "../data/charaktere.js";
import { rollengruppen } from "./verteilung.js";

// Markiert getötete Spieler und löst die Todesfolge bei Verliebten aus.
// Die Verliebten sterben erst am Morgen, wenn die Nachtaktionen abgeschlossen sind.
export function spielerUndVerliebteToeten(spielerIds) {
  const warteschlange = [...spielerIds];
  const verarbeitet = new Set();
  while (warteschlange.length) {
    const id = warteschlange.shift();
    if (verarbeitet.has(id)) continue;
    verarbeitet.add(id);
    const spieler = spielzustand.spieler.find(p => p.id === id);
    if (!spieler) continue;
    spieler.lebt = false;
    spieler.istAmLeben = false;
    for (const partnerId of spieler.verliebtMit || []) {
      const partner = spielzustand.spieler.find(p => p.id === partnerId);
      if (partner?.istAmLeben && !verarbeitet.has(partnerId)) warteschlange.push(partnerId);
    }
  }
}

function verliebteAmMorgenAbwickeln() {
  if (spielzustand.nachtAktionen.verliebtTodesfaelleAbgewickelt) return;
  const bereitsTote = spielzustand.spieler.filter(p => !p.istAmLeben).map(p => p.id);
  spielerUndVerliebteToeten(bereitsTote);
  spielzustand.nachtAktionen.verliebtTodesfaelleAbgewickelt = true;
}

export function naechstePrioritaet() {
  const current = charakterNachName(spielzustand.nachtCharaktere[spielzustand.nachtIndex]);
  if (!current) {
    verliebteAmMorgenAbwickeln();
    spielzustand.aktuellerBildschirm = "tagzuordnung";
    spielzustand.aktuellePrioritaet = 18;
    return;
  }
  // Der Index zeigt auf die erste Rolle der aktuellen Prioritätsgruppe.
  let next = spielzustand.nachtIndex;
  while (next < spielzustand.nachtCharaktere.length) {
    const c = charakterNachName(spielzustand.nachtCharaktere[next]);
    if (!c || c.prioritaet !== current.prioritaet) break;
    next++;
  }
  spielzustand.nachtIndex = next;
  spielzustand.nachtPhase = "namen";
  spielzustand.meldung = "";
  if (next >= spielzustand.nachtCharaktere.length) {
    verliebteAmMorgenAbwickeln();
    spielzustand.aktuellerBildschirm = "tagzuordnung";
    spielzustand.aktuellePrioritaet = 18;
  } else {
    spielzustand.aktuellePrioritaet = charakterNachName(spielzustand.nachtCharaktere[next]).prioritaet;
    spielzustand.aktuellerBildschirm = "verteilung";
  }
}

export function vorherigePrioritaet() {
  if (spielzustand.nachtIndex <= 0) return;
  const current = charakterNachName(spielzustand.nachtCharaktere[spielzustand.nachtIndex]);
  const currentPriority = current?.prioritaet;
  let previous = spielzustand.nachtIndex - 1;
  while (previous > 0 && charakterNachName(spielzustand.nachtCharaktere[previous - 1])?.prioritaet === currentPriority) previous--;
  if (previous === spielzustand.nachtIndex - 1) {
    const previousPriority = charakterNachName(spielzustand.nachtCharaktere[previous])?.prioritaet;
    while (previous > 0 && charakterNachName(spielzustand.nachtCharaktere[previous - 1])?.prioritaet === previousPriority) previous--;
  }
  spielzustand.nachtIndex = Math.max(0, previous);
  spielzustand.nachtPhase = "namen";
  spielzustand.aktuellePrioritaet = charakterNachName(spielzustand.nachtCharaktere[spielzustand.nachtIndex])?.prioritaet ?? 0;
  spielzustand.aktuellerBildschirm = "verteilung";
  spielzustand.meldung = "";
}

export function spielZuruecksetzen() {
  spielzustand.spieler.forEach(p => {
    p.rolle = null; p.verliebtMit = []; p.lebt = true; p.istAmLeben = true; p.istBuergermeister = false;
  });
  spielzustand.ausgewaehltesSet = null;
  spielzustand.unbekannteZuordnungen = [];
  spielzustand.unbekannteSpieler = [];
  spielzustand.nachtCharaktere = [];
  spielzustand.nachtIndex = 0;
  spielzustand.nachtPhase = "namen";
  spielzustand.nachtAktionen = {};
  spielzustand.nachtZuordnungen = {};
  spielzustand.verbrauchteNachtCharaktere = [];
  spielzustand.aktuellePrioritaet = null;
  spielzustand.aktuellerBildschirm = "spieler";
  spielzustand.meldung = "Spiel zurückgesetzt. Die Spielernamen bleiben erhalten.";
}

export function offeneTagCharaktere() {
  return rollengruppen().filter(({ charakter }) => !charakter.wachtAuf && !spielzustand.spieler.some(p => p.rolle?.name === charakter.name));
}
