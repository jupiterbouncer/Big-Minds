# Big Minds — Interest Exploration & Service Project Planner

**Big Minds** is a child-friendly pathway exploration platform and programme-planning dashboard for student explorers at Golden Age International School. It combines interactive career discovery with a facilitator tool for proposed activities, budget tracking, aggregate impact assessment, and school handover.

---

## 🌟 Key Features

### 1. 🌐 Progressive Web App (PWA) & Offline Engine
* **Offline support after a first online visit:** A Service Worker (`sw.js`) precaches the local application shell and selected third-party scripts using a stale-while-revalidate strategy.
* **Local-first operation:** Student sessions, surveys, and facilitator plans remain available in browser storage when a cloud connection is unavailable. External fonts and uncached third-party assets may limit a first offline load.
* **Web App Manifest (`manifest.json`):** Allows installation on tablets, smartphones, and laptops as a standalone desktop/mobile app.

### 2. 📊 Child-Friendly Pre/Post Surveys & Interactive Analytics
* **Emoji Rating System:** 4-question interactive survey using child-friendly emoji scales (1–5 rating) to measure curiosity in tech, visual design confidence, budgeting literacy, and public speaking comfort.
* **Chart.js Visual Analytics:** Tab 5 (*Outcome Assessment & Program Handover*) renders two live interactive charts:
  * **Mentorship Interest Distribution (Pie Chart):** Breakdown of student engagement across Web Dev, Visual Design, Finance, Public Speaking, and Entrepreneurship.
  * **Skill Confidence Growth (Bar Chart):** Direct comparison of baseline (Pre-Workshop) vs. final (Post-Workshop) skill growth.
* **Aggregate-only survey storage:** Survey responses save locally to `localStorage` (`bigminds_survey_responses_v1`) without student names or aliases and may sync to Firebase (`survey_responses/`) when its connection is available.

### 3. 📜 Curiosity Badges & Printable A4 Explorer Certificate
* **Dynamic Badges:** Earn digital badges (*Web Architect*, *Design Innovator*, *Money Smart*, *Public Speaker*, *Future Leader*) by completing pathway micro-activities and quizzes.
* **A4 Print Layout:** One-click certificate generator with `@media print` CSS optimization that hides navigation controls and formats a clean, single-page landscape certificate complete with student alias, earned badges, date, and team signatures.

### 4. 🔄 Real-Time Cross-Device Synchronization
* **Firebase Realtime Database:** Bi-directional cloud synchronization across multiple facilitator devices using WebSockets.
* **Live Status Badge:** Dynamic UI indicator in `service-project.html` displaying real-time connection state (`🟢 Cloud Synced`, `🟡 Syncing...`, `🟠 Disconnected / Local Mode`, `🔴 Error`).
* **Modal Protection:** Queues remote incoming updates while a facilitator edits modal forms, preventing text collisions and input loss.

### 5. 📋 5-Tab Service Project Planner
1. **Strategic Overview:** Project background, rationale, SDG 4/8 alignment, and target demographics.
2. **Implementation Schedule:** Interactive visit-by-visit milestone log and progress tracking.
3. **Resource & Budget Manager:** Categorized itemized budget with automatic total calculations and variance indicators.
4. **Curriculum Pathways:** Detailed lesson plans, micro-activities, and facilitation notes for all 5 visits.
5. **Outcome Assessment & Handover:** Pre/post survey analytics, aggregate impact metrics, peer-mentorship progression ladder, and school handover checklist.

---

## 🛠️ Technology Stack

* **Frontend:** Vanilla HTML5, CSS3 (Neo-Tactile Design System with bold borders, warm `#FDFBF7` palette, offset shadows `4px 4px 0px #1E1B4B`), ES6+ JavaScript.
* **Database & Sync:** Firebase Realtime Database (Compatibility SDK v9.23.0).
* **Analytics Engine:** Chart.js (v4 CDN with offline canvas fallback).
* **PWA Engine:** HTML5 Service Worker API (`sw.js`) & Web App Manifest (`manifest.json`).
* **Hosting:** Vercel Static Hosting.

---

## 📁 File Structure

```text
Big Minds/
├── index.html               # Student 2D pathway exploration map
├── quiz.html                # Interactive interest discovery quiz
├── service-project.html     # Facilitator planner dashboard & analytics
├── manifest.json            # PWA configuration manifest
├── sw.js                    # PWA Service worker offline caching engine
├── styles.css               # Neo-tactile design system, badge grids, charts & print rules
├── favicon.svg              # Platform icon
├── README.md                # Project documentation
└── js/
    ├── app.js               # Main application controller
    ├── canvas.js            # 2D interactive pathway canvas renderer
    ├── pathwaysData.js      # Curriculum pathways & activity dataset
    ├── plannerData.js       # Service project initial state dataset
    ├── firebaseConfig.js    # Client Firebase API credentials
    ├── firebaseSync.js      # RTDB bi-directional cloud sync engine
    ├── surveysAndBadges.js  # Pre/post surveys, badges, Chart.js & certificate generator
    └── planner.js           # Planner UI tabs, modals, and event handling
