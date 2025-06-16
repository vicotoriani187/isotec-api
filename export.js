const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");

exports.generateWord = async (text, kunde, adresse, ansprechpartner) => {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Century Gothic",
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [
      {
        children: [
          // Kundenadresse links
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: kunde, bold: true }),
              new TextRun({ text: `\n${adresse}` }),
            ],
          }),

          // Ansprechpartner rechts
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: ansprechpartner.name, bold: true }),
              new TextRun({ text: `\n${ansprechpartner.position}` }),
              new TextRun({ text: `\n${ansprechpartner.telefon}` }),
              new TextRun({ text: `\n${ansprechpartner.email}` }),
            ],
          }),

          // Titel
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Sanierungsauswertung", bold: true, size: 26 }),
            ],
          }),

          // Textgliederung
          ...text
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line) =>
              new Paragraph({
                spacing: { after: 150 },
                children: [new TextRun({ text: line })],
              })
            ),

          // Fußzeile
          new Paragraph({ spacing: { after: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "ISOTEC", bold: true })],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `ISOTEC_Bericht_${Date.now()}.docx`;
  const filePath = path.join(__dirname, "./downloads", filename);
  fs.writeFileSync(filePath, buffer);

  return `/downloads/${filen
