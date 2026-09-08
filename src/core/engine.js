let conf = {
    w: 640,
    h: 360,
    objs: [],
    keys: {},
    pressed: {},
    pause: false,
};

let canvas = Get("c");
let c = canvas.getContext("2d");
c.imageSmoothingEnabled = false;
c.mozImageSmoothingEnabled = false;
c.webkitImageSmoothingEnabled = false;
c.msImageSmoothingEnabled = false;

function Get(id) {
    return document.getElementById(id);
}

function AlignWindow() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let scale = 1;
    let testWidth;
    testWidth = (height / conf.h) * conf.w;
    if (testWidth < width) {
        scale = testWidth / conf.w;
    } else {
        scale = width / conf.w;
    }
    canvas.style.transform = " scale(" + scale + ")  translateX(-50%)";
}

class Camera {
    x = 0;
    y = 0;
    zoom = 1;
}
let camera = new Camera();

function Clear() {
    c.fillStyle = "grey";
    c.fillRect(0, 0, canvas.width, canvas.height);
}
let objID = 0;
class Obj {
    name = "obj";
    x = 0;
    y = 0;
    anim = 0;
    imgs = [];
    flip = false;
    a = 0;
    animTarget = 1;
    animInterval = 200;
    interval;
    size = [32, 32];
    rem = false;
    collSize = [16, 16];

    vx = 0;
    vy = 0;
    mass = 1;
    bounce = 0.5;
    friction = 0.98;
    gravity = 0;
    isStatic = false;
    mxSpd = 20;
    id = -1;

    constructor(img) {
        this.id = objID;
        objID++;
        img.map((i) => {
            let im = new Image();
            im.src = i;
            this.imgs.push(im);
        });
        this.Init();
    }
    ActColl() {
        this.collider = true;
    }
    DeColl() {
        this.collider = false;
    }
    Init() {
        
        conf.objs.push(this);
    }
    Render() {
        let a = this.size;
        c.save();
        let pX = this.x - camera.x - a[0] / 2 + conf.w / 2;
        let pY = this.y - camera.y - a[1] / 2 + conf.h / 2;
        if (this.flip) {
            c.translate(pX + a[0]/2, pY + a[1]/2);
            c.scale(-1, 1);
            c.drawImage(this.imgs[this.anim], -a[0]/2, -a[1]/2, a[0], a[1]);
        } else {
            c.drawImage(this.imgs[this.anim], pX, pY, a[0], a[1]);
        }

        c.restore();
    }
    Collision(other, normal) {}

