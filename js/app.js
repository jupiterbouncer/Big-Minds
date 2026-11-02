/**
 * Big Minds 2.0 — Main Application Controller (BigMindsApp)
 * Senior Secondary Student Experience:
 * - Onboarding & unique participant identity
 * - 2D Interactive Pathway Canvas
 * - Real-world mature micro-activity sandboxes across the 5 mentorship areas
 * - Curiosity Quiz modal & results recommendation
 * - Multi-currency budgeting & financial literacy
 * - Pre/Post survey triggers and milestone dashboard
 */

class BigMindsApp {
  constructor() {
    this.storageKey = 'bigminds_student_session';

    // Core State
    this.state = {
      participantId: '',
      displayName: '',
      alias: '',
      selectedCurrency: 'NGN',
      activeInterests: [],
      exploredIds: [],
      selectedNodeId: null,
      unlockedBadges: [],
      avatarOutfit: '💻',
      avatarVibe: '⭐',
      preSurveyCompleted: false,
      postSurveyCompleted: false
    };

    // Load saved session or initialize default
    this.loadState();

    // Initialize Canvas Engine
    this.canvasEngine = new PathwayCanvasEngine(
      'canvasViewport',
      'canvasTransform',
      'svgCanvas',
      'nodesContainer'
    );

    // Cache DOM Elements
    this.cacheDom();

    // Event Listeners & Boot
    this.initEventListeners();
    this.renderHeaderIdentity();
    this.renderInterestBadges();
    this.renderCuriosityBadges();
    this.updateProgress();
    this.refreshCanvas();
    this.checkOnboarding();

    // Check if arriving back from standalone quiz page
    if (window.location.search.includes('fromQuiz=true')) {
      setTimeout(() => {
        this.showToast('✨ Curiosities loaded from your quiz! Check out your matched pathways!');
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 400);
    }
  }

  cacheDom() {
    this.dom = {
      // Header
      studentGreeting: document.getElementById('studentGreeting'),
      participantIdBadge: document.getElementById('participantIdBadge'),
      currencyContainer: document.getElementById('currencySelectorContainer'),
      newSessionBtn: document.getElementById('newSessionBtn'),
      btnOpenPreSurvey: document.getElementById('btnOpenPreSurvey'),
      btnOpenPostSurvey: document.getElementById('btnOpenPostSurvey'),
      btnOpenCertificate: document.getElementById('btnOpenCertificate'),

      // Controls
      interestBadges: document.getElementById('interestBadges'),
      curiosityBadges: document.getElementById('curiosityBadges'),
      exploredCount: document.getElementById('exploredCount'),
      totalNodesCount: document.getElementById('totalNodesCount'),
      progressPercent: document.getElementById('progressPercent'),
      progressBar: document.getElementById('progressBar'),

      // Drawer
      drawer: document.getElementById('nodeDrawer'),
      drawerBackdrop: document.getElementById('drawerBackdrop'),
      closeDrawerBtn: document.getElementById('closeDrawerBtn'),
      drawerTitle: document.getElementById('drawerTitle'),
      drawerDesc: document.getElementById('drawerDesc'),
      drawerTags: document.getElementById('drawerTags'),
      drawerExploreText: document.getElementById('drawerExploreText'),
      drawerWhyItMatters: document.getElementById('drawerWhyItMatters'),
      drawerSkills: document.getElementById('drawerSkills'),
      drawerRealWorld: document.getElementById('drawerRealWorld'),
      drawerNextStep: document.getElementById('drawerNextStep'),
      activityTitle: document.getElementById('activityTitle'),
      activityDesc: document.getElementById('activityDesc'),
      activitySandbox: document.getElementById('activitySandbox'),
      toggleExploredBtn: document.getElementById('toggleExploredBtn'),
      archetypeContainer: document.getElementById('archetypeContainer'),

      // Quiz Modal
      quizModal: document.getElementById('quizModal'),
      takeQuizBtn: document.getElementById('takeQuizBtn'),
      mobileQuizBtn: document.getElementById('mobileQuizBtn'),
      closeQuizBtn: document.getElementById('closeQuizBtn'),
      quizBody: document.getElementById('quizBody'),
      submitQuizBtn: document.getElementById('submitQuizBtn'),

      // Canvas Controls
      zoomInBtn: document.getElementById('zoomInBtn'),
      zoomOutBtn: document.getElementById('zoomOutBtn'),
      resetViewBtn: document.getElementById('resetViewBtn'),
      clearStateBtn: document.getElementById('clearStateBtn')
    };
  }

  /* ─────────────────────────────────────────────────────────────
     STATE & PERSISTENCE
  ───────────────────────────────────────────────────────────── */
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Unable to load session from localStorage', e);
    }

    if (!this.state.participantId) {
      this.state.participantId = 'bm_part_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }
    if (!this.state.selectedCurrency) {
      this.state.selectedCurrency = window.CurrencyHelper ? window.CurrencyHelper.getPreferredCurrency() : 'NGN';
    }
    if (!Array.isArray(this.state.unlockedBadges)) this.state.unlockedBadges = [];
    if (!Array.isArray(this.state.exploredIds)) this.state.exploredIds = [];
    if (!Array.isArray(this.state.activeInterests)) this.state.activeInterests = [];
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Unable to save state to localStorage', e);
    }

    // Sync to Firebase RTDB
    if (window.FirebaseSync && typeof window.FirebaseSync.saveParticipant === 'function') {
      window.FirebaseSync.saveParticipant({
        participantId: this.state.participantId,
        displayName: this.state.displayName || this.state.alias || 'Explorer',
        selectedCurrency: this.state.selectedCurrency,
        sessionStatus: 'active'
      }).catch(() => {});
    }

