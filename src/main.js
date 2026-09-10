import { BGM } from "./BGM";
import { physics, Start } from "./core";
import { c, camera, Obj, conf, Get } from "./core/engine";
import { Tween } from "./core/Tween";
import DrawBackground from "./DrawBackground";
import { collect, fail, jump } from "./sound";
export const gameStatus = {
    red: false,
    orange: false,
    yellow: false,
    green: false,
    lightblue: false,
    blue: false,
    purple: false,
};
class Arrow extends Obj {
    constructor(x, y) {
        super(["assets/arrow.png"]);
        this.size = [16, 16];
        this.name = "arrow";
        this.x = x;
        this.y = y;
    }
}
class Arrow2 extends Obj {
    constructor(x, y) {
        super(["assets/arrow2.png"]);
        this.size = [16, 16];
        this.name = "arrow";
        this.x = x;
        this.y = y;
    }
}
class Ground extends Obj {
    constructor() {
        super();
        this.size = [1024, 64];
        this.collSize = [1024, 64];
        this.name = "ground";
    }
}

function CreateGround(x, y, w, h, color = "#ae1414") {
    let ground = new Ground();
    ground.color = color;
    ground.x = x;
    ground.y = y;
    ground.size = [w, h];
    ground.collSize = [w, h];
    physics.Register(ground, {
    });
    return ground;
}
const playerReset = CreateGround(0, 300, 100, 4);
playerReset.name = "fail";

class PickUp extends Obj {
    colorInside;
    colorOutside;
    constructor(colorInside, colorOutside, x, y, name) {
        super();
        this.colorInside = colorInside;
        this.colorOutside = colorOutside;
        this.x = x;
        this.y = y;
        this.size = [8, 8];
        this.collSize = [32, 32];
        this.Scale();
        this.name = name;
    }
    Scale() {
        Tween({
            from: 0,
            to: 1,
            duration: 1000,
            onUpdate: (x) => {
                let s = x * 8;
                this.size = [s + 8, s + 8];
            },
            onComplete: () => {
                Tween({
                    from: 1,
                    to: 0,
                    duration: 1000,
                    onUpdate: (x) => {
                        let s = x * 8;
                        this.size = [s + 8, s + 8];
                    },
                    onComplete: () => {
                        this.Scale();
                    },
                });
            },
        });
    }
    Render() {
        let pX = this.x - camera.x + conf.w / 2;
        let pY = this.y - camera.y + conf.h / 2;
        c.beginPath();
        c.arc(pX, pY, this.size[0], 0, 2 * Math.PI);
        c.fillStyle = this.colorOutside;
        c.fill();
        c.beginPath();
        c.arc(pX, pY, this.size[0] * 0.7, 0, 2 * Math.PI);
        c.fillStyle = this.colorInside;
        c.fill();
    }
}

const red = new PickUp("#9e0f0f", "#ff3434", 200, 0, "red");
const orange = new PickUp("#a2801a", "#ffa536", 800, -240, "orange");
const yellow = new PickUp("#b1af16", "#e2ff40", 2050, -370, "yellow");
const green = new PickUp("#199a10", "#53ff40", 0, -450, "green");
const lightBlue = new PickUp("#15868b", "#44efff", -1550, -50, "lightBlue");
const blue = new PickUp("#1e1e7e", "#2534ff", -3000, -50, "blue");
const purple = new PickUp("#5f0b4f", "#f52eff", -1400, 50, "purple");

function SpawnPlatforms() {
    const pos = [
        [120, -60],
        [240, 0],
        [360, 60],
        [240, 120],
        [480, 0],
        [600, -60],

        [800, 20],
        [920, -30],
        [950, 70],
        [1050, 150],
        [920, 200],
        [1150, -60],
        [1350, -60],

        [1800, -50],
        [1700, 10],
        [1500, 70],
        [1700, 130],
        [1800, 190],
        [1900, 250],

        [1500, 250],
        [1300, 300],
        [1100, 360],
        [900, 420],
        [500, 420],
        [100, 420],
        [-500, 200],
        [-650, 350],
        [-800, 500],
        [-650, 650],
        [-800, 800],
        [-1550, 150],
        [-1550, 350],
        [-1550, 550],
        [-1550, 750],
        [-1550, 950],
        [-1550, 1150],
        [-1550, 1350],
        [-750, -50],
    ];
    for (let i of pos) {
        CreateGround(i[0], -i[1], 50, 5);
    }
}

