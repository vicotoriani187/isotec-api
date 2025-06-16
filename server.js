// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Preisliste (netto)
const preise = {
  "Innenabdichtung": 450,
  "Sanierputz": 0, // in IAD enthalten
  "Horizontalsperre": 420,
  "Creme-Injektion": 320,
  "Klimaplatte": 300,
  "Klimaplatte-Upgrade": 130,
  "Außenabdichtung": 400
  "Kellerbodensanierung": 300
  "Flexband mit Injektion": 590
  "Balkonsanierung": 1100
};

// Ansprechpartnerliste (vereinfacht)
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

// Ansprechpartner nach Name
app.get("/ansprechpartner-name", (req, res) => {
  const { name } = req.query;
  const match = ansprechpartnerListe.find(a =>
    a.name.toLowerCase().includes(name.toLowerCase())
  );
  if (match) return res.json(match);
  res.status(404).json({ error: "Kein Ansprechpartner gefunden" });
});

app.listen(port, () => {
  console.log(`ISOTEC API läuft auf Port ${port}`);
});
// GPT-gestützte Auswertung (vereinfacht)
app.post("/generate-auswertung", async (req, res) => {
  const input = req.body;
  const { berater, kunde, adresse, objektart, schadensbild, massnahme, horizontalsperre, alternativen } = input;

  const preise = {
    "Innenabdichtung": 450,
    "Creme-Injektion": 320
  };

  // Kalkulation
  const innen = massnahme.flaeche_qm * preise["Innenabdichtung"];
  const injektion = horizontalsperre.laenge_m * preise["Creme-Injektion"];
  const standard = innen + injektion;
  const variante2 = standard + (alternativen[0]?.flaeche_qm || 0) * (alternativen[0]?.preis_pro_qm || 0);
  const variante3 = variante2 + (massnahme.flaeche_qm * (alternativen[1]?.aufpreis_pro_qm || 0));

  // Bericht (einfaches Text-Template)
  const bericht = `
🧱 Schadensbild:
${schadensbild}

🔧 Empfohlene Maßnahme:
${massnahme.beschreibung} (${massnahme.flaeche_qm} m²), ${horizontalsperre.typ} (${horizontalsperre.laenge_m} lfm)

✅ Kundenvorteil:
– Schutz vor Feuchte von Boden und Wand
– saubere, trockene Räume
– 10 Jahre Garantie

💶 Kalkulation:
Standard: ${standard.toFixed(2)} €
Variante 2: ${variante2.toFixed(2)} €
Variante 3: ${variante3.toFixed(2)} €

📍 Objekt: ${adresse}
👤 Eigentümer: ${kunde}
🔧 Ansprechpartner: ${berater}
  `;

  res.json({
    bericht,
    kalkulation: { standard, variante2, variante3 }
  });
});

