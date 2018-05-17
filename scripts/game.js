class Main {

    constructor () {
        this.width = 512;
        this.height = 512;
        this.canvas = document.getElementById('game_window');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context.fillStyle = 'black';
        this.context.font = "24pt Arial";
        this.context.fillText('Loading...', 190, 250);
        this.images = [];
        this.map = [];
        this.lvl = 0;
        this.game_complete = false;
        this.stones = [];
        this.player = undefined;
        this.steps = 0;
        this.loaded = false;
        this.loadImages();
        this.loadMap();
        setTimeout(function () {
            this.interface = new Interface(this);
            this.draw = new Draw(this);
        }.bind(this), 400);
    }

    loadImages () {
        let textures_name = ['castle_wall', 'kafelka', 'kafelka2', 'kafelka3', 'kamien1', 'kamien2', 'kamien3', 'kamien_hi1', 'murek', 'st_floor', 'player'];
        let path = 'img/';
        let amount = 0;

        for (let i = 0; i < textures_name.length; i++) {
            this.images.push({
                object: new Image,
                name: textures_name[i]
            });
            this.images[i].object.src = path + textures_name[i] + '.png';
            this.images[i].object.onload = () => {
                amount++;
                if (amount == textures_name.length) {
                    this.loaded = true; 
                }
            }
            this.images[i].object.onerror = () => {
                console.error('I cant load image: ' + textures_name[i]);
            };
        }

    }

    getImg (name) {
        for (let i = 0; i < this.images.length; i++) {
            if (name == this.images[i].name) {
                return this.images[i];
            }
        }
        return false;
    }

    loadMap () {
        var character_nr = 0;

        for (let i = 0; i < 16; i++) {
            this.map[i] = new Array();

            for (let j = 0; j < 16; j++) {
                switch (maps[this.lvl].charAt(character_nr)) {

                    case ' ': this.map[i][j] = ["TEXTURE_NONE", this.getImg('kafelka3')]; break;
                    case '.': this.map[i][j] = ["TEXTURE_FLOOR", this.getImg('kafelka')]; break;
                    case 'c': this.map[i][j] = ["TEXTURE_WALL", this.getImg('murek')]; break;
                    case 'w': this.map[i][j] = ["TEXTURE_WALL", this.getImg('castle_wall')]; break;
                    case 'x': this.map[i][j] = ["TEXTURE_FLOOR_X", this.getImg('kafelka2')]; break;
                    case 's':
                        this.map[i][j] = ["TEXTURE_FLOOR", this.getImg('kafelka')];
                        this.stones.push(new Stone(j, i, this.getImg('kamien1'), this.getImg('kamien_hi1'), this));
                    break;
                    case 'p': 
                        this.map[i][j] = ["TEXTURE_FLOOR", this.getImg('kafelka')];
                        this.player = new Player(j, i, this.getImg('player'), this);
                    break;

                }

                character_nr++;
            }
        }
    }

    getStoneById (x, y) {
        for (let i = 0; i < this.stones.length; i++) {
            if (this.stones[i].x == x && this.stones[i].y == y) {
                return i;
            }
        }
        return false;
    }

    update () {
        this.checkStats();
        this.interface.stats();
        this.draw.draw();
    }

    checkStats () {
        let amount = 0;
        for (let i = 0; i < this.stones.length; i++) {
            if (this.stones[i].highlighting_set) {
                amount++;
            }
        }
        if (amount == this.stones.length) {
            this.lvl++;
            if (this.lvl == maps.length) {
                this.game_complete = true;
            } else {
                this.mapClear();
                this.loadMap();
            }
        }
    }

    map_reset () {
        if (!this.game_complete) {
            this.mapClear();
            this.loadMap();
            this.update();
        }
    }

    mapClear () {
        this.stones = [];
        this.player = undefined;
        this.map = [];
        this.interface.stats();
    }

    reset () {
        this.lvl = 0;
        this.interface.time = 0;
        this.steps = 0;
        this.mapClear();
        this.loadMap();
        this.game_complete = false;
        this.update();
    }

}

class Player {

    constructor (x, y, img, main) {
        this.x = x;
        this.y = y;
        this.img = img.object;
        this.main = main;
        this.move_ok = true;
    }

