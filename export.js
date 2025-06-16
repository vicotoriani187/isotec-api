const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");

exports.generateWord = ({ kundenadresse, ansprechpartner, einleitung, auswertungstext }) => {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Standard",
          name: "Standard",
          run: {
            font: "Century Gothic",
            size: 22,
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      ],
    },
  });

  doc.addSection({
    properties: {},
    children: [
      // Kundenadresse links oben
      new Paragraph({
        children: kundenadresse.split("\n").map(zeile => new TextRun({ text: zeile, break: 1 })),
        alignment: "left",
      }),
      new Paragraph({ text: "", spacing: { after: 300 } }),

      // Ansprechpartner rechts oben
      new Paragraph({
        children: ansprechpartner.split("\n").map(zeile => new TextRun({ text: zeile, break: 1 })),
        alignment: "right",
      }),
      new Paragraph({ text: "", spacing: { after: 300 } }),

      // Einleitung
      new Paragraph(einleitung),
      new Paragraph({ text: "", spacing: { after: 200 } }),

      // Auswertung
      ...auswertungstext.split("\n").map(line => new Paragraph(line)),
    ],
  });

  const outputPath = path.join(__dirname, "downloads", "Sanierungsbericht_ISOTEC.docx");
  const bufferPromise = Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  bufferPromise.then(buffer => fs.writeFileSync(outputPath, buffer));

  return outputPath;
};
