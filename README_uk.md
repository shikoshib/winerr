<div style="text-align: center">
  <a href="https://github.com/shikoshib/winerr/blob/main/README.md">English</a> | <a href="https://github.com/shikoshib/winerr/blob/main/README_ru.md">Русский</a> | <strong>Українська</strong> | <a href="https://github.com/shikoshib/winerr/blob/main/README_ja.md">日本語</a>
</div>

# winerr
Швидкий та тонкий генератор помилок Windows, створений за допомогою HTML5 Canvas.

ℹ️ Сам по собі Winerr представляє з себе генератор зображень з встановленими правилами та розрахунками, завдяки яким генеруються помилки, схожі на справжні помилки з Windows. Згенеровані зображення не завжди точно повторюють справжні помилки. Також є функціонал, який не буде доданий через складність реалізації (наприклад, відображення тексту справа-наліво, як в арабських чи івриті, 1-в-1 ClearType, кернінг, тощо), тому це також треба приймати до уваги.

## Установка (Windows)
1. Завантажте [Node.js](https://nodejs.org/en/download), якщо у вас його ще немає. Рекомендую встановити LTS-версию.
2. Розпакуйте вміст архиву у будь-яку директорію.
3. Відкрийте цю директорію в PowerShell або командному рядку.
4. Запустіть команду `npm i`, щоб встановити необхідні пакети.
5. Після їх встановлення, запустіть `npm start`.
6. Почекайте, поки текстури та іконки скомпілюються (в консолі виведеться `✅ BUILD DONE`).
7. Відкрийте http://localhost:3004/

## Установка (Linux)
```bash
# Встановлення Node.js та Git, якщо у вас їх немає
sudo apt update
sudo apt install nodejs npm git

# Завантаження цього репозиторію
git clone https://github.com/shikoshib/winerr

# Відкриття директорії з файлами репозиторію
cd winerr

# Встановлення усіх пакетів
npm i

# Запуск
npm start
```

## Подяки

* shikoshib - веб-дизайн, програмування, ресурси для помилок
* [NickHammerich](https://github.com/nickhammerich) - іконки, ресурси для помилок, тестування
* [DmytroYastrubiv](https://github.com/DimaYastrebov) - програмування, тестування
* Пугум - ресурси для помилок

## Ліцензія
[ISC](https://github.com/shikoshib/winerr/blob/main/LICENSE)

---
[Список перекладачів](https://github.com/shikoshib/winerr/tree/main/winerr-lang)

Перекладено [DmytroYastrubiv](https://github.com/DimaYastrebov)
