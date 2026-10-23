import { spielzustand } from "./spielzustand.js";
import { spielerHinzufuegen, spielerEntfernen } from "./spielerverwaltung.js";
import { alleSets, empfohlenesSet, setAuswaehlen, eigenesSetSpeichern } from "./setverwaltung.js";
import { spielVerteilenStarten, rollenZuordnen, rollengruppen } from "./verteilung.js";
import { naechstePrioritaet, vorherigePrioritaet, spielZuruecksetzen, aktuelleRollengruppen } from "./ablauf.js";
import { CHARAKTERE } from "../data/charaktere.js";

const app = document.querySelector("#app");
const escapeHtml = (wert) => String(wert).replace(/[&<>"']/g, (zeichen) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[zeichen]);

function meldungHtml() {
  return spielzustand.meldung ? `<p class="notice">${escapeHtml(spielzustand.meldung)}</p>` : "";
}
function spielerListeHtml() {
  if (!spielzustand.spieler.length) return '<p class="muted">Noch keine Spieler hinzugefügt.</p>';
  return `<ul class="player-list">${spielzustand.spieler.map((p) => `<li><span>${escapeHtml(p.name)}</span><button class="secondary" data-action="spieler-entfernen" data-id="${p.id}" aria-label="${escapeHtml(p.name)} entfernen">Entfernen</button></li>`).join("")}</ul>`;
}
function spielerBildschirm() {
  const anzahl = spielzustand.spieler.length;
  const unterMinimum = anzahl < 5;
  const zuViele = anzahl > 18;
  return `<section class="panel">
    <h2>1. Spieler erfassen</h2>
    <p>Füge alle Mitspieler einzeln hinzu. Aktuell: <strong class="counter">${anzahl} / 18</strong></p>
    <form id="spieler-form" class="row"><input id="spieler-name" type="text" maxlength="60" placeholder="Name des Mitspielers" autocomplete="off" required><button type="submit">Hinzufügen</button></form>
    ${meldungHtml()}${spielerListeHtml()}
    ${unterMinimum ? '<p class="notice">Für weniger als 5 Spieler ist kein vorgefertigtes Set vorgesehen. Du kannst ein eigenes Set erstellen.</p>' : ''}
    ${zuViele ? '<p class="notice">Mehr als 18 Spieler sind nicht vorgesehen.</p>' : ''}
    <div class="button-row"><button data-action="weiter-zu-sets" ${anzahl === 0 ? "disabled" : ""}>Weiter zur Set-Auswahl</button></div>
  </section>`;
}
function setBildschirm() {
  const anzahl = spielzustand.spieler.length;
  const empfohlen = empfohlenesSet();
  const sets = alleSets().filter((set) => set.spielerAnzahl === anzahl);
  const unterMinimum = anzahl < 5;
  const oberMaximum = anzahl > 18;
  const hinweis = unterMinimum
    ? "Weniger als 5 Spieler sind nicht vorgesehen. Bitte erstelle ein eigenes Set."
    : oberMaximum ? "Mehr als 18 Spieler sind nicht vorgesehen." : sets.length === 0
      ? `Für genau ${anzahl} Spieler gibt es aktuell noch kein vorgefertigtes Set. Bitte erstelle ein eigenes Set.`
      : "Es werden ausschließlich Sets angezeigt, die exakt zu dieser Spielerzahl passen.";
  return `<section class="panel"><h2>2. Charakterset auswählen</h2><p>Spielerzahl: <strong>${anzahl}</strong></p><p class="notice">${escapeHtml(hinweis)}</p>
    ${sets.length ? `<h3>Vorgefertigte Sets</h3><ul class="set-list">${sets.map((set) => `<li class="set-option"><input type="radio" name="set-auswahl" id="${set.id}" value="${set.id}" ${spielzustand.ausgewaehltesSet?.id === set.id ? "checked" : ""}><label for="${set.id}"><strong>${escapeHtml(set.name)}</strong><span class="muted small">${set.rollen.length} Rollen</span></label></li>`).join("")}</ul>` : ''}
    <div class="button-row">${sets.length ? '<button data-action="set-uebernehmen">Set übernehmen</button>' : ''}<button class="secondary" data-action="eigenes-set-oeffnen">Eigenes Set erstellen</button><button class="secondary" data-action="zurueck-zu-spielern">Zurück</button></div>
    ${meldungHtml()}
  </section>`;
}
function eigenesSetHtml() {
  const vorhandene = new Set();
  // Bei erneutem Öffnen werden die Charaktere des eigenen Sets vorausgewählt.
  if (spielzustand.ausgewaehltesSet?.id === null) {
    for (const id of spielzustand.ausgewaehltesSet.rollen) vorhandene.add(id);
  }
  const rollenAnzahlen = Object.fromEntries(
    [...new Set(CHARAKTERE.map((c) => c.rolle || c.name))].map((rolle) => [rolle, CHARAKTERE.filter((c) => (c.rolle || c.name) === rolle).length])
  );
  const charakterKarten = CHARAKTERE.map((c) => `<label class="role-card character-choice" for="charakter-${c.id}">
      <span class="character-choice-heading"><input id="charakter-${c.id}" name="${c.id}" type="checkbox" value="1" ${vorhandene.has(c.id) ? "checked" : ""}> <strong>${escapeHtml(c.name)}</strong></span>
      <span class="muted small">Rolle: ${escapeHtml(c.rolle || c.name)}</span>
      <span class="muted small">${escapeHtml(c.funktion)}</span>
    </label>`).join("");
  return `<section class="panel"><h2>Eigenes Set erstellen</h2><p>Wähle für jeden Spieler genau einen unterschiedlichen Charakter aus. Jeder konkrete Charakter kann höchstens einmal vorkommen. Mehrere Charaktere dürfen dieselbe allgemeine Rolle haben.</p>
    <form id="eigenes-set-form"><div class="role-grid">${charakterKarten}</div>
    <p>Charaktere ausgewählt: <strong id="rollen-summe">0</strong> / ${spielzustand.spieler.length}</p>
    <p class="muted small">Verfügbare Charaktere je Rolle: ${Object.entries(rollenAnzahlen).map(([rolle, anzahl]) => `${escapeHtml(rolle)}: ${anzahl}`).join(" · ")}</p>
    <div class="button-row"><button type="submit">Set speichern und übernehmen</button><button type="button" class="secondary" data-action="zurueck-zu-sets">Abbrechen</button></div></form>${meldungHtml()}</section>`;
}

function verteilungBildschirm() {
  const gruppen = aktuelleRollengruppen();
  const zuordnungen = rollengruppen();
  const bereitsVergeben = new Set(spielzustand.spieler.filter((p) => p.rolle && p.rolle.prioritaet !== spielzustand.aktuellePrioritaet).map((p) => p.id));
  const karten = gruppen.map(({ charakter, anzahl }) => {
    const bereits = spielzustand.spieler.filter((p) => p.rolle?.id === charakter.id).map((p) => p.id);
    return `<div class="role-card"><h3>${escapeHtml(charakter.name)} <span class="muted small">(${anzahl} Spieler)</span></h3><p>${escapeHtml(charakter.funktion)}</p>${Array.from({ length: anzahl }, (_, i) => `<label for="rolle-${charakter.id}-${i}">Spieler ${i + 1}</label><select id="rolle-${charakter.id}-${i}" name="${charakter.id}" data-role-id="${charakter.id}"><option value="">Bitte auswählen …</option>${spielzustand.spieler.map((p) => `<option value="${p.id}" ${bereits[i] === p.id ? "selected" : ""} ${bereitsVergeben.has(p.id) ? "disabled" : ""}>${escapeHtml(p.name)}</option>`).join("")}</select>`).join("")}</div>`;
  }).join("");
  const prioritaet = spielzustand.aktuellePrioritaet;
  const index = [...new Set(zuordnungen.map((g) => g.charakter.prioritaet).sort((a, b) => a - b))].indexOf(prioritaet);
  const anzahlPrioritaeten = new Set(zuordnungen.map((g) => g.charakter.prioritaet)).size;
  return `<section class="panel"><h2>3. Rollen verteilen</h2><p>Priorität ${prioritaet} · Schritt ${index + 1} von ${anzahlPrioritaeten}</p><p>Ordne jedem angezeigten Rollentyp die geforderte Anzahl an Spielern zu.</p><form id="verteilung-form">${karten}<div class="button-row"><button type="submit">${index + 1 >= anzahlPrioritaeten ? "Verteilung abschließen" : "Zuordnen und weiter"}</button><button type="button" class="secondary" data-action="prioritaet-zurueck" ${index <= 0 ? "disabled" : ""}>Zurück</button></div></form>${meldungHtml()}</section>`;
}
function fertigBildschirm() {
  return `<section class="panel"><h2>Rollenverteilung abgeschlossen</h2><p>Alle Rollen wurden zugeordnet. Der restliche Tag-/Nachtablauf wird später in <code>js/ablauf.js</code> ergänzt.</p><ul class="player-list">${spielzustand.spieler.map((p) => `<li><span>${escapeHtml(p.name)}</span><strong>${escapeHtml(p.rolle?.name ?? "Keine Rolle")}</strong></li>`).join("")}</ul><div class="button-row"><button data-action="spiel-zuruecksetzen">Zurück zum Anfang</button></div>${meldungHtml()}</section>`;
}

export function render() {
  const ansicht = {
    spieler: spielerBildschirm,
    sets: setBildschirm,
    eigenesSet: eigenesSetHtml,
    verteilung: verteilungBildschirm,
    fertig: fertigBildschirm
  }[spielzustand.aktuellerBildschirm] ?? spielerBildschirm;
  app.innerHTML = ansicht();
  const summe = document.querySelector("#rollen-summe");
  const eigenesForm = document.querySelector("#eigenes-set-form");
  if (summe && eigenesForm) {
    const aktualisieren = () => {
      const wert = [...eigenesForm.querySelectorAll('input[type="checkbox"]')].filter((input) => input.checked).length;
      summe.textContent = String(wert);
      summe.classList.toggle("error", wert !== spielzustand.spieler.length);
    };
    eigenesForm.addEventListener("input", aktualisieren);
    aktualisieren();
  }
}

app.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "spieler-form") {
    const input = document.querySelector("#spieler-name");
    const ergebnis = spielerHinzufuegen(input.value);
    spielzustand.meldung = ergebnis.meldung;
    if (ergebnis.ok) spielzustand.aktuellerBildschirm = "spieler";
    render();
    if (ergebnis.ok) {
      const neuesNamensfeld = document.querySelector("#spieler-name");
      neuesNamensfeld?.focus();
      if (neuesNamensfeld) neuesNamensfeld.value = "";
    }
  } else if (event.target.id === "eigenes-set-form") {
    const daten = new FormData(event.target);
    const anzahl = Object.fromEntries(CHARAKTERE.map((c) => [c.id, daten.has(c.id)]));
    const ergebnis = eigenesSetSpeichern(anzahl);
    spielzustand.meldung = ergebnis.meldung;
    if (ergebnis.ok) {
      // Das Formular heißt ausdrücklich „speichern und übernehmen“:
      // Nach erfolgreicher Prüfung direkt mit der Rollenverteilung beginnen.
      const start = spielVerteilenStarten();
      spielzustand.meldung = start.meldung;
    }
    render();
  } else if (event.target.id === "verteilung-form") {
    const zuordnungen = {};
    for (const gruppe of aktuelleRollengruppen()) zuordnungen[gruppe.charakter.id] = [...event.target.querySelectorAll(`[data-role-id="${gruppe.charakter.id}"]`)].map((select) => select.value).filter(Boolean);
    const ergebnis = rollenZuordnen(zuordnungen);
    spielzustand.meldung = ergebnis.meldung;
    if (ergebnis.ok) naechstePrioritaet();
    render();
  }
});

