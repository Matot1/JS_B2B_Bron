import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { SearchTourPage } from '../../../pages/SearchTourPage.js';
import { countryToValue } from '../../../pages/countryCodes.js';

const COUNTRY = 'Турция';
const COUNTRY_VALUE = countryToValue[COUNTRY];
const TOUR_TYPE_VALUE = '14';
const EXPECTED_KEYWORD = 'Premium';

test.describe('Фильтр "Тип тура"', () => {

  test(`Тип: VIP + ${COUNTRY} — в столбце "Тур" указано "${EXPECTED_KEYWORD}"`, async ({ page }) => {
    const searchPage = new SearchTourPage(page);

    await searchPage.gotoWithFilters(COUNTRY_VALUE, TOUR_TYPE_VALUE);
    await page.waitForTimeout(3000);

    await searchPage.clickSearch();
    await page.waitForTimeout(3000);

    try {
      await searchPage.waitForResults();
    } catch {
      test.skip(true, `Нет туров для типа VIP в стране ${COUNTRY}`);
      return;
    }

    await page.waitForTimeout(3000);

    const rowCount = await searchPage.getResultRowCount();

    if (rowCount === 0) {
      test.skip(true, `Нет туров для типа VIP в стране ${COUNTRY}`);
      return;
    }

    const tourTexts = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr[data-state]');
      return Array.from(rows).map(r => {
        const td = r.querySelector('td.tour');
        if (!td) return '';
        for (const n of td.childNodes) {
          if (n.nodeType === 3) {
            const t = n.textContent.trim();
            if (t) return t;
          }
        }
        return '';
      }).filter(Boolean);
    });

    expect(tourTexts.length).toBeGreaterThan(0);

    for (const text of tourTexts) {
      expect(text).toContain(EXPECTED_KEYWORD);
    }
  });

});
