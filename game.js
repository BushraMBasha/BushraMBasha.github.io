window.onload = init;
window.onresize = resizeboard;


var maindiv;
var ua;
var coinIndex;
var atTheDoor;
var onmobile = null;
var valueMap = null;
var canvas_x = null, canvas_y = null;
var notMe = false;
var specialPos = [];
var toHit = [[], []];
var flyOverPos = [72, 82, 92, 62];
var continueplay = false;
var freezeMap = true;
var canvas = null; ctx = null, dicecanvas = null, dicectx = null, upcanvas = null, upctx = null, canvasWidth = 0, canvasHeight = 0, tileWidth = 0;
var roles = ["red", "yellow", "blue", "green"];
var hands = ["#FF0000", "#FFCC00", "#9696FF", "#33B433"];
var routes = [];
var colorR = 0, colorG = 0, colorB = 0, colorA = 255;
var playhand = { role: null, color: null, value: null }, diceValue = 0, handcount = 0, tempindex = 0;
var clickOverflow = false;
var selfName = "";


var playStatus = (function () {
    var s = [];
    for (var k = 0; k < roles.length; k++) {
        var role = {
            self: false,
            name: null,
            color: roles[k],
            index: k,
            allowTakeOff: false,
            continuePlaying: false,
            overlap: false,
            hit: false,
            fly: false,
            overLimit: 0,
            touchBaseCount: 0,
            win: false,
            coins: []
        };
        for (var j = 0; j < 4; j++) {
            var coin = {
                previousValue: -1,
                value: -1,
                pos: {
                    left: -1,
                    top: -1,
                    right: -1,
                    bottom: -1
                }
            };
            role.coins.push(coin);
        }
        s.push(role);
    }
    return s;
})();

///////////////////////////////////////////////////

function init() {
    if (navigator.userAgent.toLowerCase().indexOf("ipad") !== -1)
        ua = 'ipad';
    if (navigator.userAgent.toLowerCase().indexOf("iphone") !== -1)
        ua = 'iphone';
    if (ua === 'ipad' || ua === 'iphone') {
        onmobile = true;
        document.getElementById("buttondiv").style.display = "none";
        document.getElementById("cover").className = "coveronmobile";
        document.getElementById("startScreen").style.display = "";
    }
    else {
        onmobile = false;
        document.getElementById("startScreen").style.display = "";
    }
    JoinGame();
}

function initPlayGround() {
    document.getElementById("playGround").style.display = "";
    if (!continueplay) {
        continueplay = false;
        maindiv = document.getElementById("main");
        canvas = document.getElementById("gameboard");
        ctx = canvas.getContext("2d");
        upcanvas = document.getElementById("playboard");
        upcanvas.onmousemove = updatePos;
        upcanvas.onclick = updateRouts;
        upctx = upcanvas.getContext("2d");
        dicecanvas = document.getElementById("dice");
        dicectx = dicecanvas.getContext("2d");
        if (onmobile)
            dicecanvas.onclick = rolltheDice;
        ctx.font = "20px helvetica";
        ctx.globalAlpha = 1.0;
        canvas.setStyle = function (styleMap) {
            var styleString = new String();
            for (var i in styleMap) {
                styleString += i + ':' + styleMap[i] + '; ';
            }
            canvas.setAttribute('style', styleString);
        };
        upcanvas.setStyle = function (styleMap) {
            var styleString = new String();
            for (var i in styleMap) {
                styleString += i + ':' + styleMap[i] + '; ';
            }
            upcanvas.setAttribute('style', styleString);
        };
        var canvasStyle = {
            'background': '#00aaff',
            'border': '1px solid grey'
        };
        canvas.setStyle(canvasStyle);
        var canvasStyle = {
            'border': '1px solid grey'
        };
        upcanvas.setStyle(canvasStyle);
        valueMap = createValueMap();
        initiateCoinRoutes();
    }
    resizeboard();
    drawTheBoard();
    updateAllCoins();
}

function refreshBoard() {
    canvasWidth = window.innerHeight - 10;
    canvasHeight = window.innerHeight;
    maindiv.style.width = canvasWidth + "px";
    maindiv.style.height = canvasWidth + "px";
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasWidth;
    upctx.canvas.width = canvasWidth;
    upctx.canvas.height = canvasWidth;
    tileWidth = Math.ceil(canvasWidth / 16);
    
    if (onmobile) {
        dicectx.canvas.width = tileWidth * 2;
        dicectx.canvas.height = tileWidth * 4;
        document.getElementById("info").style.width = tileWidth * 2 + "px";
        document.getElementById("players").style.width = tileWidth * 2 + "px";
    }
    else {
        dicectx.canvas.width = tileWidth * 4;
        dicectx.canvas.height = tileWidth * 6;
    }
    
    if (onmobile) {
        document.getElementById("dice").style.left = tileWidth + "px";
        document.getElementById("playerStatus").style.left = tileWidth + "px";
        document.getElementById("playerStatus").style.top = tileWidth * 6 + "px";
    }
    else {
        document.getElementById("buttondiv").style.left = tileWidth * 2 + "px";
        document.getElementById("buttondiv").style.top = tileWidth * 7.5 + "px";
        document.getElementById("playerStatus").style.left = tileWidth + "px";
        document.getElementById("playerStatus").style.top = tileWidth * 9 + "px";
    }
}

