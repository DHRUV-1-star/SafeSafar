# SafeSafar - Safe Route Navigator
> **Empower to Inspire: Thriving Together for an Inclusive and Sustainable Future**  
> **IEEE WIE ILS 2026 National Hackathon — Track 3: SheLeads (WIE Special Track)**  
> **Problem Statement 5: Safe Route Navigator**  
> **Team Name: Codecraft**  
> **Institution: Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat, Gujarat**

---

## 👥 Team Information
- **Dharmik Gohil** (Team Lead & Full-Stack / Backend Developer) — [dharmikgohil138@gmail.com](mailto:dharmikgohil138@gmail.com)
- **Satej Kolhe** (Backend & Database Engineer) — [satejkolhe@gmail.com](mailto:satejkolhe@gmail.com)
- **Harshil Bamaniya** (Mobile App Developer) — [harshils5878@gmail.com](mailto:harshils5878@gmail.com)
- **Priyavardhan** (Web Dashboard Developer) — [priyavardhansingh3@gmail.com](mailto:priyavardhansingh3@gmail.com)
- **Dhruv Raval** (Maps & Routing Engineer) — [ravaldhruvp1112@gmail.com](mailto:ravaldhruvp1112@gmail.com)
- **Kristal Patel** (Emergency Systems & Integrations Engineer) — [kristalnpatel26@gmail.com](mailto:kristalnpatel26@gmail.com)

---

## 💡 The Core Problem
Mainstream navigation apps (Google Maps, Apple Maps) optimize purely for **speed and distance**. They ignore:
- **Street lighting & darkness pockets**
- **Pedestrian crowd density & context** (a busy commercial market vs. a deserted underpass or violent mob)
- **Safe landmarks** (women pink police booths, 24/7 hospitals, open pharmacies)
- **Time-of-day risks & past harassment reports**

In India, a crime against a woman is registered every 71 seconds (NCRB 2024), and over 2/3 of harassment incidents in public spaces go unreported. Women and girls commuting for education or work lack a real-time, data-backed navigation tool designed specifically for their safety.

---

## 🚀 The SafeSafar Solution
SafeSafar is a personal safety companion that delivers **three core pillars**:

### 1. Guides You the Safe Way (Dynamic Safety Scoring)
- Evaluates routes dynamically (Green / Yellow / Red safety index) based on:
  - **Street Lighting Coverage** (e.g., 96% on Dumas Road vs. 28% on Canal shortcut)
  - **Safe-Crowd Verification** (distinguishes active markets from isolated danger spots)
  - **Landmark Proximity** (Pink Police Booths, Police Commissionerate, 24/7 Civil Hospital)
  - **Time-Decay Weighted Incident Data** (community-reported hazards fade over 48 hours to prevent stale data)
- Transparent explainability: users see exactly why a route scored 94 vs 41.

### 2. Watches Over You While You Travel ("Walk Me Home" Mode)
- **Live Circle Sync**: Trusted contacts (parents, roommates) track real-time breadcrumbs without keeping their app open.
- **Route Deviation & Stop Anomaly Detection**: If the user goes off-route into an unverified alley or stops moving unexpectedly, the app initiates a **30-second countdown check-in** (*"Are you safe?"*). If unanswered, SOS alerts are dispatched automatically.
- **Battery-Aware Handoff**: Auto-notifies contacts when battery falls below 15%.
- **Automatic Arrival SMS**: Notifies contacts the moment the user reaches their destination safely.

