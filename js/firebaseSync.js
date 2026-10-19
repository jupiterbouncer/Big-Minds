/**
 * Big Minds — Firebase Cloud Synchronization Module
 * Leadership IV Service Project: Crown Prince Academy
 *
 * Provides transparent, automatic multi-device synchronization.
 * Every edit made on any phone, tablet, or laptop syncs across all devices.
 */

const STORAGE_KEY = "bigminds_service_project_plan_v1";
const PROJECT_DOC_ID = "crown_prince_academy";
const COLLECTION_NAME = "service_projects";

class FirebaseSyncController {
  constructor() {
    this.db = null;
    this.app = null;
    this.unsubscribeSnapshot = null;
    this.isOnline = navigator.onLine;
    this.lastSyncedAt = null;
    this.isSyncing = false;
    this.isInitialized = false;

    // Listen to device network changes
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.updateBadge();
      this.pullPlan().catch(() => {});
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.updateBadge("offline");
    });

    // Auto-refresh when user switches back to browser tab (critical for mobile phones)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.isInitialized) {
        this.pullPlan().catch(() => {});
      }
    });

    window.addEventListener("focus", () => {
      if (this.isInitialized) {
        this.pullPlan().catch(() => {});
      }
    });
  }

  getConfig() {
    // 1. Check local developer override
    if (window.LOCAL_FIREBASE_CONFIG && window.LOCAL_FIREBASE_CONFIG.projectId && window.LOCAL_FIREBASE_CONFIG.apiKey) {
      return window.LOCAL_FIREBASE_CONFIG;
    }

    // 2. Default committed production configuration
    if (window.DEFAULT_FIREBASE_CONFIG && window.DEFAULT_FIREBASE_CONFIG.projectId && window.DEFAULT_FIREBASE_CONFIG.apiKey) {
      return window.DEFAULT_FIREBASE_CONFIG;
    }

    return null;
  }

  isConfigured() {
    const config = this.getConfig();
    return !!(config && config.projectId && config.apiKey && config.projectId.trim() !== "");
  }

  init() {
    const config = this.getConfig();
    if (!config || !this.isConfigured()) {
      this.updateBadge("local");
      return;
    }

    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK not loaded. Operating in local mode.");
      this.updateBadge("local");
      return;
    }

    try {
      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(config);
      } else {
        this.app = firebase.app();
      }

      this.db = firebase.firestore();
      this.isInitialized = true;
      this.subscribeToChanges();
    } catch (err) {
      console.error("Firebase initialization failed:", err);
      this.updateBadge("error", err.message);
    }
  }

  subscribeToChanges() {
    if (!this.db) return;

    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    const docRef = this.db.collection(COLLECTION_NAME).doc(PROJECT_DOC_ID);

    this.unsubscribeSnapshot = docRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          const remoteData = doc.data();
          this.lastSyncedAt = new Date();

          // Get current in-memory plan data
          const currentPlan = typeof window.getPlanData === "function" ? window.getPlanData() : window.planData;
          const localStr = JSON.stringify(currentPlan || {});
          const remoteStr = JSON.stringify(remoteData || {});

          if (localStr !== remoteStr && remoteData && remoteData.projectMeta) {
            console.log("☁️ Real-time cloud sync update received.");
            if (typeof window.setPlanData === "function") {
              window.setPlanData(remoteData);
            } else {
              window.planData = remoteData;
              if (typeof renderAll === "function") renderAll();
            }
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
            } catch (e) {}
          }

          this.updateBadge("cloud-live");
        } else {
          // Document does not exist in Firestore yet -> seed with current plan
          const currentPlan = typeof window.getPlanData === "function" ? window.getPlanData() : window.planData;
          if (currentPlan) {
            this.pushPlan(currentPlan);
          }
        }
      },
      (error) => {
        console.warn("Firestore real-time listener error:", error);
        if (!navigator.onLine) {
          this.updateBadge("offline");
        } else {
          this.updateBadge("error", error.message);
        }
      }
    );
  }

  async pushPlan(data) {
    if (!this.isConfigured() || !this.db) {
      this.updateBadge("local");
      return;
    }

    if (!navigator.onLine) {
      this.updateBadge("offline");
      return;
    }

    this.updateBadge("syncing");

    try {
      const docRef = this.db.collection(COLLECTION_NAME).doc(PROJECT_DOC_ID);
      await docRef.set(data, { merge: true });
      this.lastSyncedAt = new Date();
      this.updateBadge("cloud-live");
    } catch (err) {
      console.error("Cloud push failed:", err);
      if (!navigator.onLine) {
        this.updateBadge("offline");
      } else {
        this.updateBadge("error", err.message);
      }
    }
  }

  async pullPlan() {
    if (!this.isConfigured() || !this.db) {
      throw new Error("Cloud sync is not configured.");
    }

    const docRef = this.db.collection(COLLECTION_NAME).doc(PROJECT_DOC_ID);
    const doc = await docRef.get();
    if (doc.exists) {
      const remoteData = doc.data();
      if (typeof window.setPlanData === "function") {
        window.setPlanData(remoteData);
      } else {
        window.planData = remoteData;
        if (typeof renderAll === "function") renderAll();
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
      } catch (e) {}
      this.lastSyncedAt = new Date();
      this.updateBadge("cloud-live");
      return remoteData;
    } else {
      throw new Error("No remote project document found in cloud database.");
    }
  }

  updateBadge(statusOverride, errorDetail) {
    const badge = document.getElementById("save-indicator");
    if (!badge) return;

    badge.className = "save-status-badge";

    if (!this.isConfigured()) {
      badge.classList.add("status-local");
      badge.textContent = "💻 Saved locally";
      badge.title = "Local storage active.";
      return;
    }

    const effectiveStatus = statusOverride || (navigator.onLine ? "cloud-live" : "offline");

    if (effectiveStatus === "cloud-live") {
      badge.classList.add("status-cloud-live");
      const timeStr = this.lastSyncedAt
        ? ` at ${this.lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "";
      badge.textContent = `🟢 Cloud Synced${timeStr}`;
      badge.title = "Connected to Cloud. Edits sync live across all phones and laptops.";
    } else if (effectiveStatus === "syncing") {
      badge.classList.add("status-syncing");
      badge.textContent = "⏳ Syncing...";
      badge.title = "Uploading changes to cloud...";
    } else if (effectiveStatus === "offline") {
      badge.classList.add("status-offline");
      badge.textContent = "🟡 Offline — Saved locally";
      badge.title = "Device is offline. Changes saved locally and will auto-sync when online.";
    } else if (effectiveStatus === "error") {
      badge.classList.add("status-offline");
      badge.textContent = "⚠️ Cloud warning (Saved locally)";
      badge.title = errorDetail || "Firebase connection warning. Data is safely saved locally.";
    } else {
      badge.classList.add("status-local");
      badge.textContent = "✓ Saved to browser";
    }
  }

  openSettingsModal() {
    const overlay = document.getElementById("planner-modal-overlay");
    const title = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");

    if (!overlay || !title || !body) return;

    title.textContent = "☁️ Multi-Device Cloud Sync";

    const isConn = this.isConfigured() && this.isInitialized;
    const timeStr = this.lastSyncedAt
      ? this.lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "Pending first sync";

    body.innerHTML = `
      <div style="margin-bottom: 0.5rem;">
        <!-- Status Card -->
        <div style="padding: 1.15rem; border-radius: 12px; border: 2.5px solid ${isConn ? "#047857" : "#D97706"}; background: ${isConn ? "#ECFDF5" : "#FEF3C7"}; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
            <div style="font-weight: 800; font-size: 1rem; color: ${isConn ? "#065F46" : "#92400E"};">
              ${isConn ? "🟢 Cloud Sync: Active" : "🟡 Cloud Sync: Offline / Connecting"}
            </div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #4B5563;">
              ${this.isOnline ? "🌐 Online" : "⚠️ Offline"}
            </span>
          </div>

          <p style="font-size: 0.825rem; color: #374151; margin: 0.35rem 0 0.5rem 0; line-height: 1.5;">
            ${isConn
              ? "All changes made on any phone, tablet, or laptop automatically sync in real-time."
              : "Changes are safely saved in this device's browser and will sync once reconnected."}
          </p>

          <div style="font-size: 0.775rem; color: #4B5563;">
            <strong>Last synced:</strong> ${timeStr}
          </div>
        </div>

        <!-- Sync Actions -->
        <div style="background: #F8FAFC; border: 2px solid #1E1B4B; border-radius: 12px; padding: 1.15rem; margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.875rem; font-weight: 800; margin: 0 0 0.4rem 0; color: #1E1B4B;">
            ⚡ Sync Actions
          </h4>
          <p style="font-size: 0.775rem; color: #64748B; margin-bottom: 0.85rem;">
            Edits sync automatically whenever you save. If you just made changes on another device, you can force a refresh below:
          </p>
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button id="btn-force-pull" type="button" class="btn btn-primary" style="font-size: 0.825rem; padding: 0.5rem 0.85rem;">
              🔄 Sync Now (Pull Latest)
            </button>
            <button id="btn-force-push" type="button" class="btn btn-secondary" style="font-size: 0.825rem; padding: 0.5rem 0.85rem;">
              ⬆️ Upload Local Plan to Cloud
            </button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: flex-end; border-top: 1px solid #E5E7EB; padding-top: 0.85rem;">
          <button type="button" class="btn btn-secondary" style="font-size: 0.825rem;" onclick="closeModal()">
            Done
          </button>
        </div>
      </div>
    `;

    overlay.classList.remove("hidden");

    // Wire buttons
    document.getElementById("btn-force-pull")?.addEventListener("click", async () => {
      const btn = document.getElementById("btn-force-pull");
      if (btn) btn.textContent = "⏳ Syncing...";
      try {
        await this.pullPlan();
        if (typeof closeModal === "function") closeModal();
      } catch (e) {
        alert("Sync error: " + e.message);
        if (btn) btn.textContent = "🔄 Sync Now (Pull Latest)";
      }
    });

    document.getElementById("btn-force-push")?.addEventListener("click", async () => {
      const btn = document.getElementById("btn-force-push");
      if (btn) btn.textContent = "⏳ Uploading...";
      try {
        const currentPlan = typeof window.getPlanData === "function" ? window.getPlanData() : window.planData;
        await this.pushPlan(currentPlan);
        if (typeof closeModal === "function") closeModal();
      } catch (e) {
        alert("Upload error: " + e.message);
        if (btn) btn.textContent = "⬆️ Upload Local Plan to Cloud";
      }
    });
  }
}

// Instantiate global controller
window.firebaseSync = new FirebaseSyncController();
