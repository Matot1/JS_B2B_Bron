const { test } = require('@playwright/test');
const LoginPage = require('../object/loginPage.cjs');
const SearchPage = require('../object/searchPage.cjs');
const BookingPage = require('../object/bookingPage.cjs');
const { sendMattermost } = require('../notify.cjs');

test.describe('B2B Turkey Bron', () => {
  test('Бронирование тура в Турцию', async ({ page, context }) => {
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

    } catch (err) {
      const pageUrl = await page.evaluate(() => location.href).catch(() => 'недоступен');
      await sendMattermost(`❌ Ошибка на шаге "${currentStep}": ${err.message}\nURL: ${pageUrl}`);
      throw err;
    }
  });
});
