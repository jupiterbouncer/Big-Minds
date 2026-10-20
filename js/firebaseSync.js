/**
 * Big Minds — Production Realtime Firebase Sync Engine
 * Diagnostic edition with granular SDK & config validation.
 */

window.FirebaseSync = {
  db: null,
  isInitialized: false,
  isConnected: false,
  pendingRemoteData: null,
  pushDebounceTimer: null,

  init() {
    const config = window.FIREBASE_CONFIG;

    // 1. Check if core Firebase SDK loaded
    if (typeof firebase === "undefined") {
      console.warn("⚠️ Firebase Core SDK not loaded. Operating in LocalStorage mode.");
      this.updateStatusUI("local", "🟠 Local Storage Only");
      return;
    }

    // 2. Check if Realtime Database SDK loaded
    if (typeof firebase.database !== "function") {
      console.error("❌ Firebase Database SDK missing. firebase-database-compat.js failed to load.");
      this.updateStatusUI("error", "🔴 Database SDK Missing");
      return;
    }

    // 3. Validate Configuration
    if (!config || !config.apiKey || !config.databaseURL || config.apiKey.includes("YOUR_API_KEY")) {
      console.warn("⚠️ Firebase Configuration incomplete. Operating in LocalStorage mode.");
      this.updateStatusUI("local", "🟠 Local Storage Only");
      return;
    }

    // Sanitize databaseURL (strip whitespace)
    config.databaseURL = String(config.databaseURL).trim();

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.db = firebase.database();
      this.isInitialized = true;

      // Monitor Realtime Connection State
      this.db.ref(".info/connected").on("value", (snap) => {
        if (snap.val() === true) {
          this.isConnected = true;
          this.updateStatusUI("connected", "🟢 Cloud Synced");
          console.log("🔥 Firebase Realtime Database connected successfully.");
        } else {
          this.isConnected = false;
          this.updateStatusUI("local", "🟠 Disconnected (Local Mode)");
        }
      });

      // Start Realtime Data Listener
      this.listenForRemoteUpdates();

    } catch (err) {
      console.error("💥 Firebase Initialization Error:", err);
      this.updateStatusUI("error", "🔴 Cloud Init Error");
    }
  },

  syncToRemote(data) {
    if (!this.isInitialized || !this.db) return;

    if (this.pushDebounceTimer) clearTimeout(this.pushDebounceTimer);

    this.updateStatusUI("syncing", "🟡 Syncing...");

    this.pushDebounceTimer = setTimeout(() => {
      this.db.ref("service_project_plan").set(data)
        .then(() => {
          if (this.isConnected) {
            this.updateStatusUI("connected", "🟢 Cloud Synced");
          }
        })
        .catch((err) => {
          console.error("❌ Firebase Write Error:", err.message);
          if (err.message && err.message.includes("PERMISSION_DENIED")) {
            this.updateStatusUI("error", "🔴 RTDB Rules Locked");
          } else {
            this.updateStatusUI("error", "🔴 Sync Write Error");
          }
        });
    }, 300);
  },

  listenForRemoteUpdates() {
    if (!this.isInitialized || !this.db) return;

    this.db.ref("service_project_plan").on("value", (snapshot) => {
      const remoteData = snapshot.val();
      if (!remoteData || typeof remoteData !== "object") return;

      const modalOverlay = document.getElementById("planner-modal-overlay");
      const isModalOpen = modalOverlay && !modalOverlay.classList.contains("hidden");

      if (isModalOpen) {
        this.pendingRemoteData = remoteData;
      } else if (typeof window.updatePlanDataFromRemote === "function") {
        window.updatePlanDataFromRemote(remoteData);
        if (this.isConnected) {
          this.updateStatusUI("connected", "🟢 Cloud Synced");
        }
      }
    }, (err) => {
      console.error("❌ Firebase Read Error:", err.message);
      if (err.message && err.message.includes("PERMISSION_DENIED")) {
        this.updateStatusUI("error", "🔴 RTDB Rules Locked");
      } else {
        this.updateStatusUI("error", "🔴 Sync Read Error");
      }
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

document.addEventListener("DOMContentLoaded", () => {
  window.FirebaseSync.init();
});