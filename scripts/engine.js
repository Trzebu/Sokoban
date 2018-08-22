"use strict"

var game_window = null;
var ctx = null;

var img = function () {
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
    this.images = [];

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
            this.images.push({id: this.list[i], obj: object});
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
