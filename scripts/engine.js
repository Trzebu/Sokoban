"use strict"

var game_window = null;
var ctx = null;

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
                    //start loop
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

document.addEventListener("DOMContentLoaded", () => {
    var canvas = document.getElementById("game");
    game_window = document.getElementById("game_window");
    ctx = canvas.getContext("2d");
    img = new img();
});
