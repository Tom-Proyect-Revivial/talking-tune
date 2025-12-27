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

const canvas = document.createElement('canvas');
canvas.width = scene.offsetWidth;
canvas.height = scene.offsetHeight;
canvas.style.display = 'none';
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
            setTimeout(() => isBusy = false, 500);
            if (onFinish) onFinish();
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

function playScratchAnimation(onFinish) {
    let frame = 0;
    const maxFrames = 55;
    const folder = 'cat_scratch';
    const prefix = 'cat_scratch';
    playSound('tafel_kratzen_11025.wav');

    currentInterval = setInterval(() => {
        setCatFrame(folder, prefix, frame++);
        if (frame > maxFrames) {
            clearIntervalSafe();
            setIdle();
            isBusy = false;
            if (onFinish) onFinish();
        }
    }, 60);
}

cat.addEventListener('click', e => {
    const rect = cat.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (y > rect.height * 0.75) {
        const side = x < rect.width / 2 ? 'left' : 'right';
        playFoot(side);
    }
});

function playFoot(side) {
    const sound = Math.random() > 0.5 ? 'p_foot3_11025.wav' : 'p_foot4_11025.wav';
    playSound(sound);
    playFootAnimation(side);
}

function playFootAnimation(side) {
    let frame = 0;
    const maxFrames = 29;
    const folder = `foot_${side}`;
    const prefix = `cat_foot_${side}`;
    clearIntervalSafe();
    isBusy = true;

    currentInterval = setInterval(() => {
        setCatFrame(folder, prefix, frame++);
        if (frame > maxFrames) {
            clearIntervalSafe();
            setIdle();
            isBusy = false;
        }
    }, 60);
}

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
    const previousBusy = isBusy;
    isBusy = false;

    currentInterval = setInterval(() => {
        setCatFrame('talk', 'cat_talk', frame % 16);
        frame++;
    }, 80);

    audio.onended = () => {
        clearIntervalSafe();
        isBusy = previousBusy;
        setTimeout(() => isBusy = false, 200);
        if (onFinish) onFinish();
    };
}

recBtn.addEventListener('click', async () => {
    if (isRecording) return;
    recBtn.disabled = true;
    recordedChunks = [];

    try {
        const videoStream = canvas.captureStream(30);
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getAudioTracks().forEach(track => videoStream.addTrack(track));

        mediaRecorder = new MediaRecorder(videoStream, { mimeType: 'video/webm; codecs=vp8,opus' });
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });

            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: 'talking_tune.webm',
                        types: [{ description: 'Video WebM', accept: { 'video/webm': ['.webm'] } }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (err) {
                    console.error('Guardado cancelado o error:', err);
                }
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

setIdle();