    if (window.FirebaseSync && typeof window.FirebaseSync.savePathwayProgress === 'function') {
      window.FirebaseSync.savePathwayProgress(this.state.participantId, {
        exploredNodes: this.state.exploredIds,
        completedActivities: this.state.exploredIds,
        unlockedBadges: this.state.unlockedBadges
      }).catch(() => {});
    }
  }

  /* ─────────────────────────────────────────────────────────────
     ONBOARDING MODAL & IDENTITY
  ───────────────────────────────────────────────────────────── */
  checkOnboarding() {
    if (!this.state.displayName) {
      this.openOnboardingModal();
    }
  }

  openOnboardingModal() {
    let overlay = document.getElementById('onboardingModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'onboardingModalOverlay';
      overlay.className = 'planner-modal-overlay';
      overlay.innerHTML = `
        <div class="planner-modal-card max-w-md">
          <div class="modal-header">
            <div class="flex items-center gap-2">
              <span class="text-2xl">💡</span>
              <h3 class="text-xl font-black text-slate-900">Welcome to Big Minds</h3>
            </div>
          </div>
          <div class="modal-body p-5">
            <p class="text-sm text-slate-700 font-bold mb-3">
              Discover your interests. Explore your possibilities. Build your next step.
            </p>
            <p class="text-xs text-slate-500 mb-4 leading-relaxed">
              Explore career pathways, try real hands-on challenges, and discover skills you can start developing today. What should we call you?
            </p>

            <form id="onboardingForm" class="space-y-4">
              <div>
                <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5" for="onboardingNameInput">
                  Your Preferred / Display Name:
                </label>
                <input
                  type="text"
                  id="onboardingNameInput"
                  class="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[2px_2px_0px_#0F172A]"
                  placeholder="e.g. Subair, Amara, Tobi"
                  required
                  autofocus
                />
              </div>

              <div>
                <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5" for="onboardingCurrencySelect">
                  Your Currency Preference (For Financial Activities):
                </label>
                <div id="onboardingCurrencyWrap"></div>
              </div>

              <div class="pt-2 text-right">
                <button type="submit" class="w-full py-3.5 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-900 shadow-[3px_3px_0px_#0F172A] active:translate-x-0.5 active:translate-y-0.5 transition-all">
                  Begin Exploring →
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Render currency dropdown inside modal
      if (window.CurrencyHelper) {
        window.CurrencyHelper.renderSelector('onboardingCurrencyWrap', {
          className: 'w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold bg-white',
          selected: this.state.selectedCurrency
        });
      }

      const form = document.getElementById('onboardingForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('onboardingNameInput');
        const name = input ? input.value.trim() : '';
        if (!name) return;

        this.state.displayName = name;
        this.state.alias = name;
        if (window.CurrencyHelper) {
          this.state.selectedCurrency = window.CurrencyHelper.getPreferredCurrency();
        }
        this.saveState();
        overlay.classList.add('hidden');
        this.renderHeaderIdentity();
        this.showToast(`🎉 Welcome to Big Minds, ${name}!`);

        // Prompt pre-survey if not yet done
        setTimeout(() => {
          if (!this.state.preSurveyCompleted && window.SurveysAndBadges) {
            window.SurveysAndBadges.openSurveyModal('pre');
          }
        }, 800);
      });
    }

    overlay.classList.remove('hidden');
  }

  renderHeaderIdentity() {
    const name = this.state.displayName || this.state.alias || 'Explorer';
    if (this.dom.studentGreeting) {
      this.dom.studentGreeting.textContent = `Welcome, ${name}!`;
    }
    if (this.dom.participantIdBadge) {
      this.dom.participantIdBadge.textContent = this.state.participantId;
      this.dom.participantIdBadge.title = `Your unique anonymous session ID: ${this.state.participantId}`;
    }

    // Render currency selector
    if (this.dom.currencyContainer && window.CurrencyHelper) {
      window.CurrencyHelper.renderSelector('currencySelectorContainer', {
        className: 'px-2 py-1 text-xs font-bold rounded-lg border border-slate-900 bg-white shadow-xs',
        selected: this.state.selectedCurrency,
        onChange: (code) => {
          this.state.selectedCurrency = code;
          this.saveState();
          this.showToast(`Currency updated to ${code}`);
          if (this.state.selectedNodeId) {
            const node = PATHWAY_NODES.find(n => n.id === this.state.selectedNodeId);
            if (node) this.renderActivitySandbox(node.activity);
          }
        }
      });
    }

    // Survey badges status
    if (this.dom.btnOpenPreSurvey) {
      this.dom.btnOpenPreSurvey.innerHTML = this.state.preSurveyCompleted
        ? '✓ Pre-Survey Done'
        : '📝 Take Pre-Survey';
      if (this.state.preSurveyCompleted) {
        this.dom.btnOpenPreSurvey.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-500');
      }
    }
    if (this.dom.btnOpenPostSurvey) {
      this.dom.btnOpenPostSurvey.innerHTML = this.state.postSurveyCompleted
        ? '✓ Post-Survey Done'
        : '🌟 Post-Survey';
      if (this.state.postSurveyCompleted) {
        this.dom.btnOpenPostSurvey.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-500');
      }
    }
  }

  startNewParticipantSession() {
    const confirmed = window.confirm(
      'Start a new participant exploration session?\n\nThis creates a fresh participant session without deleting past submissions from the database.'
    );
    if (!confirmed) return;

    const newPartId = 'bm_part_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    this.state = {
      participantId: newPartId,
      displayName: '',
      alias: '',
      selectedCurrency: window.CurrencyHelper ? window.CurrencyHelper.getPreferredCurrency() : 'NGN',
      activeInterests: [],
      exploredIds: [],
      selectedNodeId: null,
      unlockedBadges: [],
      avatarOutfit: '💻',
      avatarVibe: '⭐',
      preSurveyCompleted: false,
      postSurveyCompleted: false
    };

    this.saveState();
    this.closeDrawer();
    this.renderHeaderIdentity();
    this.renderInterestBadges();
    this.renderCuriosityBadges();
    this.updateProgress();
    this.canvasEngine.resetView();
    this.refreshCanvas();
    this.openOnboardingModal();
  }

  /* ─────────────────────────────────────────────────────────────
     UI EVENT LISTENERS
  ───────────────────────────────────────────────────────────── */
  initEventListeners() {
    // Drawer handlers
    this.dom.closeDrawerBtn?.addEventListener('click', () => this.closeDrawer());
    this.dom.drawerBackdrop?.addEventListener('click', () => this.closeDrawer());
    this.dom.toggleExploredBtn?.addEventListener('click', () => this.toggleCurrentNodeExplored());

    // Header actions
    this.dom.newSessionBtn?.addEventListener('click', () => this.startNewParticipantSession());
    this.dom.btnOpenPreSurvey?.addEventListener('click', () => {
      if (window.SurveysAndBadges) window.SurveysAndBadges.openSurveyModal('pre');
    });
    this.dom.btnOpenPostSurvey?.addEventListener('click', () => {
      if (window.SurveysAndBadges) window.SurveysAndBadges.openSurveyModal('post');
    });
    this.dom.btnOpenCertificate?.addEventListener('click', () => {
      if (window.SurveysAndBadges) window.SurveysAndBadges.openCertificateModal();
    });

    // Zoom & Canvas Controls
    this.dom.zoomInBtn?.addEventListener('click', () => this.canvasEngine.zoomIn());
    this.dom.zoomOutBtn?.addEventListener('click', () => this.canvasEngine.zoomOut());
    this.dom.resetViewBtn?.addEventListener('click', () => this.canvasEngine.resetView());
    this.dom.clearStateBtn?.addEventListener('click', () => this.startNewParticipantSession());

    // Quiz Open / Close
    this.dom.takeQuizBtn?.addEventListener('click', (e) => {
      if (!this.dom.takeQuizBtn.getAttribute('href')) {
        e.preventDefault();
        this.openQuiz();
      }
    });
    this.dom.mobileQuizBtn?.addEventListener('click', (e) => {
      if (!this.dom.mobileQuizBtn.getAttribute('href')) {
        e.preventDefault();
        this.openQuiz();
      }
    });
    this.dom.closeQuizBtn?.addEventListener('click', () => this.closeQuiz());
    this.dom.submitQuizBtn?.addEventListener('click', () => this.submitQuiz());

    // Survey event listener
    window.addEventListener('bigminds:surveyCompleted', (e) => {
      if (e.detail?.type === 'pre') this.state.preSurveyCompleted = true;
      if (e.detail?.type === 'post') this.state.postSurveyCompleted = true;
      this.saveState();
      this.renderHeaderIdentity();
      this.showToast('Survey submission successfully recorded!');
    });

    // Keyboard ESC closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDrawer();
        this.closeQuiz();
        if (window.SurveysAndBadges) window.SurveysAndBadges.closeModal();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     INTEREST FILTER BADGES
  ───────────────────────────────────────────────────────────── */
  renderInterestBadges() {
    if (!this.dom.interestBadges) return;
    this.dom.interestBadges.innerHTML = '';

    const coreAreas = [
      'Programming and Web',
      'Graphic Design',
      'Financial Literacy',
      'Public Speaking',
      'Entrepreneurship'
    ];

    coreAreas.forEach(area => {
      const conf = CATEGORY_COLORS[area] || { bg: 'bg-slate-100', text: 'text-slate-900' };
      const isSelected = this.state.activeInterests.includes(area);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `interest-badge text-xs font-black px-3 py-1.5 rounded-xl border-2 border-slate-900 transition-all select-none flex items-center gap-1.5 ${
        isSelected
          ? `${conf.bg} ${conf.text} shadow-[2px_2px_0px_#0F172A] scale-105 ring-2 ring-indigo-500`
          : 'bg-white text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#0F172A]'
      }`;

      btn.innerHTML = `
        <span>${isSelected ? '●' : '○'}</span>
        <span>${area}</span>
      `;

      btn.addEventListener('click', () => {
        this.toggleInterest(area);
      });

      this.dom.interestBadges.appendChild(btn);
    });
  }

  toggleInterest(area) {
    const idx = this.state.activeInterests.indexOf(area);
    if (idx > -1) {
      this.state.activeInterests.splice(idx, 1);
    } else {
      if (this.state.activeInterests.length >= 3) {
        this.state.activeInterests.shift();
      }
      this.state.activeInterests.push(area);
    }

    this.saveState();
    this.renderInterestBadges();
    this.refreshCanvas();
  }

  /* ─────────────────────────────────────────────────────────────
     CANVAS & PROGRESS UPDATES
  ───────────────────────────────────────────────────────────── */
  refreshCanvas() {
    this.canvasEngine.renderEdges(
      PATHWAY_NODES,
      PATHWAY_EDGES,
      this.state.activeInterests
    );

    this.canvasEngine.renderNodes(
      PATHWAY_NODES,
      this.state.activeInterests,
      this.state.exploredIds,
      this.state.selectedNodeId,
      (node) => this.openDrawer(node)
    );
  }

  updateProgress() {
    const total = PATHWAY_NODES.length;
    const explored = this.state.exploredIds.length;
    const percent = Math.round((explored / total) * 100);

    if (this.dom.exploredCount) this.dom.exploredCount.textContent = explored;
    if (this.dom.totalNodesCount) this.dom.totalNodesCount.textContent = total;
    if (this.dom.progressPercent) this.dom.progressPercent.textContent = `${percent}% Explored`;
    if (this.dom.progressBar) this.dom.progressBar.style.width = `${percent}%`;
  }

  /* ─────────────────────────────────────────────────────────────
     DRAWER: NODE DISCOVERY & CURRICULUM
  ───────────────────────────────────────────────────────────── */
  openDrawer(node) {
    this.state.selectedNodeId = node.id;
    this.refreshCanvas();

    if (this.dom.drawerTitle) this.dom.drawerTitle.textContent = node.title;
    if (this.dom.drawerDesc) this.dom.drawerDesc.textContent = node.shortDescription;

    if (this.dom.drawerTags) {
      this.dom.drawerTags.innerHTML = node.interestTags.map(tag => {
        const conf = CATEGORY_COLORS[tag] || { bg: 'bg-slate-100', text: 'text-slate-900' };
        return `<span class="text-xs font-black px-2.5 py-1 rounded-lg border-2 border-slate-900 ${conf.bg} ${conf.text} shadow-[2px_2px_0px_#0F172A]">${tag}</span>`;
      }).join('');
    }

    // Render structured curriculum sections
    if (this.dom.drawerExploreText) this.dom.drawerExploreText.textContent = node.explore || node.shortDescription;
    if (this.dom.drawerWhyItMatters) this.dom.drawerWhyItMatters.textContent = node.whyItMatters || '';
    if (this.dom.drawerSkills) this.dom.drawerSkills.textContent = node.skillsInvolved || '';
    if (this.dom.drawerRealWorld) this.dom.drawerRealWorld.textContent = node.realWorldApplications || '';
    if (this.dom.drawerNextStep) this.dom.drawerNextStep.textContent = node.nextStep || '';

    // Micro Activity
    if (this.dom.activityTitle) this.dom.activityTitle.textContent = `⚡ ${node.activity.title}`;
    if (this.dom.activityDesc) this.dom.activityDesc.textContent = node.activity.description;
    this.renderActivitySandbox(node.activity);

    // Archetype / Career direction
    this.renderArchetypeSection(node);

    // Explored Toggle Button State
    this.updateDrawerExploredBtn();

    // Slide open drawer
    if (this.dom.drawerBackdrop) {
      this.dom.drawerBackdrop.classList.remove('hidden');
      requestAnimationFrame(() => this.dom.drawerBackdrop.classList.remove('opacity-0'));
    }
    if (this.dom.drawer) {
      this.dom.drawer.classList.remove('translate-x-full');
    }
  }

  closeDrawer() {
    this.state.selectedNodeId = null;
    this.refreshCanvas();

    if (this.dom.drawerBackdrop) {
      this.dom.drawerBackdrop.classList.add('opacity-0');
      setTimeout(() => this.dom.drawerBackdrop?.classList.add('hidden'), 300);
    }
    if (this.dom.drawer) {
      this.dom.drawer.classList.add('translate-x-full');
    }
  }

  toggleCurrentNodeExplored() {
    const id = this.state.selectedNodeId;
    if (!id) return;

    const idx = this.state.exploredIds.indexOf(id);
    if (idx > -1) {
      this.state.exploredIds.splice(idx, 1);
    } else {
      this.state.exploredIds.push(id);
      this.unlockBadgesForNode(id);
      this.showToast('🎉 Excellent! Pathway marked as explored!');
    }

    this.saveState();
    this.updateProgress();
    this.renderCuriosityBadges();
    this.updateDrawerExploredBtn();
    this.refreshCanvas();
  }

  unlockBadgesForNode(nodeId) {
    const map = {
      'web-foundations': 'web-architect',
      'software-logic': 'web-architect',
      'brand-identity': 'design-innovator',
      'ui-ux-design': 'design-innovator',
      'student-budgeting': 'money-smart',
      'venture-economics': 'money-smart',
      'persuasive-speaking': 'public-speaker',
      'professional-comm': 'public-speaker',
      'problem-discovery': 'future-entrepreneur',
      'mvp-creation': 'future-entrepreneur'
    };
    const badgeId = map[nodeId];
    if (badgeId && window.SurveysAndBadges) {
      window.SurveysAndBadges.unlockBadge(badgeId);
    }
  }

  renderCuriosityBadges() {
    if (!this.dom.curiosityBadges) return;
    const badges = window.SurveysAndBadges ? window.SurveysAndBadges.BADGES : [];
    this.dom.curiosityBadges.innerHTML = badges.map(badge => {
      const earned = this.state.unlockedBadges.includes(badge.id);
      return `
        <span class="text-[10px] font-black px-2 py-1 rounded-lg border ${
          earned ? 'bg-emerald-100 text-emerald-900 border-emerald-500' : 'bg-slate-100 text-slate-400 border-slate-300'
        }" title="${earned ? `Earned: ${badge.desc}` : `Locked: ${badge.desc}`}">
          ${earned ? badge.icon : '🔒'} ${badge.title}
        </span>
      `;
    }).join('');
  }

  updateDrawerExploredBtn() {
    if (!this.dom.toggleExploredBtn) return;
    const isExplored = this.state.exploredIds.includes(this.state.selectedNodeId);

    if (isExplored) {
      this.dom.toggleExploredBtn.textContent = '✓ Explored (Tap to Undo)';
      this.dom.toggleExploredBtn.className = 'w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all border-2 border-slate-900 bg-emerald-400 hover:bg-emerald-500 text-slate-900 shadow-[3px_3px_0px_#0F172A]';
    } else {
      this.dom.toggleExploredBtn.textContent = '🌟 Mark as Explored';
      this.dom.toggleExploredBtn.className = 'w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all border-2 border-slate-900 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[3px_3px_0px_#0F172A]';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     CAREER SIMULATION & ROLE MODELS
  ───────────────────────────────────────────────────────────── */
  renderArchetypeSection(node) {
    if (!this.dom.archetypeContainer) return;
    const arch = node.archetype;
    if (!arch) {
      this.dom.archetypeContainer.innerHTML = '';
      return;
    }

    this.dom.archetypeContainer.innerHTML = `
      <div class="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-gradient-to-br from-amber-50 via-indigo-50 to-purple-50 p-4 shadow-[4px_4px_0px_#0F172A] mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-3 py-0.5 rounded-full shadow-xs">
            🚀 Career Direction & Possibilities
          </span>
        </div>

        <h4 class="text-base font-black text-slate-900 mb-1 leading-snug">
          ${arch.title}
        </h4>

        <p class="text-xs text-slate-700 font-medium leading-relaxed mb-3">
          "${arch.story}"
        </p>

        <div class="bg-indigo-900/5 rounded-xl border border-indigo-200/80 p-3">
          <div class="text-[11px] font-black uppercase text-indigo-950 tracking-wider mb-2 flex items-center gap-1.5">
            <span>🏆 Leaders & Role Models to Follow:</span>
          </div>
          <div class="space-y-2">
            ${(arch.roleModels || []).map(rm => `
              <div class="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  ${rm.name.charAt(0)}
                </div>
                <div>
                  <div class="text-xs font-black text-slate-900">${rm.name}</div>
                  <div class="text-[11px] text-slate-600 font-medium leading-snug">${rm.detail}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     MATURE MICRO-ACTIVITY SANDBOXES
  ───────────────────────────────────────────────────────────── */
  renderActivitySandbox(activity) {
    const sandbox = this.dom.activitySandbox;
    if (!sandbox) return;

    const curr = this.state.selectedCurrency || 'NGN';
    const currSymbol = window.CurrencyHelper ? window.CurrencyHelper.getCurrencyInfo(curr).symbol : '₦';

    // 1. Interactive Code (Web Dev)
    if (activity.type === 'interactive-code') {
      sandbox.innerHTML = `
        <div class="space-y-3">
          <div class="bg-slate-900 text-emerald-400 p-2.5 rounded-xl text-xs font-mono">
            &lt;button class="btn" style="background:<span id="codeBg">#4F46E5</span>"&gt;<span id="codeText">Launch Project</span>&lt;/button&gt;
          </div>
          <div class="space-y-2">
            <div>
              <label class="text-[11px] font-bold text-slate-600">Button Label:</label>
              <input id="webTextInput" type="text" value="Launch Project" class="w-full text-xs font-bold p-1.5 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="text-[11px] font-bold text-slate-600">Accent Color:</label>
              <div class="flex gap-2">
                <button type="button" class="btn-color-pick w-7 h-7 rounded-lg border-2 border-slate-900" style="background:#4F46E5" data-color="#4F46E5"></button>
                <button type="button" class="btn-color-pick w-7 h-7 rounded-lg border-2 border-slate-900" style="background:#10B981" data-color="#10B981"></button>
                <button type="button" class="btn-color-pick w-7 h-7 rounded-lg border-2 border-slate-900" style="background:#F59E0B" data-color="#F59E0B"></button>
                <button type="button" class="btn-color-pick w-7 h-7 rounded-lg border-2 border-slate-900" style="background:#EC4899" data-color="#EC4899"></button>
              </div>
            </div>
          </div>
          <div class="p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center">
            <span class="text-[10px] text-slate-400 block mb-2 font-mono uppercase">Live DOM Output</span>
            <button id="livePreviewBtn" class="px-5 py-2.5 rounded-xl font-black text-white text-xs border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A]" style="background:#4F46E5">
              Launch Project
            </button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const input = document.getElementById('webTextInput');
        const codeText = document.getElementById('codeText');
        const codeBg = document.getElementById('codeBg');
        const liveBtn = document.getElementById('livePreviewBtn');

        input?.addEventListener('input', (e) => {
          const val = e.target.value || 'Click Me';
          if (codeText) codeText.textContent = val;
          if (liveBtn) liveBtn.textContent = val;
        });

        sandbox.querySelectorAll('.btn-color-pick').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const color = e.target.getAttribute('data-color');
            if (codeBg) codeBg.textContent = color;
            if (liveBtn) liveBtn.style.background = color;
          });
        });
      }, 50);

    // 2. Algorithm Test (Software Engineering)
    } else if (activity.type === 'algorithm-test') {
      sandbox.innerHTML = `
        <div class="space-y-2.5">
          <p class="text-xs font-bold text-slate-700">Test a transaction validation logic loop:</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-[10px] text-slate-500 font-bold">Transfer Amount:</span>
              <input id="algoAmount" type="number" value="150" class="w-full p-1.5 border border-slate-300 rounded font-mono font-bold" />
            </div>
            <div>
              <span class="text-[10px] text-slate-500 font-bold">Account Balance:</span>
              <input id="algoBalance" type="number" value="500" class="w-full p-1.5 border border-slate-300 rounded font-mono font-bold" />
            </div>
          </div>
          <button id="btnRunAlgo" type="button" class="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-black">
            ⚡ Run Validation Loop
          </button>
          <div id="algoResult" class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            Click run to execute validation.
          </div>
        </div>
      `;

      setTimeout(() => {
        document.getElementById('btnRunAlgo')?.addEventListener('click', () => {
          const amt = Number(document.getElementById('algoAmount')?.value) || 0;
          const bal = Number(document.getElementById('algoBalance')?.value) || 0;
          const res = document.getElementById('algoResult');

          if (amt <= 0) {
            res.innerHTML = `<span class="text-rose-600 font-bold">❌ Error:</span> Transfer amount must be positive.`;
          } else if (amt > bal) {
            res.innerHTML = `<span class="text-rose-600 font-bold">❌ Error:</span> Insufficient funds. Balance (${bal}) is less than amount (${amt}).`;
          } else {
            const fee = Number((amt * 0.015).toFixed(2));
            const newBal = (bal - amt - fee).toFixed(2);
            res.innerHTML = `<span class="text-emerald-700 font-bold">✓ Approved:</span> Debited ${amt} (Fee: ${fee}). New balance: ${newBal}.`;
          }
        });
      }, 50);

    // 3. Brand Palette Mixer (Graphic Design)
    } else if (activity.type === 'brand-palette') {
      sandbox.innerHTML = `
        <div class="space-y-3">
          <p class="text-xs font-bold text-slate-700">Select a high-contrast palette for your venture:</p>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" class="btn-theme-pick p-2 rounded-xl border-2 border-slate-900 bg-white text-left text-xs font-bold" data-primary="#1E1B4B" data-accent="#F59E0B">
              <span class="block w-full h-3 rounded mb-1" style="background:#1E1B4B"></span>
              Midnight & Amber
            </button>
            <button type="button" class="btn-theme-pick p-2 rounded-xl border-2 border-slate-900 bg-white text-left text-xs font-bold" data-primary="#064E3B" data-accent="#34D399">
              <span class="block w-full h-3 rounded mb-1" style="background:#064E3B"></span>
              Deep Forest & Mint
            </button>
          </div>
          <div id="paletteDemoCard" class="p-3.5 rounded-xl border-2 border-slate-900 text-white" style="background:#1E1B4B">
            <span class="text-[10px] uppercase font-black tracking-wider text-amber-300">Brand Preview</span>
            <h4 class="text-sm font-black text-white mt-1">High-Impact Visual Contrast</h4>
            <p class="text-[11px] text-slate-200 mt-1">Meets WCAG AA accessibility contrast ratio (11.5:1).</p>
          </div>
        </div>
      `;

      setTimeout(() => {
        sandbox.querySelectorAll('.btn-theme-pick').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const card = document.getElementById('paletteDemoCard');
            const pri = e.currentTarget.getAttribute('data-primary');
            if (card) card.style.background = pri;
          });
        });
      }, 50);

    // 4. UX Wireframe Optimizer (UI/UX)
    } else if (activity.type === 'ux-wireframe') {
      sandbox.innerHTML = `
        <div class="space-y-2.5">
          <p class="text-xs font-bold text-slate-700">Arrange mobile screen elements for optimal thumb reach:</p>
          <div class="bg-slate-100 p-3 rounded-2xl border-2 border-slate-900 max-w-[200px] mx-auto text-center space-y-2">
            <div class="bg-slate-300 h-3 rounded-full w-2/3 mx-auto"></div>
            <div class="bg-white p-2 rounded-xl border border-slate-300 text-[10px] font-bold text-slate-600">
              Hero Information
            </div>
            <button id="ctaWireframe" class="w-full py-2 bg-emerald-500 text-white font-black text-[11px] rounded-xl border border-slate-900 shadow-xs">
              Primary Action Button
            </button>
          </div>
          <p class="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-bold">
            ✓ Bottom-third CTA placement ensures 95% of users can tap without hand strain.
          </p>
        </div>
      `;

    // 5. Student Monthly Budget (Financial Literacy)
    } else if (activity.type === 'student-budget') {
      sandbox.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800">Monthly Allowance / Inflow:</span>
            <span class="font-black text-indigo-700">${currSymbol} 100,000</span>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span>Essential Food & Groceries:</span>
              <strong id="valFood">${currSymbol} 40,000 (40%)</strong>
            </div>
            <input id="rngFood" type="range" min="20" max="60" value="40" class="w-full accent-indigo-600" />

            <div class="flex justify-between mt-1">
              <span>Mobile Data & Study Materials:</span>
              <strong id="valData">${currSymbol} 20,000 (20%)</strong>
            </div>
            <input id="rngData" type="range" min="10" max="40" value="20" class="w-full accent-indigo-600" />

            <div class="flex justify-between mt-1">
              <span>Savings Cushion (Emergency):</span>
              <strong id="valSave" class="text-emerald-700 font-black">${currSymbol} 40,000 (40%)</strong>
            </div>
          </div>

          <div id="budgetFeedback" class="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold">
            👏 Excellent financial health! Saving 40% protects you from unexpected expenses.
          </div>
        </div>
      `;

      setTimeout(() => {
        const rf = document.getElementById('rngFood');
        const rd = document.getElementById('rngData');
        const vf = document.getElementById('valFood');
        const vd = document.getElementById('valData');
        const vs = document.getElementById('valSave');
        const fb = document.getElementById('budgetFeedback');

        const updateBudget = () => {
          const f = Number(rf.value);
          const d = Number(rd.value);
          const s = Math.max(0, 100 - f - d);

          if (vf) vf.textContent = `${currSymbol} ${(f * 1000).toLocaleString()} (${f}%)`;
          if (vd) vd.textContent = `${currSymbol} ${(d * 1000).toLocaleString()} (${d}%)`;
          if (vs) vs.textContent = `${currSymbol} ${(s * 1000).toLocaleString()} (${s}%)`;

          if (s >= 20) {
            fb.className = 'p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold';
            fb.textContent = `👏 Strong financial health! Saving ${s}% builds a solid emergency fund.`;
          } else if (s > 0) {
            fb.className = 'p-2.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold';
            fb.textContent = `⚠️ Tight margin: Saving ${s}% leaves little room for unexpected student costs.`;
          } else {
            fb.className = 'p-2.5 bg-rose-100 text-rose-900 rounded-xl text-xs font-bold';
            fb.textContent = `🚨 Over budget! Expenses exceed allowance. Reduce food or data allocations.`;
          }
        };

        rf?.addEventListener('input', updateBudget);
        rd?.addEventListener('input', updateBudget);
      }, 50);

    // 6. Venture Pricing & Breakeven (Venture Economics)
    } else if (activity.type === 'venture-pricing') {
      sandbox.innerHTML = `
        <div class="space-y-2.5 text-xs">
          <p class="font-bold text-slate-700">Model unit economics for a student notebook service:</p>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-[10px] text-slate-500 font-bold">Unit Production Cost:</span>
              <input id="unitCost" type="number" value="1200" class="w-full p-1.5 border border-slate-300 rounded font-bold" />
            </div>
            <div>
              <span class="text-[10px] text-slate-500 font-bold">Selling Price:</span>
              <input id="unitPrice" type="number" value="2000" class="w-full p-1.5 border border-slate-300 rounded font-bold" />
            </div>
          </div>
          <button id="btnCalcEconomics" type="button" class="w-full py-2 bg-indigo-600 text-white rounded-lg font-black">
            📊 Compute Profit Margins
          </button>
          <div id="econResult" class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]">
            Gross Profit per unit: ${currSymbol} 800 (Margin: 40%)
          </div>
        </div>
      `;

      setTimeout(() => {
        document.getElementById('btnCalcEconomics')?.addEventListener('click', () => {
          const cost = Number(document.getElementById('unitCost')?.value) || 0;
          const price = Number(document.getElementById('unitPrice')?.value) || 0;
          const res = document.getElementById('econResult');
          if (price <= cost) {
            res.innerHTML = `<span class="text-rose-600 font-bold">Loss warning:</span> Selling price must be greater than unit cost.`;
          } else {
            const profit = price - cost;
            const margin = Math.round((profit / price) * 100);
            res.innerHTML = `<strong>Gross Profit:</strong> ${currSymbol} ${profit.toLocaleString()} (Margin: ${margin}%)<br><span class="text-emerald-700">Healthy retail margin!</span>`;
          }
        });
      }, 50);

    // 7. Elevator Pitch Builder (Public Speaking)
    } else if (activity.type === 'pitch-builder') {
      sandbox.innerHTML = `
        <div class="space-y-2.5 text-xs">
          <p class="font-bold text-slate-700">The 4-Part 60-Second Pitch Architecture:</p>
          <div class="space-y-1.5">
            <input id="pitchHook" type="text" placeholder="1. Hook: Did you know that 70% of students struggle to..." class="w-full p-1.5 border border-slate-300 rounded text-xs" />
            <input id="pitchSol" type="text" placeholder="2. Solution: Our project provides a digital peer guide..." class="w-full p-1.5 border border-slate-300 rounded text-xs" />
            <input id="pitchAsk" type="text" placeholder="3. Call to Action: Join us as a pilot student explorer..." class="w-full p-1.5 border border-slate-300 rounded text-xs" />
          </div>
          <div class="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-300">
            <div>
              <span class="text-[10px] font-black uppercase text-amber-900 block">Practice Timer</span>
              <span id="pitchTimerDisplay" class="text-lg font-black text-amber-950 font-mono">60s</span>
            </div>
            <button id="btnStartPitchTimer" type="button" class="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 rounded-lg text-xs border border-slate-900">
              ▶ Start Pitch
            </button>
          </div>
        </div>
      `;

      setTimeout(() => {
        let timer = null;
        let count = 60;
        document.getElementById('btnStartPitchTimer')?.addEventListener('click', () => {
          clearInterval(timer);
          count = 60;
          const display = document.getElementById('pitchTimerDisplay');
          timer = setInterval(() => {
            count--;
            if (display) display.textContent = `${count}s`;
            if (count <= 0) {
              clearInterval(timer);
              alert('Time is up! Great 60-second delivery!');
            }
          }, 1000);
        });
      }, 50);

    // 8. STAR Method Interview (Professional Comm)
    } else if (activity.type === 'interview-star') {
      sandbox.innerHTML = `
        <div class="space-y-2 text-xs">
          <p class="font-bold text-slate-700">Structure your scholarship interview answer:</p>
          <div class="grid grid-cols-2 gap-1.5">
            <input type="text" placeholder="Situation: At our secondary school..." class="p-1.5 border border-slate-300 rounded text-[11px]" />
            <input type="text" placeholder="Task: I was chosen to lead..." class="p-1.5 border border-slate-300 rounded text-[11px]" />
            <input type="text" placeholder="Action: I organized daily check-ins..." class="p-1.5 border border-slate-300 rounded text-[11px]" />
            <input type="text" placeholder="Result: We won first place..." class="p-1.5 border border-slate-300 rounded text-[11px]" />
          </div>
          <div class="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900 font-bold">
            💡 The STAR technique demonstrates structured problem-solving to university interviewers.
          </div>
        </div>
      `;

    // 9. 5 Whys Root-Cause Analyzer (Entrepreneurship)
    } else if (activity.type === 'five-whys') {
      sandbox.innerHTML = `
        <div class="space-y-2 text-xs">
          <p class="font-bold text-slate-700">Drill into the root cause of a community problem:</p>
          <div class="space-y-1">
            <input type="text" value="Problem: Students arrive late to morning classes." class="w-full p-1.5 border border-slate-300 rounded bg-slate-50 font-bold text-[11px]" readonly />
            <input type="text" placeholder="Why? Because local transit buses are overcrowded..." class="w-full p-1.5 border border-slate-300 rounded text-[11px]" />
            <input type="text" placeholder="Root Problem: Lack of predictable route schedules..." class="w-full p-1.5 border border-slate-300 rounded text-[11px] font-bold text-emerald-800" />
          </div>
          <div class="p-2 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-900 font-bold">
            💡 Solving root causes creates enduring businesses rather than band-aid fixes.
          </div>
        </div>
      `;

    // 10. Lean MVP Scoping Canvas (Venture Launch)
    } else if (activity.type === 'mvp-scope') {
      sandbox.innerHTML = `
        <div class="space-y-2 text-xs">
          <p class="font-bold text-slate-700">Scope your Minimum Viable Product for 48-hour launch:</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2 bg-emerald-50 border-2 border-emerald-500 rounded-xl">
              <span class="font-black text-emerald-950 text-[10px] uppercase">Must-Have (Launch)</span>
              <ul class="text-[11px] text-emerald-900 mt-1 space-y-0.5">
                <li>✓ Simple order WhatsApp link</li>
                <li>✓ Product pricing list</li>
                <li>✓ Payment confirmation</li>
              </ul>
            </div>
            <div class="p-2 bg-slate-100 border border-slate-300 rounded-xl">
              <span class="font-black text-slate-500 text-[10px] uppercase">Later (Post-MVP)</span>
              <ul class="text-[11px] text-slate-500 mt-1 space-y-0.5">
                <li>• Native mobile app</li>
                <li>• Automated warehouse bot</li>
                <li>• International delivery</li>
              </ul>
            </div>
          </div>
        </div>
      `;

    // Generic Fallback
    } else {
      sandbox.innerHTML = `<div class="text-xs text-slate-600 font-medium">${activity.description}</div>`;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     CURIOSITY QUIZ MODAL & RESULTS
  ───────────────────────────────────────────────────────────── */
  openQuiz() {
    if (!this.dom.quizModal || !this.dom.quizBody) return;
    this.dom.quizBody.innerHTML = '';

    QUIZ_QUESTIONS.forEach((q, qIndex) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:mb-0';

      qDiv.innerHTML = `
        <h4 class="text-xs font-black text-slate-900 mb-2 leading-relaxed flex items-center gap-1.5">
          <span class="w-5 h-5 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[11px] font-black shrink-0">
            ${qIndex + 1}
          </span>
          ${q.question}
        </h4>
        <div class="space-y-1.5">
          ${q.options.map((opt, optIdx) => `
            <label class="quiz-option flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-800 transition-colors">
              <input type="radio" name="quiz_q_${q.id}" value="${qIndex}_${optIdx}" class="text-indigo-600 accent-indigo-600 focus:ring-0" />
              <span>${opt.text}</span>
            </label>
          `).join('')}
        </div>
      `;

      this.dom.quizBody.appendChild(qDiv);
    });

    this.dom.quizModal.classList.remove('hidden');
  }

  closeQuiz() {
    if (this.dom.quizModal) {
      this.dom.quizModal.classList.add('hidden');
    }
  }

  submitQuiz() {
    const tagScores = {};
    const answers = {};
    let answeredCount = 0;

    QUIZ_QUESTIONS.forEach((q, qIndex) => {
      const checked = document.querySelector(`input[name="quiz_q_${q.id}"]:checked`);
      if (checked) {
        answeredCount++;
        const [qIdx, optIdx] = checked.value.split('_').map(Number);
        answers[q.id] = optIdx;
        const tags = QUIZ_QUESTIONS[qIdx]?.options[optIdx]?.tags || [];
        tags.forEach(t => {
          tagScores[t] = (tagScores[t] || 0) + 1;
        });
      }
    });

    if (answeredCount < QUIZ_QUESTIONS.length) {
      alert(`Please answer all ${QUIZ_QUESTIONS.length} questions to receive accurate pathway recommendations!`);
      return;
    }

    const sorted = Object.entries(tagScores).sort((a, b) => b[1] - a[1]);
    const topInterests = sorted.slice(0, 3).map(entry => entry[0]);

    this.state.activeInterests = topInterests;
    this.saveState();
    this.closeQuiz();

    // Persist quiz to Firebase
    if (window.FirebaseSync && typeof window.FirebaseSync.saveQuizSubmission === 'function') {
      window.FirebaseSync.saveQuizSubmission(this.state.participantId, {
        answers: answers,
        scores: tagScores,
        preferredAreas: topInterests,
        quizVersion: '2.0'
      }).catch(err => console.warn('Could not save quiz to Firebase', err));
    }

    // Unlock curiosity-pioneer badge
    if (window.SurveysAndBadges) {
      window.SurveysAndBadges.unlockBadge('curiosity-pioneer');
    }

    this.renderInterestBadges();
    this.renderCuriosityBadges();
    this.refreshCanvas();

    // Display personalized results modal
    this.showQuizResultsModal(topInterests);
  }

  showQuizResultsModal(topInterests) {
    const studentName = this.state.displayName || this.state.alias || 'Explorer';
    const areaDescriptions = {
      'Programming and Web': 'Architecting digital solutions, modern websites, and computational problem-solving.',
      'Graphic Design': 'Visual communication, brand identity systems, and user experience design.',
      'Financial Literacy': 'Personal budgeting, unit economics, cash flow sustainability, and financial discipline.',
      'Public Speaking': 'Persuasive speaking, structured pitch architecture, and interview composure.',
      'Entrepreneurship': 'Identifying root community problems, customer empathy, and launching lean MVPs.'
    };

    const resultsHtml = `
      <div class="space-y-4">
        <div class="bg-indigo-50 border-2 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_#0F172A]">
          <span class="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
            Exploratory Recommendations
          </span>
          <h3 class="text-xl font-black text-slate-900 mt-1">
            ${studentName}'s Recommended Pathways
          </h3>
          <p class="text-xs text-slate-600 mt-1 leading-relaxed">
            Based on your reflections, these mentorship areas represent strong possibilities for your next learning steps:
          </p>
        </div>

        <div class="space-y-2.5">
          ${topInterests.map((interest, idx) => `
            <div class="p-3 bg-white rounded-xl border-2 border-slate-900 shadow-xs flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 border border-slate-900">
                ${idx + 1}
              </span>
              <div>
                <strong class="text-sm font-black text-slate-900">${interest}</strong>
                <p class="text-xs text-slate-600 mt-0.5">${areaDescriptions[interest] || 'Active learning pathway.'}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900 font-bold leading-relaxed">
          ℹ️ <strong>Exploratory Note:</strong> These results are exploratory recommendations to spark curiosity, not a rigid career prescription. You are encouraged to explore all 5 pathways!
        </div>

        <div class="text-right pt-2">
          <button type="button" class="btn btn-primary" onclick="window.SurveysAndBadges.closeModal()">
            Start Exploring Highlighted Nodes →
          </button>
        </div>
      </div>
    `;

    if (window.SurveysAndBadges) {
      window.SurveysAndBadges.showModal('✨ Your Curiosity Discovery Results', resultsHtml);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     FEEDBACK TOAST
  ───────────────────────────────────────────────────────────── */
  showToast(message) {
    const existing = document.getElementById('bigMindsToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'bigMindsToast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 z-50 flex items-center gap-2 pointer-events-none fade-up';
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.bigMindsApp = new BigMindsApp();
});
