/**
 * Big Minds 2.0 — Surveys, Curiosity Badges & Analytics Engine
 * Manages child-safe/student pre & post surveys, curiosity badges,
 * printable certificates, Chart.js visual analytics, and Firebase synchronization.
 */

(function (window) {
  'use strict';

  const SESSION_KEY = 'bigminds_student_session';
  const SURVEY_STORAGE_KEY = 'bigminds_survey_responses_v1';

  const BADGES = [
    { id: 'web-architect', title: 'Web Architect', icon: '🌐', desc: 'Explored web development & digital architecture', area: 'Programming and Web' },
    { id: 'design-innovator', title: 'Design Innovator', icon: '🎨', desc: 'Mastered visual branding & interface design', area: 'Graphic Design' },
    { id: 'money-smart', title: 'Money Smart', icon: '💰', desc: 'Crafted student budgets & analyzed unit economics', area: 'Financial Literacy' },
    { id: 'public-speaker', title: 'Public Speaker', icon: '🎤', desc: 'Structured elevator pitches & interview responses', area: 'Public Speaking' },
    { id: 'future-entrepreneur', title: 'Future Entrepreneur', icon: '🚀', desc: 'Validated problems & scoped a lean MVP', area: 'Entrepreneurship' },
    { id: 'curiosity-pioneer', title: 'Curiosity Pioneer', icon: '✨', desc: 'Completed the Curiosity Discovery Quiz', area: 'All' },
    { id: 'pathway-master', title: 'Pathway Master', icon: '🏆', desc: 'Explored pathways across all 5 mentorship areas', area: 'All' }
  ];

  const CORE_SURVEY_QUESTIONS = [
    { id: 'q_tech', area: 'Programming and Web', text: 'How confident do you feel writing code, building web pages, or understanding how software works?' },
    { id: 'q_design', area: 'Graphic Design', text: 'How confident do you feel creating visual layouts, branding, or digital graphic designs?' },
    { id: 'q_finance', area: 'Financial Literacy', text: 'How confident do you feel creating a realistic student budget, saving, and managing money?' },
    { id: 'q_speaking', area: 'Public Speaking', text: 'How confident do you feel speaking in front of an audience or presenting an idea persuasively?' },
    { id: 'q_enterprise', area: 'Entrepreneurship', text: 'How confident do you feel identifying a real problem and developing a business or service solution?' }
  ];

  window.SurveysAndBadges = {
    BADGES,
    SURVEY_QUESTIONS: CORE_SURVEY_QUESTIONS,
    pieChartInstance: null,
    barChartInstance: null,

    init() {
      this.ensureStudentSession();
      this.setupEventListeners();
      this.renderAnalyticsCharts();
    },

    /* ==========================================================================
       STUDENT SESSION & IDENTITY
       ========================================================================== */
    ensureStudentSession() {
      let session;
      try {
        session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      } catch (err) {
        session = null;
      }

      if (!session || typeof session !== 'object') {
        const partId = 'bm_part_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
        session = {
          participantId: partId,
          displayName: '',
          alias: '',
          selectedCurrency: window.CurrencyHelper ? window.CurrencyHelper.getPreferredCurrency() : 'NGN',
          activeInterests: [],
          exploredIds: [],
          unlockedBadges: [],
          createdDate: new Date().toISOString()
        };
      }

      if (!session.participantId) {
        session.participantId = 'bm_part_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
      }
      if (!Array.isArray(session.unlockedBadges)) session.unlockedBadges = [];
      if (!Array.isArray(session.exploredIds)) session.exploredIds = [];
      if (!Array.isArray(session.activeInterests)) session.activeInterests = [];

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },

    getStudentData() {
      const student = JSON.parse(localStorage.getItem(SESSION_KEY)) || this.ensureStudentSession();
      if (!Array.isArray(student.unlockedBadges)) student.unlockedBadges = [];
      return student;
    },

    saveStudentData(student) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(student));
      window.dispatchEvent(new CustomEvent('bigminds:sessionUpdated', { detail: student }));
      if (window.FirebaseSync && typeof window.FirebaseSync.saveParticipant === 'function') {
        window.FirebaseSync.saveParticipant(student).catch(() => {});
      }
    },

    unlockBadge(badgeId) {
      const student = this.getStudentData();
      if (!student.unlockedBadges.includes(badgeId)) {
        student.unlockedBadges.push(badgeId);
        this.saveStudentData(student);
        this.showBadgeNotification(badgeId);
        window.dispatchEvent(new CustomEvent('bigminds:badgeUnlocked', { detail: { badgeId } }));
      }
    },

    showBadgeNotification(badgeId) {
      const badge = BADGES.find(b => b.id === badgeId);
      if (!badge) return;

      const toast = document.createElement('div');
      toast.className = 'badge-unlock-toast';
      toast.innerHTML = `
        <span class="toast-icon">${badge.icon}</span>
        <div>
          <div class="toast-title">Badge Unlocked: ${badge.title}!</div>
          <div class="toast-desc">${badge.desc}</div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    },

    /* ==========================================================================
       PRE / POST SURVEY ENGINE
       ========================================================================== */
    openSurveyModal(type = 'pre') {
      const student = this.getStudentData();
      const isPre = type === 'pre';
      const titleText = isPre ? '📝 Pre-Programme Exploration Survey' : '🌟 Post-Programme Experience Survey';
      const studentName = student.displayName || student.alias || 'Explorer';

      // Check if already completed
      const completionKey = isPre ? 'preSurveyCompleted' : 'postSurveyCompleted';
      const existingSubmission = student[isPre ? 'preSurvey' : 'postSurvey'];

      const questionsHtml = this.SURVEY_QUESTIONS.map((q, idx) => `
        <div class="survey-card">
          <div class="survey-question">
            <span class="q-number">${idx + 1}</span>
            <div>
              <strong>${q.area}:</strong> ${q.text}
            </div>
          </div>
          <div class="emoji-rating-grid" data-question="${q.id}">
            <button type="button" class="emoji-btn" data-value="1">
              <span class="emoji">😟</span>
              <span class="label">1 - Low</span>
            </button>
            <button type="button" class="emoji-btn" data-value="2">
              <span class="emoji">😐</span>
              <span class="label">2 - Basic</span>
            </button>
            <button type="button" class="emoji-btn" data-value="3">
              <span class="emoji">🙂</span>
              <span class="label">3 - Moderate</span>
            </button>
            <button type="button" class="emoji-btn" data-value="4">
              <span class="emoji">😃</span>
              <span class="label">4 - High</span>
            </button>
            <button type="button" class="emoji-btn" data-value="5">
              <span class="emoji">🤩</span>
              <span class="label">5 - Expert</span>
            </button>
          </div>
        </div>
      `).join('');

      const qualitativePrompt = isPre
        ? 'What is your primary goal, question, or expectation as you begin exploring Big Minds?'
        : 'Which pathway or activity did you find most impactful, and what is your immediate next step?';

      const qualitativePlaceholder = isPre
        ? 'e.g., I want to understand how software works and explore whether tech or design suits me.'
        : 'e.g., The financial budgeting and elevator pitch exercises gave me real confidence for future interviews.';

      const modalHtml = `
        <div class="survey-modal-wrapper">
          <div class="survey-intro-box">
            <p class="text-sm">
              Participant: <strong>${studentName}</strong> <span class="text-muted">(${student.participantId})</span>
            </p>
            <p class="text-xs text-muted margin-top-xs">
              ${isPre
                ? 'Rate your current confidence level across the 5 mentorship areas before diving into activities. There are no right or wrong answers!'
                : 'Reflect on your growth and confidence after exploring pathway activities. Be honest about where you feel ready and what comes next!'}
            </p>
          </div>

          <form id="form-survey-questions" class="margin-top-md">
            ${questionsHtml}

            <div class="survey-card margin-top-md">
              <label class="survey-question" for="survey-qualitative-input">
                <span class="q-number">6</span>
                <strong>Reflective Feedback:</strong> ${qualitativePrompt}
              </label>
              <textarea id="survey-qualitative-input" class="survey-textarea" rows="3" placeholder="${qualitativePlaceholder}" required></textarea>
            </div>

            <div class="margin-top-md text-right flex-between-actions">
              <span id="survey-save-status" class="text-xs text-muted"></span>
              <button type="submit" id="survey-submit-btn" class="btn btn-primary">
                ${isPre ? 'Submit Pre-Survey & Begin Exploring →' : 'Submit Post-Survey & View Growth →'}
              </button>
            </div>
          </form>
        </div>
      `;

      this.showModal(titleText, modalHtml);

      // Pre-fill existing answers if reviewing
      if (existingSubmission && existingSubmission.answers) {
        Object.entries(existingSubmission.answers).forEach(([qId, val]) => {
          const btn = document.querySelector(`.emoji-rating-grid[data-question="${qId}"] .emoji-btn[data-value="${val}"]`);
          if (btn) btn.classList.add('selected');
        });
        const textInput = document.getElementById('survey-qualitative-input');
        if (textInput && existingSubmission.qualitative) {
          textInput.value = existingSubmission.qualitative;
        }
      }

      // Rating click handlers
      document.querySelectorAll('.emoji-rating-grid').forEach(grid => {
        grid.querySelectorAll('.emoji-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            grid.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          });
        });
      });

      // Submit listener
      const form = document.getElementById('form-survey-questions');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const answers = {};
        let allAnswered = true;

        this.SURVEY_QUESTIONS.forEach(q => {
          const selectedBtn = document.querySelector(`.emoji-rating-grid[data-question="${q.id}"] .emoji-btn.selected`);
          if (selectedBtn) {
            answers[q.id] = parseInt(selectedBtn.getAttribute('data-value'), 10);
          } else {
            allAnswered = false;
          }
        });

        if (!allAnswered) {
          alert('Please select a rating for all 5 mentorship areas.');
          return;
        }

        const qualitative = document.getElementById('survey-qualitative-input')?.value.trim() || '';

        const submitBtn = document.getElementById('survey-submit-btn');
        const statusText = document.getElementById('survey-save-status');
        if (submitBtn) submitBtn.disabled = true;
        if (statusText) statusText.textContent = 'Saving response...';

        this.saveSurveyResponse(type, answers, qualitative)
          .then(() => {
            if (statusText) statusText.textContent = 'Saved successfully!';
            setTimeout(() => {
              this.closeModal();
              this.renderAnalyticsCharts();
              window.dispatchEvent(new CustomEvent('bigminds:surveyCompleted', { detail: { type } }));
            }, 600);
          })
          .catch((err) => {
            console.error('Survey save error:', err);
            alert('Your survey was saved to your browser session. Cloud sync will retry automatically.');
            this.closeModal();
            this.renderAnalyticsCharts();
          });
      });
    },

    saveSurveyResponse(type, answers, qualitative = '') {
      const student = this.getStudentData();
      const isPre = type === 'pre';

      // Calculate total / average score
      const scoreValues = Object.values(answers);
      const totalScore = scoreValues.reduce((a, b) => a + b, 0);
      const avgScore = scoreValues.length ? Number((totalScore / scoreValues.length).toFixed(1)) : 0;

      const surveyRecord = {
        participantId: student.participantId,
        type: type,
        answers: answers,
        score: avgScore,
        totalScore: totalScore,
        qualitative: qualitative,
        interests: student.activeInterests || [],
        timestamp: new Date().toISOString(),
        surveyVersion: '2.0'
      };

      // 1. Update student session object
      if (isPre) {
        student.preSurvey = surveyRecord;
        student.preSurveyCompleted = true;
      } else {
        student.postSurvey = surveyRecord;
        student.postSurveyCompleted = true;
        this.unlockBadge('pathway-master');
      }
      this.saveStudentData(student);

      // 2. Append to local legacy aggregate store
      try {
        const rawSurveys = JSON.parse(localStorage.getItem(SURVEY_STORAGE_KEY) || '[]');
        rawSurveys.push(surveyRecord);
        localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(rawSurveys));
      } catch (e) {
        console.warn('Could not write to local survey collection', e);
      }

      // 3. Persist to Firebase
      if (window.FirebaseSync && typeof window.FirebaseSync.saveSurveySubmission === 'function') {
        return window.FirebaseSync.saveSurveySubmission(student.participantId, type, surveyRecord);
      }
      return Promise.resolve(surveyRecord);
    },

    /* ==========================================================================
       PRINTABLE A4 CERTIFICATE GENERATOR
       ========================================================================== */
    openCertificateModal() {
      const student = this.getStudentData();
      const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const studentName = student.displayName || student.alias || 'Explorer';

      const earnedBadges = this.BADGES.filter(b => student.unlockedBadges.includes(b.id));
      const unlockedBadgesHtml = earnedBadges.length
    ? earnedBadges.map(b => `
        <div class="badge-item badge-earned">
          <span class="badge-icon">${b.icon}</span>
          <div class="badge-title">${b.title}</div>
          <div class="badge-status">Earned</div>
        </div>
      `).join('')
    : `<p class="cert-text" style="font-style:italic;">Keep exploring pathways to earn your first badge — it'll show up here!</p>`;

      const certHtml = `
          <div id="certificate-print-area" class="certificate-container">
          <div class="certificate-header">
            <div class="cert-logo-mark">💡</div>
            <h2>Certificate of Exploration & Readiness</h2>
            <p class="cert-tagline">Big Minds — Student Pathways & Future Skills Initiative</p>
          </div>

          <div class="cert-body">
            <p class="cert-intro">This certificate is awarded to</p>
            <div class="certificate-student-name">${studentName}</div>
            <p class="cert-text">
              for actively exploring career pathways, demonstrating hands-on curiosity, and developing practical competencies across foundational digital, creative, financial, and leadership disciplines.
            </p>

            <div class="certificate-badges-row">
              ${unlockedBadgesHtml}
            </div>
          </div>

          <div class="certificate-footer-grid">
            <div class="signature-box">
              <p><strong>${dateStr}</strong></p>
              <div class="signature-line">Date Awarded</div>
            </div>
            <div class="signature-box">
              <p><strong>Big Minds Mentorship Team</strong></p>
              <div class="signature-line">Programme Direction</div>
            </div>
          </div>
        </div>

          <div class="modal-actions margin-top-md certificate-export-actions">
          <button class="btn btn-secondary"
            type="button"
            onclick="window.SurveysAndBadges.closeModal()">
            Close
          </button>

          <button class="btn btn-secondary"
            type="button"
            data-certificate-export="png"
            onclick="window.SurveysAndBadges.exportCertificate('png', this)">
            🖼️ Download PNG
          </button>

          <button class="btn btn-primary"
            type="button"
            data-certificate-export="pdf"
            onclick="window.SurveysAndBadges.exportCertificate('pdf', this)">
            📄 Download PDF
          </button>

          <button class="btn btn-outline"
            type="button"
            onclick="window.print()">
            🖨️ Print
          </button>

          <p id="certificate-export-status"
             class="certificate-export-status"
             role="status"
             aria-live="polite">
          </p>
        </div>
      `;

      this.showModal('📜 Explorer Certificate', certHtml);
    },

        /* ==========================================================================
       CERTIFICATE EXPORTS — HIGH-RESOLUTION PNG & A4 LANDSCAPE PDF
       ========================================================================== */

    getCertificateFileBaseName() {
      const student = this.getStudentData();
      const rawName = student.displayName || student.alias || 'Explorer';

      const safeName = String(rawName)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '') || 'Explorer';

      const now = new Date();
      const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');

      return `BigMinds_Certificate_${safeName}_${datePart}`;
    },

    downloadCertificateBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    },

    async renderCertificateCanvas() {
      const certificate = document.getElementById('certificate-print-area');

      if (!certificate) {
        throw new Error('Certificate preview not found.');
      }

      if (typeof window.html2canvas !== 'function') {
        throw new Error('Image export library has not loaded.');
      }

      // Wait for fonts to finish loading before rendering.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      return window.html2canvas(certificate, {
        scale: 3,
        backgroundColor: '#FFFDF9',
        useCORS: true,
        allowTaint: false,
        logging: false,
        windowWidth: 1024,
        imageTimeout: 15000,

        // Prepare the modal's certificate container for a full-width export.
        // This affects only the cloned export document, not the actual preview.
        onclone: (clonedDocument) => {
          const overlay = clonedDocument.getElementById(
            'certificate-modal-overlay'
          );

          const card = overlay?.querySelector('.planner-modal-card');

          const body = clonedDocument.getElementById('cert-modal-body');

          const clonedCertificate = clonedDocument.getElementById(
            'certificate-print-area'
          );

          if (overlay) {
            overlay.style.setProperty('display', 'block', 'important');
            overlay.style.position = 'static';
            overlay.style.width = '1000px';
            overlay.style.height = 'auto';
            overlay.style.padding = '0';
            overlay.style.margin = '0 auto';
            overlay.style.overflow = 'visible';
            overlay.style.background = 'transparent';
          }

          if (card) {
            card.style.width = '1000px';
            card.style.maxWidth = '1000px';
            card.style.maxHeight = 'none';
            card.style.padding = '0';
            card.style.margin = '0 auto';
            card.style.border = '0';
            card.style.borderRadius = '0';
            card.style.boxShadow = 'none';
            card.style.overflow = 'visible';
            card.style.background = 'transparent';
          }

          if (body) {
            body.style.width = '100%';
            body.style.maxHeight = 'none';
            body.style.padding = '0';
            body.style.margin = '0';
            body.style.overflow = 'visible';
          }

          if (clonedCertificate) {
            clonedCertificate.style.width = '960px';
            clonedCertificate.style.maxWidth = '960px';
            clonedCertificate.style.margin = '0 auto';
            clonedCertificate.style.boxShadow = 'none';
            clonedCertificate.style.overflow = 'visible';
          }
        }
      });
    },

    async exportCertificate(format, triggerButton) {
      const exportFormat = String(format || 'pdf').toLowerCase();

      if (!['pdf', 'png'].includes(exportFormat)) {
        return;
      }

      const status = document.getElementById(
        'certificate-export-status'
      );

      const exportButtons = document.querySelectorAll(
        '[data-certificate-export]'
      );

      const originalLabel = triggerButton
        ? triggerButton.innerHTML
        : '';

      // Prevent multiple simultaneous exports.
      exportButtons.forEach(button => {
        button.disabled = true;
      });

      if (triggerButton) {
        triggerButton.textContent =
          exportFormat === 'pdf'
            ? 'Preparing PDF...'
            : 'Preparing PNG...';
      }

      if (status) {
        status.textContent = 'Preparing your certificate...';
      }

      try {
        if (
          exportFormat === 'pdf' &&
          !(window.jspdf && window.jspdf.jsPDF)
        ) {
          throw new Error('PDF export library has not loaded.');
        }

        // Both formats use the same high-resolution certificate image.
        const canvas = await this.renderCertificateCanvas();

        const filename = this.getCertificateFileBaseName();

        if (exportFormat === 'png') {
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          });

          if (!blob) {
            throw new Error('Could not generate PNG file.');
          }

          this.downloadCertificateBlob(
            blob,
            `${filename}.png`
          );
        }

        if (exportFormat === 'pdf') {
          const jsPDF = window.jspdf.jsPDF;

          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const margin = 12;

          // Maintain the original certificate proportions.
          const scale = Math.min(
            (pageWidth - margin * 2) / canvas.width,
            (pageHeight - margin * 2) / canvas.height
          );

          const imageWidth = canvas.width * scale;
          const imageHeight = canvas.height * scale;

          const x = (pageWidth - imageWidth) / 2;
          const y = (pageHeight - imageHeight) / 2;

          pdf.setProperties({
            title: `Big Minds Certificate - ${this.getStudentData().displayName || 'Explorer'}`,
            subject: 'Certificate of Exploration & Readiness',
            author: 'Big Minds',
            creator: 'Big Minds Student Pathways Platform'
          });

          pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            x,
            y,
            imageWidth,
            imageHeight,
            undefined,
            'FAST'
          );

          pdf.save(`${filename}.pdf`);
        }

        if (status) {
          status.textContent =
            `Your ${exportFormat.toUpperCase()} certificate has been downloaded.`;
        }

      } catch (error) {
        console.error(
          '[Big Minds] Certificate export failed:',
          error
        );

        if (status) {
          status.textContent =
            'Export failed. Please check your connection or use Print.';
        }

      } finally {
        exportButtons.forEach(button => {
          button.disabled = false;
        });

        if (triggerButton) {
          triggerButton.innerHTML = originalLabel;
        }
      }
    },

    /* ==========================================================================
       ANALYTICS CHARTS DASHBOARD (CHART.JS & NATIVE FALLBACK)
       ========================================================================== */
    renderAnalyticsCharts() {
      const pieCanvas = document.getElementById('surveyPieChart');
      const barCanvas = document.getElementById('surveyBarChart');
      if (!pieCanvas || !barCanvas) return;

      const rawSurveys = JSON.parse(localStorage.getItem(SURVEY_STORAGE_KEY) || '[]');
      const preSurveys = rawSurveys.filter(s => s.type === 'pre');
      const postSurveys = rawSurveys.filter(s => s.type === 'post');

      const getAvg = (list, qKey) => {
        if (!list.length) return 0;
        const valid = list.filter(item => item.answers && item.answers[qKey] !== undefined);
        if (!valid.length) return 0;
        const sum = valid.reduce((acc, curr) => acc + (Number(curr.answers[qKey]) || 0), 0);
        return Number((sum / valid.length).toFixed(1));
      };

      const areas = [
        { key: 'q_tech', label: 'Programming & Web', match: ['Programming & Web', 'Programming and Web'] },
        { key: 'q_design', label: 'Graphic Design', match: ['Graphic Design'] },
        { key: 'q_finance', label: 'Financial Literacy', match: ['Financial Literacy'] },
        { key: 'q_speaking', label: 'Public Speaking', match: ['Public Speaking'] },
        { key: 'q_enterprise', label: 'Entrepreneurship', match: ['Entrepreneurship'] }
      ];

      const preScores = areas.map(a => getAvg(preSurveys, a.key));
      const postScores = areas.map(a => getAvg(postSurveys, a.key));

      // Calculate interest distribution
      const interestDistribution = areas.map(a => {
        return rawSurveys.reduce((acc, s) => {
          const list = Array.isArray(s.interests) ? s.interests : [];
          return acc + (a.match.some(m => list.includes(m)) ? 1 : 0);
        }, 0);
      });

      // Chart.js rendering
      if (typeof Chart !== 'undefined') {
        // Pie Chart
        if (this.pieChartInstance) this.pieChartInstance.destroy();
        this.pieChartInstance = new Chart(pieCanvas, {
          type: 'doughnut',
          data: {
            labels: areas.map(a => a.label),
            datasets: [{
              data: interestDistribution.some(v => v > 0) ? interestDistribution : [1, 1, 1, 1, 1],
              backgroundColor: ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'],
              borderColor: '#1E1B4B',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: 'bold' } } }
            }
          }
        });

        // Bar Chart
        if (this.barChartInstance) this.barChartInstance.destroy();
        this.barChartInstance = new Chart(barCanvas, {
          type: 'bar',
          data: {
            labels: areas.map(a => a.label),
            datasets: [
              {
                label: 'Pre-Programme Confidence',
                data: preScores,
                backgroundColor: '#CBD5E1',
                borderColor: '#1E1B4B',
                borderWidth: 2
              },
              {
                label: 'Post-Programme Confidence',
                data: postScores,
                backgroundColor: '#10B981',
                borderColor: '#1E1B4B',
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
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: 'bold' } } }
            }
          }
        });
      } else {
        // Native accessible fallback
        this.renderNativeChartFallback(pieCanvas, barCanvas, areas, preScores, postScores);
      }
    },

    renderNativeChartFallback(pieCanvas, barCanvas, areas, preScores, postScores) {
      if (pieCanvas && pieCanvas.parentElement) {
        pieCanvas.parentElement.innerHTML = `
          <div class="native-chart-fallback">
            <p class="text-xs text-muted mb-2">Participant Interest Distribution:</p>
            <ul class="text-xs space-y-1">
              ${areas.map(a => `<li><strong>${a.label}:</strong> Active pathway</li>`).join('')}
            </ul>
          </div>
        `;
      }
      if (barCanvas && barCanvas.parentElement) {
        barCanvas.parentElement.innerHTML = `
          <div class="native-chart-fallback">
            <p class="text-xs text-muted mb-2">Baseline vs Final Confidence (1 to 5 scale):</p>
            <div class="space-y-2">
              ${areas.map((a, i) => `
                <div class="text-xs">
                  <div class="flex justify-between">
                    <span>${a.label}</span>
                    <span>Pre: ${preScores[i]} / Post: ${postScores[i]}</span>
                  </div>
                  <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-0.5">
                    <div class="bg-emerald-500 h-full" style="width: ${(postScores[i] / 5) * 100}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    },

    /* ==========================================================================
       MODAL CONTROLS
       ========================================================================== */
    setupEventListeners() {
      document.getElementById('btn-trigger-demo-pre')?.addEventListener('click', () => this.openSurveyModal('pre'));
      document.getElementById('btn-trigger-demo-post')?.addEventListener('click', () => this.openSurveyModal('post'));
      document.getElementById('btn-print-certificate-demo')?.addEventListener('click', () => this.openCertificateModal());
    },

    showModal(title, bodyHtml) {
      let overlay = document.getElementById('certificate-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'certificate-modal-overlay';
        overlay.className = 'planner-modal-overlay';
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

        overlay.querySelector('#cert-modal-close').addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.closeModal();
        });
      }

      document.getElementById('cert-modal-title').textContent = title;
      document.getElementById('cert-modal-body').innerHTML = bodyHtml;
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';
    },

    closeModal() {
      const overlay = document.getElementById('certificate-modal-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.SurveysAndBadges.init();
  });
})(window);
