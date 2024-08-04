const fs = require("fs");
const zlib = require("zlib");

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');

async function buildSS() {
    const Canvas = require("canvas");
    let dirs = ["win1", "win2k", "win7", "win8", "win10", "win11", "win31", "win95", "win98", "winlh-4093", "winvista", "winwh", "winxp"];
    let canvasWidth = 2048;
    for (let dir of dirs) {
        let infoObj = {};
        const canvas = Canvas.createCanvas(canvasWidth, 4096);
        const ctx = canvas.getContext("2d");
        let widestRow = 0;
        let rowWidth = 0;
        let rowTallestHeight = 0;
        let rowHeight = 0;
        let rowNumber = 0;
        for (let file of fs.readdirSync(__dirname + `/public/assets/${dir}`)) {
            let y = 0;
            let err = false;

            let assetInfo = {};
            function draw(img, assets) {
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
                ctx.drawImage(img, rowWidth, y);
                return y;
            }
            if (file == "assets.json") {
                let assets = require(__dirname + `/public/assets/${dir}/assets.json`);
                for (let key of Object.keys(assets)) {
                    let asset = assets[key];
                    await Canvas.loadImage(asset).then(img => {
                        draw(img, assets);
                        if (err) {
                            err = false;
                            return;
                        }
                        assetInfo = { x: rowWidth, y: y, w: img.width, h: img.height };
                        infoObj[key] = assetInfo;
                        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.json`, JSON.stringify(infoObj));
                        rowWidth += img.width;
                    });
                }
                continue;
            }
            if (file == "icons.json") {
                let assets = require(__dirname + `/public/assets/${dir}/icons.json`);
                for (let icon of assets) {
                    let asset = icon.data;
                    await Canvas.loadImage(asset).then(img => {
                        draw(img, assets);
                        if (err) {
                            err = false;
                            return;
                        }
                        assetInfo = { x: rowWidth, y: y, w: img.width, h: img.height };
                        infoObj[`i-${icon.id}`] = assetInfo;
                        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.json`, JSON.stringify(infoObj));
                        rowWidth += img.width;
                    });
                }
            }
        }
        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.json`, JSON.stringify(infoObj));
        if (!rowHeight) widestRow = rowWidth;
        let height = rowHeight + rowTallestHeight;
        const finalCanvas = Canvas.createCanvas(widestRow, height);
        const finalCtx = finalCanvas.getContext("2d");
        await Canvas.loadImage(canvas.toBuffer()).then(img => {
            finalCtx.drawImage(img, 0, 0)
        })
        fs.writeFileSync(__dirname + `/build/windows/${dir}_assets.png`, finalCanvas.toBuffer());
        console.log(`[WINERR BUILD] ${dir} done`)
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
            let fontColor = filename.split("-")[1];
            let fontStyle = filename.split("-")[2].split(".")[0];
            if (fontName != recentFont && recentFont != "") {
                fontsObj[recentFont] = fontObj;
                fontObj = {};
            }
            recentFont = fontName;
            if (!fontObj[fontStyle]) fontObj[fontStyle] = {};
            if (!fontObj[fontStyle][fontColor]) fontObj[fontStyle][fontColor] = {};
            fontObj[fontStyle][fontColor].info = fontFile;
            fontObj[fontStyle][fontColor].src = Buffer.from(fs.readFileSync(__dirname + `/build/fonts/${filename.split(".")[0]}.png`)).toString("base64");
            if (fontName == "vgasysr") {
                fontsObj["vgasysr"] = fontObj;
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

        console.log("[WINERR BUILD] ✅ BUILD DONE")
    } else {
        console.log("[WINERR BUILD] BUILD SKIPPED");
    }
}

build().then(() => {
    let gzipArr = [];
    for (let name of ["assets", "fonts", "sysInfo"]) {
        const file = JSON.parse(fs.readFileSync(__dirname + `/build/${name}.json`).toString());

        function compress() {
            if (name == "sysInfo") {
                let str = "";
                const toInt = {
                    true: "1",
                    false: "0"
                }
                Object.keys(file).forEach(key => {
                    const os = file[key];
                    str += `${key}~${toInt[os.button3Allowed]}~${toInt[os.cross]}~${toInt[os.gradient]}~${toInt[os.recolor]}|`;
                })
                return str;
            }

            if (name == "fonts") {
                let str = "";
                Object.keys(file).forEach(fn => {
                    const font = file[fn];
                    let fontStr = fn + "[";
                    for (let style of Object.keys(font)) {
                        let styleStr = "";
                        for (let color of Object.keys(font[style])) {
                            let colorStr = color + "|";
                            for (let char of Object.keys(font[style][color].info)) {
                                const charInfo = font[style][color].info[char];
                                colorStr += `${char}:${charInfo.x}~${charInfo.y}~${charInfo.w}~${charInfo.h}|`;
                            }
                            colorStr += `src:${font[style][color].src}~;~`;
                            styleStr += colorStr;
                        }
                        fontStr += `${style}~|~${styleStr}~:~`;
                    }
                    str += fontStr + `,`;
                })
                return str;
            }

            if (name == "assets") {
                let str = "";
                Object.keys(file).forEach(sn => {
                    const os = file[sn];
                    let osStr = "";
                    for (let asset of Object.keys(os.assets)) {
                        const assetInfo = os.assets[asset];
                        osStr += `${asset}:${assetInfo.x}~${assetInfo.y}~${assetInfo.w}~${assetInfo.h}|`;
                    }
                    osStr += `src:${os.src}`;
                    str += `${sn}~:~${osStr};`;
                })
                return str;
            }
        }

        gzipArr.push(zlib.gzipSync(compress()).toString("base64"));
    }

    fs.writeFileSync(__dirname + "/build/gzip", gzipArr.join("~"));

    app.use(express.json({ limit: "4mb" }));
    app.use(express.static(__dirname + "/public"));
    app.use(cookieParser());

    app.use((req, res, next) => {
        res.removeHeader("X-Powered-By");
        res.set("Access-Control-Allow-Origin", "*");
        res.set("X-Frame-Options", "DENY");
        next();
    })

    const router = require("./router");
    app.use("/", router);

    app.listen(3004)
    console.log("✅ Server running at http://localhost:3004/");
});