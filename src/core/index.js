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

export function Start() {
    Init();
    Update();
}
