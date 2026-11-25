/**
 * Big Minds — Shared Navigation, Session & Neo-Tactile UI Shell
 * Provides reusable header, mobile navigation drawer, footer, centered onboarding/profile modal,
 * and unified localStorage + Firebase participant session helpers across all public pages.
 */

(function (window) {
  'use strict';

  const SESSION_KEY = 'bigminds_student_session';

  function generateParticipantId() {
    return 'bm_part_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  const BigMindsSession = {
    STORAGE_KEY: SESSION_KEY,

    get() {
      let parsed = {};
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) parsed = JSON.parse(raw) || {};
      } catch (e) {
        console.warn('Unable to parse student session:', e);
      }

      const defaultCurrency = window.CurrencyHelper
        ? window.CurrencyHelper.getPreferredCurrency()
        : 'NGN';

      const session = {
        participantId: parsed.participantId || generateParticipantId(),
        displayName: parsed.displayName || '',
        alias: parsed.alias || parsed.displayName || '',
        selectedCurrency: parsed.selectedCurrency || defaultCurrency,
        activeInterests: Array.isArray(parsed.activeInterests) ? parsed.activeInterests : [],
        exploredIds: Array.isArray(parsed.exploredIds) ? parsed.exploredIds : [],
        selectedNodeId: parsed.selectedNodeId || null,
        unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
        preSurveyCompleted: Boolean(parsed.preSurveyCompleted),
        postSurveyCompleted: Boolean(parsed.postSurveyCompleted),
        preSurvey: parsed.preSurvey || null,
        postSurvey: parsed.postSurvey || null,
        moduleProgress: (parsed.moduleProgress && typeof parsed.moduleProgress === 'object') ? parsed.moduleProgress : {},
        createdDate: parsed.createdDate || new Date().toISOString()
      };

      if (!parsed.participantId) {
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch (e) { /* ignore storage quota errors */ }
      }

      return session;
    },

    save(updated, { syncRemote = true } = {}) {
      const current = this.get();
      const merged = { ...current, ...updated };
      if (merged.displayName && !merged.alias) merged.alias = merged.displayName;

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Unable to save student session:', e);
      }

      window.dispatchEvent(new CustomEvent('bigminds:sessionUpdated', { detail: merged }));

      if (syncRemote && window.FirebaseSync) {
        if (typeof window.FirebaseSync.saveParticipant === 'function') {
          window.FirebaseSync.saveParticipant({
            participantId: merged.participantId,
            displayName: merged.displayName || merged.alias || 'Explorer',
            selectedCurrency: merged.selectedCurrency,
            sessionStatus: 'active'
          }).catch(() => {});
        }
        if (typeof window.FirebaseSync.savePathwayProgress === 'function') {
          window.FirebaseSync.savePathwayProgress(merged.participantId, {
            exploredNodes: merged.exploredIds,
            completedActivities: merged.exploredIds,
            unlockedBadges: merged.unlockedBadges
          }).catch(() => {});
        }
        if (typeof window.FirebaseSync.saveModuleProgress === 'function') {
          window.FirebaseSync.saveModuleProgress(merged.participantId, merged.moduleProgress).catch(() => {});
        }
      }

      return merged;
    },

    startNewSession() {
      const confirmed = window.confirm(
        'Start a fresh participant session on this device?\n\nYour previous submissions remain saved safely and will not be overwritten.'
      );
      if (!confirmed) return null;

      const defaultCurrency = window.CurrencyHelper
        ? window.CurrencyHelper.getPreferredCurrency()
        : 'NGN';

      const fresh = {
        participantId: generateParticipantId(),
        displayName: '',
        alias: '',
        selectedCurrency: defaultCurrency,
        activeInterests: [],
        exploredIds: [],
        selectedNodeId: null,
        unlockedBadges: [],
        preSurveyCompleted: false,
        postSurveyCompleted: false,
        preSurvey: null,
        postSurvey: null,
        moduleProgress: {},
        createdDate: new Date().toISOString()
      };

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
      } catch (e) { /* ignore */ }

      window.dispatchEvent(new CustomEvent('bigminds:sessionUpdated', { detail: fresh }));
      window.dispatchEvent(new CustomEvent('bigminds:sessionReset', { detail: fresh }));
      BigMindsUI.refreshIdentityPills();
      return fresh;
    },

    getOverallModuleStats() {
      const session = this.get();
      const modules = window.MENTORSHIP_MODULES || [];
      const totalStagesPerModule = 6;
      let totalCompletedStages = 0;
      let startedModules = 0;

      modules.forEach((mod) => {
        const modState = session.moduleProgress?.[mod.slug];
        const doneCount = Array.isArray(modState?.completedStages) ? modState.completedStages.length : 0;
        if (doneCount > 0) startedModules += 1;
        totalCompletedStages += Math.min(doneCount, totalStagesPerModule);
      });

      const totalPossible = modules.length * totalStagesPerModule;
      const percent = totalPossible ? Math.round((totalCompletedStages / totalPossible) * 100) : 0;
      return {
        totalCompletedStages,
        totalPossible,
        startedModules,
        totalModules: modules.length,
        percent
      };
    }
  };

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: 'index.html', icon: '🏠' },
    { id: 'mentorship', label: 'Mentorship Areas', href: 'mentorship.html', icon: '📚' },
    { id: 'explore', label: 'Pathway Map', href: 'explore.html', icon: '🧭' },
    { id: 'quiz', label: 'Curiosity Quiz', href: 'quiz.html', icon: '✨' },
    { id: 'progress', label: 'My Progress', href: 'progress.html', icon: '🏆' }
  ];

  const BigMindsUI = {
    renderHeader({ activeRoute = 'home', containerId = 'siteHeader' } = {}) {
      const target = document.getElementById(containerId);
      if (!target) return;

      const session = BigMindsSession.get();
      const displayName = session.displayName || session.alias || '';

      target.className = 'bg-white/95 backdrop-blur-md border-b-2 border-[#1E1B4B] sticky top-0 z-40';
      target.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center justify-between gap-3">
            <!-- Brand -->
            <a href="index.html" class="flex items-center gap-2.5 group shrink-0">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-[#1E1B4B] flex items-center justify-center text-white text-xl shadow-[2px_2px_0px_#1E1B4B] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                💡
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-lg font-black tracking-tight text-[#1E1B4B] font-heading">Big Minds</span>
                  <span class="hidden sm:inline-block text-[10px] font-black uppercase bg-amber-300 text-[#1E1B4B] px-1.5 py-0.5 rounded border border-[#1E1B4B] sticker">
                    2.0
                  </span>
                </div>
                <p class="hidden xl:block text-[11px] font-bold text-slate-500 leading-none mt-0.5">
                  Discover interests. Explore possibilities.
                </p>
              </div>
            </a>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex items-center gap-1.5" aria-label="Main navigation">
              ${NAV_ITEMS.map((item) => {
                const isActive = item.id === activeRoute;
                return `
                  <a href="${item.href}"
                     class="px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border-2 ${
                       isActive
                         ? 'bg-amber-300 text-[#1E1B4B] border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B]'
                         : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-300'
                     }"
                     ${isActive ? 'aria-current="page"' : ''}>
                    <span>${item.icon}</span>
                    <span>${item.label}</span>
                  </a>
                `;
              }).join('')}
            </nav>

            <!-- Right Identity + Mobile Drawer Toggle -->
            <div class="flex items-center gap-2">
              <button type="button" id="bmHeaderProfileBtn"
                class="flex items-center gap-2 bg-[#FDFBF7] hover:bg-amber-50 border-2 border-[#1E1B4B] px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#1E1B4B] text-left transition-all min-h-[40px] cursor-pointer"
                title="Set or update your display name and preferences">
                <span class="text-base leading-none">👤</span>
                <span class="text-xs font-black text-[#1E1B4B] max-w-[110px] sm:max-w-[140px] truncate" data-bm-name>
                  ${displayName ? escapeHtml(displayName) : 'Set Your Name'}
                </span>
              </button>

              <button type="button" id="bmMobileMenuBtn"
                class="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#1E1B4B] bg-white hover:bg-slate-100 text-[#1E1B4B] font-black shadow-[2px_2px_0px_#1E1B4B] cursor-pointer"
                aria-expanded="false"
                aria-controls="bmMobileNavDrawer"
                aria-label="Toggle navigation menu">
                ☰
              </button>
            </div>
          </div>

          <!-- Adaptive Mobile Navigation Panel -->
          <div id="bmMobileNavDrawer" class="hidden lg:hidden mt-3 pt-3 border-t-2 border-slate-200 space-y-1.5">
            ${NAV_ITEMS.map((item) => {
              const isActive = item.id === activeRoute;
              return `
                <a href="${item.href}"
                   class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-black border-2 transition-all min-h-[44px] ${
                     isActive
                       ? 'bg-amber-300 text-[#1E1B4B] border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B]'
                       : 'bg-[#FDFBF7] text-slate-800 border-slate-300 hover:border-[#1E1B4B]'
                   }"
                   ${isActive ? 'aria-current="page"' : ''}>
                  <span class="flex items-center gap-2"><span>${item.icon}</span><span>${item.label}</span></span>
                  <span class="text-xs opacity-70">→</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;

      const menuBtn = document.getElementById('bmMobileMenuBtn');
      const mobileDrawer = document.getElementById('bmMobileNavDrawer');
      menuBtn?.addEventListener('click', () => {
        const isHidden = mobileDrawer.classList.contains('hidden');
        mobileDrawer.classList.toggle('hidden', !isHidden);
        menuBtn.setAttribute('aria-expanded', String(isHidden));
        menuBtn.textContent = isHidden ? '✕' : '☰';
      });

      document.getElementById('bmHeaderProfileBtn')?.addEventListener('click', () => {
        this.openProfileModal();
      });

      window.addEventListener('bigminds:sessionUpdated', () => this.refreshIdentityPills());
    },

    refreshIdentityPills() {
      const session = BigMindsSession.get();
      const name = session.displayName || session.alias || '';
      document.querySelectorAll('[data-bm-name]').forEach((el) => {
        el.textContent = name ? name : 'Set Your Name';
      });
    },

    renderFooter({ containerId = 'siteFooter' } = {}) {
      const footer = document.getElementById(containerId);
      if (!footer) return;

      footer.className = 'border-t-2 border-[#1E1B4B] bg-white px-4 sm:px-6 lg:px-8 py-6 mt-auto';
      footer.innerHTML = `
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span class="text-lg">💡</span>
              <span class="font-black text-sm text-[#1E1B4B] font-heading">Big Minds</span>
            </div>
            <p class="text-xs font-semibold text-slate-500 mt-1">
              Discover your interests. Explore your possibilities. Build your next step.
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-bold text-slate-700">
            <a href="index.html" class="hover:text-indigo-700 transition-colors">Home</a>
            <a href="mentorship.html" class="hover:text-indigo-700 transition-colors">Mentorship Areas</a>
            <a href="explore.html" class="hover:text-indigo-700 transition-colors">Pathway Map</a>
            <a href="quiz.html" class="hover:text-indigo-700 transition-colors">Curiosity Quiz</a>
            <a href="progress.html" class="hover:text-indigo-700 transition-colors">My Progress</a>
          </div>
        </div>
      `;
    },

    openProfileModal({ forceWelcome = false, onSaved = null } = {}) {
      const session = BigMindsSession.get();
      let overlay = document.getElementById('bmProfileModalOverlay');

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'bmProfileModalOverlay';
        overlay.className = 'planner-modal-overlay';
        document.body.appendChild(overlay);
      }

      const hasName = Boolean(session.displayName);
      overlay.innerHTML = `
        <div class="planner-modal-card max-w-md w-full" role="dialog" aria-modal="true" aria-labelledby="bmProfileModalTitle">
          <div class="flex items-center justify-between pb-3 border-b-2 border-slate-200 mb-4">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">💡</span>
              <div>
                <h3 id="bmProfileModalTitle" class="text-lg font-black text-[#1E1B4B] leading-tight">
                  ${forceWelcome || !hasName ? 'Welcome to Big Minds' : 'Your Explorer Profile'}
                </h3>
                <p class="text-[11px] font-bold text-slate-500">Privacy-friendly • No account or password needed</p>
              </div>
            </div>
            <button type="button" id="bmCloseProfileModal" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-[#1E1B4B] text-[#1E1B4B] font-black flex items-center justify-center cursor-pointer" aria-label="Close">✕</button>
          </div>

          <form id="bmProfileForm" class="space-y-4">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5" for="bmDisplayNameInput">
                Preferred / Display Name
              </label>
              <input
                type="text"
                id="bmDisplayNameInput"
                class="w-full px-4 py-3 rounded-xl border-2 border-[#1E1B4B] text-base font-bold text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-[2px_2px_0px_#1E1B4B] bg-[#FDFBF7]"
                placeholder="e.g. Amara, Tobi, Kofi"
                value="${escapeHtml(session.displayName || '')}"
                maxlength="40"
                required
              />
              <p class="text-[11px] text-slate-500 mt-1 font-medium">
                Used only to personalise your learning progress and Explorer Certificate on this device.
              </p>
            </div>

            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Currency (for Financial Literacy activities)
              </label>
              <div id="bmProfileCurrencyWrap"></div>
            </div>

            <div class="bg-slate-50 rounded-xl border border-slate-300 px-3 py-2 flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-500 uppercase">Session ID</span>
              <span class="font-mono font-bold text-slate-700">${escapeHtml(session.participantId)}</span>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 pt-1">
              <button type="submit" class="flex-1 py-3 px-4 rounded-xl font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#1E1B4B] cursor-pointer">
                Save & Continue →
              </button>
              ${hasName ? `
                <button type="button" id="bmStartFreshBtn" class="py-3 px-4 rounded-xl font-black text-xs bg-slate-100 hover:bg-slate-200 text-[#1E1B4B] border-2 border-[#1E1B4B] cursor-pointer">
                  New Session
                </button>
              ` : ''}
            </div>
          </form>
        </div>
      `;

      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';

      if (window.CurrencyHelper) {
        window.CurrencyHelper.renderSelector('bmProfileCurrencyWrap', {
          className: 'w-full px-3 py-2.5 rounded-xl border-2 border-[#1E1B4B] text-xs font-bold bg-white',
          selected: session.selectedCurrency
        });
      }

      const closeModal = () => {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      };

      document.getElementById('bmCloseProfileModal')?.addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });

      document.getElementById('bmStartFreshBtn')?.addEventListener('click', () => {
        const fresh = BigMindsSession.startNewSession();
        if (fresh) {
          closeModal();
          this.openProfileModal({ forceWelcome: true });
        }
      });

      document.getElementById('bmProfileForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('bmDisplayNameInput');
        const name = input ? input.value.trim() : '';
        if (!name) return;

        const currency = window.CurrencyHelper
          ? window.CurrencyHelper.getPreferredCurrency()
          : session.selectedCurrency;

        const saved = BigMindsSession.save({
          displayName: name,
          alias: name,
          selectedCurrency: currency
        });

        closeModal();
        this.refreshIdentityPills();
        this.showToast(`🎉 Welcome, ${name}!`);
        if (typeof onSaved === 'function') onSaved(saved);
      });

      setTimeout(() => document.getElementById('bmDisplayNameInput')?.focus(), 50);
    },

    showToast(message) {
      const existing = document.getElementById('bigMindsToast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'bigMindsToast';
      toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#1E1B4B] text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl border-2 border-amber-300 z-[10001] flex items-center gap-2 pointer-events-none max-w-[90vw] text-center';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 350);
      }, 3200);
    }
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.BigMindsSession = BigMindsSession;
  window.BigMindsUI = BigMindsUI;
})(window);
