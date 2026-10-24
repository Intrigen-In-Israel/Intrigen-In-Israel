import { spielzustand, protokollieren, spielstandSpeichern, spielstandLaden } from "./spielzustand.js";
import { spielerHinzufuegen, spielerEntfernen } from "./spielerverwaltung.js";
import { alleSets, empfohlenesSet, setAuswaehlen, eigenesSetSpeichern } from "./setverwaltung.js";
import { spielVerteilenStarten, tagCharaktereZuordnen, aktuelleNamen } from "./verteilung.js";
import { naechstePrioritaet, vorherigePrioritaet, spielZuruecksetzen, offeneTagCharaktere, spielerUndVerliebteToeten, todesfallHinzufuegen, spielendePruefen, siegPruefen, bürgermeisterPruefen } from "./ablauf.js";
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
  const unterMinimum = anzahl < 6;
  const zuViele = anzahl > 18;
  return `<section class="panel">
    <h2>1. Spieler erfassen</h2>
    <p>Füge alle Mitspieler einzeln hinzu. Aktuell: <strong class="counter">${anzahl} / 18</strong></p>
    <form id="spieler-form" class="row"><input id="spieler-name" type="text" maxlength="60" placeholder="Name des Mitspielers" autocomplete="off" required><button type="submit">Hinzufügen</button></form>
    ${meldungHtml()}${spielerListeHtml()}
    ${unterMinimum ? '<p class="notice">Für weniger als 6 Spieler ist kein vorgefertigtes Set vorgesehen. Du kannst ein eigenes Set erstellen.</p>' : ''}
    ${zuViele ? '<p class="notice">Mehr als 18 Spieler sind nicht vorgesehen.</p>' : ''}
    <div class="button-row"><button data-action="weiter-zu-sets" ${anzahl === 0 ? "disabled" : ""}>Weiter zur Set-Auswahl</button></div>
  </section>`;
}
function setBildschirm() {
  const anzahl = spielzustand.spieler.length;
  const empfohlen = empfohlenesSet();
  const sets = alleSets().filter((set) => set.spielerAnzahl === anzahl);
  const unterMinimum = anzahl < 6;
  const oberMaximum = anzahl > 18;
  const hinweis = unterMinimum
    ? "Weniger als 6 Spieler sind nicht vorgesehen. Bitte erstelle ein eigenes Set."
    : oberMaximum ? "Mehr als 18 Spieler sind nicht vorgesehen." : sets.length === 0
      ? `Für genau ${anzahl} Spieler gibt es aktuell noch kein vorgefertigtes Set. Bitte erstelle ein eigenes Set.`
      : "Es werden ausschließlich Sets angezeigt, die exakt zu dieser Spielerzahl passen.";
  return `<section class="panel"><h2>2. Charakterset auswählen</h2><p>Spielerzahl: <strong>${anzahl}</strong></p><p class="notice">${escapeHtml(hinweis)}</p>
    ${sets.length ? `<h3>Vorgefertigte Sets</h3><ul class="set-list">${sets.map((set) => `<li class="set-option"><input type="radio" name="set-auswahl" id="${set.id}" value="${set.id}" ${spielzustand.ausgewaehltesSet?.id === set.id ? "checked" : ""}><label for="${set.id}"><strong>${escapeHtml(set.name)}</strong><span class="muted small">${set.rollen.map((name) => { const c = CHARAKTERE.find((eintrag) => eintrag.name === name); return c ? c.rolle : name; }).map(escapeHtml).join(", ")}</span></label></li>`).join("")}</ul>` : ''}
    <div class="button-row">${sets.length ? '<button data-action="set-uebernehmen">Set übernehmen</button>' : ''}<button class="secondary" data-action="eigenes-set-oeffnen">Stattdessen eigenes Set erstellen</button><button class="secondary" data-action="zurueck-zu-spielern">Zurück</button></div>
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
  const charakterKarten = CHARAKTERE.map((c) => `<label class="role-card character-choice" for="charakter-${c.name}">
      <span class="character-choice-heading"><input id="charakter-${c.name}" name="${c.name}" type="checkbox" value="1" ${vorhandene.has(c.name) ? "checked" : ""}> <strong>${escapeHtml(c.rolle || c.name)}</strong></span>
      <span class="muted small">${escapeHtml(c.name)}</span>
      <span class="muted small">${escapeHtml(c.funktion)}</span>
    </label>`).join("");
  return `<section class="panel"><h2>Eigenes Set erstellen</h2><p>Wähle für jeden Spieler genau einen unterschiedlichen Charakter aus. Jeder konkrete Charakter kann höchstens einmal vorkommen. Mehrere Charaktere dürfen dieselbe allgemeine Rolle haben.</p>
    <form id="eigenes-set-form"><div class="role-grid">${charakterKarten}</div>
    <p>Charaktere ausgewählt: <strong id="rollen-summe">0</strong> / ${spielzustand.spieler.length}</p>
    <p class="muted small">Verfügbare Charaktere je Rolle: ${Object.entries(rollenAnzahlen).map(([rolle, anzahl]) => `${escapeHtml(rolle)}: ${anzahl}`).join(" · ")}</p>
    <div class="button-row"><button type="submit">Set speichern und übernehmen</button><button type="button" class="secondary" data-action="zurueck-zu-sets">Abbrechen</button></div></form>${meldungHtml()}</section>`;
}

function verteilungBildschirm() {
  const namen = aktuelleNamen();
  const chars = namen.map(n => CHARAKTERE.find(c => c.name === n)).filter(Boolean);
  if (!chars.length) return `<section class="panel"><h2>Nacht abgeschlossen</h2><button data-action="tagzuordnung-oeffnen">Weiter zur Zuordnung</button></section>`;
  if (spielzustand.nachtPhase === "einschlafen") {
    return `<section class="panel"><h2>3. Einschlafen</h2><p>Die Aktion von ${chars.map(c => `<strong>${escapeHtml(c.name)}</strong>`).join(", ")} ist bestätigt.</p>${meldungHtml()}<p>Erst jetzt wird die nächste Prioritätsgruppe aufgerufen.</p><div class="button-row"><button data-action="nacht-einschlafen">Einschlafen</button><button class="secondary" data-action="prioritaet-zurueck">Zurück</button></div></section>`;
  }
  const istMoerdergruppe = chars.every(c => c.rolle === "Mörder");
  const bereitsVergeben = spielzustand.spieler.filter(p => p.rolle).map(p => p.id);
  const spielerOptionen = (id="", extra=[], nurLebende=false, ausgeschlossen=[]) => `<option value="">Bitte auswählen …</option>${spielzustand.spieler.filter(p=>(!nurLebende||p.istAmLeben)&&!ausgeschlossen.includes(p.id)).map(p=>`<option value="${p.id}" ${p.id===id?'selected':''} ${extra.includes(p.id)?'disabled':''}>${escapeHtml(p.name)}</option>`).join("")}`;
  if (spielzustand.nachtPhase === "namen") {
    const zuordnungen = chars.map(c=>{
      // Wenn Elisa die Rolle eines Spielers bereits festgestellt hat, diesen Spieler
      // beim späteren Aufruf des entsprechenden Charakters vorauswählen.
      const bekannterSpieler = spielzustand.spieler.find(p => p.rolle?.name === c.name);
      const vorauswahl = bekannterSpieler?.id || "";
      const blockierteSpieler = bereitsVergeben.filter(id => id !== vorauswahl);
      return `<div class="role-card"><h3>${escapeHtml(c.rolle)}</h3><p class="muted small">${escapeHtml(c.name)}</p><label for="nacht-name-${escapeHtml(c.name)}">Wer ist ${escapeHtml(c.name)}?</label><select id="nacht-name-${escapeHtml(c.name)}" data-night-role="${escapeHtml(c.name)}" required>${spielerOptionen(vorauswahl,blockierteSpieler)}</select></div>`;
    }).join("");
    return `<section class="panel"><h2>1. Namen zuordnen</h2><p>Ordne zuerst alle aufwachenden Charaktere ihren Spielern zu. Danach öffnet sich ein separates Fenster für die Aktion.</p><form id="nacht-namen-form">${zuordnungen}<div class="button-row"><button type="submit">Namen bestätigen</button><button type="button" class="secondary" data-action="prioritaet-zurueck" ${spielzustand.nachtIndex<=0?"disabled":""}>Zurück</button></div></form>${meldungHtml()}</section>`;
  }
  let aktion = `<p>Führe die Aktion aus und bestätige sie anschließend. Das Einschlafen erfolgt danach in einem eigenen Fenster.</p>`;
  if (istMoerdergruppe) aktion = `<div class="role-card"><h3>Gemeinsame Aktion der Mörder</h3><p>Alle Mörder handeln gemeinsam und wählen ein lebendes Opfer.</p><label for="moerder-opfer">Opfer</label><select id="moerder-opfer" required><option value="">Bitte auswählen …</option>${spielzustand.spieler.filter(p=>p.istAmLeben).map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select></div>`;
  else for (const c of chars) {
    if(c.name==="Abraham" && !spielzustand.spieler.find(p=>p.rolle?.name==="Abraham")?.rolle?.hatBereitsVerliebt) aktion+=`<div class="role-card"><h3>Aktion: Zwei Personen verlieben</h3><label for="abraham-person1">Person 1</label><select id="abraham-person1" required>${spielerOptionen("",[],true)}</select><label for="abraham-person2">Person 2</label><select id="abraham-person2" required>${spielerOptionen("",[],true)}</select></div>`;
    if(c.rolle==="Prophet") {
      const setRollen = spielzustand.ausgewaehltesSet?.rollen || [];
      const prophetSpieler = spielzustand.spieler.find(p => p.rolle?.name === c.name);
      const bereitsZugewieseneRollen = new Set(spielzustand.spieler.filter(p => p.rolle?.name && p.id !== prophetSpieler?.id).map(p => p.rolle.name));
      const rollenOptionen = CHARAKTERE.filter(x => setRollen.includes(x.name)).map(x => {
        const vergeben = bereitsZugewieseneRollen.has(x.name);
        return `<option value="${escapeHtml(x.name)}" ${vergeben ? "disabled class=\"rolle-vergeben\"" : ""}>${escapeHtml(x.name)} – ${escapeHtml(x.rolle)}${vergeben ? " (bereits vergeben)" : ""}</option>`;
      }).join("");
      aktion+=`<div class="role-card"><h3>Aktion: Rolle erfahren</h3><label for="prophet-suche">Spieler suchen</label><input id="prophet-suche" type="search" placeholder="Namen eingeben …" autocomplete="off"><label for="prophet-ziel">Spieler</label><select id="prophet-ziel" required>${spielerOptionen("",[],true,[spielzustand.spieler.find(p=>p.rolle?.name===c.name)?.id].filter(Boolean))}</select><p id="prophet-ergebnis" class="notice">Wähle einen Spieler aus, um seine bekannte Rolle zu sehen. Falls sie noch unbekannt ist, kannst du sie hier nachschlagen und zuweisen.</p><label for="prophet-rolle">Manuell nachgeschlagene Rolle zuweisen</label><select id="prophet-rolle"><option value="">Keine manuelle Zuweisung</option>${rollenOptionen}</select><p class="muted small">Graue, deaktivierte Rollen sind bereits einem anderen Spieler zugewiesen.</p></div>`;
    }
    if(c.rolle==="Beschützer") {const david=spielzustand.spieler.find(p=>p.rolle?.name===c.name);aktion+=`<div class="role-card"><h3>Aktion: Beschützen</h3><label for="beschuetzer-ziel">Wen beschützt David?</label><select id="beschuetzer-ziel" required>${spielerOptionen(david?.rolle?.hatBeschützt||"",david?.rolle?.hatBeschützt?[david.rolle.hatBeschützt]:[],true)}</select><p class="muted small">Dieselbe Person darf nicht in zwei aufeinanderfolgenden Nächten beschützt werden.</p></div>`;}
    if(c.rolle==="Poet") {const r=spielzustand.spieler.find(p=>p.rolle?.name===c.name)?.rolle;aktion+=`<div class="role-card"><h3>Aktion: In Reimen sprechen</h3><label for="poet-ziel">Wer muss morgen in Reimen sprechen?</label><select id="poet-ziel" required>${spielerOptionen("",r?.hatInspiriert?[r.hatInspiriert]:[],true)}</select></div>`;}
    if(c.rolle==="Unruhestifter")aktion+=`<div class="role-card"><h3>Aktion: Rollen tauschen</h3><p>Jakob kann mit jedem anderen Spieler tauschen – auch dann, wenn dessen Rolle dem Spielleiter noch unbekannt ist.</p><label for="jakob-ziel">Mit wem tauscht Jakob die Rolle?</label><select id="jakob-ziel" required><option value="">Bitte auswählen …</option>${spielzustand.spieler.filter(p=>p.istAmLeben&&p.id!==spielzustand.spieler.find(x=>x.rolle?.name===c.name)?.id).map(p=>`<option value="${p.id}">${escapeHtml(p.name)} – ${p.rolle ? escapeHtml(p.rolle.name) : "Rolle noch unbekannt"}</option>`).join("")}</select></div>`;
    if(c.rolle==="Weiser") {const r=spielzustand.spieler.find(p=>p.rolle?.name===c.name)?.rolle;const opferId=spielzustand.nachtAktionen.moerderOpfer;const opfer=spielzustand.spieler.find(p=>p.id===opferId);const heilbaresOpfer=spielzustand.nachtAktionen.moerderOpferGetötet&&opfer&&!opfer.istAmLeben?opfer:null;aktion+=`<div class="role-card"><h3>Aktion: Heilen oder töten</h3><p>Die Mörder haben ${opfer?`<strong>${escapeHtml(opfer.name)}</strong>`:"kein Opfer"} ausgewählt.${heilbaresOpfer?" Diese Person wurde getötet.":" Es gibt kein von den Mördern getötetes Opfer, das du heilen kannst."}</p><label for="weiser-heilen">Mörderopfer heilen (oder niemanden)</label><select id="weiser-heilen" ${r?.hatGeheilt?'disabled':''}><option value="">Niemanden heilen</option>${heilbaresOpfer?`<option value="${heilbaresOpfer.id}">${escapeHtml(heilbaresOpfer.name)}</option>`:""}</select><label for="weiser-toeten">Lebenden Spieler zusätzlich töten</label><select id="weiser-toeten" ${r?.hatGetötet?'disabled':''}>${spielerOptionen("",[],true)}</select><p class="muted small">Jede Fähigkeit kann pro Spiel einmal eingesetzt werden.</p><p class="muted small">Bereits verstorben: ${escapeHtml(spielzustand.spieler.filter(p=>!p.istAmLeben).map(p=>p.name).join(", ") || "niemand")}</p></div>`;}
  }
  return `<section class="panel"><h2>2. Nachtaktion: ${chars.map(c=>escapeHtml(c.name)).join(" und ")}</h2>${chars.map(c=>`<p><strong>${escapeHtml(c.rolle)}:</strong> ${escapeHtml(c.funktion)}</p>`).join("")}<form id="nacht-aktion-form">${aktion}<div class="button-row"><button type="submit">Aktion bestätigen</button><button type="button" class="secondary" data-action="prioritaet-zurueck" ${spielzustand.nachtIndex<=0?"disabled":""}>Zurück</button></div></form>${meldungHtml()}</section>`;
}
function tagzuordnungBildschirm() {
  const gruppen = offeneTagCharaktere();
  const bereitsVergeben = spielzustand.spieler.filter((p) => p.rolle).map((p) => p.id);
  return `<section class="panel"><h2>Übrige Charaktere zuordnen</h2><p>Diese Charaktere wachen nachts nicht auf. Ordne sie den übrigen Spielern zu. Wenn nur eine unbekannte Rolle und ein offener Spieler übrig bleiben, werden sie automatisch einander zugeordnet.</p><form id="tagzuordnung-form">${gruppen.map(({ charakter }) => `<div class="role-card"><h3>${escapeHtml(charakter.rolle || charakter.name)}</h3><p class="muted small">${escapeHtml(charakter.name)}</p><label for="tag-${escapeHtml(charakter.name)}">Wer ist ${escapeHtml(charakter.name)}?</label><select id="tag-${escapeHtml(charakter.name)}" data-tag-role="${escapeHtml(charakter.name)}" required><option value="">Bitte auswählen …</option><option value="__unbekannt__">Unbekannt</option>${spielzustand.spieler.map((p) => `<option value="${p.id}" ${bereitsVergeben.includes(p.id) ? "disabled" : ""}>${escapeHtml(p.name)}</option>`).join("")}</select></div>`).join("")}<div class="button-row"><button type="submit">Zuordnung abschließen</button></div></form>${meldungHtml()}</section>`;
}
function fertigBildschirm() {
  const setRollen = spielzustand.ausgewaehltesSet?.rollen || [];
  const vergebeneRollen = new Set(spielzustand.spieler.filter(p => p.rolle?.name).map(p => p.rolle.name));
  const unbekannteSpieler = spielzustand.spieler.filter(p => !p.rolle);
  const simsonTot = spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben);
  const simsonFolgetodeErledigt = Boolean(spielzustand.nachtAktionen.simsonFolgetodeErledigt);
  const simsonOpferOptionen = (selectId) => `<select id="${selectId}"><option value="">Niemanden auswählen</option>${spielzustand.spieler.filter(p => p.istAmLeben && p.rolle?.name !== "Simson").map(p => `<option value="${p.id}">${escapeHtml(p.name)}${p.rolle?.name ? ` – ${escapeHtml(p.rolle.name)}` : " – Rolle noch unbekannt"}</option>`).join("")}</select>`;
  const optionenProSpieler = (spieler) => {
    const optionen = setRollen.map(name => {
      const charakter = CHARAKTERE.find(c => c.name === name);
      const vergeben = vergebeneRollen.has(name);
      return `<option value="${escapeHtml(name)}" ${vergeben ? "disabled" : ""}>${escapeHtml(name)}${charakter?.rolle ? ` – ${escapeHtml(charakter.rolle)}` : ""}${vergeben ? " (bereits zugeordnet)" : ""}</option>`;
    }).join("");
    return `<div class="role-card"><label for="nachtrag-${spieler.id}">${escapeHtml(spieler.name)}${spieler.istAmLeben ? "" : " (verstorben)"} – tatsächliche Rolle</label><select id="nachtrag-${spieler.id}" data-rollen-nachtrag="${spieler.id}"><option value="">Rolle noch unbekannt</option>${optionen}</select></div>`;
  };
  return `<section class="panel"><h2>Erste Nacht abgeschlossen</h2><p>Die Nachtaktionen und die Charakterzuordnung sind abgeschlossen.</p>${todesberichtHtml()}<ul class="player-list">${spielzustand.spieler.map((p) => `<li class="${p.istAmLeben ? "" : "dead-player"}"><span>${escapeHtml(p.name)}${p.istAmLeben ? "" : " (verstorben)"}</span><strong>${escapeHtml(p.rolle?.name ?? "Rolle noch unbekannt")}</strong></li>`).join("")}</ul>${unbekannteSpieler.length ? `<h3>Unbekannte Rollen nachtragen</h3><p>Wenn du die echte Rollenkarte eines Spielers aufgedeckt hast, kannst du die Rolle hier eintragen. Das funktioniert auch bei bereits verstorbenen Spielern.</p><form id="rollen-nachtrag-form">${unbekannteSpieler.map(optionenProSpieler).join("")}<div class="button-row"><button type="submit">Rollen speichern</button></div></form>` : `<p class="muted">Alle Spielerrollen sind zugeordnet.</p>`}${simsonTot && !simsonFolgetodeErledigt ? `<h3>Simsons letzte Tat</h3><p>Simson ist tot. Er kann 1–2 weitere lebende Spieler mit in den Tod reißen. Wähle mindestens eine Person; die zweite Auswahl ist optional.</p><form id="simson-folgetode-form"><label for="simson-opfer-1">Erste Person</label>${simsonOpferOptionen("simson-opfer-1")}<label for="simson-opfer-2">Zweite Person (optional)</label>${simsonOpferOptionen("simson-opfer-2")}<div class="button-row"><button type="submit">Todesopfer bestätigen</button></div></form>` : simsonTot && simsonFolgetodeErledigt ? `<p class="muted">Simsons letzte Tat wurde bereits abgewickelt.</p>` : ""}<div class="button-row"><button data-action="tagphase-starten">Zur Tagphase</button></div>${meldungHtml()}</section>`;
}

function todesberichtHtml() {
  const faelle = spielzustand.nachtAktionen.todesfaelle || [];
  if (!faelle.length) return '<p class="death-report muted">Niemand gestorben.</p>';
  const grundText = { Mörder: "Mörder", Hinrichtung: "Hinrichtung", Simson: "Simson", Bileam: "Bileam", Verliebt: "Verliebtheit", Salomo: "Salomo (Reim nicht eingehalten)" };
  return `<p class="death-report">${faelle.map(f => `<span>${escapeHtml(f.name)} – ${escapeHtml(f.rolle || "Rolle unbekannt")} (${escapeHtml(grundText[f.grund] || f.grund)})</span>`).join(" · ")}</p>`;
}
function rundenFusszeile() {
  if (!spielzustand.ausgewaehltesSet || ["spieler", "sets", "eigenesSet"].includes(spielzustand.aktuellerBildschirm)) return "";
  const tagBildschirme = ["tagphase", "tagbericht", "buergermeister"];
  const phase = spielzustand.aktuellerBildschirm === "spielende" ? "Spiel beendet" : tagBildschirme.includes(spielzustand.aktuellerBildschirm) ? "Tagphase" : spielzustand.aktuellerBildschirm === "fertig" || spielzustand.aktuellerBildschirm === "tagzuordnung" ? "Erste Nacht" : "Nachtphase";
  return `<footer class="round-footer"><span>Runde <strong>${Number(spielzustand.runde || 1)}</strong></span><span class="round-phase">${phase}</span></footer>`;
}
function nachtberichtBildschirm() {
  const simsonTot = spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben);
  const simsonOffen = simsonTot && !spielzustand.simsonFolgedeutErledigt;
  const ergebnis = siegPruefen();
  const nachricht = ergebnis.beendet ? `Das Spiel ist beendet: ${ergebnis.grund}` : "Die Nacht ist abgeschlossen. Prüfe die Todesfälle und fahre dann mit dem Tag fort.";
  const simsonOptions = id => `<select id="${id}" ${simsonOffen ? "required" : ""}><option value="">${id.endsWith("1") ? "Bitte auswählen …" : "Niemanden auswählen"}</option>${spielzustand.spieler.filter(p=>p.istAmLeben&&p.rolle?.name!=="Simson").map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>`;
  const simsonForm = simsonOffen ? `<h3>Simsons letzte Tat</h3><p>Simson ist in dieser oder einer früheren Phase gestorben und hat seine Fähigkeit noch nicht eingesetzt. Wähle mindestens eine und höchstens zwei lebende Personen.</p><form id="simson-folgetode-form"><label for="simson-opfer-1">Erste Person</label>${simsonOptions("simson-opfer-1")}<label for="simson-opfer-2">Zweite Person (optional)</label>${simsonOptions("simson-opfer-2")}<div class="button-row"><button type="submit">Todesopfer bestätigen</button></div></form>` : "";
  return `<section class="panel"><h2>Ergebnis der Nacht – Runde ${spielzustand.runde || 1}</h2><p>${escapeHtml(nachricht)}</p>${todesberichtHtml()}${simsonForm}<div class="button-row">${simsonOffen ? '<button disabled>Erst Simsons letzte Tat abwickeln</button>' : ergebnis.beendet ? '<button data-action="sieg-pruefen">Spielende anzeigen</button>' : '<button data-action="tagphase-starten">Zur Tagphase</button>'}</div>${meldungHtml()}</section>`;
}
function tagphaseBildschirm() {
  const lebende = spielzustand.spieler.filter(p => p.istAmLeben);
  const simsonTot = spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben);
  const simsonErledigt = Boolean(spielzustand.nachtAktionen.simsonFolgetodeErledigt);
  const options = lebende.map(p => `<option value="${p.id}">${escapeHtml(p.name)}${p.rolle?.name ? ` – ${escapeHtml(p.rolle.name)}` : ""}</option>`).join("");
  const simsonOptions = (id) => `<select id="${id}"><option value="">Niemanden auswählen</option>${lebende.filter(p=>p.rolle?.name!=="Simson").map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select>`;
  const nochHinrichten = !spielzustand.nachtAktionen.tagHinrichtungErledigt;
  const inspirierteIds = [...new Set(spielzustand.spieler.filter(p => p.rolle?.name === "Salomo" && p.rolle?.hatInspiriert).map(p => p.rolle.hatInspiriert))];
  const inspirierte = inspirierteIds.map(id => spielzustand.spieler.find(p => p.id === id && p.istAmLeben)).filter(Boolean);
  const reimHinweis = inspirierte.length ? `<div class="notice"><strong>In Reimen sprechen:</strong> ${inspirierte.map(p => escapeHtml(p.name)).join(", ")} wurde(n) von Salomo inspiriert und muss/müssen heute in Reimen sprechen. Falls das nicht gelingt, markiere die betroffene Person unten; sie stirbt sofort, und die Siegbedingungen werden direkt geprüft.${(spielzustand.reimFehlerIds || []).length ? ` Bereits vorgemerkt: ${spielzustand.reimFehlerIds.map(id => spielzustand.spieler.find(p => p.id === id)?.name).filter(Boolean).map(escapeHtml).join(", ")}.` : ""}</div><form id="reim-fehler-form"><label for="reim-fehler-opfer">Wer hat nicht in Reimen gesprochen?</label><select id="reim-fehler-opfer"><option value="">Niemanden auswählen</option>${inspirierte.map(p => `<option value="${p.id}">${escapeHtml(p.name)} – ${escapeHtml(p.rolle?.name || p.rolle?.rolle || "Rolle unbekannt")}</option>`).join("")}</select><div class="button-row"><button type="submit">Tod wegen fehlender Reime bestätigen</button></div></form>` : "";
  return `<section class="panel"><h2>Tagphase – Runde ${spielzustand.runde || 1}</h2>${reimHinweis}${todesberichtHtml()}${buergermeisterHtml()}${nochHinrichten ? `<form id="hinrichtung-form"><label for="hinrichtungs-opfer">Wer wird hingerichtet?</label><select id="hinrichtungs-opfer" required><option value="">Bitte lebende Person auswählen …</option>${options}</select><div class="button-row"><button type="submit">Hinrichtung bestätigen</button></div></form>` : `<p>Die Hinrichtung ist bereits bestätigt.</p>`}${simsonTot && !simsonErledigt ? `<h3>Simsons letzte Tat</h3><p>Simson kann 1–2 weitere lebende Spieler mit in den Tod reißen.</p><form id="tag-simson-form"><label for="tag-simson-1">Erste Person</label>${simsonOptions("tag-simson-1")}<label for="tag-simson-2">Zweite Person (optional)</label>${simsonOptions("tag-simson-2")}<div class="button-row"><button type="submit">Simsons Todesopfer bestätigen</button></div></form>` : ""}<div class="button-row"><button data-action="tagphase-abschliessen" ${nochHinrichten || (simsonTot && !simsonErledigt) ? "disabled" : ""}>Tag abschließen und Nacht beginnen</button></div>${meldungHtml()}</section>`;
}
function tagberichtBildschirm() {
  return `<section class="panel"><h2>Ergebnis des Tages – Runde ${spielzustand.runde || 1}</h2><p>Der Tag ist abgeschlossen. Hier sind die Todesfälle dieser Phase.</p>${todesberichtHtml()}<div class="button-row"><button data-action="nacht-starten">Nacht beginnen</button></div>${meldungHtml()}</section>`;
}
function buergermeisterHtml() {
  const bm = spielzustand.spieler.find(p => p.istBuergermeister);
  if (bm?.istAmLeben) return `<p>Bürgermeister: <strong>${escapeHtml(bm.name)}</strong></p>`;
  if (bm && !bm.istAmLeben) return `<p class="notice">Der bisherige Bürgermeister ${escapeHtml(bm.name)} ist tot. Der Spielleiter muss einen lebenden Nachfolger bestimmen.</p>`;
  return `<p class="muted">Es ist noch kein Bürgermeister eingetragen.</p>`;
}
function buergermeisterBildschirm() {
  const lebende = spielzustand.spieler.filter(p=>p.istAmLeben);
  return `<section class="panel"><h2>Bürgermeister eintragen</h2><p>Trage den vom Spielleiter mitgeteilten, tatsächlich gewählten lebenden Spieler ein. Ist der bisherige Bürgermeister gestorben, wird hier sein Nachfolger eingetragen.</p><form id="buergermeister-form"><label for="buergermeister-nachfolger">Nachfolger</label><select id="buergermeister-nachfolger" required><option value="">Bitte auswählen …</option>${lebende.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select><div class="button-row"><button type="submit">Nachfolger bestätigen</button></div></form>${meldungHtml()}</section>`;
}
function spielprotokollHtml() {
  const eintraege = spielzustand.protokoll || [];
  if (!eintraege.length) return '<p class="muted">Es wurden keine Protokolleinträge gespeichert.</p>';
  return `<div class="game-log">${eintraege.map(e => `<p><strong>Runde ${Number(e.runde || 1)} · ${escapeHtml(e.phase || "Spiel")}</strong> — ${escapeHtml(e.text)}</p>`).join("")}</div>`;
}
function spielendeBildschirm() {
  const ende = spielzustand.spielende || siegPruefen();
  return `<section class="panel"><h2>Spiel beendet</h2><p><strong>Sieger: ${escapeHtml(ende.sieger || "")}</strong></p><p>${escapeHtml(ende.grund || "")}</p>${todesberichtHtml()}<h3>Spielerstatus</h3><ul class="player-list">${spielzustand.spieler.map(p=>`<li class="${p.istAmLeben ? "" : "dead-player"}"><span>${escapeHtml(p.name)}${p.istAmLeben ? "" : " (tot)"}</span><strong>${escapeHtml(p.rolle?.name || "Rolle unbekannt")}</strong></li>`).join("")}</ul><h3>Spielprotokoll</h3>${spielprotokollHtml()}<div class="button-row"><button data-action="weitere-runde">Weitere Runde mit diesem Set</button><button class="secondary" data-action="spiel-zuruecksetzen">Neues Spiel</button></div></section>`;
}

function render() {
  const ansicht = {
    spieler: spielerBildschirm,
    sets: setBildschirm,
    eigenesSet: eigenesSetHtml,
    verteilung: verteilungBildschirm,
    tagzuordnung: tagzuordnungBildschirm,
    fertig: fertigBildschirm,
    nachtbericht: nachtberichtBildschirm,
    tagphase: tagphaseBildschirm,
    tagbericht: tagberichtBildschirm,
    buergermeister: buergermeisterBildschirm,
    spielende: spielendeBildschirm
  }[spielzustand.aktuellerBildschirm] ?? spielerBildschirm;
  app.innerHTML = ansicht() + rundenFusszeile();
  spielstandSpeichern();
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
  if (event.target.id === "reim-fehler-form") {
    const id = event.target.querySelector("#reim-fehler-opfer")?.value;
    const opfer = spielzustand.spieler.find(p => p.id === id && p.istAmLeben);
    if (!opfer) { spielzustand.meldung = "Wähle eine lebende, von Salomo inspirierte Person aus oder lasse das Feld leer."; render(); return; }
    const salomo = spielzustand.spieler.find(p => p.rolle?.name === "Salomo" && p.rolle?.hatInspiriert === id);
    if (!salomo) { spielzustand.meldung = "Diese Person ist aktuell nicht als von Salomo inspiriert vermerkt."; render(); return; }
    protokollieren(`${opfer.name} hält die Reimregel von Salomo nicht ein. Der Tod wird ausgelöst.`, "Tag");
    spielerUndVerliebteToeten([id], "Salomo");
    spielzustand.reimFehlerIds = (spielzustand.reimFehlerIds || []).filter(x => x !== id);
    spielzustand.meldung = `${opfer.name} ist wegen nicht eingehaltener Reimregel gestorben.`;
    const sieg = spielendePruefen();
    if (!sieg.beendet) {
      const simsonTot = spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben);
      if (simsonTot && !spielzustand.nachtAktionen.simsonFolgetodeErledigt) spielzustand.meldung += " Simson darf noch 1–2 Personen mit in den Tod reißen.";
    }
    render(); return;
  }
  if (event.target.id === "hinrichtung-form") {
    const id = event.target.querySelector("#hinrichtungs-opfer")?.value;
    const opfer = spielzustand.spieler.find(p => p.id === id && p.istAmLeben);
    if (!opfer) { spielzustand.meldung = "Bitte wähle einen lebenden Spieler aus."; render(); return; }
    const istDorfdepp = opfer.rolle?.rolle === "Dorfdepp" || opfer.rolle?.name === "Jona";
    protokollieren(`${opfer.name} wird vom Spielleiter zur Hinrichtung bestimmt.`, "Tag");
    todesfallHinzufuegen(opfer, "Hinrichtung");
    spielerUndVerliebteToeten([opfer.id], "Verliebt");
    spielzustand.nachtAktionen.tagHinrichtungErledigt = true;
    spielzustand.nachtAktionen.dorfdeppHinrichtung = istDorfdepp;
    spielzustand.meldung = `${opfer.name} wurde hingerichtet.`;
    if (istDorfdepp) { spielzustand.spielende = { beendet: true, grund: "Der Dorfdepp wurde am Tag hingerichtet.", sieger: "Dorfdepp" }; spielzustand.aktuellerBildschirm = "spielende"; }
    else { const simsonTot = spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben); if (!simsonTot || spielzustand.nachtAktionen.simsonFolgetodeErledigt) spielzustand.meldung += " Prüfe die weiteren Todesfolgen."; }
    render(); return;
  }
  if (event.target.id === "tag-simson-form") {
    const ids = [event.target.querySelector("#tag-simson-1")?.value, event.target.querySelector("#tag-simson-2")?.value].filter(Boolean);
    if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !spielzustand.spieler.some(p=>p.id===id&&p.istAmLeben&&p.rolle?.name!=="Simson"))) { spielzustand.meldung = "Wähle mindestens eine und höchstens zwei unterschiedliche lebende Personen."; render(); return; }
    protokollieren(`Simson nimmt ${ids.map(id => spielzustand.spieler.find(p => p.id === id)?.name || "unbekannt").join(" und ")} mit in den Tod.`, spielzustand.aktuellerBildschirm === "tagphase" ? "Tag" : "Nacht");
    spielerUndVerliebteToeten(ids, "Simson");
    spielzustand.nachtAktionen.simsonFolgetodeErledigt = true;
    spielzustand.simsonFolgedeutErledigt = true;
    spielzustand.meldung = "Simsons letzte Tat wurde abgewickelt.";
    render(); return;
  }
  if (event.target.id === "buergermeister-form") {
    const id = event.target.querySelector("#buergermeister-nachfolger")?.value;
    const next = spielzustand.spieler.find(p=>p.id===id&&p.istAmLeben);
    if (!next) { spielzustand.meldung = "Der Nachfolger muss leben."; render(); return; }
    protokollieren(`${next.name} wird vom Spielleiter als Bürgermeister eingetragen.`, "Tag");
    spielzustand.spieler.forEach(p=>p.istBuergermeister=false); next.istBuergermeister=true;
    spielzustand.aktuellerBildschirm = "tagphase"; spielzustand.meldung = `${next.name} ist neuer Bürgermeister.`; render(); return;
  }
  if (event.target.id === "spieler-form") {
    const input = document.querySelector("#spieler-name");
    const ergebnis = spielerHinzufuegen(input.value);
    spielzustand.meldung = ergebnis.meldung;
    render();
    if (ergebnis.ok) {
      const neuesNamensfeld = document.querySelector("#spieler-name");
      if (neuesNamensfeld) { neuesNamensfeld.value = ""; neuesNamensfeld.focus(); }
    }
    return;
  }
  if (event.target.id === "eigenes-set-form") {
    const daten = new FormData(event.target);
    const auswahl = Object.fromEntries(CHARAKTERE.map(c => [c.name, daten.has(c.name)]));
    const ergebnis = eigenesSetSpeichern(auswahl);
    spielzustand.meldung = ergebnis.meldung;
    if (ergebnis.ok) spielzustand.meldung = spielVerteilenStarten().meldung;
    render();
    return;
  }
  if (event.target.id === "nacht-namen-form") {
    const namen = aktuelleNamen();
    const zuordnungen = {};
    for (const name of namen) zuordnungen[name] = event.target.querySelector(`[data-night-role="${name}"]`)?.value || "";
    if (namen.some(name => !zuordnungen[name])) { spielzustand.meldung = "Bitte ordne jeden aufwachenden Charakter einem Spieler zu."; render(); return; }
    if (new Set(Object.values(zuordnungen)).size !== namen.length) { spielzustand.meldung = "Jeder Charakter muss einem anderen Spieler zugeordnet werden."; render(); return; }
    // Bereits bekannte Rollen dürfen erneut bestätigt werden, aber nur für
    // genau den Charakter, der diesem Spieler bereits zugewiesen ist.
    const konflikt = namen.find(name => {
      const person = spielzustand.spieler.find(p => p.id === zuordnungen[name]);
      return person?.rolle && person.rolle.name !== name;
    });
    if (konflikt) {
      spielzustand.meldung = "Dieser Spieler hat bereits eine andere Rolle erhalten. Die bestehende Zuordnung bleibt erhalten.";
      render();
      return;
    }
    // Eine Rolle wird nur neu gesetzt, wenn der Spieler noch keine Zuordnung hat.
    // Elisa kann so eine unbekannte Rolle vorab zuordnen, und die spätere
    // Namensabfrage dieses Charakters bestätigt dieselbe Person ohne Konflikt.
    for (const name of namen) {
      const person = spielzustand.spieler.find(p => p.id === zuordnungen[name]);
      if (!person.rolle) person.rolle = { ...CHARAKTERE.find(c => c.name === name) };
    }
    spielzustand.nachtZuordnungen = zuordnungen;
    spielzustand.nachtPhase = "aktion";
    spielzustand.meldung = "Namen wurden zugeordnet. Führe jetzt die Aktion aus.";
    render(); return;
  }
  if (event.target.id === "nacht-aktion-form") {
    const namen = aktuelleNamen();
    const chars = namen.map(n => CHARAKTERE.find(c => c.name === n)).filter(Boolean);
    const ownerByName = Object.fromEntries(namen.map(name => [name, spielzustand.spieler.find(p => p.id === spielzustand.nachtZuordnungen[name])]));
    const moerdergruppe = chars.length > 0 && chars.every(c => c.rolle === "Mörder");
    const actionValue = id => event.target.querySelector(id)?.value || "";
    let opferId = null, abraham = null, prophetZiel = null, prophetRolle = null, beschuetzerZiel = null, poetZiel = null, jakobZiel = null, heilenZiel = null, toetenZiel = null;
    if (moerdergruppe) {
      opferId = actionValue("#moerder-opfer");
      const opfer = spielzustand.spieler.find(p => p.id === opferId);
      if (!opfer || !opfer.istAmLeben) { spielzustand.meldung = "Die Mörder müssen einen lebenden Spieler als Opfer wählen."; render(); return; }
    }
    for (const c of chars) {
      if (c.name === "Abraham" && !ownerByName[c.name]?.rolle?.hatBereitsVerliebt) { const a=actionValue("#abraham-person1"), b=actionValue("#abraham-person2"); if(!a||!b||a===b||![a,b].every(id=>spielzustand.spieler.some(p=>p.id===id&&p.istAmLeben))){spielzustand.meldung="Wähle zwei unterschiedliche, lebende Personen für Abraham.";render();return;} abraham=[a,b]; }
      if (c.rolle === "Prophet") {
        prophetZiel=actionValue("#prophet-ziel"); prophetRolle=actionValue("#prophet-rolle");
        const target=spielzustand.spieler.find(p=>p.id===prophetZiel);
        if(!target||!target.istAmLeben||target.id===ownerByName[c.name]?.id){spielzustand.meldung="Elisa darf nur eine andere, lebende Person auswählen.";render();return;}
        if(!target.rolle && !prophetRolle){spielzustand.meldung="Die Rolle ist noch unbekannt. Wähle die manuell nachgeschlagene Rolle aus.";render();return;}
        if(prophetRolle && !spielzustand.ausgewaehltesSet?.rollen.includes(prophetRolle)){spielzustand.meldung="Diese Rolle gehört nicht zum ausgewählten Set.";render();return;}
        if(prophetRolle && target.rolle && target.rolle.name!==prophetRolle){spielzustand.meldung="Dieser Spieler hat bereits eine andere Rolle. Die Zuordnung wurde nicht überschrieben.";render();return;}
        if(prophetRolle && spielzustand.spieler.some(p=>p.id!==target.id && p.rolle?.name===prophetRolle)){spielzustand.meldung="Diese Rolle ist bereits einem anderen Spieler zugewiesen.";render();return;}
      }
      if (c.rolle === "Beschützer") { beschuetzerZiel=actionValue("#beschuetzer-ziel"); if(!beschuetzerZiel||!spielzustand.spieler.some(p=>p.id===beschuetzerZiel&&p.istAmLeben)){spielzustand.meldung="David darf nur eine lebende Person beschützen.";render();return;} if(ownerByName[c.name]?.rolle?.hatBeschützt===beschuetzerZiel){spielzustand.meldung="David darf nicht dieselbe Person wie in der vorherigen Nacht beschützen.";render();return;} }
      if (c.rolle === "Poet") { poetZiel=actionValue("#poet-ziel"); if(!poetZiel||!spielzustand.spieler.some(p=>p.id===poetZiel&&p.istAmLeben)){spielzustand.meldung="Salomo darf nur eine lebende Person auswählen.";render();return;} if(ownerByName[c.name]?.rolle?.hatInspiriert===poetZiel){spielzustand.meldung="Salomo darf nicht dieselbe Person wie in der vorherigen Nacht inspirieren.";render();return;} }
      if (c.rolle === "Unruhestifter") { jakobZiel=actionValue("#jakob-ziel"); if(!jakobZiel||jakobZiel===ownerByName[c.name]?.id||!spielzustand.spieler.some(p=>p.id===jakobZiel&&p.istAmLeben)){spielzustand.meldung="Jakob muss eine andere, lebende Person auswählen.";render();return;} }
      if (c.rolle === "Weiser") { const r=ownerByName[c.name]?.rolle; heilenZiel=actionValue("#weiser-heilen"); toetenZiel=actionValue("#weiser-toeten"); const heilbaresOpfer=spielzustand.spieler.find(p=>p.id===spielzustand.nachtAktionen.moerderOpfer&&spielzustand.nachtAktionen.moerderOpferGetötet&&!p.istAmLeben); if(heilenZiel&&r?.hatGeheilt){spielzustand.meldung="Bileam hat seine Heilfähigkeit bereits eingesetzt.";render();return;} if(toetenZiel&&r?.hatGetötet){spielzustand.meldung="Bileam hat seine Tötungsfähigkeit bereits eingesetzt.";render();return;} if(heilenZiel&&(!heilbaresOpfer||heilenZiel!==heilbaresOpfer.id)){spielzustand.meldung="Bileam darf nur das von den Mördern getötete Opfer heilen.";render();return;} if(toetenZiel&&!spielzustand.spieler.some(p=>p.id===toetenZiel&&p.istAmLeben)){spielzustand.meldung="Bileam kann nur einen lebenden Spieler töten.";render();return;} if(heilenZiel&&heilenZiel===toetenZiel){spielzustand.meldung="Heilen und töten müssen unterschiedliche Spieler betreffen.";render();return;} }
    }
    // Jede bestätigte Charakteraktion wird zum Zeitpunkt ihrer Ausführung protokolliert.
    if (moerdergruppe) {
      const ziel = spielzustand.spieler.find(p => p.id === opferId);
      protokollieren(`Die Mörder wählen ${ziel?.name || "ein unbekanntes Opfer"} als Ziel.`);
    }
    if (abraham) {
      const [a, b] = abraham.map(id => spielzustand.spieler.find(p => p.id === id));
      protokollieren(`Abraham verliebt ${a?.name || "unbekannt"} und ${b?.name || "unbekannt"} miteinander.`);
    }
    if (prophetZiel) {
      const ziel = spielzustand.spieler.find(p => p.id === prophetZiel);
      protokollieren(`Elisa untersucht die Rolle von ${ziel?.name || "einem unbekannten Spieler"}${prophetRolle ? `; manuelle Zuordnung: ${prophetRolle}` : "."}`);
    }
    if (beschuetzerZiel) protokollieren(`David beschützt ${spielzustand.spieler.find(p => p.id === beschuetzerZiel)?.name || "einen unbekannten Spieler"}.`);
    if (poetZiel) protokollieren(`Salomo inspiriert ${spielzustand.spieler.find(p => p.id === poetZiel)?.name || "einen unbekannten Spieler"}; diese Person muss am Tag in Reimen sprechen.`);
    if (heilenZiel) protokollieren(`Bileam heilt ${spielzustand.spieler.find(p => p.id === heilenZiel)?.name || "das ausgewählte Opfer"}.`);
    if (toetenZiel) protokollieren(`Bileam versucht, ${spielzustand.spieler.find(p => p.id === toetenZiel)?.name || "einen unbekannten Spieler"} zu töten.`);
    if (jakobZiel) protokollieren(`Jakob tauscht seine Rolle mit ${spielzustand.spieler.find(p => p.id === jakobZiel)?.name || "einem unbekannten Spieler"}.`);
    spielzustand.meldung = "";
    if (prophetZiel) {
      const target=spielzustand.spieler.find(p=>p.id===prophetZiel);
      if(prophetRolle && !target.rolle) { target.rolle={...CHARAKTERE.find(c=>c.name===prophetRolle)}; spielzustand.meldung=`Manuelle Zuordnung gespeichert: ${target.name} ist ${prophetRolle} (${target.rolle.rolle}).`; }
      else spielzustand.meldung=`Der Prophet erfährt: ${target.name} hat die Rolle „${target.rolle.rolle}“ (${target.rolle.name}).`;
    }
    if (abraham) { const [a,b]=abraham.map(id=>spielzustand.spieler.find(p=>p.id===id)); a.verliebtMit=[...new Set([...(a.verliebtMit||[]),b.id])]; b.verliebtMit=[...new Set([...(b.verliebtMit||[]),a.id])]; ownerByName.Abraham.rolle.hatBereitsVerliebt=true; }
    if (beschuetzerZiel) { ownerByName[chars.find(c=>c.rolle==="Beschützer").name].rolle.hatBeschützt=beschuetzerZiel; spielzustand.nachtAktionen.beschützt=beschuetzerZiel; }
    if (poetZiel) ownerByName[chars.find(c=>c.rolle==="Poet").name].rolle.hatInspiriert=poetZiel;
    if (moerdergruppe) {
      const opfer=spielzustand.spieler.find(p=>p.id===opferId);
      const beschuetzerZielId=spielzustand.nachtAktionen.beschützt;
      const david=spielzustand.spieler.find(p=>p.rolle?.name==="David" || p.rolle?.name==="Beschützer");
      if (opferId===david?.id) {
        if (beschuetzerZielId===opferId) {
          // David hat sich selbst beschützt und wird angegriffen: Nur David stirbt.
          todesfallHinzufuegen(david, "Mörder");
          spielzustand.nachtAktionen.moerderOpfer=david.id;
          spielzustand.nachtAktionen.moerderOpferGetötet=true;
          spielzustand.meldung="David hat sich selbst beschützt und stirbt durch den Angriff der Mörder.";
        } else {
          // Ein gezielter Angriff auf David hat sonst keinen Effekt.
          protokollieren("Die Mörder greifen David an; der Angriff bleibt wirkungslos, weil er sich nicht selbst beschützt hat.");
          spielzustand.nachtAktionen.moerderOpfer=opferId;
          spielzustand.nachtAktionen.moerderOpferGetötet=false;
          // Der Angriff bleibt für die Spielleitung unsichtbar wirkungslos; der Ablauf geht normal weiter.
        }
      } else if (beschuetzerZielId===opferId) {
        // David opfert sich: Nur David stirbt; die beschützte Person bleibt am Leben.
        if (david) { todesfallHinzufuegen(david, "Mörder"); spielzustand.nachtAktionen.moerderOpfer=david.id; }
        else { spielzustand.nachtAktionen.moerderOpfer=opferId; }
        spielzustand.nachtAktionen.moerderOpferGetötet=true;
        spielzustand.meldung=david ? `David hat ${opfer.name} beschützt und stirbt stattdessen durch den Angriff der Mörder.` : `${opfer.name} wurde von den Mördern getötet.`;
      } else {
        spielzustand.nachtAktionen.moerderOpfer=opferId;
        spielzustand.nachtAktionen.moerderOpferGetötet=true;
        todesfallHinzufuegen(opfer, "Mörder");
      }
    }
    if (heilenZiel) {const target=spielzustand.spieler.find(p=>p.id===heilenZiel);target.istAmLeben=true;spielzustand.nachtAktionen.todesfaelle=(spielzustand.nachtAktionen.todesfaelle||[]).filter(f=>f.spielerId!==target.id);ownerByName[chars.find(c=>c.rolle==="Weiser").name].rolle.hatGeheilt=true;}
    if (toetenZiel) {
      const target = spielzustand.spieler.find(p => p.id === toetenZiel);
      const david = spielzustand.spieler.find(p => p.rolle?.name === "David" || p.rolle?.name === "Beschützer");
      const davidSchuetztZiel = david && spielzustand.nachtAktionen.beschützt === target.id;
      if (target.rolle?.name === "David" || target.rolle?.name === "Beschützer") {
        // Bileams direkter Angriff auf David bleibt wie bisher wirkungslos.
        protokollieren(`Bileam versucht, David zu töten. Der Angriff bleibt wirkungslos.`);
      } else if (davidSchuetztZiel) {
        todesfallHinzufuegen(david, "Bileam");
        spielzustand.meldung = `${david.name} stirbt durch Bileam, weil er ${target.name} beschützt hat. ${target.name} überlebt.`;
      } else {
        todesfallHinzufuegen(target, "Bileam");
      }
      ownerByName[chars.find(c => c.rolle === "Weiser").name].rolle.hatGetötet = true;
    }
    if (jakobZiel) {
      const c=chars.find(x=>x.rolle==="Unruhestifter"), owner=ownerByName[c.name], other=spielzustand.spieler.find(p=>p.id===jakobZiel);
      const oldOwn=owner.rolle, oldOther=other.rolle;
      const reset=role=>{const template=CHARAKTERE.find(x=>x.name===role?.name);return template?{...template}:null;};
      owner.rolle=reset(oldOther); other.rolle=reset(oldOwn);
      // Nachtcharaktere ist die vor Beginn festgelegte Liste: der neue Jakob wird diese Nacht nicht erneut aufgerufen.
      spielzustand.verbrauchteNachtCharaktere=[...(spielzustand.verbrauchteNachtCharaktere||[]),c.name];
    }
    spielzustand.nachtPhase = "einschlafen";
    if (!spielzustand.meldung) spielzustand.meldung = "Aktion ausgeführt und bestätigt. Prüfe das Ergebnis und gehe anschließend zum Einschlafen.";
    render(); return;
  }
  if (event.target.id === "tagzuordnung-form") {
    const zuordnungen = {};
    for (const select of event.target.querySelectorAll("[data-tag-role]")) zuordnungen[select.dataset.tagRole] = select.value;
    const ergebnis = tagCharaktereZuordnen(zuordnungen);
    spielzustand.meldung = ergebnis.meldung;
    render();
    return;
  }
  if (event.target.id === "simson-folgetode-form") {
    const ersteId = event.target.querySelector("#simson-opfer-1")?.value || "";
    const zweiteId = event.target.querySelector("#simson-opfer-2")?.value || "";
    const ids = [ersteId, zweiteId].filter(Boolean);
    if (!spielzustand.spieler.some(p => p.rolle?.name === "Simson" && !p.istAmLeben)) {
      spielzustand.meldung = "Simsons Fähigkeit ist nur verfügbar, wenn Simson tot ist.";
      render();
      return;
    }
    if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !spielzustand.spieler.some(p => p.id === id && p.istAmLeben && p.rolle?.name !== "Simson"))) {
      spielzustand.meldung = "Wähle mindestens eine und höchstens zwei unterschiedliche, lebende Personen aus.";
      render();
      return;
    }
    protokollieren(`Simson nimmt ${ids.map(id => spielzustand.spieler.find(p => p.id === id)?.name || "unbekannt").join(" und ")} mit in den Tod.`, spielzustand.aktuellerBildschirm === "tagphase" ? "Tag" : "Nacht");
    spielerUndVerliebteToeten(ids, "Simson");
    spielzustand.nachtAktionen.simsonFolgetodeErledigt = true;
    spielzustand.simsonFolgedeutErledigt = true;
    spielzustand.meldung = `Simsons letzte Tat wurde ausgeführt. ${ids.length} ausgewählte Person${ids.length === 1 ? " wurde" : "en wurden"} und gegebenenfalls deren Verliebte sind nun tot.`;
    render();
    return;
  }
  if (event.target.id === "rollen-nachtrag-form") {
    const nachtraege = [...event.target.querySelectorAll("[data-rollen-nachtrag]")]
      .map(select => ({ spielerId: select.dataset.rollenNachtrag, rollenName: select.value }))
      .filter(eintrag => eintrag.rollenName);
    const ids = new Set();
    const rollen = new Set();
    for (const eintrag of nachtraege) {
      const spieler = spielzustand.spieler.find(p => p.id === eintrag.spielerId);
      if (!spieler || spieler.rolle || !spielzustand.ausgewaehltesSet?.rollen.includes(eintrag.rollenName) || vergebeneRolleDurchAndere(eintrag.rollenName, spieler.id) || ids.has(spieler.id) || rollen.has(eintrag.rollenName)) {
        spielzustand.meldung = "Die Rollen konnten nicht gespeichert werden: Bitte ordne nur unbekannten Spielern noch nicht vergebene Rollen aus dem ausgewählten Set zu.";
        render();
        return;
      }
      ids.add(spieler.id);
      rollen.add(eintrag.rollenName);
    }
    for (const eintrag of nachtraege) {
      const spieler = spielzustand.spieler.find(p => p.id === eintrag.spielerId);
      spieler.rolle = { ...CHARAKTERE.find(c => c.name === eintrag.rollenName) };
    }
    spielzustand.meldung = nachtraege.length ? `Rollen für ${nachtraege.length} Spieler nachgetragen.` : "Es wurden keine Rollen geändert.";
    render();
  }
});

function vergebeneRolleDurchAndere(rollenName, spielerId) {
  return spielzustand.spieler.some(p => p.id !== spielerId && p.rolle?.name === rollenName);
}

app.addEventListener("input", (event) => {
  if (event.target.id !== "prophet-suche") return;
  const select = document.querySelector("#prophet-ziel");
  if (!select) return;
  const query = event.target.value.trim().toLocaleLowerCase("de");
  const matches = [...select.options].filter((option, index) => index > 0 && option.textContent.toLocaleLowerCase("de").includes(query));
  [...select.options].forEach((option, index) => {
    if (index === 0) { option.hidden = false; return; }
    option.hidden = Boolean(query) && !option.textContent.toLocaleLowerCase("de").includes(query);
  });
  // Bei einer eindeutigen Namenssuche den Spieler direkt auswählen und seine Rolle anzeigen.
  if (query && matches.length === 1) {
    select.value = matches[0].value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "prophet-ziel" || event.target.id === "prophet-rolle") {
    const select = document.querySelector("#prophet-ziel");
    const target = spielzustand.spieler.find(p => p.id === select?.value);
    const result = document.querySelector("#prophet-ergebnis");
    const manuell = document.querySelector("#prophet-rolle")?.value;
    if (result) {
      if (!target) result.textContent = "Suche einen Spielernamen oder wähle einen Spieler aus.";
      else if (target.rolle) result.textContent = `${target.name}: ${target.rolle.rolle} (${target.rolle.name}).`;
      else if (manuell) result.textContent = `${target.name}: Manuell ausgewählt: ${CHARAKTERE.find(c => c.name === manuell)?.rolle || manuell} (${manuell}). Die Zuordnung wird bei „Aktion bestätigen“ gespeichert.`;
      else result.textContent = `${target.name}: Rolle noch unbekannt. Schaue die Rolle im Spielmaterial nach und wähle sie im Feld darunter aus.`;
    }
  }
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
  else if (action === "nacht-einschlafen") naechstePrioritaet();
  else if (action === "tagzuordnung-oeffnen") spielzustand.aktuellerBildschirm = "tagzuordnung";
  else if (action === "tagphase-starten") {
    protokollieren("Die Nacht endet; die Tagphase beginnt.", "Übergang");
    spielzustand.ersteNachtAbgeschlossen = true;
    const sieg = siegPruefen();
    if (sieg.beendet) {
      spielzustand.spielende = sieg;
      spielzustand.aktuellerBildschirm = "spielende";
    } else {
      spielzustand.nachtAktionen = { todesfaelle: [], simsonFolgetodeErledigt: Boolean(spielzustand.simsonFolgedeutErledigt), tagHinrichtungErledigt: false };
      spielzustand.aktuellerBildschirm = "tagphase";
      bürgermeisterPruefen();
    }
  }
  else if (action === "tagphase-abschliessen") {
    protokollieren("Die Tagphase wird abgeschlossen.", "Tag");
    // Todesfälle (einschließlich sofortiger Folgen bei nicht eingehaltenen Reimen)
    // sind bereits bei der jeweiligen Bestätigung abgewickelt.
    const sieg = spielendePruefen();
    if (!sieg.beendet) {
      const brauchtBuergermeister = bürgermeisterPruefen();
      if (!brauchtBuergermeister) spielzustand.aktuellerBildschirm = "tagbericht";
    }
  }
  else if (action === "nacht-starten") {
    protokollieren("Die Nacht beginnt.", "Übergang");
    spielzustand.runde = Number(spielzustand.runde || 1) + 1;
    spielzustand.nachtAktionen = { todesfaelle: [], verliebtTodesfaelleAbgewickelt: false, simsonFolgetodeErledigt: Boolean(spielzustand.simsonFolgedeutErledigt) };
    const nachtChars = spielzustand.spieler.filter(p=>p.istAmLeben && p.rolle?.wachtAuf && !(p.rolle?.name === "Abraham" && p.rolle?.hatBereitsVerliebt)).map(p=>p.rolle).sort((a,b)=>a.prioritaet-b.prioritaet || a.name.localeCompare(b.name,"de"));
    spielzustand.nachtCharaktere = nachtChars.map(c=>c.name);
    spielzustand.nachtZuordnungen = Object.fromEntries(spielzustand.spieler.filter(p=>p.istAmLeben&&p.rolle).map(p=>[p.rolle.name,p.id]));
    spielzustand.nachtIndex = 0; spielzustand.nachtPhase = "aktion"; spielzustand.aktuellePrioritaet = nachtChars[0]?.prioritaet ?? 18;
    spielzustand.aktuellerBildschirm = nachtChars.length ? "verteilung" : "nachtbericht";
  }
  else if (action === "sieg-pruefen") spielendePruefen();
  else if (action === "weitere-runde") {
    // Set und Spielernamen bleiben erhalten; Rollen, Fähigkeiten und Spielereignisse starten neu.
    const start = spielVerteilenStarten();
    spielzustand.meldung = start.ok ? "Neue Runde mit demselben Charakter-Set gestartet." : start.meldung;
  }
  else if (action === "spiel-zuruecksetzen") spielZuruecksetzen();
  render();
});

export function oberflaecheStarten() { spielstandLaden(); render(); window.addEventListener("pagehide", spielstandSpeichern); }
