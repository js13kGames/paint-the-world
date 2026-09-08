const gameStatus = {
    red: false,
    orange: false,
    yellow: false,
    green: false,
    lightblue: false,
    blue: false,
    purple: false,
};
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

const red = new PickUp("#9e0f0f", "#ff3434", 100, 0, "red");
const orange = new PickUp("#a2801a", "#ffa536", 200, 0, "orange");
const yellow = new PickUp("#b1af16", "#e2ff40", 300, 0, "yellow");
const green = new PickUp("#199a10", "#53ff40", 400, 0, "green");
const lightBlue = new PickUp("#15868b", "#44efff", 500, 0, "lightBlue");
const blue = new PickUp("#1e1e7e", "#2534ff", 600, 0, "blue");
const purple = new PickUp("#5f0b4f", "#f52eff", 700, 0, "purple");

function SpawnPlatforms() {
    CreateGround(120, 30, 60, 4);
    CreateGround(20, -40, 50, 4);
    CreateGround(170, -40, 50, 4);
    CreateGround(50, -110, 50, 4);
    CreateGround(200, -110, 50, 4);
    CreateGround(80, -180, 50, 4);
    CreateGround(230, -180, 50, 4);
    CreateGround(110, -250, 60, 4);
    CreateGround(260, -250, 60, 4);
    CreateGround(140, -320, 80, 4);
}
const grounds = [];

grounds.push(CreateGround(0, 300, 1000, 400, "#000"));

