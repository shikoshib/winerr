const modalWrapper = document.querySelector(".modal-wrapper");
const modal = document.querySelector(".modal");
const modalTitleWrapper = document.querySelector(".modal-title-wrapper");
const modalTitle = document.querySelector(".modal-title");
const modalContent = document.querySelector(".modal-content");
const modalIcon = document.querySelector(".modal-icon");
const modalCross = document.querySelector(".modal-cross");
const overlay = document.querySelector("#modal-overlay");
const checkB64 = "data:image/svg+xml;base64,CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjIycHgiIGhlaWdodD0iMjJweCIgdmlld0JveD0iMCAwIDIyIDIyIj4KPGRlZnM+CjxwYXRoIGlkPSJMYXllcjBfMF9NRU1CRVJfMF9NRU1CRVJfMF8xX1NUUk9LRVMiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLW1pdGVybGltaXQ9IjQiIGZpbGw9Im5vbmUiIGQ9IgpNIDYuMTUgMTcuOApMIDExLjQ1IDIzLjE1IDI1LjggOC45Ii8+CjwvZGVmcz4KCjxnIHRyYW5zZm9ybT0ibWF0cml4KCAxLCAwLCAwLCAxLCAtNC45NSwtNSkgIj4KPHVzZSB4bGluazpocmVmPSIjTGF5ZXIwXzBfTUVNQkVSXzBfTUVNQkVSXzBfMV9TVFJPS0VTIi8+CjwvZz4KPC9zdmc+Cg==";
const errorCanvas = document.getElementById("canvas");

const root = document.documentElement;

