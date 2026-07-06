const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  });
  const page = await context.newPage();

  await page.goto('https://b2b.fstravel.com/search_tour', { waitUntil: 'networkidle', timeout: 60000 });

  await page.waitForTimeout(3000);

  // Find the search button
  const buttons = await page.locator('button, input[type="submit"], input[type="button"], a').all();
  console.log('Buttons/links found:', buttons.length);
  for (const btn of buttons) {
    const tag = await btn.evaluate(el => el.tagName);
    const type = await btn.getAttribute('type');
    const text = await btn.textContent();
    const value = await btn.getAttribute('value');
    const name = await btn.getAttribute('name');
    const cls = await btn.getAttribute('class');
    console.log(`${tag} - type: ${type}, text: "${text?.trim()}", value: "${value}", name: "${name}", class: "${cls}"`);
  }

  await page.waitForTimeout(120000);
  await browser.close();
})();
