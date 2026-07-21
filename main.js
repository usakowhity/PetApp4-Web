// ===============================
// Utility: Average Calculation
// ===============================
function avg(array) {
  if (!array || array.length === 0) return 0;
  return array.reduce((a, b) => a + b, 0) / array.length;
}

// ===============================
// Device Detection
// ===============================
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===============================
// Parameter Presets
// ===============================

// PC
const BLINK_EAR_THRESHOLD_PC = 0.25;
const BLINK_DURATION_MS_PC = 250;
const CAT_SPEECH_ATTENTION_PC = 15;
const CAT_SPEECH_AFFECTION_PC = 30;

// Mobile
const BLINK_EAR_THRESHOLD_MOBILE = 0.18;
const BLINK_DURATION_MS_MOBILE = 350;
const CAT_SPEECH_ATTENTION_MOBILE = 20;
const CAT_SPEECH_AFFECTION_MOBILE = 35;

// Auto-switch
const BLINK_EAR_THRESHOLD = isMobile ? BLINK_EAR_THRESHOLD_MOBILE : BLINK_EAR_THRESHOLD_PC;
const BLINK_DURATION_MS = isMobile ? BLINK_DURATION_MS_MOBILE : BLINK_DURATION_MS_PC;
const CAT_SPEECH_ATTENTION = isMobile ? CAT_SPEECH_ATTENTION_MOBILE : CAT_SPEECH_ATTENTION_PC;
const CAT_SPEECH_AFFECTION = isMobile ? CAT_SPEECH_AFFECTION_MOBILE : CAT_SPEECH_AFFECTION_PC;

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
  document.getElementById("points").innerHTML =
    `猫語検定 ${catRank}級 <span class="paws">${paws}</span>`;
}

// ===============================
// Image Set
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
// Cat Voice Calibration (解析のみ)
// ===============================
const CAT_VOICE_URL = "assets/audio/cat_mew.wav";

let catProfile = {
  low: 0,
  mid: 0,
  high: 0,
  volume: 0,
  ready: false
};

const calibAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

async function calibrateCatVoice() {
  const response = await fetch(CAT_VOICE_URL);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await calibAudioCtx.decodeAudioData(arrayBuffer);

  const offlineCtx = new OfflineAudioContext(
    1,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = 2048;

  source.connect(analyser);
  analyser.connect(offlineCtx.destination);

  source.start(0);

  const data = new Uint8Array(analyser.frequencyBinCount);

  offlineCtx.startRendering().then(() => {
    analyser.getByteFrequencyData(data);

    catProfile.low = avg(data.slice(0, 50));
    catProfile.mid = avg(data.slice(50, 120));
    catProfile.high = avg(data.slice(120, 200));
    catProfile.volume = avg(data);
    catProfile.ready = true;

    console.log("🐾 猫語キャリブレーション完了:", catProfile);
  });
}

// ===============================
// State Transition Handler（Affection時に鳴く）
// ===============================
function setState(newState) {

  // ===============================
  // Sleep → Stretch → Neutral
  // ===============================
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

  // ===============================
  // Avoidance（高音＋大音量）
  // ===============================
  if (newState === "avoidance") {
    currentState = "avoidance";
    myuImg.src = images.avoidance;

    updateCatRank(-5);

    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      currentState = "neutral";
      myuImg.src = images.neutral;
    }, 3000);

    return;
  }

  // ===============================
  // Play（高速スワイプ／高速マウス）
  // ===============================
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

  // ===============================
  // Approach（ゆっくり瞬き）
  // ===============================
  if (newState === "approach") {
    currentState = "approach";
    myuImg.src = images.approach;

    updateCatRank(+1);
    return;
  }

  // ===============================
  // Attention（弱い猫語）
  // ===============================
  if (newState === "attention") {
    currentState = "attention";
    myuImg.src = images.attention;

    updateCatRank(+2);
    return;
  }

  // ===============================
  // Affection（強い猫語）
  // ===============================
  if (newState === "affection") {

    const now = Date.now();
    if (now - lastAffectionTime < AFFECTION_COOLDOWN_MS) return;
    lastAffectionTime = now;

    currentState = "affection";
    myuImg.src = images.affection;

    updateCatRank(+3);

    // ★ Affection時に鳴く（キャリブレーションと干渉しない）
    const audio = document.getElementById("cat_mew_audio");
    audio.currentTime = 0;
    audio.play();

    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      currentState = "neutral";
      myuImg.src = images.neutral;
    }, 4000);

    return;
  }

  // ===============================
  // Neutral（通常）
  // ===============================
  if (newState === "neutral") {
    currentState = "neutral";
    myuImg.src = images.neutral;
    return;
  }
}


// ===============================
// FaceMesh
// ===============================
let faceMesh;
let video;

function startFaceMesh() {
  video = document.getElementById("video");

  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
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

function onFaceResults(results) {
  if (!results.multiFaceLandmarks) {
    blinkStart = null;
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];
  const EAR = computeEAR(landmarks);
  const now = Date.now();

  if (EAR < BLINK_EAR_THRESHOLD) {
    if (!blinkStart) blinkStart = now;

    if (now - blinkStart > BLINK_DURATION_MS) {
      if (currentState === "neutral") setState("approach");
      else if (currentState === "approach") setState("attention");
      else if (currentState === "attention") setState("affection");

      blinkStart = null;
    }
  } else {
    blinkStart = null;
  }
}

// ===============================
// Audio Processing
// ===============================
let audioCtx;
let analyser;

async function startAudio() {
  audioCtx = new AudioContext();
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const src = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  src.connect(analyser);

  audioLoop();
}

function audioLoop() {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  if (catProfile.ready) {
    const type = classifyVoiceByCatProfile(data);
    if (type === "catmimic") setState("affection");
    if (type === "soft") setState("attention");
    if (type === "harsh") setState("avoidance");
  }

  requestAnimationFrame(audioLoop);
}

// ===============================
// Swipe / Mouse / Tap / Sleep
// ===============================
let lastMouseMove = Date.now();
let lastSwipeTime = Date.now();
let swipeStartX = null;
let swipeStartY = null;

document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  const dt = now - lastMouseMove;
  const speed = Math.abs(e.movementX) + Math.abs(e.movementY);

  if (speed > 40 && dt < 50) setState("play");

  lastMouseMove = now;
  lastInputTime = now;
});

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

  if (dist > 40 && dist < 120 && now - lastSwipeTime > 500) {
    setState("affection");
    lastSwipeTime = now;
  }

  if (dist >= 120 && now - lastSwipeTime > 300) {
    setState("play");
    lastSwipeTime = now;
  }

  lastInputTime = now;
});

document.addEventListener("click", () => {
  setState("avoidance");
  lastInputTime = Date.now();
});

setInterval(() => {
  const now = Date.now();
  if (currentState === "neutral" && now - lastInputTime > 10000) {
    setState("sleep");
  }
}, 1000);
