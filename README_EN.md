# PetApp4-Web (Myu Edition)

**PetApp4-Web (Myu Edition)** is an AI pet web application where Myu, a Domestic Shorthair cat, acts as the **Chairperson of the Cat Language Certification Association**.  
The app reacts to your **voice**, **blinks**, **mouse gestures**, and **swipes**, creating a natural and emotional interaction experience.

This edition includes the **full Cat Language Calibration Model**, **CatSpeechScore**, and **PC/Mobile adaptive tuning**.

---

## Features

### 🐾 1. Cat Voice Calibration (Myu’s Voice Profile)
PetApp4-Web analyzes Myu’s real meow (`assets/audio/affection_mew.mp3`) using:

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

This creates a dynamic and expressive interaction.

---

### 🐾 3. PC / Mobile Auto-Adjustment
The app automatically adjusts thresholds based on device type:

| Feature | PC | Mobile |
|--------|----|--------|
| Blink EAR threshold | 0.25 | 0.18 |
| Blink duration | 250 ms | 350 ms |
| CatSpeechScore thresholds | 15 / 30 | 20 / 35 |
| Play gesture speed | 1.0 | 1.5 |

This ensures stable behavior on both desktop and mobile browsers.

---

### 🐾 4. MediaPipe FaceMesh Blink Detection
Using Google MediaPipe FaceMesh:

- EAR (Eye Aspect Ratio) is calculated
- Slow blinking triggers:
  - **Neutral → Approach → Attention → Affection**

Blink detection is stabilized using EAR filtering.

---

### 🐾 5. Ambient Noise Calibration
At startup, the app samples 1 second of ambient noise:

- low / mid / high / volume averages  
- stored as `noiseProfile`

All voice analysis subtracts this noise baseline for accurate CatSpeechScore.

---

### 🐾 6. Interaction System

| Action | Result |
|--------|--------|
| Long soft meow | Attention / Affection |
| Strong cat-like meow | Affection |
| Harsh loud sound | Avoidance |
| Swipe / fast mouse move | Play |
| No input for 10 seconds | Sleep → Stretch → Neutral |

Myu reacts emotionally and smoothly transitions between states.

---

## Folder Structure

```
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
 │    │    ├── myu_stretch.png
 │    └── audio/
 │         └── affection_mew.mp3
```

---

## How It Works

### 1. Startup
- Ambient noise calibration begins
- Myu’s meow is analyzed to build the Cat Language Profile
- Initial state is `neutral`

### 2. Voice Interaction
- FFT + noise correction + envelope analysis
- CatSpeechScore is computed
- State transitions occur based on score

### 3. Blink Interaction
- Slow blink → Approach → Attention → Affection

### 4. Gesture Interaction
- Swipe / fast mouse → Play
- Harsh sound → Avoidance

### 5. Idle Behavior
- No input → Sleep → Stretch → Neutral

---

## Credits

- **MediaPipe FaceMesh / CameraUtils**  
  Used for blink detection and face tracking.

- **Myu (Domestic Shorthair)**  
  The main character and Chairperson of the Cat Language Certification Association.

---

## License

This project uses external libraries under their respective licenses.  
All Myu images and audio are original assets created for PetApp4-Web (Myu Edition).


