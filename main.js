// ===============================
// PetApp4-Web (Myu Edition)
// PC / Mobile Auto-Switch Version
// ===============================

// ===============================
// Device Detection (PC / Smartphone)
// ===============================
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===============================
// Parameter Presets (PC / Mobile)
// ===============================

// PC
const BLINK_EAR_THRESHOLD_PC = 0.25;
const BLINK_DURATION_MS_PC = 250;

const CAT_SPEECH_ATTENTION_PC = 15;
const CAT_SPEECH_AFFECTION_PC = 30;

const SPECTRUM_VOL_PC = 10;
const SPECTRUM_MID_PC = 5;
const SPECTRUM_DIFF_PC = 3;

// Mobile
const BLINK_EAR_THRESHOLD_MOBILE = 0.18;
const BLINK_DURATION_MS_MOBILE = 350;

const CAT_SPEECH_ATTENTION_MOBILE = 20;
const CAT_SPEECH_AFFECTION_MOBILE = 35;

const SPECTRUM_VOL_MOBILE = 15;
const SPECTRUM_MID_MOBILE = 8;
const SPECTRUM_DIFF_MOBILE = 5;

// Noise calibration time
const NOISE_CALIBRATION_TIME = isMobile ? 2000 : 1000;

// ===============================
// Active Parameters (Auto Switch)
// ===============================
const BLINK_EAR_THRESHOLD = isMobile ? BLINK_EAR_THRESHOLD_MOBILE : BLINK_EAR_THRESHOLD_PC;
const BLINK_DURATION_MS = isMobile ? BLINK_DURATION_MS_MOBILE : BLINK_DURATION_MS_PC;

const CAT_SPEECH_ATTENTION = isMobile ? CAT_SPEECH_ATTENTION_MOBILE : CAT_SPEECH_ATTENTION_PC;
const CAT_SPEECH_AFFECTION = isMobile ? CAT_SPEECH_AFFECTION_MOBILE : CAT_SPEECH_AFFECTION_PC;

const SPECTRUM_VOL = isMobile ? SPECTRUM_VOL_MOBILE : SPECTRUM_VOL_PC;
const SPECTRUM_MID = isMobile ? SPECTRUM_MID_MOBILE : SPECTRUM_MID_PC;
const SPECTRUM_DIFF = isMobile ? SPECTRUM_DIFF_MOBILE : SPECTRUM_DIFF_PC;

// ===============================
// State Management
// ===============================
let currentState = "neutral";
let lastInputTime = Date.now();
let blinkStart = null;
let stateTimer = null;

let lastAffectionTime = 0;
const AFFECTION_COOLDOWN_MS = 4000;

// 猫語検定
let catRank = 5;
let catScore = 0;

function updateCatRank(change) {
  catScore += change;

  if (catScore >= 50 && catRank > 1) {
    catRank--;
    catScore = 0;
  }

  if (catScore <= -30 && catRank < 5) {
    catRank++;
    catScore = 0;
  }

  const paws = "🐾".repeat(6 - catRank);
  const points = document.getElementById("points");
  points.innerHTML = `猫語検定 ${catRank}級 <span class="paws">${paws}</span>`;
}
// ===============================
// Image Set (Myu States)
// ===============================
const images = {
  neutral: "assets/images/myu_neutral.png",
  approach: "assets/images/myu_approach.png",
  attention: "assets/images/myu_attention.png",
  affection: "assets/images/myu_affection.png",
  avoidance: "assets/images/myu_avoidance.png",
  play: "assets/images/myu_play.png",
  sleep: "assets/images/myu_sleep.png",
  stretch: "assets/images/myu_stretch.png"
};

const myuImg = document.getElementById("myu");

