const { chromium } = require('playwright');
require('dotenv').config();
const { sendMattermost } = require('./notify.cjs');
const LoginPage = require('./object/loginPage.cjs');
const SearchPage = require('./object/searchPage.cjs');
const BookingPage = require('./object/bookingPage.cjs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  });
  const page = await context.newPage();
  let currentStep = '';

  try {
    currentStep = 'Авторизация';
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LOGIN, process.env.PASSWORD);

    currentStep = 'Поиск тура';
    const search = new SearchPage(page);
    await search.selectCity('Москва');
    await search.selectCountry('Турция');
    await search.scrollToBottom();
    await search.setDateFrom('05.10.2026');
    await search.uncheckGroupResults();
    await search.checkNoPromo();
    await search.clickSearch();

    currentStep = 'Выбор тура по цене';
    const priceBtn = page.locator('span.price_old.bron.price_button').first();
    const [bookingPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 15000 }).catch(() => null),
      priceBtn.click({ timeout: 10000 }),
    ]);
    const targetPage = bookingPage || page;
    await targetPage.waitForTimeout(5000);

    currentStep = 'Заполнение данных туристов';
    const booking = new BookingPage(targetPage);
    await booking.fillTourist(1);
    await booking.fillTourist(2);
    await booking.checkIsCustomer(2);
    await booking.fillBuyerInfo();
    await booking.recalculate();

    currentStep = 'Бронирование';
    await booking.submitBooking();

    const { orderNumber, claimUrl } = await booking.getOrderInfo();
    await sendMattermost(`✅ Тур забронирован. Номер заявки: ${orderNumber}\nСсылка: ${claimUrl}`);
    await browser.close();
  } catch (err) {
    const pageUrl = typeof page !== 'undefined' ? await page.evaluate(() => location.href).catch(() => 'недоступен') : 'недоступен';
    await sendMattermost(`❌ Ошибка на шаге "${currentStep}": ${err.message}
URL: ${pageUrl}`);
    if (typeof page !== 'undefined') await page.waitForTimeout(300000);
  }
})();
