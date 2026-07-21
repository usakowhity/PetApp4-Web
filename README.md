# 🟩 README（日本語版・最新版）

```markdown
# PetApp4-Web (Myu Edition)

Myu（Domestic Shorthair）が「猫語検定協会会長」として登場する、  
音声＋瞬き＋マウス操作でコミュニケーションする Web 版 AI ペットアプリです。

---

## 特徴

- **猫語キャリブレーション統合版**
  - Myu の鳴き声（`assets/audio/cat_mew.wav`）を FFT＋包絡線解析
  - low / mid / high / volume / duration / envSlope をプロファイル化
  - これを「猫語検定1級（優等生）」の基準として保存

- **猫語度モデル（CatSpeechScore）**
  - スペクトル距離＋長音の長さ＋包絡線の傾きを統合したスコア
  - ユーザーの声が Myu のプロファイルに近いほどスコアが高くなる
  - スコアに応じて Attention / Affection / Avoidance を動的に遷移

- **PC／スマホ自動切替**
  - `navigator.userAgent` による簡易判定
  - 瞬き判定（EAR閾値・時間）を PC／スマホで自動調整
  - 猫語度の閾値（Attention / Affection）も端末に応じて最適化

- **MediaPipe FaceMesh による瞬き検出**
  - 目の縦横比（EAR）を計算し、ゆっくり瞬きで Approach → Attention → Affection
  - まばたきの安定性を考慮したフィルタリング（prevEAR）

- **暗騒音キャリブレーション**
  - 起動直後に周囲の環境音を 1 秒間サンプリング
  - low / mid / high / volume の平均値をノイズプロファイルとして保存
  - 以降の音声解析ではこのノイズを差し引いて猫語度を計算

- **インタラクション**
  - 長音の猫なで声 → Attention / Affection
  - harsh（高音＋大音量） → Avoidance
  - スワイプ／高速マウス移動 → Play
  - 無操作 10 秒 → Sleep → Stretch → Neutral

---

## フォルダ構成

- `index.html`  
- `main.js`  
- `style.css`  

- `assets/images/`  
  - `myu_neutral.png`  
  - `myu_approach.png`  
  - `myu_attention.png`  
  - `myu_affection.png`  
  - `myu_avoidance.png`  
  - `myu_play.png`  
  - `myu_ignore.png`  
  - `myu_sleep.png`  
  - `myu_stretch.png`

- `assets/audio/`  
  - `cat_mew.wav`（Myu の鳴き声：キャリブレーション＋Affection演出）

---

## 動作概要

1. 起動時  
   - 暗騒音キャリブレーション  
   - Myu の鳴き声を解析して猫語プロファイル生成  
   - 初期状態は `neutral`

2. 音声入力  
   - FFT＋ノイズ補正＋包絡線解析  
   - 猫語度スコア計算  
   - `cat_speech_weak` / `cat_speech_strong` / `nyan_long` / `harsh` に分類  
   - 状態遷移（Attention / Affection / Avoidance）

3. 瞬き・マウス・スワイプ  
   - ゆっくり瞬き → Approach → Attention → Affection  
   - スワイプ／高速マウス → Play  
   - harsh → Avoidance

4. 無操作  
   - 10 秒で Sleep → Stretch → Neutral

---

## ライセンス・クレジット

- MediaPipe FaceMesh / CameraUtils  
  - Google / MediaPipe（CDN経由）

- Myu（Domestic Shorthair）  
  - PetApp4-Web（Myu Edition）の主役  
  - 猫語検定協会会長として世界観を構成
```