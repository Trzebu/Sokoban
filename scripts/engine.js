"use strict"

var game_window = null;
var ctx = null;
var game_loop = null;
var map = [];
var stones = [];

function draw (interp) {
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 512, 512);

    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            ctx.drawImage(
                map[i][j][1],
                0, 0,
                32, 32,
                j * 32, i * 32,
                32, 32
            );
        }
    }

    for (var i in stones) {
       ctx.drawImage(
            stones[i]["img"],
            0, 0,
            32, 32,
            stones[i]["x"] * 32, stones[i]["y"] * 32,
            32, 32
        ); 
    }

}

var Stone = function (id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;

    if (id == "player") {
        this.img = img.get("player");
    } else {
        this.img = img.get("kamien1");
    }

}

function getStoneById (id) {
    for (var i in stones) {
        if (stones[i].id == id) {
            return stones[i];
        }
    }
    return false;
}

function loadMap () {
    var char = 0;

    for (var i = 0; i < 16; i++) {
        map[i] = new Array();

        for (var j = 0; j < 16; j++) {

            switch (maps[0].charAt(char)) {
                case " ":
                    map[i][j] = ["TEXTURE_NONE", img.get("kafelka3")];
                break;
                case ".":
                    map[i][j] = ["TEXTURE_FLOOR", img.get("kafelka")];
                break;
                case "c":
                    map[i][j] = ["TEXTURE_WALL", img.get("murek")];
                break;
                case "w":
                    map[i][j] = ["TEXTURE_WALL", img.get("castle_wall")];
                break;
                case "x":
                    map[i][j] = ["TEXTURE_FLOOR_X", img.get("kafelka2")];
                break;
                case "s":
                    map[i][j] = ["TEXTURE_FLOOR", img.get("kafelka")];
                    stones.push(new Stone("stone", j, i));
                break;
                case "p":
                    map[i][j] = ["TEXTURE_FLOOR", img.get("kafelka")];
                    stones.push(new Stone("player", j, i));
                break;
            }

            char++;
        }

    }

}

var GameLoop = function () {
    this.loopId = null;
    this.lastFrameTimeMs = 0;
    this.delta = 0;
    this.fps = 60;
    this.frameThisSecond = 0;
    this.lastFpsUpdate = 0;

    this.loop = function (timestamp) {
        if (timestamp < this.lastFrameTimeMs + (1000 / 60)) {
            window.requestAnimationFrame(this.loop.bind(this));
            return;
        }

        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        if (timestamp > (this.lastFpsUpdate + 1000)) {
            this.fps = 0.25 * this.frameThisSecond + 0.75 * this.fps;
            this.lastFpsUpdate = timestamp;
            this.frameThisSecond = 0;
        }

        this.frameThisSecond++;
        var numUpdateSteps = 0;

        while(this.delta >= (1000 / 60)){
            //logic update
            this.delta -= 1000 / 60;
            if(++numUpdateSteps >= 240){
                this.panic();
                break;
            }
        }

        //animations
        draw(this.delta / (1000 / 60));

        this.loopId = window.requestAnimationFrame(this.loop.bind(this));
    }

    this.panic = function () {
        this.delta = 0;
    }

    this.stopLoop = function () {
        window.cancelAnimationFrame(this.loopId);
    }

    this.startLoop = function () {
        this.loopId = window.requestAnimationFrame(this.loop.bind(this));
    }

    this.startLoop();
}

var img = function () {
    this.images = [];
    this.list = [
        "castle_wall",
        "kafelka",
        "kafelka2",
        "kafelka3",
        "kamien_hi1",
        "kamien1",
        "kamien2",
        "kamien3",
        "murek",
        "player",
        "st_floor"
    ];

    this.get = function (id) {
        for (var i in this.images) {
            if (this.images[i].id == id) {
                return this.images[i].obj;
            }
        }
        return false;
    }

    this.load = function () {
        var amount = 0;
        for (var i in this.list) {
            var object = new Image();
            object.src = "data/img/" + this.list[i] + ".png";
            object.onload = function () {
                amount++;
                if (amount == this.list.length) {
                    gameStart();
                }
            }.bind(this);
            object.onerror = function () {
                console.error("Error while load queue. Can not load image " + this.list[i]);
            }.bind(this);
            this.images.push({
                id: this.list[i],
                obj: object
            });
        }
    }

    this.load();
}

function gameStart () {
    loadMap();
    game_loop = new GameLoop();
}

document.addEventListener("DOMContentLoaded", () => {
    var canvas = document.getElementById("game");
    game_window = document.getElementById("game_window");
    ctx = canvas.getContext("2d");
    img = new img();
});