### 3. The Novel Highlight: Fake-Call-to-Real-SOS Conversion
Most apps assume a victim can openly press a panic button. Under direct threat (a suspicious cab driver, stalker within arm's reach), pressing a panic button can escalate violence.
- **Realistic Incoming Call Screen**: Rings and vibrates realistically like a genuine call from *"Papa"* or *"Mom"*.
- **In-Call Covert Trigger**: Speaking secret keywords (*"reach soon"*, *"traffic"*, *"red"*, *"help"*) into the microphone or double-tapping the discreet mute button silently converts the call into an **Emergency SOS distress beacon**.
- **The screen disguise remains active**: To any onlooker or attacker, it appears to be a normal family conversation while GPS coordinates and emergency dispatches are transmitted silently.

### 4. Duress Passkey & Decoy Screen
- If forced by an attacker to "unlock phone or turn off SOS", the user enters the **Duress PIN (`9999`)**:
  - The app silently transmits a high-priority distress beacon to police and trusted contacts.
  - The screen seamlessly transitions into a **working Decoy Calculator**, completely deceiving the aggressor!
  - Entering the normal PIN (`1234`) disarms the alarm safely.

### 5. Multi-View Architecture
- **📱 Mobile App View**: Passenger navigation, turn-by-turn spoken guidance, quick covert triggers.
- **🖥️ Guardian Web Dashboard**: Live telemetry, speed, battery, breadcrumbs, and remote escalation for family members.
- **📊 Civic Heatmap & SMC Analytics**: Transforms crowdsourced hazard reports into municipal infrastructure work orders (Surat Municipal Corporation streetlight repairs, Pink Police beat patrols).

---

## 🛠️ Technology Stack
- **Frontend (Mobile & Web)**: React + TypeScript + Vite, Tailwind CSS, Lucide Icons, Leaflet Maps
- **Sound & Haptics**: Web Audio API (native synthesized ringtone, siren, covert confirmation ping)
- **Voice Guidance & Wake-Word**: Web Speech API (`SpeechSynthesis` & `SpeechRecognition`)
- **Backend Architecture (Target Specification)**: NestJS, PostgreSQL + PostGIS, Redis (Upstash), Firebase Auth, Twilio SMS API

---

## 💻 Running the Application Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Launch
```bash
# 1. Clone repository
git clone https://github.com/DHRUV-1-star/SafeSafar.git
cd SafeSafar

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start development server
npm run dev
```

The application will be running at:
**`http://localhost:5173/`**

---

## 🧪 Interactive Demo Test Checklist

| Feature | How to Test | Expected Result |
| :--- | :--- | :--- |
| **Route Comparison** | Click route cards (Dumas Rd, Ghod Dod, Canal Rd) | Map polylines highlight with green/yellow/red glow, safety score updates dynamically. |
| **Fake Call to SOS** | Click **"Fake Call"** in top bar, click **Accept** | Rings with synthesized audio. Speak *"reach soon"* or click `[Demo: Silent Trigger Now]` to see covert SOS dispatch while the call stays open. |
| **Duress Passkey** | Click **"Duress PIN"** in top bar, enter `9999` | Duress SOS is sent secretly and the **Decoy Calculator** opens to fool the aggressor. |
| **Normal Disarm** | Open Duress Modal, enter `1234` | Safely disarms without triggering emergency alerts. |
| **Walk Me Home** | Click **"Walk Me Home Mode"** | Shows live circle sync, battery guard, and 30s countdown check-in prompt. |
| **Live Navigation** | Click **"Start Navigation"** | Initiates turn-by-turn guidance. Test **"Simulate Off-Route"** and **"Simulate Safe Arrival"** with confetti! |
| **Guardian Dashboard**| Click **"Guardian Dashboard"** tab | Displays live telemetry, route metrics, and breadcrumbs. |
| **Civic Analytics** | Click **"Civic Heatmap"** tab | Shows SMC dark-spot repair queue and municipal intervention tickets. |
| **2G SMS Fallback** | Click **"5G Online"** button | Switches to **2G / SMS Fallback** mode with raw 160-char SMS payload preview. |

---

## 📜 Originality & Declaration
This solution was developed by **Team Codecraft** for the **IEEE WIE ILS 2026 National Hackathon (Track 3 - SheLeads)**. All code and designs adhere to ethical guidelines and inclusive safety design principles.
