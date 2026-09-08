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

let sys = document.querySelector("#os");
let icon = document.querySelector("#icon");
let titleElem = document.querySelector("#err-title");
let contentElem = document.querySelector("#err-desc");
let btn1Elem = document.querySelector("#btn1");
let btn1DisElem = document.querySelector("#btn1-dis");
let btn2DisElem = document.querySelector("#btn2-dis");
let btn2Elem = document.querySelector("#btn2");
let btn1RecElem = document.querySelector("#btn1-rec");
let btn2RecElem = document.querySelector("#btn2-rec");
let btn3Elem = document.querySelector("#btn3");
let btn3DisElem = document.querySelector("#btn3-dis");
let btn3RecElem = document.querySelector("#btn3-rec");
let cross = document.querySelector("#cross");

function saveToLocalStorage() {
    return localStorage.setItem("bak", JSON.stringify({
        os: sys.value,
        icon: Math.trunc(Number(icon.value)),
        title: titleElem.value,
        content: contentElem.value,
        button1: {
            title: btn1Elem.value,
            disabled: btn1DisElem.checked,
            rec: btn1RecElem.checked
        },
        button2: {
            title: btn2Elem.value,
            disabled: btn2DisElem.checked,
            rec: btn2RecElem.checked
        },
        button3: {
            title: btn3Elem.value,
            disabled: btn3DisElem.checked,
            rec: btn3RecElem.checked
        },
        cross: cross.checked
    }));
}

// If any input value in the form changes (e.g. title, or button settings), the entire error info gets autosaved into localStorage
for (let inputElem of [sys, icon, titleElem, contentElem, btn1Elem, btn1DisElem, btn1RecElem, btn2Elem, btn2DisElem, btn2RecElem, btn3Elem, btn3DisElem, btn3RecElem, cross]) {
    inputElem.addEventListener("change", () => {
        saveToLocalStorage();
    });
}

// Loading the error backup
function loadBackup() {
    if (!localStorage.getItem("bak")) return;
    const backup = JSON.parse(localStorage.getItem("bak"));

    sys.value = backup.os;
    icon.value = backup.icon;
    titleElem.value = backup.title;
    contentElem.value = backup.content;

    btn1Elem.value = backup.button1.title;
    btn1DisElem.checked = backup.button1.disabled;
    btn1RecElem.checked = backup.button1.rec;

    btn2Elem.value = backup.button2.title;
    btn2DisElem.checked = backup.button2.disabled;
    btn2RecElem.checked = backup.button2.rec;

    let iconSys = backup.os;
    if (iconSys == "winvista") iconSys = "win7";
    if (iconSys == "win3") iconSys = "win31";
    let iconsCount = Object.keys(assetsArray[iconSys].assets).filter(i => i.startsWith("i-")).length;
    icon.max = iconsCount;

    const sysInfo = systems[backup.os];

    if (sysInfo.button3Allowed) {
        btn3Elem.disabled = false;
        document.querySelector("#btn3dis-label").classList.remove("disabled-label");
        btn3DisElem.disabled = false;
        document.querySelector("#btn3rec-label").classList.remove("disabled-label");
        btn3RecElem.disabled = false;

        btn3Elem.value = backup.button3.title;
        btn3DisElem.checked = backup.button3.disabled;
        btn3RecElem.checked = backup.button3.rec;
    }

    if (sysInfo.cross) {
        document.querySelector(".cross-selector label").classList.remove("disabled-label");
        cross.disabled = false;

        cross.checked = backup.cross;
    }

    if (sysInfo.recolor) {
        document.querySelector(".frame-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#frame-color").classList.remove("disabled-color-prev");
    }

    if (sysInfo.gradient) {
        let colors = {
            "win95": { p: "0,0,128", s: "0,0,128" },
            "win98": { p: "0,0,128", s: "16,132,208" },
            "win2k": { p: "10,36,106", s: "166,202,240" }
        };

        root.style.setProperty("--primary-gradient-color", colors[backup.os].p);
        root.style.setProperty("--secondary-gradient-color", colors[backup.os].s);

        document.querySelector(".primary-gradient-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#primary-gradient-color").classList.remove("disabled-color-prev");

        document.querySelector(".secondary-gradient-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#secondary-gradient-color").classList.remove("disabled-color-prev");
    }
}