    move (dir) {
        this.delta_x = 0;
        this.delta_y = 0;

        if (dir === 'a') {
            this.delta_x--;
        } else if (dir === 'd') {
            this.delta_x++;
        } else if (dir === 'w') {
            this.delta_y--;
        } else if (dir === 's') {
            this.delta_y++;
        }

        this.new_position_x = this.x + this.delta_x;
        this.new_position_y = this.y + this.delta_y;
        this.move_ok = this.checkCollisions();

        if (this.move_ok) {
            this.x = this.new_position_x;
            this.y = this.new_position_y;
            this.main.steps++;
        }
    }

    checkCollisions () {

        this.stone_id = this.main.getStoneById(this.new_position_x, this.new_position_y);

        if (this.main.map[this.new_position_y][this.new_position_x][0] === 'TEXTURE_WALL') {
            return false;
        } else if (this.stone_id !== false) {
            return this.main.stones[this.stone_id].move();
        } else {
            return true;
        }

    }

}

class Stone {

    constructor (x, y, img, highlighting_img, main) {
        this.x = x;
        this.y = y;
        this.img = img.object;
        this.highlighting_img = highlighting_img.object;
        this.main = main;
        this.id = 0;
        this.highlighting_set = false;
    }

    move () {
        this.new_position_x = this.main.player.new_position_x + this.main.player.delta_x
        this.new_position_y = this.main.player.new_position_y + this.main.player.delta_y
        this.move_ok = true;
        this.id = this.main.getStoneById(this.new_position_x, this.new_position_y);

        if (this.main.map[this.new_position_y][this.new_position_x][0] === 'TEXTURE_WALL') {
            this.move_ok = false;
        } else if (this.id !== false) {
            this.move_ok = false;
        } else if (this.main.map[this.new_position_y][this.new_position_x][0] === 'TEXTURE_FLOOR_X') {
            this.highlighting();
        }

        if (this.move_ok) {
            this.x = this.new_position_x;
            this.y = this.new_position_y;
            return true;
        } else {
            return false;
        }
    }

    highlighting () {
        if (!this.highlighting_set) {
            this.highlighting_set = true;
            this.img = this.highlighting_img;
            const SOUND = new Audio('sounds/sounds1.mp3');
            SOUND.play();
        }
    }

}

class Draw {

    constructor (main) {
        this.main = main;
        this.draw();
    }

    draw () {
        this.main.context.clearRect(0, 0, this.main.width, this.main.height);
        this.main.context.fillStyle = 'white';
        this.main.context.fillRect(0, 0, this.main.width, this.main.height);

        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                this.main.context.drawImage(
                    this.main.map[i][j][1].object,
                    0, 0,
                    32, 32,
                    j * 32, i * 32,
                    32, 32
                );
            }
        }

        for (let i = 0; i < this.main.stones.length; i++) {
            this.main.context.drawImage(
                this.main.stones[i].img,
                0, 0,
                32, 32,
                this.main.stones[i].x * 32, this.main.stones[i].y * 32,
                32, 32
            );
        }

        this.main.context.drawImage(
            this.main.player.img,
            0, 0,
            32, 32,
            this.main.player.x * 32, this.main.player.y * 32,
            32, 32
        );

        if (this.main.game_complete) {
            this.main.context.fillStyle = 'black';
            this.main.context.fillRect(0, 0, this.main.width, this.main.height);
            this.main.context.fillStyle = 'white';
            this.main.context.font = "24pt Arial";
            this.main.context.fillText('Game complete.', 150, 250);
        }
    }

}

class Interface {

    constructor (main) {
        this.main = main;
        this.time = 0;
        this.stats();
        this.keyboard();
        this.timer();
    }

    stats () {
        document.getElementById('game_stats').innerHTML = "Time: " + this.time + " Lvl: " + (this.main.lvl + 1) + " Steps: " + this.main.steps;
    }

    timer () {
        setInterval(function () {
            if (!this.main.game_complete) {
                this.time++;
                this.stats();
            }
        }.bind(this), 1000);
    }

    keyboard () {
        document.addEventListener('keydown', function(e) {
            if (!this.main.game_complete) {
                let key = e.which || e.keyCode;
                switch (key) {
                    case 65: this.main.player.move('a'); break;
                    case 68: this.main.player.move('d'); break;
                    case 87: this.main.player.move('w'); break;
                    case 83: this.main.player.move('s'); break;
                    case 37: this.main.player.move('a'); break;
                    case 38: this.main.player.move('w'); break;
                    case 39: this.main.player.move('d'); break;
                    case 40: this.main.player.move('s'); break;
                }
                this.main.update(); 
            }
        }.bind(this));
    }

}

const MAIN = new Main();
