// ===============================
// PetApp4-Web (Myu Edition)
// 暗騒音キャリブレーション + 長音検出 + 反応復活版（完全統合）
// ===============================

// -------------------------------
// 定数（EAR安定化）
// -------------------------------
const BLINK_EAR_THRESHOLD = 0.15;
const BLINK_DURATION_MS = 350;

const NO_INPUT_SLEEP_MS = 10000;
const STATE_RETURN_MS = 3000;

const SLEEP_DURATION_MS = 7000;
const STRETCH_DURATION_MS = 2000;

// -------------------------------
// 状態管理
// -------------------------------
let currentState = "neutral";
let lastInputTime = Date.now();
let blinkStart = null;
let stateTimer = null;

// -------------------------------
// Affection クールダウン
// -------------------------------
let lastAffectionTime = 0;
const AFFECTION_COOLDOWN_MS = 4000;

// -------------------------------
// 猫語検定ランク管理
// -------------------------------
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

// -------------------------------
// 画像セット
// -------------------------------
const images = {
  neutral: "assets/images/myu_neutral.png",
  approach: "assets/images/myu_approach.png",
  attention: "assets/images/myu_attention.png",
  affection: "assets/images/myu_affection.png",
  avoidance: "assets/images/myu_avoidance.png",
  play: "assets/images/myu_play.png",
  ignore: "assets/images/myu_ignore.png",
  sleep: "assets/images/myu_sleep.png",
  stretch: "assets/images/myu_stretch.png"
};

function setImage(state) {
  const img = document.getElementById("pet-image");
  img.src = images[state];
}

// -------------------------------
// 状態変更
// -------------------------------
function setState(newState) {
  const now = Date.now();

  if (newState === "affection" && now - lastAffectionTime < AFFECTION_COOLDOWN_MS) {
    return;
  }

  if (currentState === newState) return;

  currentState = newState;
  setImage(newState);
  lastInputTime = now;
  clearTimeout(stateTimer);

  if (newState === "affection") {
    lastAffectionTime = now;

    const audio = new Audio("assets/audio/affection_mew.mp3");
    audio.currentTime = 0;
    audio.play();

    updateCatRank(+5);
  }

  if (newState === "avoidance") {
    updateCatRank(-3);
  }

  if (newState === "sleep") {
    stateTimer = setTimeout(() => {
      setState("stretch");
      stateTimer = setTimeout(() => {
        setState("neutral");
      }, STRETCH_DURATION_MS);
    }, SLEEP_DURATION_MS);
    return;
  }

  if (newState !== "neutral") {
    stateTimer = setTimeout(() => {
      setState("neutral");
    }, STATE_RETURN_MS);
  }
}

// ===============================
// 猫語キャリブレーション
// ===============================
const CAT_VOICE_URL = "assets/audio/affection_mew.mp3";

let catProfile = { low: 0, mid: 0, high: 0, volume: 0, ready: false };
const calibAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function calibrateCatVoice() {
  const response = await fetch(CAT_VOICE_URL);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await calibAudioCtx.decodeAudioData(arrayBuffer);

  const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
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

calibrateCatVoice();

// ===============================
// MediaPipe FaceMesh（瞬き検出）
// ===============================
const faceMesh = new FaceMesh({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true
});

let prevEAR = null;

faceMesh.onResults(results => {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

  const lm = results.multiFaceLandmarks[0];
  const EAR = calcEAR(lm[159], lm[145], lm[33], lm[133]);
  const now = Date.now();

  if (EAR < 0.05 || EAR > 0.5) return;

  if (prevEAR !== null && Math.abs(EAR - prevEAR) < 0.01) {
    prevEAR = EAR;
    return;
  }
  prevEAR = EAR;

  if (EAR < BLINK_EAR_THRESHOLD) {
    if (!blinkStart) blinkStart = now;

    if (now - blinkStart > BLINK_DURATION_MS) {
      if (currentState === "neutral") setState("approach");
      else if (currentState === "approach") setState("attention");
      else if (currentState === "attention") setState("affection");
    }
  } else {
    blinkStart = null;
  }

  lastInputTime = now;
});

function calcEAR(top, bottom, left, right) {
  const v = distance(top, bottom);
  const h = distance(left, right);
  return v / h;
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2);
}

// ===============================
// カメラ入力開始
// ===============================
const videoElement = document.createElement("video");
videoElement.style.display = "none";
document.body.appendChild(videoElement);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 640,
  height: 480
});

camera.start();

// ===============================
// 暗騒音キャリブレーション
// ===============================
let noiseProfile = { low:0, mid:0, high:0, volume:0, ready:false };
let noiseSamples = [];

function startNoiseCalibration(analyser) {
  const data = new Uint8Array(analyser.frequencyBinCount);
  const start = Date.now();

  function collect() {
    analyser.getByteFrequencyData(data);

    const low = avg(data.slice(0,50));
    const mid = avg(data.slice(50,120));
    const high = avg(data.slice(120,200));
    const volume = avg(data);

    noiseSamples.push({ low, mid, high, volume });

    if (Date.now() - start < 1000) {
      requestAnimationFrame(collect);
    } else {
      noiseProfile.low = avg(noiseSamples.map(s => s.low));
      noiseProfile.mid = avg(noiseSamples.map(s => s.mid));
      noiseProfile.high = avg(noiseSamples.map(s => s.high));
      noiseProfile.volume = avg(noiseSamples.map(s => s.volume));
      noiseProfile.ready = true;

      console.log("🔇 暗騒音キャリブレーション完了:", noiseProfile);
    }
  }

  collect();
}

