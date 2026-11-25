/**
 * Big Minds 2.0 — Production Realtime Firebase Sync Engine
 * Handles Realtime Database bi-directional sync, anonymous auth,
 * participant identity, quiz submissions, pre/post surveys, and planner state.
 *
 * Designed to work with live Firebase RTDB rules under service_project_plan
 * with multi-participant isolation and non-destructive merges.
 */

(function (window) {
  'use strict';

  // Base path permitted by live RTDB security rules
  const PARTICIPANTS_PATH = 'service_project_plan/participants';

  window.FirebaseSync = {
    db: null,
    auth: null,
    currentUser: null,
    isInitialized: false,
    isConnected: false,
    pendingRemoteData: null,
    pushDebounceTimer: null,

    init() {
      const config = window.FIREBASE_CONFIG;

      // 1. Check if core Firebase SDK loaded
      if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase Core SDK not loaded. Operating in LocalStorage mode.');
        this.updateStatusUI('local', '🟠 Local Storage Only');
        return;
      }

      // 2. Check if Realtime Database SDK loaded
      if (typeof firebase.database !== 'function') {
        console.error('❌ Firebase Database SDK missing. firebase-database-compat.js failed to load.');
        this.updateStatusUI('error', '🔴 Database SDK Missing');
        return;
      }

      // 3. Validate Configuration
      if (!config || !config.apiKey || !config.databaseURL || config.apiKey.includes('YOUR_API_KEY')) {
        console.warn('⚠️ Firebase Configuration incomplete. Operating in LocalStorage mode.');
        this.updateStatusUI('local', '🟠 Local Storage Only');
        return;
      }

      // Sanitize databaseURL
      config.databaseURL = String(config.databaseURL).trim();

      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        this.db = firebase.database();

        // Optional Anonymous Authentication (if enabled on Firebase project)
        if (typeof firebase.auth === 'function') {
          try {
            this.auth = firebase.auth();
            this.auth.signInAnonymously().then((userCredential) => {
              this.currentUser = userCredential.user;
              console.log('🔒 Firebase Anonymous Session active:', this.currentUser.uid);
            }).catch((authErr) => {
              console.log('ℹ️ Operating in direct RTDB connection mode:', authErr.message);
            });
          } catch (e) {
            console.log('ℹ️ Auth initialization deferred');
          }
        }

        this.isInitialized = true;

        // Monitor Realtime Connection State
        this.db.ref('.info/connected').on('value', (snap) => {
          if (snap.val() === true) {
            this.isConnected = true;
            this.updateStatusUI('connected', '🟢 Cloud Synced');
            console.log('🔥 Firebase Realtime Database connected.');
          } else {
            this.isConnected = false;
            this.updateStatusUI('local', '🟠 Disconnected (Local Mode)');
          }
        });

        // Start Realtime Data Listener for planner
        this.listenForRemotePlannerUpdates();

      } catch (err) {
        console.error('💥 Firebase Initialization Error:', err);
        this.updateStatusUI('error', '🔴 Cloud Init Error');
      }
    },

    /* ==========================================================================
       PARTICIPANT RECORD PERSISTENCE
       ========================================================================== */

    /**
     * Creates or updates a participant document in Firebase RTDB
     */
    saveParticipant(participantData) {
      if (!participantData || !participantData.participantId) return Promise.reject(new Error('Missing participantId'));

      const id = participantData.participantId;
      const cleanData = {
        participantId: id,
        displayName: participantData.displayName || participantData.studentName || 'Explorer',
        selectedCurrency: participantData.selectedCurrency || 'NGN',
        createdAt: participantData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sessionStatus: participantData.sessionStatus || 'active'
      };

      if (this.currentUser && this.currentUser.uid) {
        cleanData.authUid = this.currentUser.uid;
      }

      if (!this.isInitialized || !this.db) {
        return Promise.resolve(cleanData);
      }

      return this.db.ref(`${PARTICIPANTS_PATH}/${id}`).update(cleanData)
        .then(() => {
          this.updateStatusUI('connected', '🟢 Cloud Synced');
          return cleanData;
        })
        .catch((err) => {
          console.error('❌ Failed to save participant to Firebase:', err.message);
          this.updateStatusUI('error', '🔴 Sync Error');
          throw err;
        });
    },

    /**
     * Persists quiz responses, scores, top interest areas, and timestamp
     */
    saveQuizSubmission(participantId, quizData) {
      if (!participantId || !quizData) return Promise.reject(new Error('Missing parameters'));

      const payload = {
        answers: quizData.answers || {},
        scores: quizData.scores || {},
        preferredAreas: quizData.preferredAreas || [],
        completedAt: new Date().toISOString(),
        quizVersion: quizData.quizVersion || '2.0'
      };

      if (!this.isInitialized || !this.db) {
        return Promise.resolve(payload);
      }

      return this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/quiz`).set(payload)
        .then(() => {
          this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/updatedAt`).set(new Date().toISOString());
          this.updateStatusUI('connected', '🟢 Cloud Synced');
          return payload;
        })
        .catch((err) => {
          console.error('❌ Failed to save quiz to Firebase:', err.message);
          throw err;
        });
    },

    /**
     * Persists pre-programme or post-programme survey
     */
    saveSurveySubmission(participantId, surveyType, surveyData) {
      if (!participantId || !surveyType || !surveyData) return Promise.reject(new Error('Missing parameters'));

      const typeKey = surveyType === 'post' ? 'postSurvey' : 'preSurvey';
      const payload = {
        type: surveyType,
        answers: surveyData.answers || {},
        score: surveyData.score || 0,
        qualitative: surveyData.qualitative || '',
        completedAt: new Date().toISOString(),
        surveyVersion: surveyData.surveyVersion || '2.0',
        interests: surveyData.interests || []
      };

      if (!this.isInitialized || !this.db) {
        return Promise.resolve(payload);
      }

      return this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/${typeKey}`).set(payload)
        .then(() => {
          this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/updatedAt`).set(new Date().toISOString());
          this.updateStatusUI('connected', '🟢 Cloud Synced');
          return payload;
        })
        .catch((err) => {
          console.error('❌ Failed to save survey to Firebase:', err.message);
          throw err;
        });
    },

    /**
     * Saves pathway exploration progress (explored nodes, completed activities)
     */
    savePathwayProgress(participantId, progressData) {
      if (!participantId || !progressData) return Promise.reject(new Error('Missing parameters'));

      const payload = {
        exploredNodes: progressData.exploredNodes || [],
        completedActivities: progressData.completedActivities || [],
        unlockedBadges: progressData.unlockedBadges || [],
        lastActivityAt: new Date().toISOString()
      };

      if (!this.isInitialized || !this.db) {
        return Promise.resolve(payload);
      }

      return this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/pathwayProgress`).set(payload)
        .then(() => {
          this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/updatedAt`).set(new Date().toISOString());
          return payload;
        })
        .catch((err) => {
          console.error('❌ Failed to save pathway progress:', err.message);
        });
    },

    /**
     * Saves six-stage mentorship module progress & reflections safely
     */
    saveModuleProgress(participantId, moduleProgress) {
      if (!participantId || !moduleProgress) return Promise.resolve({});

      const sanitized = {};
      Object.entries(moduleProgress).forEach(([slug, state]) => {
        if (!state || typeof state !== 'object') return;
        sanitized[slug] = {
          completedStages: Array.isArray(state.completedStages) ? state.completedStages : [],
          practiceCompleted: Boolean(state.practiceCompleted),
          practiceNote: String(state.practiceNote || '').slice(0, 1000),
          reflectionNote: String(state.reflectionNote || '').slice(0, 1000),
          confidenceRating: state.confidenceRating || null,
          lastStage: state.lastStage || 'discover',
          updatedAt: new Date().toISOString()
        };
      });

      if (!this.isInitialized || !this.db) {
        return Promise.resolve(sanitized);
      }

      return this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/moduleProgress`).set(sanitized)
        .then(() => {
          this.db.ref(`${PARTICIPANTS_PATH}/${participantId}/updatedAt`).set(new Date().toISOString());
          return sanitized;
        })
        .catch((err) => {
          console.error('❌ Failed to save module progress:', err.message);
        });
    },

    /**
     * Updates currency preference
     */
    saveCurrencyPreference(participantId, currencyCode) {
      if (!participantId || !currencyCode) return Promise.resolve();
      if (!this.isInitialized || !this.db) return Promise.resolve();

      return this.db.ref(`${PARTICIPANTS_PATH}/${participantId}`).update({
        selectedCurrency: currencyCode,
        updatedAt: new Date().toISOString()
      }).catch((err) => {
        console.warn('Could not update participant currency:', err.message);
      });
    },

    /**
     * Administrator: Fetch all participants once or subscribe
     */
    subscribeToParticipants(callback) {
      if (!this.isInitialized || !this.db) {
        if (typeof callback === 'function') callback({});
        return () => {};
      }

      const ref = this.db.ref(PARTICIPANTS_PATH);
      const listener = (snapshot) => {
        const val = snapshot.val() || {};
        if (typeof callback === 'function') callback(val);
      };

      ref.on('value', listener, (err) => {
        console.error('❌ Error reading participants:', err);
      });

      return () => ref.off('value', listener);
    },

    fetchParticipantsOnce() {
      if (!this.isInitialized || !this.db) return Promise.resolve({});
      return this.db.ref(PARTICIPANTS_PATH).once('value').then(snap => snap.val() || {});
    },

    /* ==========================================================================
       PLANNER ENGINE (SERVICE PROJECT PLAN)
       ========================================================================== */

    syncToRemote(data) {
      if (!this.isInitialized || !this.db) return;

      if (this.pushDebounceTimer) clearTimeout(this.pushDebounceTimer);

      this.updateStatusUI('syncing', '🟡 Syncing...');

      // Prepare clean data omitting participants to prevent overwriting student records
      const cleanData = { ...data };
      delete cleanData.participants;

      this.pushDebounceTimer = setTimeout(() => {
        this.db.ref('service_project_plan').update(cleanData)
          .then(() => {
            if (this.isConnected) {
              this.updateStatusUI('connected', '🟢 Cloud Synced');
            }
          })
          .catch((err) => {
            console.error('❌ Firebase Write Error:', err.message);
            if (err.message && err.message.includes('PERMISSION_DENIED')) {
              this.updateStatusUI('error', '🔴 RTDB Rules Locked');
            } else {
              this.updateStatusUI('error', '🔴 Sync Write Error');
            }
          });
      }, 300);
    },

    listenForRemotePlannerUpdates() {
      if (!this.isInitialized || !this.db) return;

      this.db.ref('service_project_plan').on('value', (snapshot) => {
        const remoteData = snapshot.val();
        if (this.isConnected) this.updateStatusUI('connected', '🟢 Cloud Synced');
        if (!remoteData || typeof remoteData !== 'object') return;

        // Strip participants sub-tree before handing to planner
        const plannerData = { ...remoteData };
        delete plannerData.participants;

        const modalOverlay = document.getElementById('planner-modal-overlay');
        const isModalOpen = modalOverlay && !modalOverlay.classList.contains('hidden');

        if (isModalOpen) {
          this.pendingRemoteData = plannerData;
        } else if (typeof window.updatePlanDataFromRemote === 'function') {
          window.updatePlanDataFromRemote(plannerData);
        }
      }, (err) => {
        console.error('❌ Firebase Read Error:', err.message);
        if (err.message && err.message.includes('PERMISSION_DENIED')) {
          this.updateStatusUI('error', '🔴 RTDB Rules Locked');
        } else {
          this.updateStatusUI('error', '🔴 Sync Read Error');
        }
      });
    },

    applyPendingUpdate() {
      if (this.pendingRemoteData && typeof window.updatePlanDataFromRemote === 'function') {
        window.updatePlanDataFromRemote(this.pendingRemoteData);
        this.pendingRemoteData = null;
        if (this.isConnected) {
          this.updateStatusUI('connected', '🟢 Cloud Synced');
        }
      }
    },

    updateStatusUI(state, text) {
      const badge = document.getElementById('save-indicator');
      if (badge) {
        badge.className = 'save-status-badge';
        badge.classList.add(`sync-${state}`);
        badge.textContent = text;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.FirebaseSync.init();
  });
})(window);
