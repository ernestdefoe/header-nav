/*
 * Header Nav must not keep the forum redrawing while nobody touches it.
 *
 * 🚨 1.8.2 and earlier redrew about 60 times a second on every phone page:
 * the header's OverflowingList override and core's own recalculate undid each
 * other in the drawer. This opens a forum and counts m.redraw calls at rest:
 * at a phone width, with the drawer open, on desktop, and after resizing
 * between them, and fails if any of those redraws.
 *
 * Needs a forum with Header Nav enabled and a few header links, and Chrome:
 *
 *   npm i --no-save puppeteer-core
 *   FORUM_URL=http://127.0.0.1:8123/ node tests/browser/redraws.cjs
 *
 * CHROME_PATH overrides where Chrome is looked for.
 */
const puppeteer = require('puppeteer-core');

const url = process.env.FORUM_URL || 'http://127.0.0.1:8123/';
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PHONE = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const DESKTOP = { width: 1280, height: 900 };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('welcomeHidden', 'true');
    } catch (e) {
      // Private mode: the welcome hero only shifts the page down.
    }
  });

  // Redraws a second over two quiet seconds.
  const rate = () =>
    page.evaluate(async () => {
      let count = 0;
      const redraw = m.redraw;
      m.redraw = Object.assign(function () {
        count++;
        return redraw.apply(this, arguments);
      }, redraw);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      m.redraw = redraw;
      return count / 2;
    });

  const results = {};
  const settle = async (name) => {
    await sleep(1500);
    results[name] = await rate();
  };

  await page.setViewport(PHONE);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await settle('phone');

  await page.click('.Navigation-drawer');
  await settle('phone, drawer open');
  await page.evaluate(() => document.querySelector('.drawer-backdrop')?.click());

  await page.setViewport(DESKTOP);
  await settle('desktop after phone');

  await page.setViewport(PHONE);
  await settle('phone after desktop');

  await browser.close();

  const busy = Object.entries(results).filter(([, perSecond]) => perSecond > 0);
  Object.entries(results).forEach(([name, perSecond]) => console.log(`${perSecond ? '✗' : '✓'} ${name}: ${perSecond} redraws/s`));
  if (errors.length) console.log('Page errors:', errors.join(' | '));

  process.exit(busy.length || errors.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
