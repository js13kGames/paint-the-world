import { AlignWindow, Clear, conf } from "./engine";
import { PhysicsSystem } from "./physics";
function Init() {
    AlignWindow();

    document.addEventListener("keydown", (e) => {
        let name = e.key.toLowerCase();

        if (e.key == " ") {
            name = "space";
        }
        if (conf.pressed[name]) return;
        conf.pressed[name] = true;
        conf.keys[name] = 1;
    });

    document.addEventListener("keyup", (e) => {
        let name = e.key.toLowerCase();
        if (e.key == " ") {
            name = "space";
        }
        conf.pressed[name] = false;
        conf.keys[name] = -1;
    });
}

export let physics = new PhysicsSystem();

let pre = 0;
const frameTarget = 1 / 60;
let counter = 0;

function Update(current) {
    let deltaTime = (current - pre) / 1000;
    pre = current;
    if (deltaTime > 0.25) {
        deltaTime = 0.25;
    }
    counter += deltaTime;
    let a = 0;
    while (counter > frameTarget) {
        a++;
        counter -= frameTarget;
        physics.Update(deltaTime);
    }

    if (!conf.pause) {
        Clear();

        let s = [...conf.objs];
        s.map((i) => {
            i.Update(deltaTime);
        });
        s.map((i) => {
            i.Render(deltaTime);
        });
        conf.keys = {};
        conf.objs = conf.objs.filter((o) => !o.rem);
    }

    requestAnimationFrame(Update);
}

export function Start() {
    Init();
    requestAnimationFrame(Update);
}
