/**
 * Big Minds — Service Project Planner Logic & State Controller
 * Storage Key: bigminds_service_project_plan_v1
 */

const STORAGE_KEY = "bigminds_service_project_plan_v1";

// Global In-Memory State
let planData = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadPlanData();
  if (window.firebaseSync) {
    window.firebaseSync.init();
  }
  setupNavigation();
  setupActionButtons();
  renderAll();
});

/* ==========================================================================
   STORAGE & STATE MANAGEMENT
   ========================================================================== */

function loadPlanData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      planData = JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved plan data, reverting to defaults:", e);
      planData = JSON.parse(JSON.stringify(INITIAL_PLANNER_DATA));
    }
  } else {
    planData = JSON.parse(JSON.stringify(INITIAL_PLANNER_DATA));
    savePlanData();
  }
}

function savePlanData() {
  planData.projectMeta.lastUpdated = new Date().toISOString().split("T")[0];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(planData));

  // Sync to Firebase if configured & online, or show local indicator
  if (window.firebaseSync && window.firebaseSync.isConfigured()) {
    window.firebaseSync.pushPlan(planData);
  } else {
    showSaveIndicator();
  }
}

function showSaveIndicator() {
  const badge = document.getElementById("save-indicator");
  if (badge) {
    badge.classList.add("saved-pulse");
    badge.textContent = "✓ Saved to browser";
    setTimeout(() => badge.classList.remove("saved-pulse"), 1500);
  }
}

/* ==========================================================================
   NAVIGATION & EVENT LISTENERS
   ========================================================================== */

function setupNavigation() {
  const tabs = document.querySelectorAll(".planner-tabs .tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const panelId = tab.getAttribute("data-tab");
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });

  // Modal Close Events
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("planner-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "planner-modal-overlay") closeModal();
  });
}

function setupActionButtons() {
  // Cloud Sync Settings
  const btnCloudSync = document.getElementById("btn-cloud-sync");
  if (btnCloudSync && window.firebaseSync) {
    btnCloudSync.addEventListener("click", () => window.firebaseSync.openSettingsModal());
  }

  const saveIndicator = document.getElementById("save-indicator");
  if (saveIndicator && window.firebaseSync) {
    saveIndicator.addEventListener("click", () => window.firebaseSync.openSettingsModal());
  }

  // Export JSON
  document.getElementById("btn-export-json").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Big_Minds_Service_Project_Plan_${planData.projectMeta.schoolName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Import JSON Trigger
  const fileInput = document.getElementById("import-file-input");
  document.getElementById("btn-import-trigger").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.targetClass && imported.mentorshipAreas) {
          planData = imported;
          savePlanData();
          renderAll();
          alert("Project Plan imported successfully!");
        } else {
          alert("Invalid project plan file format.");
        }
      } catch (err) {
        alert("Error reading JSON file.");
      }
    };
    reader.readAsText(file);
  });

  // Print Summary
  document.getElementById("btn-print-plan").addEventListener("click", () => {
    window.print();
  });

  // Header Status Edit
  document.getElementById("btn-edit-status").addEventListener("click", editProjectStatusModal);

  // Target Class Edit
  document.getElementById("btn-edit-target-class").addEventListener("click", editTargetClassModal);

  // Add Item Buttons
  document.getElementById("btn-add-area").addEventListener("click", () => editAreaModal(null));
  document.getElementById("btn-add-visit").addEventListener("click", () => editVisitModal(null));
  document.getElementById("btn-add-workshop").addEventListener("click", () => editWorkshopModal(null));
  document.getElementById("btn-add-expense").addEventListener("click", () => editExpenseModal(null));

  // Edit Assessment & Handover
  document.getElementById("btn-edit-assessment").addEventListener("click", editAssessmentModal);
  document.getElementById("btn-edit-handover").addEventListener("click", editHandoverModal);
}

/* ==========================================================================
   RENDERERS FOR ALL SECTIONS
   ========================================================================== */

function renderAll() {
  renderOverviewHeader();
  renderTargetClass();
  renderMentorshipAreas();
  renderVisits();
  renderTeamRoles();
  renderWorkshops();
  renderBudget();
  renderAssessment();
  renderHandover();
}

// Render Header & Status Summary
function renderOverviewHeader() {
  document.getElementById("project-status-label").textContent = planData.projectMeta.status;
  document.getElementById("stat-school-name").textContent = planData.projectMeta.schoolName;
  document.getElementById("stat-target-class").textContent = planData.targetClass.targetGrade;
  document.getElementById("stat-student-count").textContent = `Est. ~${planData.targetClass.expectedStudents} Students`;

  const totalVisits = planData.visitSchedule.length;
  const confirmedVisits = planData.visitSchedule.filter(v => v.status === "Confirmed" || v.status === "Completed").length;
  document.getElementById("stat-visits-count").textContent = `${totalVisits} Visits`;
  document.getElementById("stat-visits-confirmed").textContent = `${confirmedVisits} Confirmed`;

  // Budget Calculations
  const grandTotal = planData.budgetItems.reduce((sum, item) => sum + (item.quantity * item.unitCostGHS), 0);
  const confirmedTotal = planData.budgetItems
    .filter(item => item.status === "Confirmed" || item.status === "Purchased")
    .reduce((sum, item) => sum + (item.quantity * item.unitCostGHS), 0);

  document.getElementById("stat-budget-total").textContent = `GHS ${grandTotal.toFixed(2)}`;
  document.getElementById("stat-budget-confirmed").textContent = `GHS ${confirmedTotal.toFixed(2)} Confirmed`;

  // Unassigned Roles Count
  const unassigned = planData.teamRoles.filter(r => !r.assignedTo || r.assignedTo.trim() === "").length;
  document.getElementById("stat-unassigned-roles").textContent = `${unassigned} Roles`;
}