let BGobj = {};
let assetsArray = {};
let fonts = {};
let systems = {};
async function load() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let savedVersion = await idbKeyval.get("version");
    let gzipRes = "";
    let iconsGzip = "";
    let fontsGzip = "";
    let sysInfoGzip = "";

    // Check if the last downloaded version matches the actual newest one.
    // If it does, start downloading an update. If it doesn't, just load
    // the cached assets and move on.
    if (savedVersion != version) {
        modalContent.innerHTML = loadingAssets;

        // Send the request to start downloading resources
        const reqResources = await fetch("/resources");
        const reader = reqResources.body.getReader();

        let receivedLength = 0;

        // This loop over here tracks how much data was downloaded, and
        // displays it as a percentage
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            receivedLength += value.length;

            // Divide the downloaded data size out by the full data size
            // (provided by the server), multiply it by 100 to make it a
            // percentage and leave only 2 decimal places
            const percentage = ((receivedLength / iconsLength) * 100).toFixed(2);
            gzipRes += new TextDecoder().decode(value);
            modalContent.innerHTML = `${loadingAssets.replace("...", "")}: ${(receivedLength / 1048576).toFixed(2)} MB / ${(iconsLength / 1048576).toFixed(2)} MB (${percentage}%)`;
        }

        iconsGzip = gzipRes.split("~")[0];
        fontsGzip = gzipRes.split("~")[1];

        sysInfoGzip = gzipRes.split("~")[2];

        await idbKeyval.set("version", version);
        await idbKeyval.set("sysInfo", sysInfoGzip);
        await idbKeyval.set("assets", iconsGzip);
        await idbKeyval.set("fonts", fontsGzip);
    } else {
        // No update available

        iconsGzip = await idbKeyval.get("assets");
        fontsGzip = await idbKeyval.get("fonts");
        sysInfoGzip = await idbKeyval.get("sysInfo");
    }

    const assetsObjGzip = iconsGzip;
    const fontsObjGzip = fontsGzip;
    modalContent.innerHTML = extractingAssets;

    // Here comes the extracting process. winerr uses Gzip compression to reduce
    // the assets size, but of course, it requires a few additional steps. In
    // this exact case, the pako library is used to un-gzip the encoded chunk.

    // Starting off with system data.
    const gzippedSysData = atob(sysInfoGzip);
    const sysDataArray = Uint8Array.from(gzippedSysData, c => c.charCodeAt(0));
    systems = JSON.parse(new TextDecoder().decode(pako.ungzip(sysDataArray)));

    // Then assets and icons.
    const gzippedAssetsData = atob(assetsObjGzip);
    const assetsDataArray = Uint8Array.from(gzippedAssetsData, c => c.charCodeAt(0));
    assetsArray = JSON.parse(new TextDecoder().decode(pako.ungzip(assetsDataArray)));

    // Lastly, fonts.
    const gzippedFontsData = atob(fontsObjGzip);
    const fontsDataArray = Uint8Array.from(gzippedFontsData, c => c.charCodeAt(0));
    fonts = JSON.parse(new TextDecoder().decode(pako.ungzip(fontsDataArray)));

    // Once the extracting process is over, the modal window gets closed.
    modal.style.translate = "0 -32px";
    modal.style.opacity = 0;

    overlay.style.opacity = 0;
    overlay.style.pointerEvents = "none";
    document.querySelector("body").style.overflowY = "visible";

    setTimeout(() => {
        modalWrapper.style.display = "none";
        overlay.style.display = "none";
    }, 375);

    loadBackup();
}

load();

