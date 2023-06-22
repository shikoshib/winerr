const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    return res.status(200).sendFile(__dirname + "/generator.html")
})

app.get("/info", (req, res) => {
    let sys = req.query.sys;
    if (sys == "winmem") sys = "win95";
    let obj = {};
    let icons;
    try {
        icons = fs.readFileSync(`./public/assets/${sys}/icons.json`);
        icons = JSON.parse(icons)
        obj.icons = icons.length;
    } catch (e) {
        return res.status(403).send("-1")
    }
    let button3Allowed = sys == "win1" ? false : true;
    obj.button3Allowed = button3Allowed;
    obj.name = req.query.sys;
    let cross = sys == "win1" || sys == "win31" ? false : true;
    let recolor = sys == "win8" ? true : false;
    obj.cross = cross;
    obj.recolor = recolor;
    return res.json(obj)
})

app.get("/icons", (req, res) => {
    let systems = ["win1", "win31", "win95", "win98", "win2k", "winwh", "winxp", "winlh-4093", "win7", "win8", "win10", "win11"];
    let arr = [];
    for (let system of systems) {
        let icons = fs.readFileSync(`./public/assets/${system}/icons.json`, `utf-8`);
        icons = JSON.parse(icons)
        arr.push({ name: system, icons: icons })
    }
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Icons | Windows Error Message Generator</title><link rel="stylesheet" href="../style.css"></head><body><div class="os-wrapper">`;
    arr.forEach(s => {
        let obj = {
            "win1": "Windows 1.0",
            "win31": "Windows 3.1",
            "win95": "Windows 95/Memphis",
            "win98": "Windows 98",
            "win2k": "Windows 2000",
            "winwh": "Windows Whistler build 2419",
            "winxp": "Windows XP",
            "winlh-4093": "Windows Longhorn build 4093",
            "win7": "Windows 7",
            "win8": "Windows 8",
            "win10": "Windows 10 build 20H2",
            "win11": "Windows 11"
        }
        html += `<div class="os"><h1>${obj[s.name]}</h1><div class="icons-list">`
        s.icons.forEach(i => {
            html += `<div class="icon-card-wrapper"><span class="icon-id">${i.iconID}.</span><br><div class="icon-card"><span class="img"><img src="${i.data}"></span></div></div>`
        })
        html += `</div></div>`
    })
    html += `</div></body></html>`
    return res.send(html)
})

app.get("/assets", (req, res) => {
    let dir = fs.readdirSync("./public/assets/");
    let obj = {};
    for (let elem of dir) {
        if (fs.lstatSync(`./public/assets/${elem}`).isDirectory() && elem.startsWith("win")) {
            if (elem == "win98") continue;
            let sysDir = fs.readdirSync(`./public/assets/${elem}`);
            let sysObj = {};
            for (let file of sysDir) {
                if (file.endsWith(".json") && file.includes("assets")) {
                    file = file.split(".")[0];
                    sysObj[file] = JSON.parse(fs.readFileSync(`./public/assets/${elem}/${file}.json`).toString());
                }
            }
            obj[elem] = sysObj;
        }
    }
    return res.json(obj);
})

app.get("/icon", (req, res) => {
    let { sys, id } = req.query;
    id = Number(id);
    if (sys == "winmem") sys = "win95";
    try {
        let iconSheet = require(`./public/assets/${sys}/icons.json`);
        if (id < 1) id = 1;
        if (id > iconSheet.length) id = iconSheet.length;
        return res.send(iconSheet.filter(i => i.iconID == id)[0].data);
    } catch (e) {
        return res.status(403).send("-1")
    }
})

app.get("/fonts", (req, res) => {
    let dir = fs.readdirSync("./public/assets/fonts/");
    let obj = {};
    for (let font of dir) {
        if (!fs.lstatSync(`./public/assets/fonts/${font}`).isDirectory()) continue;
        let fontObj = {};
        let fontDir = fs.readdirSync(`./public/assets/fonts/${font}`);
        for (let type of fontDir) {
            let typeObj = {};
            let fontTypeDir = fs.readdirSync(`./public/assets/fonts/${font}/${type}`);
            for (let file of fontTypeDir) {
                let filename = file.split(".")[0];
                if (!file.endsWith(".json")) continue;
                let fileData = JSON.parse(fs.readFileSync(`./public/assets/fonts/${font}/${type}/${file}`).toString());
                typeObj[filename] = fileData;
            }
            fontObj[type] = typeObj;
        }
        obj[font] = fontObj;
    }
    return res.json(obj);
})

app.use((req, res) => {
    res.status(404).send('404 Not Found');
})

app.listen(3004);