// Render Target Class Configuration
function renderTargetClass() {
  const tc = planData.targetClass;
  const container = document.getElementById("target-class-display");
  container.innerHTML = `
    <div class="detail-row"><strong>Target Grade:</strong> <span>${escapeHtml(tc.targetGrade)}</span></div>
    <div class="detail-row"><strong>Class Identifier:</strong> <span>${escapeHtml(tc.classIdentifier || "Not specified")}</span></div>
    <div class="detail-row"><strong>Expected Students:</strong> <span>~${tc.expectedStudents} students</span></div>
    <div class="detail-row"><strong>Confirmed Students:</strong> <span>${tc.confirmedStudents > 0 ? tc.confirmedStudents : "Awaiting Confirmation"}</span></div>
    <div class="detail-row"><strong>School Approval Status:</strong> <span class="badge badge-info">${escapeHtml(tc.approvalStatus)}</span></div>
    <div class="detail-row margin-top-sm"><strong>Needs-Assessment Notes:</strong><p class="text-sm text-muted">${escapeHtml(tc.needsAssessmentNotes)}</p></div>
  `;
}

// Render Mentorship Areas
function renderMentorshipAreas() {
  const container = document.getElementById("mentorship-areas-list");
  container.innerHTML = "";

  planData.mentorshipAreas.forEach(area => {
    const card = document.createElement("div");
    card.className = "neo-card area-card";
    
    const statusClass = area.status === "Confirmed" ? "badge-success" : (area.status === "Reviewed" ? "badge-info" : "badge-warning");

    card.innerHTML = `
      <div class="card-header-flex">
        <h4>${escapeHtml(area.name)}</h4>
        <span class="badge ${statusClass}">${escapeHtml(area.status)}</span>
      </div>
      <p class="text-sm margin-bottom-sm"><strong>Utility:</strong> ${escapeHtml(area.utility)}</p>
      <div class="area-details-grid text-sm">
        <div><strong>Key Concepts:</strong> ${escapeHtml(area.concepts)}</div>
        <div><strong>Hands-On Task:</strong> ${escapeHtml(area.handsOnActivity)}</div>
        <div><strong>Learning Outcome:</strong> ${escapeHtml(area.learningOutcome)}</div>
        <div><strong>Linked Digital Node:</strong> Pathway #${escapeHtml(area.linkedPathwayNodeId || "N/A")}</div>
        <div><strong>Lead Facilitator:</strong> ${escapeHtml(area.sessionLead || "Unassigned")}</div>
        <div><strong>Required Materials:</strong> ${escapeHtml(area.requiredMaterials || "Standard stationary")}</div>
      </div>
      <div class="card-actions margin-top-sm">
        <button class="btn btn-sm btn-outline" onclick="editAreaModal('${area.id}')">✏️ Edit Area</button>
        <button class="btn btn-sm btn-danger-outline" onclick="deleteArea('${area.id}')">🗑️ Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Visits
function renderVisits() {
  const container = document.getElementById("visits-container");
  container.innerHTML = "";

  // Summary Counters
  const total = planData.visitSchedule.length;
  const proposed = planData.visitSchedule.filter(v => v.status === "Draft" || v.status === "Proposed").length;
  const confirmed = planData.visitSchedule.filter(v => v.status === "Confirmed").length;
  const completed = planData.visitSchedule.filter(v => v.status === "Completed").length;

  document.getElementById("badge-total-visits").textContent = `${total} Total Visits`;
  document.getElementById("badge-proposed-visits").textContent = `${proposed} Proposed`;
  document.getElementById("badge-confirmed-visits").textContent = `${confirmed} Confirmed`;
  document.getElementById("badge-completed-visits").textContent = `${completed} Completed`;

  planData.visitSchedule.forEach(visit => {
    const card = document.createElement("div");
    card.className = "neo-card visit-card";
    const statusClass = visit.status === "Confirmed" ? "badge-success" : (visit.status === "Completed" ? "badge-primary" : "badge-warning");

    card.innerHTML = `
      <div class="card-header-flex">
        <div>
          <span class="visit-number-badge">Visit #${visit.visitNumber}</span>
          <h4 class="inline-title">${escapeHtml(visit.title)}</h4>
        </div>
        <span class="badge ${statusClass}">${escapeHtml(visit.status)}</span>
      </div>

      <div class="visit-meta-grid text-sm margin-top-sm">
        <div><strong>Date:</strong> ${escapeHtml(visit.proposedDate || "Unscheduled")}</div>
        <div><strong>Time:</strong> ${escapeHtml(visit.startTime ? `${visit.startTime} -${visit.endTime}` : "TBC")}</div>
        <div><strong>Location:</strong> ${escapeHtml(visit.location || "CPA Classroom")}</div>
        <div><strong>Lead Facilitator:</strong> ${escapeHtml(visit.leadFacilitator || "Unassigned")}</div>
      </div>

      <div class="visit-body margin-top-sm text-sm">
        <p><strong>Main Objective:</strong> ${escapeHtml(visit.mainObjective)}</p>
        <p><strong>Agenda / Activities:</strong></p>
        <pre class="formatted-pre">${escapeHtml(visit.activitiesAgenda)}</pre>
        <p><strong>Materials Needed:</strong> ${escapeHtml(visit.requiredMaterials || "None listed")}</p>
      </div>

      <div class="card-actions margin-top-sm">
        <button class="btn btn-sm btn-outline" onclick="editVisitModal('${visit.id}')">✏️ Edit Visit</button>
        <button class="btn btn-sm btn-danger-outline" onclick="deleteVisit('${visit.id}')">🗑️ Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Team Roles
function renderTeamRoles() {
  const container = document.getElementById("team-members-grid");
  const alertBox = document.getElementById("unassigned-roles-alert");
  container.innerHTML = "";

  const unassignedRoles = planData.teamRoles.filter(r => !r.assignedTo || r.assignedTo.trim() === "");
  if (unassignedRoles.length > 0) {
    alertBox.style.display = "block";
    alertBox.innerHTML = `⚠️ <strong>Attention:</strong> There are currently ${unassignedRoles.length} unassigned role(s). Assign facilitators to ensure full workshop coverage.`;
  } else {
    alertBox.style.display = "none";
  }

  planData.teamRoles.forEach(role => {
    const card = document.createElement("div");
    card.className = "team-role-card neo-card";
    const isAssigned = role.assignedTo && role.assignedTo.trim() !== "";

    card.innerHTML = `
      <div class="role-title">${escapeHtml(role.title)}</div>
      <div class="role-assignee ${isAssigned ? 'assigned' : 'unassigned'}">
        ${isAssigned ? `👤 ${escapeHtml(role.assignedTo)}` : '⚠️ Unassigned'}
      </div>
      <button class="btn btn-xs btn-outline margin-top-xs" onclick="assignRoleModal('${role.id}')">Assign / Edit</button>
    `;
    container.appendChild(card);
  });
}

// Render Workshops
function renderWorkshops() {
  const container = document.getElementById("workshops-container");
  container.innerHTML = "";

  planData.workshops.forEach(ws => {
    const card = document.createElement("div");
    card.className = "neo-card workshop-card";

    // Find matching mentorship area
    const area = planData.mentorshipAreas.find(a => a.id === ws.areaId);
    const areaName = area ? area.name : "General Mentorship";

    card.innerHTML = `
      <div class="card-header-flex">
        <h4>${escapeHtml(ws.title)}</h4>
        <span class="badge badge-secondary">${escapeHtml(areaName)}</span>
      </div>
      <div class="workshop-details-grid text-sm margin-top-sm">
        <div><strong>Learning Objective:</strong> ${escapeHtml(ws.objective)}</div>
        <div><strong>Introduction Example:</strong> ${escapeHtml(ws.introduction)}</div>
        <div><strong>Practical Activity:</strong> ${escapeHtml(ws.practicalActivity)}</div>
        <div><strong>Materials Needed:</strong> ${escapeHtml(ws.materials)}</div>
        <div><strong>Facilitation Approach:</strong> ${escapeHtml(ws.facilitationApproach)}</div>
        <div><strong>Expected Outcome:</strong> ${escapeHtml(ws.expectedOutcome)}</div>
        <div><strong>Reflection Question:</strong> <em>"${escapeHtml(ws.reflectionQuestion)}"</em></div>
      </div>
      <div class="card-actions margin-top-sm">
        <button class="btn btn-sm btn-outline" onclick="editWorkshopModal('${ws.id}')">✏️ Edit Lesson Plan</button>
        <button class="btn btn-sm btn-danger-outline" onclick="deleteWorkshop('${ws.id}')">🗑️ Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render Budget Table
function renderBudget() {
  const tbody = document.getElementById("budget-table-body");
  tbody.innerHTML = "";

  let grandTotal = 0;
  let confirmedTotal = 0;
  let essentialTotal = 0;

  planData.budgetItems.forEach(item => {
    const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitCostGHS) || 0);
    grandTotal += lineTotal;

    if (item.status === "Confirmed" || item.status === "Purchased") {
      confirmedTotal += lineTotal;
    }
    if (item.essential) {
      essentialTotal += lineTotal;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(item.description)}</strong><br><small class="text-muted">${escapeHtml(item.notes || "")}</small></td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.quantity}</td>
      <td>GHS ${Number(item.unitCostGHS).toFixed(2)}</td>
      <td><strong>GHS ${lineTotal.toFixed(2)}</strong></td>
      <td>${item.essential ? '<span class="badge badge-primary">Essential</span>' : '<span class="badge badge-neutral">Optional</span>'}</td>
      <td><span class="badge ${item.status === 'Confirmed' || item.status === 'Purchased' ? 'badge-success' : 'badge-warning'}">${escapeHtml(item.status)}</span></td>
      <td>
        <button class="btn btn-xs btn-outline" onclick="editExpenseModal('${item.id}')">Edit</button>
        <button class="btn btn-xs btn-danger-outline" onclick="deleteExpense('${item.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("budget-grand-total").textContent = `GHS ${grandTotal.toFixed(2)}`;
  document.getElementById("budget-confirmed-total").textContent = `GHS ${confirmedTotal.toFixed(2)}`;
  document.getElementById("budget-essential-total").textContent = `GHS ${essentialTotal.toFixed(2)}`;
  document.getElementById("budget-footer-total").textContent = `GHS ${grandTotal.toFixed(2)}`;
}

// Render Assessment Indicators
function renderAssessment() {
  const a = planData.assessment;
  const container = document.getElementById("assessment-metrics-container");
  container.innerHTML = `
    <div class="metric-row"><span>Baseline Participating Students:</span> <strong>${a.baselineStudents}</strong></div>
    <div class="metric-row"><span>Final Participating Students:</span> <strong>${a.finalStudents}</strong></div>
    <div class="metric-row"><span>Attendance Across Visits:</span> <strong>${a.attendanceRatePercent}%</strong></div>
    <div class="metric-row"><span>Mentorship Sessions Delivered:</span> <strong>${a.sessionsDelivered}</strong></div>
    <div class="metric-row"><span>Mentors / Facilitators Active:</span> <strong>${a.mentorsParticipated}</strong></div>
    <div class="metric-row"><span>Pre-Program Skill Awareness:</span> <strong>${a.preSkillAwarenessPercent}%</strong></div>
    <div class="metric-row"><span>Post-Program Skill Awareness:</span> <strong>${a.postSkillAwarenessPercent}%</strong></div>
    <div class="metric-row"><span>Student Satisfaction Rating:</span> <strong>${escapeHtml(a.studentSatisfactionScore)}</strong></div>
  `;
}

// Render Handover Checklist
function renderHandover() {
  const container = document.getElementById("handover-checklist-container");
  container.innerHTML = "";

  planData.handoverChecklist.forEach(item => {
    const div = document.createElement("div");
    div.className = "checklist-item neo-card";
    div.innerHTML = `
      <label class="checkbox-label">
        <input type="checkbox" ${item.completed ? "checked" : ""} onchange="toggleHandoverTask('${item.id}', this.checked)">
        <span class="${item.completed ? 'completed-task' : ''}"><strong>${escapeHtml(item.task)}</strong></span>
      </label>
      <div class="text-xs text-muted margin-top-xs">${escapeHtml(item.notes || "")}</div>
    `;
    container.appendChild(div);
  });
}

/* ==========================================================================
   MODALS AND INTERACTIVE EDITORS
   ========================================================================== */

function openModal(title, contentHtml) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = contentHtml;
  document.getElementById("planner-modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("planner-modal-overlay").classList.add("hidden");
}

// Edit Project Status & Info Modal
function editProjectStatusModal() {
  const m = planData.projectMeta;
  const html = `
    <form id="form-edit-status">
      <div class="form-group">
        <label>Project Status Label</label>
        <select id="edit-status-val" class="form-control">
          <option value="Draft — Awaiting School Confirmation" ${m.status.includes("Draft") ? "selected" : ""}>Draft — Awaiting School Confirmation</option>
          <option value="Under Review by School Management" ${m.status.includes("Review") ? "selected" : ""}>Under Review by School Management</option>
          <option value="Confirmed & Scheduled" ${m.status.includes("Confirmed") ? "selected" : ""}>Confirmed & Scheduled</option>
          <option value="In Delivery" ${m.status.includes("Delivery") ? "selected" : ""}>In Delivery</option>
          <option value="Completed & Handed Over" ${m.status.includes("Completed") ? "selected" : ""}>Completed & Handed Over</option>
        </select>
      </div>
      <div class="form-group">
        <label>School Name</label>
        <input type="text" id="edit-school-name" class="form-control" value="${escapeHtml(m.schoolName)}">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;
  openModal("Edit Project Status", html);

  document.getElementById("form-edit-status").addEventListener("submit", (e) => {
    e.preventDefault();
    planData.projectMeta.status = document.getElementById("edit-status-val").value;
    planData.projectMeta.schoolName = document.getElementById("edit-school-name").value;
    savePlanData();
    renderAll();
    closeModal();
  });
}

// Edit Target Class Modal
function editTargetClassModal() {
  const tc = planData.targetClass;
  const html = `
    <form id="form-edit-target-class">
      <div class="form-group">
        <label>Target Grade</label>
        <select id="tc-grade" class="form-control">
          <option value="Grade 5" ${tc.targetGrade === 'Grade 5' ? 'selected' : ''}>Grade 5</option>
          <option value="Grade 6" ${tc.targetGrade === 'Grade 6' ? 'selected' : ''}>Grade 6</option>
          <option value="Grade 5 & 6 (Combined)" ${tc.targetGrade.includes('Combined') ? 'selected' : ''}>Grade 5 & 6 (Combined)</option>
          <option value="Grade 5 / Grade 6 (To Be Confirmed)" ${tc.targetGrade.includes('To Be Confirmed') ? 'selected' : ''}>Grade 5 / Grade 6 (To Be Confirmed)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Class Identifier / Section</label>
        <input type="text" id="tc-identifier" class="form-control" value="${escapeHtml(tc.classIdentifier)}">
      </div>
      <div class="form-group">
        <label>Expected Student Count (Estimate)</label>
        <input type="number" id="tc-expected" class="form-control" min="1" max="100" value="${tc.expectedStudents}">
      </div>
      <div class="form-group">
        <label>Confirmed Student Count</label>
        <input type="number" id="tc-confirmed" class="form-control" min="0" max="100" value="${tc.confirmedStudents}">
      </div>
      <div class="form-group">
        <label>School Approval Status</label>
        <input type="text" id="tc-approval" class="form-control" value="${escapeHtml(tc.approvalStatus)}">
      </div>
      <div class="form-group">
        <label>Needs Assessment Notes</label>
        <textarea id="tc-notes" class="form-control" rows="3">${escapeHtml(tc.needsAssessmentNotes)}</textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Details</button>
      </div>
    </form>
  `;
  openModal("Configure Target Class", html);

  document.getElementById("form-edit-target-class").addEventListener("submit", (e) => {
    e.preventDefault();
    tc.targetGrade = document.getElementById("tc-grade").value;
    tc.classIdentifier = document.getElementById("tc-identifier").value;
    tc.expectedStudents = parseInt(document.getElementById("tc-expected").value) || 0;
    tc.confirmedStudents = parseInt(document.getElementById("tc-confirmed").value) || 0;
    tc.approvalStatus = document.getElementById("tc-approval").value;
    tc.needsAssessmentNotes = document.getElementById("tc-notes").value;
    savePlanData();
    renderAll();
    closeModal();
  });
}

// Edit/Add Mentorship Area Modal
function editAreaModal(areaId) {
  const isEdit = !!areaId;
  const area = isEdit ? planData.mentorshipAreas.find(a => a.id === areaId) : {
    id: "area-" + Date.now(),
    name: "",
    utility: "",
    concepts: "",
    handsOnActivity: "",
    learningOutcome: "",
    linkedPathwayNodeId: "1",
    sessionLead: "",
    requiredMaterials: "",
    status: "Proposed"
  };

  const html = `
    <form id="form-edit-area">
      <div class="form-group">
        <label>Area Name</label>
        <input type="text" id="area-name" class="form-control" required value="${escapeHtml(area.name)}">
      </div>
      <div class="form-group">
        <label>Utility to Students</label>
        <textarea id="area-utility" class="form-control" rows="2" required>${escapeHtml(area.utility)}</textarea>
      </div>
      <div class="form-group">
        <label>Key Concepts</label>
        <input type="text" id="area-concepts" class="form-control" value="${escapeHtml(area.concepts)}">
      </div>
      <div class="form-group">
        <label>Hands-On Activity</label>
        <input type="text" id="area-activity" class="form-control" value="${escapeHtml(area.handsOnActivity)}">
      </div>
      <div class="form-group">
        <label>Intended Learning Outcome</label>
        <input type="text" id="area-outcome" class="form-control" value="${escapeHtml(area.learningOutcome)}">
      </div>
      <div class="form-group">
        <label>Linked Big Minds Pathway Node ID (1-10)</label>
        <input type="number" id="area-node" class="form-control" min="1" max="10" value="${area.linkedPathwayNodeId}">
      </div>
      <div class="form-group">
        <label>Proposed Session Lead</label>
        <input type="text" id="area-lead" class="form-control" value="${escapeHtml(area.sessionLead)}">
      </div>
      <div class="form-group">
        <label>Required Materials</label>
        <input type="text" id="area-materials" class="form-control" value="${escapeHtml(area.requiredMaterials)}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="area-status" class="form-control">
          <option value="Proposed" ${area.status === 'Proposed' ? 'selected' : ''}>Proposed</option>
          <option value="Reviewed" ${area.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
          <option value="Confirmed" ${area.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Area'}</button>
      </div>
    </form>
  `;
  openModal(isEdit ? "Edit Mentorship Area" : "Add Mentorship Area", html);

  document.getElementById("form-edit-area").addEventListener("submit", (e) => {
    e.preventDefault();
    area.name = document.getElementById("area-name").value;
    area.utility = document.getElementById("area-utility").value;
    area.concepts = document.getElementById("area-concepts").value;
    area.handsOnActivity = document.getElementById("area-activity").value;
    area.learningOutcome = document.getElementById("area-outcome").value;
    area.linkedPathwayNodeId = document.getElementById("area-node").value;
    area.sessionLead = document.getElementById("area-lead").value;
    area.requiredMaterials = document.getElementById("area-materials").value;
    area.status = document.getElementById("area-status").value;

    if (!isEdit) {
      planData.mentorshipAreas.push(area);
    }
    savePlanData();
    renderAll();
    closeModal();
  });
}

function deleteArea(areaId) {
  if (confirm("Are you sure you want to delete this mentorship area?")) {
    planData.mentorshipAreas = planData.mentorshipAreas.filter(a => a.id !== areaId);
    savePlanData();
    renderAll();
  }
}

// Edit/Add Visit Modal
function editVisitModal(visitId) {
  const isEdit = !!visitId;
  const visit = isEdit ? planData.visitSchedule.find(v => v.id === visitId) : {
    id: "visit-" + Date.now(),
    visitNumber: planData.visitSchedule.length + 1,
    title: "",
    proposedDate: "",
    startTime: "",
    endTime: "",
    location: "CPA Classroom",
    mainObjective: "",
    activitiesAgenda: "",
    leadFacilitator: "",
    requiredMaterials: "",
    status: "Draft"
  };

  const html = `
    <form id="form-edit-visit">
      <div class="form-group">
        <label>Visit Number</label>
        <input type="number" id="visit-num" class="form-control" value="${visit.visitNumber}">
      </div>
      <div class="form-group">
        <label>Visit Title</label>
        <input type="text" id="visit-title" class="form-control" required value="${escapeHtml(visit.title)}">
      </div>
      <div class="form-group">
        <label>Proposed Date</label>
        <input type="date" id="visit-date" class="form-control" value="${visit.proposedDate}">
      </div>
      <div class="form-group">
        <label>Start & End Time</label>
        <div class="grid-2col">
          <input type="time" id="visit-start" class="form-control" value="${visit.startTime}">
          <input type="time" id="visit-end" class="form-control" value="${visit.endTime}">
        </div>
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" id="visit-loc" class="form-control" value="${escapeHtml(visit.location)}">
      </div>
      <div class="form-group">
        <label>Main Objective</label>
        <input type="text" id="visit-obj" class="form-control" value="${escapeHtml(visit.mainObjective)}">
      </div>
      <div class="form-group">
        <label>Activities / Agenda</label>
        <textarea id="visit-agenda" class="form-control" rows="4">${escapeHtml(visit.activitiesAgenda)}</textarea>
      </div>
      <div class="form-group">
        <label>Lead Facilitator</label>
        <input type="text" id="visit-lead" class="form-control" value="${escapeHtml(visit.leadFacilitator)}">
      </div>
      <div class="form-group">
        <label>Required Materials</label>
        <input type="text" id="visit-mat" class="form-control" value="${escapeHtml(visit.requiredMaterials)}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="visit-status" class="form-control">
          <option value="Draft" ${visit.status === 'Draft' ? 'selected' : ''}>Draft</option>
          <option value="Proposed" ${visit.status === 'Proposed' ? 'selected' : ''}>Proposed</option>
          <option value="Confirmed" ${visit.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Completed" ${visit.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Visit' : 'Add Visit'}</button>
      </div>
    </form>
  `;
  openModal(isEdit ? "Edit Visit Schedule" : "Add New Visit", html);

  document.getElementById("form-edit-visit").addEventListener("submit", (e) => {
    e.preventDefault();
    visit.visitNumber = parseInt(document.getElementById("visit-num").value) || 1;
    visit.title = document.getElementById("visit-title").value;
    visit.proposedDate = document.getElementById("visit-date").value;
    visit.startTime = document.getElementById("visit-start").value;
    visit.endTime = document.getElementById("visit-end").value;
    visit.location = document.getElementById("visit-loc").value;
    visit.mainObjective = document.getElementById("visit-obj").value;
    visit.activitiesAgenda = document.getElementById("visit-agenda").value;
    visit.leadFacilitator = document.getElementById("visit-lead").value;
    visit.requiredMaterials = document.getElementById("visit-mat").value;
    visit.status = document.getElementById("visit-status").value;

    if (!isEdit) {
      planData.visitSchedule.push(visit);
    }
    savePlanData();
    renderAll();
    closeModal();
  });
}

function deleteVisit(visitId) {
  if (confirm("Delete this visit?")) {
    planData.visitSchedule = planData.visitSchedule.filter(v => v.id !== visitId);
    savePlanData();
    renderAll();
  }
}

// Role Assignment Modal
function assignRoleModal(roleId) {
  const role = planData.teamRoles.find(r => r.id === roleId);
  const html = `
    <form id="form-assign-role">
      <div class="form-group">
        <label>Role Title</label>
        <input type="text" class="form-control" value="${escapeHtml(role.title)}" disabled>
      </div>
      <div class="form-group">
        <label>Assigned Team Member Name</label>
        <input type="text" id="role-assignee-name" class="form-control" placeholder="e.g. Ama Mensah" value="${escapeHtml(role.assignedTo)}">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Assignment</button>
      </div>
    </form>
  `;
  openModal("Assign Team Role", html);

  document.getElementById("form-assign-role").addEventListener("submit", (e) => {
    e.preventDefault();
    role.assignedTo = document.getElementById("role-assignee-name").value.trim();
    savePlanData();
    renderAll();
    closeModal();
  });
}

// Edit/Add Workshop Modal
function editWorkshopModal(wsId) {
  const isEdit = !!wsId;
  const ws = isEdit ? planData.workshops.find(w => w.id === wsId) : {
    id: "ws-" + Date.now(),
    areaId: planData.mentorshipAreas[0]?.id || "",
    title: "",
    objective: "",
    introduction: "",
    practicalActivity: "",
    materials: "",
    facilitationApproach: "",
    expectedOutcome: "",
    reflectionQuestion: ""
  };

  const areaOptions = planData.mentorshipAreas.map(a => `<option value="${a.id}" ${ws.areaId === a.id ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join("");

  const html = `
    <form id="form-edit-workshop">
      <div class="form-group">
        <label>Associated Mentorship Area</label>
        <select id="ws-area" class="form-control">${areaOptions}</select>
      </div>
      <div class="form-group">
        <label>Lesson Plan Title</label>
        <input type="text" id="ws-title" class="form-control" required value="${escapeHtml(ws.title)}">
      </div>
      <div class="form-group">
        <label>Learning Objective</label>
        <input type="text" id="ws-obj" class="form-control" value="${escapeHtml(ws.objective)}">
      </div>
      <div class="form-group">
        <label>Introduction / Relatable Example</label>
        <textarea id="ws-intro" class="form-control" rows="2">${escapeHtml(ws.introduction)}</textarea>
      </div>
      <div class="form-group">
        <label>Practical Activity Tasks</label>
        <textarea id="ws-task" class="form-control" rows="2">${escapeHtml(ws.practicalActivity)}</textarea>
      </div>
      <div class="form-group">
        <label>Materials Required</label>
        <input type="text" id="ws-mat" class="form-control" value="${escapeHtml(ws.materials)}">
      </div>
      <div class="form-group">
        <label>Facilitation Approach</label>
        <input type="text" id="ws-approach" class="form-control" value="${escapeHtml(ws.facilitationApproach)}">
      </div>
      <div class="form-group">
        <label>Expected Outcome / Proof of Learning</label>
        <input type="text" id="ws-outcome" class="form-control" value="${escapeHtml(ws.expectedOutcome)}">
      </div>
      <div class="form-group">
        <label>Student Reflection Question</label>
        <input type="text" id="ws-reflect" class="form-control" value="${escapeHtml(ws.reflectionQuestion)}">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Lesson Plan' : 'Add Lesson Plan'}</button>
      </div>
    </form>
  `;
  openModal(isEdit ? "Edit Lesson Plan" : "Add Lesson Plan", html);

  document.getElementById("form-edit-workshop").addEventListener("submit", (e) => {
    e.preventDefault();
    ws.areaId = document.getElementById("ws-area").value;
    ws.title = document.getElementById("ws-title").value;
    ws.objective = document.getElementById("ws-obj").value;
    ws.introduction = document.getElementById("ws-intro").value;
    ws.practicalActivity = document.getElementById("ws-task").value;
    ws.materials = document.getElementById("ws-mat").value;
    ws.facilitationApproach = document.getElementById("ws-approach").value;
    ws.expectedOutcome = document.getElementById("ws-outcome").value;
    ws.reflectionQuestion = document.getElementById("ws-reflect").value;

    if (!isEdit) planData.workshops.push(ws);
    savePlanData();
    renderAll();
    closeModal();
  });
}

function deleteWorkshop(wsId) {
  if (confirm("Delete this lesson plan?")) {
    planData.workshops = planData.workshops.filter(w => w.id !== wsId);
    savePlanData();
    renderAll();
  }
}

// Edit/Add Expense Item Modal
function editExpenseModal(itemId) {
  const isEdit = !!itemId;
  const item = isEdit ? planData.budgetItems.find(b => b.id === itemId) : {
    id: "bg-" + Date.now(),
    description: "",
    category: "Stationery",
    quantity: 1,
    unitCostGHS: 0,
    essential: true,
    source: "",
    status: "Estimated",
    notes: ""
  };

  const html = `
    <form id="form-edit-expense">
      <div class="form-group">
        <label>Item Description</label>
        <input type="text" id="bg-desc" class="form-control" required value="${escapeHtml(item.description)}">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="bg-cat" class="form-control">
          <option value="Transportation" ${item.category === 'Transportation' ? 'selected' : ''}>Transportation</option>
          <option value="Printing" ${item.category === 'Printing' ? 'selected' : ''}>Printing & Photocopying</option>
          <option value="Stationery" ${item.category === 'Stationery' ? 'selected' : ''}>Stationery & Craft</option>
          <option value="Data & Internet" ${item.category === 'Data & Internet' ? 'selected' : ''}>Data & Internet</option>
          <option value="Refreshments" ${item.category === 'Refreshments' ? 'selected' : ''}>Refreshments</option>
          <option value="Equipment" ${item.category === 'Equipment' ? 'selected' : ''}>Equipment / Tech</option>
          <option value="Other" ${item.category === 'Other' ? 'selected' : ''}>Other Expenses</option>
        </select>
      </div>
      <div class="grid-2col">
        <div class="form-group">
          <label>Quantity</label>
          <input type="number" id="bg-qty" class="form-control" min="1" required value="${item.quantity}">
        </div>
        <div class="form-group">
          <label>Unit Cost (GHS)</label>
          <input type="number" id="bg-unit" class="form-control" min="0" step="0.5" required value="${item.unitCostGHS}">
        </div>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="bg-essential" class="form-control">
          <option value="true" ${item.essential ? 'selected' : ''}>Essential Core Need</option>
          <option value="false" ${!item.essential ? 'selected' : ''}>Optional / Nice to Have</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="bg-status" class="form-control">
          <option value="Estimated" ${item.status === 'Estimated' ? 'selected' : ''}>Estimated</option>
          <option value="Confirmed" ${item.status === 'Confirmed' ? 'selected' : ''}>Confirmed Quote</option>
          <option value="Purchased" ${item.status === 'Purchased' ? 'selected' : ''}>Purchased</option>
          <option value="Not Required" ${item.status === 'Not Required' ? 'selected' : ''}>Not Required</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notes / Quote Source</label>
        <input type="text" id="bg-notes" class="form-control" value="${escapeHtml(item.notes)}">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Item' : 'Add Item'}</button>
      </div>
    </form>
  `;
  openModal(isEdit ? "Edit Expense Item" : "Add Expense Item", html);

  document.getElementById("form-edit-expense").addEventListener("submit", (e) => {
    e.preventDefault();
    item.description = document.getElementById("bg-desc").value;
    item.category = document.getElementById("bg-cat").value;
    item.quantity = Math.max(1, parseInt(document.getElementById("bg-qty").value) || 1);
    item.unitCostGHS = Math.max(0, parseFloat(document.getElementById("bg-unit").value) || 0);
    item.essential = document.getElementById("bg-essential").value === "true";
    item.status = document.getElementById("bg-status").value;
    item.notes = document.getElementById("bg-notes").value;

    if (!isEdit) planData.budgetItems.push(item);
    savePlanData();
    renderAll();
    closeModal();
  });
}

function deleteExpense(itemId) {
  if (confirm("Remove expense item?")) {
    planData.budgetItems = planData.budgetItems.filter(b => b.id !== itemId);
    savePlanData();
    renderAll();
  }
}

// Edit Assessment Modal
function editAssessmentModal() {
  const a = planData.assessment;
  const html = `
    <form id="form-edit-assessment">
      <div class="form-group">
        <label>Baseline Participating Students</label>
        <input type="number" id="ass-base" class="form-control" value="${a.baselineStudents}">
      </div>
      <div class="form-group">
        <label>Final Participating Students</label>
        <input type="number" id="ass-final" class="form-control" value="${a.finalStudents}">
      </div>
      <div class="form-group">
        <label>Attendance Rate (%)</label>
        <input type="number" id="ass-att" class="form-control" min="0" max="100" value="${a.attendanceRatePercent}">
      </div>
      <div class="form-group">
        <label>Sessions Delivered</label>
        <input type="number" id="ass-sess" class="form-control" value="${a.sessionsDelivered}">
      </div>
      <div class="form-group">
        <label>Mentors Participated</label>
        <input type="number" id="ass-ment" class="form-control" value="${a.mentorsParticipated}">
      </div>
      <div class="form-group">
        <label>Pre-Skill Awareness (%)</label>
        <input type="number" id="ass-pre" class="form-control" min="0" max="100" value="${a.preSkillAwarenessPercent}">
      </div>
      <div class="form-group">
        <label>Post-Skill Awareness (%)</label>
        <input type="number" id="ass-post" class="form-control" min="0" max="100" value="${a.postSkillAwarenessPercent}">
      </div>
      <div class="form-group">
        <label>Student Satisfaction Summary</label>
        <input type="text" id="ass-sat" class="form-control" value="${escapeHtml(a.studentSatisfactionScore)}">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Indicator Metrics</button>
      </div>
    </form>
  `;
  openModal("Update Assessment Metrics", html);

  document.getElementById("form-edit-assessment").addEventListener("submit", (e) => {
    e.preventDefault();
    a.baselineStudents = parseInt(document.getElementById("ass-base").value) || 0;
    a.finalStudents = parseInt(document.getElementById("ass-final").value) || 0;
    a.attendanceRatePercent = parseInt(document.getElementById("ass-att").value) || 0;
    a.sessionsDelivered = parseInt(document.getElementById("ass-sess").value) || 0;
    a.mentorsParticipated = parseInt(document.getElementById("ass-ment").value) || 0;
    a.preSkillAwarenessPercent = parseInt(document.getElementById("ass-pre").value) || 0;
    a.postSkillAwarenessPercent = parseInt(document.getElementById("ass-post").value) || 0;
    a.studentSatisfactionScore = document.getElementById("ass-sat").value;

    savePlanData();
    renderAll();
    closeModal();
  });
}

function toggleHandoverTask(taskId, isChecked) {
  const task = planData.handoverChecklist.find(t => t.id === taskId);
  if (task) {
    task.completed = isChecked;
    savePlanData();
    renderHandover();
  }
}

function editHandoverModal() {
  const s = planData.sustainability;
  const html = `
    <form id="form-edit-handover">
      <div class="form-group">
        <label>Target Handover Date</label>
        <input type="date" id="sus-date" class="form-control" value="${s.targetHandoverDate}">
      </div>
      <div class="form-group">
        <label>CPA Teacher Liaison</label>
        <input type="text" id="sus-teacher" class="form-control" value="${escapeHtml(s.cpaTeacherLiaison)}">
      </div>
      <div class="form-group">
        <label>Recommendations for School Continuity</label>
        <textarea id="sus-recs" class="form-control" rows="3">${escapeHtml(s.recommendations)}</textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Save Handover Info</button>
      </div>
    </form>
  `;
  openModal("Edit Handover & Sustainability Info", html);

  document.getElementById("form-edit-handover").addEventListener("submit", (e) => {
    e.preventDefault();
    s.targetHandoverDate = document.getElementById("sus-date").value;
    s.cpaTeacherLiaison = document.getElementById("sus-teacher").value;
    s.recommendations = document.getElementById("sus-recs").value;

    savePlanData();
    renderAll();
    closeModal();
  });
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}