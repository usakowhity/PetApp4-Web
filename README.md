# PetApp4-Web（Myu Edition）

PetApp4-Web（Myu Edition）は、静止画ベースの Web ペットアプリです。  
猫は **瞬き検出（EAR）**、**音声解析（声質分類）**、  
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

### 1. 瞬き検出（EAR）
ゆっくり瞬きをすると **Approach（近づく）** 状態になります。

### 2. 音声トリガー（声質分類）
- 柔らかい声 → **Attention（注目）**  
- 猫なで声（優しい「ニャー」） → **Affection（甘える）**  
- 荒い声 → **Avoidance（避ける）**

### 3. スワイプ／マウス操作
- ゆっくりスワイプ → **Affection（甘える）**  
- 早いスワイプ → **Play（遊ぶ）**  
- マウス高速移動 → **Play（遊ぶ）**  
- 画面タップ → **Avoidance（避ける）**

### 4. 自然な睡眠遷移
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

## 🐱 状態遷移（行動モデル）

### Neutral（通常）からの遷移
- **Approach**：ゆっくり瞬き  
- **Attention**：柔らかい声  
- **Affection**：猫なで声（優しい「ニャー」）  
- **Play**：早いスワイプ／マウス高速移動  
- **Avoidance**：荒い声／画面タップ  
- **Sleep**：10秒無操作  
- **Ignore**：上記どれにも該当しない入力

### 他状態からの遷移
- **Approach → Affection**：柔らかい声／猫なで声  
- **Attention → Affection**：ゆっくり瞬き／ゆっくりスワイプ  
- **Sleep → Stretch → Neutral**：7秒 → 2秒  
- **その他 → Neutral**：5秒で戻る

---

## 🐾 猫語検定（Cat Language Certification）  
※本項目は Joke を含みます。

**猫語検定協会（会長：Myu）公認。**  
usakowhity と AI の協業により生成された猫キャラクター **Myu** が、  
ユーザーの “猫派度合（猫に好かれるタイプかどうか）” を  
**独断と偏見により判定し、認定**します。

### 🐾 検定ランク（肉球印）
- **猫語検定 1級**：肉球印 5個  
- **猫語検定 2級**：肉球印 4個  
- **猫語検定 3級**：肉球印 3個  
- **猫語検定 4級**：肉球印 2個  
- **猫語検定 5級**：肉球印 1個  

Myu の反応（Affection / Approach / Avoidance など）に応じて  
あなたの猫語レベルが変動します。

---

## 🐱 使用技術
- HTML / CSS / JavaScript  
- MediaPipe FaceMesh  
- WebAudio API  
- GitHub Pages（HTTPS）

---

## 📄 ライセンス
MIT License  
Copyright (c) 2026 usakowhity

ソースコードは MIT License に基づきます。  
画像・音声素材は MIT の対象外で、詳細は **CREDITS.md** を参照してください。
```
