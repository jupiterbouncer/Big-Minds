# Big Minds — Interest & Pathway Exploration Platform
## Leadership Seminar IV: Leadership as Service Project Integration

Big Minds is an interactive learning and pathway discovery platform developed for Grade 5–6 students at Crown Prince Academy in Lapaz, Ghana.

The project consists of two integrated components:
1. **Student Discovery Explorer (`index.html`)**: An interactive 2D pathway map where students explore interests, complete micro-activities, and discover matching future archetypes.
2. **Service Project Planner (`service-project.html`)**: A comprehensive facilitator dashboard created for the Ashesi team to plan, budget, execute, evaluate, and hand over the service project initiative.

---

### Key Features of the Service Project Planner

1. **Mentorship Areas & Target Class Setup**:
   * Editable configuration for 5 core workshops: Programming & Web, Graphic Design, Financial Literacy, Entrepreneurship, and Public Speaking.
   * Target class tracking (~25 students default assumption for Crown Prince Academy).
2. **Visit Schedule & Session Sequence**:
   * 5-visit schedule tracking (Consultation, Tech & Design, Finance & Business, Public Speaking, Reflection & Handover).
   * Supports dates, objectives, agenda, materials, and status progression (`Draft`, `Proposed`, `Confirmed`, `Completed`).
3. **Lesson Plans & Team Responsibilities**:
   * Complete structured workshop templates with objectives, relatable introductions, hands-on activities, required materials, and reflection questions.
   * Team role assignment board with automated unassigned role warnings.
4. **Budget & Resource Planning (GHS)**:
   * Itemized budget calculator in Ghana Cedis (GHS) calculating line totals ($Qty \times UnitCost$) and grand totals.
   * Priority flags for Essential vs. Optional spending.
5. **Assessment, Sustainability & Handover**:
   * Aggregate metric tracking for participation and pre/post skill awareness (no individual child personal data is collected).
   * Handover checklist and optional Peer-Mentorship progression ladder.
6. **Data Storage & Multi-Device Persistence**:
   * **Local-First Reliability**: Instant client-side persistence using `localStorage` (`bigminds_service_project_plan_v1`), completely isolated from student explorer session state (`bigminds_student_session`).
   * **Real-Time Cloud Sync (Firebase Firestore)**: Live synchronization across admin laptops and mobile devices with offline-first write caching.
   * **One-Click JSON Export & Import**: Backup files for offline archival and version snapshots.
   * **Print Stylesheet**: Generates clean formatted printouts for team meetings and school administration proposals.

---

### How to Run & Connect Across Devices

1. Open `index.html` in any browser to access the Student Discovery Explorer.
2. Click **📋 Facilitator Planner** in the top navigation bar (or navigate to `service-project.html`) to manage project planning.
3. **To sync across multiple devices**:
   * Click **☁️ Cloud Sync** in the top-right header of `service-project.html`.
   * Paste your team's free Google Firebase configuration JSON (or configure `js/firebaseConfig.js`).
   * Edits made on one device will automatically reflect in real-time across all team members' laptops and phones!
4. Use the **Export Plan** button at any time to download an offline `.json` backup.

---

### Outstanding Items for School Confirmation (Crown Prince Academy)
* Final confirmed Grade 5 / Grade 6 classroom allocation and student list count.
* Specific calendar visit dates and start/end time slots.
* Availability of computer lab equipment or projector for Visit 2.
* Confirmation of CPA Teacher Liaison for post-program club continuity.