/**
 * Canvas Engine — pan, zoom, render SVG edges & node cards.
 * Uses pointer events for combined mouse + touch support.
 */

class PathwayCanvasEngine {
  constructor(viewportId, transformId, svgId, nodesContainerId) {
    this.viewport = document.getElementById(viewportId);
    this.transformContainer = document.getElementById(transformId);
    this.svgCanvas = document.getElementById(svgId);
    this.nodesContainer = document.getElementById(nodesContainerId);

    this.scale = 1;
    this.panX = 30;
    this.panY = 30;
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;

    this.initPanZoom();
  }

  initPanZoom() {
    /* Pointer events cover mouse + touch + stylus */
    this.viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.node-card')) return;
      this.isPanning = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.viewport.setPointerCapture(e.pointerId);
    });

    this.viewport.addEventListener('pointermove', (e) => {
      if (!this.isPanning) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    this.viewport.addEventListener('pointerup', (e) => {
      this.isPanning = false;
      this.viewport.releasePointerCapture(e.pointerId);
    });

    this.viewport.addEventListener('pointercancel', (e) => {
      this.isPanning = false;
    });

    /* Mouse-wheel zoom */
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.scale = Math.min(Math.max(0.4, this.scale * zoomFactor), 1.6);
      this.updateTransform();
    }, { passive: false });
  }

  updateTransform() {
    this.transformContainer.style.transform =
      `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  zoomIn()  { this.scale = Math.min(1.6, this.scale * 1.15); this.updateTransform(); }
  zoomOut() { this.scale = Math.max(0.4, this.scale / 1.15); this.updateTransform(); }

  resetView() {
    this.scale = 1;
    this.panX = 30;
    this.panY = 30;
    this.updateTransform();
  }

  /* ── Edges ── */
  renderEdges(nodes, edges, activeInterests) {
    this.svgCanvas.querySelectorAll('.edge-path-group').forEach(el => el.remove());

    edges.forEach(edge => {
      const src = nodes.find(n => n.id === edge.source);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!src || !tgt) return;

      const x1 = src.x + 256;
      const y1 = src.y + 65;
      const x2 = tgt.x;
      const y2 = tgt.y + 65;

      const cd = Math.abs(x2 - x1) * 0.5;
      const pathD = `M ${x1} ${y1} C ${x1 + cd} ${y1}, ${x2 - cd} ${y2}, ${x2} ${y2}`;

      const sScore = src.interestTags.filter(t => activeInterests.includes(t)).length;
      const tScore = tgt.interestTags.filter(t => activeInterests.includes(t)).length;
      const active = sScore > 0 && tScore > 0;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('edge-path-group');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', active ? '#4F46E5' : '#CBD5E1');
      path.setAttribute('stroke-width', active ? '3.5' : '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('marker-end', active ? 'url(#arrow-active)' : 'url(#arrow)');
      path.classList.add('edge-path');
      if (active) path.classList.add('edge-path-active');

      g.appendChild(path);
      this.svgCanvas.appendChild(g);
    });
  }

  /* ── Nodes ── */
  renderNodes(nodes, activeInterests, exploredIds, selectedId, onSelectNode) {
    this.nodesContainer.innerHTML = '';

    nodes.forEach(node => {
      const score = node.interestTags.filter(t => activeInterests.includes(t)).length;
      const explored = exploredIds.includes(node.id);
      const selected = selectedId === node.id;

      const card = document.createElement('div');
      card.style.position = 'absolute';
      card.style.left = `${node.x}px`;
      card.style.top  = `${node.y}px`;
      card.className = `node-card w-64 bg-white rounded-2xl p-4 border-[3px] border-slate-900 shadow-[4px_4px_0px_#0F172A] cursor-pointer select-none ${
        selected ? 'ring-4 ring-indigo-400' : ''
      }`;

      if (score >= 2) card.classList.add('node-match-high');
      else if (score === 1) card.classList.add('node-match-low');

      let badges = '';
      if (explored) {
        badges += `<span class="absolute -top-3 -right-2 bg-emerald-400 text-slate-900 border-2 border-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_#0F172A] sticker">✓ Explored</span>`;
      }
      if (score > 0) {
        badges += `<span class="absolute -top-3 left-3 bg-amber-300 text-slate-900 border-2 border-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_#0F172A] sticker-alt">${score > 1 ? 'Match (' + score + ')' : 'Match'}</span>`;
      }

      const tagPills = node.interestTags.map(tag => {
        const c = CATEGORY_COLORS[tag] || { bg: 'bg-slate-100', text: 'text-slate-900' };
        return `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-900 ${c.bg} ${c.text}">${tag}</span>`;
      }).join('');

      card.innerHTML = `
        ${badges}
        <h3 class="font-black text-slate-900 text-base mb-1">${node.title}</h3>
        <p class="text-slate-600 text-xs font-medium line-clamp-2 mb-3 leading-relaxed">${node.shortDescription}</p>
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