<div style="text-align: center">
  <strong>English</strong> | <a href="https://github.com/shikoshib/winerr/blob/main/README_ru.md">Русский</a> | <a href="https://github.com/shikoshib/winerr/blob/main/README_uk.md">Українська</a> | <a href="https://github.com/shikoshib/winerr/blob/main/README_ja.md">日本語</a>
</div>

# winerr
A fast and accurate Windows fake error messages generator based on HTML5 Canvas.

ℹ️ At its core, winerr is simply a PNG generator with premade rules and calculations set to resemble Windows error messages. The generated errors are not always 100% accurate replicas of what you'd see in Windows. Also, there are some things that can't or won't be implemented due to their complexity (e.g. RTL text rendering in languages like Arabic or Hebrew, identical ClearType behavior, font kerning, etc.), so please keep that in mind as well.

## How to install (Windows)
1. Download [Node.js](https://nodejs.org/en/download) if you haven't already. I recommend installing the LTS version.
2. Unzip all of the repository files in any directory.
3. Open this folder in `cmd` or PowerShell.
4. Run `npm i` to install all of the packages.
5. After they're installed, run `npm start`.
6. Wait until the spritesheets are done building (displayed as `✅ BUILD DONE` in the console).
7. The website should be running at http://localhost:3004/

## How to install (Linux)
```bash
# Install Node.js and Git if you haven't already
sudo apt update
sudo apt install nodejs npm git

# Clone this repository
git clone https://github.com/shikoshib/winerr

# Open the repository files
cd winerr

# Install all of the packages
npm i

# Run
npm start
```

## Credits

* shikoshib - web design, programming, error message assets
* [NickHammerich](https://github.com/nickhammerich) - icons, error message assets, testing
* [DimaYastrebov](https://github.com/DimaYastrebov) - programming, testing
* Pugum - error message assets

## License
[ISC](https://github.com/shikoshib/winerr/blob/main/LICENSE)

---
[Translation credits](https://github.com/shikoshib/winerr/tree/main/winerr-lang)