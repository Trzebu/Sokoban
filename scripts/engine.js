"use strict"

var game_window = null;
var ctx = null;
var game_loop = null;
var player = null;
var game_complete = false;
var keys = new Keyboard();
var map = [];
var stones = [];
var lvl = 0;
var steps = 0;
var time = 0;

var Stone = function (name, x, y) {
    this.id = x + y;
    this.name = name;
    this.x = x;
    this.y = y;
    this.delta_x = this.x;
    this.delta_y = this.y;
    this.pixel_pos = {
        x: this.x * 32,
        y: this.y * 32
    }
    this.in_roud = false;
    this.move_ok = true;
    this.highlighting = false;

    if (name == "player") {
        this.img = img.get("player");
    } else {
        this.img = img.get("kamien1");
    }

    this.move = function () {
        var stone_near = getStoneByCoord(this.x, this.y, this.id);

        if (map[this.y][this.x][0] === "TEXTURE_WALL") {
            this.move_ok = false;
        } else if (stone_near !== false) {
            var stone_new_x = this.x;
            var stone_new_y = this.y;

            if (this.x !== this.delta_x) {
                stone_new_x = this.x < this.delta_x ? this.x - 1 : this.x + 1;
            } else if (this.y !== this.delta_y) {
                stone_new_y = this.y < this.delta_y ? this.y - 1 : this.y + 1;
            }

            var stone_near_stone = getStoneByCoord(stone_new_x, stone_new_y, stones[stone_near]);

            if (map[stone_new_y][stone_new_x][0] === "TEXTURE_WALL") {
                this.move_ok = false
            } else if (stone_near_stone !== false) {
                this.move_ok = false
            } else {
                stones[stone_near]["x"] = stone_new_x;
                stones[stone_near]["y"] = stone_new_y;
                stones[stone_near].checkHighlighting();
            }

        } else {
            this.move_ok = true;
        }

        if (!this.move_ok)  {
            this.x = this.delta_x;
            this.y = this.delta_y;
            return;
        }

        if (this.x !== this.delta_x) {
            this.pixel_pos["x"] += this.x < this.delta_x ? -4 : 4;
            this.delta_x += this.x < this.delta_x ? -0.125 : 0.125;
            this.in_roud = true;
            this.steps();
        } else if (this.y !== this.delta_y) {
            this.pixel_pos["y"] += this.y < this.delta_y ? -4 : 4;
            this.delta_y += this.y < this.delta_y ? -0.125 : 0.125;
            this.in_roud = true;
            this.steps();
        } else {
            this.in_roud = false;
        }
    }

    this.checkHighlighting = function () {
        if (map[this.y][this.x][0] === "TEXTURE_FLOOR_X") {
            this.highlighting = true;
            this.img = img.get("kamien_hi1");
        } else {
            this.highlighting = false;
            this.img = img.get("kamien1");
        }
    }

    this.steps = function () {
        if (this.name == "player") {
            steps += 0.125;
        }
    }

}

function getStoneByCoord (x, y, id) {
    for (var i = 0; i < stones.length; i++) {
        if (stones[i].x == x && stones[i].y == y && id != stones[i].id) {
            return i;
        }
    }
    return false;
}

function getStoneById (id) {
    for (var i in stones) {
        if (stones[i].name == id) {
            return stones[i];
        }
    }
    return false;
}