// ===============================
// State Transition Handler
// ===============================
function setState(newState) {

  // Sleep → Stretch → Neutral の自動遷移
  if (newState === "sleep") {
    currentState = "sleep";
    myuImg.src = images.sleep;

    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      currentState = "stretch";
      myuImg.src = images.stretch;

      stateTimer = setTimeout(() => {
        currentState = "neutral";
        myuImg.src = images.neutral;
      }, 2000);

    }, 7000);

    return;
  }

  // harsh（高音＋大音量）は全状態 → Avoidance
  if (newState === "avoidance") {
    currentState = "avoidance";
    myuImg.src = images.avoidance;

    updateCatRank(-5); // 猫語検定ランク下降

    // 3秒後に Neutral に戻す
    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      currentState = "neutral";
      myuImg.src = images.neutral;
    }, 3000);

    return;
  }

  // Play（高速スワイプ／高速マウス）
  if (newState === "play") {
    currentState = "play";
    myuImg.src = images.play;

    updateCatRank(+2);

    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      currentState = "neutral";
      myuImg.src = images.neutral;
    }, 2500);

    return;
  }

  // Approach（ゆっくり瞬き）
  if (newState === "approach") {
    currentState = "approach";
    myuImg.src = images.approach;

    updateCatRank(+1);

    return;
  }

  // Attention（弱い猫語）
  if (newState === "attention") {
    currentState = "attention";
    myuImg.src = images.attention;

    updateCatRank(+2);

    return;
  }

  // Affection（強い猫語）
  if (newState === "affection") {

    // クールダウン（連続甘え防止）
    const now = Date.now();
    if (now - lastAffectionTime < AFFECTION_COOLDOWN_MS) return;
    lastAffectionTime = now;

    currentState = "affection";
    myuImg.src = images.affection;

    updateCatRank(+3);

    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      currentState = "neutral";
      myuImg.src = images.neutral;
    }, 4000);

    return;
  }

  // Neutral（通常）
  if (newState === "neutral") {
    currentState = "neutral";
    myuImg.src = images.neutral;
    return;
  }
}
// ===============================
// Cat Voice Calibration (Integrated Features)
// ===============================

let noiseProfile = {
  low: 0,
  mid: 0,
  high: 0,
  volume: 0,
  ready: false
};

let catProfile = {
  low: 0,
  mid: 0,
  high: 0,
  volume: 0,
  durationMs: 0,
  envSlope: 0,
  ready: false
};

// ===============================
// Noise Calibration (PC / Mobile Auto-Time)
// ===============================
function startNoiseCalibration(analyser) {
  let start = Date.now();
  let samples = [];

  function collect() {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    samples.push({
      low: avg(data.slice(0, 50)),
      mid: avg(data.slice(50, 120)),
      high: avg(data.slice(120, 200)),
      volume: avg(data)
    });

    if (Date.now() - start < NOISE_CALIBRATION_TIME) {
      requestAnimationFrame(collect);
    } else {
      noiseProfile.low = avg(samples.map(s => s.low));
      noiseProfile.mid = avg(samples.map(s => s.mid));
      noiseProfile.high = avg(samples.map(s => s.high));
      noiseProfile.volume = avg(samples.map(s => s.volume));
      noiseProfile.ready = true;

      console.log("暗騒音キャリブレーション完了:", noiseProfile);
    }
  }

  collect();
}

// ===============================
// Cat Voice Calibration (Real Meow Sample)
// ===============================
function startCatCalibration() {
  const audio = document.getElementById("cat_mew_audio");
  const ctx = new AudioContext();
  const src = ctx.createMediaElementSource(audio);
  const analyser = ctx.createAnalyser();
  src.connect(analyser);
  analyser.connect(ctx.destination);

  analyser.fftSize = 2048;
  const data = new Uint8Array(analyser.frequencyBinCount);

  let env = [];
  let start = null;

  audio.play();

  function analyze() {
    analyser.getByteFrequencyData(data);

    const vol = avg(data);
    if (vol > 20 && !start) start = Date.now();

    if (start) env.push(vol);

    if (!audio.paused) {
      requestAnimationFrame(analyze);
      return;
    }

    const durationMs = Date.now() - start;
    const envSlope = (env[env.length - 1] - env[0]) / env.length;

    catProfile.low = avg(data.slice(0, 50));
    catProfile.mid = avg(data.slice(50, 120));
    catProfile.high = avg(data.slice(120, 200));
    catProfile.volume = vol;
    catProfile.durationMs = durationMs;
    catProfile.envSlope = envSlope;
    catProfile.ready = true;

    console.log("猫語キャリブレーション完了:", catProfile);
  }

  analyze();
}

