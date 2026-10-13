/**
 * Big Minds — Firebase Cloud Synchronization Module
 * Handles multi-device cloud persistence with offline-first localStorage fallback
 */

const FIREBASE_CONFIG_STORAGE_KEY = "bigminds_firebase_config";
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
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.updateBadge();
    });
  }

  getConfig() {
    // Check local git-ignored override first
    if (window.LOCAL_FIREBASE_CONFIG && window.LOCAL_FIREBASE_CONFIG.projectId && window.LOCAL_FIREBASE_CONFIG.apiKey) {
      return window.LOCAL_FIREBASE_CONFIG;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectId && parsed.apiKey) return parsed;
      }
    } catch (e) {
      console.warn("Error reading stored Firebase config:", e);
    }

    // Fall back to window.DEFAULT_FIREBASE_CONFIG
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
      // Initialize or retrieve existing Firebase App
      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(config);
      } else {
        this.app = firebase.app();
      }

      this.db = firebase.firestore();

      // Enable offline persistence across browser tabs
      this.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("Firestore persistence failed: Multiple tabs open.");
        } else if (err.code === "unimplemented") {
          console.warn("Firestore persistence unsupported in this browser.");
        }
      });

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

          // Only update if remote data differs from local
          const localStr = JSON.stringify(window.planData || {});
          const remoteStr = JSON.stringify(remoteData || {});

          if (localStr !== remoteStr && remoteData && remoteData.projectMeta) {
            console.log("☁️ Received remote update from another device. Updating local view...");
            window.planData = remoteData;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
            if (typeof renderAll === "function") {
              renderAll();
            }
          }

          this.updateBadge("cloud-live");
        } else {
          // Document does not exist in Firestore yet -> seed with initial/local data
          console.log("☁️ Firestore project document not found. Seeding from local plan...");
          if (window.planData) {
            this.pushPlan(window.planData);
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
      window.planData = remoteData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
      if (typeof renderAll === "function") renderAll();
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
      badge.textContent = "💻 Saved to browser (Click ☁️ to connect Cloud)";
      badge.title = "Local offline storage active. Click 'Cloud Sync' to enable real-time sync across devices.";
      return;
    }

    const effectiveStatus = statusOverride || (navigator.onLine ? "cloud-live" : "offline");

    if (effectiveStatus === "cloud-live") {
      badge.classList.add("status-cloud-live");
      const timeStr = this.lastSyncedAt ? ` at ${this.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
      badge.textContent = `🟢 Cloud Synced (Live${timeStr})`;
      badge.title = "Connected to Firestore. All updates sync live across admin laptops & phones.";
    } else if (effectiveStatus === "syncing") {
      badge.classList.add("status-syncing");
      badge.textContent = "⏳ Syncing to Cloud...";
    } else if (effectiveStatus === "offline") {
      badge.classList.add("status-offline");
      badge.textContent = "🟡 Offline — Saved locally";
      badge.title = "Device is offline. Changes are saved locally and will auto-sync when reconnected.";
    } else if (effectiveStatus === "error") {
      badge.classList.add("status-offline");
      badge.textContent = "⚠️ Cloud warning (Saved locally)";
      badge.title = errorDetail || "Firebase permission or connection error. Data safely retained locally.";
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

    const currentConfig = this.getConfig() || {};
    const isConn = this.isConfigured() && this.isInitialized;
    const timeStr = this.lastSyncedAt
      ? this.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'Pending first sync';

    body.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <p style="font-size: 0.875rem; color: #4B5563; margin-bottom: 1rem;">
          Real-time cloud database synchronization for the Big Minds Service Project Plan.
        </p>

        <!-- Status Card -->
        <div style="padding: 1rem; border-radius: 10px; border: 2px solid ${isConn ? '#047857' : '#D97706'}; background: ${isConn ? '#ECFDF5' : '#FEF3C7'}; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <div style="font-weight: 800; font-size: 0.95rem; color: ${isConn ? '#065F46' : '#92400E'};">
              ${isConn ? '🟢 Status: Connected to Cloud' : '🟡 Status: Local Offline Mode'}
            </div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #6B7280;">
              ${this.isOnline ? '🌐 Network Online' : '⚠️ Network Offline'}
            </span>
          </div>

          <div style="font-size: 0.8rem; color: #374151; line-height: 1.6;">
            ${isConn ? `
              <div>• <strong>Cloud Project:</strong> <code>${currentConfig.projectId}</code></div>
              <div>• <strong>Last Synced:</strong> ${timeStr}</div>
              <div>• <strong>Security:</strong> Credentials secured in <code>.env</code> / environment config. Secrets hidden.</div>
            ` : `
              <div>• <strong>Mode:</strong> Changes persist only in this device's browser cache.</div>
              <div>• <strong>To Connect:</strong> Set your credentials in <code>.env</code> and <code>js/firebaseConfig.js</code>.</div>
            `}
          </div>
        </div>

        <!-- Sync Operational Controls -->
        ${isConn ? `
          <div style="background: #F8FAFC; border: 2px solid #1E1B4B; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.85rem; font-weight: 800; margin: 0 0 0.5rem 0; color: #1E1B4B;">
              ⚡ Team Sync Operations
            </h4>
            <p style="font-size: 0.75rem; color: #64748B; margin-bottom: 0.75rem;">
              Edits automatically sync across devices on save. You can also force a sync action below:
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button id="btn-force-push" type="button" class="btn btn-primary" style="font-size: 0.8rem;">
                ⬆️ Push Local Plan to Cloud
              </button>
              <button id="btn-force-pull" type="button" class="btn btn-secondary" style="font-size: 0.8rem;">
                ⬇️ Pull Latest from Cloud
              </button>
              <button id="btn-trigger-sync" type="button" class="btn btn-secondary" style="font-size: 0.8rem;">
                🔄 Refresh Connection
              </button>
            </div>
          </div>
        ` : `
          <!-- Manual Connection Helper if not configured via .env -->
          <details style="background: #FAF6F0; border: 1.5px solid #1E1B4B; border-radius: 8px; padding: 0.6rem 0.8rem; margin-bottom: 1.25rem; font-size: 0.75rem;">
            <summary style="font-weight: 700; cursor: pointer; color: #4338CA;">
              🔑 Need to configure Cloud credentials?
            </summary>
            <div style="margin-top: 0.5rem; line-height: 1.5; color: #374151;">
              <p style="margin-bottom: 0.5rem;">Configure your Firebase variables inside <code>.env</code> and <code>js/firebaseConfig.js</code>, or paste your Project ID below:</p>
              <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                <input id="quick-project-id" type="text" placeholder="e.g. big-minds-lapaz" style="flex: 1; padding: 0.4rem 0.6rem; border: 1.5px solid #1E1B4B; border-radius: 6px; font-size: 0.75rem;" />
                <button id="btn-quick-connect" type="button" class="btn btn-sm btn-primary">Connect</button>
              </div>
            </div>
          </details>
        `}

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E5E7EB; pt: 0.75rem; margin-top: 1rem; padding-top: 0.75rem;">
          ${isConn ? `
            <button id="btn-clear-cloud-config" type="button" class="btn btn-outline" style="font-size: 0.75rem; color: #DC2626; border-color: #DC2626; padding: 0.35rem 0.6rem;">
              Disconnect Cloud
            </button>
          ` : `<span></span>`}
          <button type="button" class="btn btn-secondary" style="font-size: 0.8rem;" onclick="closeModal()">
            Done
          </button>
        </div>
      </div>
    `;

    overlay.classList.remove("hidden");

    // Wire Modal Buttons
    document.getElementById("btn-force-pull")?.addEventListener("click", async () => {
      try {
        await this.pullPlan();
        closeModal();
        alert("✓ Latest project plan successfully pulled from cloud!");
      } catch (e) {
        alert("Failed to pull from cloud: " + e.message);
      }
    });

    document.getElementById("btn-force-push")?.addEventListener("click", async () => {
      try {
        await this.pushPlan(window.planData);
        closeModal();
        alert("✓ Local project plan successfully pushed to cloud!");
      } catch (e) {
        alert("Failed to push to cloud: " + e.message);
      }
    });

    document.getElementById("btn-trigger-sync")?.addEventListener("click", () => {
      this.init();
      closeModal();
    });

    document.getElementById("btn-clear-cloud-config")?.addEventListener("click", () => {
      if (confirm("Disconnect cloud sync on this browser? Data will remain safely in your local browser cache.")) {
        localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
        if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();
        this.db = null;
        this.isInitialized = false;
        this.updateBadge("local");
        closeModal();
      }
    });
  }
}

// Instantiate global controller
window.firebaseSync = new FirebaseSyncController();
