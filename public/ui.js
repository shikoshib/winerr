let sys = document.querySelector("#os");
let generate = document.querySelector(".generate");
let favicon = document.querySelector("link[rel~='icon']");

let btn1Rec = document.querySelector("#btn1-rec");
let btn2Rec = document.querySelector("#btn2-rec");
let btn3Rec = document.querySelector("#btn3-rec");
let btn1Dis = document.querySelector("#btn1-dis");
let btn2Dis = document.querySelector("#btn2-dis");
let btn3Dis = document.querySelector("#btn3-dis");
let dl = document.querySelector(".dl");

// basically the windows error message cannot have 2 or more recommended buttons
// also a button cannot be disabled and recommended at the same time
btn1Rec.addEventListener("input", e => {
    if (e.target.checked) {
        btn2Rec.checked = false;
        btn2Rec.disabled = true;
        btn1Dis.checked = false;
        btn1Dis.disabled = true;
        if (!document.querySelector("#btn3").disabled) {
            btn3Rec.checked = false;
            btn3Rec.disabled = true;
        }
    } else {
        btn2Rec.disabled = false;
        btn1Dis.disabled = false;
        if (!document.querySelector("#btn3").disabled) {
            btn3Rec.checked = false;
            btn3Rec.disabled = false;
        }
    }
});

btn2Rec.addEventListener("input", e => {
    if (e.target.checked) {
        btn1Rec.checked = false;
        btn1Rec.disabled = true;
        btn2Dis.checked = false;
        btn2Dis.disabled = true;
        if (!document.querySelector("#btn3").disabled) {
            btn3Rec.checked = false;
            btn3Rec.disabled = true;
        }
    } else {
        btn1Rec.disabled = false;
        btn2Dis.disabled = false;
        if (!document.querySelector("#btn3").disabled) {
            btn3Rec.checked = false;
            btn3Rec.disabled = false;
        }
    }
});

btn3Rec.addEventListener("input", e => {
    if (e.target.checked) {
        btn1Rec.checked = false;
        btn1Rec.disabled = true;
        btn2Rec.checked = false;
        btn2Rec.disabled = true;
        btn3Dis.checked = false;
        btn3Dis.disabled = true;
    } else {
        btn1Rec.disabled = false;
        btn2Rec.disabled = false;
        btn3Dis.disabled = false;
    }
});

// loading the features the generator can or can't provide for the os
// e.g. frame recoloring for windows 8 or inability to add button 3 for windows 1.0
function getSysInfo(sys) {
    document.querySelector("#icon").max = sys.icons;
    let btn1 = document.querySelector("#btn1").value;
    let btn2 = document.querySelector("#btn2").value;
    let btn3 = document.querySelector(".btn3");
    let cross = document.querySelector("#cross");
    let frameColor = document.querySelector("#frame-color");
    let gradients = document.querySelector("#gradient-primary");

    if (sys.button3Allowed) {
        document.querySelector("#btn1").value = btn1;
        document.querySelector("#btn2").value = btn2;
        btn3.style.cursor = "default";
        btn3Dis.disabled = false;
        btn3Rec.disabled = false;
        document.querySelector("#btn3").disabled = false;
        document.querySelectorAll(".btn3 label").forEach(e => {
            e.style.cursor = "default", e.classList.remove("disabled-label");
        })
    } else {
        btn3.style.cursor = "not-allowed";
        btn3Dis.disabled = true;
        btn3Rec.disabled = true;
        document.querySelector("#btn3").value = "";
        document.querySelector("#btn3").disabled = true;
        document.querySelectorAll(".btn3 label").forEach(e => {
            e.style.cursor = "not-allowed";
            e.classList.add("disabled-label");
        })
    }

    if (sys.cross && !cross) {
        document.querySelector(".cross-wrapper").innerHTML += `<input type="checkbox" id="cross"><label for="cross">${translatedKeys["x-dis"]}</label><br>`;
    } else if (!sys.cross && cross) {
        document.querySelector(".cross-wrapper").innerHTML = "";
    }

    let colors = {
        "win95": { p: "#000080", s: "#000080" },
        "winmem": { p: "#000080", s: "#000000" },
        "win98": { p: "#000080", s: "#1084d0" },
        "win2k": { p: "#0a246a", s: "#a6caf0" }
    }

    if (sys.recolor && !frameColor) {
        document.querySelector(".color").innerHTML = `<label for="frame-color">${translatedKeys["frame-color"]}:</label><input type="color" id="frame-color" value="#f0c869">`;
        document.querySelector(".clr").innerHTML += "<br>";
    } else if (!sys.recolor && frameColor) {
        document.querySelector(".color").innerHTML = "";
        document.querySelector(".clr").innerHTML = document.querySelector(".clr").innerHTML.replace("<br>", "");
    }

    if (sys.gradient && !gradients) {
        document.querySelector(".gradient-selectors").innerHTML = `<label for="gradient-primary" id="go-up">${translatedKeys["gradient-primary"]}:</label><input type="color" id="gradient-primary" value="${colors[sys.name].p}"><br><br><label for="gradient-sec" id="go-up">${translatedKeys["gradient-sec"]}:</label><input type="color" id="gradient-sec" value="${colors[sys.name].s}">`;
        document.querySelector(".gradient-selectors").innerHTML += "<br><br>";
    } else if (!sys.gradient && gradients) {
        document.querySelector(".gradient-selectors").innerHTML = "";
    }

    let sysName = sys.name;
    if (["win95", "winmem", "win98", "win2k"].includes(sysName)) sysName = "win9x";
    if (sysName == "win10") {
        sysName = "win8";
    }
    if (sysName == "winvista") {
        sysName = "win7";
    }
    favicon.href = `/${sysName}.png`
}

