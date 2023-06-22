let sys = document.querySelector("#os");
let generate = document.querySelector(".generate");
let favicon = document.querySelector("link[rel~='icon']");

let btn1Rec = document.querySelector("#btn1-rec");
let btn2Rec = document.querySelector("#btn2-rec");
let btn3Rec = document.querySelector("#btn3-rec");

let btn1Dis = document.querySelector("#btn1-dis");
let btn2Dis = document.querySelector("#btn2-dis");
let btn3Dis = document.querySelector("#btn3-dis");

btn1Rec.addEventListener("input", e => {
    if (e.target.checked) {
        btn2Rec.checked = false;
        btn2Rec.disabled = true;
        btn1Dis.checked = false;
        btn1Dis.disabled = true;
        if (!document.querySelector("#btn3").disabled) { btn3Rec.checked = false; btn3Rec.disabled = true; }
    } else {
        btn2Rec.disabled = false;
        btn1Dis.disabled = false;
        if (!document.querySelector("#btn3").disabled) { btn3Rec.checked = false; btn3Rec.disabled = false; }
    }
})

btn2Rec.addEventListener("input", e => {
    if (e.target.checked) {
        btn1Rec.checked = false;
        btn1Rec.disabled = true;
        btn2Dis.checked = false;
        btn2Dis.disabled = true;
        if (!document.querySelector("#btn3").disabled) { btn3Rec.checked = false; btn3Rec.disabled = true; }
    } else {
        btn1Rec.disabled = false;
        btn2Dis.disabled = false;
        if (!document.querySelector("#btn3").disabled) { btn3Rec.checked = false; btn3Rec.disabled = false; }
    }
})

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
})

function getSysInfo(sys) {
    document.querySelector("#icon").max = sys.icons;

    let btn1Val = document.querySelector("#btn1").value;
    let btn2Val = document.querySelector("#btn2").value;

    let btn3Elem = document.querySelector(".btn3");
    let cross = document.querySelector("#cross");

    let color = document.querySelector("#frame-color");

    if (sys.button3Allowed) {
        document.querySelector("#btn1").value = btn1Val;
        document.querySelector("#btn2").value = btn2Val;

        btn3Elem.style.cursor = "default";
        btn3Dis.disabled = false;
        btn3Rec.disabled = false;
        document.querySelector("#btn3").disabled = false;
        document.querySelectorAll(".btn3 label").forEach(l => { l.style.cursor = "default"; l.classList.remove("disabled-label") })
    }

    if (!sys.button3Allowed) {
        btn3Elem.style.cursor = "not-allowed";
        btn3Dis.disabled = true;
        btn3Rec.disabled = true;
        document.querySelector("#btn3").value = "";
        document.querySelector("#btn3").disabled = true;
        document.querySelectorAll(".btn3 label").forEach(l => { l.style.cursor = "not-allowed"; l.classList.add("disabled-label") })
    }

    if (sys.cross && !cross) {
        document.querySelector(".cross-wrapper").innerHTML += `<input type="checkbox" id="cross"><label for="cross">Disable the X button</label><br>`;
    }

    if (!sys.cross && cross) {
        document.querySelector(".cross-wrapper").innerHTML = "";
    }

    if (sys.recolor && !color) {
        document.querySelector(".color").innerHTML += `<label for="frame-color">Frame color:</label><input type="color" id="frame-color" value="#f0c869">`
        document.querySelector(".clr").innerHTML += `<br>`
    }

    if (!sys.recolor && color) {
        document.querySelector(".color").innerHTML = "";
        document.querySelector(".clr").innerHTML = document.querySelector(".clr").innerHTML.replace("<br>", "");
    }

    let favName = sys.name;
    if (["win95", "winmem", "win98", "win2k"].includes(favName)) favName = "win9x";
    if (favName == "win10") favName = "win8";
    favicon.href = `/${favName}.png`;
}

async function getDefInfo() {
    let getDefaultInfo = await fetch("/info?sys=win1");
    let info = await getDefaultInfo.json();
    getSysInfo(info);
}
getDefInfo();

sys.addEventListener("change", async (evt) => {
    let getInfo = await fetch("/info?sys=" + evt.target.value)
    let info = await getInfo.json();
    if (info == -1) return;
    getSysInfo(info)
})

async function generateHandler() {
    dl.style.display = "none";
    let errorText = document.querySelector(".error-txt");

    generate.disabled = true;
    generate.innerHTML = "Loading...";

    let title = document.querySelector("#err-title").value;
    content = document.querySelector("#err-desc").value;
    icon = document.querySelector("#icon").value;
    btn1 = document.querySelector("#btn1").value;
    btn1Disabled = document.querySelector("#btn1-dis").checked;
    btn2 = document.querySelector("#btn2").value;
    btn2Disabled = document.querySelector("#btn2-dis").checked;
    btn3 = document.querySelector("#btn3").value;
    btn3Disabled = document.querySelector("#btn3-dis").checked;
    let cross = document.querySelector("#cross");
    if (cross) cross = cross.checked;
    let color = document.querySelector("#frame-color");
    if (color) color = color.value;
    let system = sys.value;

    if (!navigator.onLine) {
        generate.disabled = false;
        generate.innerHTML = "Generate!";
        return errorWrapper.innerHTML = `Check your Internet connection.`;
    }

    errorText.innerHTML = "";

    await createError(system, title, content, icon, { name: btn1, disabled: btn1Disabled, rec: btn1Rec.checked }, { name: btn2, disabled: btn2Disabled, rec: btn2Rec.checked }, { name: btn3, disabled: btn3Disabled, rec: btn3Rec.checked }, cross, color).catch(e => {
        errorText.innerHTML = e;
        generate.disabled = false;
        generate.innerHTML = "Generate!"
    })

    generate.disabled = false;
    generate.innerHTML = "Generate!";
}

generate.addEventListener("click", generateHandler);
document.onkeydown = (async e => {
    if (["Enter", "NumpadEnter"].includes(e.code)) await generateHandler();
});

dl.addEventListener("click", () => {
    let url = dl.href;
    let a = document.createElement('a');
    a.download = 'err.png';
    a.href = url;
    a.click();
})