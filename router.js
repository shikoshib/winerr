const fs = require("fs");
const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    const lang = fs.existsSync(__dirname + `/winerr-lang/${req.cookies.winerrLang}.json`) ? req.cookies.winerrLang : "en";

    let html = fs.readFileSync(__dirname + "/generator.html").toString();
    let langFile = JSON.parse(fs.readFileSync(__dirname + `/winerr-lang/${lang}.json`).toString());
    let keys = Object.keys(langFile);
    for (let key of keys) {
        html = html.replaceAll(`((${key}))`, langFile[key]);
    }

    const version = fs.readFileSync(__dirname + "/version.txt").toString();
    html = html.replace("((version))", version); // Input the newest assets version to make the front-end script check for updates
    html = html.replaceAll(`option value="${lang}"`, `option value="${lang}" selected`); // Show the current selected language in the dropdown
    html = html.replaceAll(`lang="((lang))"`, `lang="${lang}"`); // Enhance browser compatibility (e.g. allow page translation)

    let resGZip = fs.readFileSync(__dirname + "/build/gzip").toString();
    html = html.replaceAll("((icons-length))", resGZip.length);
    return res.send(html);
})

router.get("/resources", (req, res) => {
    return res.sendFile(__dirname + "/build/gzip");
});

// Icons list
router.get("/icons", (req, res) => {
    let systems = ["win1", "win31", "win95", "win98", "win2k", "winwh", "winxp", "winlh-4093", "win7", "win8", "win10", "win11"];
    let arr = [];
    for (let system of systems) {
        let icons = fs.readFileSync(__dirname + `/public/assets/${system}/icons.json`, `utf-8`);
        icons = JSON.parse(icons)
        arr.push({ name: system, icons: icons })
    }
    let html = `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Icons</title>
    <link rel="stylesheet" href="../style.css">
    </head>
    <body>
    <div class="os-wrapper">`;
    arr.forEach(s => {
        let obj = {
            "win1": "Windows 1.0",
            "win31": "Windows 3.1",
            "win95": "Windows 95",
            "win98": "Windows 98",
            "win2k": "Windows 2000",
            "winwh": "Windows Whistler",
            "winxp": "Windows XP",
            "winlh-4093": "Windows Longhorn build 4093",
            "win7": "Windows Vista/7",
            "win8": "Windows 8/8.1",
            "win10": "Windows 10",
            "win11": "Windows 11"
        }
        html += `<div class="os"><h1>${obj[s.name]}</h1><div class="icons-list">`
        s.icons.forEach(i => {
            html += `<div class="icon-card-wrapper"><span class="icon-id">${i.id}.</span><div class="icon-card"><span class="img"><img src="${i.data}"></span></div></div>`;
        })
        html += `</div></div>`
    })
    html += `</div></body></html>`
    return res.send(html)
})

module.exports = router;