function resizeboard() {
    refreshBoard();
    drawTheBoard();
    updateAllCoins();
    //handcount = handcount == 0 ? 0 : handcount - 1;
    changeHands();
    if (!onmobile)
        document.getElementById("buttondiv").style.visibility = "";
}

function createMap() {
    var mapxy = new Array();
    //notile:0, blue:1,green:2,red:3,yello:4;
    mapxy.push([300, 300, 300, 300, 300,   0,  3,  4,  1,   0, 400, 400, 400, 400, 400]);
    mapxy.push([300,  11, 300,  11, 300,   0,  2, 40, 40, 400, 400,  11, 400,  11, 400]);
    mapxy.push([300, 300, 300, 300, 300,   0,  1, 40,  3,   0, 400, 400, 400, 400, 400]);
    mapxy.push([300,  11, 300,  11, 300,   0,  4, 40,  4,   0, 400,  11, 400,  11, 400]);
    mapxy.push([300, 300, 300, 300, 300,   0,  3, 40,  1,   0, 400, 400, 400, 400, 400]);
    mapxy.push([  0, 300,   0,   0,   0,   0,  2, 40,  2,   0,   0,   0,   0,   0,  0]);
    mapxy.push([  4,  30,   2,   3,   4,   1,  5, 40,  6,   3,   4,   1,   2,   3,  4]);
    mapxy.push([  3,  30,  30,  30,  30,  30, 30,  9, 10,  10,  10,  10,  10,  10,  1]);
    mapxy.push([  2,   1,   4,   3,   2,   1,  7, 20,  8,   3,   2,   1,   4,  10,  2]);
    mapxy.push([  0,   0,   0,   0,   0,   0,  4, 20,  4,   0,   0,   0,   0, 100,  0]);
    mapxy.push([200, 200, 200, 200, 200,   0,  3, 20,  1,   0, 100, 100, 100, 100, 100]);
    mapxy.push([200,  11, 200,  11, 200,   0,  2, 20,  2,   0, 100,  11, 100,  11, 100]);
    mapxy.push([200, 200, 200, 200, 200,   0,  1, 20,  3,   0, 100, 100, 100, 100, 100]);
    mapxy.push([200,  11, 200,  11, 200, 200, 20, 20,  4,   0, 100,  11, 100,  11, 100]);
    mapxy.push([200, 200, 200, 200, 200,   0,  3,  2,  1,   0, 100, 100, 100, 100, 100]);
    return mapxy;
}

function updatePlayBoard() {
    var ifChangeHands = -1;
    if (playhand.role) {
        for (var i = 0; i < playhand.role.coins.length; i++) {
            if (ifChangeHands < playhand.role.coins[i].value)
                ifChangeHands = playhand.role.coins[i].value;
            if (playhand.role.coins[i].value !== playhand.role.coins[i].previousValue) {//a coin needs to be moved
                var coordinates = moveACoin(playhand.role.coins[i], playhand.role.coins[i].previousValue, playhand.role.coins[i].value);
                playhand.role.coins[i].pos.left = Math.floor(coordinates.co_x) - 1;
                playhand.role.coins[i].pos.top = Math.floor(coordinates.co_y) - 1;
                playhand.role.coins[i].pos.right = Math.floor(coordinates.co_x + tileWidth) + 1;
                playhand.role.coins[i].pos.bottom = Math.floor(coordinates.co_y + tileWidth) + 1;
                if (playhand.role.coins[i].previousValue === playhand.role.coins[i].value) {
                    handcount++;
                    changeHands();
                }
                break;
            }
        }
    }
    if (ifChangeHands === -1 && clickOverflow !== true) {
        handcount++;
        changeHands();
    }
}

///////////////////////////////////////////////////

