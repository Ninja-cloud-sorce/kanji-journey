const admin = require('firebase-admin');

// Note: In real production, use service account json file path in FIREBASE_ADMIN_CREDENTIALS
// For local demo, we use ADC or try simple init.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: 'kairo-630b2'
    });
  } catch (err) {
    console.warn("[Firestore] Init Warning: No credentials found, using default app. If this fails, set GOOGLE_APPLICATION_CREDENTIALS.");
    // Fallback or handle later
  }
}

const db = admin.firestore();

// Quick helpers
const collections = {
  words: db.collection('words'),
  flashcards: db.collection('flashcards'),
  reviewHistory: db.collection('review_history')
};

module.exports = { db, collections, admin };
