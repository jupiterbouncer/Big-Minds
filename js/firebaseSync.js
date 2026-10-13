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
    // Check localStorage first
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

    title.textContent = "☁️ Multi-Device Cloud Sync Settings";

    const currentConfig = this.getConfig() || {};
    const isConn = this.isConfigured() && this.isInitialized;
    const configString = isConn ? JSON.stringify(currentConfig, null, 2) : "";

    body.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <p style="font-size: 0.875rem; color: #4B5563; margin-bottom: 0.75rem;">
          Connect Big Minds to <strong>Google Firebase Firestore</strong> to view and edit the Service Project Plan in real-time across multiple laptops and mobile devices.
        </p>

        <!-- Current Status Banner -->
        <div style="padding: 0.85rem 1rem; border-radius: 8px; border: 2px solid ${isConn ? '#047857' : '#D97706'}; background: ${isConn ? '#ECFDF5' : '#FEF3C7'}; margin-bottom: 1rem;">
          <div style="font-weight: 800; font-size: 0.85rem; color: ${isConn ? '#065F46' : '#92400E'};">
            ${isConn ? '🟢 Status: Connected to Cloud' : '🟡 Status: Running in Local Browser Mode'}
          </div>
          <div style="font-size: 0.75rem; color: #4B5563; margin-top: 0.25rem;">
            ${isConn ? `Project ID: <code>${currentConfig.projectId}</code> • Real-time synchronization active.` : 'Changes currently persist only in this device\'s browser local storage.'}
          </div>
        </div>

        <!-- Configuration Form -->
        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="font-weight: 700; font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">
            Firebase Web App Configuration (Paste JSON or fill below):
          </label>
          <textarea id="fb-config-json" rows="6" placeholder='Paste your firebaseConfig object here, e.g.:
{
  "apiKey": "AIzaSy...",
  "projectId": "big-minds-lapaz",
  "authDomain": "...",
  "storageBucket": "...",
  "appId": "..."
}' style="width: 100%; font-family: monospace; font-size: 0.75rem; padding: 0.6rem; border: 2px solid #1E1B4B; border-radius: 8px;">${configString}</textarea>
        </div>

        <!-- Quick Help & Setup Instructions -->
        <details style="background: #FAF6F0; border: 1.5px solid #1E1B4B; border-radius: 8px; padding: 0.6rem 0.8rem; margin-bottom: 1.25rem; font-size: 0.75rem;">
          <summary style="font-weight: 700; cursor: pointer; color: #4338CA;">
            ❓ How to get a free Firebase Config (3 quick steps)
          </summary>
          <ol style="margin-top: 0.5rem; padding-left: 1.25rem; line-height: 1.5; color: #374151;">
            <li>Go to <a href="https://console.firebase.google.com" target="_blank" style="color: #4338CA; font-weight: 700;">console.firebase.google.com</a> and click <strong>Add project</strong> (e.g. <code>big-minds-project</code>).</li>
            <li>In the left sidebar, click <strong>Build > Firestore Database</strong>, choose <strong>Create database</strong>, and start in <strong>Test mode</strong>.</li>
            <li>In <strong>Project Settings (gear icon) > General</strong>, scroll to <em>Your apps</em>, add a <strong>Web App (&lt;/&gt;)</strong>, and copy the <code>firebaseConfig</code> object into the box above.</li>
          </ol>
        </details>

        <!-- Actions -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
          ${isConn ? `
            <button id="btn-force-pull" type="button" class="btn btn-secondary" style="font-size: 0.8rem;">
              ⬇️ Force Pull from Cloud
            </button>
            <button id="btn-force-push" type="button" class="btn btn-secondary" style="font-size: 0.8rem;">
              ⬆️ Force Push to Cloud
            </button>
            <button id="btn-clear-cloud-config" type="button" class="btn btn-outline" style="font-size: 0.8rem; color: #EF4444; border-color: #EF4444;">
              Disconnect Cloud
            </button>
          ` : ''}
          <button id="btn-save-cloud-config" type="button" class="btn btn-primary" style="font-size: 0.8rem;">
            💾 Connect & Sync Now
          </button>
        </div>
      </div>
    `;

    overlay.classList.remove("hidden");

    // Wire Modal Buttons
    document.getElementById("btn-save-cloud-config")?.addEventListener("click", () => {
      const txt = document.getElementById("fb-config-json").value.trim();
      if (!txt) {
        alert("Please paste your Firebase configuration JSON.");
        return;
      }

      try {
        let parsed = null;
        // Strip `const firebaseConfig = ` if user pasted raw JS code
        const sanitized = txt.replace(/^(const|var|let)\s+firebaseConfig\s*=\s*/, "").replace(/;$/, "");
        parsed = JSON.parse(sanitized);

        if (!parsed.projectId || !parsed.apiKey) {
          alert("Invalid config: Must contain at least 'projectId' and 'apiKey'.");
          return;
        }

        localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(parsed));
        this.init();

        // Push current local planData to initialize cloud
        if (window.planData) {
          this.pushPlan(window.planData);
        }

        closeModal();
        alert("🎉 Firebase Cloud Sync connected successfully! All changes will now persist in real-time across devices.");
      } catch (err) {
        alert("Could not parse JSON. Please check formatting:\n" + err.message);
      }
    });

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

    document.getElementById("btn-clear-cloud-config")?.addEventListener("click", () => {
      if (confirm("Disconnect cloud sync on this browser? Data will stay saved locally in this browser.")) {
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
