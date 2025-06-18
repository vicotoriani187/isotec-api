const { OpenAI } = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY ist nicht gesetzt – bitte in Render unter 'Environment' eintragen.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateGptText = async (input, kalkulation) => {
  const prompt = `
Erstelle eine ISOTEC-Sanierungsauswertung im Stil eines Sachverständigen:

Objektdaten:
- Adresse: ${input.adresse}
- Eigentümer: ${input.kunde}
- Ansprechpartner: ${input.berater?.name || "N.N."}

Sanierungsdaten:
- Schadensbild: ${input.schadensbild}
- Maßnahme: ${input.massnahme?.beschreibung || "unbekannt"} (${input.massnahme?.flaeche_qm ?? 0} m²)
- Horizontalsperre: ${input.horizontalsperre?.laenge_m ?? 0} lfm
- Varianten: ${input.alternativen?.map(a => a.bezeichnung).join(", ") || "keine"}
- Preise: Standard ${kalkulation.standard} €, Variante 2 ${kalkulation.variante2} €, Variante 3 ${kalkulation.variante3} €

Bitte strukturiert formulieren, gutachterlich, mit klarer Kundennutzenbetonung.

### Gliederung (bitte mit Überschriften):
1. Schadensbild (kurze Analyse, sachlich)
2. Empfohlene Maßnahme (fachlich, ISOTEC-System benennen)
3. Kundenvorteil (stichpunktartig oder als Fließtext)
4. Kalkulation (kurz + Vergleich Varianten)
5. Hinweis auf Visualisierung (optional)
6. Abschluss und nächster Schritt (empfehlend, vertrauensfördernd)

Verwende **empathischen, gut lesbaren Stil** mit klarer fachlicher Sprache. Fokus auf **Wertsteigerung, Gesundheit, Werterhalt, Sicherheit**.`.trim();

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return res.choices?.[0]?.message?.content || null;
};
