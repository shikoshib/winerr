# Assets

So there's two type of assets: fonts and the error message assets.

## Fonts

They are split into folders with different fonts, which are split into different styles (bold and regular), if any. Each of the style folders contain the JSON file with the characters data (`black.json` or `white.json`), and the config file with every supported character's width (`chars-width.json`).

The character data itself is a Base64-encoded image of the character with the chosen font and its style.

## Error message assets

Anything in folders other than `fonts` is error message assets. Each one of the folders include `icons.json`, the file with all of the icons, and `assets.json`, the file with the error message themes (except for Windows 98, 'cause it uses assets from Windows 95).