let sysFontObj = {
    "win1": "Fixedsys",
    "win3": "MSSansSerif",
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

// Regex for multiple CJK fonts.
// Meiryo, the font for Japanese/Chinese on Windows Vista - 8. Also used by Yu Gothic UI on Windows 10 and 11.
const MeiryoRegex = /[\u2190-\u21EA\u2460-\u2935\u2E80-\u9FC6\uF900-\uFA6D\uFE30-\uFE46\uFF01-\uFFEE\u{1B000}\u{1B001}\u{1F100}-\u{1F251}\u{20000}-\u{2A6B2}\u{2F804}-\u{2F9F4}]/u;
// MS UI Gothic, the font for Japanese/Chinese on Windows 95 - Longhorn build 4093.
const MSUIGothicRegex = /[\u2190-\u21EA\u2460-\u2935\u3000-\u9FC6\uF91D-\uFA6D\uFE45-\uFE46\uFF01-\uFFEE\u{1F200}-\u{1F251}\u{20000}-\u{2A6B2}]/u;

// The number before the comma means how many pixels the character should be shifted to the left,
// while the number after the comma means how many pixels need to be added after the character.
const shift = {
    YuGothicUI: {
        "。": "0,3",
        "、": "0,4",
        "！": "-5,0",
        "？": "-3,0",
        "＊": "-2,1",
        "（": "-7,-7",
        "）": "0,8",
        "【": "-1,-1",
        "】": "0,1",
        "「": "-1,-1",
        "」": "0,1",
        "『": "-1,-1",
        "』": "0,1",
        "ら": "1,1",
        "・": "0,1",
        "ソ": "0,1",
        "ン": "0,1",
        "も": "0,1",
        "た": "0,1",
        "シ": "0,1",
        "わ": "0,1",
        "ぇ": "0,1",
        "ェ": "0,1",
        "う": "1,1",
        "ク": "1,0",
        "が": "1,-1",
        "コ": "-1,1",
        "レ": "-1,-1",
        "プ": "0,-1",
        "デ": "0,-1",
        "ト": "-2,2",
        "っ": "1,0",
        "よ": "1,0",
    },
    SegoeUI_9pt: {
        "1": "0,1",
        "2": "0,-1",
        "3": "0,-1",
        "4": "0,-1",
        "6": "0,-1",
        "7": "0,-1",
        "8": "0,-1",
        "9": "0,-1",
        " ": "0,2",
        "j": "2,0",
        "k": "0,-1",
        "K": "0,-1",
        "r": "0,-1",
        "e": "0,-1",
        "\"": "0,-1",
        "#": "0,-1",
        "+": "0,1",
        ",": "0,1",
        "<": "0,2",
        "=": "0,1",
        ">": "0,1",
        "?": "0,-1",
        "M": "0,1",
        "C": "0,-1",
        "Q": "0,-1",
        "R": "0,-1",
        "T": "1,-1",
        "V": "0,-1",
        "W": "0,-1",
        "[": "0,-1",
        "]": "0,1",
        "f": "0,-1",
        "m": "0,1",
        "t": "0,-1",
        "z": "0,-1",
        "y": "1,0",
        "x": "0,-1",
        " ": "0,2",
        "£": "0,-1",
        "¤": "0,-1",
        "Г": "0,-1",
        "г": "0,-1",
        "Д": "0,-1",
        "Ё": "0,-1",
        "К": "0,-2",
        "М": "0,1",
        "Н": "0,1",
        "П": "0,1",
        "Т": "0,-1",
        "Щ": "0,-1",
        "У": "0,-1",
        "Ъ": "0,-1",
        "Э": "0,-1",
        "д": "1,-1",
        "е": "0,-1",
        "ё": "0,-2",
        "ж": "0,-1",
        "и": "0,-1",
        "л": "1,0",
        "з": "0,-1",
        "к": "0,-1",
        "у": "1,-1",
        "т": "1,-1",
        "с": "0,-1",
        "ц": "0,-1",
        "х": "0,-1",
        "ш": "0,1",
        "ю": "0,-1",
        "я": "0,-1"
    },
    EMOJI_8: {},
    EMOJI_10: {},
    EMOJI_11: {},
    Meiryo: {
        "「": "-7,-1",
        "」": "0,6",
        "『": "-7,-1",
        "』": "0,6",
        "【": "-8,-1",
        "】": "0,7",
        "（": "-7,-1",
        "）": "0,7",
        "？": "-3,4",
        "！": "-5,5",
        "。": "-1,7"
    },
    MSGothic: {},
    MSUIGothic: {
        "「": "-1,0",
        "」": "0,1",
        "【": "-1,0",
        "】": "0,1"
    },
    Tahoma: {
        "※": "-2,2"
    },
    MSSansSerif: {}
}

// Calculate the width of a string of text in pixels
function testBitmaps(content, isBold = false, isLarge = false, vgasysr = false) {
    let fontface = sysFontObj[sys.value];

    if (isLarge) fontface = "SegoeUI_11pt";
    if (vgasysr) fontface = "vgasysr"
    if (sys.value == "winxp" && isBold) fontface = "TrebuchetMS";

    const initFontface = fontface;

    let chars = _.split(content, "");
    if (chars[chars.length - 1] == "") chars.pop();
    let charsWidth = 0;

    // Windows 1.0 uses Fixedsys, which is a monospaced font. It essentially
    // means that every character has the same width. So we can safely multiply
    // the content's length by 8 (the width of a character in Fixedsys).
    if (sys.value == "win1") return chars.length * 8;
    let charsInfo = fonts[fontface][isBold ? "bold" : "regular"].info;
    for (const char of chars) {
        if (["win31", "win3"].includes(sys.value) && MSUIGothicRegex.test(char)) {
            fontface = "MSGothic";
            charsInfo = fonts.MSGothic.regular.info;
        } else if (["win95", "win98", "win2k", "winwh", "winxp", "winlh-4093"].includes(sys.value) && MSUIGothicRegex.test(char)) {
            fontface = "MSUIGothic";
            charsInfo = fonts.MSUIGothic[isBold ? "bold" : "regular"].info;
        } else if (["winvista", "win7", "win8", "win10", "win11"].includes(sys.value)) {
            if (MeiryoRegex.test(char)) {
                if (["winvista", "win7", "win8"].includes(sys.value)) {
                    fontface = "Meiryo";
                } else {
                    fontface = "YuGothicUI";
                }
                charsInfo = fonts[fontface][isBold ? "bold" : "regular"].info;
            }
        }

        if (!charsInfo[char.charCodeAt(0)]) {
            fontface = initFontface;
            charsInfo = fonts[fontface].regular.info;
        }

        let charWidth = emojiRegex().exec(char) ? 14 : charsInfo[char.charCodeAt(0)].w;

        // Slight font offsets
        let addPx = 1;
        if (["SegoeUI_11pt", "MSGothic", "EMOJI_10", "EMOJI_11"].includes(fontface)) addPx = 2;
        if (["SegoeUI_9pt", "YuGothicUI", "Meiryo"].includes(fontface)) addPx = 0;

        charsWidth += charWidth + addPx;
        if (shift[fontface]) {
            charsWidth -= shift[fontface][char] ? Number(shift[fontface][char].split(",")[0]) : 0;
            charsWidth += shift[fontface][char] ? Number(shift[fontface][char].split(",")[1]) : 0;
        }

        if (MeiryoRegex.test(char) && charsInfo[char.charCodeAt(0)] && ["win10", "win11"].includes(sys.value)) charsWidth += charsInfo[char.charCodeAt(0)].o;
    }
    return charsWidth;
}

// The following code is triggered every time the OS value is changed
sys.addEventListener("change", async (e) => {
    const sysname = e.target.value;
    let sysInfo = systems[sysname];

    // Windows Vista/7 (Basic) (codename "winvista") has the same icons as Windows
    // Vista/7 (Aero) (codename "win7"). Windows 3.0 (codename "win3") shares icons
    // with 3.1 (codename "win31").
    let iconSys = sysname;
    if (iconSys == "winvista") iconSys = "win7";
    if (iconSys == "win3") iconSys = "win31";
    let iconsCount = Object.keys(assetsArray[iconSys].assets).filter(i => i.startsWith("i-")).length;
    icon.max = iconsCount;

    // If adding the third button is allowed (every OS except for Windows 1.0),
    // enable the input fields for Button 3. If not, do the opposite.
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

    // If disabling the cross (X) button is allowed (every OS except for Windows
    // 1.0 and 3.1), enable the checkbox. If not, do the opposite.
    if (sysInfo.cross) {
        document.querySelector(".cross-selector label").classList.remove("disabled-label");
        cross.disabled = false;
    } else {
        document.querySelector(".cross-selector label").classList.add("disabled-label");
        cross.disabled = true;
    }

    // If recoloring the window frame is allowed (only in Windows 1.0 and 8/8.1), enable
    // the color wrapper. If not, do the opposite.
    if (sysInfo.recolor) {
        // Default colors in each of the abovementioned OS'es (encoded in RGB)
        let colors = {
            "win1": "87,87,255",
            "win8": "240,200,105"
        };

        // Setting the default color
        root.style.setProperty("--frame-color", colors[sysname]);

        document.querySelector(".frame-color-wrapper").classList.remove("disabled-color");
        document.querySelector("#frame-color").classList.remove("disabled-color-prev");
    } else {
        document.querySelector(".frame-color-wrapper").classList.add("disabled-color");
        document.querySelector("#frame-color").classList.add("disabled-color-prev");
    }

    // If recoloring the gradient is allowed (only in Windows 95, 98 and 2000), enable
    // the color wrappers. If not, do the opposite.
    if (sysInfo.gradient) {
        // Default colors in each of the abovementioned OS'es (encoded in RGB)
        let colors = {
            "win95": { p: "0,0,128", s: "0,0,128" },
            "win98": { p: "0,0,128", s: "16,132,208" },
            "win2k": { p: "10,36,106", s: "166,202,240" }
        };

        // Setting the default colors
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

// Windows error messages can't have more than one recommended button,
// so we have to disable the "recommended" checkbox on other buttons.
// Furthermore, the recommended button can't be marked as disabled at
// the same time.

// Doing this process for Button 1
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

// Doing this process for Button 2
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

// Doing this process for Button 3
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

// Once the "Generate!" button is hit, this code executes
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

        let totalTime;
        try {
            let eStart = performance.now();
            await createError(sys.value,
                titleElem.value,
                contentElem.value,
                Math.trunc(Number(icon.value)),
                {
                    name: btn1Elem.value,
                    disabled: btn1DisElem.checked,
                    rec: btn1RecElem.checked
                }, {
                name: btn2Elem.value,
                disabled: btn2DisElem.checked,
                rec: btn2RecElem.checked
            }, {
                name: btn3Elem.value,
                disabled: btn3DisElem.checked,
                rec: btn3RecElem.checked
            }, cross.checked,
                `rgb(${getComputedStyle(root).getPropertyValue("--frame-color")})`,
                `rgb(${getComputedStyle(root).getPropertyValue("--primary-gradient-color")})`,
                `rgb(${getComputedStyle(root).getPropertyValue("--secondary-gradient-color")})`);

            let eFinish = performance.now();
            totalTime = (eFinish - eStart).toFixed(1);
            console.log(totalTime)
        } catch (e) {
            // In case any error happens
            console.error(e);
            modalCross.style.display = "inline-block";
            modalTitleWrapper.classList.add("title-error");
            modalTitleWrapper.classList.remove("title-warn");
            modalTitle.innerHTML = `Error!`;
            modalContent.style.alignItems = "center";
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
                modalTitleWrapper.classList.add("title-success");
                modalTitleWrapper.classList.remove("title-warn");
                modalTitle.innerHTML = done;
                modalIcon.src = checkB64;
                modalIcon.classList.remove("hourglass");
                modalContent.style.alignItems = "center";

                // Windows Longhorn uses glow effects for titles. On some browsers
                // the title for this OS doesn't get drawn on canvas for some reason,
                // so I render the title on a separate canvas with effects, render it as
                // PNG, add to the main canvas, and then render that as PNG and show it
                // to the end user.
                if (sys.value == "winlh-4093") {
                    modalContent.innerHTML = `<canvas id="final-canvas" width="${img.width}" height="${img.height}"></canvas><small style="opacity:.5">${tookTime.replace("{{ms}}", totalTime)}</small>`;
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

                        modalContent.innerHTML = `<img src="${finalB64}"><small style="opacity:.5">${tookTime.replace("{{ms}}", totalTime)}</small>`;
                    }, 200)
                } else {
                    modalContent.innerHTML = `<img src="${errorB64}"><small style="opacity:.5">${tookTime.replace("{{ms}}", totalTime)}</small>`;
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
        modalContent.style.alignItems = "left";
        modalCross.style.display = "none";

        overlay.style.display = "none";
    }, 375);
}

// Allowing to close the modal window (the one that contains
// the generated error) by simply clicking the cross button.
modalCross.addEventListener("click", closeModal);

// This event listener allows to close the modal window by
// hitting the Esc key.
document.addEventListener("keydown", (e) => {

    // We have to make sure that the modal window is allowed
    // to be closed (because there are some cases where it's
    // not, such as downloading assets).
    const nullishModalCross = ["", "none"].includes(modalCross.style.display) ? true : false;
    if (e.code == "Escape" && !nullishModalCross) {
        closeModal();
    }
})

// Color picker handlers (frame, primary gradient and secondary gradient colors)
let colorPickers = document.querySelectorAll(".color-prev");
for (let colorPicker of colorPickers) {
    colorPicker.addEventListener("click", (e) => {
        // If the color picker is disabled, we don't want it to do anything when clicking
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

            // Parsing HEX
            hexElem.addEventListener("input", (evt) => {
                let value = evt.target.value;

                // If any of the characters don't match this regex (i.e.
                // can't be used for writing HEX color code), remove those.
                const hexRegex = /[^0-9a-fA-F]/g;
                value = value.replace(hexRegex, "");
                evt.target.value = value;

                // Converting HEX to RGB
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

            // Converting RGB to HEX
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
        modalContent.style.alignItems = "center";
    })
}
