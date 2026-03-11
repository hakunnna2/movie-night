import { initializeApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const hasRequiredFirebaseConfig =
  Boolean(firebaseConfig.projectId) && Boolean(firebaseConfig.databaseURL);

let database: Database | null = null;

if (!hasRequiredFirebaseConfig) {
  console.warn(
    '[firebase] Missing VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_DATABASE_URL. Realtime sync is disabled.'
  );
} else {
  try {
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.warn('[firebase] Failed to initialize Firebase. Realtime sync is disabled.', error);
  }
}

export { database };
