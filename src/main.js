class Ground extends Obj {
    constructor() {
        super(["assets/black.png"]);
        this.size = [1024, 64];
        this.collSize = [1024, 64];
        this.name = "ground";
    }
}

function CreateGround(x, y, w, h) {
    let ground = new Ground();
    ground.x = x;
    ground.y = y;
    ground.size = [w, h];
    ground.collSize = [w, h];
    physics.Register(ground, {
        mass: 999,
        bounce: 0,
        friction: 0.5,
        gravity: 0,
        isStatic: true,
        maxSpeed: 0,
    });
    return ground;
}
const playerReset = CreateGround(0, 300, 100, 4);
playerReset.name = "fail";

class Player extends Obj {
    speed = 7;
    jumpHeight = -25;
    y = 0;
    x = 0;
    isGround = true;
    isJump = false;
    constructor() {
        super([
            "assets/unicorn1.png",
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
            this.a = ((this.a + 1) % this.animTarget) + 1;
        }, this.animInterval);
    }
    Update() {
        const s = conf.pressed;
        const k = conf.keys;
        let p = 0;

        if (s["a"]) {
            p--;
        }
        if (s["d"]) {
            p++;
        }
        if (s["l"]) {
            camera.x++;
        }
        if (s["j"]) {
            camera.x--;
        }
        if (s["i"]) {
            camera.y--;
        }
        if (s["k"]) {
            camera.y++;
        }
        if (k[" "] == 1) {
            this.Jump();
        }
        this.Move(p);
        
    }
    Collision(other, normal) {
        if (other.name == "ground") {
            this.isGround = true;
            this.isJump = false
        }
        if (other.name == "fail") {
            Get("fail").style.display = "flex";
        }
    }
    Jump() {
        if (!this.isGround) return;
        this.isGround = false;
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
    Move(dir) {
        if (dir != 0) {
            this.flip = dir > 0;
            this.vx = dir * this.speed;
            this.anim = this.a;
        } else {
            this.vx = 0;
            this.anim = 0
        }
    }
}

const player = new Player();

physics.Register(player, {
    mass: 1,
    bounce: 0,
    friction: 0.9,
    gravity: 2,
    isStatic: false,
    maxSpeed: 20,
});

CreateGround(0, 100, 300, 4);
