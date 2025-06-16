const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');

exports.generateWord = async (text) => {
  const doc = new Document();
  doc.addSection({
    children: [new Paragraph({ children: [new TextRun(text)] })],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `ISOTEC_Bericht_${Date.now()}.docx`;
  const filePath = path.join(__dirname, '../downloads', filename);
  fs.writeFileSync(filePath, buffer);

  return `/downloads/${filename}`;
};