// ===============================
// CatSpeechScore (Similarity Calculation)
// ===============================
function computeCatSpeechScore(features) {
  const wLow = 0.8;
  const wMid = 1.2;
  const wHigh = 0.6;
  const wVol = 1.0;
  const wDur = 1.0;
  const wSlope = 1.0;

  const dLow = Math.abs(features.low - catProfile.low);
  const dMid = Math.abs(features.mid - catProfile.mid);
  const dHigh = Math.abs(features.high - catProfile.high);
  const dVol = Math.abs(features.volume - catProfile.volume);
  const dDur = Math.abs(features.durationMs - catProfile.durationMs);
  const dSlope = Math.abs(features.envSlope - catProfile.envSlope);

  const score =
    100 -
    (dLow * wLow +
     dMid * wMid +
     dHigh * wHigh +
     dVol * wVol +
     dDur * wDur +
     dSlope * wSlope);

  return Math.max(0, Math.min(100, score));
}
// ===============================
// FaceMesh (Blink Detection)
// ===============================

let faceMesh;
let video;
let lastEAR = 0;

// EAR 計算（目の縦横比）
function computeEAR(landmarks) {
  const leftEye = [
    landmarks[33], landmarks[160], landmarks[158],
    landmarks[133], landmarks[153], landmarks[144]
  ];

  const rightEye = [
    landmarks[362], landmarks[385], landmarks[387],
    landmarks[263], landmarks[373], landmarks[380]
  ];

  function ear(eye) {
    const A = distance(eye[1], eye[5]);
    const B = distance(eye[2], eye[4]);
    const C = distance(eye[0], eye[3]);
    return (A + B) / (2.0 * C);
  }

  return (ear(leftEye) + ear(rightEye)) / 2.0;
}

// 距離計算
function distance(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  );
}