let BGobj = {};
let assetsArray = {};
let fonts = {};
let systems = {};
async function load() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let savedVersion = localStorage.getItem("version");
    let gzipRes = '';
    let iconsGzip = "";
    if (savedVersion != version) {
        modalContent.innerHTML = loadingAssets;

        const reqResources = await fetch("/resources");
        reader = reqResources.body.getReader();

        let receivedLength = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            receivedLength += value.length;
            const percentage = ((receivedLength / iconsLength) * 100).toFixed(2);
            gzipRes += new TextDecoder().decode(value);
            modalContent.innerHTML = `${loadingAssets.replace("...", "")}: ${(receivedLength / 1048576).toFixed(2)} MB / ${(iconsLength / 1048576).toFixed(2)} MB (${percentage}%)`;
        }

        localStorage.setItem("fonts", gzipRes.split("~")[1]);
        localStorage.setItem("sysInfo", gzipRes.split("~")[2]);
        localStorage.setItem("version", version);

        iconsGzip = gzipRes.split("~")[0];

        const request = indexedDB.open("assetsdb", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            let objectStore = db.createObjectStore("assets");
            objectStore.createIndex("assets", "assets");

            objectStore.transaction.oncomplete = (event) => {
                const objStore = db
                    .transaction("assets", "readwrite")
                    .objectStore("assets");
                objStore.add(iconsGzip, "assets");
            };
        }
    } else {
        async function loadIcons() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open("assetsdb");

                request.onsuccess = function (event) {
                    const db = event.target.result;

                    const transaction = db.transaction(["assets"], "readonly");
                    const objectStore = transaction.objectStore("assets");
                    const getRequest = objectStore.get("assets");

                    getRequest.onsuccess = function (event) {
                        const gz = event.target.result;
                        resolve(gz);
                    };

                    getRequest.onerror = function (event) {
                        reject(event.target.error);
                    };
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            });
        }

        iconsGzip = await loadIcons();
    }
    const sysInfoGzip = localStorage.getItem("sysInfo");
    const assetsObjGzip = iconsGzip;
    const fontsObjGzip = localStorage.getItem("fonts");
    modalContent.innerHTML = extractingAssets;

    const gzippedSysData = atob(sysInfoGzip);
    const sysDataArray = Uint8Array.from(gzippedSysData, c => c.charCodeAt(0));
    let sysString = new TextDecoder().decode(pako.ungzip(sysDataArray));

    for (const os of sysString.split("|")) {
        const split = os.split("~");
        const toBoolean = {
            "0": false,
            "1": true
        };
        if (!split[0]) continue;
        systems[split[0]] = {
            button3Allowed: toBoolean[split[1]],
            cross: toBoolean[split[2]],
            gradient: toBoolean[split[3]],
            recolor: toBoolean[split[4]]
        };
    }

    const gzippedAssetsData = atob(assetsObjGzip);
    const assetsDataArray = Uint8Array.from(gzippedAssetsData, c => c.charCodeAt(0));
    let assetsStr = new TextDecoder().decode(pako.ungzip(assetsDataArray));

    for (const os of assetsStr.split(";")) {
        const split = os.split("~:~");
        if (!split[0]) continue;
        assetsArray[split[0]] = {};
        let assets = {};
        for (let asset of split[1].split("|")) {
            if (asset.split(":")[0] == "src") {
                assetsArray[split[0]].src = asset.split(":")[1];
                continue;
            }
            const coords = asset.split(":")[1].split("~");
            assets[asset.split(":")[0]] = {
                x: Number(coords[0]),
                y: Number(coords[1]),
                w: Number(coords[2]),
                h: Number(coords[3])
            };
        }
        assetsArray[split[0]].assets = assets;
    }

    const gzippedFontsData = atob(fontsObjGzip);
    const fontsDataArray = Uint8Array.from(gzippedFontsData, c => c.charCodeAt(0));
    let fontsStr = new TextDecoder().decode(pako.ungzip(fontsDataArray));

    for (const font of fontsStr.split(",")) {
        const split = font.split("[");
        if (!split[0]) continue;
        fonts[split[0]] = {};
        for (const style of split[1].split("~:~")) {
            const styleSplit = style.split("~|~");
            if (!styleSplit[0]) continue;
            fonts[split[0]][styleSplit[0]] = {};

            for (const color of styleSplit[1].split("~;~")) {
                const colorSplit = color.split("|");
                if (!colorSplit[0]) continue;
                fonts[split[0]][styleSplit[0]][colorSplit[0]] = {};
                let colorAssets = {};

                for (const asset of colorSplit) {
                    if (!asset.includes(":")) continue;
                    const assetSplit = asset.split(":");
                    if (assetSplit[0] == "src") {
                        fonts[split[0]][styleSplit[0]][colorSplit[0]].src = asset.split(":")[1].split("~")[0];
                        continue;
                    }

                    const coords = assetSplit[1].split("~");
                    colorAssets[assetSplit[0]] = {
                        x: Number(coords[0]),
                        y: Number(coords[1]),
                        w: Number(coords[2]),
                        h: Number(coords[3])
                    }
                }

                fonts[split[0]][styleSplit[0]][colorSplit[0]].info = colorAssets;
            }
        }
    }

    // Due to technical issues that are out of my control, Mozilla Firefox
    // has an issue when some assets don't get placed on the canvas. To
    // encourage people to switch to Google Chrome (which gets the job done
    // the best), a little warning is displayed.
    if (/Firefox/.test(navigator.userAgent)) {
        modalContent.innerHTML = `<span>${browserWarn}</span>`;
        modalCross.style.display = "inline-block";
        modalIcon.classList.remove("hourglass");
        modalIcon.src = "./svg/warn.svg";
        modal.style.maxWidth = "320px";
        root.style.setProperty("--space-width", `210px`);
        modalTitle.innerHTML = warning;
    } else {
        modal.style.translate = "0 -32px";
        modal.style.opacity = 0;

        overlay.style.opacity = 0;
        overlay.style.pointerEvents = "none";
        document.querySelector("body").style.overflowY = "visible";

        setTimeout(() => {
            modalWrapper.style.display = "none";
            overlay.style.display = "none";
        }, 375);
    }
}

load();

let sys = document.querySelector("#os");
let icon = document.querySelector("#icon");
let btn1DisElem = document.querySelector("#btn1-dis");
let btn2DisElem = document.querySelector("#btn2-dis");
let btn1RecElem = document.querySelector("#btn1-rec");
let btn2RecElem = document.querySelector("#btn2-rec");
let btn3Elem = document.querySelector("#btn3");
let btn3DisElem = document.querySelector("#btn3-dis");
let btn3RecElem = document.querySelector("#btn3-rec");
let cross = document.querySelector("#cross");

let sysFontObj = {
    "win1": "Fixedsys",
    "win31": "MSSansSerif",
    "win95": "MSSansSerif",
    "win98": "MSSansSerif",
    "win2k": "Tahoma",
    "winwh": "Tahoma",
    "winxp": "Tahoma",
    "winlh-4093": "Tahoma",
    "winvista": "SegoeUI_9pt",
    "win7": "SegoeUI_9pt",
    "win8": "SegoeUI_9pt",
    "win10": "SegoeUI_9pt",
    "win11": "SegoeUI_9pt"
}

