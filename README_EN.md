# PetApp4-Web (Myu Edition)

PetApp4-Web (Myu Edition) is a static‑image web pet application.  
The cat reacts to **eye blink detection (EAR)**, **voice tone classification**,  
and **swipe / mouse interactions**, changing its state in real time.

In addition, the app includes a playful **Cat Language Certification** feature  
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

### 1. Eye Blink Detection (EAR)
A slow blink triggers the **Approach** state.

### 2. Voice Triggers
- Soft voice → **Attention**  
- Gentle cat‑mimic “meow” → **Affection**  
- Harsh voice → **Avoidance**

### 3. Swipe / Mouse Interaction
- Gentle swipe → **Affection**  
- Fast swipe → **Play**  
- High‑speed mouse movement → **Play**  
- Screen tap → **Avoidance**

### 4. Natural Sleep Flow
After 10 seconds of no input, the cat enters **Sleep**, then transitions:

```
Sleep (7s)
↓
Stretch (2s)
↓
Neutral
```

---

## 🐱 Behavior Model (State Transitions)

### From Neutral
- **Approach**: Slow blink  
- **Attention**: Soft voice  
- **Affection**: Gentle cat‑mimic “meow”  
- **Play**: Fast swipe / high‑speed mouse movement  
- **Avoidance**: Harsh voice / screen tap  
- **Sleep**: No input for 10 seconds  
- **Ignore**: Input detected but not matching any category

### Other transitions
- **Approach → Affection**: Soft voice / cat‑mimic voice  
- **Attention → Affection**: Slow blink / gentle swipe  
- **Sleep → Stretch → Neutral**: 7s → 2s  
- **All other states → Neutral**: After 5 seconds

---

## 🐾 Cat Language Certification (Neko-go Kentei)  
*Note: This feature includes a humorous/Joke element.*

Officially approved by the **Cat Language Certification Association (Chairman: Myu)**.  
The cat character **Myu**, co‑created by usakowhity and AI,  
evaluates the user's “cat affinity level” —  
how much cats would like you —  
based entirely on Myu’s **personal judgment and bias**.

### 🐾 Certification Ranks (Paw Marks)
- **Level 1**: 5 paw marks  
- **Level 2**: 4 paw marks  
- **Level 3**: 3 paw marks  
- **Level 4**: 2 paw marks  
- **Level 5**: 1 paw mark  

Your rank changes depending on Myu’s reactions  
(Affection, Approach, Avoidance, etc.).

---

## 🐱 Technologies Used
- HTML / CSS / JavaScript  
- MediaPipe FaceMesh  
- WebAudio API  
- GitHub Pages (HTTPS)

---

## 📄 License
MIT License  
Copyright (c) 2026 usakowhity

The source code is released under the MIT License.  
Image and audio assets are **not** covered by MIT;  
see **CREDITS_EN.md** for details.
```