    CheckColl(other) {
        if (!this.collider || !other.collider) return;

        let collided = BBC(this, other);
        if (collided) {
            this.Collision(other);
            other.Collision(this);
        }
    }
    Update() {}
    Remove() {
        this.rem = true;
        clearInterval(this.interval);
    }
    After() {}
}
function BBC(a, b) {
    let halfA = a.collSize ;
    let halfB = b.collSize ;

    let aLeft = a.x - halfA[0]/2;
    let aRight = a.x + halfA[0]/2;
    let aTop = a.y - halfA[1]/2;
    let aBottom = a.y + halfA[1]/2;

    let bLeft = b.x - halfB[0]/2;
    let bRight = b.x + halfB[0]/2;
    let bTop = b.y - halfB[1]/2;
    let bBottom = b.y + halfB[1]/2;

    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

function Init() {
    AlignWindow();

    document.addEventListener("keydown", (e) => {
        if (conf.pressed[e.key]) return;
        conf.pressed[e.key] = true;
        conf.keys[e.key] = 1;
    });

    document.addEventListener("keyup", (e) => {
        conf.pressed[e.key] = false;
        conf.keys[e.key] = -1;
    });
}

class PhysicsSystem {
    overlapOffset = 1;
    constructor() {
        this.objs = [];
        this.debug = false;
    }

    Register(o, conf) {
        let m = conf;
        o.mass = m.mass || 1;
        o.bounce = m.bounce || 0;
        o.friction = m.friction || 0.5;
        o.gravity = m.gravity || 0;
        o.isStatic = m.isStatic || false;
        o.vx = 0;
        o.vy = 0;
        o.mxSpd = conf.mxSpd || 20;
        this.objs.push(o);
        return o;
    }

    Unregister(o) {
        let index = this.objs.indexOf(o);
        if (index !== -1) {
            this.objs.splice(index, 1);
        }
    }

    Update() {
        this.ApplyPhysics();
    }

    ApplyPhysics() {
        for (let o of this.objs) {
            if (o.isStatic || o.rem) continue;

            if (o.gravity) {
                o.vy += o.gravity;
            }
            o.vx *= o.friction;
            o.vy *= o.friction;

            this.ClampSpeed();
            let overlap = this.TryColl(o);

            o.x += overlap[0];
            o.y += overlap[1];

            // this.BoundColl(o);
        }
    }
    TryColl(o) {
        let x = o.x + o.vx;
        let y = o.y + o.vy;
        let p = { ...o };
        p.x = x;
        p.y = y;
        for (let u of this.objs) {
            if (o.id == u.id) continue;
            if (u.rem) continue;

            if (BBC(p, u)) {
                return this.CheckColl(u, o);
            }
        }

        return [o.vx, o.vy];
    }
    CheckColl(u, b) {
        let bdx = Math.abs(b.x - u.x);
        let bdy = Math.abs(b.y - u.y);
        let bminDis = [b.collSize[0] / 2 + u.collSize[0] / 2, b.collSize[1] / 2 + u.collSize[1] / 2];
        let res = [b.vx, b.vy];
        let normal = [0, 0];
        if (bdy > bminDis[1]) {
            let d = bdy - bminDis[1];
            if (d < this.overlapOffset) {
                res[1] = 0;
            } else {
                res[1] = (d - this.overlapOffset) * (b.vy > 0 ? 1 : -1);
            }
            normal = [0, b.vy > 0 ? 1 : -1];
        }
        if (bdx > bminDis[0]) {
            let d = bdx - bminDis[0];
            if (d < this.overlapOffset) {
                res[0] = 0;
            } else {
                res[0] = (d - this.overlapOffset) * (b.vx > 0 ? 1 : -1);
            }
            normal = [b.vx < 0 ? 1 : -1, 0];
        }

        b.Collision(u, normal);
        return res;
    }

    BoundColl(o) {
        let halfSize = o.collSize / 2;
        let radius = o.collType === "circle" ? o.collSize : halfSize;

        if (o.x - radius < 0) {
            o.x = radius;
            o.vx = -o.vx * o.bounce;
        }

        if (o.x + radius > conf.w) {
            o.x = conf.w - radius;
            o.vx = -o.vx * o.bounce;
        }

        if (o.y - radius < 0) {
            o.y = radius;
            o.vy = -o.vy * o.bounce;
        }

        if (o.y + radius > conf.h) {
            o.y = conf.h - radius;
            o.vy = -o.vy * o.bounce;

            if (Math.abs(o.vy) < 0.5) {
                o.vy = 0;
            }
        }
    }

    ClampSpeed() {
        for (let o of this.objs) {
            if (o.isStatic || o.rem) continue;

            let spd = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
            let mxSpd = o.mxSpd;

            if (spd > mxSpd) {
                o.vx = (o.vx / spd) * mxSpd;
                o.vy = (o.vy / spd) * mxSpd;
            }
        }
    }
}

let physics = new PhysicsSystem();

function Update() {
    if (!conf.pause) {
        Clear();
        physics.Update();
        let s = [...conf.objs];
        s.map((i) => {
            i.Update();
        });
        s.map((i) => {
            i.After();
        });
        s.map((i) => {
            i.Render();
        });
        conf.keys = {};
        conf.objs = conf.objs.filter((o) => !o.rem);
    }
    requestAnimationFrame(Update);
}
Init();
Update();
