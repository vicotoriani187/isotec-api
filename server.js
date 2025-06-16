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

// Preislisten
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

// Ansprechpartnerliste
const ansprechpartnerListe = [
  {
    name: "Ben Luca Costa",
    position: "Sachverständiger",
    telefon: "0170-8062758",
    email: "ben.costa@isotec-barowski.de"
  },
  {
    name: "Victor Costa",
    position: "Geschäftsführer",
    telefon: "0171-8340624",
    email: "victor.costa@isotec.de"
  },
  {
    name: "Joshua Kern",
    position: "Baufeuchte- & Schimmelexperte",
    telefon: "0157-85510544",
    email: "joshua.kern@isotec-barowski.de"
  },
  {
    name: "Matthias Skibicki",
    position: "Technischer Berater",
    telefon: "0160-90920980",
    email: "matthias.skibicki@isotec-barowski.de"
  }
];

// Analyse-Schaden
app.post("/analyse-schaden", (req, res) => {
  const { schadensbild } = req.body;
  const schadenstyp = schadensbild.includes("Salz") ? "Salzausblühungen" : "Feuchtewand";
  const sanierungsloesung = schadenstyp === "Salzausblühungen"
    ? "Sanierputzsystem mit Spezialgrundierung"
    : "Innenabdichtung mit Horizontalsperre";
  const kundenvorteil = "Dauerhafter Schutz vor Feuchtigkeit und optisch saubere Wandflächen";
  res.json({ schadenstyp, sanierungsloesung, kundenvorteil });
});

// Kalkulation
app.post("/kalkulation", (req, res) => {
  const { gewerk, gewerke, flaeche_qm } = req.body;

  if (gewerke && Array.isArray(gewerke)) {
    const details = gewerke.map(g => {
      const preis = preise[g] || 0;
      return {
        gewerk: g,
        preisProQm: preis,
        teilpreis: Math.round(preis * flaeche_qm * 100) / 100
      };
    });
    const gesamtpreis = details.reduce((sum, p) => sum + p.teilpreis, 0);
    return res.json({ details, gesamtpreis });
  }

  if (gewerk) {
    const einheitspreis = preise[gewerk] || 0;
    const gesamtpreis = Math.round(einheitspreis * flaeche_qm * 100) / 100;
    return res.json({ einheitspreis, gesamtpreis });
  }

  return res.status(400).json({ error: "Keine gültigen Parameter." });
});

// Ansprechpartner
app.get("/ansprechpartner-name", (req, res) => {
  const { name } = req.query;
  const match = ansprechpartnerListe.find(a =>
    a.name.toLowerCase().includes(name.toLowerCase())
  );
  if (match) return res.json(match);
  res.status(404).json({ error: "Kein Ansprechpartner gefunden" });
});

// GPT-Auswertung inkl. Word-Datei
app.post("/generate-auswertung", async (req, res) => {
  const input = req.body;

  try {
    // 💡 Kalkulation ergänzen
    const innen = input.massnahme.flaeche_qm * preise["Innenabdichtung"];
    const injektion = input.horizontalsperre.laenge_m * preise["Creme-Injektion"];
    const standard = innen + injektion;
    const variante2 = standard + (input.alternativen?.[0]?.flaeche_qm || 0) * (input.alternativen?.[0]?.preis_pro_qm || 0);
    const variante3 = variante2 + (input.massnahme.flaeche_qm * (input.alternativen?.[1]?.aufpreis_pro_qm || 0));
    input.kalkulation = { standard, variante2, variante3 };

    const gptText = await generateGptText(input, input.kalkulation);
    if (!gptText) {
      return res.status(500).json({ error: "GPT-Antwort ist leer." });
    }

    const wordPath = await generateWord(input, gptText);
    return res.json({
      bericht: gptText,
      file: wordPath
    });
  } catch (error) {
    console.error("❌ Fehler bei /generate-auswertung:", error.message);
    return res.status(500).json({ error: "Fehler bei der Auswertung." });
  }
});

app.listen(port, () => {
  console.log(`🚀 ISOTEC-API läuft auf Port ${port}`);
});
