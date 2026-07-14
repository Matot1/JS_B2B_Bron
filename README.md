# Архитектура теста B2B Turkey Bron

**Стек:** Playwright + Node.js
**Паттерн:** Page Object Model

---

## Структура проекта

```
b2bTurkeyBron.js      — Главный сценарий теста (69 строк)
tests/b2bTurkeyBron.spec.js — Тест для Playwright Test Runner
playwright.config.js  — Конфигурация Playwright (браузер, таймауты, baseURL и т.д.)
loginPage.js          — Page Object: авторизация на сайте
searchPage.js         — Page Object: поиск тура
bookingPage.js        — Page Object: бронирование (туристы + покупатель)
notify.js             — Утилита: отправка уведомлений в Mattermost
.env                  — Переменные окружения (логин, пароль, webhook)
```

---

## 1. `loginPage.js` — Page Object: Авторизация

**Назначение:** Отвечает за вход на сайт b2b.fstravel.com.

| Метод | Что делает |
|---|---|
| `goto()` | Открывает страницу поиска туров `https://b2b.fstravel.com/search_tour` |
| `clickLoginButton()` | Нажимает кнопку "Вход" в хедере |
| `fillCredentials(login, password)` | Заполняет поля "Краткое имя" и "Пароль" |
| `submitLogin()` | Нажимает кнопку "Войти" |
| `login(login, password)` | Композитный метод: выполняет вход целиком |

**Локаторы:**
- Кнопка "Вход": `a.login-action:has-text("Вход")`
- Поле логина: `getByLabel('Краткое имя')`
- Поле пароля: `getByLabel('Пароль')`
- Кнопка "Войти": `button:has-text("Войти")`

---

## 2. `searchPage.js` — Page Object: Поиск тура

**Назначение:** Управляет формой поиска тура (город, страна, даты, фильтры, кнопка поиска).

| Метод | Что делает |
|---|---|
| `selectCity(city)` | Выбирает город вылета из дропдауна `.TOWNFROMINC_chosen` |
| `selectCountry(country)` | Выбирает страну из дропдауна `.STATEINC_chosen` |
| `scrollToBottom()` | Скроллит страницу вниз (чтобы были видны даты и кнопка поиска) |
| `setDateFrom(date)` | Устанавливает дату вылета через `nativeInputValueSetter` (формат: `ДД.ММ.ГГГГ`) |
| `uncheckGroupResults()` | Снимает чекбокс "группировать результаты", если он включён |
| `checkNoPromo()` | Включает чекбокс "Не отображать PROMO", если он выключен |
| `clickSearch()` | Нажимает кнопку "Поиск" и ждёт 7 секунд для загрузки результатов |

**Локаторы:**
- Дропдаун города: `.TOWNFROMINC_chosen .chosen-single`
- Дропдаун страны: `.STATEINC_chosen .chosen-single`
- Поле даты: `input[name="CHECKIN_BEG"]`
- Чекбокс группировки: `label:has-text("группировать результаты") input[type="checkbox"]`
- Чекбокс PROMO: `label:has-text("Не отображать PROMO") input[type="checkbox"]`
- Кнопка поиска: `button.load.right`

---

## 3. `bookingPage.js` — Page Object: Бронирование

**Назначение:** Заполняет данные туристов, покупателя и управляет бронированием.

**Зависимости:** `@faker-js/faker` (генерация ФИО), `transliteration` (транслитерация).

| Метод | Что делает |
|---|---|
| `fillTourist(index)` | Заполняет все поля одного туриста: пол, фамилия, имя, дата рождения, телефон, email, тип документа, серия, номер, срок действия паспорта |
| `checkIsCustomer(index)` | Отмечает чекбокс "является заказчиком тура" для указанного туриста |
| `fillBuyerInfo()` | Генерирует и заполняет данные покупателя: имя, фамилия (транслитерированные), адрес (случайный город) |
| `recalculate()` | Нажимает кнопку "Пересчитать" и ждёт 7 секунд |
| `submitBooking()` | Нажимает кнопку "бронировать" и ждёт 90 секунд |
| `getOrderInfo()` | Парсит страницу: ищет номер заявки (`Номер вашей заявки: \d+`) и ссылку "Посмотреть заявку" |

**Локаторы:**
- Блок туриста: `#tourist{index}`
- Пол: `.chosen-single:has-text("----")` → `.active-result[data-option-array-index="1"]`
- Фамилия: `input[name="frm[People][{index}][LASTNAME_LNAME]"]`
- Имя: `input[name="frm[People][{index}][FIRSTNAME_LNAME]"]`
- Дата рождения: `input[name="frm[People][{index}][BORN]"]`
- Телефон: `input[name="frm[People][{index}][PHONE]"]`
- Email: `input[name="frm[People][{index}][EMAIL]"]`
- Тип документа: `#tourist{index} a.chosen-single:has-text("Паспорт")` → `.active-result:has-text("Заграничный паспорт")`
- Серия: `input[name="frm[People][{index}][PSERIE]"]`
- Номер: `input[name="frm[People][{index}][PNUMBER]"]`
- Срок действия: `input[name="frm[People][{index}][PVALID]"]`
- Чекбокс "заказчик": `#tourist{index} label:has-text("является заказчиком тура") input[type="checkbox"]`
- Имя покупателя: `input[name="frm[phys_byer][-1][FIRSTNAME_NAME]"]`
- Фамилия покупателя: `input[name="frm[phys_byer][-1][LASTNAME_NAME]"]`
- Адрес: `input[name="frm[phys_byer][-1][ADDRESS]"]`
- Кнопка "Пересчитать": `button.calc:has-text("Пересчитать")`
- Кнопка "бронировать": `button:has-text("бронировать")`

---

## 4. `b2bTurkeyBron.js` — Главный сценарий

**Назначение:** Запускает браузер и выполняет шаги теста последовательно.

1. **Создание browser context** — Chromium, окно 1280×800, локаль `ru-RU`
2. **Авторизация** — открыть страницу, нажать "Вход", ввести логин/пароль
3. **Поиск тура** — выбрать Москва → Турция → дата 05.10.2026 → снять группировку → включить "не показывать PROMO" → Поиск
4. **Выбор тура** — клик по первой цене, ожидание открытия новой вкладки (или той же страницы)
5. **Заполнение данных** — турист 1, турист 2, отметить заказчика, заполнить покупателя
6. **Пересчёт** — нажать "Пересчитать"
7. *(бронирование отключено по желанию пользователя)*

**Обработка ошибок:** При любой ошибке отправляется уведомление в Mattermost с указанием шага (`currentStep`) и URL страницы, после чего браузер остаётся открытым на 5 минут.

---

## 5. `notify.js` — Утилита уведомлений

**Назначение:** Отправляет сообщения в Mattermost через вебхук.

| Метод | Что делает |
|---|---|
| `sendMattermost(message)` | POST-запрос с JSON `{ text: message }` к `MATTERMOST_WEBHOOK` из `.env` |

Если `MATTERMOST_WEBHOOK` не задан — сообщение не отправляется (без ошибки).

---

## Запуск теста

```bash
# установка зависимостей
npm install

# запуск (headless)
npm test

# запуск с открытым браузером
npm run test:headed

# запуск через Playwright UI
npm run test:ui
```

**`.env` файл** (должен быть в корне проекта):
```
LOGIN=ваш_логин
PASSWORD=ваш_пароль
MATTERMOST_WEBHOOK=https://mattermost.yourcompany.com/hooks/xxx
```
