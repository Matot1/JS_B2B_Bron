const { faker } = require('@faker-js/faker/locale/ru');
const { transliterate } = require('transliteration');

class BookingPage {
  constructor(page) {
    this.page = page;
  }

  async fillTourist(index) {
    const prefix = `#tourist${index}`;

    await this.page.locator(`${prefix} .chosen-single:has-text("----")`).click();
    await this.page.waitForTimeout(300);
    await this.page.locator(`${prefix} .active-result[data-option-array-index="1"]`).click();
    await this.page.waitForTimeout(300);

    await this.page.locator(`input[name="frm[People][${index}][LASTNAME_LNAME]"]`).fill(faker.person.lastName().toUpperCase());
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][FIRSTNAME_LNAME]"]`).fill(faker.person.firstName().toUpperCase());
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][BORN]"]`).fill('01.01.2000');
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][PHONE]"]`).fill('79881929122');
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][EMAIL]"]`).fill('test33@mail.ru');
    await this.page.waitForTimeout(200);

    await this.page.locator(`${prefix} a.chosen-single:has-text("Паспорт")`).click();
    await this.page.waitForTimeout(300);
    await this.page.locator(`${prefix} .chosen-results .active-result:has-text("Заграничный паспорт")`).click();
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][PSERIE]"]`).fill(faker.string.numeric(2));
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][PNUMBER]"]`).fill(faker.string.numeric(7));
    await this.page.waitForTimeout(200);

    await this.page.locator(`input[name="frm[People][${index}][PVALID]"]`).fill('01.01.2031');
    await this.page.waitForTimeout(200);
  }

  async checkIsCustomer(index) {
    const checkbox = this.page.locator(`#tourist${index} label:has-text("является заказчиком тура")`).locator('input[type="checkbox"]');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
    await this.page.waitForTimeout(200);
  }

  async fillBuyerInfo() {
    await this.page.locator('input[name="frm[phys_byer][-1][FIRSTNAME_NAME]"]').fill(transliterate(faker.person.firstName()).toUpperCase());
    await this.page.waitForTimeout(200);
    await this.page.locator('input[name="frm[phys_byer][-1][LASTNAME_NAME]"]').fill(transliterate(faker.person.lastName()).toUpperCase());
    await this.page.waitForTimeout(200);
    const russianCity = faker.location.city();
    await this.page.locator('input[name="frm[phys_byer][-1][ADDRESS]"]').fill(russianCity);
    await this.page.waitForTimeout(200);
  }

  async recalculate() {
    await this.page.locator('button.calc:has-text("Пересчитать")').click();
    await this.page.waitForTimeout(7000);
  }

  async submitBooking() {
    await this.page.locator('button:has-text("бронировать")').click();
    await this.page.waitForTimeout(90000);
  }

  async getOrderInfo() {
    let orderNumber = 'не найден';
    let claimUrl = '';
    try {
      const pageText = await this.page.evaluate(() => document.body.innerText);
      const numMatch = pageText.match(/Номер вашей заявки:\s*(\d+)/);
      if (numMatch) orderNumber = numMatch[1];

      claimUrl = await this.page.evaluate(() => {
        const links = document.querySelectorAll('a');
        for (const a of links) {
          if (a.textContent.includes('Посмотреть заявку')) return a.href;
        }
        return '';
      });
    } catch (e) {
      console.log('Не удалось проверить результат');
    }
    return { orderNumber, claimUrl };
  }
}

module.exports = BookingPage;
