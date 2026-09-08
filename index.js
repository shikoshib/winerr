const fs = require("fs");
const zlib = require("zlib");

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const csrf = require("csurf");
const { Jimp } = require("jimp");

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// delete a line from stdout
function stddel(count) {
    for (let i = 0; i < count; i++) {
        process.stdout.write('\x1b[1A'); // go up
        process.stdout.write('\x1b[2K'); // clear
    }
}

function renderPercentage(current, totalAssets, dirObj, os) {
    const blockCount = Math.round((current / totalAssets) * 20); // how many blocks should be used to display progress. 1 block = 5%
    let blocks = "                    ";
    blocks = blocks.split("");
    for (let i = 0; i < blockCount; i++) {
        blocks[i] = "█";
    }
    blocks = blocks.join("");

    stddel(3); // delete 3 lines to override the previous progress bar
    console.log(`⏳ BUILDING: ${dirObj[os]} (${Object.keys(dirObj).indexOf(os) + 1}/${Object.keys(dirObj).length})`)
    console.log(`[${blocks}] ${((current / totalAssets) * 100).toFixed(2)}%\n`)
}

async function buildSS() {
    let dirs = ["win1", "win2k", "win7", "win8", "win10", "win11", "win31", "win95", "win98", "winlh-4093", "winvista", "winwh", "winxp"];
    let dirObj = {
        "win1": "Windows 1.0/2.0",
        "win2k": "Windows 2000",
        "win7": "Windows Vista/7 (Aero)",
        "win8": "Windows 8/8.1",
        "win10": "Windows 10",
        "win11": "Windows 11",
        "win31": "Windows 3.1",
        "win95": "Windows 95",
        "win98": "Windows 98",
        "winlh-4093": "Windows Longhorn build 4093",
        "winvista": "Windows Vista/7 (Basic)",
        "winwh": "Windows Whistler",
        "winxp": "Windows XP"
    };
    let assetCountObj = {};
    let canvasWidth = 2048;

    // first off, read the amount of assets on each os
    for (let dir of dirs) {
        assetCountObj[dir] = 0;
        for (let file of fs.readdirSync(__dirname + `/public/assets/${dir}`)) {
            if (file == "assets.json") {
                let assets = require(__dirname + `/public/assets/${dir}/assets.json`);
                assetCountObj[dir] += Object.keys(assets).length;
            }

            if (file == "icons.json") {
                let icons = require(__dirname + `/public/assets/${dir}/icons.json`);
                assetCountObj[dir] += icons.length;
            }
        }
    }

    let totalAssets = 0;
    for (let value of Object.values(assetCountObj)) {
        totalAssets += value;
    }

    let currentAssetCount = 0;

    for (let dir of dirs) {
        let infoObj = {};
        let widestRow = 0;
        let rowWidth = 0;
        let rowTallestHeight = 0;
        let rowHeight = 0;
        let rowNumber = 0;

        function increaseCount() {
            currentAssetCount += 1;
            renderPercentage(currentAssetCount, totalAssets, dirObj, dir);
        }

        for (let file of fs.readdirSync(__dirname + `/public/assets/${dir}`)) {
            let y = 0;
            let err = false;

            let assetInfo = {};

            async function count(img, assets) {
                if (rowWidth + img.width > canvasWidth) {
                    if (rowWidth >= widestRow) widestRow = rowWidth;
                    rowWidth = 0;
                    rowHeight += rowTallestHeight;
                    rowNumber++;
                    rowTallestHeight = 0;
                }

                if (Object.keys(img).length == Object.keys(assets).length) {
                    err = true;
                    return;
                }

                if (rowTallestHeight <= img.height) rowTallestHeight = img.height;
                y = rowHeight;

                increaseCount();
            }

            if (file == "assets.json") {
                let assets = require(__dirname + `/public/assets/${dir}/assets.json`);
                for (let key of Object.keys(assets)) {
                    let asset = assets[key];
                    const img = await Jimp.read(asset);
                    count(img, assets);
                    if (err) {
                        err = false;
                        return;
                    }
                    assetInfo = { x: rowWidth, y: y, w: img.width, h: img.height };
                    infoObj[key] = assetInfo;
                    fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.json`, JSON.stringify(infoObj));
                    rowWidth += img.width;
                }
                continue;
            }

            if (file == "icons.json") {
                let icons = require(__dirname + `/public/assets/${dir}/icons.json`);
                for (let icon of icons) {
                    let asset = icon.data;
                    const img = await Jimp.read(asset);
                    count(img, icons);
                    if (err) {
                        err = false;
                        return;
                    }
                    assetInfo = { x: rowWidth, y: y, w: img.width, h: img.height };
                    infoObj[`i-${icon.id}`] = assetInfo;
                    fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.json`, JSON.stringify(infoObj));
                    rowWidth += img.width;
                }
            }
        }

        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.json`, JSON.stringify(infoObj));
        if (!rowHeight) widestRow = rowWidth;
        let height = rowHeight + rowTallestHeight;
        const finalCanvas = new Jimp({ width: widestRow, height: height });

        for (let key of Object.keys(infoObj)) {
            // place icons
            if (key.startsWith("i-")) {
                const icons = require(__dirname + `/public/assets/${dir}/icons.json`);
                const iconData = icons.filter(i => i.id == Number(key.split("i-")[1]))[0].data;
                const icon = await Jimp.read(iconData);
                finalCanvas.composite(icon, infoObj[key].x, infoObj[key].y, infoObj[key].w, infoObj[key].h);
            } else {   // place assets
                const assets = require(__dirname + `/public/assets/${dir}/assets.json`);
                const assetData = assets[key];
                const asset = await Jimp.read(assetData);
                finalCanvas.composite(asset, infoObj[key].x, infoObj[key].y, infoObj[key].w, infoObj[key].h);
            }
        }

        const finalBuffer = await finalCanvas.getBuffer("image/png");
        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.png`, finalBuffer);
    }
}

