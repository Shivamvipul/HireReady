const mammoth = require('mammoth');
const AppError = require('../utils/AppError');
const { cleanText } = require('../utils/sanitize');
const { DOC_TYPES, assertMagic, detectFileKind } = require('../middleware/upload');

async function extractPdfText(buffer) {
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');
  const out = await pdfParse(buffer);
  if (out?.text?.trim()) return { text: out.text, pages: out.numpages ?? null };
  throw new Error('No text extracted');
}

async function extractPdfTextFallback(buffer) {
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str || '').join(' ');
    pages.push(text);
  }
  return { text: pages.join('\n\n'), pages: doc.numPages || null };
}

async function parseResumeFile(file) {
  const kind = detectFileKind(file.buffer, file.mimetype, file.originalname) || DOC_TYPES[file.mimetype];
  if (!kind || !['pdf', 'docx'].includes(kind)) {
    throw new AppError('Only PDF or DOCX files are allowed.', 415);
  }

  assertMagic(file.buffer, file.mimetype, file.originalname);
  let raw = '';
  const meta = { kind, hasTables: false, hasImages: false, pages: null };

  try {
    if (kind === 'pdf') {
      try {
        const out = await extractPdfText(file.buffer);
        raw = out.text;
        meta.pages = out.pages;
      } catch (pdfErr) {
        const fallback = await extractPdfTextFallback(file.buffer);
        raw = fallback.text;
        meta.pages = fallback.pages;
      }
      meta.hasTables = /\S {4,}\S.* {4,}\S/.test(raw) || /\t\S.*\t/.test(raw);
    } else {
      const [text, html] = await Promise.all([
        mammoth.extractRawText({ buffer: file.buffer }),
        mammoth.convertToHtml({ buffer: file.buffer }),
      ]);
      raw = text.value;
      meta.hasTables = /<table/i.test(html.value);
      meta.hasImages = /<img/i.test(html.value);
    }
  } catch (e) {
    console.error('Resume file parsing failed:', { kind, name: e.name, message: e.message });
    throw new AppError('We could not read that file. Try another export or paste the text instead.', 422);
  }

  const text = cleanText(raw);
  if (text.length < 80) {
    throw new AppError('Almost no text was found. Scanned or image-only files are not supported: paste the text instead.', 422);
  }
  return { text, meta };
}

module.exports = { parseResumeFile };
