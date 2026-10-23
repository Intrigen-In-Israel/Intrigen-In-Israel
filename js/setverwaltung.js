import { CHARAKTERE } from "../data/charaktere.js";
import { CHARAKTERSETS, setFuerSpielerzahl } from "../data/charaktersets.js";
import { spielzustand } from "./spielzustand.js";

/* Aktiviert ein vorgefertigtes Set nur bei exakt passender Spielerzahl. */
export function setAuswaehlen(setId) {
  const set = CHARAKTERSETS.find((eintrag) => eintrag.id === setId);
  if (!set) return { ok: false, meldung: "Das ausgewählte Set wurde nicht gefunden." };
  if (set.spielerAnzahl !== spielzustand.spieler.length) {
    return { ok: false, meldung: "Dieses Set passt nicht exakt zur Spielerzahl." };
  }
  if (new Set(set.rollen).size !== set.rollen.length) {
    return { ok: false, meldung: "Dieses Set enthält einen Charakter mehrfach. Jeder konkrete Charakter darf nur einmal vorkommen." };
  }
  if (set.rollen.some((id) => !CHARAKTERE.some((charakter) => charakter.id === id))) {
    return { ok: false, meldung: "Dieses Set enthält einen unbekannten Charakter." };
  }
  spielzustand.ausgewaehltesSet = { ...set, rollen: [...set.rollen] };
  spielzustand.eigeneRollen = [];
  spielzustand.meldung = "";
  return { ok: true, meldung: "Set ausgewählt." };
}

/* Übernimmt ein eigenes Set. Jeder konkrete Charakter darf höchstens einmal
   gewählt werden. Unterschiedliche Charaktere können dieselbe allgemeine Rolle
   haben; die Anzahl dieser Rolle ergibt sich aus der Charakterliste. */
export function eigenesSetSpeichern(auswahl) {
  const rollen = [];
  for (const charakter of CHARAKTERE) {
    const gewaehlt = auswahl[charakter.id] === true || auswahl[charakter.id] === "on" || auswahl[charakter.id] === "1";
    if (gewaehlt) rollen.push(charakter.id);
  }

  if (rollen.length !== spielzustand.spieler.length) {
    return {
      ok: false,
      meldung: `Dein Set enthält ${rollen.length} verschiedene Charaktere, aber es gibt ${spielzustand.spieler.length} Spieler. Bitte wähle genau so viele Charaktere aus wie Spieler vorhanden sind.`
    };
  }

  spielzustand.ausgewaehltesSet = {
    id: null,
    name: "Eigenes Set",
    spielerAnzahl: spielzustand.spieler.length,
    rollen
  };
  spielzustand.eigeneRollen = [];
  spielzustand.meldung = "Eigenes Set übernommen. Jeder Charakter kommt höchstens einmal vor.";
  return { ok: true, meldung: spielzustand.meldung };
}

export function empfohlenesSet() {
  return setFuerSpielerzahl(spielzustand.spieler.length);
}

export function alleSets() {
  return CHARAKTERSETS;
}
