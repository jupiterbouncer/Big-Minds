/**
 * Handles SVG canvas graph rendering, bezier path calculations, and pan/zoom transforms.
 */

class PathwayCanvasEngine {
  constructor(viewportId, transformId, svgId, nodesContainerId) {
    this.viewport = document.getElementById(viewportId);
    this.transformContainer = document.getElementById(transformId);
    this.svgCanvas = document.getElementById(svgId);
    this.nodesContainer = document.getElementById(nodesContainerId);

    this.scale = 1;
    this.panX = 40;
    this.panY = 40;
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;

    this.initPanZoom();
  }

  initPanZoom() {
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node-card')) return; // Ignore drag when clicking nodes
      this.isPanning = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
    });

    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.scale = Math.min(Math.max(0.5, this.scale * zoomFactor), 1.8);
      this.updateTransform();
    }, { passive: false });
  }

  updateTransform() {
    this.transformContainer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  zoomIn() {
    this.scale = Math.min(1.8, this.scale * 1.15);
    this.updateTransform();
  }

  zoomOut() {
    this.scale = Math.max(0.5, this.scale / 1.15);
    this.updateTransform();
  }

  resetView() {
    this.scale = 1;
    this.panX = 40;
    this.panY = 40;
    this.updateTransform();
  }

  renderEdges(nodes, edges, activeInterests) {
    this.svgCanvas.querySelectorAll('.edge-path-group').forEach(el => el.remove());

    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      // Node dimensions (approx card width=256px, height=130px)
      const x1 = sourceNode.x + 256;
      const y1 = sourceNode.y + 65;
      const x2 = targetNode.x;
      const y2 = targetNode.y + 65;

      const controlDist = Math.abs(x2 - x1) * 0.5;
      const pathD = `M ${x1} ${y1} C ${x1 + controlDist} ${y1}, ${x2 - controlDist} ${y2}, ${x2} ${y2}`;

      // Calculate if both nodes match current active interests
      const sourceScore = sourceNode.interestTags.filter(t => activeInterests.includes(t)).length;
      const targetScore = targetNode.interestTags.filter(t => activeInterests.includes(t)).length;
      const isActivePath = sourceScore > 0 && targetScore > 0;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('edge-path-group');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', isActivePath ? '#6366F1' : '#CBD5E1');
      path.setAttribute('stroke-width', isActivePath ? '3.5' : '2');
      path.setAttribute('marker-end', isActivePath ? 'url(#arrow-active)' : 'url(#arrow)');
      path.classList.add('edge-path');
      
      if (isActivePath) {
        path.classList.add('edge-path-active');
      }

      group.appendChild(path);
      this.svgCanvas.appendChild(group);
    });
  }

  renderNodes(nodes, activeInterests, exploredIds, selectedId, onSelectNode) {
    this.nodesContainer.innerHTML = '';

    nodes.forEach(node => {
      const relevanceScore = node.interestTags.filter(t => activeInterests.includes(t)).length;
      const isExplored = exploredIds.includes(node.id);
      const isSelected = selectedId === node.id;

      const card = document.createElement('div');
      card.style.position = 'absolute';
      card.style.left = `${node.x}px`;
      card.style.top = `${node.y}px`;
      card.className = `node-card w-64 bg-white rounded-2xl p-4 border transition-all cursor-pointer select-none ${
        isSelected ? 'ring-4 ring-indigo-500/50 border-indigo-500' : 'border-slate-200'
      }`;

      if (relevanceScore >= 2) {
        card.classList.add('node-match-high', 'border-indigo-500');
      } else if (relevanceScore === 1) {
        card.classList.add('node-match-low', 'border-indigo-300');
      }

      // Explored & Match Badges
      let badgeHTML = '';
      if (isExplored) {
        badgeHTML += `<span class="absolute -top-2.5 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">✓ Explored</span>`;
      }
      if (relevanceScore > 0) {
        badgeHTML += `<span class="absolute -top-2.5 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">${relevanceScore > 1 ? `High Match (${relevanceScore})` : 'Match'}</span>`;
      }

      // Tag pills
      const tagPills = node.interestTags.map(tag => {
        const conf = CATEGORY_COLORS[tag] || { bg: 'bg-slate-100', text: 'text-slate-600' };
        return `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${conf.bg} ${conf.text}">${tag}</span>`;
      }).join('');

      card.innerHTML = `
        ${badgeHTML}
        <h3 class="font-black text-slate-800 text-sm mb-1">${node.title}</h3>
        <p class="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">${node.shortDescription}</p>
        <div class="flex flex-wrap gap-1">${tagPills}</div>
      `;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectNode(node);
      });

      this.nodesContainer.appendChild(card);
    });
  }
}