// Check if a string of text includes Chinese or Japanese characters
function isCJ(text) {
    if (!text) return false;
    const ChineseRegex = new RegExp(String.raw`
    [\u{FA0E}\u{FA0F}\u{FA11}\u{FA13}\u{FA14}\u{FA1F}\u{FA21}\u{FA23}\u{FA24}\u{FA27}-\u{FA29}]
    |[\u{3000}-\u{303F}]
    |[\u{4E00}-\u{9FCC}]
    |[\u{3400}-\u{4DB5}]
    |[\u{20000}-\u{2A6D6}]
    |[\u{2A700}-\u{2B734}]
    |[\u{2B740}-\u{2B81D}]
    |[\u{2B820}-\u{2CEAF}]
    |[\u{2CEB0}-\u{2EBEF}]
  `.replace(/\s+/g, ''), "u");
    const JapaneseRegex = /[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤ヶ]+/u;
    for (let regex of [ChineseRegex, JapaneseRegex]) {
        if (text.match(regex)) {
            return true;
        } else {
            continue;
        }
    }
    return false;
}

// Calculate the width of a string of text in pixels
function testBitmaps(content, isBold = false, isLarge = false, vgasysr = false) {
    let fontface = sysFontObj[sys.value];
    if (isLarge) fontface = "SegoeUI_11pt";
    if (vgasysr) fontface = "vgasysr"
    if (sys.value == "winxp" && isBold) fontface = "TrebuchetMS";
    let chars = content.split("");
    if (chars[chars.length - 1] == "") chars.pop();
    let charsWidth = 0;
    if (sys.value == "win1") {
        for (let char of chars) {
            charsWidth += 8;
        }
        return charsWidth;
    }
    let charsInfo;
    let initFontFace = fontface;
    for (const char of chars) {
        // CJ
        if (["win95", "win98", "win2k", "winwh", "winxp", "winlh-4093"].includes(sys.value) && !isBold && isCJ(char)) {
            fontface = "SimSun";
            charsInfo = fonts["SimSun"]["regular"]["black"].info;
        } else if (["winvista", "win7", "win8", "win10", "win11"].includes(sys.value) && !isBold && isCJ(char)) {
            fontface = "MSUIGothic";
            charsInfo = fonts["MSUIGothic"]["regular"]["black"].info;
        } else if (!isCJ(char)) {
            fontface = initFontFace;
            charsInfo = fonts[fontface][isBold ? "bold" : "regular"][Object.keys(fonts[fontface][isBold ? "bold" : "regular"])[0]].info;
        }
        let addPx = 1;
        if (fontface == "TrebuchetMS") addPx = 0;
        if (fontface == "SegoeUI_11pt") addPx = 2;
        charsWidth += charsInfo[char.charCodeAt(0)].w + addPx;
    }
    return charsWidth;
}

sys.addEventListener("change", async (e) => {
    const sysname = e.target.value;

    let sysInfo = systems[sysname];

    let iconSys = sysname;
    if (iconSys == "winvista") iconSys = "win7";
    let iconsCount = Object.keys(assetsArray[iconSys].assets).filter(i => i.startsWith("i-")).length;
    icon.max = iconsCount;

    if (sysInfo.button3Allowed) {
        btn3Elem.disabled = false;
        document.querySelector("#btn3dis-label").classList.remove("disabled-label");
        btn3DisElem.disabled = false;
        document.querySelector("#btn3rec-label").classList.remove("disabled-label");
        btn3RecElem.disabled = false;
    } else {
        btn3Elem.disabled = true;
        document.querySelector("#btn3dis-label").classList.add("disabled-label");
        btn3DisElem.disabled = true;
        document.querySelector("#btn3rec-label").classList.add("disabled-label");
        btn3RecElem.disabled = true;
    }

    if (sysInfo.cross) {
        document.querySelector(".cross-selector label").classList.remove("disabled-label");
        cross.disabled = false;
    } else {
        document.querySelector(".cross-selector label").classList.add("disabled-label");
        cross.disabled = true;
    }

    if (sysInfo.recolor) {
        document.querySelector(".frame-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#frame-color").classList.remove("disabled-color-prev");
    } else {
        document.querySelector(".frame-color-wrapper").classList.add("disabled-color");
        document.querySelector("#frame-color").classList.add("disabled-color-prev");
    }

    if (sysInfo.gradient) {
        let colors = {
            "win95": { p: "0,0,128", s: "0,0,128" },
            "win98": { p: "0,0,128", s: "16,132,208" },
            "win2k": { p: "10,36,106", s: "166,202,240" }
        };

        root.style.setProperty("--primary-gradient-color", colors[sysname].p);
        root.style.setProperty("--secondary-gradient-color", colors[sysname].s);

        document.querySelector(".primary-gradient-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#primary-gradient-color").classList.remove("disabled-color-prev");

        document.querySelector(".secondary-gradient-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#secondary-gradient-color").classList.remove("disabled-color-prev");
    } else {
        document.querySelector(".primary-gradient-color-wrapper").classList.add("disabled-color");
        document.querySelector("#primary-gradient-color").classList.add("disabled-color-prev");

        document.querySelector(".secondary-gradient-color-wrapper").classList.add("disabled-color");
        document.querySelector("#secondary-gradient-color").classList.add("disabled-color-prev");
    }
});

