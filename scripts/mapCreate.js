var grid = [];
var currentAsset = "rubber";
var assets = {
    "rubber": ["data/img/eraser.png", " ", "Clear one square"],
    "castle_wall": ["data/img/castle_wall.png", "w", "Wall like castle"],
    "kafelka": ["data/img/kafelka.png", ".", "Floor"],
    "kafelka2": ["data/img/kafelka2.png", "x", "Stone floor"],
    "kamien1": ["data/img/kamien1.png", "s", "Stone"],
    "murek": ["data/img/murek.png", "c", "Wall"],
    "player": ["data/img/player.png", "p", "Player"],
    //"st_floor": ["data/img/st_floor.png", "?"],
}

function setImage (y, x) {
    var element = document.getElementById(y + "_" + x);
    var asset = assets[currentAsset];

    if (currentAsset !== "rubber") {
        element.style.backgroundImage = "url(" + asset[0] + ")";
        element.setAttribute("title", "X: " + x + ", Y: " + y + ", (" + asset[2] + ")");
    } else {
        element.style.backgroundImage = "";
    }

    grid[y][x] = asset[1];

}

function useAsset (name) {
    currentAsset = name;
}

function loadAssets () {

    for (var i in assets) {
        var div = document.createElement("div");
        div.className = "asset";
        div.setAttribute("onclick", "useAsset('" + i + "')");
        div.setAttribute("title", assets[i][2]);
        div.style.backgroundImage = "url('" + assets[i][0] +"')";
        document.getElementById("assets").appendChild(div);
    }

}

function loadGrid () {

    for (var i = 0; i < 16; i++) {
        grid[i] = [];
        for (var j = 0; j < 16; j++) {
            var div = document.createElement("div");
            div.className = "grid";
            div.id = i + "_" + j;
            div.setAttribute("onclick", "setImage(" + i + "," + j + ")");
            div.setAttribute("title", "X: " + j + ", Y: " + i);
            document.getElementById("game").appendChild(div);
            grid[i][j] = " ";
        }
    }

}

function getMapCode () {
    var code = "";

    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            code += grid[i][j];
        }
    }

    prompt("Here is your map code. Paste this code to maps.js as new array. That's all, your map is ready to play! ", code);
}

document.addEventListener("DOMContentLoaded", () => {
    loadGrid();
    loadAssets();
});