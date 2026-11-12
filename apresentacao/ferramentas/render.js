// Renderiza cada slide em PNG e o deck inteiro em PDF.
const { chromium } = require('playwright');

(async () => {
  const [src, outdir] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + src, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const secs = await page.$$('section');
  for (let i = 0; i < secs.length; i++) {
    const nome = String(i + 1).padStart(2, '0');
    await secs[i].screenshot({ path: `${outdir}/s${nome}.png` });
  }
  await page.pdf({ path: `${outdir}/slides.pdf`, width: '1920px', height: '1080px', printBackground: true });
  console.log('slides', secs.length);
  await browser.close();
})();