async function build() {
    let winerrAssetsVersion = fs.readFileSync(__dirname + "/version.txt").toString();
    let latestBuildVersion = fs.readFileSync(__dirname + "/build/latestver.txt").toString();
    if (winerrAssetsVersion != latestBuildVersion) {
        console.log("\n\n")
        await buildSS();

        stddel(3);
        console.log("⏳ Building fonts...");
        const fontsDir = fs.readdirSync(__dirname + "/build/fonts");
        const winDir = fs.readdirSync(__dirname + "/build/windows");

        let fontsObj = {};
        let fontObj = {};
        let recentFont = "";
        for (let filename of fontsDir) {
            if (!filename.endsWith(".json")) continue;
            let fontFile = require(__dirname + `/build/fonts/${filename}`);
            let fontName = filename.split("-")[0];
            let fontStyle = filename.split("-")[1].split(".")[0];

            if (fontName != recentFont && recentFont != "") {
                fontsObj[recentFont] = fontObj;
                fontObj = {};
            }

            recentFont = fontName;
            if (!fontObj[fontStyle]) fontObj[fontStyle] = {};

            fontObj[fontStyle].info = fontFile;
            fontObj[fontStyle].src = Buffer.from(fs.readFileSync(__dirname + `/build/fonts/${filename.split(".")[0]}.png`)).toString("base64");

            if (fontsDir.indexOf(filename) / 2 == (fontsDir.length / 2) - 1) {
                fontsObj[recentFont] = fontObj;
                fontObj = {};
            }
        }

        let assetsObj = {};
        for (let filename of winDir) {
            if (!filename.includes(".json")) continue;
            let fontFile = require(__dirname + `/build/windows/${filename}`);
            let sysName = filename.split("_")[0];
            assetsObj[sysName] = {};
            assetsObj[sysName].assets = fontFile;
            assetsObj[sysName].src = Buffer.from(fs.readFileSync(__dirname + `/build/windows/${filename.split(".")[0]}.png`)).toString("base64");
        }

        fs.writeFileSync(__dirname + "/build/fonts.json", JSON.stringify(fontsObj));
        fs.writeFileSync(__dirname + "/build/assets.json", JSON.stringify(assetsObj));

        fs.writeFileSync(__dirname + "/build/latestver.txt", winerrAssetsVersion);

        stddel(1);
        console.log("✅ BUILD DONE");
    } else {
        console.log("BUILD SKIPPED");
    }
}

build().then(() => {
    let gzipArr = [];
    for (let name of ["assets", "fonts", "sysInfo"]) {
        const file = fs.readFileSync(__dirname + `/build/${name}.json`).toString();
        gzipArr.push(zlib.gzipSync(file).toString("base64"));
    }

    fs.writeFileSync(__dirname + "/build/gzip", gzipArr.join("~"));

    app.use(express.static(__dirname + "/public"));

    // The actual pages are defined in router.js
    const router = require("./router");
    app.use("/", router);

    // Start the server
    app.listen(3004);
    console.log("✅ Server running at http://localhost:3004/");
});