function drawTheBoard() {
    refreshBoard();
    drawBackgroundGradient();
    var boardmap = createMap();
    for (var x = 0; x < 15; x++) {
        for (var y = 0; y < 15; y++) {
            switch (boardmap[y][x]) {
                case 0: break;
                case 1: ctx.putImageData(drawARegularTile("blue", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 2: ctx.putImageData(drawARegularTile("green", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 3: ctx.putImageData(drawARegularTile("red", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 4: ctx.putImageData(drawARegularTile("yellow", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                
                case 10: ctx.putImageData(drawHomeTile("blue", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 20: ctx.putImageData(drawHomeTile("green", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 30: ctx.putImageData(drawHomeTile("red", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 40: ctx.putImageData(drawHomeTile("yellow", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                
                case 5: ctx.putImageData(drawTwoColorTile("ry", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 6: ctx.putImageData(drawTwoColorTile("yb", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 7: ctx.putImageData(drawTwoColorTile("rg", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 8: ctx.putImageData(drawTwoColorTile("gb", tileWidth, true), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 9: ctx.putImageData(drawCenterTile(tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                
                case 11: ctx.putImageData(drawBlankTile("white", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                
                case 100: ctx.putImageData(drawBlankTile("blue", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 200: ctx.putImageData(drawBlankTile("green", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 300: ctx.putImageData(drawBlankTile("red", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                case 400: ctx.putImageData(drawBlankTile("yellow", tileWidth), tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y); break;
                
                default: break;
            }
        }
    }
}

function drawBackgroundGradient() {
    var gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#d9d9d9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawARegularTile(color, width) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            var x2 = x - Math.ceil(width / 2);
            var y2 = y - Math.ceil(width / 2);
            var distance = Math.ceil(Math.sqrt(x2 * x2 + y2 * y2));
            var circlewall = Math.ceil(width / 2 * 0.8);
            var circleWidth = Math.ceil(width / 20);
            ys = new Array();
            for (var j = 0; j < circleWidth; j++) {
                ys.push(y - Math.ceil(circleWidth / 2 * 0.9) - +circleWidth + j);
            }
            if ((circlewall - circleWidth) < distance && distance < circlewall) {
                setColor(color);
            }
            else {
                setColor("white");
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}

function drawBlankTile(color, width) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            var x2 = x - Math.ceil(width / 2);
            var y2 = y - Math.ceil(width / 2);
            var distance = Math.ceil(Math.sqrt(x2 * x2 + y2 * y2));
            var circlewall = Math.ceil(width / 2 * 0.8);
            var circleWidth = Math.ceil(width / 20);
            ys = new Array();
            for (var j = 0; j < circleWidth; j++) {
                ys.push(y - Math.ceil(circleWidth / 2 * 0.9) - +circleWidth + j);
            }
            if ((circlewall - circleWidth) < distance && distance < circlewall) {
                setColor(color);
            }
            else {
                setColor(color);
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}

function drawHomeTile(color, width) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            var x2 = x - Math.ceil(width / 2);
            var y2 = y - Math.ceil(width / 2);
            var distance = Math.ceil(Math.sqrt(x2 * x2 + y2 * y2));
            var circlewall = Math.ceil(width / 2 * 0.8);
            var circleWidth = Math.ceil(width / 20);
            ys = new Array();
            for (var j = 0; j < circleWidth; j++) {
                ys.push(y - Math.ceil(circleWidth / 2 * 0.9) - +circleWidth + j);
            }
            if ((circlewall - circleWidth) < distance && distance < circlewall) {
                setColor("white");
            }
            else {
                setColor(color);
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}

function drawTwoColorTile(color, width, keepColorSequence) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            if (x < width - y) {
                switch (color) {
                    case "yb": keepColorSequence ? setColor("yellow") : setColor("blue"); break;
                    case "rg": keepColorSequence ? setColor("red") : setColor("green"); break;
                    default: break;
                }
            }
            else {
                switch (color) {
                    case "yb": keepColorSequence ? setColor("blue") : setColor("yellow"); break;
                    case "rg": keepColorSequence ? setColor("green") : setColor("red"); break;
                    default: break;
                }
            }
            if (x < y) {
                switch (color) {
                    case "ry": keepColorSequence ? setColor("yellow") : setColor("red"); break;
                    case "gb": keepColorSequence ? setColor("blue") : setColor("green"); break;
                    default: break;
                }
            }
            else {
                switch (color) {
                    case "ry": keepColorSequence ? setColor("red") : setColor("yellow"); break;
                    case "gb": keepColorSequence ? setColor("green") : setColor("blue"); break;
                    default: break;
                }
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}

function drawCenterTile(width) {
    var imgData = ctx.createImageData(width, width);
    var pos = 0;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < width; y++) {
            if (x > y - 1 && x < width - y) {
                setColor("red");
            }
            else if (x < y && x > width - y - 1) {
                setColor("blue");
            }
            else if (x > y - 1 && x < width) {
                setColor("green");
            }
            else {
                setColor("yellow");
            }
            imgData.data[pos++] = colorR;
            imgData.data[pos++] = colorG;
            imgData.data[pos++] = colorB;
            imgData.data[pos++] = colorA;
        }
    }
    return imgData;
}

function setColor(color) {
    switch (color) {
        case "blue": colorR = 150, colorG = 150, colorB = 255, colorA = 255; break;
        case "red": colorR = 255, colorG = 0, colorB = 0, colorA = 255; break;
        case "green": colorR = 51, colorG = 180, colorB = 51, colorA = 255; break;
        case "yellow": colorR = 255, colorG = 204, colorB = 0, colorA = 255; break;
        case "white": colorR = 255, colorG = 255, colorB = 255, colorA = 255; break;
        default: colorR = 0, colorG = 0, colorB = 0, colorA = 0; break;
    }
}

///////////////////////////////////////////////////

function rolltheDice(btn, dvalue) {
    if (onmobile)
        dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
    else {
        if (btn)
            btn.style.visibility = "hidden";
        dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
    }
    document.getElementById("info").innerText = "";
    if (dvalue !== undefined) {
        notMe = true;
        var img = returnDiceImg(dvalue);
        dicectx.drawImage(img, 0, 0, tileWidth * 2, tileWidth * 2);
        updateCoinsStatus(dvalue);
        if (playhand.role) {
            var ifChangeHands = -1;
            for (var i = 0; i < playhand.role.coins.length; i++) {
                if (ifChangeHands < playhand.role.coins[i].value && playhand.role.coins[i].value !== 56)
                    ifChangeHands = playhand.role.coins[i].value;
            }
            if (dvalue !== 6 && ifChangeHands === -1) {//All coins are in the initial home and there is no chance of taking off
                handcount++;
                changeHands();
            }
        }
    }
    else {
        var diceposi = [0, 1, 1, 0];
        var diceposj = [0, 0, 1, 1];
        var i = -1;
        var rolling = setInterval(function () {
            if (onmobile)
                dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
            else
                dicectx.clearRect(tileWidth * 2 * (diceposi[i % 4]), tileWidth * 2 * (diceposj[i % 4]), tileWidth * 2, tileWidth * 2);
            diceValue = rand(6);
            var img = returnDiceImg(diceValue);
            i++;
            if (onmobile)
                dicectx.drawImage(img, 0, 0, tileWidth * 2, tileWidth * 2);
            else
                dicectx.drawImage(img, tileWidth * 2 * (diceposi[i % 4]), tileWidth * 2 * (diceposj[i % 4]), tileWidth * 2, tileWidth * 2);
        }, 180);
        setTimeout(function () {
            clearInterval(rolling);
            var msg = JSON.stringify({ "diceValue": diceValue });
            sendJSONMessage(msg);
            updateCoinsStatus(diceValue);
            if (playhand.role) {
                var ifChangeHands = -1;
                for (var i = 0; i < playhand.role.coins.length; i++) {
                    if (ifChangeHands < playhand.role.coins[i].value && playhand.role.coins[i].value !== 56)
                        ifChangeHands = playhand.role.coins[i].value;
                }
                if (diceValue !== 6 && ifChangeHands === -1) {//All coins are in the initial home and there is no chance of taking off
                    handcount++;
                    changeHands();
                }
            }
        }, 2000);
    }
}

function returnDiceImg(val) {
    var currentdice = "dice" + "one";
    switch (val) {
        case 1:
            currentdice = "dice" + "one";
            break;
        case 2:
            currentdice = "dice" + "two";
            break;
        case 3:
            currentdice = "dice" + "three";
            break;
        case 4:
            currentdice = "dice" + "four";
            break;
        case 5:
            currentdice = "dice" + "five";
            break;
        case 6:
            currentdice = "dice" + "six";
            break;
        default:
            break;
    }
    var img = document.getElementById(currentdice);
    return img;
}

///////////////////////////////////////////////////

function createValueMap() {
    var mapxy = new Array();
    mapxy.push([00, 00, 00, 00, 00, 00, 51, 52, 01, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 50, 53, 02, -2, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 49, 54, 03, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 48, 55, 04, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 47, 56, 05, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, -1, 00, 00, 00, 00, 46, 57, 06, 00, 00, 00, 00, 00, 00]);
    mapxy.push([40, 41, 42, 43, 44, 45, 00, 58, 00, 07, 08, 09, 10, 11, 12]);
    mapxy.push([39, 71, 72, 73, 74, 75, 76, 00, 64, 63, 62, 61, 60, 59, 13]);
    mapxy.push([38, 37, 36, 35, 34, 33, 00, 70, 00, 19, 18, 17, 16, 15, 14]);
    mapxy.push([00, 00, 00, 00, 00, 00, 32, 69, 20, 00, 00, 00, 00, -3, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 31, 68, 21, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 30, 67, 22, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 29, 66, 23, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, -4, 28, 65, 24, 00, 00, 00, 00, 00, 00]);
    mapxy.push([00, 00, 00, 00, 00, 00, 27, 26, 25, 00, 00, 00, 00, 00, 00]);
    return mapxy;
}

function initiateCoinRoutes() {
var redRout = [
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 01, 02, 03, 04, 05, 06, 07, 08,
        09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 71, 72, 73, 74, 75, 76];
    
var yellowRout = [
        02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
        22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
        42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
    
var blueRout = [
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 01, 02,
        03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 59, 60, 61, 62, 63, 64];

var greenRout = [
        28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
        48, 49, 50, 51, 52, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15,
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 65, 66, 67, 68, 69, 70];
    routes.push(redRout);
    routes.push(yellowRout);
    routes.push(blueRout);
    routes.push(greenRout);
    }

function placeDefaultCoins(color) {
    var redposes =    [ 1.49,  1.49,  3.49,  1.49,  1.49,  3.49,  3.49,  3.49,  1.49,  5.49];
    var yellowposes = [11.49,  1.49, 13.49,  1.49, 11.49,  3.49, 13.49,  3.49,  9.49,  1.49];
    var blueposes =   [11.49, 11.49, 13.49, 11.49, 11.49, 13.49, 13.49, 13.49, 13.49,  9.49];
    var greenposes =  [ 1.49, 11.49,  3.49, 11.49,  1.49, 13.49,  3.49, 13.49,  5.49, 13.49];
    var currentpos = null;
    var i_role = null;
    switch (color) {
        case "red":
            currentpos = redposes;
            i_role = 0;
            break;
        case "yellow":
            currentpos = yellowposes;
            i_role = 1;
            break;
        case "blue":
            currentpos = blueposes;
            i_role = 2;
            break;
        case "green":
            currentpos = greenposes;
            i_role = 3;
            break;
        default:
            break;
    }
    var currentcoin = color + "coin";
    var img = document.getElementById(currentcoin);
    upctx.shadowBlur = 10;
    upctx.shadowOffsetX = 2;
    upctx.shadowOffsetY = 2;
    upctx.shadowColor = "black";
    
    if (coinIndex !== undefined) {//not initiation  
        var tempPosInd = 0;
        if (atTheDoor === true) {
            tempPosInd = 8;
        }
        else {
            tempPosInd = coinIndex * 2;
        }
        upctx.drawImage(img, tileWidth * currentpos[tempPosInd], tileWidth * currentpos[tempPosInd + 1], tileWidth, tileWidth);
        playStatus[i_role].coins[coinIndex].pos.left = Math.floor(tileWidth * currentpos[tempPosInd]) - 1;
        playStatus[i_role].coins[coinIndex].pos.top = Math.floor(tileWidth * currentpos[tempPosInd + 1]) - 1;
        playStatus[i_role].coins[coinIndex].pos.right = Math.floor(tileWidth * currentpos[tempPosInd] + tileWidth) + 1;
        playStatus[i_role].coins[coinIndex].pos.bottom = Math.floor(tileWidth * currentpos[tempPosInd + 1] + tileWidth) + 1;
    }
    else {
        for (var i = 0; i < 8; i++) {
            upctx.drawImage(img, tileWidth * currentpos[i], tileWidth * currentpos[++i], tileWidth, tileWidth);
        }
        for (var j = 0; j < playStatus[i_role].coins.length; j++) {
            playStatus[i_role].coins[j].pos.left = Math.floor(tileWidth * currentpos[0 + j * 2]) - 1;
            playStatus[i_role].coins[j].pos.top = Math.floor(tileWidth * currentpos[1 + j * 2]) - 1;
            playStatus[i_role].coins[j].pos.right = Math.floor(tileWidth * currentpos[0 + j * 2] + tileWidth) + 1;
            playStatus[i_role].coins[j].pos.bottom = Math.floor(tileWidth * currentpos[1 + j * 2] + tileWidth) + 1;
        }
    }
}

function placeACoin(color, value, steps, previousValue, currentCoin) {
    tempindex = playhand.role.index;
    var currentcoinimg = color + "coin";
    var img = document.getElementById(currentcoinimg);
    var breakTwice = false;
    var stepsToTake = [], stepIn = 0;
    if (value < 0) {//Taking off
        switch (value) {
            case -1:
                stepsToTake.push(value);
                break;
            default:
                stepsToTake.push(0);
                break;
        }
    }
    else {
        if (value > 55) {//over the limit
            var stepsOne = 56 - (value - playhand.role.overLimit);
            playhand.role.overLimit = 0;
            for (var j = 0; j < stepsOne; j++) {// value - 57 is the end of rout -->99
                stepsToTake.push(previousValue + j + 1);
            }
            if (value === 56) {//One coin has touched the base
                playhand.role.touchBaseCount++;
            }
            else {
                var stepsTwo = value - 56;
                for (var j = 0; j < stepsTwo; j++) {// value - 57 is the end of rout -->99
                    stepsToTake.push(55 - j);
                }
            }
        }
        else {
            if (steps > 12 && playhand.role.fly) {//fly  
                playhand.role.fly = false;
                var tempValue = null;
                var j = 0;
                if (steps > 16) {
                    for (j = 0; j < steps - 16; j++) {
                        stepsToTake.push(previousValue + j + 1);
                    }
                    tempValue = routes[playhand.role.index][previousValue + j - 1];
                    toHit[0].push(j);
                    toHit[1].push(tempValue);
                    stepsToTake.push(value - 12);
                    tempValue = routes[playhand.role.index][value - 13];//hit working
                    toHit[0].push(j + 1);
                    toHit[1].push(tempValue);
                    steps = steps - 16 + 3;
                    j = j + 1;
                }
                else {
                    for (j = 0; j < steps - 12; j++) {
                        stepsToTake.push(previousValue + j + 1);
                    }
                    tempValue = routes[playhand.role.index][previousValue + j - 1];//hit working
                    toHit[0].push(j);
                    toHit[1].push(tempValue);
                    steps = steps - 12 + 2;
                }
                stepsToTake.push(57);
                tempValue = flyOverPos[playhand.role.index];//hit working
                toHit[0].push(j + 1);
                toHit[1].push(tempValue);
                stepsToTake.push(value);
                tempValue = routes[playhand.role.index][value - 1];//hit working
                toHit[0].push(j + 2);
                toHit[1].push(tempValue);
            }
            else if (playhand.role.fly) {//fly  over 4 
                playhand.role.fly = false;
                var tempValue = null;
                for (var j = 0; j < steps - 4; j++) {
                    stepsToTake.push(previousValue + j + 1);
                }
                tempValue = routes[playhand.role.index][previousValue + j - 1];//hit working
                toHit[0].push(j);
                toHit[1].push(tempValue);
                stepsToTake.push(value);
                steps = steps - 4 + 1;
                tempValue = routes[playhand.role.index][value - 1];//hit working
                toHit[0].push(j + 1);
                toHit[1].push(tempValue);
            }
            else {
                var tempValue = null;
                for (var j = 0; j < steps; j++) {
                    stepsToTake.push(previousValue + j + 1);
                }
                tempValue = routes[playhand.role.index][value - 1];//hit working
                toHit[0].push(j);
                toHit[1].push(tempValue);
            }
        }
    }
    var currentcoin = color + "coin";
    var moveSeed = setInterval(function () {
        currentcoin.value = stepsToTake[stepIn];
        currentcoin.previousValue = stepsToTake[stepIn];
        stepIn++;
        for (var n = 0; n < toHit[0].length; n++) {
            if (stepIn === toHit[0][n]) {
                hitACoin(tempindex, toHit[1][n]);
            }
        }
        updateAllCoins();
        if (stepIn === steps) {
            toHit = [[], []];
            clearInterval(moveSeed);
        }
    }, 500);
    var coordinates = null;
    var tempValue = -1;
    if (value < 0)
        tempValue = value;
    else if (value > 56)
        tempValue = routes[playhand.role.index][56 - value + 56];
    else
        tempValue = routes[playhand.role.index][value - 1];
    if (tempValue === -1) {
        coordinates = {
            co_x: 0,
            co_y: 0
        };
    }
    else {
        for (var x = 0; x < 15; x++) {
            for (var y = 0; y < 15; y++) {
                if (valueMap[y][x] === tempValue) {
                    coordinates = {
                        co_x: tileWidth / 2 + tileWidth * x,
                        co_y: tileWidth / 2 + tileWidth * y
                    };
                    breakTwice = true;
                    break;
                }
            }
            if (breakTwice) {
                breakTwice = false;
                break;
            }
        }
    }
    return coordinates;
}

function onlyPlaceACoin(color, index, value, coinIndex) {
    var currentcoin = color + "coin";
    var img = document.getElementById(currentcoin);
    var breakTwice = false;
    for (var x = 0; x < 15; x++) {
        for (var y = 0; y < 15; y++) {
            var tempValue = routes[index][value - 1];
            if (valueMap[y][x] === tempValue) {
                upctx.shadowBlur = 10;
                upctx.shadowOffsetX = 2;
                upctx.shadowOffsetY = 2;
                upctx.shadowColor = "black";
                upctx.drawImage(img, tileWidth / 2 + tileWidth * x, tileWidth / 2 + tileWidth * y, tileWidth, tileWidth);
                breakTwice = true;
                break;
            }
        }
        if (breakTwice) {
            breakTwice = false;
            break;
        }
    }
    playStatus[index].coinss[coinIndex].pos.left = Math.floor(tileWidth / 2 + tileWidth * x) - 1;
    playStatus[index].coinss[coinIndex].pos.top = Math.floor(tileWidth / 2 + tileWidth * y) - 1;
    playStatus[index].coins[coinIndex].pos.right = Math.floor(tileWidth / 2 + tileWidth * x + tileWidth) + 1;
    playStatus[index].coins[coinIndex].pos.bottom = Math.floor(tileWidth / 2 + tileWidth * y + tileWidth) + 1;
}

function updateAllCoins() {
    upctx.clearRect(0, 0, tileWidth * 16, tileWidth * 16);
    for (var j = 0; j < 4; j++) {//role index
        if (j !== tempindex) {
            for (var k = 0; k < 4; k++) {
                if (playStatus[j].coins[k].value === -1)
                    placeDefaultCoins(playStatus[j].color, k);
                else if (playStatus[j].coins[k].value === 0) {
                    placeDefaultCoins(playStatus[j].color, k, true);
                }
                else {
                    onlyPlaceACoin(playStatus[j].color, playStatus[j].index, playStatus[j].coins[k].value, k);
                }
            }
        }
    }
    for (var k = 0; k < 4; k++) {
        if (playStatus[tempindex].coins[k].value === -1)
            placeDefaultCoins(playStatus[tempindex].color, k);
        else if (playStatus[tempindex].coins[k].value === 0) {
            placeDefaultCoinss(playStatus[tempindex].color, k, true);
        }
        else {
            onlyPlaceACoin(playStatus[tempindex].color, playStatus[tempindex].index, playStatus[tempindex].coins[k].value, k);
        }
    }
    var tempstr = "";
    for (var j = 0; j < 4; j++) {
        switch (playStatus[j].touchBaseCount) {
            case 4:
                tempstr += "<strong style = 'color: " + playStatus[j].color + "'>" + playStatus[j].name + " has won!</strong><br />";
                playStatus[j].win = true;
                break;
            default:
                if (onmobile)

                    tempstr += "<strong style = 'color: " + playStatus[j].color + "'>" + playStatus[j].name + " </strong><br />" + playStatus[j].touchBaseCount + " coin(s)<br />";
                else
                    tempstr += "<strong style = 'color: " + playStatus[j].color + "'>" + playStatus[j].name + ": </strong><br />" + playStatus[j].touchBaseCount + " coin(s) have landed.<br />"; break;
        }
    }
    document.getElementById("players").innerHTML = tempstr;
}

///////////////////////////////////////////////////

function aCoinClicked(clickedindex, selfclick) {
    var tempvar = clickedindex;
    if (selfclick) {
        var msg = JSON.stringify({ "coinclicked": tempvar });
        sendJSONMessage(msg);
    }
    else {
        notMe = true;
    }
    //////
    if (playhand.role.coins[tempvar].value === 56)//clicking on one that has touched base. do nothing
        return;
    if (diceValue === 0) {
        document.getElementById("info").innerText = "Please roll dice";
        return;
    }
    if (diceValue !== 6 && playhand.role.coins[tempvar].value === -1) {//There is a coin moving, but he choose to click on one in the initial home
        return;
    }
    playhand.role.coins[tempvar].previousValue = playhand.role.coins[tempvar].value;
    switch (playhand.role.coins[tempvar].value) {
        case -1:
            if (playhand.role.allowTakeOff) {
                playhand.role.allowTakeOff = false; playhand.role.coins[tempvar].value = -5 + playhand.value;
            }
            diceValue = 0;
            break;
        default:
            playhand.role.coins[tempvar].value += diceValue;
            if (playhand.role.coins[tempvar].value > 55) {
                playhand.role.overLimit = diceValue;
            }
            if (playhand.role.coins[tempvar].value < 57 && playhand.role.coins[tempvar].value > 0) {
                var tempRoutValue = routes[playhand.role.index][playhand.role.coins[tempvar].value - 1];
                for (var j = 0; j < specialPos[playhand.role.index].length; j++) {
                    if (specialPos[playhand.role.index][j] === tempRoutValue) {
                        switch (j) {
                            case 3:
                                playhand.role.coins[tempvar].value += 16;
                                playhand.role.fly = true;
                                break;
                            case 4:
                                playhand.role.coins[tempvar].value += 12;
                                playhand.role.fly = true;
                                break;
                            default:
                                playhand.role.coins[tempvar].value += 4;
                                playhand.role.fly = true;
                                break;
                        }
                    }
                }
            }
            diceValue = 0; break;
    }
    updatePlayBoard();
    if (onmobile) {
        dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
    }
    else
        dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
}

function moveACoin(coin, preValue, Value) {
    var dif = Math.abs(Value - preValue);
    var coordinates;
    if (Value < 0) {//only apply to 'out of intitial home' scenario
        coordinates = placeACoin(playhand.role.color, Value, 1, coin.previousValue, coin);
        coin.value = 0;
        coin.previousValue = coin.value;
        return coordinates;
    }
    else {
        coordinates = placeACoin(playhand.role.color, Value, dif, coin.previousValue, coin);
        coin.previousValue = coin.value;
        return coordinates;
    }
}

function hitACoin(ind, val) {
    for (var j = 0; j < 4; j++) {//role index
        for (var k = 0; k < 4; k++) {//coin index in each role
            if (j !== ind && //Not the same color
                playStatus[j].coins[k].value !== 0 &&
                routes[j][playStatus[j].coins[k].value - 1] === val) { //overlapped
                playStatus[j].coins[k].value = -1; //This coin is sent back home, there might be more than 1 coin that fit this
                playStatus[j].coins[k].previousValue = -1;
            }
        }
    }
}

function updateCoinsStatus(val) {
    if (val === 6)
        playhand.role.continuePlaying = true;
    else
        playhand.role.continuePlaying = false;
    for (var i = 0; i < playhand.role.coins.length; i++) {
        switch (playhand.role.coins[i].value) {
            case -1:
                if (val === 6) playhand.role.allowTakeOff = true;
                break;
            case 0:
                break;
            default:
                break;
        }
    }
}

function updatePos(evt) {
    if (freezeMap)
        return;
    canvas_x = (parseInt(evt.pageX) - parseInt(upcanvas.offsetLeft));
    canvas_y = (parseInt(evt.pageY) - parseInt(upcanvas.offsetTop));
    var tempvar = null;
    if (playhand.role) {
        if ((playhand.role.coins[0].pos.left < canvas_x && canvas_x < playhand.role.coins[0].pos.right &&
            playhand.role.coins[0].pos.top < canvas_y && canvas_y < playhand.role.coins[0].pos.bottom) ||
            (playhand.role.coins[1].pos.left < canvas_x && canvas_x < playhand.role.coins[1].pos.right &&
            playhand.role.coins[1].pos.top < canvas_y && canvas_y < playhand.role.coins[1].pos.bottom) ||
            (playhand.role.coins[2].pos.left < canvas_x && canvas_x < playhand.role.coins[2].pos.right &&
            playhand.role.coins[2].pos.top < canvas_y && canvas_y < playhand.role.coins[2].pos.bottom) ||
            (playhand.role.coins[3].pos.left < canvas_x && canvas_x < playhand.role.coins[3].pos.right &&
            playhand.role.coins[3].pos.top < canvas_y && canvas_y < playhand.role.coins[3].pos.bottom)) {
            tempvar = true;
        }
        else
            tempvar = false;
        if (tempvar) {
            upcanvas.style.cursor = "pointer";
        }
        else {
            upcanvas.style.cursor = "default";
        }
    }
}

function updateRouts(evt) {
    var tempvar = null;
    canvas_x = (parseInt(evt.pageX) - parseInt(upcanvas.offsetLeft));
    canvas_y = (parseInt(evt.pageY) - parseInt(upcanvas.offsetTop));
    if (playhand.role) {
        if (tempvar === null) {
            for (var i = 0; i < playhand.role.coins.length; i++) {
                if (playhand.role.coins[i].pos.left < canvas_x && canvas_x < playhand.role.coins[i].pos.right &&
                        playhand.role.coins[i].pos.top < canvas_y && canvas_y < playhand.role.coins[i].pos.bottom) {
                    tempvar = i;
                    clickOverflow = false;
                    break;
                }
                else {
                    tempvar = null;
                    clickOverflow = true;
                }
            }
        }
        if (tempvar === null) {
            return; //Player didn't click on a coin
        }
        else {
            aCoinClicked(tempvar, true);
        }
    }
}

///////////////////////////////////////////////////

function startTheGame(btn) {
    if (!continueplay) {
        var names = document.getElementsByClassName("playername");
        for (var i = 0; i < names.length; i++) {
                if (names[i].value === "") {
                    btn.value = "Need Names~";
                    names[i].focus();
                    setTimeout(function () {
                        btn.value = "Let's start~";
                    }, 2000);
                    return;
                }
                else {
            playStatus[i].name = names[i].value;
            if (playStatus[i].name === selfName) {
                playStatus[i].self = true;
            }
        }
        document.getElementById("gameon").style.display = "";
        document.getElementById("loadgame").style.display = "";
        document.getElementById("savegame").style.display = "";
            }
        }
        document.getElementById("buttons").style.display = "none";
        document.getElementById("loading").style.display = "";
        coverCanvas = document.getElementById("loading");
        coverCtx = coverCanvas.getContext("2d");
    startUp();
    }
    
function startUp() {
    if (!continueplay) {
        coverCtx.fillStyle = "khaki";
        var interval = 1;
        var startUpSeed = setInterval(function () {
            interval++;
            coverCtx.fillRect(0, 0, 500 * (interval / 100), 30);
        }, 10);
    }
    setTimeout(function () {
        if (!continueplay)
            clearInterval(startUpSeed);
        document.getElementById("cover").style.display = "none";
        document.getElementById("copyright").style.display = "none";
        document.getElementById("backtomenu").style.display = "";
        initPlayGround();
    }, 1000);
}

function showMenu() {
    document.getElementById("cover").style.display = "";
    document.getElementById("copyright").style.display = "";
    document.getElementById("backtomenu").style.display = "none";
    document.getElementById("playGround").style.display = "none";
    document.getElementById("buttons").style.display = "";
    document.getElementById("gameon").value = "Continue Playing";
    continueplay = true;
    coverCanvas.style.display = "none";
}

function changeHands() {
    document.getElementById("rollDice").style.visibility = "none";
    if (playhand.role) {
        if (playhand.role.continuePlaying) {
            if (playhand.role.self)
                document.getElementById("rollDice").style.visibility = "";
            handcount--;
        }
        else {
            if (!notMe) {
                document.getElementById("rollDice").style.visibility = "none";
                var msg = JSON.stringify({ "NotifyNext": handcount });
                sendJSONMessage(msg);
            }
            else {
                notMe = false;
            }
        }
    }
    playhand.color = hands[handcount % 4];
    playhand.role = playStatus[handcount % 4];
    setTimeout(function () {
        if (playhand.role.win) {
            handcount++;
            changeHands();
        }
        playhand.value = handcount % 4;
        dicectx.fillStyle = playhand.color;
        if (onmobile) {
            dicectx.fillRect(0, tileWidth * 2, tileWidth * 2, tileWidth * 2);
            dicectx.clearRect(0, 0, tileWidth * 2, tileWidth * 2);
            dicectx.font = "15px white";
            dicectx.fillText("Click Here", tileWidth / 10, tileWidth * 1.1);
        }
        else {
            dicectx.fillRect(0, tileWidth * 4, tileWidth * 4, tileWidth * 2);
            dicectx.clearRect(0, 0, tileWidth * 4, tileWidth * 4);
        }
        diceValue = 0;
    }, 500);
}

function saveGame(btn) {
    cookieDelete();
    var expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 1);
    var gameData = "";
    var gameDataExtra = "";
    for (var i = 0; i < playStatus.length; i++) {
        for (var j = 0; j < playStatus[i].coins.length; j++) {
            gameData += playStatus[i].color;
            gameData += "@" + playStatus[i].coins[j].value.toString() + "@";
        }
        gameDataExtra += playStatus[i].name;
        gameDataExtra += "@" + (playStatus[i].win ? "1" : "0") + "@";
    }
    gameData += "handcount" + "@" + handcount.toString() + "@";
    gameData += "~" + gameDataExtra;
    document.cookie = "gameData=" + gameData + ";expires=" + expireDate.toGMTString();
    btn.value = "Saved";
    setTimeout(function () {
        btn.value = "Save Game";
    }, 3000);
}

function loadGame(btn) {
    var gameData = showCookies();
    if (gameData === "NoData") {
        btn.value = "No Data";
        setTimeout(function () {
            btn.value = "Load Game";
        }, 3000);
    }
    else {
        btn.value = "Loading...";
        setTimeout(function () {
            btn.value = "Load Game";
        }, 5000);
        var parsedData = gameData.split("~");
        parsedAData = parsedData[0].split("@");
        parsedBData = parsedData[1].split("@");
        for (var i = 0; i < playStatus.length; i++) {
            playStatus[i].touchBaseCount = 0;
            for (var j = 0; j < playStatus[i].coins.length; j++) {
                playStatus[i].coins[j].value = parseInt((parsedAData[2 * (i * 4 + j) + 1]));
                if (playStatus[i].coins[j].value === 56) {
                    playStatus[i].touchBaseCount++;
                }
                playStatus[i].coins[j].previousValue = playStatus[i].coins[j].value;
            }
            playStatus[i].name = parsedBData[i * 2] === "null" ? null : parsedBData[i * 2];
            playStatus[i].win = parsedBData[i * 2 + 1] === "1" ? true : false;
        }
        handcount = parseInt(parsedAData[parsedAData.length - 2]);
        startTheGame();
    }
}

function cookieDelete() {
    var cookieCt = 0;
    if (document.cookie !== "") {
        var thisCookie = document.cookie.split("; ");
        cookieCt = thisCookie.length;
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() - 1);
        for (var i = 0; i < cookieCt; i++) {
            var cookieName = thisCookie[i].split("=")[0];
            document.cookie = cookieName + "=;expires=" + expireDate.toGMTString();
        }
    }
}

function showCookies() {
    var outMsg = "";
    if (document.cookie === "") {
        outMsg = "NoData";
    }
    else {
        var thisCookie = document.cookie.split("; ");
        for (var i = 0; i < thisCookie.length; i++) {
            if (thisCookie[i].split("=")[0] === "gameData") {
                outMsg += thisCookie[i].split("=")[1];
                break;
            }
            else {
                outMsg = "NoData";
            }
        }
    }
    return outMsg;
}

///////////////////////////////////////////////////

///Random number generate
rnd.today = new Date();

rnd.seed = rnd.today.getTime();

function rnd() {

    rnd.seed = (rnd.seed * 9301 + 49297) % 233280;

    return rnd.seed / (233280.0);

};

function rand(number) {

    return Math.ceil(rnd() * number);

};