const grounds = [];
let a = "#000";

grounds.push(CreateGround(0, 300, 500, 400, a));
grounds.push(CreateGround(800, 300, 300, 400, a));
grounds.push(CreateGround(800, -200, 100, 10, a));
grounds.push(CreateGround(-480, 300, 500, 700, a));
grounds.push(CreateGround(1850, 300, 500, 400, a));
grounds.push(CreateGround(2050, -300, 100, 50, a));
grounds.push(CreateGround(2300, -300, 400, 10000, a));
grounds.push(CreateGround(0, -400, 100, 10, a));
grounds.push(CreateGround(-200, -800, 20, 1000, a));
grounds.push(CreateGround(-1100, -400, 200, 1000, a));
grounds.push(CreateGround(-1700, -700, 200, 1600, a));
grounds.push(CreateGround(-1400, -0, 600, 50, a));
grounds.push(CreateGround(-3000, -0, 200, 50, a));
grounds.push(CreateGround(-3500, -300, 400, 10000, a));
new Arrow(-100, -400);
new Arrow2(-1850, -1550);

new Arrow2(500, -470);
new Arrow2(900, -470);
new Arrow(-1250, -950);
function GetPickup(num) {
    collect();
    if (num == 1 && !gameStatus.red) {
        gameStatus.red = true;
        red.Remove();
        SpawnPlatforms();
        Show("c1");
    }
    if (num == 2 && !gameStatus.orange) {
        gameStatus.orange = true;
        orange.Remove();
        player.speed = 7;
        Show("c2");
    }
    if (num == 3 && !gameStatus.yellow) {
        gameStatus.yellow = true;
        yellow.Remove();
        player.canDash = true;
        Show("c3");
    }
    if (num == 4 && !gameStatus.green) {
        gameStatus.green = true;
        green.Remove();
        grounds.map((i) => (i.color = "#157b30"));

        player.jumpHeight = -45;
        Show("c4");
    }
    if (num == 5 && !gameStatus.lightblue) {
        gameStatus.lightblue = true;
        lightBlue.Remove();
        player.canDouble = true;
        Show("c5");
    }
    if (num == 6 && !gameStatus.blue) {
        gameStatus.blue = true;
        blue.Remove();
        superJump.y = 175;
        Show("c6");
    }
    if (num == 7 && !gameStatus.purple) {
        gameStatus.purple = true;
        purple.Remove();
    }
    if (
        gameStatus.red &&
        gameStatus.orange &&
        gameStatus.yellow &&
        gameStatus.green &&
        gameStatus.lightblue &&
        gameStatus.blue &&
        gameStatus.purple
    ) {
        Get("complete").style.display = "flex";
    }
}

let superJump = new Ground();
superJump.width = 2000;
superJump.height = 20;
superJump.y = 1750;
superJump.name = "jump";
superJump.color = "#00000000";
physics.Register(superJump, {});

