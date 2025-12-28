const cat = document.getElementById('cat');
const milkBtn = document.getElementById('milk-btn');
const recBtn = document.getElementById('rec-btn');
const scene = document.getElementById('scene');

let isBusy = false;
let isDrinking = false;
let currentInterval = null;
let cooldownTime = 1200;
let isFaceTouching = false;
let faceInterval = null;

const faceSounds = [
    'face1_11025.wav',
    'face2_11025.wav',
    'face3_11025.wav',
    'face5_11025.wav',
    'face6_11025.wav'
];
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
const canvas = document.createElement('canvas');
canvas.width = scene.offsetWidth;
canvas.height = scene.offsetHeight;
canvas.classList.add('hidden-capture-canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
function setCatFrame(folder, prefix, frame) {
    cat.src = `assets/${folder}/${prefix}${String(frame).padStart(4, '0')}.png`;
}

function clearIntervalSafe() {
    if (currentInterval) {
        clearInterval(currentInterval);
        currentInterval = null;
    }
}

function setIdle() {
    setCatFrame('zeh', 'cat_zeh', 0);
}

function playSound(file) {
    new Audio(`assets/sounds/${file}`).play();
}
milkBtn.addEventListener('click', () => {
    if (isBusy || isDrinking) return;

    clearIntervalSafe();
    isBusy = true;
    isDrinking = true;
    playMilkAnimation();
});

function playMilkAnimation() {
    let frame = 0;
    const maxFrames = 80;

    playSound('pour_milk_11025.wav');
    setTimeout(() => playSound('p_drink_milk_11025.wav'), 500);

    currentInterval = setInterval(() => {
        setCatFrame('milk', 'cat_drink', frame++);
        if (frame > maxFrames) {
            clearIntervalSafe();
            isDrinking = false;
            setIdle();
            setTimeout(() => isBusy = false, 400);
        }
    }, 60);
}
const scratchBtn = document.createElement('button');
scratchBtn.id = 'scratch-btn';
scratchBtn.classList.add('btn-scratch');
scene.appendChild(scratchBtn);

scratchBtn.addEventListener('click', () => {
    if (isBusy) return;
    clearIntervalSafe();
    isBusy = true;
    playScratchAnimation();
});

function playScratchAnimation() {
    let frame = 0;
    playSound('tafel_kratzen_11025.wav');

    currentInterval = setInterval(() => {
        setCatFrame('cat_scratch', 'cat_scratch', frame++);
        if (frame > 55) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 300);
        }
    }, 60);
}
cat.addEventListener('pointerdown', e => {
    if (isBusy) return;

    const rect = cat.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;


if (y > 0.12 && y <= 0.38) {
    startFaceTouch();
    return;
}


    if (y > 0.78) {
        playFoot(x < 0.5 ? 'left' : 'right');
        return;
    }

    if (x > 0.25 && x < 0.75 && y > 0.30 && y <= 0.78) {
        playBelly();
    }
});

cat.addEventListener('pointerup', endFaceTouch);
cat.addEventListener('pointerleave', endFaceTouch);

function startFaceTouch() {
    if (isBusy) return;

    clearIntervalSafe();
    isBusy = true;
    isFaceTouching = true;

    const sound = faceSounds[Math.floor(Math.random() * faceSounds.length)];
    playSound(sound);

    let frame = 0;
    const loopEnd = 20;

    faceInterval = setInterval(() => {
        setCatFrame('cat_face', 'cat_knockout', frame++);
        if (frame > loopEnd) frame = 0;
    }, 60);
}

function endFaceTouch() {
    if (!isFaceTouching) return;

    clearInterval(faceInterval);
    faceInterval = null;
    isFaceTouching = false;

    let frame = 20;

    playSound('faceend_11025.wav');
    setTimeout(() => playSound('p_stars2s_11025.wav'), 150);

    currentInterval = setInterval(() => {
        setCatFrame('cat_face', 'cat_knockout', frame++);
        if (frame > 80) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 400);
        }
    }, 60);
}

function playFoot(side) {
    playSound(Math.random() > 0.5 ? 'p_foot3_11025.wav' : 'p_foot4_11025.wav');
    let frame = 0;

    clearIntervalSafe();
    isBusy = true;

    currentInterval = setInterval(() => {
        setCatFrame(`foot_${side}`, `cat_foot_${side}`, frame++);
        if (frame > 29) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 300);
        }
    }, 60);
}

function playBelly() {
    clearIntervalSafe();
    isBusy = true;

    playSound(Math.random() > 0.5 ? 'p_belly1_11025.wav' : 'p_belly2_11025.wav');

    let frame = 0;

    currentInterval = setInterval(() => {
        setCatFrame('cat_stomach', 'cat_stomach', frame++);
        if (frame > 33) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 400);
        }
    }, 60);
}

setIdle();

