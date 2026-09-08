const s = 1.70158;
const inQuad = (t) => t * t;
const outQuad = (t) => t * (2 - t);
const inOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const inCubic = (t) => t * t * t;
const outCubic = (t) => --t * t * t + 1;
const inOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
const inQuart = (t) => t * t * t * t;
const outQuart = (t) => 1 - --t * t * t * t;
const inOutQuart = (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
const inQuint = (t) => t * t * t * t * t;
const outQuint = (t) => 1 + --t * t * t * t * t;
const inOutQuint = (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
const inSine = (t) => -Math.cos(t * (Math.PI / 2)) + 1;
const outSine = (t) => Math.sin(t * (Math.PI / 2));
const inOutSine = (t) => -0.5 * (Math.cos(Math.PI * t) - 1);
const inExpo = (t) => Math.pow(2, 10 * (t - 1));
const outExpo = (t) => -Math.pow(2, -10 * t) + 1;
const inOutExpo = (t) => {
    t /= 0.5;
    if (t < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
    t--;
    return 0.5 * (-Math.pow(2, -10 * t) + 2);
};
const inCirc = (t) => -1 * (Math.sqrt(1 - t * t) - 1);
const outCirc = (t) => Math.sqrt(1 - (t - 1) * (t - 1));
const inOutCirc = (t) => {
    t /= 0.5;
    if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
    t -= 2;
    return 0.5 * (Math.sqrt(1 - t * t) + 1);
};
const inBack = (t) => {
    return t * t * ((s + 1) * t - s);
};
const outBack = (t) => {
    return --t * t * ((s + 1) * t + s) + 1;
};
const inOutBack = (t) => {
    if ((t /= 0.5) < 1) return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
    return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
};
const inElastic = (t) => {
    let p = 0;
    let a = 1;
    if (t == 0) return 0;
    if (t == 1) return 1;
    if (!p) p = 0.3;
    if (a < 1) {
        a = 1;
        s = p / 4;
    } else s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    return -(
        a *
        Math.pow(2, 10 * (t -= 1)) *
        Math.sin(((t - s) * (2 * Math.PI)) / p)
    );
};
const outElastic = (t) => {
    let p = 0;
    let a = 1;
    if (t == 0) return 0;
    if (t == 1) return 1;
    if (!p) p = 0.3;
    if (a < 1) {
        a = 1;
        s = p / 4;
    } else s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    return (
        a * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1
    );
};
const inOutElastic = (t) => {
    let p = 0;
    let a = 1;
    if (t == 0) return 0;
    if ((t /= 0.5) == 2) return 1;
    if (!p) p = 0.3 * 1.5;
    if (a < 1) {
        a = 1;
        s = p / 4;
    } else s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    if (t < 1)
        return (
            -0.5 *
            (a *
                Math.pow(2, 10 * (t -= 1)) *
                Math.sin(((t - s) * (2 * Math.PI)) / p))
        );
    return (
        a *
            Math.pow(2, -10 * (t -= 1)) *
            Math.sin(((t - s) * (2 * Math.PI)) / p) *
            0.5 +
        1
    );
};
const inBounce = (t) => 1 - outBounce(1 - t);
const outBounce = (t) => {
    let a = 7.5625;
    if (t < 1 / 2.75) {
        return a * t * t;
    } else if (t < 2 / 2.75) {
        return a * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
        return a * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
        return a * (t -= 2.625 / 2.75) * t + 0.984375;
    }
};
const inOutBounce = (t) => {
    if (t < 0.5) return inBounce(t * 2) * 0.5;
    return outBounce(t * 2 - 1) * 0.5 + 0.5;
};
const linear = (t) => t;
const swing = (t) => {
    return 0.5 - Math.cos(t * Math.PI) / 2;
};

