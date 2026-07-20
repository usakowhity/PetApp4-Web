# 🐾 **PetApp4-Web（Myu Edition） — 最新版 README（日本語）**

PetApp4-Web（Myu Edition）は、静止画ベースの Web ペットアプリです。  
猫は **瞬き検出（EAR）**、**猫語度（CatSpeechScore）による音声解析**、  
さらに **スワイプ／マウス操作** に反応して、さまざまな状態に変化します。

また、ユーザーの猫好き度合を判定する **猫語検定機能（世界初／Joke要素あり）** を搭載しています。

---

## 📁 フォルダ構成（簡略）

```
PetApp4-Web/
 ├─ index.html
 ├─ main.js
 ├─ style.css
 ├─ assets/
 │   ├─ images/
 │   └─ audio/
 └─ libs/
```

---

## 🐾 主な機能

---

## 1. 瞬き検出（EAR）
MediaPipe FaceMesh を使用し、  
**ゆっくり瞬き → Approach（近づく）**  
**連続したゆっくり瞬き → Attention → Affection（甘える）**  
という自然な猫の反応を再現しています。

EAR（目の縦横比）が一定時間しきい値を下回ることで「ゆっくり瞬き」を検出します。

---

## 2. 音声トリガー（猫語度ベースの新判定）

### ■ 猫語キャリブレーション（統合特徴版）
起動時に本物の猫の鳴き声を解析し、以下の特徴を抽出します：

- **音質（low / mid / high / volume）**  
- **長音の持続時間（durationMs）**  
- **包絡線の立ち上がり（envSlope）**

これらを統合して **猫語プロファイル** を生成します。

---

### ■ 猫語度（CatSpeechScore）
ユーザーの声をリアルタイム解析し、  
猫語プロファイルとの類似度から **0〜100 の猫語度スコア** を算出します。

| 猫語度 | 判定 | 状態遷移 |
|--------|------|----------|
| **≥ 30** | cat_speech_strong | Affection（甘える） |
| **≥ 15** | cat_speech_weak | Attention（注目） |
| **< 15** | — | 無反応 |

---

### ■ 長音検出（補助判定）
猫語度が低くても、  
「ニャー」「ミャー」などの **長音（300〜900ms）** が成立した場合は  
Attention／Affection の補助トリガーとして扱います。

---

## 3. スワイプ／マウス操作
- ゆっくりスワイプ → **Affection（甘える）**  
- 早いスワイプ → **Play（遊ぶ）**  
- マウス高速移動 → **Play（遊ぶ）**  
- 画面タップ → **Avoidance（避ける）**

---

## 4. 自然な睡眠遷移
10秒間無操作で **Sleep（眠る）** に入り、  
その後自動で以下の流れになります：

```
Sleep（7秒）
↓
Stretch（2秒）
↓
Neutral（通常）
```

---

## 5. 猫語検定（世界初／Joke要素）
ユーザーの行動（瞬き／猫語／声／スワイプ）に応じて  
**猫語検定ランク（1〜5級）** が上下します。

- 甘える行動 → ランク上昇  
- 避ける行動 → ランク下降  

ランクは画面上部に **大きな肉球印🐾** とともに表示されます。

---

## 🐾 状態遷移（最新版）

### Neutral → Attention
- 猫語度 ≥ **15**  
- 長音（nyan_long / mya_long）

### Approach → Attention
- ゆっくり瞬き

### Approach → Affection
- 猫語度 ≥ **30**  
- 長音（nyan_long / mya_long）

### Attention → Affection
- 猫語度 ≥ **30**  
- 長音（nyan_long / mya_long）

### **Any State → Avoidance**
- harsh（高音＋大音量）

### Neutral → Play
- 高速スワイプ  
- 高速マウス移動

### Neutral → Sleep
- 無操作 10 秒