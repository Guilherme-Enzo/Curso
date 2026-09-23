import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const imageDir = path.join(process.cwd(), "public", "uploads", "prompts", "images");
const pdfDir = path.join(process.cwd(), "public", "uploads", "prompts", "pdfs");

const groups = [
  {
    type: "EDITING",
    name: "Retrato e iluminação",
    items: [
      ["Retrato com luz suave de janela", "portrait window light photography", "Aprimore um retrato com luz suave lateral de janela, pele natural, contraste delicado e fundo discreto. Preserve a identidade e os detalhes reais do rosto.", "Retrato com iluminação natural suave, pele realista e atmosfera elegante."],
      ["Retrato dramático em chiaroscuro", "dramatic portrait face photography", "Transforme o retrato em uma cena de chiaroscuro cinematográfico, com uma fonte lateral forte, sombras profundas controladas e textura natural da pele. Evite aparência artificial.", "Retrato expressivo com luz e sombra bem definidas para um resultado cinematográfico."],
      ["Retrato externo em hora dourada", "golden hour portrait photography", "Edite o retrato para uma atmosfera de hora dourada, com luz quente de fim de tarde, brilho suave no contorno do cabelo e cores naturais no cenário.", "Tratamento quente e natural para retratos feitos no fim da tarde."],
    ],
  },
  {
    type: "EDITING",
    name: "Cor e estilo visual",
    items: [
      ["Color grading editorial neutro", "fashion editorial photography", "Aplique um color grading editorial limpo, com tons de pele equilibrados, pretos suaves, brancos neutros e contraste refinado. Mantenha a imagem sofisticada e realista.", "Color grading limpo para uma estética editorial sofisticada e natural."],
      ["Filme analógico com grão delicado", "analog film camera photography", "Converta a imagem para uma estética de filme analógico, com grão fino, contraste moderado, pequenas variações de cor e aparência orgânica. Não exagere no efeito.", "Estética de filme analógico com grão fino e cores orgânicas."],
      ["Preto e branco com textura", "black and white portrait photography", "Crie uma versão em preto e branco com ampla escala de cinza, textura visível, sombras preservadas e foco na expressão e na composição.", "Conversão monocromática com textura e profundidade tonal."],
    ],
  },
  {
    type: "CREATION",
    name: "Retratos criativos",
    items: [
      ["Retrato editorial futurista", "creative futuristic portrait", "Crie um retrato editorial futurista com iluminação violeta e azul, elementos geométricos translúcidos ao fundo, composição de revista e aparência fotográfica realista.", "Retrato conceitual com linguagem futurista e acabamento editorial."],
      ["Retrato em cenário botânico", "creative botanical portrait", "Crie um retrato artístico em meio a folhagens, luz natural filtrada e profundidade de campo suave. Use cores verdes e douradas, composição elegante e detalhes fotográficos realistas.", "Retrato autoral integrado a um cenário botânico com luz natural."],
      ["Retrato com dupla exposição urbana", "city architecture night photography", "Crie uma composição de dupla exposição combinando o perfil de uma pessoa com arquitetura urbana, linhas de luz e atmosfera noturna. Preserve a leitura do rosto e mantenha acabamento fotográfico.", "Dupla exposição que combina retrato e cidade com atmosfera noturna."],
    ],
  },
  {
    type: "CREATION",
    name: "Produtos e composição",
    items: [
      ["Produto minimalista em estúdio", "minimal product photography studio", "Crie uma fotografia de produto em estúdio minimalista, fundo claro, sombra suave, iluminação de três pontos e composição limpa para catálogo premium.", "Composição de produto limpa, iluminada e adequada para catálogo."],
      ["Natureza-morta gastronômica", "food still life photography", "Crie uma natureza-morta gastronômica com ingredientes frescos, luz lateral suave, textura apetitosa e composição equilibrada. O resultado deve parecer uma fotografia profissional.", "Cena gastronômica com textura, luz suave e composição profissional."],
      ["Campanha de produto com fundo colorido", "colorful product advertising photography", "Crie uma imagem publicitária de produto com fundo colorido complementar, sombras gráficas controladas e espaço negativo para texto. Mantenha o produto como elemento principal.", "Imagem publicitária com cor, espaço negativo e foco total no produto."],
    ],
  },
];

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function pdfText(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E\n]/g, "");
}

