const { OpenAI } = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY ist nicht gesetzt – bitte in Render unter 'Environment' eintragen.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateGptText = async (input, kalkulation) => {
  const prompt = `
Erstelle eine ISOTEC-Sanierungsauswertung:

- Objektadresse: ${input.adresse}
- Eigentümer: ${input.kunde}
- Ansprechpartner: ${input.berater?.name || "N.N."}
- Schadensbild: ${input.schadensbild}
- Maßnahme: ${input.massnahme?.beschreibung || "n/a"}, ${input.massnahme?.flaeche_qm || 0} m²
- Injektion: ${input.horizontalsperre?.laenge_m || 0} lfm
- Varianten: ${(input.alternativen || []).map(a => a.bezeichnung).join(", ") || "Keine"}
- Preise: Standard ${kalkulation?.standard || 0} €, Variante 2 ${kalkulation?.variante2 || 0} €, Variante 3 ${kalkulation?.variante3 || 0} €

Bitte gegliedert in:
1. Schadensbild
2. Maßnahme
3. Kundenvorteil
4. Kalkulation
5. Hinweis Visualisierung
6. Nächster Schritt

Stil: empathisch, fachlich, ISOTEC-konform mit Fokus auf Sicherheit, Nachhaltigkeit und Werterhalt.
  `.trim();

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return res.choices?.[0]?.message?.content || null;
};
