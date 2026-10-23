import { spielzustand } from "./spielzustand.js";

/* Fügt einen Spieler hinzu. Rollen werden erst später verteilt. */
export function spielerHinzufuegen(name) {
  const saubererName = name.trim();
  if (!saubererName) return { ok: false, meldung: "Bitte gib einen Namen ein." };
  if (spielzustand.spieler.length >= 18) return { ok: false, meldung: "Mehr als 18 Spieler sind in dieser Version nicht vorgesehen." };
  if (spielzustand.spieler.some((p) => p.name.toLocaleLowerCase() === saubererName.toLocaleLowerCase())) {
    return { ok: false, meldung: "Dieser Name ist bereits in der Liste." };
  }

  spielzustand.spieler.push({
    id: crypto.randomUUID(),
    name: saubererName,
    rolle: null,
    verliebtMit: [],
    lebt: true,
    istBuergermeister: false
  });
  spielzustand.meldung = "";
  return { ok: true, meldung: "" };
}

export function spielerEntfernen(id) {
  spielzustand.spieler = spielzustand.spieler.filter((spieler) => spieler.id !== id);
  spielzustand.ausgewaehltesSet = null;
}
