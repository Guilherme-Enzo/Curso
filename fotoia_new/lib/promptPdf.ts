import sharp from "sharp";

function pdfText(value: string): string {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function wrapPdfText(value: string, limit = 88): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of String(value).split(/\s+/)) {
    if ((current + " " + word).trim().length > limit) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export async function makePromptPdf(title: string, description: string, prompt: string, imageBuffer: Buffer): Promise<Buffer> {
  const normalizedImage = await sharp(imageBuffer).jpeg({ quality: 88 }).toBuffer();
  const metadata = await sharp(normalizedImage).metadata();
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const imageMaxWidth = 495;
  const imageMaxHeight = 230;
  const scale = Math.min(imageMaxWidth / width, imageMaxHeight / height);
  const imageWidth = Math.max(1, Math.round(width * scale));
  const imageHeight = Math.max(1, Math.round(height * scale));
  const imageX = 50 + Math.round((imageMaxWidth - imageWidth) / 2);
  const imageY = 450 + Math.round((imageMaxHeight - imageHeight) / 2);
  const descriptionLines = wrapPdfText(description, 88).slice(0, 7);
  const promptLines = wrapPdfText(prompt, 88).slice(0, 20);
  const promptBoxY = 70;
  const promptBoxHeight = Math.max(175, Math.min(390, 62 + promptLines.length * 15));
  const escape = (value: string) => pdfText(value).replace(/[\\()]/g, "\\$&");
  const textCommands = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    `(${escape(title)}) Tj`,
    "/F1 10 Tf",
    "0 -28 Td",
  ];
  for (const line of descriptionLines) textCommands.push(`(${escape(line)}) Tj`, "0 -15 Td");
  textCommands.push(
    "ET",
    "0.10 0.07 0.18 rg",
    `50 ${promptBoxY} 495 ${promptBoxHeight} re`,
    "f",
    "1 1 1 rg",
    "BT",
    "/F1 12 Tf",
    `70 ${promptBoxY + promptBoxHeight - 32} Td`,
    "(PROMPT PARA IA) Tj",
    "/F1 10 Tf",
    "0 -22 Td",
  );
  for (const line of promptLines) textCommands.push(`(${escape(line)}) Tj`, "0 -15 Td");
  textCommands.push("ET");

  const contentStream = `q\n${imageWidth} 0 0 ${imageHeight} ${imageX} ${imageY} cm\n/Im0 Do\nQ\n${textCommands.join("\n")}\n`;
  const imageStream = Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${normalizedImage.length} >>\nstream\n`, "ascii"),
    normalizedImage,
    Buffer.from("\nendstream", "ascii"),
  ]);
  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "ascii"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "ascii"),
    Buffer.from("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> /XObject << /Im0 5 0 R >> >> /Contents 6 0 R >>", "ascii"),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "ascii"),
    imageStream,
    Buffer.from(`<< /Length ${Buffer.byteLength(contentStream, "ascii")} >>\nstream\n${contentStream}endstream`, "ascii"),
  ];
  const chunks = [Buffer.from("%PDF-1.4\n", "ascii")];
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(`${index + 1} 0 obj\n`, "ascii"), objects[index], Buffer.from("\nendobj\n", "ascii"));
  }
  const xref = Buffer.concat(chunks).length;
  let trailer = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) trailer += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  trailer += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  chunks.push(Buffer.from(trailer, "ascii"));
  return Buffer.concat(chunks);
}