function loadMap () {
    var char = 0;

    if (typeof maps[lvl] === "undefined") {
        return;
    }

    for (var i = 0; i < 16; i++) {
        map[i] = new Array();

        for (var j = 0; j < 16; j++) {

            switch (maps[lvl].charAt(char)) {
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

function draw (interp) {
    ctx.clearRect(0, 0, 512, 512);

    if (game_complete) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = 'white';
        ctx.font = "24pt Arial";
        ctx.fillText('Game complete.', 150, 250);
        return;
    }

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
            stones[i]["pixel_pos"]["x"], stones[i]["pixel_pos"]["y"],
            32, 32
        ); 
    }

}

function checkStonesReady () {
    var amount = 0;
    for (var i in stones) {
        if (stones[i].name === "stone") {
            if (stones[i].highlighting) {
                amount++;
            }
        }
    }

    if (amount == (stones.length - 1)) {
        ++lvl;
        loadLvl();
    }

}

function loadLvl () {
    if (lvl == maps.length) {
        gameComplete();
        return;
    }
    map = [];
    stones = [];
    loadMap();
    player = getStoneById("player");
}

function gameComplete () {
    game_complete = true;
    game_loop.stopLoop();
    time.stop();
}

function updateStats () {
    document.getElementById("timer").innerText = "Time: " + time.time;
    document.getElementById("steps").innerText = "Steps: " + parseInt(steps);
    document.getElementById("lvl").innerText = "Lvl: " + (lvl + 1);
}

function gameReset () {
    lvl = 0;
    steps = 0;
    game_complete = false;
    time.reset();
    loadLvl();
}

var Timer = function () {

    this.time = 0;
    this.intervalId = null;

    this.increment = function () {
        this.time++;
    }

    this.start = function () {
        this.intervalId = setInterval(this.increment.bind(this), 1000);
    }

    this.stop = function () {
        clearInterval(this.intervalId);
    }

    this.reset = function () {
        this.stop();
        this.time = 0;
        this.start();
    }

}

function updateKeys () {

    if (!player.in_roud && player) {
        if (keys.use.A.pressed ||
            keys.use.left.pressed) {
            player.x--;
        } else if (keys.use.D.pressed ||
                   keys.use.right.pressed) {
            player.x++;
        } else if (keys.use.S.pressed ||
                   keys.use.down.pressed) {
            player.y++;
        } else if (keys.use.W.pressed ||
                   keys.use.up.pressed) {
            player.y--;
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
        var start = timestamp;
        if (timestamp < this.lastFrameTimeMs + (1000 / 60)) {
            this.loopId = window.requestAnimationFrame(this.loop.bind(this));
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

            for (var i in stones) {
                stones[i].move();
            }

            updateKeys();
            checkStonesReady();
            updateStats();

            this.delta -= 1000 / 60;
            if(++numUpdateSteps >= 240){
                this.panic();
                break;
            }
        }

        draw(this.delta / timestamp);

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

function Keyboard () {
    this.use = {
        'W': {
            pressed: false,
            name: "W"
        },
        'S': {
            pressed: false,
            name: "S"
        },
        'A': {
            pressed: false,
            name: "A"
        },
        'D': {
            pressed: false,
            name: "D"
        },
        'up': {
            pressed: false,
            name: "up"
        },
        'down': {
            pressed: false,
            name: "down"
        },
        'left': {
            pressed: false,
            name: "left"
        },
        'right': {
            pressed: false,
            name: "right"
        }
    }

    this.keys = {
        '87': 'W',
        '83': 'S',
        '65': 'A',
        '68': 'D',
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down'
    }

    this.init = function () {
        window.document.addEventListener("keydown", (e) => this.keyDown(e));
        window.document.addEventListener("keyup", (e) => this.keyUp(e));
    }

    this.keyDown = function (e) {
        var code = e.which || e.keyCode;
        var key = this.getKeyById(e, code);

        if(!this.use[key]){
            return false;
        }

        this.use[key].pressed = true;
    }

    this.keyUp = function (e) {
        var code = e.which || e.keyCode;
        var key = this.getKeyById(e, code);

        if (this.use[key] && this.use[key].pressed) {
            this.use[key].pressed = false;
        }
    }

    this.getKeyById = function (e, id) {
        if (this.keys[id]) {
            e.preventDefault();
            return this.keys[id];
        }

        return;
    }

    this.init();

}

function gameStart () {
    loadLvl();
    game_loop = new GameLoop();
    time = new Timer();
    time.start();
}

document.addEventListener("DOMContentLoaded", () => {
    var canvas = document.getElementById("game");
    game_window = document.getElementById("game_window");
    ctx = canvas.getContext("2d");
    img = new img();
});
