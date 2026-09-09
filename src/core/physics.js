import { BBC, conf } from "./engine";

export class PhysicsSystem {
    overlapOffset = 1;
    constructor() {
        this.objs = [];
        this.debug = false;
    }

    Register(o, conf) {
        if (conf) {
            let m = conf;
            o.mass = m.mass || 1;
            o.bounce = m.bounce || 0;
            o.friction = m.friction || 0.5;
            o.gravity = m.gravity || 0;
            o.isStatic = m.isStatic || false;
            o.vx = 0;
            o.vy = 0;
            o.mxSpd = conf.mxSpd || 20;
        } else {
            o.trigger = true;
        }
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
            if (o.isStatic || o.rem || o.trigger) continue;

            if (o.gravity) {
                o.vy += o.gravity;
            }
            o.vx *= o.friction;
            o.vy *= o.friction;

            this.ClampSpeed();
            let overlap = this.TryColl(o);

            o.x += overlap[0];
            o.y += overlap[1];

        }
    }
    TryColl(o) {
        let x = o.x + o.vx;
        let y = o.y + o.vy;
        let p = { ...o };
        p.x = x;
        p.y = y;
        let tx = o.vx;
        let ty = o.vy;
        const bs = (a)=>Math.abs(a)
        const mn = (a,b) => {
            if(bs(a) < bs(b)) return a;
            return b;
        }
        for (let u of this.objs) {
            if (o.id == u.id) continue;
            if (u.rem) continue;

            if (BBC(p, u)) {
                let t = this.CheckColl(u, o);
                tx = mn(tx, t[0]);
                ty = mn(ty, t[1]);
            }
        }

        return [tx, ty];
    }
    CheckColl(u, b) {
        if (u.trigger) {
            b.Trigger(u);
            return [b.vx, b.vy];
        }
        let bdx = Math.abs(b.x - u.x);
        let bdy = Math.abs(b.y - u.y);
        let bminDis = [
            b.collSize[0] / 2 + u.collSize[0] / 2,
            b.collSize[1] / 2 + u.collSize[1] / 2,
        ];
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