app.addEventListener("change", (event) => {
  if (event.target.name === "set-auswahl") {
    const ergebnis = setAuswaehlen(event.target.value);
    spielzustand.meldung = ergebnis.meldung;
  }
});

app.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "spieler-entfernen") spielerEntfernen(button.dataset.id);
  else if (action === "weiter-zu-sets") { spielzustand.aktuellerBildschirm = "sets"; spielzustand.meldung = ""; }
  else if (action === "zurueck-zu-spielern") { spielzustand.aktuellerBildschirm = "spieler"; spielzustand.meldung = ""; }
  else if (action === "set-uebernehmen") {
    const selected = app.querySelector('input[name="set-auswahl"]:checked');
    const ergebnis = selected ? setAuswaehlen(selected.value) : { ok: false, meldung: "Bitte wähle ein Set aus." };
    spielzustand.meldung = ergebnis.meldung;
    if (ergebnis.ok) {
      const start = spielVerteilenStarten();
      spielzustand.meldung = start.meldung;
    }
  }
  else if (action === "eigenes-set-oeffnen") { spielzustand.aktuellerBildschirm = "eigenesSet"; spielzustand.meldung = ""; }
  else if (action === "zurueck-zu-sets") { spielzustand.aktuellerBildschirm = "sets"; spielzustand.meldung = ""; }
  else if (action === "prioritaet-zurueck") vorherigePrioritaet();
  else if (action === "spiel-zuruecksetzen") spielZuruecksetzen();
  render();
});

export function oberflaecheStarten() { render(); }