class Player extends Obj {
    speed = 4;
    jumpHeight = -25;
    y = 60;
    x = 0;
    isGround = true;
    isJump = false;
    canDash = false;
    canDouble = false;
    isDash = false;
    isDoubled = false;
    isFall = false;
    constructor() {
        super([
            "assets/unicorn1.png",
            "assets/unicorn8.png",
            "assets/unicorn2.png",
            "assets/unicorn3.png",
            "assets/unicorn4.png",
            "assets/unicorn5.png",
            "assets/unicorn6.png",
            "assets/unicorn7.png",
        ]);
        this.size = [64, 64];
        this.collSize = [32, 32];
        this.animTarget = 6;
        this.animInterval = 100;
        this.interval = setInterval(() => {
            if (conf.pause) {
                return;
            }
            this.a = (this.a + 1) % this.animTarget;
        }, this.animInterval);
    }
    Update(deltaTime) {
        const s = conf.pressed;
        const k = conf.keys;
        let p = 0;

        if (s["a"]) {
            p--;
        }
        if (s["d"]) {
            p++;
        }

        if (k["space"] == 1) {
            this.Jump(false, deltaTime);
        }
        if (k["r"] == 1) {
            if (this.isFall) {
                Handle1();
            }
        }
        if (k["e"] == 1) {
            for (let i = 1; i <= 6; i++) {
                Handle2("c" + i);
            }
        }
        if (this.y < 0) {
            camera.y = this.y;
        } else {
            camera.y = 0;
        }
        if (k["shift"] == 1) {
            this.Dash(p, deltaTime);
        }
        camera.x = this.x;
        playerReset.x = this.x;
        superJump.x = this.x;
        this.Move(p);
        if (this.vx != 0) {
            this.anim = this.a + 2;
        } else if (!this.isGround) {
            this.anim = 1;
        } else {
            this.anim = 0;
        }
        this.isGround = false;
    }
    Collision(other, normal) {
        if (other.name == "ground") {
            if (normal[1] == 1) {
                this.isGround = true;
                this.isJump = false;
                this.isDoubled = true;
            }
        }
        if (other.name == "fail") {
            this.isFall = true;
            fail();
            Get("fail").style.display = "flex";
        }
        if (other.name == "jump") {
            this.isDoubled = false;
            this.Jump(true);
        }
    }
    Trigger(other) {
        if (other.name == "red") {
            GetPickup(1);
        }
        if (other.name == "orange") {
            GetPickup(2);
        }
        if (other.name == "yellow") {
            GetPickup(3);
        }
        if (other.name == "green") {
            GetPickup(4);
        }
        if (other.name == "lightBlue") {
            GetPickup(5);
        }
        if (other.name == "blue") {
            GetPickup(6);
        }
        if (other.name == "purple") {
            GetPickup(7);
        }
    }
    Jump(force, deltaTime = 1 / 60) {
        if (!this.isGround && !force) {
            this.DoubleJump(force);
            return;
        }

        jump();
        this.isGround = false;
        this.isJump = true;
        Tween({
            from: 0.5,
            to: 0,
            onUpdate: (y) => {
                this.vy = this.jumpHeight * y;
            },
            duration: 300 + (60 - 1 / deltaTime),
        });
    }
    DoubleJump() {
        if (!this.canDouble) {
            return;
        }
        if (!this.isDoubled) return;
        this.isDoubled = false;
        this.isJump = true;
        Tween({
            from: 0.5,
            to: 0,
            onUpdate: (y) => {
                this.vy = this.jumpHeight * y;
            },
            duration: 300,
        });
    }
    Dash(p, deltaTime) {
        if (!this.canDash) {
            return;
        }
        if (this.isDash) return;
        this.isDash = true;
        Tween({
            from: 0.5,
            to: 0,
            onUpdate: (y) => {
                this.vx = 100 * y * p;
            },
            duration: 300 + (60 - 1 / deltaTime),
            onComplete: () => {
                this.isDash = false;
            },
        });
    }

    Move(dir) {
        if (dir != 0) {
            this.flip = dir > 0;
            this.vx = dir * this.speed;
        } else {
            this.vx = 0;
        }
    }
}

export const player = new Player();

physics.Register(red, false);
physics.Register(orange, false);
physics.Register(yellow, false);
physics.Register(green, false);
physics.Register(lightBlue, false);
physics.Register(blue, false);
physics.Register(purple, false);

physics.Register(player, {
    mass: 1,
    friction: 0.9,
    gravity: 1,
    isStatic: false,
    maxSpeed: 20,
});

conf.drawBackground = DrawBackground;

function Handle1() {
    player.x = 0;
    player.isFall = false;
    player.y = 60;
    Get("fail").style.display = "none";
}
function Handle2(id) {
    Get(id).style.display = "none";
}
function Show(id) {
    Get(id).style.display = "flex";
}
window.PlayerReset = Handle1;
window.Off = Handle2;
Start();
