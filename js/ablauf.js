import { spielzustand } from "./spielzustand.js";
import { charakterNachName } from "../data/charaktere.js";
import { rollengruppen } from "./verteilung.js";

export function todesfallHinzufuegen(spieler, grund) {
  if (!spieler || !spieler.istAmLeben) return false;
  spieler.istAmLeben = false;
  if (!Array.isArray(spielzustand.nachtAktionen.todesfaelle)) spielzustand.nachtAktionen.todesfaelle = [];
  spielzustand.nachtAktionen.todesfaelle.push({ spielerId: spieler.id, name: spieler.name, rolle: spieler.rolle?.name || spieler.rolle?.rolle || "Rolle unbekannt", grund });
  return true;
}

// Tötet ausgewählte Personen und verarbeitet die Verliebtenkette. Der direkte
// Todesgrund bleibt erhalten; ausgelöste Todesfälle werden als "Verliebt" protokolliert.
export function spielerUndVerliebteToeten(spielerIds, grund = "Verliebt") {
  const warteschlange = spielerIds.map(id => ({ id, grund }));
  const verarbeitet = new Set();
  while (warteschlange.length) {
    const { id, grund: aktuellerGrund } = warteschlange.shift();
    if (verarbeitet.has(id)) continue;
    verarbeitet.add(id);
    const spieler = spielzustand.spieler.find(p => p.id === id);
    if (!spieler) continue;
    if (spieler.istAmLeben) todesfallHinzufuegen(spieler, aktuellerGrund);
    for (const partnerId of spieler.verliebtMit || []) {
      const partner = spielzustand.spieler.find(p => p.id === partnerId);
      if (partner?.istAmLeben && !verarbeitet.has(partnerId)) warteschlange.push({ id: partnerId, grund: "Verliebt" });
    }
  }
}

export function siegPruefen() {
  const lebende = spielzustand.spieler.filter(p => p.istAmLeben);
  const dorfdeppHinrichtung = spielzustand.nachtAktionen.dorfdeppHinrichtung;
  if (dorfdeppHinrichtung) return { beendet: true, grund: "Der Dorfdepp wurde am Tag hingerichtet.", sieger: "Dorfdepp" };
  if (lebende.length === 2 && lebende.every(p => (p.verliebtMit || []).includes(lebende.find(q => q.id !== p.id)?.id))) {
    return { beendet: true, grund: "Nur noch ein verliebtes Paar lebt.", sieger: "Verliebtes Paar" };
  }
  const lebendeNichtMoerder = lebende.filter(p => p.rolle?.rolle !== "Mörder");
  if (!lebendeNichtMoerder.length) return { beendet: true, grund: "Alle Dorfbewohner (Nicht-Mörder) sind tot.", sieger: "Mörder" };
  const lebendeMoerder = lebende.filter(p => p.rolle?.rolle === "Mörder");
  if (!lebendeMoerder.length) return { beendet: true, grund: "Alle Mörder sind tot.", sieger: "Dorfbewohner" };
  return { beendet: false };
}

export function spielendePruefen() {
  const ergebnis = siegPruefen();
  if (ergebnis.beendet) {
    spielzustand.spielende = ergebnis;
    spielzustand.aktuellerBildschirm = "spielende";
  }
  return ergebnis;
}

function verliebteAmMorgenAbwickeln() {
  if (spielzustand.nachtAktionen.verliebtTodesfaelleAbgewickelt) return;
  const bereitsTote = (spielzustand.nachtAktionen.todesfaelle || []).map(f => f.spielerId);
  // Verliebte, die durch eine Nachtaktion sterben, ziehen ihre Partner mit.
  for (const id of bereitsTote) {
    const p = spielzustand.spieler.find(x => x.id === id);
    for (const partnerId of p?.verliebtMit || []) {
      const partner = spielzustand.spieler.find(x => x.id === partnerId);
      if (partner?.istAmLeben) spielerUndVerliebteToeten([partnerId], "Verliebt");
    }
  }
  spielzustand.nachtAktionen.verliebtTodesfaelleAbgewickelt = true;
}

export function naechstePrioritaet() {
  const current = charakterNachName(spielzustand.nachtCharaktere[spielzustand.nachtIndex]);
  if (!current) {
    verliebteAmMorgenAbwickeln();
    if (spielzustand.ersteNachtAbgeschlossen && !(spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben) && !spielzustand.simsonFolgedeutErledigt) && spielendePruefen().beendet) return;
    spielzustand.aktuellerBildschirm = spielzustand.ersteNachtAbgeschlossen ? "nachtbericht" : "tagzuordnung";
    spielzustand.aktuellePrioritaet = 18;
    return;
  }
  let next = spielzustand.nachtIndex;
  while (next < spielzustand.nachtCharaktere.length) {
    const c = charakterNachName(spielzustand.nachtCharaktere[next]);
    if (!c || c.prioritaet !== current.prioritaet) break;
    next++;
  }
  spielzustand.nachtIndex = next;
  spielzustand.nachtPhase = spielzustand.ersteNachtAbgeschlossen ? "aktion" : "namen";
  spielzustand.meldung = "";
  if (next >= spielzustand.nachtCharaktere.length) {
    verliebteAmMorgenAbwickeln();
    if (spielzustand.ersteNachtAbgeschlossen && !(spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben) && !spielzustand.simsonFolgedeutErledigt) && spielendePruefen().beendet) return;
    spielzustand.aktuellerBildschirm = spielzustand.ersteNachtAbgeschlossen ? "nachtbericht" : "tagzuordnung";
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
  spielzustand.nachtPhase = spielzustand.ersteNachtAbgeschlossen ? "aktion" : "namen";
  spielzustand.aktuellePrioritaet = charakterNachName(spielzustand.nachtCharaktere[spielzustand.nachtIndex])?.prioritaet ?? 0;
  spielzustand.aktuellerBildschirm = "verteilung";
  spielzustand.meldung = "";
}

export function bürgermeisterPruefen() {
  const lebenderBuergermeister = spielzustand.spieler.find(p => p.istAmLeben && p.istBuergermeister);
  if (lebenderBuergermeister) return false;
  const bisheriger = spielzustand.spieler.find(p => p.istBuergermeister);
  if (bisheriger && !bisheriger.istAmLeben) {
    spielzustand.aktuellerBildschirm = "buergermeister";
    spielzustand.meldung = "Der Bürgermeister ist gestorben. Trage den vom Spielleiter bestimmten lebenden Nachfolger ein.";
    return true;
  }
  if (!bisheriger && spielzustand.ersteNachtAbgeschlossen) {
    spielzustand.aktuellerBildschirm = "buergermeister";
    spielzustand.meldung = "Es gibt noch keinen eingetragenen Bürgermeister. Trage den vom Spielleiter eingetragenen, lebenden Gewählten ein.";
    return true;
  }
  return false;
}

export function spielZuruecksetzen() {
  spielzustand.spieler.forEach(p => {
    p.rolle = null; p.verliebtMit = []; p.istAmLeben = true; p.istBuergermeister = false;
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
  spielzustand.runde = 1;
  spielzustand.spielende = null;
  spielzustand.simsonFolgedeutErledigt = false;
  spielzustand.aktuellerBildschirm = "spieler";
  spielzustand.meldung = "Spiel zurückgesetzt. Die Spielernamen bleiben erhalten.";
}

export function offeneTagCharaktere() {
  return rollengruppen().filter(({ charakter }) => !charakter.wachtAuf && !spielzustand.spieler.some(p => p.rolle?.name === charakter.name));
}