btn1RecElem.addEventListener("click", (e) => {
    if (e.target.checked) {
        document.querySelector("#btn1dis-label").classList.add("disabled-label");
        btn1DisElem.disabled = true;
        btn1DisElem.checked = false;

        document.querySelector("#btn2rec-label").classList.add("disabled-label");
        btn2RecElem.disabled = true;
        btn2RecElem.checked = false;
        if (systems[sys.value].button3Allowed) {
            document.querySelector("#btn3rec-label").classList.add("disabled-label");
            btn3RecElem.disabled = true;
            btn3RecElem.checked = false;
        }
    } else {
        document.querySelector("#btn1dis-label").classList.remove("disabled-label");
        btn1DisElem.disabled = false;

        document.querySelector("#btn2rec-label").classList.remove("disabled-label");
        btn2RecElem.disabled = false;
        if (systems[sys.value].button3Allowed) {
            document.querySelector("#btn3rec-label").classList.remove("disabled-label");
            btn3RecElem.disabled = false;
        }
    }
});

btn2RecElem.addEventListener("click", (e) => {
    if (e.target.checked) {
        document.querySelector("#btn2dis-label").classList.add("disabled-label");
        btn2DisElem.disabled = true;
        btn2DisElem.checked = false;

        document.querySelector("#btn1rec-label").classList.add("disabled-label");
        btn1RecElem.disabled = true;
        btn1RecElem.checked = false;
        if (systems[sys.value].button3Allowed) {
            document.querySelector("#btn3rec-label").classList.add("disabled-label");
            btn3RecElem.disabled = true;
            btn3RecElem.checked = false;
        }
    } else {
        document.querySelector("#btn2dis-label").classList.remove("disabled-label");
        btn2DisElem.disabled = false;

        document.querySelector("#btn1rec-label").classList.remove("disabled-label");
        btn1RecElem.disabled = false;
        if (systems[sys.value].button3Allowed) {
            document.querySelector("#btn3rec-label").classList.remove("disabled-label");
            btn3RecElem.disabled = false;
        }
    }
});

btn3RecElem.addEventListener("click", (e) => {
    if (e.target.checked) {
        document.querySelector("#btn3dis-label").classList.add("disabled-label");
        btn3DisElem.disabled = true;
        btn3DisElem.checked = false;

        document.querySelector("#btn1rec-label").classList.add("disabled-label");
        btn1RecElem.disabled = true;
        btn1RecElem.checked = false;
        document.querySelector("#btn2rec-label").classList.add("disabled-label");
        btn2RecElem.disabled = true;
        btn2RecElem.checked = false;
    } else {
        document.querySelector("#btn3dis-label").classList.remove("disabled-label");
        btn3DisElem.disabled = false;

        document.querySelector("#btn1rec-label").classList.remove("disabled-label");
        btn1RecElem.disabled = false;
        document.querySelector("#btn2rec-label").classList.remove("disabled-label");
        btn2RecElem.disabled = false;
    }
});

