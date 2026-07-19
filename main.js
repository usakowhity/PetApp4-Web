// ===============================
// PetApp4-Web (Myu Edition)
// 完全安定版 main.js（Part 1/2）
// ===============================

// -------------------------------
// 定数（EAR安定化）
// -------------------------------
const BLINK_EAR_THRESHOLD = 0.15;   // 誤検出防止のため低めに
const BLINK_DURATION_MS = 400;      // 0.4秒以上閉じたら瞬き扱い

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
// Affection クールダウン（鳴き声連発防止）
// -------------------------------
let lastAffectionTime = 0;
const AFFECTION_COOLDOWN_MS = 4000;

// -------------------------------
// 猫語検定ランク管理（README準拠）
// -------------------------------
let catRank = 5;     // 初期ランク：5級
let catScore = 0;    // スコア累積

function updateCatRank(change) {
  catScore += change;

  // スコアに応じてランク変動（1〜5級）
  if (catScore >= 50 && catRank > 1) {
    catRank--;
    catScore = 0;
  }

  if (catScore <= -30 && catRank < 5) {
    catRank++;
    catScore = 0;
  }

  // 肉球印（README仕様）
  const paws = "🐾".repeat(6 - catRank);

  // 表示更新
  const points = document.getElementById("points");
  points.textContent = `猫語検定 ${catRank}級${paws}`;
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

// -------------------------------
// 画像切り替え
// -------------------------------
function setImage(state) {
  const img = document.getElementById("pet-image");
  img.src = images[state];
}

// -------------------------------
// 状態変更
// -------------------------------
function setState(newState) {
  const now = Date.now();

  // Affection クールダウン（鳴き声連発防止）
  if (newState === "affection" && now - lastAffectionTime < AFFECTION_COOLDOWN_MS) {
    return;
  }

  if (currentState === newState) return;

  currentState = newState;
  setImage(newState);
  lastInputTime = now;
  clearTimeout(stateTimer);

  // Affection：鳴き声＋ランク上昇
  if (newState === "affection") {
    lastAffectionTime = now;

    const audio = new Audio("assets/audio/affection_mew.mp3");
    audio.currentTime = 0;
    audio.play();

    updateCatRank(+5);
  }

  // Avoidance：ランク下降
  if (newState === "avoidance") {
    updateCatRank(-3);
  }

  // Sleep → Stretch → Neutral
  if (newState === "sleep") {
    stateTimer = setTimeout(() => {
      setState("stretch");
      stateTimer = setTimeout(() => {
        setState("neutral");
      }, STRETCH_DURATION_MS);
    }, SLEEP_DURATION_MS);
    return;
  }

  // その他の状態 → Neutral（3秒）
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
// MediaPipe FaceMesh（瞬き検出・安定化）
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

  // EAR 異常値フィルタ（誤検出防止）
  if (EAR < 0.05 || EAR > 0.5) return;

  // EAR変化量フィルタ（安定化）
  if (prevEAR !== null && Math.abs(EAR - prevEAR) < 0.01) {
    prevEAR = EAR;
    return;
  }
  prevEAR = EAR;

  if (EAR < BLINK_EAR_THRESHOLD) {
    if (!blinkStart) blinkStart = now;

    if (now - blinkStart > BLINK_DURATION_MS) {
      if (currentState === "neutral") setState("approach");
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
// 音声判定（catmimic誤判定防止版）
// ===============================
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);

  const CATMIMIC_THRESHOLD = 25;  // ←誤判定防止のため強化

  function classifyVoiceByCatProfile(data) {
    const lowBand = data.slice(0, 50);
    const midBand = data.slice(50, 120);
    const highBand = data.slice(120, 200);

    const low = avg(lowBand);
    const mid = avg(midBand);
    const high = avg(highBand);
    const volume = avg(data);

    // 小さすぎる音は無視（生活ノイズ対策）
    if (volume < 30) return null;

    // キャリブレーション前の簡易判定
    if (!catProfile.ready) {
      if (volume < 20 && mid > low && high < mid) return "soft";
      if (volume > 25 && mid > low && high > mid * 0.7) return "catmimic";
      if (volume > 40 && high > mid) return "harsh";
      return null;
    }

    // キャリブレーション後の距離計算
    const dLow = Math.abs(low - catProfile.low);
    const dMid = Math.abs(mid - catProfile.mid);
    const dHigh = Math.abs(high - catProfile.high);
    const dVol = Math.abs(volume - catProfile.volume);

    const distance =
      dLow * 0.5 +
      dMid * 1.0 +
      dHigh * 1.0 +
      dVol * 0.3;

    // 猫語に近い音（閾値強化済）
    if (distance < CATMIMIC_THRESHOLD) return "catmimic";

    if (volume < 20 && mid > low && high < mid) return "soft";
    if (volume > 40 && high > mid) return "harsh";

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
// 音声による状態遷移（neutralではcatmimic発火しない）
// ===============================
function handleVoice(type) {
  lastInputTime = Date.now();

  // neutral は誤発火しやすいので catmimic を無効化
  if (currentState === "neutral") {
    if (type === "soft") setState("attention");
    else if (type === "harsh") setState("avoidance");
    return;
  }

  // approach
  if (currentState === "approach") {
    if (type === "soft") setState("affection");
    if (type === "catmimic") setState("affection");
    if (type === "harsh") setState("avoidance");
  }

  // attention
  if (currentState === "attention") {
    if (type === "soft") setState("affection");
    if (type === "catmimic") setState("affection"); // ←ここだけ catmimic を許可
    if (type === "harsh") setState("avoidance");
  }

  // affection 中は harsh のみ反応
  if (currentState === "affection") {
    if (type === "harsh") setState("avoidance");
  }
}

// ===============================
// スワイプ判定（ゆっくり / 早い）
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
