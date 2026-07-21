# 🟩 README_EN.md（英語版・最新版）

```markdown
# PetApp4-Web (Myu Edition)

**PetApp4-Web (Myu Edition)** is an AI pet web application where Myu, a Domestic Shorthair cat, acts as the **Chairperson of the Cat Language Certification Association**.  
The app reacts to your **voice**, **blinks**, **mouse gestures**, and **swipes**, creating a natural and emotional interaction experience.

This edition includes the **full Cat Language Calibration Model**, **CatSpeechScore**, and **PC/Mobile adaptive tuning**.

---

## Features

### 🐾 1. Cat Voice Calibration (Myu’s Voice Profile)
PetApp4-Web analyzes Myu’s real meow (`assets/audio/cat_mew.wav`) using:

- FFT spectrum analysis  
- Envelope extraction  
- Duration estimation  
- Slope (rise characteristic)  
- Volume profile  

These values form the **Cat Language Level 1 (Expert)** profile.  
Your voice is compared against this profile to determine how “cat-like” it is.

---

### 🐾 2. CatSpeechScore (Cat Language Model)
Your voice is evaluated using:

- Spectral similarity (low / mid / high / volume)
- Duration similarity (long meow characteristics)
- Envelope slope similarity (soft rising tone)
- Noise-adjusted volume

The final score determines:

- **cat_speech_weak → Attention**  
- **cat_speech_strong → Affection**  
- **nyan_long → Affection**  
- **harsh → Avoidance**

---

### 🐾 3. PC / Mobile Auto-Adjustment

| Feature | PC | Mobile |
|--------|----|--------|
| Blink EAR threshold | 0.25 | 0.18 |
| Blink duration | 250 ms | 350 ms |
| CatSpeechScore thresholds | 15 / 30 | 20 / 35 |
| Play gesture speed | 1.0 | 1.5 |

---

### 🐾 4. MediaPipe FaceMesh Blink Detection
- EAR (Eye Aspect Ratio) is calculated  
- Slow blinking triggers:  
  **Neutral → Approach → Attention → Affection**

---

### 🐾 5. Ambient Noise Calibration
- Samples 1 second of ambient noise  
- Builds `noiseProfile`  
- All voice analysis subtracts this baseline

---

### 🐾 6. Interaction System

| Action | Result |
|--------|--------|
| Long soft meow | Attention / Affection |
| Strong cat-like meow | Affection |
| Harsh loud sound | Avoidance |
| Swipe / fast mouse move | Play |
| No input for 10 seconds | Sleep → Stretch → Neutral |

---

## Folder Structure

```
PetApp4-Web/
 ├── index.html
 ├── main.js
 ├── style.css
 ├── assets/
 │    ├── images/
 │    └── audio/
 │         └── cat_mew.wav
```

---

## Credits

- **MediaPipe FaceMesh / CameraUtils**  
  Google / MediaPipe

- **Myu (Domestic Shorthair)**  
  Main character and Chairperson of the Cat Language Certification Association.

---

## License

MIT License  
© 2026 usakowhity

Image and audio assets are **not covered by MIT License**.  
See the credits section for usage terms.
```
