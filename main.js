// ===============================
// PetApp4-Web (Myu Edition)
// 猫語キャリブレーション統合版（音質＋長音特性）＋PC/スマホ切替
// ===============================

// -------------------------------
// PC / スマホ判定
// -------------------------------
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// -------------------------------
// 定数（EAR安定化：PC/スマホ切替）
// -------------------------------
const BLINK_EAR_THRESHOLD = isMobile ? 0.18 : 0.25;
const BLINK_DURATION_MS    = isMobile ? 350  : 250;

const NO_INPUT_SLEEP_MS = 10000;
const STATE_RETURN_MS   = 3000;

const SLEEP_DURATION_MS   = 7000;
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
// 状態変更（Affection時に鳴く）
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

    const audio = new Audio("assets/audio/cat_mew.wav");
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
// 猫語キャリブレーション（音質＋長音特性）
// ===============================
const CAT_VOICE_URL = "assets/audio/cat_mew.wav";

let catProfile = {
  low: 0,
  mid: 0,
  high: 0,
  volume: 0,
  avgDurationMs: 700,
  envSlope: 0,
  ready: false
};

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

  const freqData = new Uint8Array(analyser.frequencyBinCount);

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  offlineCtx.startRendering().then(() => {
    analyser.getByteFrequencyData(freqData);

    const low = avg(freqData.slice(0, 50));
    const mid = avg(freqData.slice(50, 120));
    const high = avg(freqData.slice(120, 200));
    const volume = avg(freqData);

    let env = [];
    const step = Math.floor(sampleRate * 0.01);
    for (let i = 0; i < channelData.length; i += step) {
      let sum = 0;
      for (let j = i; j < i + step && j < channelData.length; j++) {
        sum += Math.abs(channelData[j]);
      }
      env.push(sum / step);
    }

    const envMax = Math.max(...env);
    const envThresh = envMax * 0.3;

    let startIdx = null;
    let endIdx = null;
    for (let i = 0; i < env.length; i++) {
      if (env[i] > envThresh && startIdx === null) startIdx = i;
      if (env[i] > envThresh) endIdx = i;
    }

    let durationMs = 700;
    let slope = 0;
    if (startIdx !== null && endIdx !== null && endIdx > startIdx) {
      durationMs = (endIdx - startIdx) * 10;
      const riseRange = env.slice(startIdx, startIdx + Math.floor((endIdx - startIdx) / 2));
      if (riseRange.length > 1) {
        slope = (riseRange[riseRange.length - 1] - riseRange[0]) / riseRange.length;
      }
    }

    catProfile.low = low;
    catProfile.mid = mid;
    catProfile.high = high;
    catProfile.volume = volume;
    catProfile.avgDurationMs = durationMs;
    catProfile.envSlope = slope;
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
// 猫語度（CatSpeechScore）
// ===============================
function computeCatSpeechScore(features) {
  if (!catProfile.ready) return 0;

  const dLow = Math.abs(features.low - catProfile.low);
  const dMid = Math.abs(features.mid - catProfile.mid);
  const dHigh = Math.abs(features.high - catProfile.high);
  const dVol = Math.abs(features.volume - catProfile.volume);

  const spectralDistance =
    dLow * 0.5 +
    dMid * 1.0 +
    dHigh * 1.0 +
    dVol * 0.3;

  const spectralScore = Math.max(0, 100 - spectralDistance);

  const dDur = Math.abs(features.durationMs - catProfile.avgDurationMs);
  const durationScore = Math.max(0, 100 - dDur * 0.1);

  const dSlope = Math.abs(features.envSlope - catProfile.envSlope);
  const slopeScore = Math.max(0, 100 - dSlope * 300);

  const catSpeechScore =
    spectralScore * 0.5 +
    durationScore * 0.3 +
    slopeScore * 0.2;

  return catSpeechScore;
}
// ===============================
// 音声判定（猫語度ベース）
// ===============================
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 2048;
  const data = new Uint8Array(analyser.frequencyBinCount);

  let longSoundStart = null;
  let lastLongSoundTime = 0;
  const LONG_SOUND_COOLDOWN = 2000;

  let lastEnv = [];

  startNoiseCalibration(analyser);

  const CAT_SPEECH_ATTENTION = isMobile ? 20 : 15;
  const CAT_SPEECH_AFFECTION = isMobile ? 35 : 30;

  function classifyVoiceByCatSpeech(data) {

    const lowBand  = data.slice(0, 50);
    const midBand  = data.slice(50, 120);
    const highBand = data.slice(120, 200);

    const low    = avg(lowBand);
    const mid    = avg(midBand);
    const high   = avg(highBand);
    const volume = avg(data);

    const now = Date.now();

    if (!noiseProfile.ready || !catProfile.ready) return null;

    const adjLow  = low    - noiseProfile.low;
    const adjMid  = mid    - noiseProfile.mid;
    const adjHigh = high   - noiseProfile.high;
    const adjVol  = volume - noiseProfile.volume;

    if (adjVol < 10) {
      longSoundStart = null;
      lastEnv = [];
      return null;
    }

    if (now - lastLongSoundTime < LONG_SOUND_COOLDOWN) {
      return null;
    }

    lastEnv.push(adjVol);
    if (lastEnv.length > 50) lastEnv.shift();

    let envSlope = 0;
    if (lastEnv.length > 5) {
      envSlope = (lastEnv[lastEnv.length - 1] - lastEnv[0]) / lastEnv.length;
    }

    const isCatLikeSpectrum =
      adjVol > 10 &&
      adjMid > 5 &&
      adjMid > adjHigh + 3;

    if (isCatLikeSpectrum) {

      if (!longSoundStart) longSoundStart = now;

      const durationMs = now - longSoundStart;

      if (durationMs > 300 && durationMs < 1200) {

        const features = {
          low: low,
          mid: mid,
          high: high,
          volume: volume,
          durationMs: durationMs,
          envSlope: envSlope
        };

        const score = computeCatSpeechScore(features);

        if (score >= CAT_SPEECH_AFFECTION) {
          lastLongSoundTime = now;
          longSoundStart = null;
          lastEnv = [];
          return "cat_speech_strong";
        }

        if (score >= CAT_SPEECH_ATTENTION) {
          lastLongSoundTime = now;
          longSoundStart = null;
          lastEnv = [];
          return "cat_speech_weak";
        }

        if (durationMs > 550 && durationMs < 900) {
          lastLongSoundTime = now;
          longSoundStart = null;
          lastEnv = [];
          return "nyan_long";
        }
      }

    } else {
      longSoundStart = null;
    }

    if (adjVol > 40 && adjHigh > adjMid) return "harsh";

    return null;
  }

  function analyze() {
    analyser.getByteFrequencyData(data);

    const type = classifyVoiceByCatSpeech(data);

    if (type) handleVoice(type);

    requestAnimationFrame(analyze);
  }

  analyze();
});

// ===============================
// 音声による状態遷移
// ===============================
function handleVoice(type) {
  lastInputTime = Date.now();

  if (currentState === "neutral") {

    if (type === "cat_speech_weak") setState("attention");

    if (type === "nyan_long") {
      setState("attention");
    }

    if (type === "harsh") setState("avoidance");
    return;
  }

  if (currentState === "approach") {

    if (type === "cat_speech_strong") setState("affection");

    if (type === "nyan_long") {
      setState("affection");
    }

    if (type === "harsh") setState("avoidance");
  }

  if (currentState === "attention") {

    if (type === "cat_speech_strong") setState("affection");

    if (type === "nyan_long") {
      setState("affection");
    }

    if (type === "harsh") setState("avoidance");
  }

  if (currentState === "affection") {
    if (type === "harsh") setState("avoidance");
  }
}

// ===============================
// スワイプ判定（Play の入口）
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

      const PLAY_SPEED_THRESHOLD = isMobile ? 1.5 : 1.0;

      if (speed > PLAY_SPEED_THRESHOLD && currentState === "neutral") {
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
