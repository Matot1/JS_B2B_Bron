class SearchPage {
  constructor(page) {
    this.page = page;
  }

  async selectCity(city) {
    await this.page.locator('.TOWNFROMINC_chosen .chosen-single').click();
    await this.page.waitForTimeout(300);
    await this.page.locator(`.TOWNFROMINC_chosen .active-result:has-text("${city}")`).click();
    await this.page.waitForTimeout(5000);
  }

  async selectCountry(country) {
    await this.page.locator('.STATEINC_chosen .chosen-single').click();
    await this.page.waitForTimeout(300);
    await this.page.locator(`.STATEINC_chosen .active-result:has-text("${country}")`).click();
    await this.page.waitForTimeout(5000);
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
  }

  async setDateFrom(date) {
    await this.page.evaluate((d) => {
      const input = document.querySelector('input[name="CHECKIN_BEG"]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, d);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, date);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async setDateTo(date) {
    await this.page.evaluate((d) => {
      const input = document.querySelector('input[name="CHECKIN_END"]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, d);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, date);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async uncheckGroupResults() {
    const checkbox = this.page.locator('label:has-text("группировать результаты")').locator('input[type="checkbox"]');
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
    await this.page.waitForTimeout(300);
  }

  async checkNoPromo() {
    const checkbox = this.page.locator('label:has-text("Не отображать PROMO")').locator('input[type="checkbox"]');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
    await this.page.waitForTimeout(300);
  }

  async clickSearch() {
    await this.page.evaluate(() => {
      const btn = document.querySelector('button.load.right');
      if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await this.page.waitForTimeout(7000);
  }
}

module.exports = SearchPage;
