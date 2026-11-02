# Big Minds 2.0 — Student Pathways, Curiosity Exploration & Programme Planner

**Discover your interests. Explore your possibilities. Build your next step.**

**Big Minds** is a school-independent, publicly accessible student interest-exploration and mentorship platform. It combines an interactive 2D pathway canvas for senior secondary students with a secure administrative dashboard for programme coordinators to manage curriculum, budgets, and participant evaluation outcomes.

---

## 🌟 Key Features

### 1. 🧭 Public Student Experience
* **Self-Directed Onboarding:** Students register their preferred display name and choose a currency without disclosing sensitive personal data.
* **Anonymous Participant Identity:** Unique participant IDs (e.g., `bm_part_...`) are automatically generated and linked to all quiz submissions, survey evaluations, and progress.
* **Session Persistence:** State persists across reloads via browser storage and Firebase Realtime Database.
* **Non-Destructive Session Switching:** Shared laptops can launch a new participant session without erasing or overwriting previous records.

### 2. 🗺️ Mature Secondary School Pathway Canvas
Ten structured nodes across the **5 core mentorship disciplines**:
1. **Programming & Web Development:**
   - *Web Dev & Digital Architecture:* HTML5, CSS layout, JavaScript interaction.
   - *Software Engineering & Algorithms:* Algorithmic logic, API data handling, automated validation.
2. **Graphic Design:**
   - *Visual Communication & Branding:* Color theory, typography hierarchy, brand identity.
   - *UI/UX Design & Product Strategy:* User flows, wireframing, component design systems.
3. **Financial Literacy:**
   - *Personal Finance & Student Budgeting:* Tertiary living costs, needs vs. wants, emergency cushions.
   - *Venture Economics & Cost Modeling:* Unit economics, gross margins, breakeven analysis.
4. **Public Speaking:**
   - *Persuasive Speaking & Pitching:* Hook-Problem-Solution-Call to Action structure, 60s pitch timer.
   - *Professional Communication & Interviews:* The STAR method for scholarships and admissions.
5. **Entrepreneurship:**
   - *Problem Discovery & Market Empathy:* The "5 Whys" root-cause analyzer, customer interviews.
   - *MVP Building & Venture Launch:* Scoping lean MVPs, value propositions, rapid feedback loops.

### 3. 📝 Integrated Pre & Post Programme Surveys
* Direct access on the student interface through a milestone tracker.
* 1–5 confidence rating scales across the 5 mentorship areas plus qualitative reflections.
* Real-time persistence to Firebase under `participants/{id}/preSurvey` and `participants/{id}/postSurvey`.

### 4. 💱 Multi-Currency Architecture
* Reusable currency selector (`js/currencyHelper.js`) supporting 15 major currencies (NGN default, GHS, USD, GBP, EUR, CAD, ZAR, KES, etc.).
* Formatted using `Intl.NumberFormat`.
* Dynamically drives student budgeting sandboxes and the administrative budget manager.

### 5. 🔒 Private Administrative Dashboard (`service-project.html`)
* **Access Passkey Gate:** Blocks unauthenticated access to participant records and planning tools (default passkey: `bigminds2026`).
* **Live Participant Management:** Real-time directory subscribed to Firebase RTDB with drill-down modal inspection.
* **Survey Impact Analytics:** Chart.js doughnut chart (interest distribution) and comparative bar chart (pre vs. post growth).
* **Export Capabilities:** Export full participant data as CSV or download complete project plans as JSON.

---

## 🛠️ Technology Stack

* **Frontend:** Vanilla HTML5, CSS3 (Neo-Tactile Design System with bold borders, warm `#FDFBF7` palette, offset shadows `4px 4px 0px #1E1B4B`), ES6+ JavaScript.
* **Database & Auth:** Firebase Realtime Database & Firebase Anonymous Auth (SDK v9.23.0 compat).
* **Analytics:** Chart.js v4 CDN with native accessible canvas/HTML fallback.
* **PWA:** Service Worker (`sw.js` v4) & Web App Manifest (`manifest.json`).

---

## 📁 File Structure

```text
Big Minds/
├── index.html               # Public student 2D pathway exploration map
├── quiz.html                # Curiosity discovery quiz
├── service-project.html     # Protected facilitator & evaluation dashboard
├── manifest.json            # PWA configuration manifest
├── sw.js                    # PWA Service worker offline engine (v4)
├── styles.css               # Neo-tactile design system & responsive styling
├── favicon.svg              # Platform icon
├── README.md                # Project documentation
└── js/
    ├── app.js               # Student application controller & micro-activities
    ├── canvas.js            # 2D interactive pathway canvas renderer
    ├── currencyHelper.js    # Multi-currency catalog & Intl.NumberFormat helper
    ├── pathwaysData.js      # Pathway curriculum nodes & quiz questions
    ├── plannerData.js       # Administrative plan default dataset
    ├── firebaseConfig.js    # Client Firebase API credentials
    ├── firebaseSync.js      # RTDB bi-directional cloud sync & participant persistence
    ├── surveysAndBadges.js  # Pre/post surveys, curiosity badges & Chart.js engine
    └── planner.js           # Admin passkey gate, planner tabs & participant directory
```