// ===============================
// Blink Detection Loop
// ===============================
function startFaceMesh() {
  video = document.getElementById("video");

  faceMesh = new FaceMesh({
    locateFile: (file) => `libs/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onFaceResults);

  const camera = new Camera(video, {
    onFrame: async () => {
      await faceMesh.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
}

// ===============================
// FaceMesh Callback
// ===============================
function onFaceResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    blinkStart = null;
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];
  const EAR = computeEAR(landmarks);
  lastEAR = EAR;

  const now = Date.now();

  // ===============================
  // Blink Detection (PC / Mobile Auto-Switch)
  // ===============================
  if (EAR < BLINK_EAR_THRESHOLD) {

    if (!blinkStart) blinkStart = now;

    // ゆっくり瞬き判定
    if (now - blinkStart > BLINK_DURATION_MS) {

      // Neutral → Approach
      if (currentState === "neutral") {
        setState("approach");
      }

      // Approach → Attention
      else if (currentState === "approach") {
        setState("attention");
      }

      // Attention → Affection
      else if (currentState === "attention") {
        setState("affection");
      }

      blinkStart = null;
    }

  } else {
    blinkStart = null;
  }
}
// ===============================
// Audio Processing (CatSpeechScore + Mobile Optimization)
// ===============================

let audioCtx;
let analyser;
let micStream;

let prevVol = 0;
let envStart = null;
let envValues = [];

// ===============================
// Start Microphone
// ===============================
async function startAudio() {
  audioCtx = new AudioContext();
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const src = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  src.connect(analyser);

  startNoiseCalibration(analyser);
  audioLoop();
}

// ===============================
// Audio Loop
// ===============================
function audioLoop() {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  const low = avg(data.slice(0, 50));
  const mid = avg(data.slice(50, 120));
  const high = avg(data.slice(120, 200));
  const volume = avg(data);

  const adjLow = Math.max(0, low - noiseProfile.low);
  const adjMid = Math.max(0, mid - noiseProfile.mid);
  const adjHigh = Math.max(0, high - noiseProfile.high);
  const adjVol = Math.max(0, volume - noiseProfile.volume);

  // ===============================
  // Envelope Tracking (Long Meow Detection)
  // ===============================
  if (adjVol > 10) {
    if (!envStart) envStart = Date.now();
    envValues.push(adjVol);
  } else {
    if (envStart) {
      const durationMs = Date.now() - envStart;
      const envSlope = (envValues[envValues.length - 1] - envValues[0]) / envValues.length;

      const features = {
        low: adjLow,
        mid: adjMid,
        high: adjHigh,
        volume: adjVol,
        durationMs,
        envSlope
      };

      if (catProfile.ready) {
        const score = computeCatSpeechScore(features);
        const type = classifyVoiceByCatSpeech(score, features);
        handleVoiceType(type);
      }
    }

    envStart = null;
    envValues = [];
  }

  requestAnimationFrame(audioLoop);
}

// ===============================
// Voice Classification (PC / Mobile Optimized)
// ===============================
let weakHold = 0;
let strongHold = 0;

function classifyVoiceByCatSpeech(score, features) {

  // ===============================
  // Long Meow Detection (nyan_long / mya_long)
  // ===============================
  if (features.durationMs >= 300 && features.durationMs <= 900) {
    if (features.mid > features.high + 5) {
      return "nyan_long";
    }
    if (features.mid > 10 && features.high < features.mid) {
      return "mya_long";
    }
  }

  // ===============================
  // Harsh Voice (High + Loud)
  // ===============================
  if (features.volume > 40 && features.high > features.mid) {
    return "harsh";
  }

  // ===============================
  // CatSpeechScore (PC / Mobile Auto-Switch)
  // ===============================
  if (score >= CAT_SPEECH_AFFECTION) {
    strongHold++;
    if (strongHold >= (isMobile ? 3 : 1)) {
      strongHold = 0;
      return "cat_speech_strong";
    }
  } else {
    strongHold = 0;
  }

  if (score >= CAT_SPEECH_ATTENTION) {
    weakHold++;
    if (weakHold >= (isMobile ? 2 : 1)) {
      weakHold = 0;
      return "cat_speech_weak";
    }
  } else {
    weakHold = 0;
  }

  return "none";
}

// ===============================
// Handle Voice Type → State Transition
// ===============================
function handleVoiceType(type) {

  // Long Meow → Affection
  if (type === "nyan_long" || type === "mya_long") {
    setState("affection");
    return;
  }

  // Harsh → Avoidance（全状態）
  if (type === "harsh") {
    setState("avoidance");
    return;
  }

  // CatSpeechScore Weak → Attention
  if (type === "cat_speech_weak") {
    setState("attention");
    return;
  }

  // CatSpeechScore Strong → Affection
  if (type === "cat_speech_strong") {
    setState("affection");
    return;
  }
}
// ===============================
// Swipe / Mouse Interaction
// ===============================

let lastMouseMove = Date.now();
let lastSwipeTime = Date.now();
let swipeStartX = null;
let swipeStartY = null;

// ===============================
// Mouse Move → Play（高速移動）
// ===============================
document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  const dt = now - lastMouseMove;

  const speed = Math.abs(e.movementX) + Math.abs(e.movementY);

  // 高速マウス移動 → Play
  if (speed > 40 && dt < 50) {
    setState("play");
  }

  lastMouseMove = now;
  lastInputTime = now;
});

// ===============================
// Swipe Detection（スマホ / PC どちらも対応）
// ===============================
document.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  swipeStartX = t.clientX;
  swipeStartY = t.clientY;
  lastInputTime = Date.now();
});

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  const dx = t.clientX - swipeStartX;
  const dy = t.clientY - swipeStartY;

  const dist = Math.sqrt(dx * dx + dy * dy);
  const now = Date.now();

  // ゆっくりスワイプ → Affection
  if (dist > 40 && dist < 120 && now - lastSwipeTime > 500) {
    setState("affection");
    lastSwipeTime = now;
  }

  // 高速スワイプ → Play
  if (dist >= 120 && now - lastSwipeTime > 300) {
    setState("play");
    lastSwipeTime = now;
  }

  lastInputTime = now;
});

// ===============================
// Tap → Avoidance
// ===============================
document.addEventListener("click", () => {
  setState("avoidance");
  lastInputTime = Date.now();
});

// ===============================
// Sleep (No Input for 10s)
// ===============================
setInterval(() => {
  const now = Date.now();

  if (currentState === "neutral" && now - lastInputTime > 10000) {
    setState("sleep");
  }
}, 1000);