let generateBtn = document.querySelector(".generate");
generateBtn.addEventListener("click", async () => {
    generateBtn.disabled = true;
    modalWrapper.style.display = "flex";
    overlay.style.display = "block";

    setTimeout(async () => {
        modal.style.opacity = 1;
        modalContent.innerHTML = generating;
        modal.style.translate = "0 0px";

        overlay.style.pointerEvents = "auto";
        overlay.style.opacity = 1;
        document.querySelector("body").style.overflowY = "hidden";

        let titleElem = document.querySelector("#err-title");
        let contentElem = document.querySelector("#err-desc");
        let btn1Elem = document.querySelector("#btn1");
        let btn2Elem = document.querySelector("#btn2");

        try {
            let estart = performance.now();
            await createError(sys.value, titleElem.value, contentElem.value, Math.trunc(Number(icon.value)), { name: btn1Elem.value, disabled: btn1DisElem.checked, rec: btn1RecElem.checked }, { name: btn2Elem.value, disabled: btn2DisElem.checked, rec: btn2RecElem.checked }, { name: btn3Elem.value, disabled: btn3DisElem.checked, rec: btn3RecElem.checked }, cross.checked, `rgb(${getComputedStyle(root).getPropertyValue("--frame-color")})`, `rgb(${getComputedStyle(root).getPropertyValue("--primary-gradient-color")})`, `rgb(${getComputedStyle(root).getPropertyValue("--secondary-gradient-color")})`);
            let efinish = performance.now();
            console.log(efinish - estart);
        } catch (e) {
            console.error(e);
            modalCross.style.display = "inline-block";
            modalTitleWrapper.classList.add("title-error");
            modalTitleWrapper.classList.remove("title-warn");
            modalTitle.innerHTML = `Error!`;
            modalContent.style.justifyContent = "center";
            modalIcon.classList.remove("hourglass");
            modalContent.innerHTML = `${e.name}: ${e.message}`;
            return;
        }

        async function returnError() {
            const errorB64 = errorCanvas.toDataURL();
            const ctx = errorCanvas.getContext("2d");
            ctx.reset();

            let img = new Image();
            img.src = errorB64;
            img.onload = () => {
                modalCross.style.display = "inline-block";
                let widthNoPadding = img.width > 248 ? img.width : 248;
                let spaceWidth = widthNoPadding - 16 - 54 - 16 - 12;
                root.style.setProperty("--space-width", `${spaceWidth}px`);
                modalTitleWrapper.classList.add("title-success");
                modalTitleWrapper.classList.remove("title-warn");
                modalTitle.innerHTML = done;
                modalIcon.src = checkB64;
                modalIcon.classList.remove("hourglass");
                modalContent.style.justifyContent = "center";
                
                // Windows Longhorn and 7 use glow effects for titles. On some browsers
                // the title for these OS'es doesn't get drawn on canvas for some reason,
                // so I render the title on a separate canvas with effects, render it to
                // PNG, add to the main canvas, and then render that to PNG and show it
                // to the end user.
                if (sys.value == "winlh-4093" || sys.value == "win7") {
                    modalContent.innerHTML = `<canvas id="final-canvas" width="${img.width}" height="${img.height}">`;
                    let finalCanvas = document.querySelector("#final-canvas");
                    let finalCtx = finalCanvas.getContext("2d");
                    finalCtx.drawImage(img, 0, 0);

                    let titleImg = new Image();
                    titleImg.src = document.querySelector("#test-canvas").toDataURL();
                    titleImg.onload = () => {
                        finalCtx.drawImage(titleImg, 0, 0);
                    }

                    setTimeout(() => {
                        let finalB64 = finalCanvas.toDataURL();

                        modalContent.innerHTML = `<img src="${finalB64}">`;
                    }, 200)
                } else {
                    modalContent.innerHTML = `<img src="${errorB64}">`;
                }
            }
        }
        setTimeout(returnError, 20)
    }, 5);
})

function closeModal() {
    generateBtn.disabled = false;
    modal.style.translate = "0 -32px";
    modal.style.opacity = 0;

    overlay.style.opacity = 0;
    overlay.style.pointerEvents = "none";
    document.querySelector("body").style.overflowY = "visible";

    setTimeout(() => {
        modalWrapper.style.display = "none";

        modalTitleWrapper.classList.remove("title-info");
        modalTitleWrapper.classList.remove("title-success");
        modalTitleWrapper.classList.remove("title-error");
        modalTitleWrapper.classList.add("title-warn");
        modalTitle.innerHTML = pleaseWait;
        modalIcon.src = "./svg/hourglass.svg";
        modalIcon.classList.add("hourglass");
        modalContent.style.justifyContent = "left";
        root.style.setProperty("--space-width", `91px`);
        modalCross.style.display = "none";

        overlay.style.display = "none";

        if (/Firefox/.test(navigator.userAgent)) modal.style.maxWidth = "inherit";
    }, 375);
}

modalCross.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
    if (e.code == "Escape" && modalCross.style.display != "none") {
        closeModal();
    }
})

