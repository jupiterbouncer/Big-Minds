/**
 * Big Minds — Six-Stage Mentorship Module Controller
 * Manages route state (?area=<slug>&stage=<stageId>), browser back/forward history,
 * adaptive desktop/mobile stage navigation, interactive Practice sandboxes,
 * Reflection checks, and per-module progress persistence.
 */

(function (window) {
  'use strict';

  class MentorshipModuleApp {
    constructor() {
      this.stages = window.MENTORSHIP_STAGES || [];
      this.modules = window.MENTORSHIP_MODULES || [];
      this.currentModule = null;
      this.currentStageId = 'discover';
      this.timerInterval = null;

      this.init();
    }

    init() {
      this.resolveRouteFromUrl();

      if (!this.currentModule) {
        this.renderModuleSelectorFallback();
        return;
      }

      this.renderModuleHeader();
      this.renderStageNavigation();
      this.renderActiveStage();
      this.renderStageFooterNav();

      window.addEventListener('popstate', () => {
        this.resolveRouteFromUrl();
        if (this.currentModule) {
          this.renderModuleHeader();
          this.renderStageNavigation();
          this.renderActiveStage();
          this.renderStageFooterNav();
        }
      });

      window.addEventListener('bigminds:sessionUpdated', () => {
        if (this.currentModule) {
          this.renderModuleHeader();
          this.renderStageNavigation();
          this.renderStageFooterNav();
        }
      });
    }

    resolveRouteFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const areaParam = params.get('area');
      const stageParam = params.get('stage') || window.location.hash.replace('#', '');

      this.currentModule = window.getMentorshipModuleBySlug(areaParam);

      if (!this.currentModule) {
        return;
      }

      const validStage = this.stages.find((s) => s.id === stageParam);
      if (validStage) {
        this.currentStageId = validStage.id;
      } else {
        const modState = this.getModuleState();
        this.currentStageId = modState.lastStage && this.stages.some((s) => s.id === modState.lastStage)
          ? modState.lastStage
          : 'discover';
      }

      document.title = `${this.currentModule.title} | Big Minds`;
    }

    getModuleState() {
      const session = window.BigMindsSession.get();
      const slug = this.currentModule.slug;
      const existing = session.moduleProgress?.[slug] || {};
      return {
        completedStages: Array.isArray(existing.completedStages) ? existing.completedStages : [],
        quizAnswers: (existing.quizAnswers && typeof existing.quizAnswers === 'object') ? existing.quizAnswers : {},
        reflectionNote: existing.reflectionNote || '',
        practiceNote: existing.practiceNote || '',
        practiceCompleted: Boolean(existing.practiceCompleted),
        confidenceRating: existing.confidenceRating || null,
        lastStage: existing.lastStage || 'discover'
      };
    }

    saveModuleState(partial) {
      const session = window.BigMindsSession.get();
      const slug = this.currentModule.slug;
      const prev = this.getModuleState();
      const nextModuleState = { ...prev, ...partial };

      const moduleProgress = {
        ...(session.moduleProgress || {}),
        [slug]: nextModuleState
      };

      const updatedSession = window.BigMindsSession.save({ moduleProgress });
      this.checkModuleBadgeUnlock(updatedSession, nextModuleState);
      return nextModuleState;
    }

    checkModuleBadgeUnlock(session, modState) {
      if (!window.SurveysAndBadges || !this.currentModule.badgeId) return;
      const done = modState.completedStages || [];
      if (done.includes('practise') || done.includes('reflect') || done.length >= 3) {
        window.SurveysAndBadges.unlockBadge(this.currentModule.badgeId);
      }

      // Check if all 5 areas have at least one badge or significant progress
      const allModuleBadges = this.modules.map((m) => m.badgeId);
      const latest = window.BigMindsSession.get();
      const unlocked = latest.unlockedBadges || [];
      if (allModuleBadges.every((b) => unlocked.includes(b))) {
        window.SurveysAndBadges.unlockBadge('pathway-master');
      }
    }

    navigateToStage(stageId, { pushHistory = true } = {}) {
      if (!this.stages.some((s) => s.id === stageId)) return;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.currentStageId = stageId;
      this.saveModuleState({ lastStage: stageId });

      if (pushHistory) {
        const url = new URL(window.location.href);
        url.searchParams.set('area', this.currentModule.slug);
        url.searchParams.set('stage', stageId);
        url.hash = '';
        window.history.pushState({ area: this.currentModule.slug, stage: stageId }, '', url.toString());
      }

      this.renderStageNavigation();
      this.renderActiveStage();
      this.renderStageFooterNav();

      const mainCard = document.getElementById('moduleStageCard');
      if (mainCard) {
        mainCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    toggleStageComplete(stageId, forceComplete = null) {
      const state = this.getModuleState();
      const list = [...state.completedStages];
      const idx = list.indexOf(stageId);

      if (forceComplete === true) {
        if (idx === -1) list.push(stageId);
      } else if (forceComplete === false) {
        if (idx > -1) list.splice(idx, 1);
      } else {
        if (idx > -1) list.splice(idx, 1);
        else list.push(stageId);
      }

      this.saveModuleState({ completedStages: list });
      this.renderModuleHeader();
      this.renderStageNavigation();
      this.renderStageFooterNav();

      const stage = this.stages.find((s) => s.id === stageId);
      if (list.includes(stageId) && stage) {
        window.BigMindsUI.showToast(`✓ Marked "${stage.label}" complete!`);
      }
    }

    renderModuleSelectorFallback() {
      const root = document.getElementById('moduleWorkspace');
      if (!root) return;

      root.innerHTML = `
        <div class="bg-white rounded-3xl border-2 border-[#1E1B4B] p-6 sm:p-8 shadow-[5px_5px_0px_#1E1B4B] text-center max-w-2xl mx-auto my-8 space-y-5">
          <div class="text-4xl">🧭</div>
          <h1 class="text-2xl font-black text-[#1E1B4B] font-heading">Choose a Mentorship Module</h1>
          <p class="text-sm text-slate-600 font-medium">
            Select any of the five Big Minds learning environments below to begin exploring.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            ${this.modules.map((m) => `
              <a href="module.html?area=${m.slug}" class="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-[#1E1B4B] bg-[#FDFBF7] hover:bg-amber-100 shadow-[3px_3px_0px_#1E1B4B] transition-all">
                <span class="text-2xl">${m.icon}</span>
                <div>
                  <div class="text-sm font-black text-[#1E1B4B]">${m.title}</div>
                  <div class="text-[11px] font-bold text-slate-500">6 learning stages →</div>
                </div>
              </a>
            `).join('')}
          </div>
          <div class="pt-2">
            <a href="mentorship.html" class="text-xs font-black text-indigo-700 hover:underline">← Return to Mentorship Overview</a>
          </div>
        </div>
      `;
    }

    renderModuleHeader() {
      const container = document.getElementById('moduleIntroSection');
      if (!container) return;

      const mod = this.currentModule;
      const state = this.getModuleState();
      const doneCount = state.completedStages.length;
      const pct = Math.round((doneCount / this.stages.length) * 100);
      const nextStage = this.stages.find((s) => !state.completedStages.includes(s.id)) || this.stages[0];

      container.innerHTML = `
        <div class="bg-white rounded-3xl border-2 border-[#1E1B4B] p-5 sm:p-7 shadow-[5px_5px_0px_#1E1B4B] space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <a href="mentorship.html" class="inline-flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-black">
              <span>← All Mentorship Areas</span>
            </a>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full border border-[#1E1B4B] ${mod.theme.badgeBg} ${mod.theme.badgeText} font-black text-[11px]">
                ⏱️ ${mod.estimatedDuration}
              </span>
              <a href="explore.html?interest=${encodeURIComponent(mod.interestTag)}" class="px-2.5 py-1 rounded-full border border-slate-300 bg-[#FDFBF7] hover:bg-slate-100 text-slate-700 font-bold text-[11px]">
                🧭 Pathway Map
              </a>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-8 space-y-3">
              <div class="flex items-start sm:items-center gap-3.5">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${mod.theme.badgeBg} border-2 border-[#1E1B4B] flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1E1B4B] shrink-0">
                  ${mod.icon}
                </div>
                <div>
                  <span class="text-[11px] font-black uppercase tracking-wider text-slate-500">Mentorship Module</span>
                  <h1 class="text-2xl sm:text-3xl font-black text-[#1E1B4B] font-heading leading-tight">${mod.title}</h1>
                </div>
              </div>

              <p class="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                ${mod.summary}
              </p>

              <div class="pt-1">
                <span class="text-[11px] font-black uppercase tracking-wider text-indigo-800 block mb-1.5">What you will achieve:</span>
                <ul class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  ${mod.outcomes.map((outcome) => `
                    <li class="bg-[#FDFBF7] border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-700 flex items-start gap-1.5">
                      <span class="text-emerald-600 font-black shrink-0">✓</span>
                      <span>${outcome}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>

            <div class="lg:col-span-4 bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-4 space-y-3">
              <div class="flex items-center justify-between text-xs font-black text-[#1E1B4B]">
                <span>Module Progress</span>
                <span>${doneCount} / ${this.stages.length} Stages</span>
              </div>
              <div class="w-full h-3 bg-slate-200 border border-[#1E1B4B] rounded-full overflow-hidden">
                <div class="bg-emerald-400 h-full transition-all duration-300" style="width: ${pct}%"></div>
              </div>
              <p class="text-[11px] text-slate-600 font-medium leading-snug">
                Explore stages in any order—no locked steps. Revisit whenever you want.
              </p>
              <button type="button" id="modulePrimaryActionBtn"
                class="w-full py-3 px-4 rounded-xl bg-[#1E1B4B] hover:bg-indigo-900 text-white font-black text-xs sm:text-sm border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#F59E0B] cursor-pointer">
                ${doneCount > 0 ? `Continue: ${nextStage.icon} ${nextStage.label} →` : 'Start Exploring →'}
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('modulePrimaryActionBtn')?.addEventListener('click', () => {
        this.navigateToStage(doneCount > 0 ? nextStage.id : 'discover');
      });
    }

    renderStageNavigation() {
      const container = document.getElementById('moduleStageNav');
      if (!container) return;

      const state = this.getModuleState();
      const activeStage = this.stages.find((s) => s.id === this.currentStageId) || this.stages[0];

      container.innerHTML = `
        <!-- Desktop / Tablet Horizontal Grid Navigation -->
        <nav class="hidden md:grid grid-cols-6 gap-2" aria-label="Module learning stages">
          ${this.stages.map((stage) => {
            const isActive = stage.id === this.currentStageId;
            const isDone = state.completedStages.includes(stage.id);
            return `
              <button type="button" data-stage-btn="${stage.id}"
                class="px-3 py-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                  isActive
                    ? 'bg-amber-300 text-[#1E1B4B] border-[#1E1B4B] shadow-[3px_3px_0px_#1E1B4B]'
                    : 'bg-white hover:bg-indigo-50 text-slate-800 border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B]'
                }"
                ${isActive ? 'aria-current="step"' : ''}>
                <div class="flex items-center justify-between w-full text-xs">
                  <span class="font-black opacity-70">0${stage.number}</span>
                  <span>${isDone ? '✅' : stage.icon}</span>
                </div>
                <span class="text-xs font-black leading-tight">${stage.label}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Adaptive Mobile Navigation: Compact Dropdown + Stage Pills -->
        <div class="md:hidden bg-white rounded-2xl border-2 border-[#1E1B4B] p-3 shadow-[3px_3px_0px_#1E1B4B] space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <label for="mobileStageSelect" class="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Current Stage (${activeStage.number} of 6)
            </label>
            <span class="text-[11px] font-black text-emerald-700">
              ${state.completedStages.length}/6 done
            </span>
          </div>
          <select id="mobileStageSelect"
            class="w-full px-3.5 py-3 rounded-xl border-2 border-[#1E1B4B] bg-[#FDFBF7] text-sm font-black text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-indigo-500">
            ${this.stages.map((stage) => {
              const isDone = state.completedStages.includes(stage.id);
              return `
                <option value="${stage.id}" ${stage.id === this.currentStageId ? 'selected' : ''}>
                  ${stage.number}. ${stage.icon} ${stage.label}${isDone ? ' ✓' : ''}
                </option>
              `;
            }).join('')}
          </select>
        </div>
      `;

      container.querySelectorAll('[data-stage-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.navigateToStage(btn.getAttribute('data-stage-btn'));
        });
      });

      const mobileSelect = document.getElementById('mobileStageSelect');
      mobileSelect?.addEventListener('change', (e) => {
        this.navigateToStage(e.target.value);
      });
    }

    renderActiveStage() {
      const card = document.getElementById('moduleStageCard');
      if (!card) return;

      const mod = this.currentModule;
      const stageMeta = this.stages.find((s) => s.id === this.currentStageId) || this.stages[0];

      let bodyHtml = '';
      if (this.currentStageId === 'discover') bodyHtml = this.renderDiscoverStage(mod);
      else if (this.currentStageId === 'watch') bodyHtml = this.renderWatchStage(mod);
      else if (this.currentStageId === 'learn') bodyHtml = this.renderLearnStage(mod);
      else if (this.currentStageId === 'practise') bodyHtml = this.renderPractiseStage(mod);
      else if (this.currentStageId === 'reflect') bodyHtml = this.renderReflectStage(mod);
      else if (this.currentStageId === 'explore-further') bodyHtml = this.renderExploreFurtherStage(mod);

      card.innerHTML = `
        <div class="border-b-2 border-slate-200 pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-10 h-10 rounded-xl ${mod.theme.badgeBg} border-2 border-[#1E1B4B] flex items-center justify-center text-xl">
              ${stageMeta.icon}
            </span>
            <div>
              <span class="text-[11px] font-black uppercase tracking-wider text-indigo-700">Stage ${stageMeta.number} of 6</span>
              <h2 class="text-xl sm:text-2xl font-black text-[#1E1B4B] font-heading">${stageMeta.label}</h2>
            </div>
          </div>
        </div>
        ${bodyHtml}
      `;

      // Bind stage-specific interactive widgets after DOM injection
      if (this.currentStageId === 'watch') this.bindWatchInteractions();
      if (this.currentStageId === 'practise') this.bindPractiseSandbox(mod);
      if (this.currentStageId === 'reflect') this.bindReflectInteractions(mod);
    }

    /* ─────────────────────────────────────────────────────────────
       STAGE 1: DISCOVER
    ───────────────────────────────────────────────────────────── */
    renderDiscoverStage(mod) {
      const d = mod.discover;
      return `
        <div class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-2">
              <h3 class="text-base font-black text-[#1E1B4B]">What This Skill Involves</h3>
              <p class="text-sm text-slate-700 font-medium leading-relaxed">${d.whatItInvolves}</p>
            </div>
            <div class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-2">
              <h3 class="text-base font-black text-[#1E1B4B]">Why It Matters</h3>
              <p class="text-sm text-slate-700 font-medium leading-relaxed">${d.whyItMatters}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-3">
              <h3 class="text-sm font-black uppercase tracking-wider text-indigo-800">🌍 Real-World Applications</h3>
              <ul class="space-y-2 text-sm text-slate-700 font-medium">
                ${d.realWorldApplications.map((app) => `<li class="flex items-start gap-2"><span class="text-indigo-600 font-black">•</span><span>${app}</span></li>`).join('')}
              </ul>
            </div>

            <div class="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-3">
              <h3 class="text-sm font-black uppercase tracking-wider text-indigo-800">🎯 What You Can Expect to Learn</h3>
              <ul class="space-y-2 text-sm text-slate-700 font-medium">
                ${d.expectToLearn.map((item) => `<li class="flex items-start gap-2"><span class="text-emerald-600 font-black">✓</span><span>${item}</span></li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="bg-indigo-50/70 rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-4">
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-[#1E1B4B] mb-2">🧭 Potential Educational &amp; Career Pathways</h3>
              <div class="flex flex-wrap gap-2">
                ${d.careerPathways.map((cp) => `<span class="text-xs font-black bg-white text-[#1E1B4B] px-3 py-1.5 rounded-xl border border-[#1E1B4B]">${cp}</span>`).join('')}
              </div>
            </div>

            ${d.roleModels?.length ? `
              <div class="pt-3 border-t border-indigo-200">
                <h4 class="text-xs font-black uppercase tracking-wider text-indigo-900 mb-2.5">🏆 Leaders &amp; Role Models</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${d.roleModels.map((rm) => `
                    <div class="bg-white rounded-xl p-3 border border-[#1E1B4B] flex items-start gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-[#1E1B4B] text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                        ${rm.name.charAt(0)}
                      </div>
                      <div>
                        <div class="text-xs font-black text-[#1E1B4B]">${rm.name}</div>
                        <div class="text-xs text-slate-600 font-medium leading-snug mt-0.5">${rm.detail}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    /* ─────────────────────────────────────────────────────────────
       STAGE 2: WATCH
    ───────────────────────────────────────────────────────────── */
    renderWatchStage(mod) {
      const w = mod.watch;
      return `
        <div class="space-y-5">
          <p class="text-sm text-slate-700 font-medium leading-relaxed">${w.intro}</p>

          <div class="space-y-5">
            ${w.videos.map((vid, idx) => `
              <article class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-4 sm:p-5 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black bg-amber-300 text-[#1E1B4B] px-2.5 py-0.5 rounded-full border border-[#1E1B4B]">
                      Video 0${idx + 1}
                    </span>
                    <h3 class="text-base sm:text-lg font-black text-[#1E1B4B]">${vid.title}</h3>
                  </div>
                  <span class="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                    ⏱️ ${vid.duration}
                  </span>
                </div>

                <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">${vid.description}</p>

                ${this.renderVideoPlayerBlock(vid)}
              </article>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderVideoPlayerBlock(vid) {
      if (vid.type === 'embed' && vid.url) {
        return `
          <div class="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#1E1B4B] bg-slate-900" data-video-box="${vid.id}">
            <div class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold pointer-events-none" data-video-loading>
              Loading video player...
            </div>
            <iframe
              src="${vid.url}"
              title="${vid.title}"
              class="relative w-full h-full z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              data-video-frame="${vid.id}">
            </iframe>
          </div>
        `;
      }

      if (vid.type === 'local' && vid.url) {
        return `
          <div class="rounded-2xl overflow-hidden border-2 border-[#1E1B4B] bg-slate-900">
            <video controls preload="metadata" class="w-full max-h-[420px]" data-local-video="${vid.id}">
              <source src="${vid.url}" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            <div class="hidden p-4 bg-rose-50 text-rose-900 text-xs font-bold" data-video-error="${vid.id}">
              ⚠️ Could not load this video right now. Try refreshing or continue to the Learn section.
            </div>
          </div>
        `;
      }

      return `
        <div class="rounded-2xl border-2 border-dashed border-[#1E1B4B] bg-white p-5 sm:p-6 text-center space-y-2.5">
          <div class="text-3xl">🎬</div>
          <div class="text-sm font-black text-[#1E1B4B]">Video Lesson Preparing for Upload</div>
          <p class="text-xs text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            ${vid.statusNote || 'This short video walkthrough has not been uploaded yet. You do not need to wait—head straight into Learn or Practise!'}
          </p>
          <div class="pt-1">
            <button type="button" data-jump-stage="learn"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs border border-[#1E1B4B] cursor-pointer">
              <span>Read Structured Lesson in Learn →</span>
            </button>
          </div>
        </div>
      `;
    }

    bindWatchInteractions() {
      document.querySelectorAll('[data-jump-stage]').forEach((btn) => {
        btn.addEventListener('click', () => this.navigateToStage(btn.getAttribute('data-jump-stage')));
      });

      document.querySelectorAll('[data-local-video]').forEach((videoEl) => {
        const vidId = videoEl.getAttribute('data-local-video');
        videoEl.addEventListener('error', () => {
          const errBox = document.querySelector(`[data-video-error="${vidId}"]`);
          if (errBox) errBox.classList.remove('hidden');
        });
      });
    }

    /* ─────────────────────────────────────────────────────────────
       STAGE 3: LEARN
    ───────────────────────────────────────────────────────────── */
    renderLearnStage(mod) {
      const l = mod.learn;
      return `
        <div class="space-y-6">
          <p class="text-sm text-slate-700 font-medium leading-relaxed">${l.intro}</p>

          <!-- Web-Native Manageable Lesson Sections -->
          <div class="space-y-4">
            ${l.sections.map((sec) => `
              <section class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-3">
                <h3 class="text-base sm:text-lg font-black text-[#1E1B4B]">${sec.title}</h3>
                <p class="text-xs sm:text-sm text-slate-700 font-bold">${sec.summary}</p>
                <ul class="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                  ${sec.keyPoints.map((pt) => `<li class="flex items-start gap-2"><span class="text-indigo-600 font-black">▸</span><span>${this.escapeHtml(pt)}</span></li>`).join('')}
                </ul>
                ${sec.tip ? `
                  <div class="bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-950">
                    💡 <strong>Practical Tip:</strong> ${sec.tip}
                  </div>
                ` : ''}
              </section>
            `).join('')}
          </div>

          <!-- Slides, PDFs & Downloadable Study Packs -->
          <div class="pt-2 space-y-3">
            <h3 class="text-sm font-black uppercase tracking-wider text-indigo-800">📑 Presentations &amp; Downloadable Materials</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${l.resources.map((res) => {
                const isReady = res.status === 'ready' && res.url;
                return `
                  <div class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div class="flex items-center justify-between gap-2 mb-1.5">
                        <span class="text-[10px] font-black uppercase bg-indigo-100 text-[#1E1B4B] px-2 py-0.5 rounded border border-[#1E1B4B]">
                          ${res.format}
                        </span>
                        <span class="text-[10px] font-bold ${isReady ? 'text-emerald-700' : 'text-slate-500'}">
                          ${isReady ? '✓ Ready to download' : 'Preparing file'}
                        </span>
                      </div>
                      <h4 class="text-sm font-black text-[#1E1B4B]">${res.title}</h4>
                      <p class="text-xs text-slate-600 font-medium mt-1">${res.description}</p>
                    </div>
                    ${isReady ? `
                      <div class="flex gap-2">
                        <a href="${res.url}" target="_blank" rel="noopener noreferrer" download
                          class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-300 hover:bg-amber-400 text-[#1E1B4B] font-black text-xs border-2 border-[#1E1B4B]">
                          📥 Download ${res.format}
                        </a>
                      </div>
                    ` : `
                      <div class="text-[11px] font-bold text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-2">
                        Slide deck / handout link will appear here once uploaded by programme coordinators.
                      </div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    /* ─────────────────────────────────────────────────────────────
       STAGE 4: PRACTISE (INTERACTIVE CHALLENGES)
    ───────────────────────────────────────────────────────────── */
    renderPractiseStage(mod) {
      const p = mod.practise;
      const state = this.getModuleState();

      return `
        <div class="space-y-6">
          <div class="bg-indigo-50/70 rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-4">
            <div>
              <span class="text-[11px] font-black uppercase tracking-wider text-indigo-800">Practical Challenge</span>
              <h3 class="text-lg sm:text-xl font-black text-[#1E1B4B] mt-0.5">${p.title}</h3>
              <p class="text-xs sm:text-sm text-slate-700 font-medium mt-1"><strong>Objective:</strong> ${p.objective}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div class="bg-white rounded-xl border border-[#1E1B4B] p-4">
                <strong class="block text-xs uppercase text-indigo-900 mb-2">🧰 What You Need</strong>
                <ul class="space-y-1 text-slate-700 font-medium">
                  ${p.whatYouNeed.map((item) => `<li>• ${item}</li>`).join('')}
                </ul>
              </div>
              <div class="bg-white rounded-xl border border-[#1E1B4B] p-4">
                <strong class="block text-xs uppercase text-emerald-900 mb-2">🎯 Expected Outcome</strong>
                <p class="text-slate-700 font-medium leading-relaxed">${p.expectedOutcome}</p>
              </div>
            </div>

            <div class="bg-white rounded-xl border border-[#1E1B4B] p-4">
              <strong class="block text-xs uppercase text-[#1E1B4B] mb-2">🪜 Step-by-Step Instructions</strong>
              <ol class="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium list-decimal list-inside">
                ${p.steps.map((step) => `<li>${step}</li>`).join('')}
              </ol>
            </div>
          </div>

          <!-- Interactive Workspace Container -->
          <div class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-4 sm:p-6 shadow-[4px_4px_0px_#1E1B4B] space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h4 class="text-sm sm:text-base font-black text-[#1E1B4B]">⚡ Interactive Practice Workspace</h4>
              <span class="text-[10px] font-black uppercase bg-amber-200 text-[#1E1B4B] px-2.5 py-0.5 rounded-full border border-[#1E1B4B]">
                Hands-On Sandbox
              </span>
            </div>
            <div id="practiseSandboxMount"></div>
          </div>

          <!-- Practice Confirmation & Optional Note -->
          <div class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-3">
            <label for="practiceNoteInput" class="block text-xs font-black text-[#1E1B4B]">
              ${p.reflectionPrompt || 'Optional reflection on your challenge:'}
            </label>
            <textarea id="practiceNoteInput" rows="2"
              class="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-medium bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write a quick note about what you built or practised...">${this.escapeHtml(state.practiceNote)}</textarea>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span id="practiceStatusHint" class="text-xs font-bold ${state.practiceCompleted ? 'text-emerald-700' : 'text-slate-500'}">
                ${state.practiceCompleted ? '✓ Challenge confirmed complete!' : 'Complete the workspace above and confirm below when ready.'}
              </span>
              <button type="button" id="confirmPracticeBtn"
                class="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#1E1B4B] cursor-pointer ${
                  state.practiceCompleted
                    ? 'bg-emerald-300 text-[#1E1B4B]'
                    : 'bg-[#1E1B4B] hover:bg-indigo-900 text-white'
                }">
                ${state.practiceCompleted ? '✓ Saved Challenge Completion' : 'Confirm Challenge Completed ✓'}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    bindPractiseSandbox(mod) {
      const mount = document.getElementById('practiseSandboxMount');
      if (!mount) return;

      const session = window.BigMindsSession.get();
      const studentName = session.displayName || session.alias || 'Student Explorer';
      const type = mod.practise.sandboxType;

      if (type === 'personal-webpage') {
        mount.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="wpName">Your Heading Name</label>
                <input id="wpName" type="text" value="${this.escapeHtml(studentName)}" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-sm font-bold bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="wpBio">Short Personal Intro</label>
                <input id="wpBio" type="text" value="Curious student exploring web architecture and building digital tools." class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-medium bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="wpSkills">Skills / Interests (comma-separated)</label>
                <input id="wpSkills" type="text" value="HTML5, CSS Styling, Problem Solving" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-medium bg-white" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-black text-slate-700 mb-1" for="wpBtnLabel">Button Label</label>
                  <input id="wpBtnLabel" type="text" value="View My Projects" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs font-bold bg-white" />
                </div>
                <div>
                  <span class="block text-xs font-black text-slate-700 mb-1">Theme Accent</span>
                  <div class="flex gap-2">
                    <button type="button" class="wp-color w-8 h-8 rounded-lg border-2 border-[#1E1B4B] cursor-pointer" style="background:#4338CA" data-color="#4338CA" aria-label="Indigo"></button>
                    <button type="button" class="wp-color w-8 h-8 rounded-lg border-2 border-[#1E1B4B] cursor-pointer" style="background:#059669" data-color="#059669" aria-label="Emerald"></button>
                    <button type="button" class="wp-color w-8 h-8 rounded-lg border-2 border-[#1E1B4B] cursor-pointer" style="background:#D97706" data-color="#D97706" aria-label="Amber"></button>
                    <button type="button" class="wp-color w-8 h-8 rounded-lg border-2 border-[#1E1B4B] cursor-pointer" style="background:#DB2777" data-color="#DB2777" aria-label="Pink"></button>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-5 shadow-[3px_3px_0px_#1E1B4B] space-y-3" id="wpLiveCard">
                <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Webpage Preview</div>
                <h5 id="wpPreviewName" class="text-xl font-black text-[#1E1B4B]"></h5>
                <p id="wpPreviewBio" class="text-xs sm:text-sm text-slate-600 font-medium"></p>
                <div id="wpPreviewSkills" class="flex flex-wrap gap-1.5"></div>
                <button type="button" id="wpPreviewBtn" class="px-4 py-2 rounded-xl text-white font-black text-xs border-2 border-[#1E1B4B]"></button>
              </div>
              <pre id="wpCodeOut" class="bg-slate-900 text-emerald-300 p-3 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed"></pre>
            </div>
          </div>
        `;

        let accentColor = '#4338CA';
        const updateWebpage = () => {
          const nameVal = document.getElementById('wpName')?.value.trim() || 'Explorer';
          const bioVal = document.getElementById('wpBio')?.value.trim() || '';
          const skillsRaw = document.getElementById('wpSkills')?.value || '';
          const btnVal = document.getElementById('wpBtnLabel')?.value.trim() || 'Contact Me';
          const skillsArr = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);

          document.getElementById('wpPreviewName').textContent = nameVal;
          document.getElementById('wpPreviewBio').textContent = bioVal;
          document.getElementById('wpPreviewSkills').innerHTML = skillsArr.map((sk) =>
            `<span class="text-[11px] font-bold bg-slate-100 text-[#1E1B4B] px-2 py-0.5 rounded border border-slate-300">${this.escapeHtml(sk)}</span>`
          ).join('');
          const pBtn = document.getElementById('wpPreviewBtn');
          pBtn.textContent = btnVal;
          pBtn.style.backgroundColor = accentColor;

          document.getElementById('wpCodeOut').textContent =
`<section class="profile-card">
  <h1>${nameVal}</h1>
  <p>${bioVal}</p>
  <ul>${skillsArr.map((s) => `\n    <li>${s}</li>`).join('')}
  </ul>
  <button style="background:${accentColor}">${btnVal}</button>
</section>`;
        };

        ['wpName', 'wpBio', 'wpSkills', 'wpBtnLabel'].forEach((id) => {
          document.getElementById(id)?.addEventListener('input', updateWebpage);
        });
        mount.querySelectorAll('.wp-color').forEach((btn) => {
          btn.addEventListener('click', () => {
            accentColor = btn.getAttribute('data-color');
            updateWebpage();
          });
        });
        updateWebpage();

      } else if (type === 'promo-poster') {
        mount.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="posterHeadline">Main Headline (Hierarchy Level 1)</label>
                <input id="posterHeadline" type="text" value="TECH &amp; DESIGN SHOWCASE" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-sm font-black bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="posterDetails">Key Details (Level 2: When &amp; Where)</label>
                <input id="posterDetails" type="text" value="Friday, 2:00 PM • School Innovation Hall" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-semibold bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="posterCta">Action Line (Level 3)</label>
                <input id="posterCta" type="text" value="Free Entry • Bring Your Ideas" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs font-bold bg-white" />
              </div>
              <div>
                <span class="block text-xs font-black text-slate-700 mb-1.5">High-Contrast Colour Palette</span>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" class="poster-pal p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-xs font-black text-left cursor-pointer" data-bg="#1E1B4B" data-fg="#FFFFFF" data-acc="#FCD34D">
                    Indigo &amp; Gold
                  </button>
                  <button type="button" class="poster-pal p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-xs font-black text-left cursor-pointer" data-bg="#064E3B" data-fg="#FFFFFF" data-acc="#6EE7B7">
                    Forest &amp; Mint
                  </button>
                  <button type="button" class="poster-pal p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-xs font-black text-left cursor-pointer" data-bg="#FDFBF7" data-fg="#1E1B4B" data-acc="#F59E0B">
                    Cream &amp; Indigo
                  </button>
                  <button type="button" class="poster-pal p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-xs font-black text-left cursor-pointer" data-bg="#831843" data-fg="#FFFFFF" data-acc="#FDE047">
                    Berry &amp; Yellow
                  </button>
                </div>
              </div>
            </div>

            <div id="posterCanvas" class="rounded-2xl border-4 border-[#1E1B4B] p-6 min-h-[260px] flex flex-col justify-between shadow-[5px_5px_0px_#1E1B4B]" style="background:#1E1B4B;color:#FFFFFF;">
              <div class="text-[10px] font-black uppercase tracking-widest opacity-80">Live Poster Mockup</div>
              <div class="my-4 space-y-2">
                <h5 id="posterOutHead" class="text-2xl sm:text-3xl font-black leading-tight font-heading">TECH &amp; DESIGN SHOWCASE</h5>
                <p id="posterOutDet" class="text-xs sm:text-sm font-bold opacity-90">Friday, 2:00 PM • School Innovation Hall</p>
              </div>
              <div>
                <span id="posterOutCta" class="inline-block px-3.5 py-2 rounded-xl text-xs font-black text-[#1E1B4B]" style="background:#FCD34D;">
                  Free Entry • Bring Your Ideas
                </span>
              </div>
            </div>
          </div>
        `;

        const updatePoster = () => {
          document.getElementById('posterOutHead').textContent = document.getElementById('posterHeadline')?.value || 'YOUR HEADLINE';
          document.getElementById('posterOutDet').textContent = document.getElementById('posterDetails')?.value || 'Date & Location';
          document.getElementById('posterOutCta').textContent = document.getElementById('posterCta')?.value || 'Join Us';
        };
        ['posterHeadline', 'posterDetails', 'posterCta'].forEach((id) => {
          document.getElementById(id)?.addEventListener('input', updatePoster);
        });
        mount.querySelectorAll('.poster-pal').forEach((btn) => {
          btn.addEventListener('click', () => {
            const canvas = document.getElementById('posterCanvas');
            const cta = document.getElementById('posterOutCta');
            canvas.style.backgroundColor = btn.getAttribute('data-bg');
            canvas.style.color = btn.getAttribute('data-fg');
            cta.style.backgroundColor = btn.getAttribute('data-acc');
          });
        });

      } else if (type === 'weekly-budget') {
        const currCode = session.selectedCurrency || 'NGN';
        const currSymbol = window.CurrencyHelper ? window.CurrencyHelper.getCurrencyInfo(currCode).symbol : '₦';
        mount.innerHTML = `
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-300">
              <div>
                <label class="text-xs font-black text-[#1E1B4B] block" for="wbAllowance">Weekly Allowance / Budget (${currSymbol})</label>
                <input id="wbAllowance" type="number" min="100" step="100" value="10000"
                  class="mt-1 w-40 px-3 py-1.5 rounded-lg border-2 border-[#1E1B4B] font-mono font-black text-sm" />
              </div>
              <div>
                <span class="text-[11px] font-black text-slate-500 block mb-1">Display Currency</span>
                <div id="wbCurrencyWrap"></div>
              </div>
            </div>

            <div class="space-y-3 bg-white p-4 rounded-xl border border-slate-300 text-xs sm:text-sm">
              <div>
                <div class="flex justify-between font-bold mb-1">
                  <span>🍽️ Essentials (Food &amp; Study Needs)</span>
                  <span id="wbFoodPct" class="font-black text-[#1E1B4B]">45%</span>
                </div>
                <input id="wbFood" type="range" min="10" max="70" value="45" class="w-full accent-indigo-600" />
              </div>
              <div>
                <div class="flex justify-between font-bold mb-1">
                  <span>🚌 Transport &amp; Mobile Data</span>
                  <span id="wbDataPct" class="font-black text-[#1E1B4B]">20%</span>
                </div>
                <input id="wbData" type="range" min="5" max="45" value="20" class="w-full accent-indigo-600" />
              </div>
              <div>
                <div class="flex justify-between font-bold mb-1">
                  <span>🎯 Flexible Wants (Snacks &amp; Outings)</span>
                  <span id="wbWantsPct" class="font-black text-[#1E1B4B]">15%</span>
                </div>
                <input id="wbWants" type="range" min="0" max="40" value="15" class="w-full accent-amber-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center" id="wbTotalsRow"></div>
            <div id="wbFeedback" class="p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-bold"></div>
          </div>
        `;

        if (window.CurrencyHelper) {
          window.CurrencyHelper.renderSelector('wbCurrencyWrap', {
            className: 'px-2.5 py-1.5 rounded-lg border-2 border-[#1E1B4B] text-xs font-bold bg-[#FDFBF7]',
            selected: currCode,
            onChange: (newCode) => {
              window.BigMindsSession.save({ selectedCurrency: newCode });
              recalcBudget();
            }
          });
        }

        const recalcBudget = () => {
          const cur = window.BigMindsSession.get().selectedCurrency || 'NGN';
          const sym = window.CurrencyHelper ? window.CurrencyHelper.getCurrencyInfo(cur).symbol : curr;
          const total = Math.max(0, Number(document.getElementById('wbAllowance')?.value) || 0);
          const f = Number(document.getElementById('wbFood')?.value) || 0;
          const d = Number(document.getElementById('wbData')?.value) || 0;
          const w = Number(document.getElementById('wbWants')?.value) || 0;
          const savePct = 100 - f - d - w;

          document.getElementById('wbFoodPct').textContent = `${f}% (${sym}${Math.round(total * f / 100).toLocaleString()})`;
          document.getElementById('wbDataPct').textContent = `${d}% (${sym}${Math.round(total * d / 100).toLocaleString()})`;
          document.getElementById('wbWantsPct').textContent = `${w}% (${sym}${Math.round(total * w / 100).toLocaleString()})`;

          const saveAmt = Math.round(total * savePct / 100);
          document.getElementById('wbTotalsRow').innerHTML = `
            <div class="bg-white p-2.5 rounded-xl border border-slate-300"><span class="text-[10px] font-bold text-slate-500 block">Essentials</span><strong>${sym}${Math.round(total * f / 100).toLocaleString()}</strong></div>
            <div class="bg-white p-2.5 rounded-xl border border-slate-300"><span class="text-[10px] font-bold text-slate-500 block">Transport/Data</span><strong>${sym}${Math.round(total * d / 100).toLocaleString()}</strong></div>
            <div class="bg-white p-2.5 rounded-xl border border-slate-300"><span class="text-[10px] font-bold text-slate-500 block">Wants</span><strong>${sym}${Math.round(total * w / 100).toLocaleString()}</strong></div>
            <div class="p-2.5 rounded-xl border-2 border-[#1E1B4B] ${savePct >= 15 ? 'bg-emerald-100' : savePct > 0 ? 'bg-amber-100' : 'bg-rose-100'}"><span class="text-[10px] font-black block">Savings (${savePct}%)</span><strong>${sym}${saveAmt.toLocaleString()}</strong></div>
          `;

          const fb = document.getElementById('wbFeedback');
          if (savePct >= 20) {
            fb.className = 'p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-950';
            fb.textContent = `👏 Healthy weekly balance! Saving ${savePct}% builds steady protection for unexpected school costs.`;
          } else if (savePct > 0) {
            fb.className = 'p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-bold bg-amber-100 text-amber-950';
            fb.textContent = `⚠️ Tight cushion (${savePct}% saved). Reducing Wants slightly gives more breathing room.`;
          } else {
            fb.className = 'p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-bold bg-rose-100 text-rose-950';
            fb.textContent = `🚨 Over-allocated (${savePct}%). Your planned spending exceeds 100% of your weekly budget—lower Wants or adjust Food/Data.`;
          }
        };

        ['wbAllowance', 'wbFood', 'wbData', 'wbWants'].forEach((id) => {
          document.getElementById(id)?.addEventListener('input', recalcBudget);
        });
        recalcBudget();

      } else if (type === 'speech-rehearsal') {
        mount.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="space-y-2.5">
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="spHook">1. Hook (10s)</label>
                <input id="spHook" type="text" placeholder="Did you know that most students never practise speaking until exam week?" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="spPoint">2. Core Message (20s)</label>
                <input id="spPoint" type="text" placeholder="Short weekly practice clubs help every student speak clearly under pressure." class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="spProof">3. Proof or Story (20s)</label>
                <input id="spProof" type="text" placeholder="Even spending 5 minutes sharing one idea builds real vocal confidence." class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="spCta">4. Closing Call to Action (10s)</label>
                <input id="spCta" type="text" placeholder="Pick one topic today and deliver your first 60-second talk!" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm bg-white" />
              </div>
            </div>

            <div class="space-y-3">
              <div class="bg-amber-50 rounded-2xl border-2 border-[#1E1B4B] p-4 flex items-center justify-between gap-3">
                <div>
                  <span class="text-[10px] font-black uppercase text-amber-900 block">60-Second Rehearsal Timer</span>
                  <span id="spTimerVal" class="text-3xl font-black font-mono text-[#1E1B4B]">60s</span>
                </div>
                <div class="flex gap-2">
                  <button type="button" id="spStartBtn" class="px-3.5 py-2 rounded-xl bg-amber-300 hover:bg-amber-400 text-[#1E1B4B] font-black text-xs border-2 border-[#1E1B4B] cursor-pointer">▶ Start</button>
                  <button type="button" id="spResetBtn" class="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#1E1B4B] font-black text-xs border-2 border-[#1E1B4B] cursor-pointer">Reset</button>
                </div>
              </div>

              <div class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-4 space-y-2">
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Cue Card Preview</span>
                  <span id="spWordStats">0 words (~0s spoken)</span>
                </div>
                <p id="spPreviewText" class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  Fill in the 4 speech beats on the left to build your cue card.
                </p>
              </div>
            </div>
          </div>
        `;

        const updateSpeech = () => {
          const parts = ['spHook', 'spPoint', 'spProof', 'spCta']
            .map((id) => document.getElementById(id)?.value.trim() || '')
            .filter(Boolean);
          const combined = parts.join('\n\n');
          const words = combined ? combined.split(/\s+/).length : 0;
          const estSec = Math.round((words / 135) * 60);
          document.getElementById('spWordStats').textContent = `${words} words (~${estSec}s spoken)`;
          document.getElementById('spPreviewText').textContent = combined || 'Fill in the 4 speech beats to assemble your cue card.';
        };
        ['spHook', 'spPoint', 'spProof', 'spCta'].forEach((id) => {
          document.getElementById(id)?.addEventListener('input', updateSpeech);
        });

        let secondsLeft = 60;
        const timerEl = document.getElementById('spTimerVal');
        document.getElementById('spStartBtn')?.addEventListener('click', () => {
          if (this.timerInterval) clearInterval(this.timerInterval);
          secondsLeft = 60;
          timerEl.textContent = '60s';
          this.timerInterval = setInterval(() => {
            secondsLeft -= 1;
            timerEl.textContent = `${Math.max(0, secondsLeft)}s`;
            if (secondsLeft <= 0) {
              clearInterval(this.timerInterval);
              this.timerInterval = null;
              window.BigMindsUI.showToast('⏱️ 60 seconds complete! Great rehearsal!');
            }
          }, 1000);
        });
        document.getElementById('spResetBtn')?.addEventListener('click', () => {
          if (this.timerInterval) clearInterval(this.timerInterval);
          this.timerInterval = null;
          secondsLeft = 60;
          timerEl.textContent = '60s';
        });

      } else if (type === 'venture-pitch') {
        const currCode = session.selectedCurrency || 'NGN';
        const sym = window.CurrencyHelper ? window.CurrencyHelper.getCurrencyInfo(currCode).symbol : '₦';
        mount.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="vpName">Venture / Idea Name</label>
                <input id="vpName" type="text" placeholder="e.g. StudyPack Express" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-sm font-bold bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="vpProblem">Target Customer &amp; Problem</label>
                <input id="vpProblem" type="text" placeholder="Exam students spend too much time hunting scattered past questions." class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm bg-white" />
              </div>
              <div>
                <label class="block text-xs font-black text-slate-700 mb-1" for="vpMvp">48-Hour Lean MVP Solution</label>
                <input id="vpMvp" type="text" placeholder="Curated topic bundles delivered via WhatsApp PDF + printed starter pack." class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm bg-white" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-black text-slate-700 mb-1" for="vpCost">Unit Cost (${sym})</label>
                  <input id="vpCost" type="number" value="1200" min="0" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs font-mono font-bold bg-white" />
                </div>
                <div>
                  <label class="block text-xs font-black text-slate-700 mb-1" for="vpPrice">Selling Price (${sym})</label>
                  <input id="vpPrice" type="number" value="2000" min="0" class="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] text-xs font-mono font-bold bg-white" />
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div id="vpEconBox" class="p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs font-bold"></div>
              <div class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-4 space-y-2">
                <span class="text-[10px] font-black uppercase tracking-wider text-purple-800">Generated 45-Second Venture Pitch</span>
                <p id="vpPitchOut" class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed"></p>
              </div>
            </div>
          </div>
        `;

        const updateVenture = () => {
          const name = document.getElementById('vpName')?.value.trim() || 'Our Venture';
          const prob = document.getElementById('vpProblem')?.value.trim() || 'customers face an everyday inconvenience';
          const mvp = document.getElementById('vpMvp')?.value.trim() || 'a lean, testable first version of our solution';
          const cost = Number(document.getElementById('vpCost')?.value) || 0;
          const price = Number(document.getElementById('vpPrice')?.value) || 0;
          const profit = price - cost;
          const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

          const econ = document.getElementById('vpEconBox');
          if (price <= cost) {
            econ.className = 'p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs font-bold bg-rose-100 text-rose-950';
            econ.textContent = `⚠️ Unit Margin Check: Selling price (${sym}${price.toLocaleString()}) must exceed cost (${sym}${cost.toLocaleString()}) to avoid losing money.`;
          } else {
            econ.className = 'p-3.5 rounded-xl border-2 border-[#1E1B4B] text-xs font-bold bg-emerald-100 text-emerald-950';
            econ.textContent = `✓ Healthy Unit Profit: ${sym}${profit.toLocaleString()} per unit (${margin}% gross margin).`;
          }

          document.getElementById('vpPitchOut').textContent =
            `"Have you noticed how ${prob}? We created ${name} to solve that directly. Starting this week with ${mvp}, we price each unit at ${sym}${price.toLocaleString()} against a ${sym}${cost.toLocaleString()} unit cost—making it sustainable right from our first pilot test!"`;
        };
        ['vpName', 'vpProblem', 'vpMvp', 'vpCost', 'vpPrice'].forEach((id) => {
          document.getElementById(id)?.addEventListener('input', updateVenture);
        });
        updateVenture();
      }

      document.getElementById('confirmPracticeBtn')?.addEventListener('click', () => {
        const note = document.getElementById('practiceNoteInput')?.value.trim() || '';
        const prev = this.getModuleState();
        const completed = prev.completedStages.includes('practise')
          ? prev.completedStages
          : [...prev.completedStages, 'practise'];

        this.saveModuleState({
          practiceNote: note,
          practiceCompleted: true,
          completedStages: completed
        });

        this.renderModuleHeader();
        this.renderStageNavigation();
        this.renderStageFooterNav();

        const btn = document.getElementById('confirmPracticeBtn');
        const hint = document.getElementById('practiceStatusHint');
        if (btn) {
          btn.textContent = '✓ Saved Challenge Completion';
          btn.className = 'px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#1E1B4B] cursor-pointer bg-emerald-300 text-[#1E1B4B]';
        }
        if (hint) {
          hint.className = 'text-xs font-bold text-emerald-700';
          hint.textContent = '✓ Challenge confirmed complete!';
        }
        window.BigMindsUI.showToast('🛠️ Practice challenge saved!');
      });
    }

    /* ─────────────────────────────────────────────────────────────
       STAGE 5: REFLECT
    ───────────────────────────────────────────────────────────── */
    renderReflectStage(mod) {
      const r = mod.reflect;
      const state = this.getModuleState();

      return `
        <div class="space-y-6">
          <p class="text-sm text-slate-700 font-medium leading-relaxed">${r.intro}</p>

          <!-- Knowledge Checks -->
          <div class="space-y-4">
            ${r.knowledgeChecks.map((kc, qIdx) => {
              const savedChoice = state.quizAnswers[kc.id];
              const hasAnswered = savedChoice !== undefined && savedChoice !== null;
              const isCorrect = savedChoice === kc.correctIndex;
              return `
                <div class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-3" data-kc-card="${kc.id}">
                  <h3 class="text-sm sm:text-base font-black text-[#1E1B4B]">
                    Quick Check ${qIdx + 1}: ${kc.question}
                  </h3>
                  <div class="space-y-2">
                    ${kc.options.map((opt, optIdx) => {
                      const checked = savedChoice === optIdx;
                      return `
                        <label class="flex items-start gap-2.5 p-3 rounded-xl border-2 ${checked ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 bg-white hover:bg-slate-50'} cursor-pointer text-xs sm:text-sm font-bold text-slate-800">
                          <input type="radio" name="kc_${kc.id}" value="${optIdx}" class="mt-0.5 accent-indigo-600" ${checked ? 'checked' : ''} />
                          <span>${this.escapeHtml(opt)}</span>
                        </label>
                      `;
                    }).join('')}
                  </div>
                  <div id="kcFeedback_${kc.id}" class="${hasAnswered ? '' : 'hidden'} p-3 rounded-xl border text-xs font-bold ${isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : 'bg-amber-50 border-amber-400 text-amber-950'}">
                    ${hasAnswered ? `${isCorrect ? '✓ Spot on!' : '💡 Good try!'} ${kc.explanation}` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Written Reflection + Self-Assessment -->
          <form id="moduleReflectForm" class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-4">
            <div>
              <label for="reflectWrittenInput" class="block text-sm font-black text-[#1E1B4B] mb-1.5">
                Short Written Reflection
              </label>
              <p class="text-xs text-slate-600 font-medium mb-2">${r.writtenPrompt}</p>
              <textarea id="reflectWrittenInput" rows="3"
                class="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#1E1B4B] text-xs sm:text-sm font-medium bg-[#FDFBF7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write a brief thought (no personal contact info needed)...">${this.escapeHtml(state.reflectionNote)}</textarea>
            </div>

            <div>
              <span class="block text-sm font-black text-[#1E1B4B] mb-2">${r.selfAssessmentPrompt}</span>
              <div class="grid grid-cols-5 gap-2">
                ${[1, 2, 3, 4, 5].map((num) => {
                  const selected = Number(state.confidenceRating) === num;
                  return `
                    <button type="button" data-conf-rating="${num}"
                      class="py-2.5 px-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                        selected
                          ? 'bg-amber-300 text-[#1E1B4B] border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B]'
                          : 'bg-[#FDFBF7] hover:bg-slate-100 text-slate-700 border-slate-300'
                      }">
                      ${num}/5
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span id="reflectSaveHint" class="text-xs font-bold text-slate-500">
                Responses save anonymously to your session progress.
              </span>
              <button type="submit"
                class="px-5 py-3 rounded-xl bg-[#1E1B4B] hover:bg-indigo-900 text-white font-black text-xs sm:text-sm border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#F59E0B] cursor-pointer">
                Save Reflection ✓
              </button>
            </div>
          </form>
        </div>
      `;
    }

    bindReflectInteractions(mod) {
      let chosenConfidence = this.getModuleState().confidenceRating;

      mod.reflect.knowledgeChecks.forEach((kc) => {
        document.querySelectorAll(`input[name="kc_${kc.id}"]`).forEach((radio) => {
          radio.addEventListener('change', () => {
            const val = Number(radio.value);
            const prev = this.getModuleState();
            const quizAnswers = { ...prev.quizAnswers, [kc.id]: val };
            this.saveModuleState({ quizAnswers });

            const fb = document.getElementById(`kcFeedback_${kc.id}`);
            const isCorrect = val === kc.correctIndex;
            if (fb) {
              fb.classList.remove('hidden');
              fb.className = `p-3 rounded-xl border text-xs font-bold ${isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : 'bg-amber-50 border-amber-400 text-amber-950'}`;
              fb.textContent = `${isCorrect ? '✓ Spot on!' : '💡 Good try!'} ${kc.explanation}`;
            }
          });
        });
      });

      document.querySelectorAll('[data-conf-rating]').forEach((btn) => {
        btn.addEventListener('click', () => {
          chosenConfidence = Number(btn.getAttribute('data-conf-rating'));
          document.querySelectorAll('[data-conf-rating]').forEach((other) => {
            const isThis = Number(other.getAttribute('data-conf-rating')) === chosenConfidence;
            other.className = `py-2.5 px-2 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
              isThis
                ? 'bg-amber-300 text-[#1E1B4B] border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B]'
                : 'bg-[#FDFBF7] hover:bg-slate-100 text-slate-700 border-slate-300'
            }`;
          });
        });
      });

      document.getElementById('moduleReflectForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const note = document.getElementById('reflectWrittenInput')?.value.trim() || '';
        const prev = this.getModuleState();
        const completed = prev.completedStages.includes('reflect')
          ? prev.completedStages
          : [...prev.completedStages, 'reflect'];

        this.saveModuleState({
          reflectionNote: note,
          confidenceRating: chosenConfidence || null,
          completedStages: completed
        });

        const hint = document.getElementById('reflectSaveHint');
        if (hint) {
          hint.className = 'text-xs font-bold text-emerald-700';
          hint.textContent = '✓ Reflection saved to your progress!';
        }
        this.renderModuleHeader();
        this.renderStageNavigation();
        this.renderStageFooterNav();
        window.BigMindsUI.showToast('💭 Reflection recorded!');
      });
    }

    /* ─────────────────────────────────────────────────────────────
       STAGE 6: EXPLORE FURTHER
    ───────────────────────────────────────────────────────────── */
    renderExploreFurtherStage(mod) {
      const ef = mod.exploreFurther;
      const relatedMods = (ef.relatedSlugs || [])
        .map((s) => window.getMentorshipModuleBySlug(s))
        .filter(Boolean);

      return `
        <div class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-3">
              <h3 class="text-base font-black text-[#1E1B4B]">🧰 Recommended Beginner Tools</h3>
              <div class="space-y-3">
                ${ef.tools.map((tool) => `
                  <div class="bg-white rounded-xl border border-slate-300 p-3.5">
                    <div class="text-sm font-black text-[#1E1B4B]">${tool.name}</div>
                    <p class="text-xs text-slate-600 font-medium mt-1">${tool.description}</p>
                    ${tool.note ? `<p class="text-[11px] font-bold text-indigo-800 mt-1">💡 ${tool.note}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-[#FDFBF7] rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-2.5">
                <h3 class="text-base font-black text-[#1E1B4B]">🪜 Suggested Next Steps</h3>
                <ul class="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                  ${ef.nextSteps.map((st) => `<li class="flex items-start gap-2"><span class="text-emerald-600 font-black">→</span><span>${st}</span></li>`).join('')}
                </ul>
              </div>

              <div class="bg-white rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-2.5">
                <h3 class="text-base font-black text-[#1E1B4B]">🎓 Education &amp; Career Pathways</h3>
                <ul class="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
                  ${ef.educationAndCareers.map((ec) => `<li class="flex items-start gap-2"><span class="text-indigo-600 font-black">•</span><span>${ec}</span></li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <!-- Related Modules & Pathway Explorer -->
          <div class="bg-indigo-50/70 rounded-2xl border-2 border-[#1E1B4B] p-5 space-y-3">
            <h3 class="text-sm font-black uppercase tracking-wider text-[#1E1B4B]">🔗 Related Big Minds Modules</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${relatedMods.map((rm) => `
                <a href="module.html?area=${rm.slug}"
                   class="bg-white hover:bg-amber-100 rounded-2xl border-2 border-[#1E1B4B] p-4 shadow-[3px_3px_0px_#1E1B4B] flex items-center gap-3 transition-all">
                  <span class="text-2xl">${rm.icon}</span>
                  <div>
                    <div class="text-sm font-black text-[#1E1B4B]">${rm.shortTitle}</div>
                    <div class="text-[11px] font-bold text-indigo-700">Open module →</div>
                  </div>
                </a>
              `).join('')}

              <a href="explore.html?interest=${encodeURIComponent(mod.interestTag)}"
                 class="bg-amber-300 hover:bg-amber-400 rounded-2xl border-2 border-[#1E1B4B] p-4 shadow-[3px_3px_0px_#1E1B4B] flex items-center gap-3 transition-all">
                <span class="text-2xl">🧭</span>
                <div>
                  <div class="text-sm font-black text-[#1E1B4B]">Interactive Pathway Map</div>
                  <div class="text-[11px] font-bold text-[#1E1B4B]">See connected nodes →</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    /* ─────────────────────────────────────────────────────────────
       BOTTOM STAGE CONTROLS (MARK COMPLETE & PREV / NEXT)
    ───────────────────────────────────────────────────────────── */
    renderStageFooterNav() {
      const footerBar = document.getElementById('moduleStageFooter');
      if (!footerBar) return;

      const idx = this.stages.findIndex((s) => s.id === this.currentStageId);
      const prevStage = idx > 0 ? this.stages[idx - 1] : null;
      const nextStage = idx < this.stages.length - 1 ? this.stages[idx + 1] : null;
      const state = this.getModuleState();
      const isDone = state.completedStages.includes(this.currentStageId);
      const activeStage = this.stages[idx];

      footerBar.innerHTML = `
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            ${prevStage ? `
              <button type="button" id="stagePrevBtn"
                class="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#1E1B4B] font-black text-xs border-2 border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B] cursor-pointer">
                ← ${prevStage.label}
              </button>
            ` : `
              <a href="mentorship.html"
                class="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#1E1B4B] font-black text-xs border-2 border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B] text-center">
                ← All Areas
              </a>
            `}
          </div>

          <button type="button" id="stageMarkCompleteBtn"
            class="px-5 py-3 rounded-xl font-black text-xs border-2 border-[#1E1B4B] shadow-[2px_2px_0px_#1E1B4B] cursor-pointer transition-all ${
              isDone
                ? 'bg-emerald-300 hover:bg-emerald-400 text-[#1E1B4B]'
                : 'bg-[#FDFBF7] hover:bg-emerald-100 text-[#1E1B4B]'
            }">
            ${isDone ? `✓ "${activeStage.label}" Explored (Tap to Undo)` : `Mark "${activeStage.label}" Explored ✓`}
          </button>

          <div class="flex items-center gap-2">
            ${nextStage ? `
              <button type="button" id="stageNextBtn"
                class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#1E1B4B] hover:bg-indigo-900 text-white font-black text-xs border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#F59E0B] cursor-pointer">
                Next: ${nextStage.label} →
              </button>
            ` : `
              <a href="progress.html"
                class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-amber-300 hover:bg-amber-400 text-[#1E1B4B] font-black text-xs border-2 border-[#1E1B4B] shadow-[3px_3px_0px_#1E1B4B] text-center">
                View Progress &amp; Certificate 🏆 →
              </a>
            `}
          </div>
        </div>
      `;

      document.getElementById('stagePrevBtn')?.addEventListener('click', () => {
        if (prevStage) this.navigateToStage(prevStage.id);
      });
      document.getElementById('stageNextBtn')?.addEventListener('click', () => {
        if (nextStage) this.navigateToStage(nextStage.id);
      });
      document.getElementById('stageMarkCompleteBtn')?.addEventListener('click', () => {
        this.toggleStageComplete(this.currentStageId);
      });
    }

    escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.BigMindsUI) {
      window.BigMindsUI.renderHeader({ activeRoute: 'mentorship' });
      window.BigMindsUI.renderFooter();
    }
    window.mentorshipModuleApp = new MentorshipModuleApp();
  });
})(window);
