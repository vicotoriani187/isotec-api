const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { generateGptText } = require("./gpt");
const { generateWord } = require("./export");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const preise = {
  "Innenabdichtung": 450,
  "Sanierputz": 0,
  "Horizontalsperre": 420,
  "Creme-Injektion": 320,
  "Klimaplatte": 300,
  "Klimaplatte-Upgrade": 130,
  "Außenabdichtung": 400,
  "Kellerbodensanierung": 300,
  "Flexband mit Injektion": 590,
  "Balkonsanierung": 1100
};

const ansprechpartnerListe = [
  { name: "Ben Luca Costa", position: "Sachverständiger", telefon: "0170-8062758", email: "ben.costa@isotec-barowski.de" },
  { name: "Victor Costa", position: "Geschäftsführer", telefon: "0171-8340624", email: "victor.costa@isotec.de" },
  { name: "Joshua Kern", position: "Baufeuchte- & Schimmelexperte", telefon: "0157-85510544", email: "joshua.kern@isotec-barowski.de" },
  { name: "Matthias Skibicki", position: "Technischer Berater", telefon: "0160-90920980", email: "matthias.skibicki@isotec-barowski.de" }
];

app.post("/analyse-schaden-optimiert", (req, res) => {
  const { schadensbild } = req.body;
  const lower = schadensbild.toLowerCase();

  let schadenstyp = "Unbekannt";
  let sanierungsloesung = "Noch keine Lösung verfügbar";
  let kundenvorteil = "";

  if (lower.includes("aufsteigend") || lower.includes("bodenfeuchtigkeit")) {
    schadenstyp = "Aufsteigende Feuchtigkeit";
    sanierungsloesung = "Horizontalsperre im Injektionsverfahren";
    kundenvorteil = "Sicherer Schutz gegen kapillar aufsteigende Feuchte, langfristige Werterhaltung";
  } else if (lower.includes("seitlich") || lower.includes("erdreich") || lower.includes("wandfeuchtigkeit")) {
    schadenstyp = "Seitlich eindringende Feuchtigkeit";
    sanierungsloesung = "Innenabdichtung mit abgestimmtem Sanierputzsystem";
    kundenvorteil = "Dauerhafter Feuchteschutz, saubere Wandflächen, angenehmes Raumklima";
  } else if (lower.includes("schimmel") || lower.includes("kondensat") || lower.includes("klimaplatte")) {
    schadenstyp = "Kondensationsschaden";
    sanierungsloesung = "Innendämmung mit ISOTEC-Klimaplatte";
    kundenvorteil = "Vermeidung von Schimmel, angenehmes Raumklima, Wertsteigerung der Immobilie";
  } else if (lower.includes("riss") || lower.includes("wand-sohlen")) {
    schadenstyp = "Riss im Wand-Sohlenanschluss";
    sanierungsloesung = "Rissinjektion + Flexbandsystem";
    kundenvorteil = "Dichte Übergänge ohne Freilegung, geprüftes System mit hoher Flexibilität";
  } else if (lower.includes("balkon") || lower.includes("terrasse")) {
    schadenstyp = "Defekte Balkon-/Terrassenabdichtung";
    sanierungsloesung = "ISOTEC-Balkonsanierung mit Spezialbeschichtung";
    kundenvorteil = "Dauerhafte Abdichtung, optische Aufwertung, geprüfte Materialien";
  }

  res.json({ schadenstyp, sanierungsloesung, kundenvorteil });
});

app.post("/kalkulation-optimiert", (req, res) => {
  const { gewerke, flaeche_qm, alternativen = [] } = req.body;

  if (!gewerke || !Array.isArray(gewerke) || typeof flaeche_qm !== "number") {
    return res.status(400).json({ error: "Ungültige Eingabe." });
  }

  const details = gewerke.map(g => {
    const preis = preise[g] || 0;
    return {
      gewerk: g,
      preisProQm: preis,
      teilpreis: Math.round(preis * flaeche_qm * 100) / 100
    };
  });

  const alternativpreise = alternativen.map(a =>
    Math.round(a.flaeche_qm * (a.preis_pro_qm + (a.aufpreis_pro_qm || 0)) * 100) / 100
  );

  const gesamtpreis = details.reduce((sum, p) => sum + p.teilpreis, 0) + alternativpreise.reduce((sum, p) => sum + p, 0);

  res.json({ details, alternativpreise, gesamtpreis });
});

app.get("/ansprechpartner-name", (req, res) => {
  const { name } = req.query;
  const match = ansprechpartnerListe.find(a =>
    a.name.toLowerCase().includes(name.toLowerCase())
  );
  if (match) return res.json(match);
  res.status(404).json({ error: "Kein Ansprechpartner gefunden" });
});

app.post("/generate-auswertung", async (req, res) => {
  const input = req.body;

  try {
    const innen = input.massnahme.flaeche_qm * preise["Innenabdichtung"];
    const injektion = input.horizontalsperre.laenge_m * preise["Creme-Injektion"];
    const standard = innen + injektion;
    const variante2 = standard + (input.alternativen?.[0]?.flaeche_qm || 0) * (input.alternativen?.[0]?.preis_pro_qm || 0);
    const variante3 = variante2 + (input.massnahme.flaeche_qm * (input.alternativen?.[1]?.aufpreis_pro_qm || 0));
    input.kalkulation = { standard, variante2, variante3 };

    const gptText = await generateGptText(input, input.kalkulation);
    if (!gptText) return res.status(500).json({ error: "GPT-Antwort ist leer." });

    const wordPath = await generateWord(input, gptText);
    return res.json({ bericht: gptText, file: wordPath });
  } catch (error) {
    console.error("❌ Fehler bei /generate-auswertung:", error.message);
    return res.status(500).json({ error: "Fehler bei der Auswertung." });
  }
});

app.listen(port, () => {
  console.log(`🚀 ISOTEC-API läuft auf Port ${port}`);
});
