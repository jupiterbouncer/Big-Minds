/**
 * Big Minds — Surveys, Curiosity Badges & Analytics Engine
 * Manages child-friendly pre/post surveys, printable certificates, badge unlocking, and Chart.js analytics.
 */

const SESSION_KEY = "bigminds_student_session";
const SURVEY_STORAGE_KEY = "bigminds_survey_responses_v1";

window.SurveysAndBadges = {
  // Available Curiosity Badges
  BADGES: [
    { id: "web-architect", title: "Web Architect", icon: "🌐", desc: "Explored web development & coding" },
    { id: "design-innovator", title: "Design Innovator", icon: "🎨", desc: "Created visual posters & layouts" },
    { id: "money-smart", title: "Money Smart", icon: "💰", desc: "Mastered budgeting & saving basics" },
    { id: "public-speaker", title: "Public Speaker", icon: "🎤", desc: "Practiced presenting ideas confidently" },
    { id: "future-entrepreneur", title: "Future Leader", icon: "🚀", desc: "Built a service project solution" }
  ],

  // Survey Questions Definition
  SURVEY_QUESTIONS: [
    { id: "q_tech", text: "How curious are you about how technology and websites work?" },
    { id: "q_design", text: "How confident do you feel creating posters or visual designs?" },
    { id: "q_finance", text: "Do you understand how to make a budget and save money?" },
    { id: "q_speaking", text: "How comfortable do you feel speaking in front of your class?" }
  ],

  pieChartInstance: null,
  barChartInstance: null,

  init() {
    this.ensureStudentSession();
    this.removeLegacySurveyAliases();
    this.setupEventListeners();
    this.renderAnalyticsCharts();
  },

  /* ==========================================================================
     STUDENT SESSION & ANONYMOUS ALIAS
     ========================================================================== */
  ensureStudentSession() {
    let session;
    try {
      session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (err) {
      session = null;
    }
    if (!session || typeof session !== "object") {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const prefixes = ["Explorer", "Coder", "Designer", "Innovator", "Scholar"];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      session = {
        alias: `${prefix} ${randomNum}`,
        unlockedBadges: [],
        createdDate: new Date().toISOString()
      };
    }
    if (!session.alias) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      session.alias = `Explorer ${randomNum}`;
    }
    if (!Array.isArray(session.unlockedBadges)) session.unlockedBadges = [];
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getStudentData() {
    const student = JSON.parse(localStorage.getItem(SESSION_KEY)) || this.ensureStudentSession();
    if (!Array.isArray(student.unlockedBadges)) student.unlockedBadges = [];
    return student;
  },

  unlockBadge(badgeId) {
    const student = this.getStudentData();
    if (!student.unlockedBadges.includes(badgeId)) {
      student.unlockedBadges.push(badgeId);
      localStorage.setItem(SESSION_KEY, JSON.stringify(student));
    }
  },

  removeLegacySurveyAliases() {
    try {
      const surveys = JSON.parse(localStorage.getItem(SURVEY_STORAGE_KEY) || "[]");
      if (!Array.isArray(surveys)) return;
      const sanitized = surveys.map(({ id, type, answers, interests, timestamp }) => ({
        id,
        type,
        answers,
        interests: Array.isArray(interests) ? interests : [],
        timestamp
      }));
      localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (err) {
      console.warn("Unable to sanitize locally stored survey data", err);
    }
  },

  /* ==========================================================================
     SURVEY MODAL & STORAGE LOGIC
     ========================================================================== */
  openSurveyModal(type = "pre") {
    const student = this.getStudentData();
    const titleText = type === "pre" ? "📝 Student Pre-Exploration Survey" : "🌟 Student Post-Exploration Survey";

    let questionsHtml = this.SURVEY_QUESTIONS.map((q, idx) => `
      <div class="survey-card">
        <div class="survey-question">${idx + 1}. ${q.text}</div>
        <div class="emoji-rating-grid" data-question="${q.id}">
          <button type="button" class="emoji-btn" data-value="1"><span class="emoji">😟</span><span class="label">Not Yet</span></button>
          <button type="button" class="emoji-btn" data-value="2"><span class="emoji">😐</span><span class="label">A Little</span></button>
          <button type="button" class="emoji-btn" data-value="3"><span class="emoji">🙂</span><span class="label">Good</span></button>
          <button type="button" class="emoji-btn" data-value="4"><span class="emoji">😃</span><span class="label">Great</span></button>
          <button type="button" class="emoji-btn" data-value="5"><span class="emoji">🤩</span><span class="label">Super!</span></button>
        </div>
      </div>
    `).join("");

    const modalHtml = `
      <div style="max-width: 600px; margin: 0 auto;">
        <p class="text-sm text-muted margin-bottom-sm">
          Welcome, <strong>${student.alias}</strong>! Please answer these 4 quick questions.
        </p>
        <form id="form-survey-questions">
          ${questionsHtml}
          <div class="margin-top-md text-right">
            <button type="submit" class="btn btn-primary">Submit Survey</button>
          </div>
        </form>
      </div>
    `;

    this.showModal(titleText, modalHtml);

    // Wire up interactive emoji selection
    document.querySelectorAll(".emoji-rating-grid").forEach(grid => {
      grid.querySelectorAll(".emoji-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          grid.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });
    });

    // Handle Form Submit
    document.getElementById("form-survey-questions").addEventListener("submit", (e) => {
      e.preventDefault();
      const answers = {};
      let allAnswered = true;

      this.SURVEY_QUESTIONS.forEach(q => {
        const selectedBtn = document.querySelector(`.emoji-rating-grid[data-question="${q.id}"] .emoji-btn.selected`);
        if (selectedBtn) {
          answers[q.id] = parseInt(selectedBtn.getAttribute("data-value"));
        } else {
          allAnswered = false;
        }
      });

      if (!allAnswered) {
        alert("Please select an answer for all questions!");
        return;
      }

      this.saveSurveyResponse(type, answers);
      this.closeModal();
      alert("Thank you! Your survey response has been saved.");
      this.renderAnalyticsCharts();
    });
  },

  saveSurveyResponse(type, answers) {
    const surveyData = JSON.parse(localStorage.getItem(SURVEY_STORAGE_KEY) || "[]");
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    const interestMap = {
      "Technology": ["Programming and Web"],
      "AI & Data": ["Programming and Web"],
      "Art & Design": ["Graphic Design"],
      "Business": ["Financial Literacy", "Entrepreneurship"],
      "Leadership": ["Public Speaking", "Entrepreneurship"]
    };
    const interestAreas = ["Programming and Web", "Graphic Design", "Financial Literacy", "Public Speaking", "Entrepreneurship"];
    const interests = Array.from(new Set((Array.isArray(session.activeInterests) ? session.activeInterests : [])
      .flatMap((interest) => interestMap[interest] || [interest])
      .filter((interest) => interestAreas.includes(interest))));

    const newResponse = {
      id: "srv-" + Date.now(),
      type: type, // 'pre' or 'post'
      answers: answers,
      interests,
      timestamp: new Date().toISOString()
    };

    surveyData.push(newResponse);
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(surveyData));

    // Sync to Firebase if available
    if (window.FirebaseSync && window.FirebaseSync.db) {
      window.FirebaseSync.db.ref("survey_responses/" + newResponse.id).set(newResponse);
    }
  },

  /* ==========================================================================
     PRINTABLE CERTIFICATE GENERATOR
     ========================================================================== */
  openCertificateModal() {
    const student = this.getStudentData();
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const unlockedBadgesHtml = this.BADGES.map(b => {
      const isUnlocked = student.unlockedBadges.includes(b.id);
      return `
        <div class="badge-item ${isUnlocked ? '' : 'locked'}">
          <span class="badge-icon">${b.icon}</span>
          <div class="badge-title">${b.title}</div>
        </div>
      `;
    }).join("");

    const certHtml = `
      <div id="certificate-print-area" class="certificate-container">
        <div class="certificate-header">
          <h2>Certificate of Exploration</h2>
          <p>Golden Age International School — Big Minds Programme</p>
        </div>
        <p>This is to certify that</p>
        <div class="certificate-student-name">${student.alias}</div>
        <p>has successfully explored foundational career pathways and demonstrated leadership in</p>
        <div class="certificate-badges-row">
          ${unlockedBadgesHtml}
        </div>
        <div class="certificate-footer-grid">
          <div class="signature-box">
            <p><strong>${dateStr}</strong></p>
            <div class="signature-line">Date of Award</div>
          </div>
          <div class="signature-box">
            <p><strong>Big Minds Facilitators</strong></p>
            <div class="signature-line">Programme Team</div>
          </div>
        </div>
      </div>
      <div class="modal-actions margin-top-md text-right">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Certificate</button>
      </div>
    `;

    this.showModal("📜 Explorer Certificate", certHtml);
  },

  /* ==========================================================================
     ANALYTICS CHART VISUALIZATION (CHART.JS)
     ========================================================================== */
  renderAnalyticsCharts() {
    const pieCanvas = document.getElementById("surveyPieChart");
    const barCanvas = document.getElementById("surveyBarChart");

    if (!pieCanvas || !barCanvas) return;

    const rawSurveys = JSON.parse(localStorage.getItem(SURVEY_STORAGE_KEY) || "[]");

    const preSurveys = rawSurveys.filter(s => s.type === "pre");
    const postSurveys = rawSurveys.filter(s => s.type === "post");

    // Calculate Averages for Bar Chart
    const getAvg = (list, qKey) => {
      if (!list.length) return 0;
      const sum = list.reduce((acc, curr) => acc + (curr.answers[qKey] || 0), 0);
      return (sum / list.length).toFixed(1);
    };

    const preScores = [
      getAvg(preSurveys, "q_tech"),
      getAvg(preSurveys, "q_design"),
      getAvg(preSurveys, "q_finance"),
      getAvg(preSurveys, "q_speaking")
    ];

    const postScores = [
      getAvg(postSurveys, "q_tech"),
      getAvg(postSurveys, "q_design"),
      getAvg(postSurveys, "q_finance"),
      getAvg(postSurveys, "q_speaking")
    ];

    const interestAreas = ["Programming and Web", "Graphic Design", "Financial Literacy", "Public Speaking", "Entrepreneurship"];
    const legacyInterestMap = {
      "Technology": ["Programming and Web"], "AI & Data": ["Programming and Web"],
      "Art & Design": ["Graphic Design"], "Business": ["Financial Literacy", "Entrepreneurship"],
      "Leadership": ["Public Speaking", "Entrepreneurship"]
    };
    const interestCounts = interestAreas.map(area => rawSurveys.reduce((count, survey) => {
      const normalized = (Array.isArray(survey.interests) ? survey.interests : []).flatMap((interest) => legacyInterestMap[interest] || [interest]);
      return count + (normalized.includes(area) ? 1 : 0);
    }, 0));

    // Render Pie Chart (Interest Distribution)
    if (typeof Chart !== "undefined") {
      if (this.pieChartInstance) this.pieChartInstance.destroy();
      this.pieChartInstance = new Chart(pieCanvas, {
        type: "pie",
        data: {
          labels: ["Web Dev", "Visual Design", "Finance", "Public Speaking", "Entrepreneurship"],
          datasets: [{
            data: interestCounts,
            backgroundColor: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6"],
            borderWidth: 2,
            borderColor: "#1E1B4B"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          accessibility: { description: "Aggregate interest selections from submitted surveys." }
        }
      });

      // Render Bar Chart (Pre vs Post Confidence)
      if (this.barChartInstance) this.barChartInstance.destroy();
      this.barChartInstance = new Chart(barCanvas, {
        type: "bar",
        data: {
          labels: ["Tech Curiosity", "Design Conf.", "Money Mgmt", "Public Speaking"],
          datasets: [
            {
              label: "Pre-Workshop",
              data: preScores,
              backgroundColor: "#CBD5E1",
              borderColor: "#1E1B4B",
              borderWidth: 2
            },
            {
              label: "Post-Workshop",
              data: postScores,
              backgroundColor: "#10B981",
              borderColor: "#1E1B4B",
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 5, ticks: { stepSize: 1 } }
          },
          plugins: { legend: { position: "bottom" } },
          accessibility: { description: "Aggregate pre- and post-survey confidence scores on a scale from zero to five." }
        }
      });
    } else {
      console.warn("Chart.js CDN not loaded. Rendering fallback HTML.");
      pieCanvas.parentElement.innerHTML = `<p class="text-sm text-muted">Chart visualization available when online.</p>`;
    }
  },

  /* ==========================================================================
     MODAL HELPERS & EVENT LISTENERS
     ========================================================================== */
  setupEventListeners() {
    document.getElementById("btn-trigger-demo-pre")?.addEventListener("click", () => this.openSurveyModal("pre"));
    document.getElementById("btn-trigger-demo-post")?.addEventListener("click", () => this.openSurveyModal("post"));
    document.getElementById("btn-print-certificate-demo")?.addEventListener("click", () => this.openCertificateModal());
  },

  showModal(title, bodyHtml) {
    let overlay = document.getElementById("certificate-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "certificate-modal-overlay";
      overlay.className = "planner-modal-overlay";
      overlay.innerHTML = `
        <div class="planner-modal-card">
          <div class="modal-header">
            <h3 id="cert-modal-title"></h3>
            <button class="close-btn" id="cert-modal-close">&times;</button>
          </div>
          <div class="modal-body" id="cert-modal-body"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector("#cert-modal-close").addEventListener("click", () => this.closeModal());
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }

    document.getElementById("cert-modal-title").textContent = title;
    document.getElementById("cert-modal-body").innerHTML = bodyHtml;
    overlay.classList.remove("hidden");
  },

  closeModal() {
    const overlay = document.getElementById("certificate-modal-overlay");
    if (overlay) overlay.classList.add("hidden");
  }
};

// Initialize module when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.SurveysAndBadges.init();
});
