
const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.post('/analyse-schaden', (req, res) => {
  const { schadensbild } = req.body;
  let antwort;
  if (/salz|ausblühung/i.test(schadensbild)) {
    antwort = {
      schadenstyp: 'Salzausblühungen',
      sanierungsloesung: 'Sanierputzsystem mit ISOTEC Grundierung',
      kundenvorteil: 'Langfristiger Schutz gegen Salzeintrag und optisch saubere Oberfläche'
    };
  } else if (/putz|abplatzung/i.test(schadensbild)) {
    antwort = {
      schadenstyp: 'Putzabplatzungen',
      sanierungsloesung: 'Abschlagen, Grundierung, Sanierputzauftrag',
      kundenvorteil: 'Stabile, saubere Wandflächen mit langlebiger Optik'
    };
  } else {
    antwort = {
      schadenstyp: 'Unbekannt',
      sanierungsloesung: 'Weitere Analyse erforderlich',
      kundenvorteil: 'Individuelle Beratung durch ISOTEC-Fachmann'
    };
  }
  res.json(antwort);
});

app.post('/kalkulation', (req, res) => {
  const { gewerk, flaeche_qm } = req.body;
  const preise = {
    Innenabdichtung: 190,
    Horizontalsperre: 140,
    Sanierputz: 85
  };
  const preis = preise[gewerk] || 100;
  res.json({
    einheitspreis: preis,
    gesamtpreis: preis * flaeche_qm
  });
});

app.get('/ansprechpartner', (req, res) => {
  const { plz } = req.query;
  const kontakt = {
    name: 'Vittorio Costa',
    telefon: '+49 234 123456',
    email: 'vic.isotec@gmail.com'
  };
  res.json(kontakt);
});

app.listen(port, () => {
  console.log(`ISOTEC API läuft auf Port ${port}`);
});