function wrapPdfText(value, limit = 88) {
  const lines = [];
  let current = "";
  for (const word of String(value).split(/\s+/)) {
    if ((current + " " + word).trim().length > limit) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function imageDimensions(buffer) {
  if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.subarray(0, 3).toString("hex") === "ffd8ff") {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
  }
  return { width: 1, height: 1 };
}

function makePdf(title, description, prompt, imageBuffer) {
  const dimensions = imageDimensions(imageBuffer);
  const imageMaxWidth = 495;
  const imageMaxHeight = 230;
  const scale = Math.min(imageMaxWidth / dimensions.width, imageMaxHeight / dimensions.height);
  const imageWidth = Math.max(1, Math.round(dimensions.width * scale));
  const imageHeight = Math.max(1, Math.round(dimensions.height * scale));
  const imageX = 50 + Math.round((imageMaxWidth - imageWidth) / 2);
  const imageY = 450 + Math.round((imageMaxHeight - imageHeight) / 2);
  const descriptionLines = wrapPdfText(description, 88).slice(0, 5);
  const promptLines = wrapPdfText(prompt, 88).slice(0, 14);
  const promptBoxY = 70;
  const promptBoxHeight = Math.max(175, Math.min(330, 62 + promptLines.length * 15));
  const textCommands = ["BT", "/F1 18 Tf", "50 790 Td", `(${pdfText(title).replace(/[\\()]/g, "\\$&")}) Tj`, "/F1 10 Tf", "0 -28 Td"];
  for (const line of descriptionLines) {
    textCommands.push(`(${pdfText(line).replace(/[\\()]/g, "\\$&")}) Tj`, "0 -15 Td");
  }
  textCommands.push("ET", "0.10 0.07 0.18 rg", `50 ${promptBoxY} 495 ${promptBoxHeight} re`, "f", "1 1 1 rg", "BT", "/F1 12 Tf", `70 ${promptBoxY + promptBoxHeight - 32} Td`, "(PROMPT PARA IA) Tj", "/F1 10 Tf", "0 -22 Td");
  for (const line of promptLines) {
    textCommands.push(`(${pdfText(line).replace(/[\\()]/g, "\\$&")}) Tj`, "0 -15 Td");
  }
  textCommands.push("ET");
  const textStream = textCommands.join("\n");
  const imageCommands = `q\n${imageWidth} 0 0 ${imageHeight} ${imageX} ${imageY} cm\n/Im0 Do\nQ\n`;
  const contentStream = `${imageCommands}${textStream}\n`;
  const imageStream = Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${dimensions.width} /Height ${dimensions.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBuffer.length} >>\nstream\n`, "ascii"),
    imageBuffer,
    Buffer.from("\nendstream", "ascii"),
  ]);
  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "ascii"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "ascii"),
    Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> /XObject << /Im0 5 0 R >> >> /Contents 6 0 R >>`, "ascii"),
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

async function findLicensedImage(query) {
  const curated = {
    "portrait window light photography": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=88",
    "dramatic portrait face photography": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=88",
    "golden hour portrait photography": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=88",
    "fashion editorial photography": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=88",
    "analog film camera photography": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=88",
    "black and white portrait photography": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=88",
    "creative futuristic portrait": "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=88",
    "creative botanical portrait": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=88",
    "city architecture night photography": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=88",
    "minimal product photography studio": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=88",
    "food still life photography": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=88",
    "colorful product advertising photography": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=88",
  };
  if (curated[query]) {
    return { url: curated[query], sourceUrl: "https://unsplash.com", author: "Unsplash", license: "Unsplash License" };
  }
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({ action: "query", generator: "search", gsrsearch: query, gsrnamespace: "6", gsrlimit: "12", prop: "imageinfo", iiprop: "url|extmetadata|mime", iiurlwidth: "1200", format: "json", origin: "*" });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Wikimedia respondeu ${response.status}`);
  const data = await response.json();
  for (const page of Object.values(data.query?.pages ?? {})) {
    const info = page.imageinfo?.[0];
    const mime = info?.mime ?? "";
    const license = stripHtml(info?.extmetadata?.LicenseShortName?.value);
    if (!/^image\/(jpeg|png|webp)$/i.test(mime)) continue;
    if (!/(public domain|cc0|cc by)/i.test(license)) continue;
    if (!/^image\/jpeg$/i.test(mime)) continue;
    const sourceUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`;
    return { url: info.thumburl || info.url, sourceUrl, author: stripHtml(info.extmetadata?.Artist?.value) || "Autor não informado", license };
  }
  throw new Error(`Nenhuma imagem licenciada encontrada para ${query}`);
}

async function main() {
  await mkdir(imageDir, { recursive: true });
  await mkdir(pdfDir, { recursive: true });
  const categoryOrders = { EDITING: 0, CREATION: 0 };
  for (const group of groups) {
    const category = await prisma.promptCategory.findFirst({ where: { name: group.name, type: group.type } }) || await prisma.promptCategory.create({ data: { name: group.name, type: group.type, order: categoryOrders[group.type]++ } });
    for (let index = 0; index < group.items.length; index += 1) {
      const [name, query, promptText, description] = group.items[index];
      if (await prisma.prompt.findFirst({ where: { categoryId: category.id, name } })) continue;
      const image = await findLicensedImage(query);
      const imageResponse = await fetch(image.url);
      if (!imageResponse.ok) throw new Error(`Falha ao baixar imagem de ${name}`);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const ext = image.url.split("?")[0].toLowerCase().endsWith(".png") ? ".png" : ".jpg";
      const imageFilename = `${randomUUID()}${ext}`;
      const pdfFilename = `${randomUUID()}.pdf`;
      await writeFile(path.join(imageDir, imageFilename), imageBuffer);
      await writeFile(path.join(pdfDir, pdfFilename), makePdf(name, description, promptText, imageBuffer));
      await prisma.prompt.create({ data: { categoryId: category.id, name, imageUrl: `/api/prompts/assets/${imageFilename}`, imageSourceUrl: image.sourceUrl, imageAuthor: image.author, imageLicense: image.license, pdfUrl: `/api/prompts/files/${pdfFilename}`, description, promptText, order: index } });
      console.log(`Criado: ${group.name} / ${name}`);
    }
  }
  const prompts = await prisma.prompt.findMany();
  for (const prompt of prompts) {
    const imageBuffer = await readFile(path.join(imageDir, path.basename(prompt.imageUrl)));
    await writeFile(path.join(pdfDir, path.basename(prompt.pdfUrl)), makePdf(prompt.name, prompt.description, prompt.promptText, imageBuffer));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
