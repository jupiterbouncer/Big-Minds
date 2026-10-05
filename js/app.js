/**
 * Big Minds — Interactive Interest & Pathway Explorer
 * Leadership IV Service Project for Crown Prince Academy, Lapaz
 * 
 * Main Application Controller (BigMindsApp)
 */

class BigMindsApp {
  constructor() {
    this.storageKey = 'bigminds_student_session';
    
    // Application State
    this.state = {
      activeInterests: [],
      exploredIds: [],
      selectedNodeId: null,
      studentName: 'Explorer',
      avatarOutfit: '🔬',
      avatarVibe: '⭐'
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
    this.dom = {
      interestBadges: document.getElementById('interestBadges'),
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
      activityTitle: document.getElementById('activityTitle'),
      activityDesc: document.getElementById('activityDesc'),
      activitySandbox: document.getElementById('activitySandbox'),
      toggleExploredBtn: document.getElementById('toggleExploredBtn'),
      
      // Archetype 2042 UI
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
      clearStateBtn: document.getElementById('clearStateBtn'),
      nextStudentBtn: document.getElementById('nextStudentBtn')
    };

    // Attach Event Listeners & Boot
    this.initEventListeners();
    this.renderInterestBadges();
    this.updateProgress();
    this.refreshCanvas();
  }

  /* ─────────────────────────────────────────────────────────────
     STATE & LOCAL STORAGE
  ───────────────────────────────────────────────────────────── */
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Unable to load from localStorage', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        activeInterests: this.state.activeInterests,
        exploredIds: this.state.exploredIds,
        studentName: this.state.studentName,
        avatarOutfit: this.state.avatarOutfit,
        avatarVibe: this.state.avatarVibe
      }));
    } catch (e) {
      console.warn('Unable to save to localStorage', e);
    }
  }

  resetForNextStudent() {
    const confirmed = window.confirm(
      "Ready for the next student?\n\nThis will clear current exploration progress so your classmate can start fresh!"
    );
    if (!confirmed) return;

    this.state.activeInterests = [];
    this.state.exploredIds = [];
    this.state.selectedNodeId = null;
    this.state.avatarOutfit = '🔬';
    this.state.avatarVibe = '⭐';
    
    this.saveState();
    this.closeDrawer();
    this.renderInterestBadges();
    this.updateProgress();
    this.canvasEngine.resetView();
    this.refreshCanvas();

    this.showToast('Ready for the next Big Mind! ✨ Welcome!');
  }

  /* ─────────────────────────────────────────────────────────────
     UI EVENT LISTENERS
  ───────────────────────────────────────────────────────────── */
  initEventListeners() {
    // Drawer handlers
    this.dom.closeDrawerBtn?.addEventListener('click', () => this.closeDrawer());
    this.dom.drawerBackdrop?.addEventListener('click', () => this.closeDrawer());
    
    this.dom.toggleExploredBtn?.addEventListener('click', () => {
      this.toggleCurrentNodeExplored();
    });

    // Zoom & Canvas Controls
    this.dom.zoomInBtn?.addEventListener('click', () => this.canvasEngine.zoomIn());
    this.dom.zoomOutBtn?.addEventListener('click', () => this.canvasEngine.zoomOut());
    this.dom.resetViewBtn?.addEventListener('click', () => this.canvasEngine.resetView());
    
    // Next Student / Reset Progress
    this.dom.clearStateBtn?.addEventListener('click', () => this.resetForNextStudent());
    this.dom.nextStudentBtn?.addEventListener('click', () => this.resetForNextStudent());

    // Quiz Open / Close
    this.dom.takeQuizBtn?.addEventListener('click', () => this.openQuiz());
    this.dom.mobileQuizBtn?.addEventListener('click', () => this.openQuiz());
    this.dom.closeQuizBtn?.addEventListener('click', () => this.closeQuiz());
    this.dom.submitQuizBtn?.addEventListener('click', () => this.submitQuiz());

    // Window keyboard navigation (Escape closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDrawer();
        this.closeQuiz();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     INTEREST BADGES
  ───────────────────────────────────────────────────────────── */
  renderInterestBadges() {
    if (!this.dom.interestBadges) return;
    this.dom.interestBadges.innerHTML = '';

    const categories = Object.keys(CATEGORY_COLORS);
    categories.forEach(category => {
      const conf = CATEGORY_COLORS[category];
      const isSelected = this.state.activeInterests.includes(category);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `interest-badge text-xs font-black px-3 py-1.5 rounded-xl border-2 border-slate-900 transition-all select-none flex items-center gap-1.5 ${
        isSelected
          ? `${conf.bg} ${conf.text} shadow-[2px_2px_0px_#0F172A] scale-105 ring-2 ring-indigo-500`
          : 'bg-white text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#0F172A]'
      }`;

      btn.innerHTML = `
        <span>${isSelected ? '●' : '○'}</span>
        <span>${category}</span>
      `;

      btn.addEventListener('click', () => {
        this.toggleInterest(category);
      });

      this.dom.interestBadges.appendChild(btn);
    });
  }

  toggleInterest(category) {
    const idx = this.state.activeInterests.indexOf(category);
    if (idx > -1) {
      this.state.activeInterests.splice(idx, 1);
    } else {
      if (this.state.activeInterests.length >= 3) {
        // Shift oldest if already 3 chosen
        this.state.activeInterests.shift();
      }
      this.state.activeInterests.push(category);
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
    if (this.dom.progressPercent) this.dom.progressPercent.textContent = `${percent}% Discovered`;
    if (this.dom.progressBar) this.dom.progressBar.style.width = `${percent}%`;
  }

  /* ─────────────────────────────────────────────────────────────
     DRAWER: NODE DISCOVERY & 2042 LIFE SIMULATION
  ───────────────────────────────────────────────────────────── */
  openDrawer(node) {
    this.state.selectedNodeId = node.id;
    this.refreshCanvas();

    if (this.dom.drawerTitle) this.dom.drawerTitle.textContent = node.title;
    if (this.dom.drawerDesc) this.dom.drawerDesc.textContent = node.shortDescription;

    // Tags
    if (this.dom.drawerTags) {
      this.dom.drawerTags.innerHTML = node.interestTags.map(tag => {
        const conf = CATEGORY_COLORS[tag] || { bg: 'bg-slate-100', text: 'text-slate-900' };
        return `<span class="text-xs font-black px-2.5 py-1 rounded-lg border-2 border-slate-900 ${conf.bg} ${conf.text} shadow-[2px_2px_0px_#0F172A]">${tag}</span>`;
      }).join('');
    }

    // Micro Activity
    if (this.dom.activityTitle) this.dom.activityTitle.textContent = `⚡ ${node.activity.title}`;
    if (this.dom.activityDesc) this.dom.activityDesc.textContent = node.activity.description;
    this.renderActivitySandbox(node.activity);

    // 2042 Life Simulation & Role Models
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
      this.showToast('🎉 Awesome! Pathway marked as explored!');
    }

    this.saveState();
    this.updateProgress();
    this.updateDrawerExploredBtn();
    this.refreshCanvas();
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
     PRIVACY-SAFE 2042 LIFE SIMULATION & AVATAR BUILDER
  ───────────────────────────────────────────────────────────── */
  renderArchetypeSection(node) {
    if (!this.dom.archetypeContainer) return;
    const arch = node.archetype;
    if (!arch) {
      this.dom.archetypeContainer.innerHTML = '';
      return;
    }

    const outfits = ['🔬', '💻', '🎨', '🚀', '🌱', '⚙️', '🩺', '👔'];
    const vibes = ['⭐', '⚡', '💡', '🌈', '🔥', '🌍'];

    this.dom.archetypeContainer.innerHTML = `
      <div class="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-gradient-to-br from-amber-50 via-indigo-50 to-purple-50 p-4 shadow-[4px_4px_0px_#0F172A] mb-6">
        <!-- Year Cloud Badge -->
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-3 py-1 rounded-full shadow-xs">
            ☁️ Year 2042 Life Simulation
          </span>
          <span class="text-[10px] font-bold text-slate-500">16 Years Ahead</span>
        </div>

        <!-- Future Archetype Title -->
        <h4 class="text-lg font-black text-slate-900 mb-1 leading-snug">
          ${arch.title}
        </h4>

        <!-- Future Story -->
        <p class="text-xs text-slate-700 font-medium leading-relaxed mb-4">
          "${arch.story}"
        </p>

        <!-- Privacy-Safe Future Avatar Builder -->
        <div class="bg-white/90 backdrop-blur-xs rounded-xl border-2 border-slate-900 p-3 mb-4 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <div id="avatarDisplay" class="w-16 h-16 rounded-2xl bg-indigo-100 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-[2px_2px_0px_#0F172A] transition-transform duration-200 hover:scale-110">
              <span id="avatarOutfitIcon">${this.state.avatarOutfit}</span>
              <span id="avatarVibeIcon" class="text-sm -ml-2 -mt-6">${this.state.avatarVibe}</span>
            </div>
            <div class="flex-1">
              <div class="text-xs font-black text-slate-800">Your 2042 Persona</div>
              <p class="text-[10px] text-slate-500">100% private — customize your gear for the future!</p>
              <!-- Avatar Gear Selector -->
              <div class="flex flex-wrap gap-1 mt-1.5" id="outfitPickers">
                ${outfits.map(o => `
                  <button type="button" class="w-7 h-7 rounded-lg border border-slate-900 bg-slate-50 hover:bg-amber-200 text-sm flex items-center justify-center transition-colors" data-outfit="${o}">${o}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Real-World Role Models to Emulate -->
        <div class="bg-indigo-900/5 rounded-xl border border-indigo-200/80 p-3">
          <div class="text-[11px] font-black uppercase text-indigo-950 tracking-wider mb-2 flex items-center gap-1.5">
            <span>🏆 Real-World Leaders to Emulate:</span>
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

    // Wire up outfit picker buttons
    const outfitBtns = this.dom.archetypeContainer.querySelectorAll('[data-outfit]');
    outfitBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.currentTarget.getAttribute('data-outfit');
        this.state.avatarOutfit = selected;
        const iconEl = document.getElementById('avatarOutfitIcon');
        if (iconEl) iconEl.textContent = selected;
        this.saveState();
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     INTERACTIVE MICRO-ACTIVITIES (All 10 nodes, ZERO alert() calls)
  ───────────────────────────────────────────────────────────── */
  renderActivitySandbox(activity) {
    const sandbox = this.dom.activitySandbox;
    if (!sandbox) return;
    sandbox.innerHTML = '';

    // 1. Scratch Block Command
    if (activity.type === 'scratch-block') {
      sandbox.innerHTML = `
        <div class="flex flex-col gap-2.5">
          <div class="flex flex-col gap-1.5">
            <div class="bg-amber-300 text-slate-900 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-[2px_2px_0px_#0F172A] w-fit">
              When 🟢 Flag Clicked
            </div>
            <div class="bg-sky-400 text-slate-900 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-[2px_2px_0px_#0F172A] ml-3 w-fit">
              Repeat 3 times: Move 15 Steps
            </div>
          </div>
          
          <!-- Mini Stage -->
          <div class="h-16 bg-slate-900 rounded-xl relative overflow-hidden flex items-center px-4 border-2 border-slate-900">
            <div id="scratchSprite" class="text-2xl transition-all duration-500 transform translate-x-0">🐱</div>
            <div class="absolute right-4 text-xs font-mono text-emerald-400">🏁 Goal</div>
          </div>

          <div class="flex items-center justify-between">
            <button id="runScratchBtn" type="button" class="text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] transition-all">
              ▶ Run Code
            </button>
            <span id="scratchStatus" class="text-[11px] font-bold text-slate-600">Ready to test!</span>
          </div>
        </div>
      `;

      setTimeout(() => {
        const btn = document.getElementById('runScratchBtn');
        const sprite = document.getElementById('scratchSprite');
        const status = document.getElementById('scratchStatus');
        if (btn && sprite) {
          btn.addEventListener('click', () => {
            sprite.style.transform = 'translateX(180px)';
            status.textContent = '🎉 Goal reached! Code logic works!';
            status.className = 'text-[11px] font-black text-emerald-600';
            setTimeout(() => {
              sprite.style.transform = 'translateX(0px)';
            }, 1800);
          });
        }
      }, 50);

    // 2. Python Bot Greeting
    } else if (activity.type === 'python-greet') {
      sandbox.innerHTML = `
        <div class="flex flex-col gap-2">
          <div class="font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl border-2 border-slate-900 leading-relaxed">
            <span class="text-slate-500"># Type a classmate's name:</span><br/>
            <span>classmate = </span>
            <input id="pyInput" type="text" value="Kwame" maxlength="15" class="bg-slate-800 text-amber-300 font-bold border border-slate-700 rounded px-1.5 py-0.5 outline-none w-24 text-xs" /><br/>
            <span>print("Hello " + classmate + ", welcome to Big Minds!")</span>
          </div>
          <div class="bg-slate-100 p-2.5 rounded-xl border border-slate-300">
            <span class="text-[10px] uppercase font-black text-slate-400">Terminal Output:</span>
            <div id="pyOutput" class="text-xs font-mono font-black text-indigo-900 mt-0.5">
              Hello Kwame, welcome to Big Minds!
            </div>
          </div>
        </div>
      `;

      setTimeout(() => {
        const inp = document.getElementById('pyInput');
        const out = document.getElementById('pyOutput');
        if (inp && out) {
          inp.addEventListener('input', (e) => {
            const val = e.target.value.trim() || 'Explorer';
            out.textContent = `Hello ${val}, welcome to Big Minds!`;
          });
        }
      }, 50);

    // 3. AI Model Bias Trainer
    } else if (activity.type === 'ai-trainer') {
      sandbox.innerHTML = `
        <p class="text-xs font-bold text-slate-700 mb-2">Tap 4 different student faces to build a fair, balanced AI dataset:</p>
        <div class="flex gap-2 flex-wrap mb-2" id="aiFaces">
          ${['🧑🏽','🧑🏿','👧🏾','👦🏿','🧑🏻','👧🏼','👩🏾‍🦱','🧑🏾'].map((f, i) => `
            <button type="button" class="ai-face-btn text-2xl p-2 bg-slate-100 border-2 border-slate-900 rounded-xl hover:bg-amber-100 transition-colors shadow-[2px_2px_0px_#0F172A]" data-face="${i}">${f}</button>
          `).join('')}
        </div>
        <div id="aiFeedback" class="text-[11px] font-black text-indigo-900 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
          Selected: 0 of 4 faces for balanced training.
        </div>
      `;

      setTimeout(() => {
        let count = 0;
        const btns = sandbox.querySelectorAll('.ai-face-btn');
        const fb = document.getElementById('aiFeedback');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btn.classList.toggle('bg-emerald-300');
            btn.classList.toggle('bg-slate-100');
            count = sandbox.querySelectorAll('.ai-face-btn.bg-emerald-300').length;
            if (count >= 4) {
              fb.textContent = '✅ Great work! Balanced training set built without bias!';
              fb.className = 'text-[11px] font-black text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300';
            } else {
              fb.textContent = `Selected: ${count} of 4 faces. Keep picking diverse faces!`;
              fb.className = 'text-[11px] font-black text-indigo-900 bg-indigo-50 p-2 rounded-lg border border-indigo-200';
            }
          });
        });
      }, 50);

    // 4. Space Science: Planet Size Challenge
    } else if (activity.type === 'planet-sort') {
      sandbox.innerHTML = `
        <p class="text-xs font-bold text-slate-700 mb-2">Tap the planets in order from <strong>SMALLEST to LARGEST</strong>:</p>
        <div class="grid grid-cols-3 gap-2 mb-2" id="planetGrid">
          <button type="button" data-order="2" class="planet-btn p-2 bg-slate-50 border-2 border-slate-900 rounded-xl text-center font-bold text-xs shadow-[2px_2px_0px_#0F172A] hover:bg-slate-100">🌍 Earth</button>
          <button type="button" data-order="1" class="planet-btn p-2 bg-slate-50 border-2 border-slate-900 rounded-xl text-center font-bold text-xs shadow-[2px_2px_0px_#0F172A] hover:bg-slate-100">🌑 Moon</button>
          <button type="button" data-order="3" class="planet-btn p-2 bg-slate-50 border-2 border-slate-900 rounded-xl text-center font-bold text-xs shadow-[2px_2px_0px_#0F172A] hover:bg-slate-100">🪐 Jupiter</button>
        </div>
        <div id="planetFeedback" class="text-[11px] font-black text-slate-700 bg-slate-100 p-2 rounded-lg">
          Tap Moon first (smallest)...
        </div>
      `;

      setTimeout(() => {
        let expected = 1;
        const btns = sandbox.querySelectorAll('.planet-btn');
        const fb = document.getElementById('planetFeedback');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            const order = parseInt(btn.getAttribute('data-order'));
            if (order === expected) {
              btn.classList.add('bg-emerald-300');
              btn.disabled = true;
              expected++;
              if (expected > 3) {
                fb.textContent = '🌟 Correct! Moon → Earth → Jupiter! True astronomer!';
                fb.className = 'text-[11px] font-black text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300';
              } else {
                fb.textContent = '✨ Good! Now pick the next largest!';
              }
            } else {
              fb.textContent = '❌ Try again — remember: Moon is smaller than Earth!';
              fb.className = 'text-[11px] font-black text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200';
            }
          });
        });
      }, 50);

    // 5. Sensor Quiz (No alerts!)
    } else if (activity.type === 'sensor-quiz') {
      sandbox.innerHTML = `
        <p class="text-xs font-bold text-slate-700 mb-2">Which sensor prevents a rover from bumping into a wall?</p>
        <div class="flex flex-col gap-1.5" id="sensorBtns">
          <button type="button" data-correct="true" class="sensor-opt text-left text-xs bg-slate-50 hover:bg-indigo-50 border-2 border-slate-900 p-2.5 rounded-xl font-bold transition-all shadow-[2px_2px_0px_#0F172A]">
            📡 Ultrasonic Distance Sensor
          </button>
          <button type="button" data-correct="false" class="sensor-opt text-left text-xs bg-slate-50 hover:bg-indigo-50 border-2 border-slate-900 p-2.5 rounded-xl font-bold transition-all shadow-[2px_2px_0px_#0F172A]">
            🎨 Light Color Sensor
          </button>
          <button type="button" data-correct="false" class="sensor-opt text-left text-xs bg-slate-50 hover:bg-indigo-50 border-2 border-slate-900 p-2.5 rounded-xl font-bold transition-all shadow-[2px_2px_0px_#0F172A]">
            🎤 Sound Microphone
          </button>
        </div>
        <div id="sensorFeedback" class="mt-2 text-[11px] font-bold text-slate-500">
          Pick a sensor to test rover detection!
        </div>
      `;

      setTimeout(() => {
        const btns = sandbox.querySelectorAll('.sensor-opt');
        const fb = document.getElementById('sensorFeedback');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            const isCorrect = btn.getAttribute('data-correct') === 'true';
            btns.forEach(b => b.classList.remove('bg-emerald-200', 'bg-rose-200'));
            if (isCorrect) {
              btn.classList.add('bg-emerald-200');
              fb.textContent = '✅ Exactly! Ultrasonic sensors send out sound waves to measure wall distance!';
              fb.className = 'mt-2 text-[11px] font-black text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300';
            } else {
              btn.classList.add('bg-rose-200');
              fb.textContent = '❌ Not quite. Light & sound don’t measure distance to walls. Try the ultrasonic sensor!';
              fb.className = 'mt-2 text-[11px] font-black text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200';
            }
          });
        });
      }, 50);

    // 6. Solar Array Align
    } else if (activity.type === 'solar-align') {
      sandbox.innerHTML = `
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
          <span>Panel Tilt Angle:</span><span id="solarVal" class="font-black text-indigo-700">45°</span>
        </div>
        <input id="solarRange" type="range" min="0" max="90" value="45" class="w-full mb-2" />
        <div id="solarOutput" class="text-xs font-black p-2 rounded-lg border border-slate-200 bg-amber-50 text-slate-800 flex items-center justify-between">
          <span>☀️ Power Output:</span>
          <span id="solarKw" class="text-emerald-700">8.4 kW (Optimal Angle!)</span>
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('solarRange');
        const val = document.getElementById('solarVal');
        const kw = document.getElementById('solarKw');
        if (range) {
          range.addEventListener('input', (e) => {
            const deg = parseInt(e.target.value);
            val.textContent = `${deg}°`;
            if (deg >= 40 && deg <= 50) {
              kw.textContent = '8.5 kW (Maximum Clean Power! ☀️)';
              kw.className = 'text-emerald-700 font-black';
            } else if (deg < 20 || deg > 70) {
              kw.textContent = '2.1 kW (Too tilted, losing sunlight! 🔋)';
              kw.className = 'text-rose-700 font-black';
            } else {
              kw.textContent = '5.5 kW (Good, adjust closer to 45°)';
              kw.className = 'text-amber-700 font-black';
            }
          });
        }
      }, 50);

    // 7. Health Pulse Monitor
    } else if (activity.type === 'health-pulse') {
      sandbox.innerHTML = `
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
          <span>Patient Heart Rate:</span><span id="pulseVal" class="font-black text-rose-600">72 BPM</span>
        </div>
        <input id="pulseRange" type="range" min="40" max="160" value="72" class="w-full mb-2" />
        <div id="pulseOutput" class="text-xs font-black p-2 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-800">
          💓 Normal resting heart rate for Grade 5–6 students (65–105 BPM).
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('pulseRange');
        const val = document.getElementById('pulseVal');
        const out = document.getElementById('pulseOutput');
        if (range) {
          range.addEventListener('input', (e) => {
            const bpm = parseInt(e.target.value);
            val.textContent = `${bpm} BPM`;
            if (bpm >= 65 && bpm <= 105) {
              out.textContent = '💓 Healthy resting heart rate range (65–105 BPM)';
              out.className = 'text-xs font-black p-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800';
            } else if (bpm > 105) {
              out.textContent = '⚡ Elevated pulse — looks like sprinting or high excitement!';
              out.className = 'text-xs font-black p-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800';
            } else {
              out.textContent = '❄️ Bradycardia range (very slow resting beat).';
              out.className = 'text-xs font-black p-2 rounded-lg border border-sky-300 bg-sky-50 text-sky-800';
            }
          });
        }
      }, 50);

    // 8. Digital Graphic Design Color Picker
    } else if (activity.type === 'color-picker') {
      sandbox.innerHTML = `
        <div id="previewCard" class="p-3 rounded-xl border-2 border-slate-900 text-xs bg-indigo-50 text-center font-black mb-2 shadow-[2px_2px_0px_#0F172A]">
          🎨 Big Minds Academy Brand Logo
        </div>
        <p class="text-[10px] font-bold text-slate-600 mb-1.5">Pick high-contrast brand background:</p>
        <div class="flex gap-2">
          ${[
            { bg: 'bg-indigo-100', name: 'Indigo' },
            { bg: 'bg-rose-100',   name: 'Rose' },
            { bg: 'bg-amber-100',  name: 'Gold' },
            { bg: 'bg-emerald-100',name: 'Emerald' }
          ].map(c => `
            <button type="button" data-bg="${c.bg}" class="palette-btn px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-900 ${c.bg} shadow-xs">
              ${c.name}
            </button>
          `).join('')}
        </div>
      `;

      setTimeout(() => {
        const preview = document.getElementById('previewCard');
        const btns = sandbox.querySelectorAll('.palette-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            const bgClass = btn.getAttribute('data-bg');
            if (preview) {
              preview.className = `p-3 rounded-xl border-2 border-slate-900 text-xs ${bgClass} text-center font-black mb-2 shadow-[2px_2px_0px_#0F172A]`;
            }
          });
        });
      }, 50);

    // 9. Motion Animation FPS Slider
    } else if (activity.type === 'fps-slider') {
      sandbox.innerHTML = `
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
          <span>Animation Frame Rate:</span><span id="fpsVal" class="font-black text-indigo-700">12 FPS</span>
        </div>
        <input id="fpsRange" type="range" min="2" max="60" value="12" class="w-full mb-2" />
        <div class="h-10 bg-slate-900 rounded-xl relative overflow-hidden flex items-center border-2 border-slate-900">
          <div id="fpsDot" class="w-5 h-5 rounded-full bg-amber-400 absolute left-2 border-2 border-white"></div>
        </div>
        <div id="fpsNote" class="mt-2 text-[10px] font-bold text-slate-500">
          12 FPS: Classic cartoon hand-drawn animation speed.
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('fpsRange');
        const val = document.getElementById('fpsVal');
        const dot = document.getElementById('fpsDot');
        const note = document.getElementById('fpsNote');

        let interval = null;
        let pos = 10;
        let dir = 1;

        const startAnim = (fps) => {
          if (interval) clearInterval(interval);
          const ms = Math.max(16, 1000 / fps);
          interval = setInterval(() => {
            pos += 6 * dir;
            if (pos > 280) dir = -1;
            if (pos < 10) dir = 1;
            if (dot) dot.style.left = `${pos}px`;
          }, ms);
        };

        startAnim(12);

        if (range) {
          range.addEventListener('input', (e) => {
            const fps = parseInt(e.target.value);
            val.textContent = `${fps} FPS`;
            if (fps >= 30) note.textContent = `${fps} FPS: Ultra-smooth 3D movie rendering!`;
            else if (fps <= 6) note.textContent = `${fps} FPS: Choppy stop-motion claymation feel!`;
            else note.textContent = `${fps} FPS: Standard animated cartoon rate.`;
            startAnim(fps);
          });
        }
      }, 50);

    // 10. Young Entrepreneurs Budget Calculator
    } else if (activity.type === 'budget-calc') {
      sandbox.innerHTML = `
        <p class="text-xs font-bold text-slate-700 mb-2">You earned <strong>GHS 100</strong> from a craft sale! Split your funds:</p>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-emerald-800">💰 Save (For next project):</span>
            <span id="saveVal" class="font-black">GHS 50</span>
          </div>
          <input id="budgetRange" type="range" min="10" max="90" value="50" class="w-full" />
          <div class="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div class="bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              <span class="text-[10px] font-bold text-emerald-700">SAVINGS (Future):</span>
              <div id="saveTotal" class="font-black text-emerald-950">GHS 50</div>
            </div>
            <div class="bg-indigo-50 border border-indigo-200 p-2 rounded-lg">
              <span class="text-[10px] font-bold text-indigo-700">SPEND / RE-INVEST:</span>
              <div id="spendTotal" class="font-black text-indigo-950">GHS 50</div>
            </div>
          </div>
          <div id="budgetAdvice" class="text-[11px] font-bold text-emerald-800 bg-emerald-100 p-2 rounded-lg">
            👏 Great balance! Saving 50% helps your school business buy bigger supplies next term!
          </div>
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('budgetRange');
        const sVal = document.getElementById('saveVal');
        const sTot = document.getElementById('saveTotal');
        const spTot = document.getElementById('spendTotal');
        const adv = document.getElementById('budgetAdvice');

        if (range) {
          range.addEventListener('input', (e) => {
            const save = parseInt(e.target.value);
            const spend = 100 - save;
            sVal.textContent = `GHS ${save}`;
            sTot.textContent = `GHS ${save}`;
            spTot.textContent = `GHS ${spend}`;

            if (save >= 40 && save <= 60) {
              adv.textContent = '👏 Great balance! Reinvesting part while saving builds a real sustainable venture!';
              adv.className = 'text-[11px] font-bold text-emerald-800 bg-emerald-100 p-2 rounded-lg';
            } else if (save > 60) {
              adv.textContent = '🏦 Heavy savings! Safe, but make sure to budget enough to advertise your products!';
              adv.className = 'text-[11px] font-bold text-sky-800 bg-sky-100 p-2 rounded-lg';
            } else {
              adv.textContent = '⚠️ Spending most funds leaves less safety cushion. Try saving at least GHS 40!';
              adv.className = 'text-[11px] font-bold text-amber-800 bg-amber-100 p-2 rounded-lg';
            }
          });
        }
      }, 50);

    // Fallback
    } else {
      sandbox.innerHTML = `<div class="text-xs text-slate-600 font-medium">Hands-on activity loaded for this pathway.</div>`;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     CURIOSITY QUIZ MODAL
  ───────────────────────────────────────────────────────────── */
  openQuiz() {
    if (!this.dom.quizModal || !this.dom.quizBody) return;
    this.dom.quizBody.innerHTML = '';

    QUIZ_QUESTIONS.forEach((q, qIndex) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'mb-4 pb-4 border-b border-slate-100 last:border-b-0 last:mb-0';
      
      qDiv.innerHTML = `
        <h4 class="text-xs font-black text-slate-800 mb-2 leading-relaxed">
          <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center mr-1 text-[11px] font-bold">${qIndex + 1}</span>
          ${q.question}
        </h4>
        <div class="space-y-1.5">
          ${q.options.map((opt, optIdx) => `
            <label class="quiz-option flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors">
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
    // Collect selected options and aggregate tag scores
    const tagScores = {};

    QUIZ_QUESTIONS.forEach((q) => {
      const checked = document.querySelector(`input[name="quiz_q_${q.id}"]:checked`);
      if (checked) {
        const [qIdx, optIdx] = checked.value.split('_').map(Number);
        const tags = QUIZ_QUESTIONS[qIdx]?.options[optIdx]?.tags || [];
        tags.forEach(t => {
          tagScores[t] = (tagScores[t] || 0) + 1;
        });
      }
    });

    // Sort by frequency
    const sorted = Object.entries(tagScores).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      this.showToast('Please answer at least one question first!');
      return;
    }

    // Pick top 2 or 3 interests
    const topInterests = sorted.slice(0, 3).map(entry => entry[0]);
    this.state.activeInterests = topInterests;
    
    this.saveState();
    this.closeQuiz();
    this.renderInterestBadges();
    this.refreshCanvas();

    this.showToast(`✨ Suggested interests applied: ${topInterests.join(', ')}!`);
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
    }, 3000);
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.bigMindsApp = new BigMindsApp();
});