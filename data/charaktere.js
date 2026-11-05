/*
 * Zentrale Definition aller Charaktere.
 *
 * Der eindeutige Charaktername wird als Schlüssel verwendet.
 * Mehrere Charaktere dürfen dieselbe allgemeine Rolle besitzen.
 * Jeder konkrete Charakter darf pro Spiel höchstens einmal vorkommen.
 *
 * 'prioritaet' bestimmt die Reihenfolge bei der Rollenverteilung.
 * 'attribute' bzw. charakter-spezifische Eigenschaften werden bei Bedarf
 * direkt am jeweiligen Charakter hinterlegt.
 */
export const CHARAKTERE = [
  // Echte Charaktere
  {
    name: "Bileam",
    rolle: "Weiser",
    funktion: "Kann das von den Mördern ausgewählte Opfer heilen und zusätzlich einen lebenden Spieler töten. Jede Fähigkeit ist einmal pro Spiel möglich; beide können in derselben Nacht eingesetzt werden.",
    prioritaet: 6,
    wachtAuf: true,
    hatGeheilt: false,
    hatGetötet: false
  },
  {
    name: "Salomo",
    rolle: "Poet",
    funktion: "Inspiriert jede Nacht einen lebenden Spieler. Dieser muss am folgenden Tag ausschließlich in Reimen sprechen und mindestens einen Satz sagen. Sollte er das nicht tun, stribt er sofort.",
    prioritaet: 3,
    wachtAuf: true,
    // Kann nicht zwei Mal nacheinander dieselbe Person inspirieren.
    // Der entsprechende Spieler wird in diesem Attribut vermerkt.
    hatInspiriert: null
  },
  {
    name: "Jona",
    rolle: "Dorfdepp",
    funktion: "Gewinnt das Spiel, wenn er tagsüber durch eine Abstimmung hingerichtet wird. Auf andere Weise kann er nicht gewinnen.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Abraham",
    rolle: "Vermittler",
    funktion: "Kann zwei lebende Spieler miteinander verlieben. Stirbt einer, stirbt auch der andere.",
    prioritaet: 0,
    wachtAuf: true,
    // Wacht nur auf, wenn er noch keinen verliebt hat.
    hatBereitsVerliebt: false
  },
  {
    name: "Mordechai",
    rolle: "Beobachter",
    funktion: "Beobachtet und deckt Geheimnisse auf <Esther 2,19-23>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Jakob",
    rolle: "Unruhestifter",
    funktion: "Kann nachts seine Rollenkarte mit der eines anderen lebenden Spielers tauschen. Ab der nächsten Nacht übernehmen beide ihre neue Rolle und können dessen Fähigkeiten nutzen; bereits ausgeführte Aktionen bleiben bestehen.",
    prioritaet: 7,
    wachtAuf: true
  },
  {
    name: "Hanna",
    rolle: "Dorfbewohner",
    funktion: "Gläubige Mutter, die ihr Versprechen hält <1. Samuel 1,10-11+20>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Ruth",
    rolle: "Dorfbewohner",
    funktion: "Liebende Schwiegertochter und treue Gefährtin <Ruth 1,16-17>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Petrus",
    rolle: "Dorfbewohner",
    funktion: "Ein störrischer Fischer und Jünger von Jesus <Matthäus 14,28-31>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Nehemia",
    rolle: "Dorfbewohner",
    funktion: "Inspirierender Führer und Bauleiter in Jerusalem <Nehemia 2,17-18>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Martha",
    rolle: "Dorfbewohner",
    funktion: "Eine treue und fleißige Hausfrau <Lukas 10,38-42>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Abigail",
    rolle: "Dorfbewohner",
    funktion: "Klug, besonnen und weiß, wie man Konflikte entschärft <1. Samuel 25,2-42>.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "David",
    rolle: "Beschützer",
    funktion: "Wählt jede Nacht einen lebenden Spieler, den er vor dem Angriff der Mörder schützt. David darf sich selbst schützen; wird er dann von den Mördern angegriffen, stirbt er.",
    prioritaet: 2,
    wachtAuf: true,
    // David kann nicht zwei Mal nacheinander dieselbe Person beschützen.
    hatBeschützt: null
  },
  {
    name: "Elisa",
    rolle: "Prophet",
    funktion: "Wählt jede Nacht einen anderen lebenden Spieler und erfährt dessen genaue Rolle.",
    prioritaet: 1,
    wachtAuf: true
  },
  {
    name: "Simson",
    rolle: "Richter",
    funktion: "Wenn Simson stirbt, darf er ein oder zwei seiner nächsten noch lebenden Sitznachbarn mit in den Tod reißen.",
    prioritaet: 18,
    wachtAuf: false
  },
  {
    name: "Judas",
    rolle: "Mörder",
    funktion: "Wacht nachts gemeinsam mit den anderen Mördern auf. Die Mörder einigen sich lautlos auf einen lebenden Spieler, den sie töten wollen.",
    prioritaet: 5,
    wachtAuf: true
  },
  {
    name: "Atalja",
    rolle: "Mörder",
    funktion: "Wacht nachts gemeinsam mit den anderen Mördern auf. Die Mörder einigen sich lautlos auf einen lebenden Spieler, den sie töten wollen.",
    prioritaet: 5,
    wachtAuf: true
  },
  {
    name: "Isebel",
    rolle: "Mörder",
    funktion: "Wacht nachts gemeinsam mit den anderen Mördern auf. Die Mörder einigen sich lautlos auf einen lebenden Spieler, den sie töten wollen.",
    prioritaet: 5,
    wachtAuf: true
  }
];

// Liefert die Charakterdefinition anhand des eindeutigen Namens oder undefined.
export function charakterNachName(name) {
  return CHARAKTERE.find((charakter) => charakter.name === name);
}