let colorPickers = document.querySelectorAll(".color-prev");
for (let colorPicker of colorPickers) {
    colorPicker.addEventListener("click", (e) => {
        if (e.target.classList.contains("disabled-color-prev")) return;
        modalWrapper.style.display = "flex";
        overlay.style.display = "block";

        setTimeout(() => {
            let rgb = getComputedStyle(root).getPropertyValue(`--${e.target.id}`).replaceAll(" ", "").split(",");

            let rHex = Number(rgb[0]).toString(16).length == 1 ? `0${Number(rgb[0]).toString(16)}` : Number(rgb[0]).toString(16);
            let gHex = Number(rgb[1]).toString(16).length == 1 ? `0${Number(rgb[1]).toString(16)}` : Number(rgb[1]).toString(16);
            let bHex = Number(rgb[2]).toString(16).length == 1 ? `0${Number(rgb[2]).toString(16)}` : Number(rgb[2]).toString(16);

            modal.style.opacity = 1;
            modalContent.innerHTML = `<div class="color-input-wrapper">
<div class="color-picker-rgb-inputs">
<div class="color-picker-input-wrapper color-picker-r"><span>R</span>
<input type="number" id="${e.target.id}-r" value="${rgb[0]}">
</div>
<div class="color-picker-input-wrapper color-picker-g"><span>G</span>
<input type="number" id="${e.target.id}-g" value="${rgb[1]}">
</div>
<div class="color-picker-input-wrapper color-picker-b"><span>B</span>
<input type="number" id="${e.target.id}-b" value="${rgb[2]}">
</div>
</div>
<div class="color-picker-hex">
<span>HEX:</span>
<input type="text" id="${e.target.id}-hex" value="${rHex}${gHex}${bHex}">
</div>
<div class="color-picker-prev ${e.target.id}-hp"></div>
</div>`;
            modal.style.translate = "0 0px";

            overlay.style.pointerEvents = "auto";
            overlay.style.opacity = 1;
            document.querySelector("body").style.overflowY = "hidden";

            let rElem = document.querySelector(`#${e.target.id}-r`);
            let gElem = document.querySelector(`#${e.target.id}-g`);
            let bElem = document.querySelector(`#${e.target.id}-b`);

            let hexElem = document.querySelector(`#${e.target.id}-hex`);

            hexElem.addEventListener("input", (evt) => {
                let value = evt.target.value;
                const hexRegex = /[^0-9a-fA-F]/g;
                value = value.replace(hexRegex, "");
                evt.target.value = value;
                if (value.length == 6) {
                    let rHex = value.slice(0, 2);
                    let gHex = value.slice(2, 4);
                    let bHex = value.slice(4, 6);

                    rElem.value = parseInt(rHex, 16);
                    gElem.value = parseInt(gHex, 16);
                    bElem.value = parseInt(bHex, 16);

                    root.style.setProperty(`--${e.target.id}`, `${parseInt(rHex, 16)}, ${parseInt(gHex, 16)}, ${parseInt(bHex, 16)}`);
                } else if (value.length > 6) {
                    evt.target.value = value.slice(0, 6);
                }
            })

            for (let cElem of [rElem, gElem, bElem]) {
                cElem.addEventListener("input", (evt) => {
                    if (evt.target.value > 255) evt.target.value = 255;
                    let rHex = Number(rElem.value).toString(16).length == 1 ? `0${Number(rElem.value).toString(16)}` : Number(rElem.value).toString(16);
                    let gHex = Number(gElem.value).toString(16).length == 1 ? `0${Number(gElem.value).toString(16)}` : Number(gElem.value).toString(16);
                    let bHex = Number(bElem.value).toString(16).length == 1 ? `0${Number(bElem.value).toString(16)}` : Number(bElem.value).toString(16);
                    hexElem.value = rHex + gHex + bHex;
                    root.style.setProperty(`--${e.target.id}`, `${rElem.value ? rElem.value : "0"}, ${gElem.value ? gElem.value : "0"}, ${bElem.value ? bElem.value : "0"}`);
                })
            }
        }, 5);

        modalCross.style.display = "inline-block";
        modalTitleWrapper.classList.add("title-info");
        modalTitleWrapper.classList.remove("title-warn");
        modalTitle.innerHTML = colorPickerStr;
        modalIcon.src = "./svg/i.svg";
        modalIcon.classList.remove("hourglass");
        modalContent.style.justifyContent = "center";
    })
}