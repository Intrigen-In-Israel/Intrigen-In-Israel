import { spielzustand } from "./spielzustand.js";
import { prioritaetsgruppen, rollengruppen } from "./verteilung.js";

/* Steuert die Übergänge des Spielablaufs. Tag-/Nachtaktionen kommen später hier hinzu. */
export function naechstePrioritaet() {
  const prioritaeten = prioritaetsgruppen();
  const index = prioritaeten.indexOf(spielzustand.aktuellePrioritaet);
  if (index < 0 || index + 1 >= prioritaeten.length) {
    spielzustand.aktuellerBildschirm = "fertig";
    spielzustand.meldung = "Die Rollenverteilung ist abgeschlossen.";
    return;
  }
  spielzustand.aktuellePrioritaet = prioritaeten[index + 1];
  spielzustand.meldung = "";
}

export function vorherigePrioritaet() {
  const prioritaeten = prioritaetsgruppen();
  const index = prioritaeten.indexOf(spielzustand.aktuellePrioritaet);
  if (index > 0) {
    spielzustand.aktuellePrioritaet = prioritaeten[index - 1];
    spielzustand.aktuellerBildschirm = "verteilung";
    spielzustand.meldung = "";
  }
}

export function spielZuruecksetzen() {
  spielzustand.spieler.forEach((spieler) => {
    spieler.rolle = null;
    spieler.verliebtMit = [];
    spieler.lebt = true;
    spieler.istBuergermeister = false;
  });
  spielzustand.ausgewaehltesSet = null;
  spielzustand.eigeneRollen = [];
  spielzustand.aktuellePrioritaet = null;
  spielzustand.aktuellerBildschirm = "spieler";
  spielzustand.meldung = "Spiel zurückgesetzt. Die Spielernamen bleiben erhalten.";
}

export function aktuelleRollengruppen() {
  return rollengruppen().filter((g) => g.charakter.prioritaet === spielzustand.aktuellePrioritaet);
}
