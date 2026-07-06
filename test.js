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

  // Try to find date inputs and debug page structure
  const html = await page.content();
  console.log('Page title:', await page.title());
  
  // Look for input fields
  const inputs = await page.locator('input').all();
  console.log('Inputs found:', inputs.length);
  for (const input of inputs) {
    const name = await input.getAttribute('name');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const className = await input.getAttribute('class');
    console.log(`Input - name: ${name}, id: ${id}, placeholder: ${placeholder}, class: ${className}`);
  }

  await page.waitForTimeout(60000);
  await browser.close();
})();
