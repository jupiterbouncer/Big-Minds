/**
 * Main application orchestrator managing state, local storage, interest toggles, and micro-activities.
 */

class PathwayExplorerApp {
  constructor() {
    this.selectedInterests = ['Technology', 'Art & Design'];
    this.exploredNodeIds = ['scratch'];
    this.selectedNode = null;
    this.quizAnswers = {};

    this.canvas = new PathwayCanvasEngine('canvasViewport', 'canvasTransform', 'svgCanvas', 'nodesContainer');
    
    this.loadState();
    this.bindEvents();
    this.render();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('pathway_explorer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.selectedInterests = parsed.selectedInterests || this.selectedInterests;
        this.exploredNodeIds = parsed.exploredNodeIds || this.exploredNodeIds;
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('pathway_explorer_state', JSON.stringify({
        selectedInterests: this.selectedInterests,
        exploredNodeIds: this.exploredNodeIds
      }));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }

  bindEvents() {
    // Interest badges toggle
    document.getElementById('interestBadges').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-interest]');
      if (!btn) return;
      const interest = btn.getAttribute('data-interest');
      this.toggleInterest(interest);
    });

    // Zoom and Pan Controls
    document.getElementById('zoomInBtn').addEventListener('click', () => this.canvas.zoomIn());
    document.getElementById('zoomOutBtn').addEventListener('click', () => this.canvas.zoomOut());
    document.getElementById('resetViewBtn').addEventListener('click', () => this.canvas.resetView());

    // Reset Progress State
    document.getElementById('clearStateBtn').addEventListener('click', () => {
      if (confirm('Reset your explored pathways and selected interests?')) {
        this.selectedInterests = ['Technology'];
        this.exploredNodeIds = [];
        this.selectedNode = null;
        this.saveState();
        this.closeDrawer();
        this.render();
      }
    });

    // Drawer close handlers
    document.getElementById('closeDrawerBtn').addEventListener('click', () => this.closeDrawer());
    document.getElementById('drawerBackdrop').addEventListener('click', () => this.closeDrawer());

    // Explored Toggle
    document.getElementById('toggleExploredBtn').addEventListener('click', () => {
      if (!this.selectedNode) return;
      const id = this.selectedNode.id;
      if (this.exploredNodeIds.includes(id)) {
        this.exploredNodeIds = this.exploredNodeIds.filter(item => item !== id);
      } else {
        this.exploredNodeIds.push(id);
      }
      this.saveState();
      this.updateDrawerState();
      this.render();
    });

    // Quiz Modal Trigger & Handlers
    const openQuiz = () => this.openQuizModal();
    document.getElementById('takeQuizBtn').addEventListener('click', openQuiz);
    document.getElementById('mobileQuizBtn').addEventListener('click', openQuiz);
    document.getElementById('closeQuizBtn').addEventListener('click', () => this.closeQuizModal());
    document.getElementById('submitQuizBtn').addEventListener('click', () => this.submitQuiz());
  }

  toggleInterest(interest) {
    if (this.selectedInterests.includes(interest)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
    } else {
      if (this.selectedInterests.length >= 3) {
        this.selectedInterests.shift(); // Max 3 items
      }
      this.selectedInterests.push(interest);
    }
    this.saveState();
    this.render();
  }

  openDrawer(node) {
    this.selectedNode = node;
    document.getElementById('drawerTitle').textContent = node.title;
    document.getElementById('drawerDesc').textContent = node.shortDescription;

    // Render Drawer Tags
    const tagsContainer = document.getElementById('drawerTags');
    tagsContainer.innerHTML = node.interestTags.map(tag => `
      <span class="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">${tag}</span>
    `).join('');

    // Render Activity Setup
    document.getElementById('activityTitle').textContent = `⚡ Try Something: ${node.activity.title}`;
    document.getElementById('activityDesc').textContent = node.activity.description;
    this.renderActivitySandbox(node.activity);

    this.updateDrawerState();

    document.getElementById('drawerBackdrop').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('drawerBackdrop').classList.remove('opacity-0');
      document.getElementById('nodeDrawer').classList.remove('translate-x-full');
    }, 10);
  }

  closeDrawer() {
    this.selectedNode = null;
    document.getElementById('nodeDrawer').classList.add('translate-x-full');
    document.getElementById('drawerBackdrop').classList.add('opacity-0');
    setTimeout(() => {
      document.getElementById('drawerBackdrop').classList.add('hidden');
    }, 300);
    this.render();
  }

  updateDrawerState() {
    if (!this.selectedNode) return;
    const isExplored = this.exploredNodeIds.includes(this.selectedNode.id);
    const btn = document.getElementById('toggleExploredBtn');
    if (isExplored) {
      btn.textContent = '✓ Pathway Explored (Click to Unmark)';
      btn.className = 'w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm transition-all shadow-sm bg-slate-100 hover:bg-slate-200 text-slate-600';
    } else {
      btn.textContent = 'Mark as Explored';
      btn.className = 'w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm transition-all shadow-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200';
    }
  }

  renderActivitySandbox(activity) {
    const sandbox = document.getElementById('activitySandbox');
    sandbox.innerHTML = '';

    if (activity.type === 'scratch-block') {
      sandbox.innerHTML = `
        <div class="flex flex-col gap-2">
          <div class="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">When 🟢 Flag Clicked</div>
          <div class="bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">Move 10 Steps</div>
          <button onclick="alert('Great job! You structured a Scratch move command.')" class="mt-2 text-xs font-bold text-indigo-600 hover:underline text-left">▶ Run Test Script</button>
        </div>
      `;
    } else if (activity.type === 'python-greet') {
      sandbox.innerHTML = `
        <div class="font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl">
          <span>print("Hello, " + </span>
          <input id="pyInput" type="text" value="Explorer" class="bg-slate-800 text-white border border-slate-700 rounded px-1.5 py-0.5 text-xs w-24 focus:outline-none focus:border-indigo-400" />
          <span>)</span>
        </div>
        <div id="pyOutput" class="mt-2 text-xs font-semibold text-slate-600">Output: Hello, Explorer</div>
      `;
      setTimeout(() => {
        const inp = document.getElementById('pyInput');
        if (inp) {
          inp.addEventListener('input', (e) => {
            document.getElementById('pyOutput').textContent = `Output: Hello, ${e.target.value || '...'}`;
          });
        }
      }, 50);
    } else if (activity.type === 'css-stylist') {
      sandbox.innerHTML = `
        <div id="previewCard" class="p-3 rounded-xl border transition-all text-xs bg-indigo-50 border-indigo-200 text-indigo-900 font-bold mb-2">
          Interactive Portfolio Preview
        </div>
        <div class="flex gap-2">
          <button onclick="document.getElementById('previewCard').className='p-3 rounded-xl border text-xs bg-rose-50 border-rose-300 text-rose-900 font-bold mb-2'" class="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold">Warm Theme</button>
          <button onclick="document.getElementById('previewCard').className='p-3 rounded-xl border text-xs bg-emerald-50 border-emerald-300 text-emerald-900 font-bold mb-2'" class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Mint Theme</button>
        </div>
      `;
    } else if (activity.type === 'fps-slider') {
      sandbox.innerHTML = `
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
          <span>Animation Speed:</span>
          <span id="fpsVal">12 FPS</span>
        </div>
        <input type="range" min="1" max="60" value="12" class="w-full" oninput="document.getElementById('fpsVal').textContent = this.value + ' FPS'" />
      `;
    } else {
      sandbox.innerHTML = `<div class="text-xs text-slate-500 italic">Complete the prompt challenge in your classroom workbook!</div>`;
    }
  }

  openQuizModal() {
    const body = document.getElementById('quizBody');
    body.innerHTML = QUIZ_QUESTIONS.map((q, qIndex) => `
      <div class="mb-4">
        <p class="text-xs font-extrabold text-slate-700 mb-2">${qIndex + 1}. ${q.question}</p>
        <div class="flex flex-col gap-1.5">
          ${q.options.map((opt, oIndex) => `
            <label class="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl cursor-pointer hover:border-indigo-300 text-xs text-slate-700 font-medium">
              <input type="radio" name="${q.id}" value="${qIndex}_${oIndex}" class="text-indigo-600 focus:ring-indigo-500" />
              <span>${opt.text}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    document.getElementById('quizModal').classList.remove('hidden');
  }

  closeQuizModal() {
    document.getElementById('quizModal').classList.add('hidden');
  }

  submitQuiz() {
    const selectedTags = new Set();
    QUIZ_QUESTIONS.forEach((q, qIndex) => {
      const checked = document.querySelector(`input[name="${q.id}"]:checked`);
      if (checked) {
        const [, oIndex] = checked.value.split('_');
        q.options[oIndex].tags.forEach(t => selectedTags.add(t));
      }
    });

    if (selectedTags.size > 0) {
      this.selectedInterests = Array.from(selectedTags).slice(0, 3);
      this.saveState();
      this.closeQuizModal();
      this.render();
    } else {
      alert('Please answer at least one question!');
    }
  }

  render() {
    // 1. Render Interest Badges
    const badgeContainer = document.getElementById('interestBadges');
    badgeContainer.innerHTML = Object.keys(CATEGORY_COLORS).map(category => {
      const isSelected = this.selectedInterests.includes(category);
      return `
        <button data-interest="${category}" class="text-xs font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
          isSelected 
            ? 'bg-indigo-600 text-white shadow-sm scale-105' 
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        }">
          ${category} ${isSelected ? '✕' : ''}
        </button>
      `;
    }).join('');

    // 2. Render Progress Meter
    const totalCount = PATHWAY_NODES.length;
    const exploredCount = this.exploredNodeIds.length;
    const percentage = Math.round((exploredCount / totalCount) * 100);

    document.getElementById('exploredCount').textContent = exploredCount;
    document.getElementById('totalNodesCount').textContent = totalCount;
    document.getElementById('progressPercent').textContent = `${percentage}% Discovered`;
    document.getElementById('progressBar').style.width = `${percentage}%`;

    // 3. Render Canvas Edges & Nodes
    this.canvas.renderEdges(PATHWAY_NODES, PATHWAY_EDGES, this.selectedInterests);
    this.canvas.renderNodes(
      PATHWAY_NODES,
      this.selectedInterests,
      this.exploredNodeIds,
      this.selectedNode ? this.selectedNode.id : null,
      (node) => this.openDrawer(node)
    );
  }
}

// Initialize Application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PathwayExplorerApp();
});