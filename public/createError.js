async function createError(system, title, content, iconID, button1, button2, button3, crossDisabled, color, gradientPrimaryColor, gradientSecondaryColor) {
    if (!iconID || iconID < 1) iconID = 1;
    if (iconID > Number(icon.max)) iconID = Number(icon.max);
    if (!button2 || !button2.name) button2 = null;
    if (!button3 || !button3.name) button3 = null;

    let canvas;

    let sysName = system;
    if (system == "win98") sysName = "win95";
    let assets = assetsArray[sysName].assets;

    let iconInfo = assetsArray[sysName == "winvista" ? "win7" : sysName].assets[`i-${iconID}`];

    async function loadImageCallback(img, src) {
        img.src = `data:image/png;base64,${src}`;
        img.onload = () => {
            return;
        };
    };

    let assetsSS = new Image();
    await loadImageCallback(assetsSS, assetsArray[sysName].src);

    let iconSS;
    if (system == "win98") {
        iconSS = new Image();
        await loadImageCallback(iconSS, assetsArray["win98"].src);
        iconInfo = assetsArray["win98"].assets[`i-${iconID}`];
    }

    async function loadImage(ctx, i, x, y, w, h, a) {
        let img = new Image();
        img.src = i.startsWith("iVB") ? `data:image/png;base64,${i}` : i;
        img.onload = () => {
            if (!w) w = img.width;
            if (!h) h = img.height;
            ctx.save();
            ctx.globalAlpha = !a ? 1 : a;
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
        }
    }

    let osToFixBtns = ["winvista", "win7", "win8", "win10", "win11"];
    if (osToFixBtns.includes(system)) {
        let btn1 = button1;
        if (button3) {
            button1 = button3;
            button3 = btn1;
        } else if (button2 && !button3) {
            button1 = button2;
            button2 = btn1;
        }
    }


    if (button2) {
        if (!button1.name && button2.name) {
            button1 = button2;
            button2 = null;
        }
    }
    if (button3 && button2) {
        if (!button1.name && button2.name && button3.name) {
            button1 = button2;
            button2 = button3;
            button3 = null;
        }
    }
    if (button3 && !button2) {
        if (button1.name && button3.name) {
            button2 = button3;
            button3 = null;
        }
        if (!button1.name && button3.name) {
            button1 = button3;
            button2 = null;
            button3 = null;
        }
    }


    async function win1() {
        if (button2) {
            if (!button1.name && button2.name) {
                button1 = button2;
                button2 = null;
            }
        }

        let symbolCodes = fonts["Fixedsys"]["bold"]["black"];
        title = title.replaceAll(" ", " ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "?");
        })

        content = content.replaceAll(" ", " ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) content = content.replaceAll(char, "?");
        })

        let whiteText = false;

        let testY = 47;
        const lineHeight = 16;

        let FixedsysBlack = new Image();
        await loadImageCallback(FixedsysBlack, fonts["Fixedsys"]["bold"]["black"].src);

        let FixedsysWhite = new Image();
        await loadImageCallback(FixedsysWhite, fonts["Fixedsys"]["bold"]["white"].src);

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let textColor = whiteText ? "white" : "black";
            let spriteSheet = whiteText ? FixedsysWhite : FixedsysBlack;
            let symbolsData = fonts["Fixedsys"]["bold"][textColor].info;
            for (const char of chars) {
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += 8;
            }
        }

        const maxWidth = 400;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 40;
        if (longestLineW >= 66 && (longestLineW + 78) <= 480) canvasWidth = longestLineW + 78;
        if (longestLineW >= 400) canvasWidth = 480;
        if (lines.length <= 1 && button1.name) canvasHeight = canvasHeight + 8;
        if (lines.length > 1 && button1.name) canvasHeight = testY + 44;
        if (lines.length >= 0 && !button1.name) canvasHeight = testY + 15;

        if (button1) {
            function getBtnsWidth() {
                let btn1Width = 24 + testBitmaps(button1.name);
                if (!button2) return btn1Width;

                let btn2Width = 24 + testBitmaps(button2.name);
                return btn1Width + btn2Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 32 < btnsWidth) {
                canvasWidth = btnsWidth + 32;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 2, canvas.width, canvas.height);

        let x = 60;
        let y = 47;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y - 13);
            y += lineHeight;
        }

        ctx.fillStyle = "#5757ff";
        ctx.fillRect(2, 2, canvas.width, 14);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 16, canvas.width, 2);

        let titleWidth = testBitmaps(title);
        if (titleWidth + 34 >= canvas.width) {
            let splittingChar = Math.round((canvas.width - 34) / 8);
            title = `${title.slice(0, splittingChar)}…`
        }

        titleWidth = testBitmaps(title);

        let blackSquare = Math.round(canvasWidth * .365);
        if (title) blackSquare = titleWidth + 16;
        let squareX = Math.round((canvas.width - 4 - blackSquare) / 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(squareX + 2, 2, blackSquare, 16);

        whiteText = true;
        await drawBitmaps(ctx, title, Math.round((canvas.width - titleWidth) / 2), 0);

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 15, 31, iconInfo.w, iconInfo.h);

        let btnSide = assets["btn-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisSide = assets["btn-disabled-side"];
        let btnDisMiddle = assets["btn-disabled-middle"];
        let btnDisRightSide = assets["btn-disabled-right-side"];

        let btnY = canvasHeight - 36;

        whiteText = false;

        if (button1.name) {
            if (!button2) {
                let textWidth = testBitmaps(button1.name);
                let btnWidth = textWidth + 24;
                let xToCenterText = Math.floor((btnWidth - textWidth) / 2);

                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisSide.x, btnDisSide.y, btnDisSide.w, btnDisSide.h, btnX, btnY, btnDisSide.w, 24);
                    ctx.drawImage(assetsSS, btnDisMiddle.x, btnDisMiddle.y, btnDisMiddle.w, btnDisMiddle.h, btnX + 5, btnY, btnWidth - 10, 24);
                    ctx.drawImage(assetsSS, btnDisRightSide.x, btnDisRightSide.y, btnDisRightSide.w, btnDisRightSide.h, btnX + btnWidth - 5, btnY, btnDisRightSide.w, 24);

                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, btnY + 3, .5);
                } else {
                    if (button1.rec) {
                        ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, btnX, btnY - 2, btnRecSide.w, 28);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 6, btnY - 2, btnWidth - 12, 28);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btnWidth - 6, btnY - 2, btnDisRightSide.w, 28);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, btnY + 3);
                    } else {
                        ctx.drawImage(assetsSS, btnSide.x, btnSide.y, btnSide.w, btnSide.h, btnX, btnY, btnSide.w, 24);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 5, btnY, btnWidth - 10, 24);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btnWidth - 5, btnY, btnRightSide.w, 24);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, btnY + 3);
                    }
                }
            }

            if (button2) {
                let text1Width = testBitmaps(button1.name);
                let btn1Width = text1Width + 24;
                let xToCenterText1 = Math.floor((btn1Width - text1Width) / 2);

                let text2Width = testBitmaps(button2.name);
                let btn2Width = text2Width + 24;
                let xToCenterText2 = Math.floor((btn2Width - text2Width) / 2);

                let btnX = Math.round((canvas.width - btn1Width - btn2Width - 16) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisSide.x, btnDisSide.y, btnDisSide.w, btnDisSide.h, btnX, btnY, btnDisSide.w, 24);
                    ctx.drawImage(assetsSS, btnDisMiddle.x, btnDisMiddle.y, btnDisMiddle.w, btnDisMiddle.h, btnX + 5, btnY, btn1Width - 10, 24);
                    ctx.drawImage(assetsSS, btnDisRightSide.x, btnDisRightSide.y, btnDisRightSide.w, btnDisRightSide.h, btnX + btn1Width - 5, btnY, btnDisRightSide.w, 24);

                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, btnY + 3, .5);
                } else {
                    if (button1.rec) {
                        ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, btnX, btnY - 2, btnRecSide.w, 28);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 6, btnY - 2, btn1Width - 12, 28);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 6, btnY - 2, btnRecRightSide.w, 28);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, btnY + 3);
                    } else {
                        ctx.drawImage(assetsSS, btnSide.x, btnSide.y, btnSide.w, btnSide.h, btnX, btnY, btnSide.w, 24);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 5, btnY, btn1Width - 10, 24);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 5, btnY, btnRightSide.w, 24);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, btnY + 3);
                    }
                }

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisSide.x, btnDisSide.y, btnDisSide.w, btnDisSide.h, btnX + 16 + btn1Width, btnY, btnDisSide.w, 24);
                    ctx.drawImage(assetsSS, btnDisMiddle.x, btnDisMiddle.y, btnDisMiddle.w, btnDisMiddle.h, btnX + 16 + btn1Width + 5, btnY, btn2Width - 10, 24);
                    ctx.drawImage(assetsSS, btnDisRightSide.x, btnDisRightSide.y, btnDisRightSide.w, btnDisRightSide.h, btnX + 16 + btn1Width + btn2Width - 5, btnY, btnDisRightSide.w, 24);

                    await drawBitmaps(ctx, button2.name, btnX + 16 + btn1Width + xToCenterText2, btnY + 3, .5);
                } else {
                    if (button2.rec) {
                        ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, btnX + 16 + btn1Width, btnY - 2, btnRecSide.w, 28);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 16 + btn1Width + 6, btnY - 2, btn2Width - 10, 28);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 16 + btn1Width + btn2Width - 6, btnY - 2, btnRecRightSide.w, 28);

                        await drawBitmaps(ctx, button2.name, btnX + 16 + btn1Width + xToCenterText2, btnY + 3);
                    } else {
                        ctx.drawImage(assetsSS, btnSide.x, btnSide.y, btnSide.w, btnSide.h, btnX + 16 + btn1Width, btnY, btnSide.w, 24);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 16 + btn1Width + 5, btnY, btn2Width - 10, 24);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 16 + btn1Width + btn2Width - 5, btnY, btnRightSide.w, 24);

                        await drawBitmaps(ctx, button2.name, btnX + 16 + btn1Width + xToCenterText2, btnY + 3);
                    }
                }
            }
        }
    }





    async function win31() {
        let vgasysr = fonts["vgasysr"]["bold"]["white"];
        title = title.replaceAll(" ", " ")
        title.split("").forEach(char => {
            let arrayChar = vgasysr.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "?");
        });


        let symbolCodes = fonts["MSSansSerif"]["bold"]["black"];
        content = content.replaceAll(" ", " ")
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) content = content.replaceAll(char, "?");
        })

        let x = 69;
        let testY = 39;
        const lineHeight = 13;

        let MSSansSerif = new Image();
        await loadImageCallback(MSSansSerif, symbolCodes.src);

        let vgasysrSS = new Image();
        await loadImageCallback(vgasysrSS, vgasysr.src);

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let symbolsData = fonts["MSSansSerif"]["bold"]["black"].info;
            for (const char of chars) {
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(MSSansSerif, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        async function drawTitle(ctx, content, x, y) {
            let chars = content.split("");
            let charsWidth = 0;
            let symbolsData = fonts["vgasysr"]["bold"]["white"].info;
            for (const char of chars) {
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.drawImage(vgasysrSS, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                charsWidth += charData.w + 1;
            }
        }

        const maxWidth = 250;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text, true) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`, true) > maxWidth) {

                        if (testBitmaps(word, true) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`, true) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line, true);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 35;
        if (longestLineW > 30) canvasWidth = longestLineW + 91;
        if (lines.length > 1 && !button1.name) canvasHeight = canvasHeight - 19;
        if (lines.length <= 1 && button1.name) canvasHeight = canvasHeight + 36;
        if (lines.length > 1 && button1.name) canvasHeight = canvasHeight + 15;

        if (button1) {
            function getBtnsWidth() {
                const btn1TextWidthFixed = testBitmaps(button1.name, true)
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btn1Width = btn1TextWidth + 32;

                if (!button2) return btn1Width;

                if (!button3) {
                    const btn2TextWidthFixed = testBitmaps(button2.name, true)
                    let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                    let btn2Width = btn2TextWidth + 32;

                    return btn1Width + btn2Width + 17;
                }

                const btn2TextWidthFixed = testBitmaps(button2.name, true)
                let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                let btn2Width = btn2TextWidth + 32;

                const btn3TextWidthFixed = testBitmaps(button3.name, true)
                let btn3TextWidth = btn3TextWidthFixed < 38 ? 38 : btn3TextWidthFixed;
                let btn3Width = btn3TextWidth + 32;

                return btn1Width + btn2Width + btn3Width + 34;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 34 < btnsWidth) {
                canvasHeight = canvasHeight + 8;
                canvasWidth = btnsWidth + 34;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;

        let y = 37;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgb(0,0,168)";
        ctx.fillRect(0, 0, canvas.width, 19);

        let minimize = assets.minimize;
        ctx.drawImage(assetsSS, minimize.x, minimize.y, minimize.w, minimize.h, 1, 1, minimize.w, minimize.h);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 19, canvas.width, 1);

        let iconY = 37;
        if (lines.length >= 3) iconY = Math.round((lines.length / 2 * lineHeight) + 14);

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 19, iconY, 32, 32);

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y);
            y += lineHeight;
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true, false, true);
            if (chunkWidth + 70 > canvas.width) {
                title = `${title.slice(0, i).trim()}…`;
                break;
            }
        }

        let titleWidth = testBitmaps(title, true, false, true);
        let titleX = Math.round((canvas.width - 20 - titleWidth) / 2) + 20;
        await drawTitle(ctx, title, titleX, 3);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name) {
            if (!button2) {
                const btn1TextWidthFixed = testBitmaps(button1.name, true);
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btnWidth = btn1TextWidth + 32;

                let xToCenterText = Math.round((btnWidth - btn1TextWidthFixed) / 2);
                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 36, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 5, canvas.height - 36, btnWidth - 8, 27);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btnWidth - 4, canvas.height - 36, btnRecRightSide.w, btnRecRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 36, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 4, canvas.height - 36, btnWidth - 8, 27);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btnWidth - 4, canvas.height - 36, btnRightSide.w, btnRightSide.h);
                }
                if (button1.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;
            }
            if (button2 && !button3) {
                const btn1TextWidthFixed = testBitmaps(button1.name, true);
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btn1Width = btn1TextWidth + 32;

                const btn2TextWidthFixed = testBitmaps(button2.name, true);
                let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                let btn2Width = btn2TextWidth + 32;

                let xToCenterText1 = Math.round((btn1Width - btn1TextWidthFixed) / 2);
                let xToCenterText2 = Math.round((btn2Width - btn2TextWidthFixed) / 2);
                let btnX = Math.round((canvas.width - btn1Width - btn2Width - 17) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 36, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 5, canvas.height - 36, btn1Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 4, canvas.height - 36, btnRecRightSide.w, btnRecRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 36, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 4, canvas.height - 36, btn1Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 4, canvas.height - 36, btnRightSide.w, btnRightSide.h);
                }
                if (button1.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + 17 + btn1Width, canvas.height - 36, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 17 + btn1Width + 5, canvas.height - 36, btn2Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36, btnRecRightSide.w, btnRecRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + 17 + btn1Width, canvas.height - 36, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 17 + btn1Width + 4, canvas.height - 36, btn2Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36, btnRightSide.w, btnRightSide.h);
                }
                if (button2.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button2.name, btnX + 17 + btn1Width + xToCenterText2, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;
            }
            if (button3) {
                const btn1TextWidthFixed = testBitmaps(button1.name, true);
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btn1Width = btn1TextWidth + 32;

                const btn2TextWidthFixed = testBitmaps(button2.name, true);
                let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                let btn2Width = btn2TextWidth + 32;

                const btn3TextWidthFixed = testBitmaps(button3.name, true);
                let btn3TextWidth = btn3TextWidthFixed < 38 ? 38 : btn3TextWidthFixed;
                let btn3Width = btn3TextWidth + 32;

                let xToCenterText1 = Math.round((btn1Width - btn1TextWidthFixed) / 2);
                let xToCenterText2 = Math.round((btn2Width - btn2TextWidthFixed) / 2);
                let xToCenterText3 = Math.round((btn3Width - btn3TextWidthFixed) / 2);
                let btnX = Math.round((canvas.width - btn1Width - btn2Width - btn3Width - 34) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 36, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 5, canvas.height - 36, btn1Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 4, canvas.height - 36, btnRecRightSide.w, btnRecRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 36, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 4, canvas.height - 36, btn1Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 4, canvas.height - 36, btnRightSide.w, btnRightSide.h);
                }
                if (button1.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + 17 + btn1Width, canvas.height - 36, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 17 + btn1Width + 5, canvas.height - 36, btn2Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36, btnRecRightSide.w, btnRecRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + 17 + btn1Width, canvas.height - 36, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 17 + btn1Width + 4, canvas.height - 36, btn2Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36, btnRightSide.w, btnRightSide.h);
                }
                if (button2.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button2.name, btnX + 17 + btn1Width + xToCenterText2, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;



                if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + 17 + btn2Width + 17 + btn1Width, canvas.height - 36, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 17 + btn2Width + 17 + btn1Width + 5, canvas.height - 36, btn3Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 17 + btn2Width + 17 + btn1Width + btn3Width - 4, canvas.height - 36, btnRecRightSide.w, btnRecRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + 17 + btn2Width + 17 + btn1Width, canvas.height - 36, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 17 + btn2Width + 17 + btn1Width + 4, canvas.height - 36, btn3Width - 8, 27);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 17 + btn2Width + 17 + btn1Width + btn3Width - 4, canvas.height - 36, btnRightSide.w, btnRightSide.h);
                }
                if (button3.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button3.name, btnX + 17 + btn2Width + 17 + btn1Width + xToCenterText3, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;
            }
        }
    }





    async function win9x() {
        let symbolCodes = fonts["MSSansSerif"]["regular"]["black"];
        title = title.replaceAll(" ", " ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ")
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let x = 61;
        let testY = 33;
        const lineHeight = 13;
        let whiteText = false;

        let MSSansSerif = new Image();
        await loadImageCallback(MSSansSerif, symbolCodes.src);

        let MSSansSerifWhite = new Image();
        await loadImageCallback(MSSansSerifWhite, fonts["MSSansSerif"]["regular"]["white"].src);

        let MSSansSerifBold = new Image();
        await loadImageCallback(MSSansSerifBold, fonts["MSSansSerif"]["bold"]["white"].src);

        let SimSun;
        let SimSunWhite;

        for (const text of [content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                SimSun = new Image();
                await loadImageCallback(SimSun, fonts["SimSun"]["regular"]["black"].src);

                SimSunWhite = new Image();
                await loadImageCallback(SimSunWhite, fonts["SimSun"]["regular"]["white"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let txtColor = whiteText ? "white" : "black";
            let spriteSheet;
            if (isBold) {
                spriteSheet = MSSansSerifBold;
            } else {
                if (txtColor == "white") {
                    spriteSheet = MSSansSerifWhite;
                } else if (txtColor == "black") {
                    spriteSheet = MSSansSerif;
                }
            }
            let symbolsData;
            for (let char of chars) {
                if (isCJ(char)) {
                    if (!isBold) {
                        spriteSheet = whiteText ? SimSunWhite : SimSun;
                        symbolsData = fonts["SimSun"]["regular"][txtColor].info;
                    } else {
                        char = "□"
                        symbolsData = isBold ? fonts["MSSansSerif"]["bold"]["white"].info : fonts["MSSansSerif"]["regular"][txtColor].info;
                    }
                } else {
                    if (isBold) {
                        spriteSheet = MSSansSerifBold;
                    } else {
                        if (txtColor == "white") {
                            spriteSheet = MSSansSerifWhite;
                        } else if (txtColor == "black") {
                            spriteSheet = MSSansSerif;
                        }
                    }

                    symbolsData = isBold ? fonts["MSSansSerif"]["bold"]["white"].info : fonts["MSSansSerif"]["regular"][txtColor].info;
                }
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        const maxWidth = 400;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 40;
        if (longestLineW > 41) canvasWidth = longestLineW + 79;
        if (longestLineW > 360) canvasWidth = 482;
        if (lines.length > 1 && canvasWidth > 120) canvasHeight = testY + 54;
        if (lines.length <= 1 && button1.name) canvasHeight = testY + 62;
        if (lines.length > 1 && !button1.name) canvasHeight = testY + 14;

        if (button1) {
            function getBtnsWidth() {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 74) btn1TextWidth = 73;
                let btn1Width = btn1TextWidth + 9;

                if (!button2) return btn1Width;

                if (!button3) {
                    const btn2TextWidthFixed = testBitmaps(button2.name);
                    let btn2TextWidth = btn2TextWidthFixed;
                    if (btn2TextWidth < 74) btn2TextWidth = 73;
                    let btn2Width = btn2TextWidth + 9;

                    return btn1Width + btn2Width + 5;
                }

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 74) btn2TextWidth = 73;
                let btn2Width = btn2TextWidth + 9;

                const btn3TextWidthFixed = testBitmaps(button3.name);
                let btn3TextWidth = btn3TextWidthFixed;
                if (btn3TextWidth < 74) btn3TextWidth = 73;
                let btn3Width = btn3TextWidth + 9;

                return btn1Width + btn2Width + btn3Width + 10;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 28 < btnsWidth) {
                canvasHeight = canvasHeight + 8;
                canvasWidth = btnsWidth + 28;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        let y = 33;

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let line of lines) {
            await drawBitmaps(ctx, line, x + 1, y);
            y += lineHeight;
        }

        let frameTop = assets["icon-frame-top"];
        let frameLeftSide = assets["icon-frame-left-side"];
        let frameLeftCorner = assets["icon-frame-left-corner"];
        let frameBottomRightCorner = assets["icon-frame-bottom-right-corner"];
        let frameRightCorner = assets["icon-frame-right-corner"];
        let frameBottomLeftCorner = assets["icon-frame-bottom-left-corner"];
        let frameBottom = assets["icon-frame-bottom"];
        let frameRightSide = assets["icon-frame-right-side"];

        ctx.drawImage(assetsSS, frameLeftCorner.x, frameLeftCorner.y, frameLeftCorner.w, frameLeftCorner.h, 0, 0, frameLeftCorner.w, frameLeftCorner.h);
        ctx.drawImage(assetsSS, frameTop.x, frameTop.y, frameTop.w, frameTop.h, 3, 0, canvas.width - 5, 3);
        ctx.drawImage(assetsSS, frameRightCorner.x, frameRightCorner.y, frameRightCorner.w, frameRightCorner.h, canvas.width - 3, 0, frameRightCorner.w, frameRightCorner.h);
        ctx.drawImage(assetsSS, frameLeftSide.x, frameLeftSide.y, frameLeftSide.w, frameLeftSide.h, 0, 3, 3, canvas.height - 5);
        ctx.drawImage(assetsSS, frameBottomLeftCorner.x, frameBottomLeftCorner.y, frameBottomLeftCorner.w, frameBottomLeftCorner.h, 0, canvas.height - 3, frameBottomLeftCorner.w, frameBottomLeftCorner.h);
        ctx.drawImage(assetsSS, frameBottom.x, frameBottom.y, frameBottom.w, frameBottom.h, 3, canvas.height - 3, canvas.width - 5, 3);
        ctx.drawImage(assetsSS, frameBottomRightCorner.x, frameBottomRightCorner.y, frameBottomRightCorner.w, frameBottomRightCorner.h, canvas.width - 3, canvas.height - 3, frameBottomRightCorner.w, frameBottomRightCorner.h);
        ctx.drawImage(assetsSS, frameRightSide.x, frameRightSide.y, frameRightSide.w, frameRightSide.h, canvas.width - 3, 3, 3, canvas.height - 5);

        let gradient = ctx.createLinearGradient(0, 0, canvas.width - 6, 0);
        gradient.addColorStop(0, gradientPrimaryColor);
        gradient.addColorStop(1, gradientSecondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(3, 3, canvas.width - 6, 18);

        ctx.drawImage(system == "win98" ? iconSS : assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 13, 32, 34, 34);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 40 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 6, 5, true)

        let crossImg = crossDisabled ? assets["cross-disabled"] : assets["cross"];
        ctx.drawImage(assetsSS, crossImg.x, crossImg.y, crossImg.w, crossImg.h, canvas.width - 21, 5, crossImg.w, crossImg.h);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name) {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 57) textWidth = 57;
                let btnWidth = textWidth + 18;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2);

                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 3, canvas.height - 37, btnWidth - 7, btnRecMiddle.h);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btnWidth - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, btnWidth - 5, btnMiddle.h);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btnWidth - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button1.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText + 1, canvas.height - 31);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                    }
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 57) text1Width = 57;
                let btn1Width = text1Width + 18;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2);

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 57) text2Width = 57;
                let btn2Width = text2Width + 18;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2);

                let btnX = Math.round((canvas.width - btn1Width - 5 - btn2Width) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 3, canvas.height - 37, btn1Width - 7, btnRecMiddle.h);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, btn1Width - 5, btnMiddle.h);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button1.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1 + 1, canvas.height - 31);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                    }
                }

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 5 + btn1Width + 3, canvas.height - 37, btn2Width - 7, btnRecMiddle.h);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + 5 + btn1Width, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 5 + btn1Width + btn2Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 5 + btn1Width + 2, canvas.height - 37, btn2Width - 5, btnMiddle.h);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + 5 + btn1Width, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 5 + btn1Width + btn2Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button2.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2 + 1, canvas.height - 31);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                    }
                }
            }
            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 57) text1Width = 57;
                let btn1Width = text1Width + 18;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2);

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 57) text2Width = 57;
                let btn2Width = text2Width + 18;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2);

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 57) text3Width = 57;
                let btn3Width = text3Width + 18;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2);

                let btnX = Math.round((canvas.width - btn1Width - 10 - btn2Width - btn3Width) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 3, canvas.height - 37, btn1Width - 7, btnRecMiddle.h);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, btn1Width - 5, btnMiddle.h);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button1.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1 + 1, canvas.height - 31);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                    }
                }

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 5 + btn1Width + 3, canvas.height - 37, btn2Width - 7, btnRecMiddle.h);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + 5 + btn1Width, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 5 + btn1Width + btn2Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 5 + btn1Width + 2, canvas.height - 37, btn2Width - 5, btnMiddle.h);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + 5 + btn1Width, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 5 + btn1Width + btn2Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button2.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2 + 1, canvas.height - 31);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                    }
                }

                if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 10 + btn1Width + btn2Width + 3, canvas.height - 37, btn3Width - 7, btnRecMiddle.h);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + 10 + btn1Width + btn2Width, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + 10 + btn1Width + btn2Width + btn3Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button3.name, btnX + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 10 + btn1Width + btn2Width + 2, canvas.height - 37, btn3Width - 5, btnMiddle.h);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + 10 + btn1Width + btn2Width, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + 10 + btn1Width + btn2Width + btn3Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button3.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button3.name, btnX + 10 + btn1Width + btn2Width + xToCenterText3 + 1, canvas.height - 31);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button3.name, btnX + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button3.name, btnX + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32);
                    }
                }
            }
        }
    }



    async function win2k() {
        let symbolCodes = fonts["Tahoma"]["regular"]["black"];
        title = title.replaceAll(" ", " ")
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "□")
        })
        content = content.replaceAll(" ", " ")
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□")
        })

        let whiteText = false;

        let Tahoma = new Image();
        await loadImageCallback(Tahoma, symbolCodes.src);

        let TahomaWhite = new Image();
        await loadImageCallback(TahomaWhite, fonts["Tahoma"]["regular"]["white"].src);

        let TahomaBold = new Image();
        await loadImageCallback(TahomaBold, fonts["Tahoma"]["bold"]["white"].src);

        let SimSun;
        let SimSunWhite;

        for (const text of [content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                SimSun = new Image();
                await loadImageCallback(SimSun, fonts["SimSun"]["regular"]["black"].src);

                SimSunWhite = new Image();
                await loadImageCallback(SimSunWhite, fonts["SimSun"]["regular"]["white"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let txtColor = whiteText ? "white" : "black";
            let spriteSheet;
            if (isBold) {
                spriteSheet = TahomaBold;
            } else {
                if (txtColor == "white") {
                    spriteSheet = TahomaWhite;
                } else if (txtColor == "black") {
                    spriteSheet = Tahoma;
                }
            }
            let symbolsData;
            for (let char of chars) {
                if (isCJ(char)) {
                    if (!isBold) {
                        spriteSheet = whiteText ? SimSunWhite : SimSun;
                        symbolsData = fonts["SimSun"]["regular"][txtColor].info;
                    } else {
                        char = "□"
                        symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"].info : fonts["MSSansSerif"]["regular"][txtColor].info;
                    }
                } else {
                    if (isBold) {
                        spriteSheet = TahomaBold;
                    } else {
                        if (txtColor == "white") {
                            spriteSheet = TahomaWhite;
                        } else if (txtColor == "black") {
                            spriteSheet = Tahoma;
                        }
                    }

                    symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"].info : fonts["Tahoma"]["regular"][txtColor].info;
                }
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let x = 63;
        let testY = 41;
        const lineHeight = 13;

        const maxWidth = 324;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 46;
        if (longestLineW > 41) canvasWidth = longestLineW + 88;
        if (longestLineW > 324) canvasWidth = 392;
        if (lines.length <= 1 && button1.name) canvasHeight = testY + 67;
        if (lines.length <= 1 && !button1.name) canvasHeight = testY + 35;
        if (lines.length > 1 && !button1.name) canvasHeight = testY + 14;

        if (button1.name) {
            function getBtnsWidth() {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 66) btn1TextWidth = 65;
                let btn1Width = btn1TextWidth + 10;

                if (!button2) return btn1Width;

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 66) btn2TextWidth = 65;
                let btn2Width = btn2TextWidth + 10;

                if (!button3) return btn1Width + btn2Width + 4;

                const btn3TextWidthFixed = testBitmaps(button3.name);
                let btn3TextWidth = btn3TextWidthFixed;
                if (btn3TextWidth < 66) btn3TextWidth = 65;
                let btn3Width = btn3TextWidth + 10;

                return btn1Width + btn2Width + btn3Width + 8;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 28 < btnsWidth) {
                canvasHeight = canvasHeight + 8;
                canvasWidth = btnsWidth + 28;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#d4d0c8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let frameCorner = assets["icon-frame-corner"];
        let frameDarkCorner = assets["icon-frame-corner-dark"];
        let frameBottomLeftCorner = assets["icon-frame-corner-bottom-left"];
        let frameTopRightCorner = assets["icon-frame-corner-top-right"];
        let frameSide = assets["icon-frame-side"];
        let frameDarkSide = assets["icon-frame-side-dark"];
        let frameSideHor = assets["icon-frame-side-horizontal"];
        let frameDarkSideHor = assets["icon-frame-side-dark-horizontal"];

        ctx.drawImage(assetsSS, frameSideHor.x, frameSideHor.y, frameSideHor.w, frameSideHor.h, 0, 3, 3, canvas.height - 5);
        ctx.drawImage(assetsSS, frameSide.x, frameSide.y, frameSide.w, frameSide.h, 3, 0, canvas.width - 5, 3);
        ctx.drawImage(assetsSS, frameCorner.x, frameCorner.y, frameCorner.w, frameCorner.h, 0, 0, frameCorner.w, frameCorner.h);
        ctx.drawImage(assetsSS, frameTopRightCorner.x, frameTopRightCorner.y, frameTopRightCorner.w, frameTopRightCorner.h, canvas.width - 3, 0, frameTopRightCorner.w, frameTopRightCorner.h);
        ctx.drawImage(assetsSS, frameDarkSideHor.x, frameDarkSideHor.y, frameDarkSideHor.w, frameDarkSideHor.h, canvas.width - 3, 3, 3, canvas.height - 5);
        ctx.drawImage(assetsSS, frameDarkSide.x, frameDarkSide.y, frameDarkSide.w, frameDarkSide.h, 3, canvas.height - 3, canvas.width - 5, 3);
        ctx.drawImage(assetsSS, frameDarkCorner.x, frameDarkCorner.y, frameDarkCorner.w, frameDarkCorner.h, canvas.width - 3, canvas.height - 3, frameDarkCorner.w, frameDarkCorner.h);
        ctx.drawImage(assetsSS, frameBottomLeftCorner.x, frameBottomLeftCorner.y, frameBottomLeftCorner.w, frameBottomLeftCorner.h, 0, canvasHeight - 3, frameBottomLeftCorner.w, frameBottomLeftCorner.h);

        let gradient = ctx.createLinearGradient(0, 0, canvas.width - 6, 0);
        gradient.addColorStop(0, gradientPrimaryColor);
        gradient.addColorStop(1, gradientSecondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(3, 3, canvas.width - 6, 18);

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 13, 32, 34, 34);

        let y = 31;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x + 2, y + 2);
            y += lineHeight;
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 45 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 5, 5, true);

        let crossImgSrc = crossDisabled ? assets["cross-disabled"] : assets["cross"];
        ctx.drawImage(assetsSS, crossImgSrc.x, crossImgSrc.y, crossImgSrc.w, crossImgSrc.h, canvas.width - 21, 5, crossImgSrc.w, crossImgSrc.h);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];
        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name) {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 66) textWidth = 65;
                let btnWidth = textWidth + 10;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2);

                let btnX = Math.ceil((canvas.width - btnWidth) / 2);
                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 3, canvas.height - 37, textWidth + 3, 23);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btnWidth - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, textWidth + 5, 23);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btnWidth - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button1.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + 1 + xToCenterText, canvas.height - 32);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 33, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 33);
                    }
                }
            }

            if (button2 && !button3) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 66) btn1TextWidth = 65;
                let btn1Width = btn1TextWidth + 10;
                let xToCenterText1 = Math.floor((btn1Width - btn1TextWidthFixed) / 2);

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 66) btn2TextWidth = 65;
                let btn2Width = btn2TextWidth + 10;
                let xToCenterText2 = Math.floor((btn2Width - btn2TextWidthFixed) / 2);

                let btnsRowWidth = btn1Width + btn2Width + 4;
                let btnX = Math.floor((canvas.width - btnsRowWidth) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 3, canvas.height - 37, btn1TextWidth + 3, 23);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, btn1TextWidth + 5, 23);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button1.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + 1 + xToCenterText1, canvas.height - 32);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 33, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 33);
                    }
                }

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + btn1Width + 4 + 3, canvas.height - 37, btn2TextWidth + 3, 23);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + btn1Width + 4, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width + 4 + btn2Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + xToCenterText2, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + btn1Width + 4 + 2, canvas.height - 37, btn2TextWidth + 5, 23);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + btn1Width + 4, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width + 4 + btn2Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button2.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + 1 + xToCenterText2, canvas.height - 32);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + xToCenterText2, canvas.height - 33, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + xToCenterText2, canvas.height - 33);
                    }
                }
            }

            if (button3) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 66) btn1TextWidth = 65;
                let btn1Width = btn1TextWidth + 10;
                let xToCenterText1 = Math.floor((btn1Width - btn1TextWidthFixed) / 2);

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 66) btn2TextWidth = 65;
                let btn2Width = btn2TextWidth + 10;
                let xToCenterText2 = Math.floor((btn2Width - btn2TextWidthFixed) / 2);

                const btn3TextWidthFixed = testBitmaps(button3.name);
                let btn3TextWidth = btn3TextWidthFixed;
                if (btn3TextWidth < 66) btn3TextWidth = 65;
                let btn3Width = btn3TextWidth + 10;
                let xToCenterText3 = Math.floor((btn3Width - btn3TextWidthFixed) / 2);

                let btnsRowWidth = btn1Width + btn2Width + btn3Width + 8;
                let btnX = Math.floor((canvas.width - btnsRowWidth) / 2);
                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 3, canvas.height - 37, btn1TextWidth + 3, 23);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, btn1TextWidth + 5, 23);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button1.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + 1 + xToCenterText1, canvas.height - 32);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 33, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 33);
                    }
                }

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + btn1Width + 4 + 3, canvas.height - 37, btn2TextWidth + 3, 23);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + btn1Width + 4, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width + 4 + btn2Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + xToCenterText2, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + btn1Width + 4 + 2, canvas.height - 37, btn2TextWidth + 5, 23);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + btn1Width + 4, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width + 4 + btn2Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button2.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + 1 + xToCenterText2, canvas.height - 32);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + xToCenterText2, canvas.height - 33, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, btnX + btn1Width + 4 + xToCenterText2, canvas.height - 33);
                    }
                }

                if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + btn1Width + 4 + btn2Width + 4 + 3, canvas.height - 37, btn3TextWidth + 3, 23);
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + btn1Width + btn2Width + 4 + 4, canvas.height - 37, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width + 4 + btn2Width + 4 + btn3Width - 4, canvas.height - 37, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button3.name, btnX + 8 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + btn1Width + 4 + btn2Width + 4 + 2, canvas.height - 37, btn3TextWidth + 5, 23);
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + btn1Width + btn2Width + 4 + 4, canvas.height - 37, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width + btn2Width + 4 + 4 + btn3Width - 3, canvas.height - 37, btnRightSide.w, btnRightSide.h);
                    if (button3.disabled) {
                        whiteText = true;
                        await drawBitmaps(ctx, button3.name, btnX + btn1Width + 4 + btn2Width + 4 + 1 + xToCenterText3, canvas.height - 32);
                        whiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button3.name, btnX + btn1Width + 4 + btn2Width + 4 + xToCenterText3, canvas.height - 33, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button3.name, btnX + btn1Width + 4 + btn2Width + 4 + xToCenterText3, canvas.height - 32);
                    }
                }
            }
        }
    }





    async function winwh() {
        let symbolCodes = fonts["Tahoma"]["regular"]["black"];
        title = title.replaceAll(" ", " ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let Tahoma = new Image();
        await loadImageCallback(Tahoma, symbolCodes.src);

        let TahomaWhite = new Image();
        await loadImageCallback(TahomaWhite, fonts["Tahoma"]["regular"]["white"].src);

        let TahomaBold = new Image();
        await loadImageCallback(TahomaBold, fonts["Tahoma"]["bold"]["white"].src);

        let SimSun;
        let SimSunWhite;

        for (const text of [content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                SimSun = new Image();
                await loadImageCallback(SimSun, fonts["SimSun"]["regular"]["black"].src);

                SimSunWhite = new Image();
                await loadImageCallback(SimSunWhite, fonts["SimSun"]["regular"]["white"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let txtColor = whiteText ? "white" : "black";
            let spriteSheet;
            if (isBold) {
                spriteSheet = TahomaBold;
            } else {
                if (txtColor == "white") {
                    spriteSheet = TahomaWhite;
                } else if (txtColor == "black") {
                    spriteSheet = Tahoma;
                }
            }
            let symbolsData;
            for (let char of chars) {
                if (isCJ(char)) {
                    if (!isBold) {
                        spriteSheet = whiteText ? SimSunWhite : SimSun;
                        symbolsData = fonts["SimSun"]["regular"][txtColor].info;
                    } else {
                        char = "□"
                        symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"].info : fonts["MSSansSerif"]["regular"][txtColor].info;
                    }
                } else {
                    if (isBold) {
                        spriteSheet = TahomaBold;
                    } else {
                        if (txtColor == "white") {
                            spriteSheet = TahomaWhite;
                        } else if (txtColor == "black") {
                            spriteSheet = Tahoma;
                        }
                    }

                    symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"].info : fonts["Tahoma"]["regular"][txtColor].info;
                }
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let whiteText = false;

        let x = 64;
        let testY = 32;
        const lineHeight = 13;

        const maxWidth = 407;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 144;
        let canvasHeight = testY + 15;
        if (longestLineW > 65) canvasWidth = longestLineW + 79;
        if (longestLineW > 407) canvasWidth = 486;
        if (lines.length > 1 && !button1.name) canvasHeight = testY + 19;
        if (lines.length <= 1 && !button1.name) canvasHeight = testY + 36;
        if (lines.length > 1 && button1.name) canvasHeight = testY + 57;
        if (lines.length <= 1 && button1.name) canvasHeight = testY + 78;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 57) text1Width = 57;
                let btn1Width = text1Width + 18;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width < 57) text2Width = 57;
                    let btn2Width = text2Width + 18;

                    return btn1Width + btn2Width + 6;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 57) text2Width = 57;
                let btn2Width = text2Width + 18;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 57) text3Width = 57;
                let btn3Width = text3Width + 18;

                return btn1Width + btn2Width + btn3Width + 12;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 30 < btnsWidth) {
                canvasWidth = btnsWidth + 30;
            }
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "rgb(235,235,228)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let frameLeftCorner = assets["frame-left-corner"];
        let frameRightCorner = assets["frame-right-corner"];
        let frameMiddleLight = assets["frame-middle-light"];
        let frameMiddleDark = assets[crossDisabled ? "frame-middle-dark-no-cross" : "frame-middle-dark"];
        let frameLeftSide = assets["frame-left-side"];
        let frameRightSide = assets["frame-right-side"];
        let frameBottomLeft = assets["frame-bottom-left-corner"];
        let frameBottomRight = assets["frame-bottom-right-corner"];
        let frameBottom = assets["frame-bottom"];
        let rectangles = assets["rectangles"];
        let comments = assets[crossDisabled ? "frame-middle-comments-no-cross" : "frame-middle-comments"];

        ctx.drawImage(assetsSS, frameLeftCorner.x, frameLeftCorner.y, frameLeftCorner.w, frameLeftCorner.h, 0, 0, frameLeftCorner.w, frameLeftCorner.h);
        ctx.drawImage(assetsSS, frameMiddleLight.x, frameMiddleLight.y, frameMiddleLight.w, frameMiddleLight.h, 4, 0, canvas.width - 143, 23);
        ctx.drawImage(assetsSS, rectangles.x, rectangles.y, rectangles.w, rectangles.h, canvas.width - 140, 0, rectangles.w, rectangles.h);
        ctx.drawImage(assetsSS, frameLeftSide.x, frameLeftSide.y, frameLeftSide.w, frameLeftSide.h, 0, 23, 4, canvas.height - 27);
        ctx.drawImage(assetsSS, frameBottomLeft.x, frameBottomLeft.y, frameBottomLeft.w, frameBottomLeft.h, 0, canvas.height - 4, frameBottomLeft.w, frameBottomLeft.h);
        ctx.drawImage(assetsSS, frameBottom.x, frameBottom.y, frameBottom.w, frameBottom.h, 4, canvas.height - 4, canvas.width - 7, 4);
        ctx.drawImage(assetsSS, frameBottomRight.x, frameBottomRight.y, frameBottomRight.w, frameBottomRight.h, canvas.width - 4, canvas.height - 4, frameBottomRight.w, frameBottomRight.h);
        ctx.drawImage(assetsSS, frameRightSide.x, frameRightSide.y, frameRightSide.w, frameRightSide.h, canvas.width - 4, 23, 4, canvas.height - 27);
        ctx.drawImage(assetsSS, frameRightCorner.x, frameRightCorner.y, frameRightCorner.w, frameRightCorner.h, canvas.width - 4, 0, frameRightCorner.w, frameRightCorner.h);

        let titleWidth = testBitmaps(title, true);
        if (titleWidth >= canvas.width - 95) {
            ctx.drawImage(assetsSS, frameMiddleDark.x, frameMiddleDark.y, frameMiddleDark.w, frameMiddleDark.h, canvas.width - 113, 0, frameMiddleDark.w, frameMiddleDark.h);
        } else {
            ctx.drawImage(assetsSS, comments.x, comments.y, comments.w, comments.h, canvas.width - 113, 0, comments.w, comments.h);
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 50 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 13, 5, true)

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 14, 33, 34, 34);

        let y = 32;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x + 2, y + 2);
            y += lineHeight;
        }

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name) {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 57) textWidth = 57;

                let btnWidth = textWidth + 18;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 1;

                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 38, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 4, canvas.height - 38, textWidth + 10, 23);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + textWidth + 14, canvas.height - 38, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 33);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 38, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 38, textWidth + 14, 23);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + textWidth + 16, canvas.height - 38, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, btnX, canvas.height - 38, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 38, textWidth + 14, 23);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, btnX + textWidth + 16, canvas.height - 38, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 33, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 57) text1Width = 57;

                let btn1Width = text1Width + 18;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 1;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 57) text2Width = 57;

                let btn2Width = text2Width + 18;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 1;

                let btnX = Math.round((canvas.width - btn1Width - btn2Width - 6) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 38, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 4, canvas.height - 38, text1Width + 10, 23);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + text1Width + 14, canvas.height - 38, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 38, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + text1Width + 16, canvas.height - 38, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, btnX, canvas.height - 38, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, btnX + text1Width + 16, canvas.height - 38, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + btn1Width + 6, canvas.height - 38, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + btn1Width + 6 + 4, canvas.height - 38, text2Width + 10, 23);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width + text2Width + 20, canvas.height - 38, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 6 + 2 + xToCenterText2, canvas.height - 33);
                } else if (!button2.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + btn1Width + 6, canvas.height - 38, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + btn1Width + 6 + 2, canvas.height - 38, text2Width + 14, 23);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 6 + 2 + xToCenterText2, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, btnX + btn1Width + 6, canvas.height - 38, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2 + btn1Width + 6, canvas.height - 38, text2Width + 14, 23);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 6 + 2 + xToCenterText2, canvas.height - 33, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 57) text1Width = 57;

                let btn1Width = text1Width + 18;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 1;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 57) text2Width = 57;

                let btn2Width = text2Width + 18;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 1;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 57) text3Width = 57;

                let btn3Width = text3Width + 18;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) - 1;

                let btnX = Math.round((canvas.width - btn1Width - btn2Width - btn3Width - 12) / 2);

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX, canvas.height - 38, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 4, canvas.height - 38, text1Width + 10, 23);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + text1Width + 14, canvas.height - 38, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX, canvas.height - 38, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + text1Width + 16, canvas.height - 38, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, btnX, canvas.height - 38, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, btnX + text1Width + 16, canvas.height - 38, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + btn1Width + 6, canvas.height - 38, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + btn1Width + 6 + 4, canvas.height - 38, text2Width + 10, 23);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn1Width + text2Width + 20, canvas.height - 38, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 6 + 2 + xToCenterText2, canvas.height - 33);
                } else if (!button2.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + btn1Width + 6, canvas.height - 38, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + btn1Width + 6 + 2, canvas.height - 38, text2Width + 14, 23);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 6 + 2 + xToCenterText2, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, btnX + btn1Width + 6, canvas.height - 38, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2 + btn1Width + 6, canvas.height - 38, text2Width + 14, 23);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button2.name, btnX + btn1Width + 6 + 2 + xToCenterText2, canvas.height - 33, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }

                if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, btnX + btn2Width + 6 + btn1Width + 6, canvas.height - 38, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + btn2Width + 6 + btn1Width + 6 + 4, canvas.height - 38, text3Width + 10, 23);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, btnX + btn2Width + btn1Width + 6 + text3Width + 14, canvas.height - 38, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button3.name, btnX + btn1Width + 6 + btn2Width + 6 + 2 + xToCenterText3, canvas.height - 33);
                } else if (!button3.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, btnX + btn1Width + 6 + btn2Width + 6, canvas.height - 38, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + btn1Width + 6 + btn2Width + 6 + 2, canvas.height - 38, text3Width + 14, 23);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, btnX + btn1Width + 6 + btn2Width + 6 + text3Width + 16, canvas.height - 38, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button3.name, btnX + btn1Width + 6 + btn2Width + 6 + 2 + xToCenterText3, canvas.height - 33);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, btnX + btn1Width + 6 + btn2Width + 6, canvas.height - 38, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2 + btn1Width + 6 + btn2Width + 6, canvas.height - 38, text3Width + 14, 23);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, btnX + btn1Width + 6 + btn2Width + 6 + text3Width + 16, canvas.height - 38, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button3.name, btnX + btn1Width + 6 + btn2Width + 6 + 2 + xToCenterText3, canvas.height - 33, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }
        }
    }





    async function winxp() {
        let TMSCodes = fonts["TrebuchetMS"]["bold"]["white"];
        title = title.replaceAll(" ", " ")
        title.split("").forEach(char => {
            let arrayChar = TMSCodes.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "□");
        })

        let symbolCodes = fonts["Tahoma"]["regular"]["black"];
        content = content.replaceAll(" ", " ")
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let x = 63;
        let testY = 41;
        const lineHeight = 13;

        let Tahoma = new Image();
        await loadImageCallback(Tahoma, symbolCodes.src);

        let TrebuchetMS = new Image();
        await loadImageCallback(TrebuchetMS, TMSCodes.src);

        let SimSun;
        let SimSunWhite;

        for (const text of [content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                SimSun = new Image();
                await loadImageCallback(SimSun, fonts["SimSun"]["regular"]["black"].src);

                SimSunWhite = new Image();
                await loadImageCallback(SimSunWhite, fonts["SimSun"]["regular"]["white"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let spriteSheet = Tahoma;
            let symbolsData = symbolCodes.info;
            for (let char of chars) {
                if (isCJ(char)) {
                    spriteSheet = SimSun;
                    symbolsData = fonts["SimSun"]["regular"]["black"].info;
                } else {
                    spriteSheet = Tahoma;
                    symbolsData = symbolCodes.info;
                }
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        const maxWidth = 410;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 60;
        if (longestLineW > 41) canvasWidth = longestLineW + 88;
        if (longestLineW > 410) canvasWidth = 491;
        if (lines.length > 1 && button1.name) canvasHeight = testY + 53;
        if (lines.length <= 1 && button1.name) canvasHeight = testY + 53;
        if (lines.length <= 1 && !button1.name) canvasHeight = testY + 32;
        if (lines.length > 1 && !button1.name) canvasHeight = testY + 40;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width <= 58) text1Width = 58;
                let btn1Width = text1Width + 14;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width <= 58) text2Width = 58;
                    let btn2Width = text2Width + 14;

                    return btn1Width + btn2Width + 7;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width <= 58) text2Width = 58;
                let btn2Width = text2Width + 14;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width <= 58) text3Width = 58;
                let btn3Width = text3Width + 14;

                return btn1Width + btn2Width + btn3Width + 14;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 34 < btnsWidth) canvasWidth = btnsWidth + 34;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#ece9d8";
        ctx.fillRect(3, 29, canvas.width, canvas.height);

        let frameLeftCorner = assets["frame-left-corner"];
        let frameWithCross = assets["frame-right-corner-cross"];
        let frameRightCorner = assets["frame-right-corner-no-cross"];
        let frameMiddle = assets["frame-middle"];
        let frameLeft = assets["frame-left-side"];
        let frameRight = assets["frame-right-side"];
        let frameBottom = assets["frame-bottom-side"];
        let frameBottomLeftCorner = assets["frame-bottom-left-corner"];
        let frameBottomRightCorner = assets["frame-bottom-right-corner"];

        ctx.drawImage(assetsSS, frameMiddle.x, frameMiddle.y, frameMiddle.w, frameMiddle.h, 35, 0, canvas.width - 79, 29);
        ctx.drawImage(assetsSS, frameLeftCorner.x, frameLeftCorner.y, frameLeftCorner.w, frameLeftCorner.h, 0, 0, frameLeftCorner.w, frameLeftCorner.h);
        ctx.drawImage(assetsSS, frameLeft.x, frameLeft.y, frameLeft.w, frameLeft.h, 0, 29, 3, canvas.height - 31);
        ctx.drawImage(assetsSS, frameBottom.x, frameBottom.y, frameBottom.w, frameBottom.h, 4, canvas.height - 3, canvas.width - 7, 3);
        ctx.drawImage(assetsSS, frameBottomLeftCorner.x, frameBottomLeftCorner.y, frameBottomLeftCorner.w, frameBottomLeftCorner.h, 0, canvas.height - 3, frameBottomLeftCorner.w, frameBottomLeftCorner.h);
        ctx.drawImage(assetsSS, frameBottomRightCorner.x, frameBottomRightCorner.y, frameBottomRightCorner.w, frameBottomRightCorner.h, canvas.width - 4, canvas.height - 3, frameBottomRightCorner.w, frameBottomRightCorner.h);
        ctx.drawImage(assetsSS, frameRight.x, frameRight.y, frameRight.w, frameRight.h, canvas.width - 3, 29, 3, canvas.height - 31);

        let crossImgSrc = crossDisabled ? frameRightCorner : frameWithCross;
        ctx.drawImage(assetsSS, crossImgSrc.x, crossImgSrc.y, crossImgSrc.w, crossImgSrc.h, canvas.width - 44, 0, crossImgSrc.w, crossImgSrc.h);

        let y = 43;

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 12, 39, 34, 34);

        async function drawTitle(ctx, content, x, y) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let charData = TMSCodes.info[char.charCodeAt(0)];
                ctx.drawImage(TrebuchetMS, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                charsWidth += charData.w;
            }
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 50 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        for (let line of lines) {
            await drawBitmaps(ctx, line, x + 2, y - 3);
            y += lineHeight;
        }
        await drawTitle(ctx, title, 7, 7);

        let btnLeft = assets["btn-left"];
        let btnMiddle = assets["btn-middle"];
        let btnRight = assets["btn-right"];

        let btnDisabledLeft = assets["btn-disabled-left"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRight = assets["btn-disabled-right"];

        let btnRecLeft = assets["btn-rec-left"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRight = assets["btn-rec-right"];

        if (button1.name) {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth <= 58) textWidth = 58;
                let btnWidth = textWidth + 14;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btnWidth) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 37, textWidth + 12, 20);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX, canvas.height - 37, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 14 + textWidth, canvas.height - 37, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 2, canvas.height - 37, textWidth + 12, 20);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX, canvas.height - 37, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 14 + textWidth, canvas.height - 37, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 34);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, textWidth + 12, 20);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX, canvas.height - 37, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 14 + textWidth, canvas.height - 37, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 34);
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width <= 58) text1Width = 58;
                let btn1Width = text1Width + 14;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) + 2;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width <= 58) text2Width = 58;
                let btn2Width = text2Width + 14;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btn1Width - btn2Width - 7) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX, canvas.height - 37, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 14 + text1Width, canvas.height - 37, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX, canvas.height - 37, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 14 + text1Width, canvas.height - 37, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX, canvas.height - 37, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 14 + text1Width, canvas.height - 37, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                }

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2 + 7 + btn1Width, canvas.height - 37, text2Width + 12, 20);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX + 7 + btn1Width, canvas.height - 37, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 7 + btn1Width + 2, canvas.height - 37, text2Width + 12, 20);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX + 7 + btn1Width, canvas.height - 37, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2 + 7 + btn1Width, canvas.height - 37, text2Width + 12, 20);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX + 7 + btn1Width, canvas.height - 37, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width <= 58) text1Width = 58;
                let btn1Width = text1Width + 14;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) + 2;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width <= 58) text2Width = 58;
                let btn2Width = text2Width + 14;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 2;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width <= 58) text3Width = 58;
                let btn3Width = text3Width + 14;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btn1Width - btn2Width - 14 - btn3Width) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX, canvas.height - 37, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 14 + text1Width, canvas.height - 37, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX, canvas.height - 37, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 14 + text1Width, canvas.height - 37, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX, canvas.height - 37, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 14 + text1Width, canvas.height - 37, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                }

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2 + 7 + btn1Width, canvas.height - 37, text2Width + 12, 20);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX + 7 + btn1Width, canvas.height - 37, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 7 + btn1Width + 2, canvas.height - 37, text2Width + 12, 20);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX + 7 + btn1Width, canvas.height - 37, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2 + 7 + btn1Width, canvas.height - 37, text2Width + 12, 20);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX + 7 + btn1Width, canvas.height - 37, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                }

                if (button3.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2 + 14 + btn1Width + btn2Width, canvas.height - 37, text3Width + 12, 20);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX + 14 + btn1Width + btn2Width, canvas.height - 37, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 14 + 14 + btn1Width + btn2Width + text3Width, canvas.height - 37, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button3.name, btnX + 14 + btn1Width + btn2Width + xToCenterText3, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 14 + btn2Width + btn1Width + 2, canvas.height - 37, text3Width + 12, 20);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX + 14 + btn2Width + btn1Width, canvas.height - 37, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 14 + 14 + btn2Width + btn1Width + text3Width, canvas.height - 37, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button3.name, btnX + 14 + btn2Width + btn1Width + xToCenterText3, canvas.height - 34);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2 + 14 + btn1Width + btn2Width, canvas.height - 37, text3Width + 12, 20);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX + 14 + btn1Width + btn2Width, canvas.height - 37, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 14 + 14 + btn1Width + btn2Width + text3Width, canvas.height - 37, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button3.name, btnX + 14 + btn2Width + btn1Width + xToCenterText3, canvas.height - 34);
                }
            }
        }
    }





    async function winlh() {
        let symbolCodes = fonts["Tahoma"]["regular"]["black"];
        title = title.replaceAll(" ", " ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let whiteText = false;

        let Tahoma = new Image();
        await loadImageCallback(Tahoma, symbolCodes.src);

        let TahomaWhite = new Image();
        await loadImageCallback(TahomaWhite, fonts["Tahoma"]["regular"]["white"].src);

        let TahomaBold = new Image();
        await loadImageCallback(TahomaBold, fonts["Tahoma"]["bold"]["white"].src);

        let testCanvas = document.getElementById("test-canvas");
        const testCtx = testCanvas.getContext("2d");

        let SimSun;
        let SimSunWhite;

        for (const text of [content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                SimSun = new Image();
                await loadImageCallback(SimSun, fonts["SimSun"]["regular"]["black"].src);

                SimSunWhite = new Image();
                await loadImageCallback(SimSunWhite, fonts["SimSun"]["regular"]["white"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            let txtColor = whiteText ? "white" : "black";
            let spriteSheet;
            if (isBold) {
                spriteSheet = TahomaBold;
            } else {
                if (txtColor == "white") {
                    spriteSheet = TahomaWhite;
                } else if (txtColor == "black") {
                    spriteSheet = Tahoma;
                }
            }
            let symbolsData;
            for (let char of chars) {
                if (isCJ(char)) {
                    if (!isBold) {
                        spriteSheet = whiteText ? SimSunWhite : SimSun;
                        symbolsData = fonts["SimSun"]["regular"][txtColor].info;
                    } else {
                        char = "□"
                        symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"].info : fonts["Tahoma"]["regular"][txtColor].info;
                    }
                } else {
                    if (isBold) {
                        spriteSheet = TahomaBold;
                    } else {
                        if (txtColor == "white") {
                            spriteSheet = TahomaWhite;
                        } else if (txtColor == "black") {
                            spriteSheet = Tahoma;
                        }
                    }

                    symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"].info : fonts["Tahoma"]["regular"][txtColor].info;
                }
                let charData = symbolsData[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, charData.w, charData.h, x + charsWidth, y, charData.w, charData.h);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let x = 63;
        let testY = 32;
        const lineHeight = 13;

        const maxWidth = 286;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 60;
        if (longestLineW > 41) canvasWidth = longestLineW + 78;
        if (longestLineW > 286) canvasWidth = 364;
        if (lines.length <= 1 && button1.name) canvasHeight = testY + 77;
        if (lines.length <= 1 && !button1.name) canvasHeight = testY + 35;
        if (lines.length > 1 && !button1.name) canvasHeight = testY + 19;
        if (lines.length > 1 && button1.name) canvasHeight = testY + 56;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width <= 57) text1Width = 57;
                let btn1Width = text1Width + 16;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width <= 57) text2Width = 57;
                    let btn2Width = text2Width + 16;

                    return btn1Width + btn2Width + 8;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width <= 57) text2Width = 57;
                let btn2Width = text2Width + 16;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width <= 57) text3Width = 57;
                let btn3Width = text3Width + 16;

                return btn1Width + btn2Width + btn3Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 36 < btnsWidth) canvasWidth = btnsWidth + 36;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#e9e9e9";
        ctx.fillRect(3, 23, canvas.width, canvas.height);

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 13, 34, 34, 34);

        let frameLeftCorner = assets["frame-left-corner"];
        let frameRightCorner = assets[crossDisabled ? "frame-right-corner-no-cross" : "frame-right-corner"];
        let frameLeft = assets["frame-left-side"];
        let frameRight = assets["frame-right-side"];
        let frameBottomLeftCorner = assets["frame-bottom-left-corner"];
        let frameBottomRightCorner = assets["frame-bottom-right-corner"];
        let frameTop = assets["frame-top"];
        let frameBottom = assets["frame-bottom"];

        ctx.drawImage(assetsSS, frameLeftCorner.x, frameLeftCorner.y, frameLeftCorner.w, frameLeftCorner.h, 0, 0, frameLeftCorner.w, frameLeftCorner.h);
        ctx.drawImage(assetsSS, frameRightCorner.x, frameRightCorner.y, frameRightCorner.w, frameRightCorner.h, canvas.width - 20, 0, frameRightCorner.w, frameRightCorner.h);
        ctx.drawImage(assetsSS, frameTop.x, frameTop.y, frameTop.w, frameTop.h, 20, 0, canvas.width - 40, 23);
        ctx.drawImage(assetsSS, frameBottomLeftCorner.x, frameBottomLeftCorner.y, frameBottomLeftCorner.w, frameBottomLeftCorner.h, 0, canvas.height - 3, frameBottomLeftCorner.w, frameBottomLeftCorner.h);
        ctx.drawImage(assetsSS, frameLeft.x, frameLeft.y, frameLeft.w, frameLeft.h, 0, 23, 3, canvas.height - 25);
        ctx.drawImage(assetsSS, frameRight.x, frameRight.y, frameRight.w, frameRight.h, canvas.width - 3, 23, 3, canvas.height - 25);
        ctx.drawImage(assetsSS, frameBottomRightCorner.x, frameBottomRightCorner.y, frameBottomRightCorner.w, frameBottomRightCorner.h, canvas.width - 3, canvas.height - 3, frameBottomRightCorner.w, frameBottomRightCorner.h);
        ctx.drawImage(assetsSS, frameBottom.x, frameBottom.y, frameBottom.w, frameBottom.h, 3, canvas.height - 3, canvas.width - 5, 3);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 40 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        let y = 32;

        whiteText = false;
        for (let line of lines) {
            await drawBitmaps(ctx, line, x + 2, y + 2);
            y += lineHeight;
        }

        let btnLeft = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRight = assets["btn-right-side"];

        let btnRecLeft = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRight = assets["btn-rec-right-side"];

        let btnDisabledLeft = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRight = assets["btn-disabled-right-side"];

        if (button1.name) {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth <= 57) textWidth = 57;
                let btnWidth = textWidth + 16;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btnWidth) / 2);
                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 36, textWidth + 14, 21);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX, canvas.height - 36, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 16 + textWidth, canvas.height - 36, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 2, canvas.height - 36, textWidth + 14, 21);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX, canvas.height - 36, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 16 + textWidth, canvas.height - 36, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 36, textWidth + 14, 21);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX, canvas.height - 36, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 16 + textWidth, canvas.height - 36, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width <= 57) text1Width = 57;
                let btn1Width = text1Width + 16;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) + 2;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width <= 57) text2Width = 57;
                let btn2Width = text2Width + 16;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btn1Width - btn2Width - 8) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX, canvas.height - 36, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 16 + text1Width, canvas.height - 36, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX, canvas.height - 36, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 16 + text1Width, canvas.height - 36, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX, canvas.height - 36, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 16 + text1Width, canvas.height - 36, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                }

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX + 8 + btn1Width, canvas.height - 36, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 8 + btn1Width + 16 + text2Width, canvas.height - 36, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX + 8 + btn1Width, canvas.height - 36, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 8 + btn1Width + 16 + text2Width, canvas.height - 36, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX + 8 + btn1Width, canvas.height - 36, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 8 + btn1Width + 16 + text2Width, canvas.height - 36, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32);
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width <= 57) text1Width = 57;
                let btn1Width = text1Width + 16;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) + 2;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width <= 57) text2Width = 57;
                let btn2Width = text2Width + 16;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 2;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width <= 57) text3Width = 57;
                let btn3Width = text3Width + 16;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btn1Width - btn2Width - 16 - btn3Width) / 2);

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX, canvas.height - 36, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 16 + text1Width, canvas.height - 36, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX, canvas.height - 36, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 16 + text1Width, canvas.height - 36, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX, canvas.height - 36, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 16 + text1Width, canvas.height - 36, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                }

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX + 8 + btn1Width, canvas.height - 36, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 8 + btn1Width + 16 + text2Width, canvas.height - 36, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX + 8 + btn1Width, canvas.height - 36, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 8 + btn1Width + 16 + text2Width, canvas.height - 36, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX + 8 + btn1Width, canvas.height - 36, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 8 + btn1Width + 16 + text2Width, canvas.height - 36, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32);
                }

                if (button3.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, btnX + 8 + btn1Width + 8 + btn2Width + 2, canvas.height - 36, text3Width + 14, 21);
                    ctx.drawImage(assetsSS, btnDisabledLeft.x, btnDisabledLeft.y, btnDisabledLeft.w, btnDisabledLeft.h, btnX + 8 + btn1Width + 8 + btn2Width, canvas.height - 36, btnDisabledLeft.w, btnDisabledLeft.h);
                    ctx.drawImage(assetsSS, btnDisabledRight.x, btnDisabledRight.y, btnDisabledRight.w, btnDisabledRight.h, btnX + 8 + btn1Width + 8 + btn2Width + 16 + text3Width, canvas.height - 36, btnDisabledRight.w, btnDisabledRight.h);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button3.name, btnX + 8 + btn1Width + 8 + btn2Width + xToCenterText3, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, btnX + 8 + btn1Width + 8 + btn2Width + 2, canvas.height - 36, text3Width + 14, 21);
                    ctx.drawImage(assetsSS, btnRecLeft.x, btnRecLeft.y, btnRecLeft.w, btnRecLeft.h, btnX + 8 + btn1Width + 8 + btn2Width, canvas.height - 36, btnRecLeft.w, btnRecLeft.h);
                    ctx.drawImage(assetsSS, btnRecRight.x, btnRecRight.y, btnRecRight.w, btnRecRight.h, btnX + 8 + btn1Width + 8 + btn2Width + 16 + text3Width, canvas.height - 36, btnRecRight.w, btnRecRight.h);
                    await drawBitmaps(ctx, button3.name, btnX + 8 + btn1Width + 8 + btn2Width + xToCenterText3, canvas.height - 32);
                } else {
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, btnX + 8 + btn1Width + 8 + btn2Width + 2, canvas.height - 36, text3Width + 14, 21);
                    ctx.drawImage(assetsSS, btnLeft.x, btnLeft.y, btnLeft.w, btnLeft.h, btnX + 8 + btn1Width + 8 + btn2Width, canvas.height - 36, btnLeft.w, btnLeft.h);
                    ctx.drawImage(assetsSS, btnRight.x, btnRight.y, btnRight.w, btnRight.h, btnX + 8 + btn1Width + 8 + btn2Width + 16 + text3Width, canvas.height - 36, btnRight.w, btnRight.h);
                    await drawBitmaps(ctx, button3.name, btnX + 8 + btn1Width + 8 + btn2Width + xToCenterText3, canvas.height - 32);
                }
            }
        }

        testCanvas.width = !testBitmaps(title, true) ? 1 : testBitmaps(title, true) + 18;
        testCanvas.height = 23;

        testCtx.shadowColor = 'rgba(0,0,0)';
        testCtx.shadowOffsetX = 0;
        testCtx.shadowOffsetY = 0;
        testCtx.shadowBlur = 2;

        whiteText = true;
        await drawBitmaps(testCtx, title, 6, 6, true)
        await drawBitmaps(testCtx, title, 6, 6, true)
    }



    async function winvista() {
        let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
        title = title.replaceAll(" ", " ").replaceAll("！", "! ").replaceAll("？", "? ").replaceAll("（", " (").replaceAll("）", ") ").replaceAll("．", ". ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ").replaceAll("！", "! ").replaceAll("？", "? ").replaceAll("（", " (").replaceAll("）", ") ").replaceAll("．", ". ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let SegoeUI = new Image();
        await loadImageCallback(SegoeUI, symbolCodes.src);

        let MSUIGothic;

        for (const text of [title, content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                MSUIGothic = new Image();
                await loadImageCallback(MSUIGothic, fonts["MSUIGothic"]["regular"]["black"].src);
                break;
            } else {
                continue;
            }
        }

        iconSS = new Image();
        await loadImageCallback(iconSS, assetsArray["win7"].src);
        iconInfo = assetsArray["win7"].assets[`i-${iconID}`];

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let spriteSheet = isCJ(char) ? MSUIGothic : SegoeUI;
                let symbolsData = isCJ(char) ? fonts["MSUIGothic"]["regular"]["black"] : symbolCodes;
                let charData = symbolsData.info[char.charCodeAt(0)];
                ctx.globalAlpha = a;
                ctx.drawImage(spriteSheet, charData.x, charData.y, isCJ(char) ? charData.w : 18, isCJ(char) ? charData.h : 16, x + charsWidth, y, isCJ(char) ? charData.w : 18, isCJ(char) ? charData.h : 16);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let x = 57;
        let testY = 44;
        const lineHeight = 15;

        const maxWidth = 430;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 180;
        let canvasHeight = testY + 64 + 13;
        if (longestLineW > canvasWidth - 83) canvasWidth = longestLineW + 83;
        if (lines.length > 1 && button1.name) canvasHeight = canvasHeight - 15;
        if (button1.name && lines.length <= 1) canvasHeight = canvasHeight + 6;
        if (lines.length > 1 && !button1.name) canvasHeight = canvasHeight - 50;
        if (lines.length <= 1 && !button1.name) canvasHeight = canvasHeight - 42;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;
                let btn1Width = text1Width + 10;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width < 56) text2Width = 56;
                    let btn2Width = text2Width + 10;

                    return btn1Width + btn2Width + 8;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;
                let btn2Width = text2Width + 10;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 56) text3Width = 56;
                let btn3Width = text3Width + 10;

                return btn1Width + btn2Width + btn3Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 68 < btnsWidth) canvasWidth = btnsWidth + 68;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        let basicLeftCorner = assets["basic-frame-left-corner"];
        let basicRightCorner = assets["basic-frame-right-corner"];
        let basicLeftSide = assets["basic-frame-left-light"];
        let basicRightSide = assets["basic-frame-right-light"];
        let basicLeftSideGradient = assets["basic-frame-left-gradient"];
        let basicRightSideGradient = assets["basic-frame-right-gradient"];
        let basicLeftDark = assets["basic-frame-left-dark"];
        let basicRightDark = assets["basic-frame-right-dark"];
        let basicBottomLeft = assets["basic-frame-bottom-left-corner"];
        let basicBottomRight = assets["basic-frame-bottom-right-corner"];
        let basicBottom = assets["basic-frame-bottom"];
        let basicTop = assets["basic-frame-top"];

        let cross = crossDisabled ? assets["basic-cross-disabled"] : assets["basic-cross"];

        ctx.drawImage(assetsSS, basicLeftCorner.x, basicLeftCorner.y, basicLeftCorner.w, basicLeftCorner.h, 0, 0, basicLeftCorner.w, basicLeftCorner.h);
        ctx.drawImage(assetsSS, basicTop.x, basicTop.y, basicTop.w, basicTop.h, 8, 0, canvas.width - 14, 30);
        ctx.drawImage(assetsSS, basicRightCorner.x, basicRightCorner.y, basicRightCorner.w, basicRightCorner.h, canvas.width - 8, 0, basicRightCorner.w, basicRightCorner.h);
        if (!(canvas.height - 129 <= 1)) {
            ctx.drawImage(assetsSS, basicLeftSide.x, basicLeftSide.y, basicLeftSide.w, basicLeftSide.h, 0, 121, 8, canvas.height - 129);
            ctx.drawImage(assetsSS, basicRightSide.x, basicRightSide.y, basicRightSide.w, basicRightSide.h, canvas.width - 8, 121, 8, canvas.height - 129);
        }
        ctx.drawImage(assetsSS, basicLeftDark.x, basicLeftDark.y, basicLeftDark.w, basicLeftDark.h, 0, 30, 8, 23);
        ctx.drawImage(assetsSS, basicLeftSideGradient.x, basicLeftSideGradient.y, basicLeftSideGradient.w, basicLeftSideGradient.h, 0, 53, basicLeftSideGradient.w, basicLeftSideGradient.h);
        ctx.drawImage(assetsSS, basicLeftSide.x, basicLeftSide.y, basicLeftSide.w, basicLeftSide.h, 0, 121, 8, canvas.height - 128);

        ctx.drawImage(assetsSS, basicRightDark.x, basicRightDark.y, basicRightDark.w, basicRightDark.h, canvas.width - 8, 30, 8, 23);
        ctx.drawImage(assetsSS, basicRightSideGradient.x, basicRightSideGradient.y, basicRightSideGradient.w, basicRightSideGradient.h, canvas.width - 8, 53, basicRightSideGradient.w, basicRightSideGradient.h);
        ctx.drawImage(assetsSS, basicRightSide.x, basicRightSide.y, basicRightSide.w, basicRightSide.h, canvas.width - 8, 121, 8, canvas.height - 128);

        ctx.drawImage(assetsSS, basicBottomLeft.x, basicBottomLeft.y, basicBottomLeft.w, basicBottomLeft.h, 0, canvas.height - 8, basicBottomLeft.w, basicBottomLeft.h);
        ctx.drawImage(assetsSS, basicBottom.x, basicBottom.y, basicBottom.w, basicBottom.h, 8, canvas.height - 8, canvas.width - 14, 8);
        ctx.drawImage(assetsSS, basicBottomRight.x, basicBottomRight.y, basicBottomRight.w, basicBottomRight.h, canvas.width - 8, canvas.height - 8, basicBottomRight.w, basicBottomRight.h);

        ctx.drawImage(assetsSS, cross.x, cross.y, cross.w, cross.h, canvas.width - 41, 10, cross.w, cross.h);

        ctx.fillStyle = "white";
        ctx.fillRect(8, 30, canvas.width - 16, canvas.height - 38)

        ctx.drawImage(iconSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 17, 41, iconInfo.w, iconInfo.h);

        let y = 44;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y);
            y += lineHeight;
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i));
            if (chunkWidth + 115 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 9, 10);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name) {
            let btnRowBG = assets["btn-row-bg"];
            ctx.drawImage(assetsSS, btnRowBG.x, btnRowBG.y, btnRowBG.w, btnRowBG.h, 8, canvas.height - 49, canvas.width - 16, 41);

            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 56) textWidth = 56;

                let btnWidth = textWidth + 10;
                let xToCenterText = Math.round((btnWidth - textWidthFixed) / 2) + 1;

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 22 - btnWidth, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 22 - btnWidth + 2, canvas.height - 39, textWidth + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 12 - btnWidth + textWidth, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btnWidth + xToCenterText, canvas.height - 36, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 22 - btnWidth, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 22 - btnWidth + 3, canvas.height - 39, textWidth + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 12 - btnWidth + textWidth, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btnWidth + xToCenterText, canvas.height - 36);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 22 - btnWidth, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 22 - btnWidth + 3, canvas.height - 39, textWidth + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 12 - btnWidth + textWidth, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btnWidth + xToCenterText, canvas.height - 36);
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;

                let btn1Width = text1Width + 10;
                let xToCenterText1 = Math.round((btn1Width - text1WidthFixed) / 2) + 1;

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 22 - btn1Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 22 - btn1Width + 2, canvas.height - 39, text1Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 12 - btn1Width + text1Width, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btn1Width + xToCenterText1, canvas.height - 36, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 22 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 22 - btn1Width + 3, canvas.height - 39, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 12 - btn1Width + text1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btn1Width + xToCenterText1, canvas.height - 36);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 22 - btn1Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 22 - btn1Width + 3, canvas.height - 39, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 12 - btn1Width + text1Width, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btn1Width + xToCenterText1, canvas.height - 36);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;

                let btn2Width = text2Width + 10;
                let xToCenterText2 = Math.round((btn2Width - text2WidthFixed) / 2) + 1;

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 22 - btn2Width - 8 - btn1Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 22 - btn2Width - 8 - btn1Width + 2, canvas.height - 39, text2Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 12 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button2.name, canvas.width - 23 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 36, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 22 - btn2Width - 8 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 22 - btn2Width - 8 - btn1Width + 3, canvas.height - 39, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 12 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 23 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 36);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 22 - btn2Width - 8 - btn1Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 22 - btn2Width - 8 - btn1Width + 3, canvas.height - 39, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 12 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 23 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 36);
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;

                let btn1Width = text1Width + 10;
                let xToCenterText1 = Math.round((btn1Width - text1WidthFixed) / 2) + 1;

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 22 - btn1Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 22 - btn1Width + 2, canvas.height - 39, text1Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 12 - btn1Width + text1Width, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btn1Width + xToCenterText1, canvas.height - 36, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 22 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 22 - btn1Width + 3, canvas.height - 39, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 12 - btn1Width + text1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btn1Width + xToCenterText1, canvas.height - 36);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 22 - btn1Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 22 - btn1Width + 3, canvas.height - 39, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 12 - btn1Width + text1Width, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 23 - btn1Width + xToCenterText1, canvas.height - 36);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;

                let btn2Width = text2Width + 10;
                let xToCenterText2 = Math.round((btn2Width - text2WidthFixed) / 2) + 1;

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 22 - btn2Width - 8 - btn1Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 22 - btn2Width - 8 - btn1Width + 2, canvas.height - 39, text2Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 12 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button2.name, canvas.width - 23 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 36, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 22 - btn2Width - 8 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 22 - btn2Width - 8 - btn1Width + 3, canvas.height - 39, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 12 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 23 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 36);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 22 - btn2Width - 8 - btn1Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 22 - btn2Width - 8 - btn1Width + 3, canvas.height - 39, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 12 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 23 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 36);
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 56) text3Width = 56;

                let btn3Width = text3Width + 10;
                let xToCenterText3 = Math.round((btn3Width - text3WidthFixed) / 2);

                if (button3.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 22 - btn3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 22 - btn3Width - 8 - btn1Width - 8 - btn2Width + 2, canvas.height - 39, text3Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 12 - btn3Width + text3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button3.name, canvas.width - 23 - btn3Width + xToCenterText3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 36, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 22 - btn3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 22 - btn3Width - 8 - btn1Width - 8 - btn2Width + 3, canvas.height - 39, text3Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 12 - btn3Width + text3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 23 - btn3Width + xToCenterText3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 36);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 22 - btn3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 22 - btn3Width - 8 - btn1Width - 8 - btn2Width + 3, canvas.height - 39, text3Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 12 - btn3Width + text3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 23 - btn3Width + xToCenterText3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 36);
                }
            }
        }
    }




    async function win7() {
        let testCanvas = document.getElementById("test-canvas");
        const testCtx = testCanvas.getContext("2d");

        let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
        title = title.replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let SegoeUI = new Image();
        await loadImageCallback(SegoeUI, symbolCodes.src);

        let MSUIGothic;

        for (const text of [title, content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                MSUIGothic = new Image();
                await loadImageCallback(MSUIGothic, fonts["MSUIGothic"]["regular"]["black"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let spriteSheet = isCJ(char) ? MSUIGothic : SegoeUI;
                let symbolsData = isCJ(char) ? fonts["MSUIGothic"]["regular"]["black"] : symbolCodes;
                let charData = symbolsData.info[char.charCodeAt(0)];
                let xOffset = isCJ(char) ? 3 : 0;
                let yOffset = isCJ(char) ? 2 : 0;
                ctx.globalAlpha = a;
                ctx.drawImage(
                    spriteSheet,
                    charData.x,
                    charData.y,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16,
                    x + charsWidth + xOffset,
                    y + yOffset,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let x = 70;
        let testY = 56;
        const lineHeight = 15;

        const maxWidth = 430;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 180;
        let canvasHeight = testY + 85 + 13;
        if (longestLineW > canvasWidth - 108) canvasWidth = longestLineW + 108;
        if (lines.length > 1 && button1.name) canvasHeight = canvasHeight - 16;
        if (lines.length > 1 && !button1.name) canvasHeight = canvasHeight - 50;
        if (lines.length <= 1 && !button1.name) canvasHeight = canvasHeight - 21;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;
                let btn1Width = text1Width + 10;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width < 56) text2Width = 56;
                    let btn2Width = text2Width + 10;

                    return btn1Width + btn2Width + 8;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;
                let btn2Width = text2Width + 10;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 56) text3Width = 56;
                let btn3Width = text3Width + 10;

                return btn1Width + btn2Width + btn3Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 68 < btnsWidth) canvasWidth = btnsWidth + 68;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        let aeroLeftCorner = assets["aero-left-corner"];
        let aeroRightCorner = assets[crossDisabled ? "aero-right-corner-no-cross" : "aero-right-corner"];
        let aeroRightSide = assets["aero-right-side"];
        let aeroLeftSide = assets["aero-left-side"];
        let aeroLeftSideGradient = assets["aero-left-side-gradient"];
        let aeroRightSideGradient = assets["aero-right-side-gradient"];
        let aeroLeftDark = assets["aero-left-dark"];
        let aeroRightDark = assets["aero-right-dark"];
        let aeroBottomLeft = assets["aero-bottom-left-corner"];
        let aeroBottomRight = assets["aero-bottom-right-corner"];
        let aeroBottom = assets["aero-bottom"];
        let aeroTop = assets["aero-top"];

        ctx.drawImage(assetsSS, aeroLeftCorner.x, aeroLeftCorner.y, aeroLeftCorner.w, aeroLeftCorner.h, 0, 0, aeroLeftCorner.w, aeroLeftCorner.h);
        ctx.drawImage(assetsSS, aeroRightCorner.x, aeroRightCorner.y, aeroRightCorner.w, aeroRightCorner.h, canvas.width - 73, 0, aeroRightCorner.w, aeroRightCorner.h);
        ctx.drawImage(assetsSS, aeroTop.x, aeroTop.y, aeroTop.w, aeroTop.h, 57, 0, canvas.width - 130, 42);
        ctx.drawImage(assetsSS, aeroLeftSideGradient.x, aeroLeftSideGradient.y, aeroLeftSideGradient.w, aeroLeftSideGradient.h, 0, 42, aeroLeftSideGradient.w, aeroLeftSideGradient.h);
        ctx.drawImage(assetsSS, aeroLeftSide.x, aeroLeftSide.y, aeroLeftSide.w, aeroLeftSide.h, 0, 58, 21, canvas.height - 133);
        ctx.drawImage(assetsSS, aeroRightSide.x, aeroRightSide.y, aeroRightSide.w, aeroRightSide.h, canvas.width - 25, 58, 25, canvas.height - 133);
        ctx.drawImage(assetsSS, aeroLeftDark.x, aeroLeftDark.y, aeroLeftDark.w, aeroLeftDark.h, 0, canvas.height - 75, aeroLeftDark.w, aeroLeftDark.h);
        ctx.drawImage(assetsSS, aeroRightDark.x, aeroRightDark.y, aeroRightDark.w, aeroRightDark.h, canvas.width - 25, canvas.height - 75, aeroRightDark.w, aeroRightDark.h);
        ctx.drawImage(assetsSS, aeroBottomLeft.x, aeroBottomLeft.y, aeroBottomLeft.w, aeroBottomLeft.h, 0, canvas.height - 26, aeroBottomLeft.w, aeroBottomLeft.h);
        ctx.drawImage(assetsSS, aeroBottomRight.x, aeroBottomRight.y, aeroBottomRight.w, aeroBottomRight.h, canvas.width - 25, canvas.height - 26, aeroBottomRight.w, aeroBottomRight.h);
        ctx.drawImage(assetsSS, aeroBottom.x, aeroBottom.y, aeroBottom.w, aeroBottom.h, 21, canvas.height - 26, canvas.width - 21 - (canvas.width >= 339 ? 24 : 25), 26);
        ctx.drawImage(assetsSS, aeroRightSideGradient.x, aeroRightSideGradient.y, aeroRightSideGradient.w, aeroRightSideGradient.h, canvas.width - 25, 42, aeroRightSideGradient.w, aeroRightSideGradient.h);

        ctx.fillStyle = "white";
        ctx.fillRect(21, 42, canvas.width - 46, canvas.height - 68)

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 30, 51, iconInfo.w, iconInfo.h);

        let y = 56;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y);
            y += lineHeight;
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i));
            if (chunkWidth + 115 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        testCanvas.width = testBitmaps(title) ? testBitmaps(title) + 40 : 1;
        testCanvas.height = 50;

        if (testBitmaps(title)) {
            testCtx.shadowColor = 'rgba(255,255,255)';
            testCtx.shadowOffsetX = 0;
            testCtx.shadowOffsetY = 0;
            testCtx.shadowBlur = 9;
            await drawBitmaps(testCtx, title, 19, 19);
            await drawBitmaps(testCtx, title, 19, 19);
            await drawBitmaps(testCtx, title, 19, 19);
        }

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name) {
            let btnRowBG = assets["btn-row-bg"];
            ctx.drawImage(assetsSS, btnRowBG.x, btnRowBG.y, btnRowBG.w, btnRowBG.h, 21, canvas.height - 67, canvas.width - 46, 41);

            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 56) textWidth = 56;

                let btnWidth = textWidth + 10;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) + 2;

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 36 - btnWidth, canvas.height - 57, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 36 - btnWidth + 2, canvas.height - 57, textWidth + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 26 - btnWidth + textWidth, canvas.height - 57, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btnWidth + xToCenterText, canvas.height - 54, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 36 - btnWidth, canvas.height - 57, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 36 - btnWidth + 3, canvas.height - 57, textWidth + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 26 - btnWidth + textWidth, canvas.height - 57, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btnWidth + xToCenterText, canvas.height - 54);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 36 - btnWidth, canvas.height - 57, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 36 - btnWidth + 3, canvas.height - 57, textWidth + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 26 - btnWidth + textWidth, canvas.height - 57, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btnWidth + xToCenterText, canvas.height - 54);
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;

                let btn1Width = text1Width + 10;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) + 2;

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 36 - btn1Width, canvas.height - 57, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 36 - btn1Width + 2, canvas.height - 57, text1Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 54, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 36 - btn1Width, canvas.height - 57, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 54);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 36 - btn1Width, canvas.height - 57, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 54);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;

                let btn2Width = text2Width + 10;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 2;

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 36 - btn2Width + 2 - 8 - btn1Width, canvas.height - 57, text2Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 54, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 54);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 54);
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;

                let btn1Width = text1Width + 10;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) + 2;

                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 36 - btn1Width, canvas.height - 57, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 36 - btn1Width + 2, canvas.height - 57, text1Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 54, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 36 - btn1Width, canvas.height - 57, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 54);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 36 - btn1Width, canvas.height - 57, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 54);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;

                let btn2Width = text2Width + 10;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 2;

                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 36 - btn2Width + 2 - 8 - btn1Width, canvas.height - 57, text2Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 54, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 54);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - btn2Width + xToCenterText2 - 8 - btn1Width, canvas.height - 54);
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 56) text3Width = 56;

                let btn3Width = text3Width + 10;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) + 2;

                if (button3.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 36 - btn3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 36 - btn3Width + 2 - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, text3Width + 8, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 26 - btn3Width + text3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button3.name, canvas.width - 38 - btn3Width + xToCenterText3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 54, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 36 - btn3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 36 - btn3Width + 3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, text3Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 26 - btn3Width + text3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, btnRecRightSide.w, btnRecRightSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 38 - btn3Width + xToCenterText3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 54);
                } else {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 36 - btn3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 36 - btn3Width + 3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, text3Width + 7, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 26 - btn3Width + text3Width - 8 - btn1Width - 8 - btn2Width, canvas.height - 57, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 38 - btn3Width + xToCenterText3 - 8 - btn1Width - 8 - btn2Width, canvas.height - 54);
                }
            }
        }
    }







    async function win8() {
        let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
        let SegoeUILargeInfo = fonts["SegoeUI_11pt"]["regular"]["black"];
        title = title.replaceAll(" ", " ");
        title.split("").forEach(char => {
            let arrayChar = SegoeUILargeInfo.info[char.charCodeAt(0)];
            if (!arrayChar) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        content.split("").forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let SegoeUI = new Image();
        await loadImageCallback(SegoeUI, symbolCodes.src);

        let SegoeUILarge = new Image();
        await loadImageCallback(SegoeUILarge, SegoeUILargeInfo.src);

        let MSUIGothic;

        for (const text of [content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                MSUIGothic = new Image();
                await loadImageCallback(MSUIGothic, fonts["MSUIGothic"]["regular"]["black"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let spriteSheet = isCJ(char) ? MSUIGothic : SegoeUI;
                let symbolsData = isCJ(char) ? fonts["MSUIGothic"]["regular"]["black"] : symbolCodes;
                let charData = symbolsData.info[char.charCodeAt(0)];
                let xOffset = isCJ(char) ? 3 : 0;
                let yOffset = isCJ(char) ? 2 : 0;
                ctx.globalAlpha = a;
                ctx.drawImage(
                    spriteSheet,
                    charData.x,
                    charData.y,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16,
                    x + charsWidth + xOffset,
                    y + yOffset,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        async function drawTitle(ctx, content, x, y) {
            let chars = content.split("");
            let charsWidth = 0;
            let symbolsData = SegoeUILargeInfo;
            for (const char of chars) {
                let charData = symbolsData.info[char.charCodeAt(0)];
                ctx.drawImage(SegoeUILarge, charData.x, charData.y, 24, 23, x + charsWidth, y, 24, 23);
                charsWidth += charData.w + 2;
            }
        }

        let x = 58;
        let testY = 46;
        const lineHeight = 15;

        const maxWidth = 494;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 136;
        let canvasHeight = testY + 85;
        if (longestLineW > canvasWidth - 79) canvasWidth = longestLineW + 79;
        if (button1.name && lines.length > 1) canvasHeight = canvasHeight - 20;
        if (button1.name && lines.length <= 1) canvasHeight = canvasHeight - 5;
        if (!button1.name && lines.length > 1) canvasHeight = canvasHeight - 62;
        if (!button1.name && lines.length <= 1) canvasHeight = canvasHeight - 54;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width < 36) text2Width = 36;
                    let btn2Width = text2Width + 30;

                    return btn1Width + btn2Width + 8;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;

                return btn1Width + btn2Width + btn3Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 38 < btnsWidth) canvasWidth = btnsWidth + 38;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(8, 31, canvas.width - 16, canvas.height - 39)

        if (button1.name) {
            ctx.fillStyle = 'rgba(223,223,223)';
            ctx.fillRect(8, canvas.height - 49, canvas.width - 16, 1);
            ctx.fillStyle = 'rgba(240,240,240)';
            ctx.fillRect(8, canvas.height - 48, canvas.width - 16, 40);
        }

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, 31);
        ctx.fillRect(0, canvas.height - 8, canvas.width, 8);
        ctx.fillRect(0, 31, 8, canvas.height);
        ctx.fillRect(canvas.width - 8, 31, 8, canvas.height);

        ctx.strokeStyle = 'rgba(0,0,0,.24)';
        ctx.fillStyle = 'rgba(0,0,0,.24)';
        ctx.lineWidth = 2;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
        ctx.fillRect(7, 30, canvas.width - 14, 1);
        ctx.fillRect(7, 31, 1, canvas.height - 39);
        ctx.fillRect(7, 31 + canvas.height - 39, canvas.width - 14, 1);
        ctx.fillRect(8 + canvas.width - 16, 31, 1, canvas.height - 39);

        let cross = assets["cross"];
        ctx.globalAlpha = crossDisabled ? .5 : 1;
        ctx.drawImage(assetsSS, cross.x, cross.y, cross.w, cross.h, canvas.width - 38, 1, cross.w, cross.h);
        ctx.globalAlpha = 1;

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 17, 40, iconInfo.w, iconInfo.h);

        let y = 46;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y);
            y += lineHeight;
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), false, true);
            if (chunkWidth + 95 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        let titleWidth = testBitmaps(title, false, true);
        let titleX = Math.round((canvas.width - titleWidth) / 2) - 4;
        await drawTitle(ctx, title, titleX, 3);

        if (button1.name) {
            let btnLeftSide = assets["btn-left-side"];
            let btnMiddle = assets["btn-middle"];
            let btnRightSide = assets["btn-right-side"];

            let btnDisabledLeftSide = assets["btn-disabled-left-side"];
            let btnDisabledMiddle = assets["btn-disabled-middle"];
            let btnDisabledRightSide = assets["btn-disabled-right-side"];

            let btnRecLeftSide = assets["btn-rec-left-side"];
            let btnRecMiddle = assets["btn-rec-middle"];
            let btnRecRightSide = assets["btn-rec-right-side"];

            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 36) textWidth = 36;
                let btnWidth = textWidth + 30;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 4;

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 17 - btnWidth, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 17 - btnWidth + 2, canvas.height - 39, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 19, canvas.height - 39, btnRecRightSide.w, btnRecRightSide.h);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 17 - btnWidth, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 17 - btnWidth + 2, canvas.height - 39, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 19, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 17 - btnWidth, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 17 - btnWidth + 2, canvas.height - 39, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 19, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                }
                await drawBitmaps(ctx, button1.name, canvas.width - 15 - btnWidth + xToCenterText, canvas.height - 36, button1.disabled ? .45 : 1);
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 4;

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 17 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 19, canvas.height - 39, btnRecRightSide.w, btnRecRightSide.h);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 17 - btn1Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 19, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 17 - btn1Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 19, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                }
                await drawBitmaps(ctx, button1.name, canvas.width - 15 - btn1Width + xToCenterText1, canvas.height - 36, button1.disabled ? .45 : 1);

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 4;

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 8 - btn1Width - 19, canvas.height - 39, btnRecRightSide.w, btnRecRightSide.h);
                } else if (!button2.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn1Width - 19, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn1Width - 19, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                }
                await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 15 - btn2Width + xToCenterText2, canvas.height - 36, button2.disabled ? .45 : 1);
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 4;

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 17 - btn1Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 19, canvas.height - 39, btnRecRightSide.w, btnRecRightSide.h);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 17 - btn1Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 19, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 17 - btn1Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 19, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                }
                await drawBitmaps(ctx, button1.name, canvas.width - 15 - btn1Width + xToCenterText1, canvas.height - 36, button1.disabled ? .45 : 1);

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 4;

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 8 - btn1Width - 19, canvas.height - 39, btnRecRightSide.w, btnRecRightSide.h);
                } else if (!button2.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn1Width - 19, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn1Width - 19, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                }
                await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 15 - btn2Width + xToCenterText2, canvas.height - 36, button2.disabled ? .45 : 1);

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) - 4;

                if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width, canvas.height - 39, btnRecLeftSide.w, btnRecLeftSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width + 2, canvas.height - 39, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 19, canvas.height - 39, btnRecRightSide.w, btnRecRightSide.h);
                } else if (!button3.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width, canvas.height - 39, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width + 2, canvas.height - 39, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 19, canvas.height - 39, btnRightSide.w, btnRightSide.h);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width, canvas.height - 39, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width + 2, canvas.height - 39, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 19, canvas.height - 39, btnDisabledRightSide.w, btnDisabledRightSide.h);
                }
                await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 15 - btn3Width + xToCenterText3, canvas.height - 36, button3.disabled ? .45 : 1);
            }
        }
    }





    async function win10() {
        let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
        title = title.replaceAll(" ", " ").replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ").replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let SegoeUI = new Image();
        await loadImageCallback(SegoeUI, symbolCodes.src);

        let MSUIGothic;

        for (const text of [title, content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                MSUIGothic = new Image();
                await loadImageCallback(MSUIGothic, fonts["MSUIGothic"]["regular"]["black"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let spriteSheet = isCJ(char) ? MSUIGothic : SegoeUI;
                let symbolsData = isCJ(char) ? fonts["MSUIGothic"]["regular"]["black"] : symbolCodes;
                let charData = symbolsData.info[char.charCodeAt(0)];
                let xOffset = isCJ(char) ? 3 : 0;
                let yOffset = isCJ(char) ? 2 : 0;
                ctx.globalAlpha = a;
                ctx.drawImage(
                    spriteSheet,
                    charData.x,
                    charData.y,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16,
                    x + charsWidth + xOffset,
                    y + yOffset,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let x = 68;
        let testY = 62;
        const lineHeight = 15;

        const maxWidth = 490;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 158;
        let canvasHeight = testY + 96;
        if (longestLineW > canvasWidth - 105) canvasWidth = longestLineW + 105;
        if (lines.length > 1 && button1.name) canvasHeight = canvasHeight - 16;
        if (lines.length > 1 && !button1.name) canvasHeight = canvasHeight - 57;
        if (lines.length <= 1 && !button1.name) canvasHeight = canvasHeight - 42;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width < 36) text2Width = 36;
                    let btn2Width = text2Width + 30;

                    return btn1Width + btn2Width + 8;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;

                return btn1Width + btn2Width + btn3Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 64 < btnsWidth) canvasWidth = btnsWidth + 64;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#ffffff";

        let frameLeftCorner = assets["frame-left-corner"];
        let frameRightCorner = assets["frame-right-corner"];
        let frameLeftSide = assets["frame-left-side"];
        let frameRightSide = assets["frame-right-side"];
        let frameTop = assets["frame-top"];
        let frameBottom = assets["frame-bottom"];
        let frameBottomLeftCorner = assets["frame-bottom-left-corner"];
        let frameBottomRightCorner = assets["frame-bottom-right-corner"];
        let cross = assets["cross"];

        ctx.drawImage(assetsSS, frameLeftCorner.x, frameLeftCorner.y, frameLeftCorner.w, frameLeftCorner.h, 0, 0, frameLeftCorner.w, frameLeftCorner.h);
        ctx.drawImage(assetsSS, frameTop.x, frameTop.y, frameTop.w, frameTop.h, 18, 0, canvas.width - 40, 17);
        ctx.drawImage(assetsSS, frameRightCorner.x, frameRightCorner.y, frameRightCorner.w, frameRightCorner.h, canvas.width - 22, 0, frameRightCorner.w, frameRightCorner.h);
        ctx.drawImage(assetsSS, frameLeftSide.x, frameLeftSide.y, frameLeftSide.w, frameLeftSide.h, 0, 17, 18, canvas.height - 41);
        ctx.drawImage(assetsSS, frameRightSide.x, frameRightSide.y, frameRightSide.w, frameRightSide.h, canvas.width - 22, 17, 22, canvas.height - 41);
        ctx.drawImage(assetsSS, frameBottomLeftCorner.x, frameBottomLeftCorner.y, frameBottomLeftCorner.w, frameBottomLeftCorner.h, 0, canvas.height - 24, frameBottomLeftCorner.w, frameBottomLeftCorner.h);
        ctx.drawImage(assetsSS, frameBottomRightCorner.x, frameBottomRightCorner.y, frameBottomRightCorner.w, frameBottomRightCorner.h, canvas.width - 22, canvas.height - 24, frameBottomRightCorner.w, frameBottomRightCorner.h);
        ctx.drawImage(assetsSS, frameBottom.x, frameBottom.y, frameBottom.w, frameBottom.h, 18, canvas.height - 24, canvas.width - 40, 24);

        let y = 62;

        ctx.fillRect(18, 17, canvas.width - 40, canvas.height - 41)

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i));
            if (chunkWidth + 95 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 24, 24);

        if (crossDisabled) ctx.globalAlpha = .41;
        ctx.drawImage(assetsSS, cross.x, cross.y, cross.w, cross.h, canvas.width - 47, 26, cross.w, cross.h);
        ctx.globalAlpha = 1;

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 28, 57, 32, 32);

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y);
            y += lineHeight;
        }

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name) {
            ctx.fillStyle = 'rgba(224,224,224)';
            ctx.fillRect(18, canvas.height - 65, canvas.width - 40, 41);
            ctx.fillStyle = 'rgba(240,240,240)';
            ctx.fillRect(18, canvas.height - 64, canvas.width - 40, 40);
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 36) textWidth = 36;
                let btnWidth = textWidth + 30;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 2;

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 33 - btnWidth, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 33 - btnWidth + 2, canvas.height - 55, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 33 - 2, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btnWidth + xToCenterText, canvas.height - 52);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 33 - btnWidth, canvas.height - 55, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 33 - btnWidth + 2, canvas.height - 55, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 33 - 2, canvas.height - 55, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btnWidth + xToCenterText, canvas.height - 52);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 33 - btnWidth, canvas.height - 55, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 33 - btnWidth + 2, canvas.height - 55, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 33 - 2, canvas.height - 55, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btnWidth + xToCenterText, canvas.height - 52, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 2;

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 33 - btn1Width, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 33 - 2, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 52);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 33 - btn1Width, canvas.height - 55, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 33 - 2, canvas.height - 55, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 52);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 33 - btn1Width, canvas.height - 55, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 33 - 2, canvas.height - 55, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 52, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 2;

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 8 - btn1Width - 33 - btn2Width, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn1Width - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 33 - btn2Width + xToCenterText2, canvas.height - 52);
                } else if (!button2.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn1Width - 33 - btn2Width, canvas.height - 55, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn1Width - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 33 - btn2Width + xToCenterText2, canvas.height - 52);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn1Width - 33 - btn2Width, canvas.height - 55, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn1Width - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 33 - btn2Width + xToCenterText2, canvas.height - 52, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 2;

                if (button1.rec) {
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 33 - btn1Width, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 33 - 2, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 52);
                } else if (!button1.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 33 - btn1Width, canvas.height - 55, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 33 - 2, canvas.height - 55, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 52);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 33 - btn1Width, canvas.height - 55, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 33 - 2, canvas.height - 55, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 52, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 2;

                if (button2.rec) {
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 8 - btn1Width - 33 - btn2Width, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn1Width - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 33 - btn2Width + xToCenterText2, canvas.height - 52);
                } else if (!button2.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn1Width - 33 - btn2Width, canvas.height - 55, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn1Width - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 33 - btn2Width + xToCenterText2, canvas.height - 52);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn1Width - 33 - btn1Width, canvas.height - 55, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn1Width - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 33 - btn2Width + xToCenterText2, canvas.height - 52, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) - 2;

                if (button3.rec) {
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width + 2, canvas.height - 55, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRecSide.x, btnRecSide.y, btnRecSide.w, btnRecSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnRecSide.w, btnRecSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width + xToCenterText3, canvas.height - 52);
                } else if (!button3.disabled) {
                    ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width, canvas.height - 55, btnLeftSide.w, btnLeftSide.h);
                    ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width + 2, canvas.height - 55, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnRightSide.w, btnRightSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width + xToCenterText3, canvas.height - 52);
                } else {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width, canvas.height - 55, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width + 2, canvas.height - 55, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - 2, canvas.height - 55, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 33 - btn3Width + xToCenterText3, canvas.height - 52, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }
        }
    }






    async function win11() {
        let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
        title = title.replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        title.split("").forEach(char => {
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) title = title.replaceAll(char, "□");
        })

        content = content.replaceAll(" ", " ")
            .replaceAll("！", "!  ")
            .replaceAll("？", "?  ")
            .replaceAll("（", " (")
            .replaceAll("）", ") ")
            .replaceAll("．", ". ")
            .replaceAll("。", "。  ")
            .replaceAll("、", "、  ");
        let chars = content.split("");
        chars.forEach(char => {
            if (char == "\n") return;
            let arrayChar = symbolCodes.info[char.charCodeAt(0)];
            if (!arrayChar && !isCJ(char)) content = content.replaceAll(char, "□");
        })

        let SegoeUI = new Image();
        await loadImageCallback(SegoeUI, symbolCodes.src);

        let MSUIGothic;

        for (const text of [title, content, button1 ? button1.name : "", button2 ? button2.name : "", button3 ? button3.name : ""]) {
            if (isCJ(text)) {
                MSUIGothic = new Image();
                await loadImageCallback(MSUIGothic, fonts["MSUIGothic"]["regular"]["black"].src);
                break;
            } else {
                continue;
            }
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let spriteSheet = isCJ(char) ? MSUIGothic : SegoeUI;
                let symbolsData = isCJ(char) ? fonts["MSUIGothic"]["regular"]["black"] : symbolCodes;
                let charData = symbolsData.info[char.charCodeAt(0)];
                let xOffset = isCJ(char) ? 3 : 0;
                let yOffset = isCJ(char) ? 2 : 0;
                ctx.globalAlpha = a;
                ctx.drawImage(
                    spriteSheet,
                    charData.x,
                    charData.y,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16,
                    x + charsWidth + xOffset,
                    y + yOffset,
                    isCJ(char) ? charData.w : 18,
                    isCJ(char) ? charData.h : 16);
                ctx.globalAlpha = 1;
                charsWidth += charData.w + 1;
            }
        }

        let x = 97;
        let testY = 78;
        const lineHeight = 15;

        const maxWidth = 494;
        const subtexts = content.split("\n");
        const lines = [];
        for (let text of subtexts) {
            const words = text.split(" ");
            if (testBitmaps(text) > maxWidth) {
                let testline = "";
                for (let word of words) {
                    if (testBitmaps(`${testline}${word}`) > maxWidth) {

                        if (testBitmaps(word) > maxWidth) {
                            let testword = "";
                            for (let letter of word) {
                                if (testBitmaps(`${testline}${testword}`) > maxWidth) {
                                    lines.push(`${testline}${testword}`.trim());
                                    testline = "";
                                    testword = "";
                                }
                                testword += letter;
                            }
                            testline += testword + " ";
                            continue;
                        }

                        lines.push(testline.trim());
                        testline = "";
                    }
                    testline += word + " ";
                }
                lines.push(testline.trim());
            } else {
                lines.push(text);
            }
        }

        let longestLineW = 0;

        for (let line of lines) {
            testY += lineHeight;
            const lineWidth = testBitmaps(line);
            if (lineWidth >= longestLineW) {
                longestLineW = lineWidth;
            } else {
                continue;
            }
        }

        let canvasWidth = 214;
        let canvasHeight = testY + 152;
        if (longestLineW > canvasWidth - 160) canvasWidth = longestLineW + 160;
        if (button1.name && lines.length > 1) canvasHeight = canvasHeight - 16;
        if (lines.length > 1 && !button1.name) canvasHeight = canvasHeight - 57;
        if (lines.length <= 1 && !button1.name) canvasHeight = canvasHeight - 41;

        if (button1.name) {
            function getBtnsWidth() {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                if (!button2) return btn1Width;

                if (!button3) {
                    const text2WidthFixed = testBitmaps(button2.name);
                    let text2Width = text2WidthFixed;
                    if (text2Width < 36) text2Width = 36;
                    let btn2Width = text2Width + 30;

                    return btn1Width + btn2Width + 8;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;

                return btn1Width + btn2Width + btn3Width + 16;
            }

            let btnsWidth = getBtnsWidth();

            if (canvasWidth - 120 < btnsWidth) canvasWidth = btnsWidth + 118;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#ffffff";

        let frameLeftCorner = assets["frame-left-corner"];
        let frameRightCorner = assets["frame-right-corner"];
        let frameLeftSide = assets["frame-left-side"];
        let frameRightSide = assets["frame-right-side"];
        let frameTop = assets["frame-top"];
        let frameBottomLeftCorner = assets[button1.name ? "frame-bottom-left-corner" : "frame-bottom-left-corner-no-btns"];
        let frameBottomRightCorner = assets[button1.name ? "frame-bottom-right-corner" : "frame-bottom-right-corner-no-btns"];
        let frameBottom = assets["frame-bottom"];

        ctx.drawImage(assetsSS, frameLeftCorner.x, frameLeftCorner.y, frameLeftCorner.w, frameLeftCorner.h, 0, 0, frameLeftCorner.w, frameLeftCorner.h);
        ctx.drawImage(assetsSS, frameTop.x, frameTop.y, frameTop.w, frameTop.h, 54, 0, canvas.width - 110, 40);
        ctx.drawImage(assetsSS, frameRightCorner.x, frameRightCorner.y, frameRightCorner.w, frameRightCorner.h, canvas.width - 56, 0, frameRightCorner.w, frameRightCorner.h);
        ctx.drawImage(assetsSS, frameLeftSide.x, frameLeftSide.y, frameLeftSide.w, frameLeftSide.h, 0, 40, 47, canvas.height - 127);
        ctx.drawImage(assetsSS, frameRightSide.x, frameRightSide.y, frameRightSide.w, frameRightSide.h, canvas.width - 49, 40, 47, canvas.height - 127);
        ctx.drawImage(assetsSS, frameBottomLeftCorner.x, frameBottomLeftCorner.y, frameBottomLeftCorner.w, frameBottomLeftCorner.h, 0, canvas.height - 87, frameBottomLeftCorner.w, frameBottomLeftCorner.h);
        ctx.drawImage(assetsSS, frameBottomRightCorner.x, frameBottomRightCorner.y, frameBottomRightCorner.w, frameBottomRightCorner.h, canvas.width - 56, canvas.height - 87, frameBottomRightCorner.w, frameBottomRightCorner.h);
        ctx.drawImage(assetsSS, frameBottom.x, frameBottom.y, frameBottom.w, frameBottom.h, 54, canvas.height - 80, canvas.width - 110, 80);

        ctx.fillRect(47, 40, canvas.width - 96, canvas.height - 127);
        ctx.fillStyle = button1.name ? "rgb(240,240,240)" : "#ffffff";
        ctx.fillRect(54, canvas.height - 87, canvas.width - 110, 7);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i));
            if (chunkWidth + 145 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 53, 40);

        let cross = assets[crossDisabled ? "cross-disabled" : "cross"];
        ctx.drawImage(assetsSS, cross.x, cross.y, cross.w, cross.h, canvas.width - 69, 42, cross.w, cross.h);

        ctx.drawImage(assetsSS, iconInfo.x, iconInfo.y, iconInfo.w, iconInfo.h, 57, 73, 32, 32);

        let y = 78;

        for (let line of lines) {
            await drawBitmaps(ctx, line, x, y);
            y += lineHeight;
        }

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name) {
            ctx.fillStyle = 'rgba(223,223,223)';
            ctx.fillRect(47, canvas.height - 121, canvas.width - 96, 34);
            ctx.fillStyle = 'rgba(240,240,240)';
            ctx.fillRect(47, canvas.height - 120, canvas.width - 96, 33);
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 36) textWidth = 36;
                let btnWidth = textWidth + 30;

                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2);
                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 60 - btnWidth, canvas.height - 111, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width + 4 - 60 - btnWidth, canvas.height - 111, btnWidth - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 60, canvas.height - 111, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btnWidth + xToCenterText, canvas.height - 108, .45);
                } else {
                    if (button1.rec) {
                        ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 60 - btnWidth, canvas.height - 111, btnRecLeftSide.w, btnRecLeftSide.h);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width + 4 - 60 - btnWidth, canvas.height - 111, btnWidth - 4, 21);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 60, canvas.height - 111, btnRecRightSide.w, btnRecRightSide.h);
                    } else {
                        ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 60 - btnWidth, canvas.height - 111, btnLeftSide.w, btnLeftSide.h);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width + 4 - 60 - btnWidth, canvas.height - 111, btnWidth - 4, 21);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 60, canvas.height - 111, btnRightSide.w, btnRightSide.h);
                    }

                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btnWidth + xToCenterText, canvas.height - 108);
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2);
                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 60 - btn1Width, canvas.height - 111, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 60, canvas.height - 111, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 108, .45);
                } else {
                    if (button1.rec) {
                        ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 60 - btn1Width, canvas.height - 111, btnRecLeftSide.w, btnRecLeftSide.h);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 60, canvas.height - 111, btnRecRightSide.w, btnRecRightSide.h);
                    } else {
                        ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 60 - btn1Width, canvas.height - 111, btnLeftSide.w, btnLeftSide.h);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 60, canvas.height - 111, btnRightSide.w, btnRightSide.h);
                    }

                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 108);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2);
                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn1Width - 60, canvas.height - 111, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 108, .45);
                } else {
                    if (button2.rec) {
                        ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111, btnRecLeftSide.w, btnRecLeftSide.h);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 8 - btn1Width - 60, canvas.height - 111, btnRecRightSide.w, btnRecRightSide.h);
                    } else {
                        ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111, btnLeftSide.w, btnLeftSide.h);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn1Width - 60, canvas.height - 111, btnRightSide.w, btnRightSide.h);
                    }

                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 108);
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2);
                if (button1.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 60 - btn1Width, canvas.height - 111, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 60, canvas.height - 111, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 108, .45);
                } else {
                    if (button1.rec) {
                        ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 60 - btn1Width, canvas.height - 111, btnRecLeftSide.w, btnRecLeftSide.h);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 60, canvas.height - 111, btnRecRightSide.w, btnRecRightSide.h);
                    } else {
                        ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 60 - btn1Width, canvas.height - 111, btnLeftSide.w, btnLeftSide.h);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 60, canvas.height - 111, btnRightSide.w, btnRightSide.h);
                    }

                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 108);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2);
                if (button2.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn1Width - 60, canvas.height - 111, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 108, .45);
                } else {
                    if (button2.rec) {
                        ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111, btnRecLeftSide.w, btnRecLeftSide.h);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 8 - btn1Width - 60, canvas.height - 111, btnRecRightSide.w, btnRecRightSide.h);
                    } else {
                        ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111, btnLeftSide.w, btnLeftSide.h);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn1Width - 60, canvas.height - 111, btnRightSide.w, btnRightSide.h);
                    }

                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 108);
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2);
                if (button3.disabled) {
                    ctx.drawImage(assetsSS, btnDisabledLeftSide.x, btnDisabledLeftSide.y, btnDisabledLeftSide.w, btnDisabledLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width, canvas.height - 111, btnDisabledLeftSide.w, btnDisabledLeftSide.h);
                    ctx.drawImage(assetsSS, btnDisabledMiddle.x, btnDisabledMiddle.y, btnDisabledMiddle.w, btnDisabledMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width + 4 - 60 - btn3Width, canvas.height - 111, btn3Width - 4, 21);
                    ctx.drawImage(assetsSS, btnDisabledRightSide.x, btnDisabledRightSide.y, btnDisabledRightSide.w, btnDisabledRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 60, canvas.height - 111, btnDisabledRightSide.w, btnDisabledRightSide.h);
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width + xToCenterText3, canvas.height - 108, .45);
                } else {
                    if (button3.rec) {
                        ctx.drawImage(assetsSS, btnRecLeftSide.x, btnRecLeftSide.y, btnRecLeftSide.w, btnRecLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width, canvas.height - 111, btnRecLeftSide.w, btnRecLeftSide.h);
                        ctx.drawImage(assetsSS, btnRecMiddle.x, btnRecMiddle.y, btnRecMiddle.w, btnRecMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width + 4 - 60 - btn3Width, canvas.height - 111, btn3Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRecRightSide.x, btnRecRightSide.y, btnRecRightSide.w, btnRecRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 60, canvas.height - 111, btnRecRightSide.w, btnRecRightSide.h);
                    } else {
                        ctx.drawImage(assetsSS, btnLeftSide.x, btnLeftSide.y, btnLeftSide.w, btnLeftSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width, canvas.height - 111, btnLeftSide.w, btnLeftSide.h);
                        ctx.drawImage(assetsSS, btnMiddle.x, btnMiddle.y, btnMiddle.w, btnMiddle.h, canvas.width - 8 - btn2Width - 8 - btn1Width + 4 - 60 - btn3Width, canvas.height - 111, btn3Width - 4, 21);
                        ctx.drawImage(assetsSS, btnRightSide.x, btnRightSide.y, btnRightSide.w, btnRightSide.h, canvas.width - 8 - btn2Width - 8 - btn1Width - 60, canvas.height - 111, btnRightSide.w, btnRightSide.h);
                    }

                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width + xToCenterText3, canvas.height - 108);
                }
            }
        }
    }

    switch (system) {
        case "win1":
            win1();
            break;
        case "win31":
            win31();
            break;
        case "win95":
        case "win98":
            win9x();
            break;
        case "win2k":
            win2k();
            break;
        case "winwh":
            winwh();
            break;
        case "winxp":
            winxp();
            break;
        case "winlh-4093":
            winlh();
            break;
        case "winvista":
            winvista();
            break;
        case "win7":
            win7();
            break;
        case "win8":
            win8();
            break;
        case "win10":
            win10();
            break;
        case "win11":
            win11();
            break;
    }
}