const cat = document.getElementById('cat');
const milkBtn = document.getElementById('milk-btn');
const recBtn = document.getElementById('rec-btn');
const scene = document.getElementById('scene');

let isBusy = false;
let isDrinking = false;
let currentInterval = null;
let cooldownTime = 1200;

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

/* -------------------------------------------------
   CANVAS PARA GRABACIÓN
------------------------------------------------- */
const canvas = document.createElement('canvas');
canvas.width = scene.offsetWidth;
canvas.height = scene.offsetHeight;
canvas.classList.add('hidden-capture-canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

/* -------------------------------------------------
   UTILIDADES
------------------------------------------------- */
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

/* -------------------------------------------------
   LECHE
------------------------------------------------- */
milkBtn.addEventListener('click', () => {
    if (isBusy || isDrinking) return;

    clearIntervalSafe();
    isBusy = true;
    isDrinking = true;
    playMilkAnimation();
});

function playMilkAnimation(onFinish) {
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
            if (onFinish) onFinish();
        }
    }, 60);
}

/* -------------------------------------------------
   BOTÓN SCRATCH
------------------------------------------------- */
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

function playScratchAnimation(onFinish) {
    let frame = 0;
    const maxFrames = 55;

    playSound('tafel_kratzen_11025.wav');

    currentInterval = setInterval(() => {
        setCatFrame('cat_scratch', 'cat_scratch', frame++);
        if (frame > maxFrames) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 300);
            if (onFinish) onFinish();
        }
    }, 60);
}

/* -------------------------------------------------
   HITBOXES: PIES + PANZA
------------------------------------------------- */
cat.addEventListener('click', e => {
    if (isBusy) return;

    const rect = cat.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    /* 🦶 PIES
       Zona pequeña abajo
       (último ~22%)
    */
    if (y > 0.78) {
        const side = x < 0.5 ? 'left' : 'right';
        playFoot(side);
        return;
    }

    /* 🫃 PANZA
       Más larga verticalmente
       Desde pecho hasta antes de los pies
    */
    if (
        x > 0.25 && x < 0.75 &&
        y > 0.30 && y <= 0.78
    ) {
        playBelly();
    }
});



/* -------------------------------------------------
   PIES
------------------------------------------------- */
function playFoot(side) {
    const sound = Math.random() > 0.5
        ? 'p_foot3_11025.wav'
        : 'p_foot4_11025.wav';

    playSound(sound);
    playFootAnimation(side);
}

function playFootAnimation(side) {
    let frame = 0;
    const maxFrames = 29;

    clearIntervalSafe();
    isBusy = true;

    currentInterval = setInterval(() => {
        setCatFrame(`foot_${side}`, `cat_foot_${side}`, frame++);
        if (frame > maxFrames) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 300);
        }
    }, 60);
}

/* -------------------------------------------------
   PANZA
------------------------------------------------- */
function playBelly() {
    clearIntervalSafe();
    isBusy = true;

    const sound = Math.random() > 0.5
        ? 'p_belly1_11025.wav'
        : 'p_belly2_11025.wav';

    playSound(sound);

    let frame = 0;
    const maxFrames = 33;

    currentInterval = setInterval(() => {
        setCatFrame('cat_stomach', 'cat_stomach', frame++);
        if (frame > maxFrames) {
            clearIntervalSafe();
            setIdle();
            setTimeout(() => isBusy = false, 400);
        }
    }, 60);
}

/* -------------------------------------------------
   ESCUCHAR / HABLAR
------------------------------------------------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    listenLoop();
});

function listenLoop() {
    if (isBusy) {
        requestAnimationFrame(listenLoop);
        return;
    }

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);

    const volume = data.reduce((a, b) => a + Math.abs(b - 128), 0);

    if (volume > 1500) {
        isBusy = true;
        playListen(() => {
            setTimeout(recordAndRepeat, 400);
        });
    }

    requestAnimationFrame(listenLoop);
}

function playListen(onFinish) {
    let frame = 0;
    clearIntervalSafe();

    currentInterval = setInterval(() => {
        setCatFrame('listen', 'cat_listen', frame++);
        if (frame > 5) {
            clearIntervalSafe();
            if (onFinish) onFinish();
        }
    }, 80);
}

function recordAndRepeat() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = e => chunks.push(e.data);

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const audio = new Audio(URL.createObjectURL(blob));
            audio.playbackRate = 1.4;
            audio.play();

            playTalkWhileAudio(audio, () => {
                setIdle();
                setTimeout(() => isBusy = false, cooldownTime);
            });
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 1200);
    });
}

function playTalkWhileAudio(audio, onFinish) {
    let frame = 0;
    clearIntervalSafe();

    currentInterval = setInterval(() => {
        setCatFrame('talk', 'cat_talk', frame % 16);
        frame++;
    }, 80);

    audio.onended = () => {
        clearIntervalSafe();
        setIdle();
        setTimeout(() => isBusy = false, 300);
        if (onFinish) onFinish();
    };
}

/* -------------------------------------------------
   GRABACIÓN
------------------------------------------------- */
recBtn.addEventListener('click', async () => {
    if (isRecording) return;

    recBtn.disabled = true;
    recordedChunks = [];

    try {
        const videoStream = canvas.captureStream(30);
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getAudioTracks().forEach(track => videoStream.addTrack(track));

        mediaRecorder = new MediaRecorder(videoStream, {
            mimeType: 'video/webm; codecs=vp8,opus'
        });

        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });

            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'talking_tune.webm',
                    types: [{
                        description: 'Video WebM',
                        accept: { 'video/webm': ['.webm'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'talking_tune.webm';
                a.click();
                URL.revokeObjectURL(url);
            }

            recBtn.disabled = false;
            isRecording = false;
        };

        mediaRecorder.start();
        isRecording = true;

        const captureLoop = () => {
            if (!isRecording) return;
            drawSceneOnCanvas();
            requestAnimationFrame(captureLoop);
        };
        captureLoop();

    } catch (err) {
        console.error('Error al iniciar la grabación:', err);
        recBtn.disabled = false;
    }
});

/* -------------------------------------------------
   DIBUJAR ESCENA
------------------------------------------------- */
function drawSceneOnCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = scene.querySelector('#background');
    if (bg) {
        const bgStyle = getComputedStyle(bg).backgroundImage;
        if (bgStyle && bgStyle !== 'none') {
            const url = bgStyle.slice(5, -2);
            const img = new Image();
            img.src = url;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }

    const imgCat = new Image();
    imgCat.src = cat.src;
    ctx.drawImage(imgCat, 0, 0, canvas.width, canvas.height);
}

/* -------------------------------------------------
   INIT
------------------------------------------------- */
setIdle();