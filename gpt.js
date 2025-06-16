const { OpenAI } = require("openai");

// 🔐 Prüfung, ob der API-Key vorhanden ist
if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY ist nicht gesetzt – bitte in Render unter 'Environment' eintragen.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generateGptText = async (input, kalkulation) => {
  const prompt = `
Erstelle eine ISOTEC-Sanierungsauswertung:

- Objektadresse: ${input.adresse}
- Eigentümer: ${input.kunde}
- Ansprechpartner: ${input.berater}
- Schadensbild: ${input.schadensbild}
- Maßnahme: ${input.massnahme.beschreibung}, ${input.massnahme.flaeche_qm} m²
- Injektion: ${input.horizontalsperre.laenge_m} lfm
- Varianten: ${input.alternativen.map(a => a.bezeichnung).join(", ")}
- Preise: Standard ${kalkulation.standard} €, Variante 2 ${kalkulation.variante2} €, Variante 3 ${kalkulation.variante3} €

Bitte gegliedert in:
1. Schadensbild
2. Maßnahme
3. Kundenvorteil
4. Kalkulation
5. Hinweis Visualisierung
6. Nächster Schritt

Stil: empathisch, fachlich, ISOTEC-konform
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return res.choices[0].message.content;
};
