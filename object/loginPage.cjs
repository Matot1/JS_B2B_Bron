class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://b2b.fstravel.com/search_tour', { waitUntil: 'networkidle', timeout: 60000 });
    await this.page.waitForTimeout(3000);
  }

  async clickLoginButton() {
    await this.page.locator('a.login-action:has-text("Вход")').click();
    await this.page.waitForTimeout(3000);
  }

  async fillCredentials(login, password) {
    await this.page.getByLabel('Краткое имя').fill(login);
    await this.page.getByLabel('Пароль').fill(password);
  }

  async submitLogin() {
    await this.page.locator('button:has-text("Войти")').click();
    await this.page.waitForTimeout(3000);
  }

  async login(login, password) {
    await this.clickLoginButton();
    await this.fillCredentials(login, password);
    await this.submitLogin();
  }
}

module.exports = LoginPage;
