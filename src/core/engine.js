let conf = {
    w: 640,
    h: 360,
    objs: [],
    keys: {},
    pressed: {},
    pause: false,
    background: "grey",
    drawBackground: () => {},
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
    c.fillStyle = conf.background;
    c.fillRect(0, 0, canvas.width, canvas.height);
    conf.drawBackground();
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
    color = "black";
    isColor = false;

    vx = 0;
    vy = 0;
    mass = 1;
    bounce = 0.5;
    friction = 0.98;
    gravity = 0;
    isStatic = false;
    mxSpd = 20;
    id = -1;
    trigger = false;

    constructor(img) {
        if (img == undefined) {
            this.isColor = true;
        } else {
            this.id = objID;
            objID++;
            img.map((i) => {
                let im = new Image();
                im.src = i;
                this.imgs.push(im);
            });
        }

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
        c.save();
        let a = this.size;
        let pX = this.x - camera.x - a[0] / 2 + conf.w / 2;
        let pY = this.y - camera.y - a[1] / 2 + conf.h / 2;
        if (!this.isColor) {
            if (this.flip) {
                c.translate(pX + a[0] / 2, pY + a[1] / 2);
                c.scale(-1, 1);
                c.drawImage(
                    this.imgs[this.anim],
                    -a[0] / 2,
                    -a[1] / 2,
                    a[0],
                    a[1]
                );
            } else {
                c.drawImage(this.imgs[this.anim], pX, pY, a[0], a[1]);
            }
        } else {
            c.fillStyle = this.color;
            c.fillRect(pX, pY, this.size[0], this.size[1]);
        }
        c.restore();
    }
    Collision(other, normal) {}
    Trigger(other) {}

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
    let halfA = a.collSize;
    let halfB = b.collSize;

    let aLeft = a.x - halfA[0] / 2;
    let aRight = a.x + halfA[0] / 2;
    let aTop = a.y - halfA[1] / 2;
    let aBottom = a.y + halfA[1] / 2;

    let bLeft = b.x - halfB[0] / 2;
    let bRight = b.x + halfB[0] / 2;
    let bTop = b.y - halfB[1] / 2;
    let bBottom = b.y + halfB[1] / 2;

    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}
