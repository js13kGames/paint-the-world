let audioCtx = null;
let gainNode = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function BGM() {
    const ctx = initAudio();
    if (!ctx || ctx.state !== "running") {
        return;
    }

    const oscillatorType = "triangle";
    const volume = 0.15;
    const tempo = 0.16;

    const melody = [
        19,
        null,
        17,
        null,
        15,
        null,
        17,
        null,
        19,
        18,
        17,
        16,
        15,
        14,
        13,
        12,

        12,
        14,
        15,
        17,
        19,
        17,
        15,
        14,
        15,
        17,
        19,
        20,
        19,
        17,
        15,
        14,

        19,
        16,
        15,
        16,
        17,
        16,
        15,
        14,
        13,
        15,
        17,
        15,
        13,
        15,
        17,
        15,

        12,
        13,
        15,
        17,
        19,
        17,
        15,
        13,
        12,
        14,
        15,
        16,
        17,
        15,
        14,
        12,

        19,
        15,
        17,
        14,
        16,
        13,
        15,
        12,
        14,
        16,
        17,
        19,
        17,
        16,
        15,
        14,

        17,
        15,
        14,
        12,
        14,
        15,
        17,
        19,
        19,
        17,
        15,
        14,
        13,
        12,
        13,
        19,
    ];

    for (let i = 0; i < melody.length; i++) {
        const note = melody[i];
        if (note === null || note === undefined) continue;

        const oscillator = ctx.createOscillator();
        oscillator.type = oscillatorType;
        oscillator.connect(gainNode);

        const freq = 440 * Math.pow(1.06, 13 - note);
        const startTime = ctx.currentTime + i * tempo;
        const stopTime = startTime + tempo * 0.7;
        const gainRampTime = startTime + tempo * 0.5;

        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.setTargetAtTime(0.0001, gainRampTime, 0.004);

        oscillator.start(startTime);
        oscillator.stop(stopTime);
    }

    setTimeout(() => {
        BGM();
    }, melody.length * tempo * 1000);
}

document.addEventListener(
    "click",
    () => {
        initAudio();
        BGM();
    },
    { once: true }
);

document.addEventListener(
    "keydown",
    (e) => {
        initAudio();
        BGM();
    },
    { once: true }
);
export { BGM, initAudio };
