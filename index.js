const fs = require("fs");
const zlib = require("zlib");

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const { Jimp } = require("jimp");

async function buildSS() {
    let dirs = ["win1", "win2k", "win7", "win8", "win10", "win11", "win31", "win95", "win98", "winlh-4093", "winvista", "winwh", "winxp"];
    let canvasWidth = 2048;
    for (let dir of dirs) {
        let infoObj = {};
        const canvas = new Jimp({ width: canvasWidth, height: 4096 });
        let widestRow = 0;
        let rowWidth = 0;
        let rowTallestHeight = 0;
        let rowHeight = 0;
        let rowNumber = 0;

        for (let file of fs.readdirSync(__dirname + `/public/assets/${dir}`)) {
            let y = 0;
            let err = false;

            let assetInfo = {};
            async function draw(img, assets) {
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

                canvas.composite(img, rowWidth, y);
                return y;
            }

            if (file == "assets.json") {
                let assets = require(__dirname + `/public/assets/${dir}/assets.json`);
                for (let key of Object.keys(assets)) {
                    let asset = assets[key];
                    const img = await Jimp.read(asset);
                    draw(img, assets);
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
                let assets = require(__dirname + `/public/assets/${dir}/icons.json`);
                for (let icon of assets) {
                    let asset = icon.data;
                    const img = await Jimp.read(asset);
                    draw(img, assets);
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
        const canvasBuffer = await canvas.getBuffer("image/png");
        const canvasImage = await Jimp.read(canvasBuffer);
        finalCanvas.composite(canvasImage, 0, 0);

        const finalBuffer = await finalCanvas.getBuffer("image/png");
        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.png`, finalBuffer);
        console.log(`${dir} done`)
    }
}

async function build() {
    let winerrAssetsVersion = fs.readFileSync(__dirname + "/version.txt").toString();
    let latestBuildVersion = fs.readFileSync(__dirname + "/build/latestver.txt").toString();
    if (winerrAssetsVersion != latestBuildVersion) {
        await buildSS();

        const fontsDir = fs.readdirSync(__dirname + "/build/fonts");
        const winDir = fs.readdirSync(__dirname + "/build/windows");

        let fontsObj = {};
        let fontObj = {};
        let recentFont = "";
        for (let filename of fontsDir) {
            if (!filename.includes(".json")) continue;
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

        console.log("✅ BUILD DONE")
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
    app.use(cookieParser());

    // The actual pages are defined in router.js
    const router = require("./router");
    app.use("/", router);

    // Start the server
    app.listen(3004);
    console.log("✅ Server running at http://localhost:3004/");
});