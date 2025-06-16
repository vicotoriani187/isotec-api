const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType
} = require("docx");

exports.generateWord = async (input, gptText) => {
  if (!gptText || typeof gptText !== "string") {
    throw new Error("❌ GPT-Text fehlt oder ist ungültig.");
  }

  const kontaktTabelle = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: input.kunde, bold: true }),
                  new TextRun({ text: `\n${input.adresse}` }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: input.berater.name, bold: true }),
                  new TextRun({ text: `\n${input.berater.position}` }),
                  new TextRun({ text: `\nTel: ${input.berater.telefon}` }),
                  new TextRun({ text: `\nE-Mail: ${input.berater.email}` }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const gptAbschnitt = gptText
    .split("\n")
    .map(line => new Paragraph({ children: [new TextRun({ text: line })] }));

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Century Gothic",
            size: 22,
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      },
    },
    sections: [
      {
        children: [
          kontaktTabelle,
          new Paragraph({ text: "", spacing: { after: 200 } }),
          ...gptAbschnitt,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `downloads/Sanierungsauswertung_${Date.now()}.docx`;
  fs.writeFileSync(path.resolve(filename), buffer);
  return filename;
};
