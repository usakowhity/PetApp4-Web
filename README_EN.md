# 🐾 **PetApp4-Web (Myu Edition) — Updated README (English)**

PetApp4-Web (Myu Edition) is a static‑image web pet application.  
The cat reacts to **eye blink detection (EAR)**, **voice tone classification**,  
**long‑meow detection**, and **swipe / mouse interactions**, changing its state in real time.

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

### 1. Eye Blink Detection (EAR)
A slow blink triggers the **Approach** state.  
Repeated gentle blinks lead to **Attention → Affection**.

---

### 2. Voice Triggers (Tone Classification + Long‑Meow Detection)

#### ■ Tone Classification
- Soft voice → **Attention**  
- Gentle cat‑mimic voice → **Affection**  
- Harsh voice → **Avoidance**

#### ■ Long‑Meow Detection (New)
Detects characteristic cat sounds such as “Nyaa”, “Myaa”, “Nyao”, “Nyago”.

| Detection | Real Sound | State |
|-----------|------------|--------|
| **nyan_short** | Nya! | Attention |
| **nyan_long** | Nyaa | Affection |
| **mya_long** | Myaa | Affection |
| **nyao** | Nyao | Play |
| **nyago** | Nyago | Play |

Long meows are detected using **frequency bands + volume + duration (300–900ms)**.

---

### 3. Swipe / Mouse Interaction
- Gentle swipe → **Affection**  
- Fast swipe → **Play**  
- High‑speed mouse movement → **Play**  
- Screen tap → **Avoidance**

---

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

### 5. Cat Language Certification (Joke Feature)
Your interactions (blinks, voice, meows, swipes) affect your  
**Cat Language Rank (1–5)**.

- Affection actions → Rank up  
- Avoidance actions → Rank down  

The rank is displayed at the top with **large paw icons 🐾**.

