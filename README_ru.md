<div style="text-align: center">
  <a href="https://github.com/shikoshib/winerr/blob/main/README.md">English</a> | <strong>Русский</strong> | <a href="https://github.com/shikoshib/winerr/blob/main/README_uk.md">Українська</a> | <a href="https://github.com/shikoshib/winerr/blob/main/README_ja.md">日本語</a>
</div>

# winerr
Быстрый и точный генератор ошибок Windows, созданный при помощи HTML5 Canvas.

ℹ️ Сам по себе winerr является просто генератором картинок с предустановленными правилами и расчётами, благодаря которым получаются ошибки, похожие на те, что есть в Windows. Сгенерированные изображения не всегда точно повторяют оригиналы. Также есть функционал, который не будет добавлен из-за сложности реализации (например, отображение текста справа налево, как в арабском языке или иврите, идентичный рендеринг ClearType, кернинг и т. п.), так что это тоже стоит учитывать.

## Установка (Windows)
1. Скачайте [Node.js](https://nodejs.org/en/download), если вас его ещё нет. Рекомендую устанавливать LTS-версию.
2. Распакуйте содержимое архива в любую директорию.
3. Откройте данную директорию в PowerShell или командной строке.
4. Запустите команду `npm i`, чтобы установить необходимые пакеты.
5. После их установки, запустите `npm start`.
6. Подождите, пока текстуры и иконки скомпилируются (в консоли выведется `✅ BUILD DONE`).
7. Откройте http://localhost:3004/

## Установка (Linux)
```bash
# Установка Node.js и Git, если их нет
sudo apt update
sudo apt install nodejs npm git

# Скачивание этого репозитория
git clone https://github.com/shikoshib/winerr

# Открытие директории с файлами репозитория
cd winerr

# Установка всех пакетов
npm i

# Запуск
npm start
```

## Благодарности

* shikoshib - веб-дизайн, программирование, ресурсы для ошибок
* [NickHammerich](https://github.com/nickhammerich) - иконки, ресурсы для ошибок, тестирование
* [DmytroYastrubiv](https://github.com/DimaYastrebov) - программирование, тестирование
* Пугум - ресурсы для ошибок

## Лицензия
[ISC](https://github.com/shikoshib/winerr/blob/main/LICENSE)

---
[Список переводчиков](https://github.com/shikoshib/winerr/tree/main/winerr-lang)