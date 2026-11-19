# PetApp4-Web (Myu Edition)

Myu（Domestic Shorthair）が「猫語検定協会会長」として登場する、  
音声＋瞬き＋マウス操作でコミュニケーションする Web 版 AI ペットアプリです。

---

## 特徴

### 🐾 猫語キャリブレーション統合版
- Myu の鳴き声（`assets/audio/cat_mew.wav`）を FFT＋包絡線解析  
- low / mid / high / volume / duration / envSlope をプロファイル化  
- 「猫語検定1級（優等生）」の基準として保存

---

### 🐾 猫語度モデル（CatSpeechScore）
- スペクトル距離  
- 長音の長さ  
- 包絡線の傾き  
- ノイズ補正後の音量  
これらを統合したスコアを計算し、Myu のプロファイルに近いほど高得点になります。

スコアに応じて以下の状態に遷移します：

| スコア分類 | 状態 |
| :------------------ | :------------------ |
| cat_speech_weak | Attention |
| cat_speech_strong | Affection |
| nyan_long | Affection |
| harsh | Avoidance |

---

### 🐾 PC／スマホ自動切替
| 項目 | PC | Mobile |
| :---------------------- | :---: | :---: |
| 瞬き EAR 閾値 | 0.25 | 0.18 |
| 瞬き時間 | 250 ms | 350 ms |
| CatSpeechScore 閾値 | 15 / 30 | 20 / 35 |
| Play ジェスチャ速度 | 1.0 | 1.5 |

---

### 🐾 MediaPipe FaceMesh による瞬き検出
- EAR（Eye Aspect Ratio）を計算  
- ゆっくり瞬きで  
  **Neutral → Approach → Attention → Affection**  
へと遷移

---

### 🐾 暗騒音キャリブレーション
- 起動直後に 1 秒間の環境音をサンプリング  
- low / mid / high / volume の平均値を `noiseProfile` として保存  
- 以降の音声解析はこのノイズを差し引いて計算

---

### 🐾 インタラクション

| 入力 | 結果 |
| :------------------------ | :------------------------ |
| 長音の猫なで声 | Attention / Affection |
| 強い猫らしい鳴き声 | Affection |
| harsh（高音＋大音量） | Avoidance |
| スワイプ／高速マウス移動 | Play |
| 無操作 10 秒 | Sleep → Stretch → Neutral |

---

## 📁 フォルダ構成

```text
PetApp4-Web/
 ├── index.html
 ├── main.js
 ├── style.css
 ├── assets/
 │    ├── images/
 │    │    ├── myu_neutral.png
 │    │    ├── myu_approach.png
 │    │    ├── myu_attention.png
 │    │    ├── myu_affection.png
 │    │    ├── myu_avoidance.png
 │    │    ├── myu_play.png
 │    │    ├── myu_ignore.png
 │    │    ├── myu_sleep.png
 │    │    └── myu_stretch.png
 │    └── audio/
 │         └── cat_mew.wav
```

---

## 動作概要

1. **起動時**
   - 暗騒音キャリブレーション  
   - Myu の鳴き声を解析して猫語プロファイル生成  
   - 初期状態は `neutral`

2. **音声入力**
   - FFT＋ノイズ補正＋包絡線解析  
   - 猫語度スコア計算  
   - `cat_speech_weak` / `cat_speech_strong` / `nyan_long` / `harsh` に分類  
   - 状態遷移（Attention / Affection / Avoidance）

3. **瞬き・マウス・スワイプ**
   - ゆっくり瞬き → Approach → Attention → Affection  
   - スワイプ／高速マウス → Play  
   - harsh → Avoidance

4. **無操作**
   - 10 秒で Sleep → Stretch → Neutral

---

### 🌐 Live Demo
[PetApp4-Web (Myu Edition) デモ](https://petapp4-web-myu.netlify.app)

---

## ライセンス・クレジット

- **MediaPipe FaceMesh / CameraUtils**  
  Google / MediaPipe（CDN経由）

- **Myu（Domestic Shorthair）**  
  PetApp4-Web（Myu Edition）の主役  
  猫語検定協会会長として世界観を構成