// ===============================
// 音声判定（暗騒音補正 + 長音検出）
// ===============================
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);

  const CATMIMIC_THRESHOLD = 35;

  // 長音検出用
  let longSoundStart = null;
  let lastLongSoundTime = 0;
  const LONG_SOUND_COOLDOWN = 2000;

  let lastMid = 0;
  let lastHigh = 0;

  // 起動時に暗騒音キャリブレーション開始
  startNoiseCalibration(analyser);

  function classifyVoiceByCatProfile(data) {
    const lowBand = data.slice(0, 50);
    const midBand = data.slice(50, 120);
    const highBand = data.slice(120, 200);

    const low = avg(lowBand);
    const mid = avg(midBand);
    const high = avg(highBand);
    const volume = avg(data);

    const now = Date.now();

    if (!noiseProfile.ready) return null;

    // 暗騒音との差分（補正後の値）
    const adjLow = low - noiseProfile.low;
    const adjMid = mid - noiseProfile.mid;
    const adjHigh = high - noiseProfile.high;
    const adjVol = volume - noiseProfile.volume;

    // 長音の終了条件
    if (adjVol < 10) {
      longSoundStart = null;
    }

    // 長音のクールダウン
    if (now - lastLongSoundTime < LONG_SOUND_COOLDOWN) {
      return null;
    }

    // 長音の基本条件（暗騒音補正後）
    const isCatLike =
      adjVol > 20 &&
      adjMid > 10 &&
      adjMid > adjHigh * 0.7;

    if (isCatLike) {
      if (!longSoundStart) longSoundStart = now;

      const duration = now - longSoundStart;

      if (duration > 550 && duration < 900) {
        lastLongSoundTime = now;

        if (adjHigh > lastHigh + 5) return "nyao";
        if (adjHigh < lastHigh - 5) return "nyago";
        if (adjMid > lastMid + 5) return "mya_long";

        return "nyan_long";
      }
    } else {
      longSoundStart = null;
    }

    lastMid = adjMid;
    lastHigh = adjHigh;

    // 短い猫語
    if (adjVol > 15 && adjMid > 10 && adjHigh < adjMid && !longSoundStart) {
      return "nyan_short";
    }

    // soft
    if (adjVol < 10 && adjMid > 5 && adjHigh < adjMid) return "soft";

    // harsh
    if (adjVol > 40 && adjHigh > adjMid) return "harsh";

    // catmimic
    if (catProfile.ready) {
      const dLow = Math.abs(low - catProfile.low);
      const dMid = Math.abs(mid - catProfile.mid);
      const dHigh = Math.abs(high - catProfile.high);
      const dVol = Math.abs(volume - catProfile.volume);

      const distance =
        dLow * 0.5 +
        dMid * 1.0 +
        dHigh * 1.0 +
        dVol * 0.3;

      if (distance < CATMIMIC_THRESHOLD) return "catmimic";
    }

    return null;
  }

  function analyze() {
    analyser.getByteFrequencyData(data);

    const type = classifyVoiceByCatProfile(data);

    if (type) handleVoice(type);

    requestAnimationFrame(analyze);
  }

  analyze();
});

// ===============================
// 音声による状態遷移（長音対応）
// ===============================
function handleVoice(type) {
  lastInputTime = Date.now();

  if (currentState === "neutral") {
    if (type === "soft") setState("attention");
    if (type === "catmimic") setState("attention");

    if (type === "nyan_long" || type === "mya_long" || type === "nyao" || type === "nyago") {
      setState("attention");
    }

    if (type === "harsh") setState("avoidance");
    return;
  }

  if (currentState === "approach") {
    if (type === "soft") setState("attention");
    if (type === "catmimic") setState("attention");

    if (type === "nyan_long" || type === "mya_long") setState("affection");

    if (type === "nyao" || type === "nyago") setState("play");

    if (type === "harsh") setState("avoidance");
  }

  if (currentState === "attention") {
    if (type === "soft") setState("affection");
    if (type === "catmimic") setState("affection");

    if (type === "nyan_long" || type === "mya_long") setState("affection");

    if (type === "nyao" || type === "nyago") setState("play");

    if (type === "harsh") setState("avoidance");
  }

  if (currentState === "affection") {
    if (type === "harsh") setState("avoidance");
  }
}

// ===============================
// スワイプ判定
// ===============================
let swipeStart = null;

window.addEventListener("mousedown", e => {
  swipeStart = { x: e.clientX, time: Date.now() };
  lastInputTime = Date.now();

  if (currentState !== "sleep") {
    setState("avoidance");
  }
});

window.addEventListener("mouseup", e => {
  if (!swipeStart) return;

  const dx = Math.abs(e.clientX - swipeStart.x);
  const dt = Date.now() - swipeStart.time;

  const speed = dx / dt;

  if (speed < 0.3) {
    if (currentState === "attention") setState("affection");
  } else {
    if (currentState === "neutral") setState("play");
  }

  swipeStart = null;
});

// ===============================
// マウス高速移動 → Play
// ===============================
let lastMouseX = null;
let lastMouseTime = null;

window.addEventListener("mousemove", e => {
  const now = Date.now();

  if (lastMouseX !== null) {
    const dx = Math.abs(e.clientX - lastMouseX);
    const dt = now - lastMouseTime;

    if (dt > 0) {
      const speed = dx / dt;
      if (speed > 1.0 && currentState === "neutral") {
        setState("play");
      }
    }
  }

  lastMouseX = e.clientX;
  lastMouseTime = now;
  lastInputTime = now;
});

// ===============================
// 無操作 → Sleep
// ===============================
setInterval(() => {
  const now = Date.now();
  if (currentState === "neutral" && now - lastInputTime > NO_INPUT_SLEEP_MS) {
    setState("sleep");
  }
}, 1000);
