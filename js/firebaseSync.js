/**
 * Big Minds — Realtime Firebase Sync Handler
 * Safely handles multi-tab/browser synchronization with local fallback.
 */

window.FirebaseSync = {
  db: null,
  isInitialized: false,

  init() {
    try {
      if (typeof firebase !== "undefined" && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        this.db = firebase.database();
        this.isInitialized = true;
        console.log("🔥 Firebase Sync initialized successfully.");
        this.listenForRemoteUpdates();
      } else {
        console.warn("⚠️ Firebase SDK or valid config missing. Operating in LocalStorage mode.");
      }
    } catch (err) {
      console.warn("⚠️ Firebase Sync initialization failed. Defaulting to LocalStorage:", err);
      this.isInitialized = false;
    }
  },

  syncToRemote(data) {
    if (!this.isInitialized || !this.db) return;
    try {
      this.db.ref("service_project_plan").set(data);
    } catch (err) {
      console.error("Error pushing update to Firebase:", err);
    }
  },

  listenForRemoteUpdates() {
    if (!this.isInitialized || !this.db) return;
    
    this.db.ref("service_project_plan").on("value", (snapshot) => {
      const remoteData = snapshot.val();
      if (remoteData && typeof window.updatePlanDataFromRemote === "function") {
        window.updatePlanDataFromRemote(remoteData);
      }
    });
  }
};

// Initialize after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.FirebaseSync.init();
});