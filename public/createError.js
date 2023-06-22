// WARNING: SPAGHETTI CODE
// it's really long and messy
// i didnt feel like actually commenting the whole thing
// im sorry please forgive me
async function createError(system, title, content, iconID, button1, button2, button3, crossDisabled, color) {
    if (!iconID || Number(iconID) < 1) iconID = 1;
    if (!button2 || button2.name == "") button2 = null;
    if (!button3 || button3.name == "") button3 = null;

    let canvas;

    let assets = assetsArray[system == "winmem" || system == "win98" ? "win95" : system].assets;

    async function loadImage(ctx, i, x, y, w, h, a) {
        if (!a) a = 1.0;
        let img = new Image();
        img.src = i;
        img.onload = () => {
            if (!w) w = img.width;
            if (!h) h = img.height;
            ctx.save();
            ctx.globalAlpha = a;
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
        }
    }

    if (system == "win1") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }

        let drawWhiteText = false;

        let testY = 47;
        const lineHeight = 16;

        let longestLine = { width: 0, txt: "", lines: 0 };

        function testBitmaps(content) {
            let chars = content.split("");
            let charsWidth = 0;
            for (let char of chars) {
                charsWidth += 8;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let textColor = drawWhiteText ? "white" : "black"
                let symbolsData = fonts["Fixedsys"]["bold"][textColor];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                charsWidth += 8;
            }
        }

        if (testBitmaps(content) > 280) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 280 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            longestLine.lines++;
            longestLine.width = testBitmaps(content);
            longestLine.txt = content;
        } else {
            longestLine.lines++;
            longestLine.width = testBitmaps(content);
            longestLine.txt = content;
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 54;
        if (longestLine.width >= 66 && (longestLine.width + 78) <= 360) canvasWidth = longestLine.width + 78;
        if (longestLine.width >= 280) canvasWidth = 360;
        if (longestLine.lines <= 1 && button1.name != "") canvasHeight = canvasHeight + 8;
        if (longestLine.lines > 1 && button1.name != "") canvasHeight = testY + 44;
        if (longestLine.lines >= 0 && button1.name == "") canvasHeight = testY + 29;

        if (button1) {
            async function getBtnsWidth() {
                let btn1Width = 24 + testBitmaps(button1.name);
                if (!button2) return btn1Width;

                let btn2Width = 24 + testBitmaps(button2.name);
                return btn1Width + btn2Width + 16;
            }

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 32 < btnsWidth) {
                canvasWidth = btnsWidth + 32;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.antialias = 'none';
        ctx.quality = 'best';

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 2, canvas.width, canvas.height);

        let x = 60;
        let y = 47;

        if (testBitmaps(content) > 280) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 280 && i > 0) {
                    await drawBitmaps(ctx, line, x, y - 13);
                    line = words[i] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            await drawBitmaps(ctx, line, x, y - 13);
        } else {
            await drawBitmaps(ctx, content, x, y - 13);
        }

        ctx.fillStyle = "#5757ff";
        ctx.fillRect(2, 2, canvas.width, 14);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 16, canvas.width, 2);

        if (testBitmaps(title) + 34 >= canvas.width) {
            let splittingChar = Math.ceil((canvas.width - 34) / 8) - 1;
            title = `${title.slice(0, splittingChar)}…`
        }

        let blackSquare = canvasWidth * .365;
        if (title != "") blackSquare = testBitmaps(title) + 16;
        let squareX = (canvas.width - 4 - blackSquare) / 2;
        ctx.fillStyle = "#000000";
        ctx.fillRect(squareX + 2, 2, blackSquare, 16);

        drawWhiteText = true;
        await drawBitmaps(ctx, title, Math.round((canvas.width - testBitmaps(title)) / 2), 0);

        await loadImage(ctx, icon, 15, 31);

        let btnSide = assets["btn-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisabledSide = assets["btn-disabled-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        let btnY = canvasHeight - 36;

        drawWhiteText = false;

        if (button1.name != "") {
            if (!button2) {
                let textWidth = testBitmaps(button1.name);
                let btnWidth = textWidth + 24;
                let xToCenterText = Math.floor((btnWidth - textWidth) / 2);

                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledSide, btnX, btnY);
                    await loadImage(ctx, btnDisabledMiddle, btnX + 5, btnY, btnWidth - 10, 24);
                    await loadImage(ctx, btnDisabledRightSide, btnX + btnWidth - 5, btnY);

                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, btnY + 3, .5);
                } else {
                    if (button1.rec) {
                        await loadImage(ctx, btnRecSide, btnX, btnY - 2);
                        await loadImage(ctx, btnRecMiddle, btnX + 6, btnY - 2, btnWidth - 12, 28);
                        await loadImage(ctx, btnRecRightSide, btnX + btnWidth - 6, btnY - 2);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, btnY + 3);
                    } else {
                        await loadImage(ctx, btnSide, btnX, btnY);
                        await loadImage(ctx, btnMiddle, btnX + 5, btnY, btnWidth - 10, 24);
                        await loadImage(ctx, btnRightSide, btnX + btnWidth - 5, btnY);

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
                    await loadImage(ctx, btnDisabledSide, btnX, btnY);
                    await loadImage(ctx, btnDisabledMiddle, btnX + 5, btnY, btn1Width - 10, 24);
                    await loadImage(ctx, btnDisabledRightSide, btnX + btn1Width - 5, btnY);

                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, btnY + 3, .5);
                } else {
                    if (button1.rec) {
                        await loadImage(ctx, btnRecSide, btnX, btnY - 2);
                        await loadImage(ctx, btnRecMiddle, btnX + 6, btnY - 2, btn1Width - 12, 28);
                        await loadImage(ctx, btnRecRightSide, btnX + btn1Width - 6, btnY - 2);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, btnY + 3);
                    } else {
                        await loadImage(ctx, btnSide, btnX, btnY);
                        await loadImage(ctx, btnMiddle, btnX + 5, btnY, btn1Width - 10, 24);
                        await loadImage(ctx, btnRightSide, btnX + btn1Width - 5, btnY);

                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, btnY + 3);
                    }
                }

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledSide, btnX + 16 + btn1Width, btnY);
                    await loadImage(ctx, btnDisabledMiddle, btnX + 16 + btn1Width + 5, btnY, btn2Width - 10, 24);
                    await loadImage(ctx, btnDisabledRightSide, btnX + 16 + btn1Width + btn2Width - 5, btnY);

                    await drawBitmaps(ctx, button2.name, btnX + 16 + btn1Width + xToCenterText2, btnY + 3, .5);
                } else {
                    if (button2.rec) {
                        await loadImage(ctx, btnRecSide, btnX + 16 + btn1Width, btnY - 2);
                        await loadImage(ctx, btnRecMiddle, btnX + 16 + btn1Width + 6, btnY - 2, btn2Width - 12, 28);
                        await loadImage(ctx, btnRecRightSide, btnX + 16 + btn1Width + btn2Width - 6, btnY - 2);

                        await drawBitmaps(ctx, button2.name, btnX + 16 + btn1Width + xToCenterText2, btnY + 3);
                    } else {
                        await loadImage(ctx, btnSide, btnX + 16 + btn1Width, btnY);
                        await loadImage(ctx, btnMiddle, btnX + 16 + btn1Width + 5, btnY, btn2Width - 10, 24);
                        await loadImage(ctx, btnRightSide, btnX + 16 + btn1Width + btn2Width - 5, btnY);

                        await drawBitmaps(ctx, button2.name, btnX + 16 + btn1Width + xToCenterText2, btnY + 3);
                    }
                }
            }
        }
    }





    if (system == "win31") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        let testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d");

        function checkChars() {
            let vgasysr = fonts["vgasysr"]["bold"]["white"];
            title = title.replaceAll(" ", " ")
            title = title.replaceAll("’", "'")
            title.split("").forEach(char => {
                let arrayChar = vgasysr.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            });

            let symbolCodes = fonts["MSSansSerif"]["bold"]["black"];
            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars();

        let x = 69;
        let testY = 39;
        const lineHeight = 14;

        let longestLine = { width: 0, txt: "", lines: 0 };

        let drawWhiteText = false;
        let contentWidth = testBitmaps(content)

        function testBitmaps(content, vgasysr = false) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let fontName = vgasysr ? "vgasysr" : "MSSansSerif"
                let charsWidthList = fonts[fontName]["bold"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let textColor = drawWhiteText ? "white" : "black"
                let symbolsData = fonts["MSSansSerif"]["bold"][textColor];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["MSSansSerif"]["bold"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        async function drawTitle(ctx, content, x, y) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["vgasysr"]["bold"]["white"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y);
                let charsWidthList = fonts["vgasysr"]["bold"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        if (contentWidth > 250) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 250 && i > 0) {
                    longestLine.lines++;
                    if (line <= longestLine.width) continue;
                    longestLine.width = testBitmaps(line);
                    longestLine.txt = line;
                    await drawBitmaps(testCtx, line, x, testY);
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            await drawBitmaps(testCtx, line, x, testY);
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            await drawBitmaps(testCtx, content, x, testY);
            longestLine.lines++;
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 38 + 24;
        if (longestLine.width > 30) canvasWidth = longestLine.width + 91;
        if (longestLine.lines > 1 && button1.name != "") canvasHeight = canvasHeight - 16;
        if (longestLine.lines == 1 && button1.name != "") canvasHeight = canvasHeight + 18;
        if (contentWidth > 250) canvasWidth = 339;

        if (button1) {
            async function getBtnsWidth() {
                const btn1TextWidthFixed = testBitmaps(button1.name)
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btn1Width = btn1TextWidth + 32;

                if (!button2) return btn1Width;

                if (!button3) {
                    const btn2TextWidthFixed = testBitmaps(button2.name)
                    let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                    let btn2Width = btn2TextWidth + 32;

                    return btn1Width + btn2Width + 17;
                }

                const btn2TextWidthFixed = testBitmaps(button2.name)
                let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                let btn2Width = btn2TextWidth + 32;

                const btn3TextWidthFixed = testBitmaps(button3.name)
                let btn3TextWidth = btn3TextWidthFixed < 38 ? 38 : btn3TextWidthFixed;
                let btn3Width = btn3TextWidth + 32;

                return btn1Width + btn2Width + btn3Width + 34;
            }

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 34 < btnsWidth) {
                canvasHeight = canvasHeight + 8;
                canvasWidth = btnsWidth + 34;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        let y = 37;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgb(0,0,168)";
        ctx.fillRect(0, 0, canvas.width, 19);

        await loadImage(ctx, assets.minimize, 1, 1);

        ctx.antialias = "none";
        ctx.quality = 'best';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 19, canvas.width, 1);

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        let iconY = 37;
        if (longestLine.lines >= 3) iconY = (longestLine.lines / 2 * lineHeight) + 14;
        await loadImage(ctx, icon, 19, iconY, 32, 32)

        if (contentWidth > 250) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 250 && i > 0) {
                    await drawBitmaps(ctx, line, x, y);
                    line = words[i] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            await drawBitmaps(ctx, line, x, y);
        } else {
            await drawBitmaps(ctx, content, x, y);
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i));
            if (chunkWidth + 70 > canvas.width) {
                title = `${title.slice(0, i).trim()}…`;
                break;
            }
        }

        let titleWidth = testBitmaps(title, true)
        let titleX = Math.round((canvas.width - 20 - titleWidth) / 2) + 20;
        await drawTitle(ctx, title, titleX, 3);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name != "") {
            if (!button2) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btnWidth = btn1TextWidth + 32;

                let xToCenterText = Math.round((btnWidth - btn1TextWidthFixed) / 2);
                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRecMiddle, btnX + 5, canvas.height - 36, btnWidth - 8, 27);
                    await loadImage(ctx, btnRecRightSide, btnX + btnWidth - 4, canvas.height - 36);
                } else {
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 36);
                    await loadImage(ctx, btnMiddle, btnX + 4, canvas.height - 36, btnWidth - 8, 27);
                    await loadImage(ctx, btnRightSide, btnX + btnWidth - 4, canvas.height - 36);
                }
                if (button1.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;
            }
            if (button2 && button3 == null) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btn1Width = btn1TextWidth + 32;

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                let btn2Width = btn2TextWidth + 32;

                let xToCenterText1 = Math.round((btn1Width - btn1TextWidthFixed) / 2);
                let xToCenterText2 = Math.round((btn2Width - btn2TextWidthFixed) / 2);
                let btnX = Math.round((canvas.width - btn1Width - btn2Width - 17) / 2);



                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRecMiddle, btnX + 5, canvas.height - 36, btn1Width - 8, 27);
                    await loadImage(ctx, btnRecRightSide, btnX + btn1Width - 4, canvas.height - 36);
                } else {
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 36);
                    await loadImage(ctx, btnMiddle, btnX + 4, canvas.height - 36, btn1Width - 8, 27);
                    await loadImage(ctx, btnRightSide, btnX + btn1Width - 4, canvas.height - 36);
                }
                if (button1.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;



                if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX + 17 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRecMiddle, btnX + 17 + btn1Width + 5, canvas.height - 36, btn2Width - 8, 27);
                    await loadImage(ctx, btnRecRightSide, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36);
                } else {
                    await loadImage(ctx, btnLeftSide, btnX + 17 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnMiddle, btnX + 17 + btn1Width + 4, canvas.height - 36, btn2Width - 8, 27);
                    await loadImage(ctx, btnRightSide, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36);
                }
                if (button2.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button2.name, btnX + 17 + btn1Width + xToCenterText2, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;
            }
            if (button3) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed < 38 ? 38 : btn1TextWidthFixed;
                let btn1Width = btn1TextWidth + 32;

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed < 38 ? 38 : btn2TextWidthFixed;
                let btn2Width = btn2TextWidth + 32;

                const btn3TextWidthFixed = testBitmaps(button3.name);
                let btn3TextWidth = btn3TextWidthFixed < 38 ? 38 : btn3TextWidthFixed;
                let btn3Width = btn3TextWidth + 32;

                let xToCenterText1 = Math.round((btn1Width - btn1TextWidthFixed) / 2);
                let xToCenterText2 = Math.round((btn2Width - btn2TextWidthFixed) / 2);
                let xToCenterText3 = Math.round((btn3Width - btn3TextWidthFixed) / 2);
                let btnX = Math.round((canvas.width - btn1Width - btn2Width - btn3Width - 34) / 2);



                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRecMiddle, btnX + 5, canvas.height - 36, btn1Width - 8, 27);
                    await loadImage(ctx, btnRecRightSide, btnX + btn1Width - 4, canvas.height - 36);
                } else {
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 36);
                    await loadImage(ctx, btnMiddle, btnX + 4, canvas.height - 36, btn1Width - 8, 27);
                    await loadImage(ctx, btnRightSide, btnX + btn1Width - 4, canvas.height - 36);
                }
                if (button1.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;



                if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX + 17 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRecMiddle, btnX + 17 + btn1Width + 5, canvas.height - 36, btn2Width - 8, 27);
                    await loadImage(ctx, btnRecRightSide, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36);
                } else {
                    await loadImage(ctx, btnLeftSide, btnX + 17 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnMiddle, btnX + 17 + btn1Width + 4, canvas.height - 36, btn2Width - 8, 27);
                    await loadImage(ctx, btnRightSide, btnX + 17 + btn1Width + btn2Width - 4, canvas.height - 36);
                }
                if (button2.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button2.name, btnX + 17 + btn1Width + xToCenterText2, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;



                if (button3.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX + 17 + btn2Width + 17 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRecMiddle, btnX + 17 + btn2Width + 17 + btn1Width + 5, canvas.height - 36, btn3Width - 8, 27);
                    await loadImage(ctx, btnRecRightSide, btnX + 17 + btn2Width + 17 + btn1Width + btn3Width - 4, canvas.height - 36);
                } else {
                    await loadImage(ctx, btnLeftSide, btnX + 17 + btn2Width + 17 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnMiddle, btnX + 17 + btn2Width + 17 + btn1Width + 4, canvas.height - 36, btn3Width - 8, 27);
                    await loadImage(ctx, btnRightSide, btnX + 17 + btn2Width + 17 + btn1Width + btn3Width - 4, canvas.height - 36);
                }
                if (button3.disabled) ctx.globalAlpha = 0.33;
                await drawBitmaps(ctx, button3.name, btnX + 17 + btn2Width + 17 + btn1Width + xToCenterText3, canvas.height - 29, ctx.globalAlpha)
                ctx.globalAlpha = 1;
            }
        }
    }





    if (system == "win95" || system == "winmem" || system == "win98") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["MSSansSerif"]["regular"]["black"];
            title = title.replaceAll(" ", " ");
            title = title.replaceAll("’", "'");
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars();
        let testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d");

        let x = 66;
        let testY = 44;
        const lineHeight = 14;

        let longestLine = { width: 0, txt: "", lines: 0 };

        let drawWhiteText = false;
        let contentWidth = testBitmaps(content)

        function testBitmaps(content, isBold = false) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = isBold ? fonts["MSSansSerif"]["bold"]["chars-width"] : fonts["MSSansSerif"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let textColor = drawWhiteText ? "white" : "black"
                let symbolsData = isBold ? fonts["MSSansSerif"]["bold"][textColor] : fonts["MSSansSerif"]["regular"][textColor];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = isBold ? fonts["MSSansSerif"]["bold"]["chars-width"] : fonts["MSSansSerif"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        if (contentWidth > 400) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 400 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    drawBitmaps(testCtx, line, x, testY);
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            drawBitmaps(testCtx, line, x, testY);
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            drawBitmaps(testCtx, content, x, testY);
            longestLine.lines++;
        }

        if (content == "") longestLine.lines = 0;

        let canvasWidth = 120;
        let canvasHeight = testY + 40;
        if (longestLine.width > 41) canvasWidth = longestLine.width + 79;
        if (longestLine.width > 360) canvasWidth = 482;
        if (longestLine.lines > 1 && canvasWidth > 120) canvasHeight = testY + 56;
        if (longestLine.lines == 1 && button1.name != "") canvasHeight = testY + 62;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = testY + 17;

        if (button1) {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 28 < btnsWidth) {
                canvasHeight = canvasHeight + 8;
                canvasWidth = btnsWidth + 28;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        let y = 44;

        ctx.antialias = 'none';
        ctx.fillStyle = "#c0c0c0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textDrawingMode = 'glyph';
        ctx.quality = 'best';
        ctx.fillStyle = "black";
        ctx.textAlign = "left";

        async function draw(x, y) {
            if (contentWidth > 400) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 400 && i > 0) {
                        await drawBitmaps(ctx, line, x - 5, y - 13)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x - 5, y - 13)
            } else {
                await drawBitmaps(ctx, content, x - 5, y - 13)
            }
        }

        await draw(x + 1, y + 2);

        let frameTop = assets["icon-frame-top"];
        let frameLeftSide = assets["icon-frame-left-side"];
        let frameLeftCorner = assets["icon-frame-left-corner"];
        let frameBottomRightCorner = assets["icon-frame-bottom-right-corner"];
        let frameRightCorner = assets["icon-frame-right-corner"];
        let frameBottomLeftCorner = assets["icon-frame-bottom-left-corner"];
        let frameBottom = assets["icon-frame-bottom"];
        let frameRightSide = assets["icon-frame-right-side"];

        await loadImage(ctx, frameLeftCorner, 0, 0);
        await loadImage(ctx, frameTop, 3, 0, canvas.width - 6, 3);
        await loadImage(ctx, frameRightCorner, canvas.width - 3, 0);
        await loadImage(ctx, frameLeftSide, 0, 3, 3, canvas.height - 6);
        await loadImage(ctx, frameBottomLeftCorner, 0, canvas.height - 3);
        await loadImage(ctx, frameBottom, 3, canvas.height - 3, canvas.width - 6, 3);
        await loadImage(ctx, frameBottomRightCorner, canvas.width - 3, canvas.height - 3);
        await loadImage(ctx, frameRightSide, canvas.width - 3, 3, 3, canvas.height - 6);

        if (system == "win95") {
            ctx.fillStyle = "rgb(0,0,128)";
            ctx.fillRect(3, 3, canvas.width - 6, 18);
        }
        if (system == "winmem") {
            let gradient = ctx.createLinearGradient(0, 0, canvas.width - 6, 0);
            gradient.addColorStop(0, "rgb(0,0,128)");
            gradient.addColorStop(1, "rgb(0,0,0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(3, 3, canvas.width - 6, 18);
        }
        if (system == "win98") {
            let gradient = ctx.createLinearGradient(0, 0, canvas.width - 6, 0);
            gradient.addColorStop(0, "rgb(0,0,128)");
            gradient.addColorStop(1, "rgb(16,132,208)");
            ctx.fillStyle = gradient;
            ctx.fillRect(3, 3, canvas.width - 6, 18);
        }

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 13, 32, 34, 34);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 40 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        drawWhiteText = true;
        await drawBitmaps(ctx, title, 6, 5, true)
        drawWhiteText = false;

        let crossImgSrc = crossDisabled ? assets["cross-disabled"] : assets["cross"];
        await loadImage(ctx, crossImgSrc, canvas.width - 21, 5);

        let btnLeftSide = assets["btn-left-side"]
        let btnMiddle = assets["btn-middle"]
        let btnRightSide = assets["btn-right-side"]

        let btnRecLeftSide = assets["btn-rec-left-side"]
        let btnRecMiddle = assets["btn-rec-middle"]
        let btnRecRightSide = assets["btn-rec-right-side"]

        if (button1.name != "") {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 57) textWidth = 57;
                let btnWidth = textWidth + 18;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2);

                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 3, canvas.height - 37, btnWidth - 7);
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 37)
                    await loadImage(ctx, btnRecRightSide, btnX + btnWidth - 4, canvas.height - 37)
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, btnWidth - 5);
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 37)
                    await loadImage(ctx, btnRightSide, btnX + btnWidth - 3, canvas.height - 37)
                    if (button1.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText + 1, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                    }
                }
            }

            if (button2 && button3 == null) {
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
                    await loadImage(ctx, btnRecMiddle, btnX + 3, canvas.height - 37, btn1Width - 7);
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 37)
                    await loadImage(ctx, btnRecRightSide, btnX + btn1Width - 4, canvas.height - 37)
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, btn1Width - 5);
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 37)
                    await loadImage(ctx, btnRightSide, btnX + btn1Width - 3, canvas.height - 37)
                    if (button1.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1 + 1, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                    }
                }

                if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 5 + btn1Width + 3, canvas.height - 37, btn2Width - 7);
                    await loadImage(ctx, btnRecLeftSide, btnX + 5 + btn1Width, canvas.height - 37)
                    await loadImage(ctx, btnRecRightSide, btnX + 5 + btn1Width + btn2Width - 4, canvas.height - 37)
                    await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 5 + btn1Width + 2, canvas.height - 37, btn2Width - 5);
                    await loadImage(ctx, btnLeftSide, btnX + 5 + btn1Width, canvas.height - 37)
                    await loadImage(ctx, btnRightSide, btnX + 5 + btn1Width + btn2Width - 3, canvas.height - 37)
                    if (button2.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2 + 1, canvas.height - 31);
                        drawWhiteText = false;
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
                    await loadImage(ctx, btnRecMiddle, btnX + 3, canvas.height - 37, btn1Width - 7);
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 37)
                    await loadImage(ctx, btnRecRightSide, btnX + btn1Width - 4, canvas.height - 37)
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, btn1Width - 5);
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 37)
                    await loadImage(ctx, btnRightSide, btnX + btn1Width - 3, canvas.height - 37)
                    if (button1.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1 + 1, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                    }
                }

                if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 5 + btn1Width + 3, canvas.height - 37, btn2Width - 7);
                    await loadImage(ctx, btnRecLeftSide, btnX + 5 + btn1Width, canvas.height - 37)
                    await loadImage(ctx, btnRecRightSide, btnX + 5 + btn1Width + btn2Width - 4, canvas.height - 37)
                    await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 5 + btn1Width + 2, canvas.height - 37, btn2Width - 5);
                    await loadImage(ctx, btnLeftSide, btnX + 5 + btn1Width, canvas.height - 37)
                    await loadImage(ctx, btnRightSide, btnX + 5 + btn1Width + btn2Width - 3, canvas.height - 37)
                    if (button2.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2 + 1, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, btnX + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                    }
                }

                if (button3.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 10 + btn1Width + btn2Width + 3, canvas.height - 37, btn3Width - 7);
                    await loadImage(ctx, btnRecLeftSide, btnX + 10 + btn1Width + btn2Width, canvas.height - 37)
                    await loadImage(ctx, btnRecRightSide, btnX + 10 + btn1Width + btn2Width + btn3Width - 4, canvas.height - 37)
                    await drawBitmaps(ctx, button3.name, btnX + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 10 + btn1Width + btn2Width + 2, canvas.height - 37, btn3Width - 5);
                    await loadImage(ctx, btnLeftSide, btnX + 10 + btn1Width + btn2Width, canvas.height - 37)
                    await loadImage(ctx, btnRightSide, btnX + 10 + btn1Width + btn2Width + btn3Width - 3, canvas.height - 37)
                    if (button3.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button3.name, btnX + 10 + btn1Width + btn2Width + xToCenterText3 + 1, canvas.height - 31);
                        drawWhiteText = false;
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



    if (system == "win2k") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["Tahoma"]["regular"]["black"];
            title = title.replaceAll(" ", " ")
            title = title.replaceAll("’", "'")
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })
            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d")

        const contentWidth = testBitmaps(content)

        let drawWhiteText = false;

        function testBitmaps(content, isBold = false) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = fonts["Tahoma"][isBold ? "bold" : "regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let textColor = drawWhiteText ? "white" : "black";
                let symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"] : fonts["Tahoma"]["regular"][textColor];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["Tahoma"][isBold ? "bold" : "regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        let x = 63;
        let testY = 41;
        const lineHeight = 14;

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 324) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 324 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    await drawBitmaps(testCtx, line, x, testY)
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            drawBitmaps(testCtx, line, x, testY);
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            drawBitmaps(testCtx, content, x, testY);
            longestLine.lines++;
        }

        let canvasWidth = 120;
        let canvasHeight = testY + 64;
        if (longestLine.width > 41) canvasWidth = longestLine.width + 88;
        if (longestLine.width > 324) canvasWidth = 400;
        if (longestLine.lines == 1 && button1.name == "") canvasHeight = testY + 40;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = testY + 32;

        if (button1.name != "") {
            async function getBtnsWidth() {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 74) btn1TextWidth = 73;
                let btn1Width = btn1TextWidth + 15;

                if (!button2) return btn1Width;

                if (!button3) {
                    const btn2TextWidthFixed = testBitmaps(button2.name);
                    let btn2TextWidth = btn2TextWidthFixed;
                    if (btn2TextWidth < 74) btn2TextWidth = 73;
                    let btn2Width = btn2TextWidth + 15;

                    return btn1Width + btn2Width + 5;
                }

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 74) btn2TextWidth = 73;
                let btn2Width = btn2TextWidth + 15;

                const btn3TextWidthFixed = testBitmaps(button3.name);
                let btn3TextWidth = btn3TextWidthFixed;
                if (btn3TextWidth < 74) btn3TextWidth = 73;
                let btn3Width = btn3TextWidth + 15;

                return btn1Width + btn2Width + btn3Width + 10;
            }

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 28 < btnsWidth) {
                canvasHeight = canvasHeight + 8;
                canvasWidth = btnsWidth + 28;
            }
        }

        canvas = document.getElementById('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.antialias = "none";
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

        await loadImage(ctx, frameSideHor, 0, 3, 3, canvas.height - 6)
        await loadImage(ctx, frameSide, 3, 0, canvas.width - 6, 3)
        await loadImage(ctx, frameCorner, 0, 0)
        await loadImage(ctx, frameTopRightCorner, canvas.width - 3, 0)
        await loadImage(ctx, frameDarkSideHor, canvas.width - 3, 3, 3, canvas.height - 6)
        await loadImage(ctx, frameDarkSide, 3, canvas.height - 3, canvas.width - 6, 3)
        await loadImage(ctx, frameDarkCorner, canvas.width - 3, canvas.height - 3)
        await loadImage(ctx, frameBottomLeftCorner, 0, canvas.height - 3)

        let gradient = ctx.createLinearGradient(0, 0, canvas.width - 6, 0);
        gradient.addColorStop(0, "rgb(10,36,106)");
        gradient.addColorStop(1, "rgb(166,202,240)");
        ctx.fillStyle = gradient;
        ctx.fillRect(3, 3, canvas.width - 6, 18);

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 13, 32, 34, 34);

        let y = 31;

        async function draw(x, y) {
            if (contentWidth > 324) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 324 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }

        await draw(x + 2, y + 2);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 45 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 5, 5, true)

        let crossImgSrc = crossDisabled ? assets["cross-disabled"] : assets["cross"];
        await loadImage(ctx, crossImgSrc, canvas.width - 21, 5);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];
        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name != "") {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 74) textWidth = 73;
                let btnWidth = textWidth + 17;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 2;

                let btnX = Math.ceil((canvas.width - textWidth - 14) / 2);
                if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 37, textWidth + 11, 23);
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 37);
                    await loadImage(ctx, btnRecRightSide, btnX + 10 + textWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, textWidth + 11, 23);
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 37);
                    await loadImage(ctx, btnRightSide, btnX + 11 + textWidth, canvas.height - 37);
                    if (button1.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button1.name, btnX + 3 + xToCenterText, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 32);
                    }
                }
            }

            if (button2 && button3 == null) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 74) btn1TextWidth = 72;
                let btn1Width = btn1TextWidth + 17;
                let xToCenterText1 = Math.floor((btn1Width - btn1TextWidthFixed) / 2);

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 74) btn2TextWidth = 72;
                let btn2Width = btn2TextWidth + 17;
                let xToCenterText2 = Math.floor((btn2Width - btn2TextWidthFixed) / 2);

                let btnsRowWidth = btn1Width + btn2Width + 5;
                let xToPlaceBtns = Math.floor((canvas.width - btnsRowWidth) / 2);

                if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, xToPlaceBtns + 2, canvas.height - 37, btn1TextWidth + 15, 23);
                    await loadImage(ctx, btnRecLeftSide, xToPlaceBtns, canvas.height - 37);
                    await loadImage(ctx, btnRecRightSide, xToPlaceBtns + 14 + btn1TextWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button1.name, xToPlaceBtns + xToCenterText1, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, xToPlaceBtns + 2, canvas.height - 37, btn1TextWidth + 15, 23);
                    await loadImage(ctx, btnLeftSide, xToPlaceBtns, canvas.height - 37);
                    await loadImage(ctx, btnRightSide, xToPlaceBtns + 15 + btn1TextWidth, canvas.height - 37);

                    if (button1.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button1.name, xToPlaceBtns + 3 + xToCenterText1, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, xToPlaceBtns + 2 + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, xToPlaceBtns + 2 + xToCenterText1, canvas.height - 32);
                    }
                }

                if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, xToPlaceBtns + btn1Width + 5 + 2, canvas.height - 37, btn2TextWidth + 15, 23);
                    await loadImage(ctx, btnRecLeftSide, xToPlaceBtns + btn1Width + 5, canvas.height - 37);
                    await loadImage(ctx, btnRecRightSide, xToPlaceBtns + btn1Width + 5 + 14 + btn2TextWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button2.name, xToPlaceBtns + btn1Width + 5 + xToCenterText2, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, xToPlaceBtns + btn1Width + 5 + 2, canvas.height - 37, btn2TextWidth + 15, 23);
                    await loadImage(ctx, btnLeftSide, xToPlaceBtns + btn1Width + 5, canvas.height - 37);
                    await loadImage(ctx, btnRightSide, xToPlaceBtns + btn1Width + 5 + 15 + btn2TextWidth, canvas.height - 37);

                    if (button2.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button2.name, xToPlaceBtns + 3 + btn1Width + 5 + xToCenterText2, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, xToPlaceBtns + 2 + btn1Width + 5 + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, xToPlaceBtns + 2 + btn1Width + 5 + xToCenterText2, canvas.height - 32);
                    }
                }
            }

            if (button3) {
                const btn1TextWidthFixed = testBitmaps(button1.name);
                let btn1TextWidth = btn1TextWidthFixed;
                if (btn1TextWidth < 74) btn1TextWidth = 73;
                let btn1Width = btn1TextWidth + 17;
                let xToCenterText1 = Math.floor((btn1Width - btn1TextWidthFixed) / 2);

                const btn2TextWidthFixed = testBitmaps(button2.name);
                let btn2TextWidth = btn2TextWidthFixed;
                if (btn2TextWidth < 74) btn2TextWidth = 73;
                let btn2Width = btn2TextWidth + 17;
                let xToCenterText2 = Math.floor((btn2Width - btn2TextWidthFixed) / 2);

                const btn3TextWidthFixed = testBitmaps(button3.name);
                let btn3TextWidth = btn3TextWidthFixed;
                if (btn3TextWidth < 74) btn3TextWidth = 73;
                let btn3Width = btn3TextWidth + 17;
                let xToCenterText3 = Math.floor((btn3Width - btn3TextWidthFixed) / 2);

                let btnsRowWidth = btn1Width + btn2Width + btn3Width + 10;
                let xToPlaceBtns = Math.floor((canvas.width - btnsRowWidth) / 2);
                if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, xToPlaceBtns + 2, canvas.height - 37, btn1TextWidth + 15, 23);
                    await loadImage(ctx, btnRecLeftSide, xToPlaceBtns, canvas.height - 37);
                    await loadImage(ctx, btnRecRightSide, xToPlaceBtns + 14 + btn1TextWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button1.name, xToPlaceBtns + xToCenterText1, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, xToPlaceBtns + 2, canvas.height - 37, btn1TextWidth + 15, 23);
                    await loadImage(ctx, btnLeftSide, xToPlaceBtns, canvas.height - 37);
                    await loadImage(ctx, btnRightSide, xToPlaceBtns + 15 + btn1TextWidth, canvas.height - 37);

                    if (button1.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button1.name, xToPlaceBtns + 3 + xToCenterText1, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button1.name, xToPlaceBtns + 2 + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button1.name, xToPlaceBtns + 2 + xToCenterText1, canvas.height - 32);
                    }
                }

                if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, xToPlaceBtns + btn1Width + 5 + 2, canvas.height - 37, btn2TextWidth + 15, 23);
                    await loadImage(ctx, btnRecLeftSide, xToPlaceBtns + btn1Width + 5, canvas.height - 37);
                    await loadImage(ctx, btnRecRightSide, xToPlaceBtns + btn1Width + 5 + 14 + btn2TextWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button2.name, xToPlaceBtns + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, xToPlaceBtns + btn1Width + 5 + 2, canvas.height - 37, btn2TextWidth + 15, 23);
                    await loadImage(ctx, btnLeftSide, xToPlaceBtns + btn1Width + 5, canvas.height - 37);
                    await loadImage(ctx, btnRightSide, xToPlaceBtns + btn1Width + 5 + 15 + btn2TextWidth, canvas.height - 37);

                    if (button2.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button2.name, xToPlaceBtns + 3 + 5 + btn1Width + xToCenterText2, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button2.name, xToPlaceBtns + 2 + 5 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button2.name, xToPlaceBtns + 2 + 5 + btn1Width + xToCenterText2, canvas.height - 32);
                    }
                }

                if (button3.rec) {
                    await loadImage(ctx, btnRecMiddle, xToPlaceBtns + btn1Width + btn2Width + 10 + 2, canvas.height - 37, btn3TextWidth + 15, 23);
                    await loadImage(ctx, btnRecLeftSide, xToPlaceBtns + btn1Width + btn2Width + 10, canvas.height - 37);
                    await loadImage(ctx, btnRecRightSide, xToPlaceBtns + btn1Width + btn2Width + 5 + 6 + 14 + btn3TextWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button3.name, xToPlaceBtns + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, xToPlaceBtns + btn1Width + btn2Width + 10 + 2, canvas.height - 37, btn3TextWidth + 15, 23);
                    await loadImage(ctx, btnLeftSide, xToPlaceBtns + btn1Width + btn2Width + 10, canvas.height - 37);
                    await loadImage(ctx, btnRightSide, xToPlaceBtns + btn1Width + btn2Width + 5 + 6 + 15 + btn3TextWidth, canvas.height - 37);

                    if (button3.disabled) {
                        drawWhiteText = true;
                        await drawBitmaps(ctx, button3.name, xToPlaceBtns + 3 + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 31);
                        drawWhiteText = false;
                        ctx.globalAlpha = .32;
                        await drawBitmaps(ctx, button3.name, xToPlaceBtns + 2 + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32, false, ctx.globalAlpha);
                        ctx.globalAlpha = 1;
                    } else {
                        await drawBitmaps(ctx, button3.name, xToPlaceBtns + 2 + 10 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32);
                    }
                }
            }
        }
    }





    if (system == "winwh") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["Tahoma"]["regular"]["black"];
            title = title.replaceAll(" ", " ")
            title = title.replaceAll("’", "'")
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars();

        function testBitmaps(content, isBold = false) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = fonts["Tahoma"][isBold ? "bold" : "regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let textColor = drawWhiteText ? "white" : "black"
                let symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"] : fonts["Tahoma"]["regular"][textColor];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["Tahoma"][isBold ? "bold" : "regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d")

        const contentWidth = testBitmaps(content)

        let drawWhiteText = false;

        let x = 64;
        let testY = 32;
        const lineHeight = 14;

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 407) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 407 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    await drawBitmaps(testCtx, line, x, testY)
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            drawBitmaps(testCtx, line, x, testY);
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            drawBitmaps(testCtx, content, x, testY);
            longestLine.lines++;
        }

        let canvasWidth = 144;
        let canvasHeight = testY + 15;
        if (longestLine.width > 65) canvasWidth = longestLine.width + 79;
        if (longestLine.width > 407) canvasWidth = 486;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = testY + 32;
        if (longestLine.lines <= 1 && button1.name == "") canvasHeight = testY + 48;
        if (longestLine.lines > 1 && button1.name != "") canvasHeight = testY + 70;
        if (longestLine.lines <= 1 && button1.name != "") canvasHeight = testY + 86;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 30 < btnsWidth) {
                canvasWidth = btnsWidth + 30;
            }
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.antialias = "none";
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

        await loadImage(ctx, frameLeftCorner, 0, 0);
        await loadImage(ctx, frameMiddleLight, 4, 0, canvas.width - 144, 23);
        await loadImage(ctx, rectangles, canvas.width - 140, 0);
        await loadImage(ctx, frameLeftSide, 0, 23, 4, canvas.height - 27);
        await loadImage(ctx, frameBottomLeft, 0, canvas.height - 4);
        await loadImage(ctx, frameBottom, 4, canvas.height - 4, canvas.width - 8, 4);
        await loadImage(ctx, frameBottomRight, canvas.width - 4, canvas.height - 4);
        await loadImage(ctx, frameRightSide, canvas.width - 4, 23, 4, canvas.height - 27);
        await loadImage(ctx, frameRightCorner, canvas.width - 4, 0);

        let titleWidth = testBitmaps(title, true);
        if (titleWidth >= canvas.width - 95) {
            await loadImage(ctx, frameMiddleDark, canvas.width - 113, 0)
        } else {
            await loadImage(ctx, comments, canvas.width - 113, 0)
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 50 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 13, 5, true)

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 14, 33, 34, 34)

        let y = 32;

        async function draw(x, y) {
            if (contentWidth > 407) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 407 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }

        await draw(x + 2, y + 2)

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        if (button1.name != "") {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 57) textWidth = 57;

                let btnWidth = textWidth + 18;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 1;

                let btnX = Math.round((canvas.width - btnWidth) / 2);

                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnRecMiddle, btnX + 4, canvas.height - 38, textWidth + 10, 23);
                    await loadImage(ctx, btnRecRightSide, btnX + textWidth + 14, canvas.height - 38);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 33)
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 38, textWidth + 14, 23);
                    await loadImage(ctx, btnRightSide, btnX + textWidth + 16, canvas.height - 38);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 33)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 38, textWidth + 14, 23);
                    await loadImage(ctx, btnDisabledRightSide, btnX + textWidth + 16, canvas.height - 38);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText, canvas.height - 33, false, ctx.globalAlpha)
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
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnRecMiddle, btnX + 4, canvas.height - 38, text1Width + 10, 23);
                    await loadImage(ctx, btnRecRightSide, btnX + text1Width + 14, canvas.height - 38);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33)
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    await loadImage(ctx, btnRightSide, btnX + text1Width + 16, canvas.height - 38);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    await loadImage(ctx, btnDisabledRightSide, btnX + text1Width + 16, canvas.height - 38);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33, false, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }

                if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnRecMiddle, btnX + btn1Width + 6 + 4, canvas.height - 38, text2Width + 10, 23);
                    await loadImage(ctx, btnRecRightSide, btnX + btn1Width + 6 + text2Width + 14, canvas.height - 38);
                    await drawBitmaps(ctx, button2.name, btnX + 2 + btn1Width + 6 + xToCenterText2, canvas.height - 33)
                } else if (!button2.disabled) {
                    await loadImage(ctx, btnLeftSide, btnX + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnMiddle, btnX + btn1Width + 6 + 2, canvas.height - 38, text2Width + 14, 23);
                    await loadImage(ctx, btnRightSide, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38);
                    await drawBitmaps(ctx, button2.name, btnX + 2 + btn1Width + 6 + xToCenterText2, canvas.height - 33)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, btnX + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnDisabledMiddle, btnX + btn1Width + 6 + 2, canvas.height - 38, text2Width + 14, 23);
                    await loadImage(ctx, btnDisabledRightSide, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button2.name, btnX + 2 + btn1Width + 6 + xToCenterText2, canvas.height - 33, false, ctx.globalAlpha)
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
                    await loadImage(ctx, btnRecLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnRecMiddle, btnX + 4, canvas.height - 38, text1Width + 10, 23);
                    await loadImage(ctx, btnRecRightSide, btnX + text1Width + 14, canvas.height - 38);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33)
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    await loadImage(ctx, btnRightSide, btnX + text1Width + 16, canvas.height - 38);
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, btnX, canvas.height - 38);
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 38, text1Width + 14, 23);
                    await loadImage(ctx, btnDisabledRightSide, btnX + text1Width + 16, canvas.height - 38);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button1.name, btnX + 2 + xToCenterText1, canvas.height - 33, false, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }

                if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnRecMiddle, btnX + btn1Width + 6 + 4, canvas.height - 38, text2Width + 10, 23);
                    await loadImage(ctx, btnRecRightSide, btnX + btn1Width + 6 + text2Width + 14, canvas.height - 38);
                    await drawBitmaps(ctx, button2.name, btnX + 2 + btn1Width + 6 + xToCenterText2, canvas.height - 33)
                } else if (!button2.disabled) {
                    await loadImage(ctx, btnLeftSide, btnX + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnMiddle, btnX + btn1Width + 6 + 2, canvas.height - 38, text2Width + 14, 23);
                    await loadImage(ctx, btnRightSide, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38);
                    await drawBitmaps(ctx, button2.name, btnX + 2 + btn1Width + 6 + xToCenterText2, canvas.height - 33)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, btnX + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnDisabledMiddle, btnX + btn1Width + 6 + 2, canvas.height - 38, text2Width + 14, 23);
                    await loadImage(ctx, btnDisabledRightSide, btnX + btn1Width + 6 + text2Width + 16, canvas.height - 38);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button2.name, btnX + 2 + btn1Width + 6 + xToCenterText2, canvas.height - 33, false, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }

                if (button3.rec) {
                    await loadImage(ctx, btnRecLeftSide, btnX + btn2Width + 6 + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnRecMiddle, btnX + btn2Width + 6 + btn1Width + 6 + 4, canvas.height - 38, text3Width + 10, 23);
                    await loadImage(ctx, btnRecRightSide, btnX + btn2Width + 6 + btn1Width + 6 + text3Width + 14, canvas.height - 38);
                    await drawBitmaps(ctx, button3.name, btnX + 2 + btn2Width + 6 + btn1Width + 6 + xToCenterText3, canvas.height - 33)
                } else if (!button3.disabled) {
                    await loadImage(ctx, btnLeftSide, btnX + btn2Width + 6 + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnMiddle, btnX + btn2Width + 6 + btn1Width + 6 + 2, canvas.height - 38, text3Width + 14, 23);
                    await loadImage(ctx, btnRightSide, btnX + btn2Width + 6 + btn1Width + 6 + text3Width + 16, canvas.height - 38);
                    await drawBitmaps(ctx, button3.name, btnX + 2 + btn2Width + 6 + btn1Width + 6 + xToCenterText3, canvas.height - 33)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, btnX + btn2Width + 6 + btn1Width + 6, canvas.height - 38);
                    await loadImage(ctx, btnDisabledMiddle, btnX + btn2Width + 6 + btn1Width + 6 + 2, canvas.height - 38, text3Width + 14, 23);
                    await loadImage(ctx, btnDisabledRightSide, btnX + btn2Width + 6 + btn1Width + 6 + text3Width + 16, canvas.height - 38);
                    ctx.globalAlpha = .3;
                    await drawBitmaps(ctx, button3.name, btnX + 2 + btn2Width + 6 + btn1Width + 6 + xToCenterText3, canvas.height - 33, false, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }
            }
        }
    }





    if (system == "winxp") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let titleSymbolCodes = fonts["TrebuchetMS"]["bold"]["white"];
            title = title.replaceAll(" ", " ")
            title = title.replaceAll("’", "'")
            title.split("").forEach(char => {
                let arrayChar = titleSymbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            let symbolCodes = fonts["Tahoma"]["regular"]["black"];
            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d")

        let x = 63;
        let testY = 41;
        const lineHeight = 14;

        const contentWidth = testBitmaps(content)

        function testBitmaps(content, isBold = false) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = isBold ? fonts["TrebuchetMS"]["bold"]["chars-width"] : fonts["Tahoma"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["Tahoma"]["regular"]["black"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["Tahoma"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 410) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 410 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    await drawBitmaps(testCtx, line, x, testY)
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            drawBitmaps(testCtx, line, x, testY);
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            drawBitmaps(testCtx, content, x, testY);
            longestLine.lines++;
        }

        if (longestLine.txt.trim() == "") longestLine.lines = 0;
        let canvasWidth = 120;
        let canvasHeight = testY + 60;
        if (longestLine.width > 41) canvasWidth = longestLine.width + 88;
        if (longestLine.width > 410) canvasWidth = 491;
        if (longestLine.lines <= 1 && button1.name != "") canvasHeight = testY + 80;
        if (longestLine.lines <= 1 && button1.name == "") canvasHeight = testY + 48;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = testY + 32;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 34 < btnsWidth) canvasWidth = btnsWidth + 34;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.antialias = "none";
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

        await loadImage(ctx, frameMiddle, 35, 0, canvas.width - 79, 29);
        await loadImage(ctx, frameLeftCorner, 0, 0);
        if (crossDisabled) {
            await loadImage(ctx, frameRightCorner, canvas.width - 44, 0);
        } else {
            await loadImage(ctx, frameWithCross, canvas.width - 44, 0);
        }
        await loadImage(ctx, frameLeft, 0, 29, 3, canvas.height - 32);
        await loadImage(ctx, frameBottom, 4, canvas.height - 3, canvas.width - 7, 3);
        await loadImage(ctx, frameBottomLeftCorner, 0, canvas.height - 3);
        await loadImage(ctx, frameBottomRightCorner, canvas.width - 4, canvas.height - 3);
        await loadImage(ctx, frameRight, canvas.width - 3, 29, 3, canvas.height - 32);

        let y = 43;

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 12, 39, 34, 34)

        async function draw(x, y) {
            if (contentWidth > 410) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 410 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }

        async function drawTitle(ctx, content, x, y) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["TrebuchetMS"]["bold"]["white"]
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y);
                let charsWidthList = fonts["TrebuchetMS"]["bold"]["chars-width"]
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 50 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await draw(x + 2, y - 3);
        await drawTitle(ctx, title, 4, 7);

        let btnLeft = assets["btn-left"];
        let btnMiddle = assets["btn-middle"];
        let btnRight = assets["btn-right"];

        let btnDisabledLeft = assets["btn-disabled-left"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRight = assets["btn-disabled-right"];

        let btnRecLeft = assets["btn-rec-left"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRight = assets["btn-rec-right"];

        if (button1.name != "") {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth <= 58) textWidth = 58;
                let btnWidth = textWidth + 14;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btnWidth) / 2);
                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 37, textWidth + 12, 20);
                    await loadImage(ctx, btnDisabledLeft, btnX, canvas.height - 37);
                    await loadImage(ctx, btnDisabledRight, btnX + 14 + textWidth, canvas.height - 37)
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 37, textWidth + 12, 20);
                    await loadImage(ctx, btnRecLeft, btnX, canvas.height - 37);
                    await loadImage(ctx, btnRecRight, btnX + 14 + textWidth, canvas.height - 37);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 34);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, textWidth + 12, 20);
                    await loadImage(ctx, btnLeft, btnX, canvas.height - 37);
                    await loadImage(ctx, btnRight, btnX + 14 + textWidth, canvas.height - 37);
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
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    await loadImage(ctx, btnDisabledLeft, btnX, canvas.height - 37);
                    await loadImage(ctx, btnDisabledRight, btnX + 14 + text1Width, canvas.height - 37);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    await loadImage(ctx, btnRecLeft, btnX, canvas.height - 37);
                    await loadImage(ctx, btnRecRight, btnX + 14 + text1Width, canvas.height - 37);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    await loadImage(ctx, btnLeft, btnX, canvas.height - 37);
                    await loadImage(ctx, btnRight, btnX + 14 + text1Width, canvas.height - 37);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                }

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2 + 7 + btn1Width, canvas.height - 37, text2Width + 12, 20);
                    await loadImage(ctx, btnDisabledLeft, btnX + 7 + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnDisabledRight, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 7 + btn1Width + 2, canvas.height - 37, text2Width + 12, 20);
                    await loadImage(ctx, btnRecLeft, btnX + 7 + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRecRight, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 7 + btn1Width + 2, canvas.height - 37, text2Width + 12, 20);
                    await loadImage(ctx, btnLeft, btnX + 7 + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRight, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
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
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    await loadImage(ctx, btnDisabledLeft, btnX, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnDisabledRight, btnX + 14 + text1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    await loadImage(ctx, btnRecLeft, btnX, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRecRight, btnX + 14 + text1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 37, text1Width + 12, 20);
                    await loadImage(ctx, btnLeft, btnX, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRight, btnX + 14 + text1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 34);
                }

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2 + 7 + btn1Width, canvas.height - 37, text2Width + 12, 20);
                    await loadImage(ctx, btnDisabledLeft, btnX + 7 + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnDisabledRight, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 7 + btn1Width + 2, canvas.height - 37, text2Width + 12, 20);
                    await loadImage(ctx, btnRecLeft, btnX + 7 + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRecRight, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 7 + btn1Width + 2, canvas.height - 37, text2Width + 12, 20);
                    await loadImage(ctx, btnLeft, btnX + 7 + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRight, btnX + 14 + 7 + btn1Width + text2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 34);
                }

                if (button3.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2 + 14 + btn1Width + btn2Width, canvas.height - 37, text3Width + 12, 20);
                    await loadImage(ctx, btnDisabledLeft, btnX + 14 + btn1Width + btn2Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnDisabledRight, btnX + 14 + 14 + btn1Width + btn2Width + text3Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button3.name, btnX + 14 + btn1Width + btn2Width + xToCenterText3, canvas.height - 34, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 14 + btn2Width + btn1Width + 2, canvas.height - 37, text3Width + 12, 20);
                    await loadImage(ctx, btnRecLeft, btnX + 14 + btn2Width + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRecRight, btnX + 14 + 14 + btn2Width + btn1Width + text3Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button3.name, btnX + 14 + btn2Width + btn1Width + xToCenterText3, canvas.height - 34);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 14 + btn2Width + btn1Width + 2, canvas.height - 37, text3Width + 12, 20);
                    await loadImage(ctx, btnLeft, btnX + 14 + btn2Width + btn1Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await loadImage(ctx, btnRight, btnX + 14 + 14 + btn2Width + btn1Width + text3Width, canvas.height - 37);
                    ctx.scale(-1, 1);
                    await drawBitmaps(ctx, button3.name, btnX + 14 + btn2Width + btn1Width + xToCenterText3, canvas.height - 34);
                }
            }
        }
    }





    if (system == "winlh-4093") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["Tahoma"]["regular"]["black"];
            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        let drawWhiteText = false;

        let testCanvas = document.getElementById("test-canvas");
        const testCtx = testCanvas.getContext("2d");

        function testBitmaps(content, isBold = false) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = fonts["Tahoma"][isBold ? "bold" : "regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, isBold = false, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let textColor = drawWhiteText ? "white" : "black"
                let symbolsData = isBold ? fonts["Tahoma"]["bold"]["white"] : fonts["Tahoma"]["regular"][textColor];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["Tahoma"][isBold ? "bold" : "regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)] + 1;
            }
        }

        const contentWidth = testBitmaps(content)

        let x = 63;
        let testY = 32;
        const lineHeight = 14;

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 286) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 286 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            longestLine.lines++;
        }

        if (longestLine.txt.trim() == "") longestLine.lines = 0;
        let canvasWidth = 120;
        let canvasHeight = testY + 60;
        if (longestLine.width > 41) canvasWidth = longestLine.width + 78;
        if (longestLine.width > 286) canvasWidth = 364;
        if (longestLine.lines <= 1 && button1.name != "") canvasHeight = testY + 80;
        if (longestLine.lines <= 1 && button1.name == "") canvasHeight = testY + 48;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = testY + 32;
        if (longestLine.lines > 1 && button1.name != "") canvasHeight = testY + 69;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 36 < btnsWidth) canvasWidth = btnsWidth + 36;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx = canvas.getContext("2d");

        ctx.antialias = "none";
        ctx.fillStyle = "#e9e9e9";
        ctx.fillRect(3, 23, canvas.width, canvas.height);

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 13, 34, 34, 34)

        let frameLeftCorner = assets["frame-left-corner"];
        let frameRightCorner = assets[crossDisabled ? "frame-right-corner-no-cross" : "frame-right-corner"];
        let frameLeft = assets["frame-left-side"];
        let frameRight = assets["frame-right-side"];
        let frameBottomLeftCorner = assets["frame-bottom-left-corner"];
        let frameBottomRightCorner = assets["frame-bottom-right-corner"];
        let frameTop = assets["frame-top"];
        let frameBottom = assets["frame-bottom"];

        await loadImage(ctx, frameLeftCorner, 0, 0);
        await loadImage(ctx, frameRightCorner, canvas.width - 20, 0);
        await loadImage(ctx, frameTop, 20, 0, canvas.width - 40, 23);
        await loadImage(ctx, frameBottomLeftCorner, 0, canvas.height - 3);
        await loadImage(ctx, frameLeft, 0, 23, 3, canvas.height - 26);
        await loadImage(ctx, frameRight, canvas.width - 3, 23, 3, canvas.height - 26);
        await loadImage(ctx, frameBottomRightCorner, canvas.width - 3, canvas.height - 3);
        await loadImage(ctx, frameBottom, 3, canvas.height - 3, canvas.width - 6, 3);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 40 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        let y = 32;

        async function draw(x, y) {
            if (contentWidth > 286) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 286 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }
        drawWhiteText = false;
        await draw(x + 2, y + 2);

        let btnLeft = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRight = assets["btn-right-side"];

        let btnRecLeft = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRight = assets["btn-rec-right-side"];

        let btnDisabledLeft = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRight = assets["btn-disabled-right-side"];

        if (button1.name != "") {
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth <= 57) textWidth = 57;
                let btnWidth = textWidth + 16;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) + 2;

                let btnX = Math.ceil((canvas.width - btnWidth) / 2);
                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 36, textWidth + 14, 21);
                    await loadImage(ctx, btnDisabledLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnDisabledRight, btnX + 16 + textWidth, canvas.height - 36);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 36, textWidth + 14, 21);
                    await loadImage(ctx, btnRecLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRecRight, btnX + 16 + textWidth, canvas.height - 36);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 36, textWidth + 14, 21);
                    await loadImage(ctx, btnLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRight, btnX + 16 + textWidth, canvas.height - 36);
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
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    await loadImage(ctx, btnDisabledLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnDisabledRight, btnX + 16 + text1Width, canvas.height - 36);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    await loadImage(ctx, btnRecLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRecRight, btnX + 16 + text1Width, canvas.height - 36);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    await loadImage(ctx, btnLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRight, btnX + 16 + text1Width, canvas.height - 36);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                }

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2 + 8 + btn1Width, canvas.height - 36, text2Width + 14, 21);
                    await loadImage(ctx, btnDisabledLeft, btnX + 8 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnDisabledRight, btnX + 16 + 8 + btn1Width + text2Width, canvas.height - 36);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    await loadImage(ctx, btnRecLeft, btnX + 8 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRecRight, btnX + 16 + 8 + btn1Width + text2Width, canvas.height - 36);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    await loadImage(ctx, btnLeft, btnX + 8 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRight, btnX + 16 + 8 + btn1Width + text2Width, canvas.height - 36);
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
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    await loadImage(ctx, btnDisabledLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnDisabledRight, btnX + 16 + text1Width, canvas.height - 36);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    await loadImage(ctx, btnRecLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRecRight, btnX + 16 + text1Width, canvas.height - 36);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 2, canvas.height - 36, text1Width + 14, 21);
                    await loadImage(ctx, btnLeft, btnX, canvas.height - 36);
                    await loadImage(ctx, btnRight, btnX + 16 + text1Width, canvas.height - 36);
                    await drawBitmaps(ctx, button1.name, btnX + xToCenterText1, canvas.height - 32);
                }

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2 + 8 + btn1Width, canvas.height - 36, text2Width + 14, 21);
                    await loadImage(ctx, btnDisabledLeft, btnX + 8 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnDisabledRight, btnX + 16 + 8 + btn1Width + text2Width, canvas.height - 36);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    await loadImage(ctx, btnRecLeft, btnX + 8 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRecRight, btnX + 16 + 8 + btn1Width + text2Width, canvas.height - 36);
                    await drawBitmaps(ctx, button2.name, btnX + 7 + btn1Width + xToCenterText2, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 8 + btn1Width + 2, canvas.height - 36, text2Width + 14, 21);
                    await loadImage(ctx, btnLeft, btnX + 8 + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRight, btnX + 16 + 8 + btn1Width + text2Width, canvas.height - 36);
                    await drawBitmaps(ctx, button2.name, btnX + 8 + btn1Width + xToCenterText2, canvas.height - 32);
                }

                if (button3.disabled) {
                    await loadImage(ctx, btnDisabledMiddle, btnX + 2 + 16 + btn1Width + btn2Width, canvas.height - 36, text3Width + 14, 21);
                    await loadImage(ctx, btnDisabledLeft, btnX + 16 + btn1Width + btn2Width, canvas.height - 36);
                    await loadImage(ctx, btnDisabledRight, btnX + 16 + 16 + btn1Width + btn2Width + text3Width, canvas.height - 36);
                    ctx.globalAlpha = .34;
                    await drawBitmaps(ctx, button3.name, btnX + 16 + btn1Width + btn2Width + xToCenterText3, canvas.height - 32, false, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    await loadImage(ctx, btnRecMiddle, btnX + 16 + btn2Width + btn1Width + 2, canvas.height - 36, text3Width + 14, 21);
                    await loadImage(ctx, btnRecLeft, btnX + 16 + btn2Width + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRecRight, btnX + 16 + 16 + btn2Width + btn1Width + text3Width, canvas.height - 36);
                    await drawBitmaps(ctx, button3.name, btnX + 16 + btn2Width + btn1Width + xToCenterText3, canvas.height - 32);
                } else {
                    await loadImage(ctx, btnMiddle, btnX + 16 + btn2Width + btn1Width + 2, canvas.height - 36, text3Width + 14, 21);
                    await loadImage(ctx, btnLeft, btnX + 16 + btn2Width + btn1Width, canvas.height - 36);
                    await loadImage(ctx, btnRight, btnX + 16 + 16 + btn2Width + btn1Width + text3Width, canvas.height - 36);
                    await drawBitmaps(ctx, button3.name, btnX + 16 + btn2Width + btn1Width + xToCenterText3, canvas.height - 32);
                }
            }
        }

        testCanvas.width = !testBitmaps(title, true) ? 1 : testBitmaps(title, true) + 12;
        testCanvas.height = 23;

        testCtx.shadowColor = 'rgba(0,0,0)';
        testCtx.shadowOffsetX = 0;
        testCtx.shadowOffsetY = 0;
        testCtx.shadowBlur = 2;

        drawWhiteText = true;
        await drawBitmaps(testCtx, title, 6, 6, true)
        await drawBitmaps(testCtx, title, 6, 6, true)

        function putTitle() {
            let titleImgData = testCanvas.toDataURL();
            let titleImg = new Image();
            titleImg.src = titleImgData;
            titleImg.onload = () => {
                ctx.drawImage(titleImg, 0, 0)
            }
        };

        setTimeout(putTitle, 1)
    }




    if (system == "win7") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        let testCanvas = document.getElementById("test-canvas");
        const testCtx = testCanvas.getContext("2d");

        function checkChars() {
            let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
            title = title.replaceAll(" ", " ");
            title = title.replaceAll("’", "'");
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        function testBitmaps(content) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["SegoeUI_9pt"]["regular"]["black"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
        }

        let x = 70;
        let testY = 56;
        const lineHeight = 16;
        const contentWidth = testBitmaps(content)

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 405) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 405 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            longestLine.lines++;
        }

        let canvasWidth = 180;
        let canvasHeight = testY + 85 + 13;
        if (longestLine.width > canvasWidth - 108) canvasWidth = longestLine.width + 108;
        if (button1.name != "" && longestLine.lines <= 1) canvasHeight = canvasHeight + 8;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = canvasHeight - 35;
        if (longestLine.lines == 1 && button1.name == "") canvasHeight = canvasHeight - 21;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 68 < btnsWidth) canvasWidth = btnsWidth + 68;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

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

        await loadImage(ctx, aeroLeftCorner, 0, 0);
        await loadImage(ctx, aeroRightCorner, canvas.width - 73, 0);
        await loadImage(ctx, aeroTop, 57, 0, canvas.width - 130, 42);
        await loadImage(ctx, aeroLeftSideGradient, 0, 42);
        if (!(canvas.height - 133 <= 1)) {
            await loadImage(ctx, aeroLeftSide, 0, 58, 21, canvas.height - 133);
            await loadImage(ctx, aeroRightSide, canvas.width - 25, 58, 25, canvas.height - 133);
        }
        await loadImage(ctx, aeroLeftDark, 0, canvas.height - 75);
        await loadImage(ctx, aeroRightDark, canvas.width - 25, canvas.height - 75);
        await loadImage(ctx, aeroBottomLeft, 0, canvas.height - 26);
        await loadImage(ctx, aeroBottomRight, canvas.width - 25, canvas.height - 26);
        await loadImage(ctx, aeroBottom, 21, canvas.height - 26, canvas.width - 46, 26);
        await loadImage(ctx, aeroRightSideGradient, canvas.width - 25, 42);

        ctx.fillStyle = "white";
        ctx.fillRect(21, 42, canvas.width - 46, canvas.height - 68)

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 30, 51)

        let y = 56;

        async function draw(x, y) {
            if (contentWidth > 405) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 405 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }

        await draw(x, y);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 115 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        testCanvas.width = testBitmaps(title) ? testBitmaps(title) + 36 : 1
        testCanvas.height = 42;

        testCtx.shadowColor = 'rgba(255,255,255)';
        testCtx.shadowOffsetX = 0;
        testCtx.shadowOffsetY = 0;
        testCtx.shadowBlur = 9;
        await drawBitmaps(testCtx, title, 18, 18);
        await drawBitmaps(testCtx, title, 18, 18);
        await drawBitmaps(testCtx, title, 18, 18);
        await drawBitmaps(testCtx, title, 18, 18);

        function putTitle() {
            let titleImgData = testCanvas.toDataURL();
            let titleImg = new Image();
            titleImg.src = titleImgData;
            titleImg.onload = () => {
                ctx.drawImage(titleImg, 0, 0)
            }
        };

        setTimeout(putTitle, 1)

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name != "") {
            let btnRowBG = assets["btn-row-bg"];
            await loadImage(ctx, btnRowBG, 21, canvas.height - 67, canvas.width - 46, 41)

            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 56) textWidth = 56;

                let btnWidth = textWidth + 10;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2)

                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 36 - btnWidth, canvas.height - 57);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 36 - btnWidth + 2, canvas.height - 57, textWidth + 8, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 26 - btnWidth + textWidth, canvas.height - 57);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btnWidth + xToCenterText, canvas.height - 55, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 36 - btnWidth, canvas.height - 57);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 36 - btnWidth + 3, canvas.height - 57, textWidth + 7, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 26 - btnWidth + textWidth, canvas.height - 57);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btnWidth + xToCenterText, canvas.height - 55)
                } else {
                    await loadImage(ctx, btnLeftSide, canvas.width - 36 - btnWidth, canvas.height - 57);
                    await loadImage(ctx, btnMiddle, canvas.width - 36 - btnWidth + 3, canvas.height - 57, textWidth + 7, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 26 - btnWidth + textWidth, canvas.height - 57);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btnWidth + xToCenterText, canvas.height - 55)
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;

                let btn1Width = text1Width + 10;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2)

                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 36 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 36 - btn1Width + 2, canvas.height - 57, text1Width + 8, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 55, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 36 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 55);
                } else {
                    await loadImage(ctx, btnLeftSide, canvas.width - 36 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnMiddle, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 55);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;

                let btn2Width = text2Width + 10;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2)

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 36 - btn2Width + 2 - 8 - btn1Width, canvas.height - 57, text2Width + 8, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - 8 - btn1Width - btn2Width + xToCenterText2, canvas.height - 55, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - 8 - btn1Width - btn2Width + xToCenterText2, canvas.height - 55);
                } else {
                    await loadImage(ctx, btnLeftSide, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnMiddle, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - 8 - btn1Width - btn2Width + xToCenterText2, canvas.height - 55);
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 56) text1Width = 56;

                let btn1Width = text1Width + 10;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2)

                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 36 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 36 - btn1Width + 2, canvas.height - 57, text1Width + 8, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 55, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 36 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 55);
                } else {
                    await loadImage(ctx, btnLeftSide, canvas.width - 36 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnMiddle, canvas.width - 36 - btn1Width + 3, canvas.height - 57, text1Width + 7, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 26 - btn1Width + text1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button1.name, canvas.width - 38 - btn1Width + xToCenterText1, canvas.height - 55);
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 56) text2Width = 56;

                let btn2Width = text2Width + 10;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) + 1;

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 36 - btn2Width + 2 - 8 - btn1Width, canvas.height - 57, text2Width + 8, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - 8 - btn1Width - btn2Width + xToCenterText2, canvas.height - 55, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - 8 - btn1Width - btn2Width + xToCenterText2, canvas.height - 55);
                } else {
                    await loadImage(ctx, btnLeftSide, canvas.width - 36 - btn2Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnMiddle, canvas.width - 36 - btn2Width + 3 - 8 - btn1Width, canvas.height - 57, text2Width + 7, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 26 - btn2Width + text2Width - 8 - btn1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button2.name, canvas.width - 38 - 8 - btn1Width - btn2Width + xToCenterText2, canvas.height - 55);
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 56) text3Width = 56;

                let btn3Width = text3Width + 10;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2)

                if (button3.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 36 - 8 - btn2Width - btn3Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 36 - 8 - btn2Width - btn3Width + 2 - 8 - btn1Width, canvas.height - 57, text3Width + 8, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 26 - 8 - btn2Width - btn3Width + text3Width - 8 - btn1Width, canvas.height - 57);
                    ctx.globalAlpha = .29;
                    await drawBitmaps(ctx, button3.name, canvas.width - 38 - 8 - btn2Width - 8 - btn1Width - btn3Width + xToCenterText3, canvas.height - 55, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                } else if (button3.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 36 - 8 - btn2Width - btn3Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 36 - 8 - btn2Width - btn3Width + 3 - 8 - btn1Width, canvas.height - 57, text3Width + 7, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 26 - 8 - btn2Width - btn3Width + text3Width - 8 - btn1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button3.name, canvas.width - 38 - 8 - btn2Width - 8 - btn1Width - btn3Width + xToCenterText3, canvas.height - 55);
                } else {
                    await loadImage(ctx, btnLeftSide, canvas.width - 36 - 8 - btn2Width - btn3Width - 8 - btn1Width, canvas.height - 57);
                    await loadImage(ctx, btnMiddle, canvas.width - 36 - 8 - btn2Width - btn3Width + 3 - 8 - btn1Width, canvas.height - 57, text3Width + 7, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 26 - 8 - btn2Width - btn3Width + text3Width - 8 - btn1Width, canvas.height - 57);
                    await drawBitmaps(ctx, button3.name, canvas.width - 38 - 8 - btn2Width - 8 - btn1Width - btn3Width + xToCenterText3, canvas.height - 55);
                }
            }
        }
    }







    if (system == "win8") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
            title = title.replaceAll(" ", " ");
            title = title.replaceAll("’", "'");
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            content.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        function testBitmaps(content, isLarge = false) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let fontSize = isLarge ? 11 : 9;
                let charsWidthList = fonts[`SegoeUI_${fontSize}pt`]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["SegoeUI_9pt"]["regular"]["black"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
        }

        async function drawTitle(ctx, content, x, y) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["SegoeUI_11pt"]["regular"]["black"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y);
                let charsWidthList = fonts["SegoeUI_11pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
        }

        let testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d");

        let x = 57;
        let testY = 45;
        const lineHeight = 16;
        const contentWidth = testBitmaps(content)

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 494) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 494 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            longestLine.lines++;
        }

        let canvasWidth = 136;
        let canvasHeight = testY + 85;
        if (longestLine.width > canvasWidth - 79) canvasWidth = longestLine.width + 79;
        if (button1.name != "" && longestLine.lines <= 1) canvasHeight = canvasHeight + 8;
        if (longestLine.lines > 1 && button1.name == "" ||
            longestLine.lines <= 1 && button1.name == "") canvasHeight = canvasHeight - 35;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 38 < btnsWidth) canvasWidth = btnsWidth + 38;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, 31)
        ctx.fillRect(0, canvas.height - 8, canvas.width, 8)
        ctx.fillRect(0, 31, 8, canvas.height)
        ctx.fillRect(canvas.width - 8, 31, 8, canvas.height)

        ctx.strokeStyle = 'rgba(0,0,0,.24)';
        ctx.fillStyle = 'rgba(0,0,0,.24)';
        ctx.lineWidth = 2;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
        ctx.fillRect(7, 30, canvas.width - 14, 1);
        ctx.fillRect(7, 31, 1, canvas.height - 39);
        ctx.fillRect(7, 31 + canvas.height - 39, canvas.width - 14, 1);
        ctx.fillRect(8 + canvas.width - 16, 31, 1, canvas.height - 39);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(8, 31, canvas.width - 16, canvas.height - 39)

        let cross = assets["cross"];
        await loadImage(ctx, cross, canvas.width - 38, 1, null, null, crossDisabled ? .5 : 1);

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 17, 40)

        let y = 45;

        async function draw(x, y) {
            if (contentWidth > 494) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 494 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }
        await draw(x, y);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 95 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        let titleWidth = testBitmaps(title, true);
        let titleX = Math.round((canvas.width - titleWidth) / 2) - 4;
        await drawTitle(ctx, title, titleX, 3);

        if (button1.name != "") {
            let btnLeftSide = assets["btn-left-side"];
            let btnMiddle = assets["btn-middle"];
            let btnRightSide = assets["btn-right-side"];

            let btnDisabledLeftSide = assets["btn-disabled-left-side"];
            let btnDisabledMiddle = assets["btn-disabled-middle"];
            let btnDisabledRightSide = assets["btn-disabled-right-side"];

            let btnRecLeftSide = assets["btn-rec-left-side"];
            let btnRecMiddle = assets["btn-rec-middle"];
            let btnRecRightSide = assets["btn-rec-right-side"];

            let btnRowBG = assets["btn-row-bg"];
            await loadImage(ctx, btnRowBG, 8, canvas.height - 49, canvas.width - 16, 41);

            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 36) textWidth = 36;
                let btnWidth = textWidth + 30;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 4;

                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 17 - btnWidth, canvas.height - 39);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 17 - btnWidth + 2, canvas.height - 39, btnWidth - 4, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 19, canvas.height - 39);
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 17 - btnWidth, canvas.height - 39);
                    await loadImage(ctx, btnMiddle, canvas.width - 17 - btnWidth + 2, canvas.height - 39, btnWidth - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 19, canvas.height - 39);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 17 - btnWidth, canvas.height - 39);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 17 - btnWidth + 2, canvas.height - 39, btnWidth - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 19, canvas.height - 39);
                    ctx.globalAlpha = .45;
                }

                await drawBitmaps(ctx, button1.name, canvas.width - 15 - btnWidth + xToCenterText, canvas.height - 37, ctx.globalAlpha);
                ctx.globalAlpha = 1;
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 4;

                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 17 - btn1Width, canvas.height - 39);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 19, canvas.height - 39);
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 17 - btn1Width, canvas.height - 39);
                    await loadImage(ctx, btnMiddle, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 19, canvas.height - 39);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 17 - btn1Width, canvas.height - 39);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 19, canvas.height - 39);
                    ctx.globalAlpha = .45;
                }

                await drawBitmaps(ctx, button1.name, canvas.width - 15 - btn1Width + xToCenterText1, canvas.height - 37, ctx.globalAlpha);
                ctx.globalAlpha = 1;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 4;

                if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 8 - btn1Width - 19, canvas.height - 39);
                } else if (!button2.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39);
                    await loadImage(ctx, btnMiddle, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 8 - btn1Width - 19, canvas.height - 39);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn1Width - 19, canvas.height - 39);
                    ctx.globalAlpha = .45;
                }

                await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 15 - btn2Width + xToCenterText2, canvas.height - 37, ctx.globalAlpha);
                ctx.globalAlpha = 1;
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;
                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 4;

                if (button1.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 17 - btn1Width, canvas.height - 39);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 19, canvas.height - 39);
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 17 - btn1Width, canvas.height - 39);
                    await loadImage(ctx, btnMiddle, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 19, canvas.height - 39);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 17 - btn1Width, canvas.height - 39);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 17 - btn1Width + 2, canvas.height - 39, btn1Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 19, canvas.height - 39);
                    ctx.globalAlpha = .45;
                }

                await drawBitmaps(ctx, button1.name, canvas.width - 15 - btn1Width + xToCenterText1, canvas.height - 37, ctx.globalAlpha);
                ctx.globalAlpha = 1;

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 4;

                if (button2.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 8 - btn1Width - 19, canvas.height - 39);
                } else if (!button2.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39);
                    await loadImage(ctx, btnMiddle, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 8 - btn1Width - 19, canvas.height - 39);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn1Width - 17 - btn2Width, canvas.height - 39);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn1Width - 17 - btn2Width + 2, canvas.height - 39, btn2Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn1Width - 19, canvas.height - 39);
                    ctx.globalAlpha = .45;
                }

                await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 15 - btn2Width + xToCenterText2, canvas.height - 37, ctx.globalAlpha);
                ctx.globalAlpha = 1;

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) - 4;

                if (button3.rec) {
                    await loadImage(ctx, btnRecLeftSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width, canvas.height - 39);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width + 2, canvas.height - 39, btn3Width - 4, 21);
                    await loadImage(ctx, btnRecRightSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 19, canvas.height - 39);
                } else if (!button3.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width, canvas.height - 39);
                    await loadImage(ctx, btnMiddle, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width + 2, canvas.height - 39, btn3Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 19, canvas.height - 39);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width, canvas.height - 39);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn2Width - 8 - btn1Width - 17 - btn3Width + 2, canvas.height - 39, btn3Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 19, canvas.height - 39);
                    ctx.globalAlpha = .45;
                }

                await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 15 - btn3Width + xToCenterText3, canvas.height - 37, ctx.globalAlpha);
                ctx.globalAlpha = 1;
            }
        }
    }





    if (system == "win10") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
            title = title.replaceAll(" ", " ");
            title = title.replaceAll("’", "'");
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d");

        function testBitmaps(content) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["SegoeUI_9pt"]["regular"]["black"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
        }

        let x = 67;
        let testY = 61;
        const lineHeight = 16;
        const contentWidth = testBitmaps(content)

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 490) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 490 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            longestLine.lines++;
        }

        let canvasWidth = 158;
        let canvasHeight = testY + 96;
        if (longestLine.width > canvasWidth - 105) canvasWidth = longestLine.width + 105;
        if (button1.name != "" && longestLine.lines <= 2) canvasHeight = canvasHeight + 11;
        if (longestLine.lines > 1 && button1.name == "" ||
            longestLine.lines <= 1 && button1.name == "") canvasHeight = canvasHeight - 23;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 64 < btnsWidth) canvasWidth = btnsWidth + 64;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.antialias = "none";
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

        await loadImage(ctx, frameLeftCorner, 0, 0);
        await loadImage(ctx, frameTop, 18, 0, canvas.width - 40, 17);
        await loadImage(ctx, frameRightCorner, canvas.width - 22, 0);
        await loadImage(ctx, frameLeftSide, 0, 17, 18, canvas.height - 41);
        await loadImage(ctx, frameRightSide, canvas.width - 22, 17, 22, canvas.height - 41);
        await loadImage(ctx, frameBottomLeftCorner, 0, canvas.height - 24);
        await loadImage(ctx, frameBottomRightCorner, canvas.width - 22, canvas.height - 24);
        await loadImage(ctx, frameBottom, 18, canvas.height - 24, canvas.width - 40, 24);

        let y = 61;

        ctx.fillRect(18, 17, canvas.width - 40, canvas.height - 41)

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 95 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 23, 23)

        if (crossDisabled) ctx.globalAlpha = .41;
        await loadImage(ctx, cross, canvas.width - 47, 26)
        ctx.globalAlpha = 1;

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 28, 57, 32, 32)

        async function draw(x, y) {
            if (contentWidth > 490) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 490 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }

        await draw(x, y);

        let btnRowBG = assets["btn-row-bg"];

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name != "") {
            await loadImage(ctx, btnRowBG, 18, canvas.height - 65, canvas.width - 40, 41)
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 36) textWidth = 36;
                let btnWidth = textWidth + 30;
                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 2;

                if (button1.rec) {
                    await loadImage(ctx, btnRecSide, canvas.width - 33 - btnWidth, canvas.height - 55);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 33 - btnWidth + 2, canvas.height - 55, btnWidth - 4, 21);
                    await loadImage(ctx, btnRecSide, canvas.width - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btnWidth + xToCenterText, canvas.height - 53)
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 33 - btnWidth, canvas.height - 55);
                    await loadImage(ctx, btnMiddle, canvas.width - 33 - btnWidth + 2, canvas.height - 55, btnWidth - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btnWidth + xToCenterText, canvas.height - 53)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 33 - btnWidth, canvas.height - 55);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 33 - btnWidth + 2, canvas.height - 55, btnWidth - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 33 - 2, canvas.height - 55);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btnWidth + xToCenterText, canvas.height - 53, ctx.globalAlpha)
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
                    await loadImage(ctx, btnRecSide, canvas.width - 33 - btn1Width, canvas.height - 55);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    await loadImage(ctx, btnRecSide, canvas.width - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 53)
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 33 - btn1Width, canvas.height - 55);
                    await loadImage(ctx, btnMiddle, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 53)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 33 - btn1Width, canvas.height - 55);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 33 - 2, canvas.height - 55);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 53, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 2;

                if (button2.rec) {
                    await loadImage(ctx, btnRecSide, canvas.width - btn1Width - 8 - 33 - btn2Width, canvas.height - 55);
                    await loadImage(ctx, btnRecMiddle, canvas.width - btn1Width - 8 - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    await loadImage(ctx, btnRecSide, canvas.width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button2.name, canvas.width - btn1Width - 8 - 33 - btn2Width + xToCenterText2, canvas.height - 53);
                } else if (!button2.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - btn1Width - 8 - 33 - btn2Width, canvas.height - 55);
                    await loadImage(ctx, btnMiddle, canvas.width - btn1Width - 8 - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button2.name, canvas.width - btn1Width - 8 - 33 - btn2Width + xToCenterText2, canvas.height - 53);
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - btn1Width - 8 - 33 - btn2Width, canvas.height - 55);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - btn1Width - 8 - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button2.name, canvas.width - btn1Width - 8 - 33 - btn2Width + xToCenterText2, canvas.height - 53, ctx.globalAlpha);
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
                    await loadImage(ctx, btnRecSide, canvas.width - 33 - btn1Width, canvas.height - 55);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    await loadImage(ctx, btnRecSide, canvas.width - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 53)
                } else if (!button1.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 33 - btn1Width, canvas.height - 55);
                    await loadImage(ctx, btnMiddle, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 53)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 33 - btn1Width, canvas.height - 55);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 33 - btn1Width + 2, canvas.height - 55, btn1Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 33 - 2, canvas.height - 55);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button1.name, canvas.width - 33 - btn1Width + xToCenterText1, canvas.height - 53, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;
                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 2;

                if (button2.rec) {
                    await loadImage(ctx, btnRecSide, canvas.width - btn1Width - 8 - 33 - btn2Width, canvas.height - 55);
                    await loadImage(ctx, btnRecMiddle, canvas.width - btn1Width - 8 - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    await loadImage(ctx, btnRecSide, canvas.width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button2.name, canvas.width - btn1Width - 8 - 33 - btn2Width + xToCenterText2, canvas.height - 53)
                } else if (!button2.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - btn1Width - 8 - 33 - btn2Width, canvas.height - 55);
                    await loadImage(ctx, btnMiddle, canvas.width - btn1Width - 8 - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button2.name, canvas.width - btn1Width - 8 - 33 - btn2Width + xToCenterText2, canvas.height - 53)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - btn1Width - 8 - 33 - btn2Width, canvas.height - 55);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - btn1Width - 8 - 33 - btn2Width + 2, canvas.height - 55, btn2Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button2.name, canvas.width - btn1Width - 8 - 33 - btn2Width + xToCenterText2, canvas.height - 53, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;
                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) - 2;

                if (button3.rec) {
                    await loadImage(ctx, btnRecSide, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width, canvas.height - 55);
                    await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width + 2, canvas.height - 55, btn3Width - 4, 21);
                    await loadImage(ctx, btnRecSide, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width + xToCenterText3, canvas.height - 53)
                } else if (!button3.disabled) {
                    await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width, canvas.height - 55);
                    await loadImage(ctx, btnMiddle, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width + 2, canvas.height - 55, btn3Width - 4, 21);
                    await loadImage(ctx, btnRightSide, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width + xToCenterText3, canvas.height - 53)
                } else {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width, canvas.height - 55);
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width + 2, canvas.height - 55, btn3Width - 4, 21);
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - 2, canvas.height - 55);
                    ctx.globalAlpha = .37;
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - btn1Width - 8 - 33 - btn3Width + xToCenterText3, canvas.height - 53, ctx.globalAlpha);
                    ctx.globalAlpha = 1;
                }
            }
        }
    }






    if (system == "win11") {
        if (button2) {
            if (button1.name == "" && button2.name != "") {
                button1 = button2;
                button2 = null;
            }
        }
        if (button3 && button2) {
            if (button1.name == "" && button2.name != "" && button3.name != "") {
                button1 = button2;
                button2 = button3;
                button3 = null;
            }
        }
        if (button3 && !button2) {
            if (button1.name != "" && button3.name != "") {
                button2 = button3;
                button3 = null;
            }
            if (button1.name == "" && button3.name != "") {
                button1 = button3;
                button2 = null;
                button3 = null;
            }
        }

        function checkChars() {
            let symbolCodes = fonts["SegoeUI_9pt"]["regular"]["black"];
            title = title.replaceAll(" ", " ");
            title = title.replaceAll("’", "'");
            title.split("").forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) title = title.replaceAll(char, "□")
            })

            content = content.replaceAll(" ", " ")
            content = content.replaceAll("’", "'")
            let chars = content.split("");
            chars.forEach(char => {
                let arrayChar = symbolCodes.filter(c => c.charID == char.charCodeAt(0))[0]
                if (!arrayChar) content = content.replaceAll(char, "□")
            })
        }

        checkChars()

        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext("2d");

        function testBitmaps(content) {
            let chars = content.split("");
            if (chars[chars.length - 1] == "") chars.pop();
            let charsWidth = 0;
            for (const char of chars) {
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
            return charsWidth;
        }

        async function drawBitmaps(ctx, content, x, y, a) {
            let chars = content.split("");
            let charsWidth = 0;
            for (const char of chars) {
                let symbolsData = fonts["SegoeUI_9pt"]["regular"]["black"];
                let charData = symbolsData.filter(c => c.charID == char.charCodeAt(0))[0].data
                await loadImage(ctx, charData, x + charsWidth, y, null, null, a);
                let charsWidthList = fonts["SegoeUI_9pt"]["regular"]["chars-width"];
                charsWidth += charsWidthList[char.charCodeAt(0)];
            }
        }

        let x = 96;
        let testY = 77;
        const lineHeight = 16;
        const contentWidth = testBitmaps(content)

        let longestLine = { width: 0, txt: "", lines: 0 };

        if (contentWidth > 494) {
            let words = content.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                let testWidth = testBitmaps(testLine);

                if (testWidth > 494 && i > 0) {
                    let lineWidth = testBitmaps(line);
                    longestLine.lines++;
                    if (lineWidth > longestLine.width) longestLine.width = lineWidth;
                    longestLine.txt = line;
                    line = words[i] + ' ';
                    testY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            longestLine.lines++;
        } else {
            longestLine.width = contentWidth;
            longestLine.lines++;
        }

        let canvasWidth = 214;
        let canvasHeight = testY + 152;
        if (longestLine.width > canvasWidth - 160) canvasWidth = longestLine.width + 160;
        if (button1.name != "" && longestLine.lines == 2) canvasHeight = canvasHeight + 18;
        if (longestLine.lines > 1 && button1.name == "") canvasHeight = canvasHeight - 38;
        if (longestLine.lines <= 1 && button1.name == "") canvasHeight = canvasHeight - 26;

        if (button1.name != "") {
            async function getBtnsWidth() {
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

            let btnsWidth = await getBtnsWidth();

            if (canvasWidth - 120 < btnsWidth) canvasWidth = btnsWidth + 118;
        }

        canvas = document.getElementById("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        ctx.antialias = "none";
        ctx.fillStyle = "#ffffff";

        let frameLeftCorner = assets["frame-left-corner"];
        let frameRightCorner = assets["frame-right-corner"];
        let frameLeftSide = assets["frame-left-side"];
        let frameRightSide = assets["frame-right-side"];
        let frameTop = assets["frame-top"];
        let frameBottomLeftCorner = assets[button1.name != "" ? "frame-bottom-left-corner" : "frame-bottom-left-corner-no-btns"];
        let frameBottomRightCorner = assets[button1.name != "" ? "frame-bottom-right-corner" : "frame-bottom-right-corner-no-btns"];
        let frameBottom = assets["frame-bottom"];

        await loadImage(ctx, frameLeftCorner, 0, 0);
        await loadImage(ctx, frameTop, 54, 0, canvas.width - 110, 40);
        await loadImage(ctx, frameRightCorner, canvas.width - 56, 0);
        await loadImage(ctx, frameLeftSide, 0, 40, 47, canvas.height - 127);
        await loadImage(ctx, frameRightSide, canvas.width - 49, 40, 47, canvas.height - 127);
        await loadImage(ctx, frameBottomLeftCorner, 0, canvas.height - 87);
        await loadImage(ctx, frameBottomRightCorner, canvas.width - 56, canvas.height - 87);
        await loadImage(ctx, frameBottom, 54, canvas.height - 80, canvas.width - 110, 80);

        ctx.fillRect(47, 40, canvas.width - 96, canvas.height - 127);
        ctx.fillStyle = button1.name != "" ? "rgb(240,240,240)" : "#ffffff";
        ctx.fillRect(54, canvas.height - 87, canvas.width - 110, 7);

        for (let i = 1; i <= title.length; i++) {
            let chunkWidth = testBitmaps(title.slice(0, i), true);
            if (chunkWidth + 145 > canvas.width) {
                title = `${title.slice(0, i).trim()}...`;
                break;
            }
        }

        await drawBitmaps(ctx, title, 52, 39)

        let cross = assets[crossDisabled ? "cross-disabled" : "cross"];
        await loadImage(ctx, cross, canvas.width - 69, 42)

        let iconReq = await fetch(`/err/icon?sys=${system}&id=${iconID}`);
        let icon = await iconReq.text();
        await loadImage(ctx, icon, 57, 73, 32, 32)

        let y = 77;

        async function draw(x, y) {
            if (contentWidth > 494) {
                let words = content.split(' ');
                let line = '';

                for (let i = 0; i < words.length; i++) {
                    let testLine = line + words[i] + ' ';
                    let testWidth = testBitmaps(testLine);

                    if (testWidth > 494 && i > 0) {
                        await drawBitmaps(ctx, line, x, y)
                        line = words[i] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                await drawBitmaps(ctx, line, x, y)
            } else {
                await drawBitmaps(ctx, content, x, y)
            }
        }

        await draw(x, y);

        let btnLeftSide = assets["btn-left-side"];
        let btnMiddle = assets["btn-middle"];
        let btnRightSide = assets["btn-right-side"];

        let btnRecLeftSide = assets["btn-rec-left-side"];
        let btnRecMiddle = assets["btn-rec-middle"];
        let btnRecRightSide = assets["btn-rec-right-side"];

        let btnDisabledLeftSide = assets["btn-disabled-left-side"];
        let btnDisabledMiddle = assets["btn-disabled-middle"];
        let btnDisabledRightSide = assets["btn-disabled-right-side"];

        if (button1.name != "") {
            let btnRowBG = assets["btn-row-bg"];
            await loadImage(ctx, btnRowBG, 47, canvas.height - 121, canvas.width - 96, 34)
            if (!button2) {
                const textWidthFixed = testBitmaps(button1.name);
                let textWidth = textWidthFixed;
                if (textWidth < 36) textWidth = 36;
                let btnWidth = textWidth + 30;

                let xToCenterText = Math.floor((btnWidth - textWidthFixed) / 2) - 1;
                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 60 - btnWidth, canvas.height - 111)
                    await loadImage(ctx, btnDisabledMiddle, canvas.width + 4 - 60 - btnWidth, canvas.height - 111, btnWidth - 4, 21)
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 60, canvas.height - 111)

                    ctx.globalAlpha = .45;
                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btnWidth + xToCenterText, canvas.height - 109, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else {
                    if (button1.rec) {
                        await loadImage(ctx, btnRecLeftSide, canvas.width - 60 - btnWidth, canvas.height - 111)
                        await loadImage(ctx, btnRecMiddle, canvas.width + 4 - 60 - btnWidth, canvas.height - 111, btnWidth - 4, 21)
                        await loadImage(ctx, btnRecRightSide, canvas.width - 60, canvas.height - 111)
                    } else {
                        await loadImage(ctx, btnLeftSide, canvas.width - 60 - btnWidth, canvas.height - 111)
                        await loadImage(ctx, btnMiddle, canvas.width + 4 - 60 - btnWidth, canvas.height - 111, btnWidth - 4, 21)
                        await loadImage(ctx, btnRightSide, canvas.width - 60, canvas.height - 111)
                    }

                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btnWidth + xToCenterText, canvas.height - 109)
                }
            }

            if (button2 && !button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 1;

                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 60 - btn1Width, canvas.height - 111)
                    await loadImage(ctx, btnDisabledMiddle, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21)
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 60, canvas.height - 111)

                    ctx.globalAlpha = .45;
                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 109, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else {
                    if (button1.rec) {
                        await loadImage(ctx, btnRecLeftSide, canvas.width - 60 - btn1Width, canvas.height - 111)
                        await loadImage(ctx, btnRecMiddle, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21)
                        await loadImage(ctx, btnRecRightSide, canvas.width - 60, canvas.height - 111)
                    } else {
                        await loadImage(ctx, btnLeftSide, canvas.width - 60 - btn1Width, canvas.height - 111)
                        await loadImage(ctx, btnMiddle, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21)
                        await loadImage(ctx, btnRightSide, canvas.width - 60, canvas.height - 111)
                    }

                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 109)
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 1;

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111)
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21)
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn1Width - 60, canvas.height - 111)

                    ctx.globalAlpha = .45;
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 109, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else {
                    if (button2.rec) {
                        await loadImage(ctx, btnRecLeftSide, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111)
                        await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21)
                        await loadImage(ctx, btnRecRightSide, canvas.width - 8 - btn1Width - 60, canvas.height - 111)
                    } else {
                        await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111)
                        await loadImage(ctx, btnMiddle, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21)
                        await loadImage(ctx, btnRightSide, canvas.width - 8 - btn1Width - 60, canvas.height - 111)
                    }

                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 109)
                }
            }

            if (button3) {
                const text1WidthFixed = testBitmaps(button1.name);
                let text1Width = text1WidthFixed;
                if (text1Width < 36) text1Width = 36;
                let btn1Width = text1Width + 30;

                let xToCenterText1 = Math.floor((btn1Width - text1WidthFixed) / 2) - 1;

                if (button1.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 60 - btn1Width, canvas.height - 111)
                    await loadImage(ctx, btnDisabledMiddle, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21)
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 60, canvas.height - 111)

                    ctx.globalAlpha = .45;
                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 109, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else {
                    if (button1.rec) {
                        await loadImage(ctx, btnRecLeftSide, canvas.width - 60 - btn1Width, canvas.height - 111)
                        await loadImage(ctx, btnRecMiddle, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21)
                        await loadImage(ctx, btnRecRightSide, canvas.width - 60, canvas.height - 111)
                    } else {
                        await loadImage(ctx, btnLeftSide, canvas.width - 60 - btn1Width, canvas.height - 111)
                        await loadImage(ctx, btnMiddle, canvas.width + 4 - 60 - btn1Width, canvas.height - 111, btn1Width - 4, 21)
                        await loadImage(ctx, btnRightSide, canvas.width - 60, canvas.height - 111)
                    }

                    await drawBitmaps(ctx, button1.name, canvas.width - 60 - btn1Width + xToCenterText1, canvas.height - 109)
                }

                const text2WidthFixed = testBitmaps(button2.name);
                let text2Width = text2WidthFixed;
                if (text2Width < 36) text2Width = 36;
                let btn2Width = text2Width + 30;

                let xToCenterText2 = Math.floor((btn2Width - text2WidthFixed) / 2) - 1;

                if (button2.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111)
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21)
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn1Width - 60, canvas.height - 111)

                    ctx.globalAlpha = .45;
                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 109, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else {
                    if (button2.rec) {
                        await loadImage(ctx, btnRecLeftSide, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111)
                        await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21)
                        await loadImage(ctx, btnRecRightSide, canvas.width - 8 - btn1Width - 60, canvas.height - 111)
                    } else {
                        await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn1Width - 60 - btn2Width, canvas.height - 111)
                        await loadImage(ctx, btnMiddle, canvas.width - 8 - btn1Width + 4 - 60 - btn2Width, canvas.height - 111, btn2Width - 4, 21)
                        await loadImage(ctx, btnRightSide, canvas.width - 8 - btn1Width - 60, canvas.height - 111)
                    }

                    await drawBitmaps(ctx, button2.name, canvas.width - 8 - btn1Width - 60 - btn2Width + xToCenterText2, canvas.height - 109)
                }

                const text3WidthFixed = testBitmaps(button3.name);
                let text3Width = text3WidthFixed;
                if (text3Width < 36) text3Width = 36;
                let btn3Width = text3Width + 30;

                let xToCenterText3 = Math.floor((btn3Width - text3WidthFixed) / 2) - 1;

                if (button3.disabled) {
                    await loadImage(ctx, btnDisabledLeftSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width, canvas.height - 111)
                    await loadImage(ctx, btnDisabledMiddle, canvas.width - 8 - btn2Width - 8 - btn1Width + 4 - 60 - btn3Width, canvas.height - 111, btn3Width - 4, 21)
                    await loadImage(ctx, btnDisabledRightSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 60, canvas.height - 111)

                    ctx.globalAlpha = .45;
                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width + xToCenterText3, canvas.height - 109, ctx.globalAlpha)
                    ctx.globalAlpha = 1;
                } else {
                    if (button3.rec) {
                        await loadImage(ctx, btnRecLeftSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width, canvas.height - 111)
                        await loadImage(ctx, btnRecMiddle, canvas.width - 8 - btn2Width - 8 - btn1Width + 4 - 60 - btn3Width, canvas.height - 111, btn3Width - 4, 21)
                        await loadImage(ctx, btnRecRightSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 60, canvas.height - 111)
                    } else {
                        await loadImage(ctx, btnLeftSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width, canvas.height - 111)
                        await loadImage(ctx, btnMiddle, canvas.width - 8 - btn2Width - 8 - btn1Width + 4 - 60 - btn3Width, canvas.height - 111, btn3Width - 4, 21)
                        await loadImage(ctx, btnRightSide, canvas.width - 8 - btn2Width - 8 - btn1Width - 60, canvas.height - 111)
                    }

                    await drawBitmaps(ctx, button3.name, canvas.width - 8 - btn2Width - 8 - btn1Width - 60 - btn3Width + xToCenterText3, canvas.height - 109)
                }
            }
        }
    };
    async function setDl() {
        let blob = await new Promise(resolve => canvas.toBlob(resolve));
        let url = URL.createObjectURL(blob);
        document.querySelector(".dl").href = url, dl.style.display = "inline"
    };
    setTimeout(setDl, 1)
}
