/**
 * Big Minds — Realtime Firebase Sync Handler
 * Supports cross-browser/device sync with live connection monitoring.
 */

window.FirebaseSync = {
  db: null,
  isInitialized: false,
  isConnected: false,
  pendingRemoteData: null,

  init() {
    // Check for Firebase SDK and required databaseURL config
    if (
      typeof firebase === "undefined" ||
      !window.FIREBASE_CONFIG ||
      !window.FIREBASE_CONFIG.apiKey ||
      !window.FIREBASE_CONFIG.databaseURL ||
      window.FIREBASE_CONFIG.databaseURL.includes("YOUR_PROJECT_ID")
    ) {
      console.warn("⚠️ Firebase Realtime Database URL missing or default config detected. Running in LocalStorage mode.");
      this.updateStatusUI("local", "🟠 Local Storage Only");
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      this.db = firebase.database();
      this.isInitialized = true;

      // 1. Live Connection Monitor
      this.db.ref(".info/connected").on("value", (snap) => {
        if (snap.val() === true) {
          this.isConnected = true;
          this.updateStatusUI("connected", "🟢 Cloud Synced");
          console.log("🔥 Connected to Firebase Realtime Database.");
        } else {
          this.isConnected = false;
          this.updateStatusUI("local", "🟠 Disconnected (Local Mode)");
        }
      });

      // 2. Attach Listener for Remote Data
      this.listenForRemoteUpdates();

    } catch (err) {
      console.error("Firebase Sync Initialization Failed:", err);
      this.updateStatusUI("error", "🔴 Cloud Sync Error");
    }
  },

  syncToRemote(data) {
    if (!this.isInitialized || !this.db) return;

    this.updateStatusUI("syncing", "🟡 Syncing...");

    this.db.ref("service_project_plan").set(data)
      .then(() => {
        if (this.isConnected) {
          this.updateStatusUI("connected", "🟢 Cloud Synced");
        }
      })
      .catch((err) => {
        console.error("Firebase Remote Write Denied/Failed:", err);
        this.updateStatusUI("error", "🔴 Permission / Sync Error");
      });
  },

  listenForRemoteUpdates() {
    if (!this.isInitialized || !this.db) return;

    this.db.ref("service_project_plan").on("value", (snapshot) => {
      const remoteData = snapshot.val();
      if (!remoteData || typeof remoteData !== "object") return;

      // Prevent overwriting if user is actively typing inside an open modal
      const modalOverlay = document.getElementById("planner-modal-overlay");
      const isModalOpen = modalOverlay && !modalOverlay.classList.contains("hidden");

      if (isModalOpen) {
        // Queue data update until modal is closed
        this.pendingRemoteData = remoteData;
      } else if (typeof window.updatePlanDataFromRemote === "function") {
        window.updatePlanDataFromRemote(remoteData);
        if (this.isConnected) {
          this.updateStatusUI("connected", "🟢 Cloud Synced");
        }
      }
    }, (err) => {
      console.error("Firebase Remote Listener Error:", err);
      this.updateStatusUI("error", "🔴 Sync Read Error");
    });
  },

  applyPendingUpdate() {
    if (this.pendingRemoteData && typeof window.updatePlanDataFromRemote === "function") {
      window.updatePlanDataFromRemote(this.pendingRemoteData);
      this.pendingRemoteData = null;
      if (this.isConnected) {
        this.updateStatusUI("connected", "🟢 Cloud Synced");
      }
    }
  },

  updateStatusUI(state, text) {
    const badge = document.getElementById("save-indicator");
    if (!badge) return;

    badge.className = "save-status-badge";
    badge.classList.add(`sync-${state}`);
    badge.textContent = text;
  }
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  window.FirebaseSync.init();
});