function GetPickup(num) {
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
        player.jumpHeight = -40;
        Show("c3");
    }
    if (num == 4 && !gameStatus.green) {
        gameStatus.green = true;
        green.Remove();
        grounds.map((i) => (i.color = "#157b30"));
        player.canDash = true;
        Show("c4");
    }
    if (num == 5 && !gameStatus.lightblue) {
        gameStatus.lightblue = true;
        lightBlue.Remove();
        superJump.y = 175;
        player.canDouble = true;
        Show("c5");
    }
    if (num == 6 && !gameStatus.blue) {
        gameStatus.blue = true;
        blue.Remove();
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
        //game over
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
    y = 0;
    x = 0;
    isGround = true;
    isJump = false;
    canDash = false;
    canDouble = false;
    isDash = false;
    isDoubled = false;
    constructor() {
        super([
            "assets/unicorn1.png",
            "assets/unicorn8.png",
            "assets/unicorn2.png",
            "assets/unicorn3.png",
            "assets/unicorn4.png",// mark
            "assets/unicorn5.png",
            "assets/unicorn6.png",
            "assets/unicorn7.png",// mark
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

        if (k["Space"] == 1) {
            this.Jump();
        }
        if (this.y < 0) {
            camera.y = this.y;
        }
        if (k["Shift"] == 1) {
            this.Dash(p);
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
    Jump(force = false) {
        if (!this.isGround && !force) {
            this.DoubleJump(force);
            return;
        }
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
    Dash(p) {
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
            duration: 300,
            onComplete: () => {
                this.isDash = false;
            },
        });
    }
    Move(dir) {
        if (dir != 0) {
            this.flip = dir > 0;
            this.vx = dir * this.speed;
            // this.anim = this.a;
        } else {
            this.vx = 0;
            // this.anim = 0;
        }
    }
}

const player = new Player();

physics.Register(red, false);
physics.Register(orange, false);
physics.Register(yellow, false);
physics.Register(green, false);
physics.Register(lightBlue, false);
physics.Register(blue, false);
physics.Register(purple, false);

physics.Register(player, {
    mass: 1,
    bounce: 0,
    friction: 0.9,
    gravity: 1,
    isStatic: false,
    maxSpeed: 20,
});

conf.drawBackground = () => {
    const width = canvas.width;
    const height = canvas.height;

    const LAYERSIZES = {
        sky: Infinity,
        sun: 8000,
        clouds: 6000,
        mountains: 5000,
        hills: 4000,
        water: 3500,
        grass: 3000,
        blades: 2000,
    };

    const PARALLAX = {
        sky: 0,
        sun: 0.05,
        clouds: 0.15,
        mountains: 0.1,
        hills: 0.2,
        water: 0.15,
    };
    function DrawSky() {
        const skyGradient = c.createLinearGradient(0, 0, 0, height);
        skyGradient.addColorStop(0, "#4A90D9");
        skyGradient.addColorStop(0.5, "#87CEEB");
        skyGradient.addColorStop(1, "#B5E6F7");
        c.fillStyle = skyGradient;
        c.fillRect(0, 0, width, height);
    }

    function DrawMountains() {
        const parallaxX = -player.x * PARALLAX.mountains;
        const parallaxY = -player.y * PARALLAX.mountains;
        const layerSize = LAYERSIZES.mountains;

        c.save();
        c.translate(parallaxX * 0.3, parallaxY * 0.2);

        const worldOffset =
            (((parallaxX * 0.3) % layerSize) + layerSize) % layerSize;

        for (let cycle = -1; cycle <= 1; cycle++) {
            const startX = worldOffset + cycle * layerSize - 50;
            const endX = startX + layerSize + 100;

            c.fillStyle = "#aab0ff";
            c.beginPath();
            c.moveTo(startX, height);

            for (let x = startX; x <= endX; x += 2) {
                let a = x * ((2 * Math.PI) / layerSize);
                const y =
                    height * 0.65 -
                    Math.sin(a * 2 + 1) * 30 -
                    Math.sin(a * 5 + 3) * 15 -
                    Math.sin(a * 11 + 5) * 20 -
                    Math.sin(a * 7 + 7) * 10;
                c.lineTo(x, y);
            }
            c.lineTo(endX, height);
            c.fill();
        }
        c.restore();
    }

    function DrawSun() {
        const parallaxX = -player.x * PARALLAX.sun;
        const parallaxY = -player.y * PARALLAX.sun;
        const layerSize = LAYERSIZES.sun;

        let sunWorldX = width * 0.85 + parallaxX;
        let sunWorldY = height * 0.12 + parallaxY;

        sunWorldX = ((sunWorldX % layerSize) + layerSize) % layerSize;
        sunWorldY = ((sunWorldY % layerSize) + layerSize) % layerSize;

        const sunX = (sunWorldX / layerSize) * width * 1.5 + width * 0.1;
        const sunY = height * 0.12 + Math.sin(sunWorldX * 0.001) * 30;
        const sunRadius = Math.min(width, height) * 0.08;

        const glow = c.createRadialGradient(
            sunX,
            sunY,
            0,
            sunX,
            sunY,
            sunRadius * 2.5
        );
        glow.addColorStop(0, "#FFDC3211");
        glow.addColorStop(0.5, "#FFC83222");
        glow.addColorStop(1, "#00000000");
        c.fillStyle = glow;
        c.beginPath();
        c.arc(sunX, sunY, sunRadius * 2.5, 0, Math.PI * 2);
        c.fill();

        const sunGradient = c.createRadialGradient(
            sunX - sunRadius * 0.2,
            sunY - sunRadius * 0.2,
            0,
            sunX,
            sunY,
            sunRadius
        );
        sunGradient.addColorStop(0, "#FFF9C4");
        sunGradient.addColorStop(0.5, "#FFD54F");
        sunGradient.addColorStop(1, "#FFA000");
        c.fillStyle = sunGradient;
        c.beginPath();
        c.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        c.fill();

        c.save();
        c.translate(sunX, sunY);
        c.restore();
    }

    function DrawClouds() {
        const parallaxX = -player.x * PARALLAX.clouds;
        const parallaxY = -player.y * PARALLAX.clouds;
        const layerSize = LAYERSIZES.clouds;

        const cloudDefs = [
            { x: 0.02, y: 0.05, scale: 0.25, layer: 0 },
            { x: 0.08, y: 0.12, scale: 0.2, layer: 0 },
            { x: 0.15, y: 0.03, scale: 0.3, layer: 0 },
            { x: 0.22, y: 0.18, scale: 0.22, layer: 0 },

            { x: 0.04, y: 0.2, scale: 0.4, layer: 1 },
            { x: 0.12, y: 0.08, scale: 0.45, layer: 1 },
            { x: 0.2, y: 0.25, scale: 0.35, layer: 1 },
            { x: 0.28, y: 0.12, scale: 0.5, layer: 1 },

            { x: 0.06, y: 0.28, scale: 0.6, layer: 2 },
            { x: 0.18, y: 0.15, scale: 0.55, layer: 2 },
            { x: 0.3, y: 0.3, scale: 0.65, layer: 2 },
            { x: 0.42, y: 0.1, scale: 0.5, layer: 2 },
        ];

        const layers = [
            { parallaxMult: 0.3, yRange: [0.02, 0.2], sizeRange: [0.18, 0.3] },
            { parallaxMult: 0.6, yRange: [0.05, 0.25], sizeRange: [0.35, 0.5] },
            { parallaxMult: 0.9, yRange: [0.1, 0.32], sizeRange: [0.5, 0.65] },
        ];

        const worldOffsetX = ((parallaxX % layerSize) + layerSize) % layerSize;
        const currentCycle = Math.floor(worldOffsetX / layerSize);

        cloudDefs.forEach((def) => {
            const layer = layers[def.layer];
            const baseX = def.x * layerSize;
            const baseY =
                def.y * layerSize + parallaxY * layer.parallaxMult * 0.1;

            let wx = baseX + parallaxX * layer.parallaxMult;
            let wy = baseY;

            wx = ((wx % layerSize) + layerSize) % layerSize;
            wy = ((wy % layerSize) + layerSize) % layerSize;

            const yMin = layer.yRange[0] * height;
            const yMax = layer.yRange[1] * height;
            const screenY = (wy / layerSize) * (yMax - yMin) + yMin;

            for (
                let cycle = currentCycle - 2;
                cycle <= currentCycle + 2;
                cycle++
            ) {
                const screenX = wx + cycle * layerSize;

                if (screenX > -200 && screenX < width + 200) {
                    DrawSingleCloud(screenX, screenY, def.scale);
                }
            }
        });
    }

    function DrawSingleCloud(x, y, scale) {
        c.fillStyle = "rgba(233, 255, 177, 0.6)";
        c.beginPath();
        c.arc(x, y, 18 * scale, 0, Math.PI * 2);
        c.arc(x + 20 * scale, y - 7 * scale, 22 * scale, 0, Math.PI * 2);
        c.arc(x + 40 * scale, y - 4 * scale, 20 * scale, 0, Math.PI * 2);
        c.arc(x + 55 * scale, y, 16 * scale, 0, Math.PI * 2);
        c.arc(x + 20 * scale, y + 3 * scale, 16 * scale, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "rgba(223, 255, 106, 0.3)";
        c.beginPath();
        c.arc(x + 7 * scale, y + 2 * scale, 10 * scale, 0, Math.PI * 2);
        c.arc(x + 25 * scale, y - 3 * scale, 13 * scale, 0, Math.PI * 2);
        c.arc(x + 45 * scale, y, 10 * scale, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "rgba(248, 255, 33, 0.15)";
        c.beginPath();
        c.arc(x + 9 * scale, y + 4 * scale, 12 * scale, 0, Math.PI * 2);
        c.arc(x + 32 * scale, y + 3 * scale, 14 * scale, 0, Math.PI * 2);
        c.fill();
    }

    function DrawHills() {
        const parallaxX = -player.x * PARALLAX.hills;
        const parallaxY = -player.y * PARALLAX.hills;
        const layerSize = LAYERSIZES.hills;

        c.save();
        c.translate(parallaxX * 0.2, parallaxY * 0.1);

        function GetHillHeight(worldX) {
            const freq1 = ((2 * Math.PI) / layerSize) * 3;
            const freq2 = ((2 * Math.PI) / layerSize) * 8;
            const freq3 = ((2 * Math.PI) / layerSize) * 13;

            return (
                height * 0.75 +
                parallaxY * 0.3 -
                15 -
                Math.sin(worldX * freq1 + 2) * 20 -
                Math.sin(worldX * freq2 + 4) * 10 -
                Math.sin(worldX * freq3 + 6) * 8
            );
        }

        const worldOffset =
            (((parallaxX * 0.2) % layerSize) + layerSize) % layerSize;
        const currentCycle = Math.floor(worldOffset / layerSize);

        for (let cycle = currentCycle - 1; cycle <= currentCycle + 1; cycle++) {
            const cycleStart = cycle * layerSize;
            const cycleEnd = (cycle + 1) * layerSize;

            const startX = cycleStart - 1;
            const endX = cycleEnd + 1;

            c.fillStyle = "#7fff83";
            c.beginPath();
            c.moveTo(startX, height + 100);

            for (let x = startX; x <= endX; x += 2) {
                const y = GetHillHeight(x);
                c.lineTo(x, y);
            }
            c.lineTo(endX, height + 100);
            c.fill();
        }
        c.restore();
    }
    function DrawWater() {
        const parallaxX = -player.x * PARALLAX.water;
        const layerSize = LAYERSIZES.water;

        c.save();
        c.translate(parallaxX * 0.3, 0);

        const waterBaseY = height * 0.82 + 20 - camera.y;

        function GetWaterHeight(worldX, timeOffset) {
            const freq1 = ((2 * Math.PI) / layerSize) * 40;
            const freq2 = ((2 * Math.PI) / layerSize) * 50;
            const freq3 = ((2 * Math.PI) / layerSize) * 60;

            const wave1 =
                Math.sin((worldX - parallaxX) * freq1 + timeOffset * 0.8) * 2;
            const wave2 =
                Math.sin((worldX - parallaxX) * freq2 + timeOffset * 1.2 + 2) *
                3;
            const wave3 =
                Math.sin((worldX - parallaxX) * freq3 + timeOffset * 1.5 + 4) *
                4;

            return waterBaseY + wave1 + wave2 + wave3;
        }

        const time = Date.now() / 1000;

        const waterGradient = c.createLinearGradient(
            0,
            waterBaseY - 30,
            0,
            height
        );
        waterGradient.addColorStop(0, "rgba(8, 28, 210, 0.7)");
        waterGradient.addColorStop(0.3, "rgba(19, 7, 181, 0.85)");
        waterGradient.addColorStop(0.6, "rgba(7, 44, 145, 0.92)");
        waterGradient.addColorStop(1, "rgba(2, 10, 50, 1)");

        c.fillStyle = waterGradient;
        c.beginPath();
        c.moveTo(-100, height + 100);

        for (let x = -100; x <= width + 100; x += 2) {
            const worldX = x + parallaxX * 0.3;
            const y = GetWaterHeight(worldX, time);
            c.lineTo(x, y);
        }
        c.lineTo(width + 100, height + 100);
        c.fill();

        c.restore();
    }
    if (gameStatus.lightblue) {
        DrawSky();
    }
    if (gameStatus.yellow) {
        DrawClouds();
    }
    if (gameStatus.purple) {
        DrawMountains();
    }
    if (gameStatus.orange) {
        DrawSun();
    }
    if (gameStatus.green) {
        DrawHills();
    }
    if (gameStatus.blue) {
        DrawWater();
    }
};

function Handle1() {
    player.x = 0;
    player.y = 0;
    Get("fail").style.display = "none";
}
function Handle2(id) {
    Get(id).style.display = "none";
}
function Show(id) {
    Get(id).style.display = "flex";
}
