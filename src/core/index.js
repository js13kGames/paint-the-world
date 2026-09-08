const KEYS = {};
for(let i = 0; i < 256; i++) {
    KEYS[String.fromCharCode(i)] = i
}
console.log(KEYS);

function Init() {
    AlignWindow();

    document.addEventListener("keydown", (e) => {
        let name = e.key;
        if (e.key == " ") {
            name = "Space";
        }
        if (conf.pressed[name]) return;
        conf.pressed[name] = true;
        conf.keys[name] = 1;
    });

    document.addEventListener("keyup", (e) => {
        let name = e.key;
        if (e.key == " ") {
            name = "Space";
        }
        conf.pressed[name] = false;
        conf.keys[name] = -1;
    });
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
