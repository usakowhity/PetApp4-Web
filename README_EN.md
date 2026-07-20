# 🐾 **PetApp4-Web (Myu Edition) — Updated README (English)**

PetApp4-Web (Myu Edition) is a static‑image web pet application.  
The cat reacts to **eye blink detection (EAR)**,  
**CatSpeechScore‑based voice analysis**,  
and **swipe / mouse interactions**, changing its state in real time.

It also includes a playful **Cat Language Certification** feature  
that evaluates how “cat‑friendly” the user is (Joke element included).

---

## 📁 Folder Structure (Simplified)

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

## 🐾 Features

---

## 1. Eye Blink Detection (EAR)
A slow blink triggers the **Approach** state.  
Repeated gentle blinks lead to **Attention → Affection**.

---

## 2. Voice Triggers (CatSpeechScore + Long‑Meow Detection)

### ■ Cat Voice Calibration (Integrated Features)
At startup, the app analyzes a real cat meow and extracts:

- Spectral features (low / mid / high / volume)  
- Long‑meow duration  
- Envelope rise slope  

These form the **Cat Voice Profile**.

---

### ■ CatSpeechScore
User voice is analyzed in real time and compared with the profile.  
A score (0–100) determines the reaction:

| Score | Detection | State |
|--------|-----------|--------|
| **≥ 30** | cat_speech_strong | Affection |
| **≥ 15** | cat_speech_weak | Attention |
| **< 15** | — | No reaction |

---

### ■ Long‑Meow Detection (Supplemental)
Even if the score is low,  
long meows (“Nyaa”, “Myaa”, etc.) between **300–900ms**  
can trigger Attention or Affection.

---

## 3. Swipe / Mouse Interaction
- Gentle swipe → **Affection**  
- Fast swipe → **Play**  
- High‑speed mouse movement → **Play**  
- Screen tap → **Avoidance**

---

## 4. Natural Sleep Flow
After 10 seconds of no input:

```
Sleep (7s)
↓
Stretch (2s)
↓
Neutral
```

---

## 5. Cat Language Certification (Joke Feature)
Your interactions affect your  
**Cat Language Rank (1–5)**.

- Affection actions → Rank up  
- Avoidance actions → Rank down  

Displayed with large **paw icons 🐾**.