// when you load the page, windows 1.0 is set by default
async function getDefInfo() {
    let e = await fetch("/info?sys=win1");
    getSysInfo(await e.json());
}
getDefInfo();

// once you select the os, the settings are getting tweaked a bit with the getSysInfo() function
sys.addEventListener("change", async (e) => {
    let req = await fetch("/info?sys=" + e.target.value);
    let info = await req.json();
    if (info != -1) {
        getSysInfo(info);
    }
});

// There we go. The code that does the thing
async function generateHandler() {
    dl.style.display = "none";
    let e = document.querySelector(".error-txt");

    generate.disabled = true;
    generate.innerHTML = translatedKeys["loading"];

    let title = document.querySelector("#err-title").value;
    let content = document.querySelector("#err-desc").value;
    let icon = document.querySelector("#icon").value;
    let btn1 = document.querySelector("#btn1").value;
    let btn1Dis = document.querySelector("#btn1-dis").checked;
    let btn2 = document.querySelector("#btn2").value;
    let btn2Dis = document.querySelector("#btn2-dis").checked;
    let btn3 = document.querySelector("#btn3").value;
    let btn3Dis = document.querySelector("#btn3-dis").checked;
    let cross = document.querySelector("#cross");
    if (cross) cross = cross.checked;
    let frameColor = document.querySelector("#frame-color");
    if (frameColor) frameColor = frameColor.value;

    let gradientPrimaryColor = document.querySelector("#gradient-primary");
    if (gradientPrimaryColor) gradientPrimaryColor = gradientPrimaryColor.value;
    let gradientSecondaryColor = document.querySelector("#gradient-sec");
    if (gradientSecondaryColor) gradientSecondaryColor = gradientSecondaryColor.value;

    let system = sys.value;

    let fixBtns = ["win7", "win8", "win10", "win11"];
    let bt1 = fixBtns.includes(system) ? { name: btn3, disabled: btn3Dis, rec: btn3Rec.checked } : { name: btn1, disabled: btn1Dis, rec: btn1Rec.checked };
    let bt3 = fixBtns.includes(system) ? { name: btn1, disabled: btn1Dis, rec: btn1Rec.checked } : { name: btn3, disabled: btn3Dis, rec: btn3Rec.checked };

    // if a user is offline, throw an error
    // because the icon for the error is being loaded from the server
    if (!navigator.onLine) {
        generate.disabled = false;
        generate.innerHTML = translatedKeys["btn-generate"];
        return e.innerHTML = translatedKeys["check-internet-connection"];
    }
    e.innerHTML = "";

    // Mozilla Firefox bugfix
    // For some bizarre reason, if you use Firefox, some assets would just be missing
    // To prevent that, the error message is generated on the server (but only if you use Firefox)
    if (/Firefox/.test(navigator.userAgent)) {
        if (gradientPrimaryColor) gradientPrimaryColor = gradientPrimaryColor.replace("#", "");
        if (gradientSecondaryColor) gradientSecondaryColor = gradientSecondaryColor.replace("#", "");
        await fetch(`https://shikoshib.ru/api/winerr/?os=${system}&title=${title}&content=${content}&icon=${icon}&button1=${btn1}&button1disabled=${btn1Dis}&button1rec=${btn1Rec.checked}&button2=${btn2}&button2disabled=${btn2Dis}&button2rec=${btn2Rec.checked}&button3=${btn3}&button3disabled=${btn3Dis}&button3rec=${btn3Rec.checked}&crossDisabled=${cross ? cross : false}&fc=${frameColor ? frameColor.replace("#", "") : "f0c869"}&gpc=${gradientPrimaryColor}&gsc=${gradientSecondaryColor}&base64=true`).then(async (req) => {
            let base64 = await req.text();

            let img = new Image();
            img.src = base64;
            img.onload = () => {
                let canvas = document.getElementById('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");

                ctx.antialias = 'none';
                ctx.quality = 'best';

                ctx.drawImage(img, 0, 0);
            }

            async function setDl() {
                document.querySelector(".dl").href = base64, dl.style.display = "inline"
            };
            setTimeout(setDl, 100);
        })
        generate.disabled = false;
        generate.innerHTML = translatedKeys["btn-generate"];
        return;
    }

    await createError(system, title, content, icon, bt1, {
        name: btn2,
        disabled: btn2Dis,
        rec: btn2Rec.checked
    }, bt3, cross, frameColor, gradientPrimaryColor, gradientSecondaryColor)
        .catch(t => {
            e.innerHTML = `${t}<br><br>`;
            console.error(t);
            generate.disabled = false;
            generate.innerHTML = translatedKeys["btn-generate"];
        })
        .then(() => {
            generate.disabled = false;
            generate.innerHTML = translatedKeys["btn-generate"];
        });
}

generate.addEventListener("click", generateHandler);
document.onkeydown = async (e) => {
    // did you know that you can simply hit "enter" to generate the error?
    if (["Enter", "NumpadEnter"].includes(e.code)) {
        await generateHandler();
    }
};

// adding a download button
dl.addEventListener("click", () => {
    let url = dl.href;
    let a = document.createElement('a');
    a.download = 'err.png';
    a.href = url;
    // sometimes when you download the error message on mobile, it fails for literally no reason
    // so to prevent that, a new tab is being opened, so that you can hold the image and download it successfully
    a.click();
})
