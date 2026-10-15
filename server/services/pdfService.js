const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');
const { stripHtml } = require('../utils/sanitize');

const chromeExecutable = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
].find((candidate) => candidate && fs.existsSync(candidate));

let browserPromise;
const getBrowser = () => {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        ...(chromeExecutable ? { executablePath: chromeExecutable } : {}),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
      .catch((e) => { browserPromise = null; throw e; });
  }
  return browserPromise;
};

const wrap = (inner, title) => `<!doctype html><html><head><meta charset="utf-8"><title>${String(title).replace(/</g, '')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Lora:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .rr-root { width: 794px !important; min-height: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; transform: none !important; margin: 0 auto; }
  .rr-entry { break-inside: avoid; page-break-inside: avoid; }
  a { color: inherit; }
</style></head><body>${inner}</body></html>`;

// Rendered HTML comes from the client preview. JS is disabled and scripts/handlers are stripped.
async function htmlToPdf(html, title = 'Resume') {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 794, height: 1123 });
    await page.setContent(wrap(stripHtml(html), title), { waitUntil: 'networkidle0', timeout: 20000 }).catch(() =>
      page.setContent(wrap(stripHtml(html), title), { waitUntil: 'domcontentloaded' })
    );
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

module.exports = { htmlToPdf };
